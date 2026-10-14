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
