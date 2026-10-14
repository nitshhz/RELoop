import { env } from '../config/env.js';
import { z } from 'zod';

// Schema to validate AI output (Test 15)
export const aiListingOutputSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  suggestedCategory: z.string().min(2),
  tags: z.array(z.string()).default([]),
  missingDetailsToConsider: z.array(z.string()).default([]),
  suggestedHighlights: z.array(z.string()).default([]),
});

/**
 * Intelligent rule-based fallback when AI key is missing, network is offline, or quota is exhausted (Test 14)
 */
export function generateRuleBasedListing(input) {
  const brandPart = input.brand ? `${input.brand.trim()} ` : '';
  const modelPart = input.model ? `${input.model.trim()} ` : '';
  const namePart = input.productName ? input.productName.trim() : 'Pre-owned Item';
  const condition = input.condition || 'Good';

  const title = `${brandPart}${modelPart}${namePart} - (${condition} Condition)`.slice(0, 100);

  let desc = `Selling my ${brandPart}${modelPart}${namePart} in ${condition.toLowerCase()} condition.\n\n`;

  if (input.specifications && Object.keys(input.specifications).length > 0) {
    desc += `Key Specifications:\n`;
    for (const [k, v] of Object.entries(input.specifications)) {
      desc += `- ${k}: ${v}\n`;
    }
    desc += `\n`;
  }

  if (input.includedAccessories) {
    desc += `Included Accessories: ${input.includedAccessories}\n\n`;
  }

  if (input.knownDefects) {
    desc += `Condition Notes / Defects: ${input.knownDefects}\n\n`;
  } else {
    desc += `Fully operational with normal wear and tear suitable for its condition.\n\n`;
  }

  if (input.additionalDetails) {
    desc += `Additional details: ${input.additionalDetails}\n\n`;
  }

  desc += `Available for local pickup or courier. Reasonable offers welcome.`;

  // Guess category
  let suggestedCategory = 'Electronics';
  const lowerName = (namePart + ' ' + (input.categoryHint || '')).toLowerCase();
  if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('samsung') || lowerName.includes('mobile')) {
    suggestedCategory = 'Mobiles & Accessories';
  } else if (lowerName.includes('laptop') || lowerName.includes('macbook') || lowerName.includes('computer') || lowerName.includes('pc')) {
    suggestedCategory = 'Laptops & Computers';
  } else if (lowerName.includes('sofa') || lowerName.includes('table') || lowerName.includes('chair') || lowerName.includes('desk') || lowerName.includes('bed')) {
    suggestedCategory = 'Furniture & Home';
  } else if (lowerName.includes('shirt') || lowerName.includes('shoe') || lowerName.includes('dress') || lowerName.includes('jacket')) {
    suggestedCategory = 'Fashion';
  } else if (lowerName.includes('book') || lowerName.includes('novel') || lowerName.includes('textbook')) {
    suggestedCategory = 'Books';
  } else if (lowerName.includes('game') || lowerName.includes('ps5') || lowerName.includes('xbox') || lowerName.includes('nintendo')) {
    suggestedCategory = 'Gaming';
  } else if (lowerName.includes('camera') || lowerName.includes('lens') || lowerName.includes('dslr')) {
    suggestedCategory = 'Cameras';
  }

  const tags = [
    brandPart.trim(),
    namePart.split(' ')[0],
    condition,
    suggestedCategory.split(' ')[0],
  ].filter(Boolean);

  const missingDetailsToConsider = [];
  if (!input.specifications) missingDetailsToConsider.push('Consider adding exact technical specifications');
  if (!input.includedAccessories) missingDetailsToConsider.push('Mention whether original box and charger/cables are included');
  if (!input.knownDefects) missingDetailsToConsider.push('State if there are any micro-scratches, battery health percentage, or invoice available');

  return {
    title,
    description: desc.trim(),
    suggestedCategory,
    tags,
    missingDetailsToConsider,
    suggestedHighlights: [
      `Condition: ${condition}`,
      `Authentic secondhand item`,
      `Ready for immediate sale`,
    ],
    isFallback: true,
  };
}

/**
 * Call Hosted Gemini API to generate structured listing details
 */
export async function generateListingWithAI(input) {
  // If no API key configured, use intelligent rule-based fallback immediately
  if (!env.GEMINI_API_KEY) {
    return {
      ...generateRuleBasedListing(input),
      notice: 'Gemini API key not configured on server. Generated using rule-based marketplace engine.',
    };
  }

  const prompt = `
You are an expert secondhand marketplace listing assistant for ReLoop.
Generate a structured, appealing, truthful product listing from the seller's raw notes.
Do NOT invent false features, fake battery stats, or claim original receipt unless stated.
Return ONLY valid JSON matching this exact structure:
{
  "title": "Clear concise listing title between 5 and 100 characters",
  "description": "Engaging, formatted readable description with bullet points",
  "suggestedCategory": "Category name (e.g. Mobiles & Accessories, Laptops & Computers, Electronics, Furniture & Home, Fashion, Books, Gaming, Cameras, Sports & Fitness)",
  "tags": ["3 to 5 relevant search tags"],
  "missingDetailsToConsider": ["1 to 3 suggestions of details the seller should consider adding"],
  "suggestedHighlights": ["2 to 4 bullet points of genuine features"]
}

Seller Input:
- Product Name: ${input.productName || 'Not specified'}
- Brand: ${input.brand || 'Not specified'}
- Model: ${input.model || 'Not specified'}
- Condition: ${input.condition || 'Good'}
- Important Specifications: ${JSON.stringify(input.specifications || {})}
- Known Defects or Wear: ${input.knownDefects || 'None mentioned'}
- Included Accessories: ${input.includedAccessories || 'None mentioned'}
- Additional Details: ${input.additionalDetails || 'None'}
`;

  try {
    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
    let response = null;

    for (const modelName of modelsToTry) {
      try {
        const attemptController = new AbortController();
        const attemptTimeout = setTimeout(() => attemptController.abort(), 7000);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
          signal: attemptController.signal,
        });
        clearTimeout(attemptTimeout);

        if (res.ok) {
          response = res;
          break;
        } else {
          const errBody = await res.text();
          console.warn(`[Gemini API ${modelName} Notice] Status ${res.status}: ${errBody.slice(0, 120)}`);
        }
      } catch (attemptErr) {
        console.warn(`[Gemini API ${modelName} Attempt Error]`, attemptErr.message);
      }
    }

    if (!response) {
      return {
        ...generateRuleBasedListing(input),
        notice: 'Hosted AI service returned error or quota limit. Applied intelligent fallback template.',
      };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateRuleBasedListing(input);
    }

    // Parse JSON
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(candidateText.trim());
    } catch {
      // Regex clean-up if markdown ticks exist
      const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleaned);
    }

    // Validate with Zod schema (Test 15)
    const validated = aiListingOutputSchema.parse(parsedJson);
    return {
      ...validated,
      isFallback: false,
    };
  } catch (err) {
    console.warn('[Gemini Service Warning]', err.message);
    // Quota exhaustion or timeout fallback (Test 14)
    return {
      ...generateRuleBasedListing(input),
      notice: 'AI service temporarily unavailable. Generated using rule-based marketplace engine.',
    };
  }
}
