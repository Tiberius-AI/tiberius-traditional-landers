/**
 * ============================================================================
 * VERCEL SERVERLESS ENDPOINT: /api/ai-estimate
 * ============================================================================
 * Multimodal Gemini 2.5 Flash Arborist & Pest Control Photo & Scope Estimator
 * - Analyzes uploaded homeowner tree/acreage or pest photos + scope description.
 * - Returns structured JSON with ballpark investment range, crew/equipment tier,
 *   estimated job window, arborist/technician safety note, and SMS draft for
 *   the 3-Pane Back-Office Conversation Room.
 * ============================================================================
 */

const TREE_FALLBACK_ESTIMATES = {
  'Hazardous & Crane Tree Removal': {
    range: '$1,850 – $4,200',
    timeline: 'Est. Window: 1 Day (Same-Week Dispatch)',
    crew: '4-Man Climber Crew + 40-Ton Crane + AlturnaMATS',
    technicalNote:
      'Arborist Pre-Check: Zero-impact sectional rigging with AlturnaMATS turf protection panels recommended to dismantle heavy canopy limbs over structures or utilities with complete haul-off.'
  },
  'Live Oak Pruning & Oak Wilt Defense': {
    range: '$850 – $2,100',
    timeline: 'Est. Window: Half-Day to 1 Day',
    crew: 'ISA Certified Arborist + 3-Man Canopy Crew',
    technicalNote:
      'Oak Wilt Protocol: Sterilized tools between every tree, 100% immediate wound sealing within 15 minutes of every cut, and optional Alamo macro-infusion fungicide protection.'
  },
  'Cedar Mulching & Acreage Clearing': {
    range: '$1,900 – $3,600 / Acre',
    timeline: 'Est. Window: 1–2 Days (2–5 Acres/Day)',
    crew: 'High-Flow Forestry Mulcher + Skid Steer Operator',
    technicalNote:
      'Land Clearing Pre-Check: Single-step high-flow drum mulching shreds invasive cedar and underbrush into erosion-controlling topdressing without burn piles, dumpsters, or root damage to keeper oaks.'
  },
  '24/7 Emergency Storm Damage Response': {
    range: '$2,200 – $5,500',
    timeline: 'Est. Window: Priority 2–4 Hr Dispatch',
    crew: 'Emergency Crane & Rigging Strike Team',
    technicalNote:
      'Emergency Triage: Immediate stabilization and lift-off from roof decking or driveways, emergency roof tarping if needed, and itemized photo documentation for homeowner insurance claims.'
  },
  'Stump Grinding & Root Extraction': {
    range: '$275 – $750',
    timeline: 'Est. Window: 2–3 Hours On-Site',
    crew: 'Commercial 36"-Gate Tracked Stump Grinder',
    technicalNote:
      'Sub-Grade Grind: Commercial tracked grinder fits through standard 36-inch backyard gates and grinds stumps and surface flare roots 8–12 inches below grade for immediate sodding.'
  }
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const scope = body.scope || 'Hazardous & Crane Tree Removal';
  const visionText = body.visionText || scope;
  const imageBase64 = body.imageBase64 || null;
  const geminiKey = body.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.0-flash'
  ];

  const fallback =
    TREE_FALLBACK_ESTIMATES[scope] || TREE_FALLBACK_ESTIMATES['Hazardous & Crane Tree Removal'];

  if (!geminiKey) {
    return res.status(200).json({
      ok: true,
      provider: 'deterministic-fallback',
      model: 'ironoak-arborist-engine-v1',
      range: fallback.range,
      timeline: fallback.timeline,
      crew: fallback.crew,
      technicalNote: fallback.technicalNote,
      smsDraft: `Hi! This is Oakley at IronOak Tree Service (ISA #TX-4491A). We reviewed your "${scope}" request (${fallback.range} ballpark, ${fallback.timeline.replace('Est. Window: ', '')}). Can our ISA Certified Arborist stop by tomorrow between 9–11 AM or 2–4 PM for a quick on-site walkthrough?`
    });
  }

  try {
    const parts = [
      {
        text: `You are Lead ISA Certified Arborist Boone Garrett (#TX-4491A) at IronOak Tree Service & Land Clearing in Central Texas (New Braunfels, San Marcos, Seguin & San Antonio).
A property owner submitted a tree service or land clearing estimate request:
- Selected Scope Category: "${scope}"
- Property Owner Description / Notes: "${visionText}"
${imageBase64 ? '- A photo of their tree, canopy, stump, or acreage is attached. Inspect tree species, approximate height, proximity to structures/power lines, and access.' : ''}

Return a JSON object with these exact keys:
- "range": Realistic Central Texas tree service or forestry mulching price range string (e.g. "$1,850 – $3,900")
- "timeline": Estimated job duration string prefixed with "Est. Window: " (e.g. "Est. Window: 1 Day (Complete Haul-Off)")
- "crew": Recommended crew and heavy equipment configuration (e.g. "4-Man Climber Crew + 40-Ton Crane + AlturnaMATS")
- "technicalNote": A concise, authoritative 2-sentence arborist safety & execution observation tailored to their trees/lot.
- "smsDraft": A warm, direct 2-sentence SMS message from IronOak Tree Service referencing their specific scope and ballpark range, offering a free on-site arborist walkthrough tomorrow morning (9–11 AM) or afternoon (2–4 PM).`
      }
    ];

    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.includes('base64,')) {
      const [header, b64Data] = imageBase64.split('base64,');
      const mimeMatch = header.match(/data:(image\/[a-zA-Z0-9+.-]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: b64Data
        }
      });
    }

    for (const geminiModel of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText =
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text;

      const parsed = JSON.parse(rawText);
      return res.status(200).json({
        ok: true,
        provider: 'google-gemini',
        model: geminiModel,
        range: parsed.range || fallback.range,
        timeline: parsed.timeline || fallback.timeline,
        crew: parsed.crew || fallback.crew,
        technicalNote: parsed.technicalNote || fallback.technicalNote,
        smsDraft:
          parsed.smsDraft ||
          `Hi! We reviewed your "${scope}" inquiry (${parsed.range || fallback.range} ballpark). Would tomorrow morning (9–11 AM) or afternoon (2–4 PM) work for a free on-site arborist check?`
      });
    }
    throw new Error('Gemini fallback');
  } catch (err) {
    return res.status(200).json({
      ok: true,
      provider: 'deterministic-fallback',
      model: 'ironoak-arborist-engine-v1',
      range: fallback.range,
      timeline: fallback.timeline,
      crew: fallback.crew,
      technicalNote: fallback.technicalNote,
      smsDraft: `Hi! This is Oakley at IronOak Tree Service (ISA #TX-4491A). We reviewed your "${scope}" request (${fallback.range} ballpark, ${fallback.timeline.replace('Est. Window: ', '')}). Can our ISA Certified Arborist stop by tomorrow between 9–11 AM or 2–4 PM for a quick on-site walkthrough?`
    });
  }
};
