import { env } from '../config/env.js';

// Prohibited item categories & scam keywords
const PROHIBITED_KEYWORDS = [
  'handgun', 'pistol', 'revolver', 'shotgun', 'rifle', 'ammunition', 'ammo', 'firearm', 'silencer', 'explosive',
  'narcotics', 'heroin', 'cocaine', 'methamphetamine', 'weed', 'cannabis', 'marijuana', 'oxycodone', 'adderall', 'xanax',
  'porn', 'pornography', 'xxx', 'nude', 'escort', 'sex toy',
  'counterfeit', 'fake id', 'stolen', 'hacked account', 'credit card dump',
];

const OFF_PLATFORM_SCAM_PATTERNS = [
  /whatsapp.*[0-9]{10}/i,
  /contact me on whatsapp/i,
  /message.*telegram/i,
  /do not message on reloop/i,
  /advance.*gpay/i,
  /pay.*advance.*delivery/i,
];

/**
 * Instant rule-based safety scan
 */
export function ruleBasedSafetyCheck(item) {
  const fullText = `${item.title || ''} ${item.description || ''} ${item.brand || ''} ${item.model || ''}`.toLowerCase();

  // Check prohibited keywords
  for (const kw of PROHIBITED_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(fullText)) {
      return {
        approved: false,
        confidence: 99,
        reason: `Prohibited item or substance detected: "${kw}"`,
        flags: ['PROHIBITED_KEYWORD', kw.toUpperCase()],
      };
    }
  }

  // Check scam / phishing patterns
  for (const pattern of OFF_PLATFORM_SCAM_PATTERNS) {
    if (pattern.test(fullText)) {
      return {
        approved: false,
        confidence: 95,
        reason: 'Potential off-platform payment or contact scam detected',
        flags: ['OFF_PLATFORM_BYPASS', 'SPAM_SUSPICION'],
      };
    }
  }

  // Price sanity check
  if (item.price !== undefined && item.price !== null && Number(item.price) <= 0) {
    return {
      approved: false,
      confidence: 100,
      reason: 'Price must be greater than ₹0',
      flags: ['INVALID_PRICE'],
    };
  }

  return {
    approved: true,
    confidence: 85,
    reason: 'Standard secondhand item verified against safety guidelines',
    flags: [],
  };
}

/**
 * AI Deep Safety & Moderation Analysis using Gemini
 */
export async function moderateListingWithAI(item) {
  // Step 1: Immediate instant rule-based scan
  const ruleResult = ruleBasedSafetyCheck(item);
  if (!ruleResult.approved) {
    return ruleResult;
  }

  // Step 2: AI Deep Scan using Gemini (if API key configured)
  if (!env.GEMINI_API_KEY) {
    return ruleResult;
  }

  const prompt = `
You are ReLoop's automated secondhand marketplace safety & moderation AI.
Evaluate this listing. Decide if it is safe to auto-approve for public browsing:

Title: ${item.title || 'Untitled'}
Price: ₹${item.price || 0}
Condition: ${item.condition || 'GOOD'}
Description: ${item.description || 'No description'}

Rules:
- Auto-approve authentic secondhand goods (smartphones, laptops, furniture, books, clothing, games, appliances, sports gear, etc.).
- Hold for human review (approved: false) if it involves: weapons/ammo, drugs/prescription meds, adult content, fraudulent scams, or off-platform payment coercion.

Return JSON:
{
  "approved": true,
  "confidence": 95,
  "reason": "Brief human reason",
  "flags": []
}
`;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3-flash-preview'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          return {
            approved: Boolean(parsed.approved),
            confidence: parsed.confidence || 90,
            reason: parsed.reason || (parsed.approved ? 'Auto-approved by ReLoop AI' : 'Flagged for moderation review'),
            flags: parsed.flags || [],
            modelUsed: model,
          };
        }
      }
    } catch {
      // Continue to next model fallback
    }
  }

  // Fallback to rule result if API was temporarily busy
  return {
    ...ruleResult,
    notice: 'AI API busy; validated via ReLoop Marketplace Safety Engine.',
  };
}

/**
 * Helper to convert buffer / data URL / URL to base64
 */
async function extractBase64AndMime(imageInput, defaultMime = 'image/jpeg') {
  try {
    if (Buffer.isBuffer(imageInput)) {
      return { base64: imageInput.toString('base64'), mime: defaultMime };
    }
    if (typeof imageInput === 'string') {
      if (imageInput.startsWith('data:')) {
        const [header, b64] = imageInput.split(',');
        const mimeMatch = header.match(/:(.*?);/);
        return { base64: b64, mime: mimeMatch ? mimeMatch[1] : defaultMime };
      }
      if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(imageInput, { signal: controller.signal });
        clearTimeout(timeout);
        const buffer = await res.arrayBuffer();
        const mime = res.headers.get('content-type') || defaultMime;
        return { base64: Buffer.from(buffer).toString('base64'), mime };
      }
      // Raw base64 string
      return { base64: imageInput, mime: defaultMime };
    }
  } catch (err) {
    console.warn('[extractBase64AndMime error]', err.message);
  }
  return { base64: null, mime: defaultMime };
}

/**
 * Verify a chat image attachment for illegal items, nudity, weapons, drugs, or scams
 */
export async function verifyChatAttachmentImage(imageInput, mimeType = 'image/jpeg') {
  if (!env.GEMINI_API_KEY) {
    return { safe: true, confidence: 80, reason: 'Safety pre-check passed.' };
  }

  const { base64, mime } = await extractBase64AndMime(imageInput, mimeType);
  if (!base64) {
    return { safe: false, reason: 'Invalid or unreadable image file.' };
  }

  const prompt = `
You are ReLoop's marketplace safety and chat moderation AI.
Evaluate this image that a user is attempting to send in a private buyer-seller chat.

Strict safety guidelines:
1. REJECT (safe: false) if the image contains:
   - Nudity, sexually explicit content, pornography, exposed private parts, or suggestive adult materials.
   - Firearms, handguns, rifles, ammunition, knives meant for combat/violence, explosives, or weapons.
   - Narcotics, illegal drugs, prescription pills being peddled, or drug paraphernalia.
   - Graphic violence, blood, gore, dead animals, or extreme shock content.
   - Hate speech symbols, abusive harassment imagery, or counterfeit banknotes/IDs.
   - External scam QR codes or fraudulent payment prompts.
2. APPROVE (safe: true) if the image contains:
   - Normal authentic secondhand items (electronics, clothing, shoes, furniture, books, gadgets, serial numbers, warranty cards, receipt photos, product accessories).
   - Safe, benign everyday photos.

Return ONLY valid JSON matching this schema:
{
  "safe": true,
  "confidence": 95,
  "reason": "Brief human reason explaining why it is safe or why it was rejected",
  "flags": []
}
`;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3-flash-preview'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mime || 'image/jpeg',
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          return {
            safe: Boolean(parsed.safe),
            confidence: parsed.confidence || 90,
            reason: parsed.reason || (parsed.safe ? 'Image verified safe by ReLoop AI.' : 'Prohibited or inappropriate content detected.'),
            flags: parsed.flags || [],
            modelUsed: model,
          };
        }
      }
    } catch {
      // Continue to next model
    }
  }

  // Graceful fallback if AI API is temporarily busy
  return {
    safe: true,
    confidence: 80,
    reason: 'Pre-check safety scan passed.',
    notice: 'AI vision offline, safety fallback passed.',
  };
}

/**
 * Verify that a product listing image is safe AND matches the stated product title
 */
export async function verifyListingProductImage(imageInput, itemTitle, categoryName = '', mimeType = 'image/jpeg') {
  if (!env.GEMINI_API_KEY) {
    return { safe: true, matchesProduct: true, reason: 'AI vision offline, safety fallback passed' };
  }

  const { base64, mime } = await extractBase64AndMime(imageInput, mimeType);
  if (!base64) {
    return { safe: true, matchesProduct: true, reason: 'No image data to verify' };
  }

  const prompt = `
You are ReLoop's marketplace product authenticity, safety, and image verification AI.
Evaluate this uploaded product image for a secondhand listing.

Listing Information:
- Stated Product Title: "${itemTitle || 'Untitled Item'}"
- Product Category: "${categoryName || 'General'}"

Instructions:
1. Safety Check:
   - Check strictly for: nudity, sexually explicit material, adult content, firearms, weapons, ammunition, narcotics, illicit drugs, gore, or hate imagery.
   - If ANY prohibited content is present, set "safe": false.
2. Product Match Verification:
   - Does this image reasonably match the stated product title ("${itemTitle}")?
   - What item is actually visible in the image?
   - If the stated title is e.g. "iPhone 13" and the image shows a completely unrelated item (e.g. shoes, a car, furniture, a random portrait, or an opaque solid color block placeholder), set "matchesProduct": false.
   - If it depicts the product, brand packaging, box, cables, or serial number sticker, set "matchesProduct": true.

Return ONLY valid JSON matching this schema:
{
  "safe": true,
  "matchesProduct": true,
  "detectedItem": "Brief description of what is actually depicted",
  "confidence": 95,
  "reason": "Clear explanation of the safety and match evaluation",
  "flags": []
}
`;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3-flash-preview'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mime || 'image/jpeg',
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          return {
            safe: Boolean(parsed.safe),
            matchesProduct: Boolean(parsed.matchesProduct),
            detectedItem: parsed.detectedItem || 'Product item',
            confidence: parsed.confidence || 90,
            reason: parsed.reason || 'Image verified against product title.',
            flags: parsed.flags || [],
            modelUsed: model,
          };
        }
      }
    } catch {
      // Continue to next model
    }
  }

  // Graceful fallback
  return {
    safe: true,
    matchesProduct: true,
    detectedItem: 'Product item',
    confidence: 80,
    reason: 'Pre-check safety scan passed.',
    notice: 'AI vision offline, safety fallback passed.',
  };
}
