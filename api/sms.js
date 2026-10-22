/**
 * ============================================================================
 * VERCEL SERVERLESS ENDPOINT: /api/sms
 * ============================================================================
 * Handles:
 * 1. Inbound SMS Webhooks on +18303608517 (Twilio / Telnyx / GHL)
 * 2. Web Photo Estimator, Digital Clipboard & AI Concierge -> SMS Handshake
 * 3. Back-Office Manual Employee Replies & AI Co-Pilot Draft Approvals
 * 4. AI Auto-Pilot vs. Manual (Office Hours / Employee Handover) Mode Control
 * ============================================================================
 */

let globalSmsRoutingMode = process.env.DEFAULT_SMS_ROUTING_MODE || 'manual';

function buildDeterministicTreeReply({ name, scope, budget, timeline, inboundText }) {
  const clientName = name && name !== 'Property Owner' ? name.split(' ')[0] : 'there';
  const textLower = (inboundText || '').toLowerCase();

  if (textLower.includes('oak wilt') || textLower.includes('prune') || textLower.includes('trim')) {
    return `Hi ${clientName}! This is IronOak Tree Service (ISA Certified Arborist #TX-4491A). We sanitize all saws between trees and paint every Live Oak & Red Oak cut within 15 minutes using Texas Oak Wilt certified sealant ($850–$2,100 typical canopy package). Would tomorrow at 9:30 AM or 2:00 PM work for an arborist walkthrough?`;
  }

  if (textLower.includes('mulch') || textLower.includes('acre') || textLower.includes('cedar') || textLower.includes('clear')) {
    return `Hi ${clientName}! Our high-flow forestry mulching units clear 2–5 acres per day at $1,900–$3,600/acre with zero burn piles or haul-off fees. What ZIP code is your acreage in, and would tomorrow afternoon work to walk the fence lines?`;
  }

  if (textLower.includes('crane') || textLower.includes('house') || textLower.includes('roof') || textLower.includes('dead')) {
    return `Hi ${clientName}! For hazardous or overhanging removals near structures, we deploy AlturnaMATS turf protection and zero-impact crane/rope rigging (${budget || '$1,850 – $4,200'} typical range, $2M GL + Workers Comp insured). Can our crew chief stop by tomorrow morning to measure gate and driveway access?`;
  }

  return `Hi ${clientName}! Thanks for reaching out to IronOak Tree Service & Land Clearing. We logged your "${inboundText || scope || 'Tree & Acreage Estimate'}" request (ballpark: ${budget || '$1,450 – $3,600'}, ${timeline || 'Same-Week Dispatch'}). Would tomorrow between 9–11 AM or 2–4 PM work for a free on-site arborist check?`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      smsRoutingMode: globalSmsRoutingMode,
      smsAgentNumber: process.env.SMS_AGENT_NUMBER || '+18303608517',
      retellVoiceNumber: process.env.RETELL_VOICE_NUMBER || '+18304652566'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const action = body.action || 'inbound_sms';
  const requestedMode = body.mode || globalSmsRoutingMode;

  if (action === 'set_mode') {
    if (body.mode === 'manual' || body.mode === 'ai_autopilot' || body.mode === 'draft') {
      globalSmsRoutingMode = body.mode;
    }
    return res.status(200).json({
      ok: true,
      smsRoutingMode: globalSmsRoutingMode
    });
  }

  if (action === 'manual_reply' || action === 'approve_draft') {
    globalSmsRoutingMode = 'manual';
    return res.status(200).json({
      ok: true,
      action,
      smsRoutingMode: 'manual',
      autoHandoverLocked: true
    });
  }

  const replyText = buildDeterministicTreeReply({
    name: body.name,
    scope: body.scope,
    budget: body.budget,
    timeline: body.timeline,
    inboundText: body.message || body.visionText
  });

  if (requestedMode === 'ai_autopilot') {
    return res.status(200).json({
      ok: true,
      status: 'auto_replied',
      smsRoutingMode: 'ai_autopilot',
      autoReplied: true,
      aiReply: replyText
    });
  }

  return res.status(200).json({
    ok: true,
    status: 'queued_for_human',
    smsRoutingMode: requestedMode,
    autoReplied: false,
    aiDraft: replyText
  });
};
