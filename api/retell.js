/**
 * ============================================================================
 * VERCEL SERVERLESS ENDPOINT: /api/retell
 * ============================================================================
 */
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
      treeDisplayPhone: '(830) 555-0148',
      pestDisplayPhone: '(830) 555-0192',
      retellVoiceNumber: process.env.RETELL_VOICE_NUMBER || '+18304652566',
      smsAgentNumber: process.env.SMS_AGENT_NUMBER || '+18303608517',
      defaultSmsRoutingMode: process.env.DEFAULT_SMS_ROUTING_MODE || 'manual'
    });
  }

  return res.status(200).json({
    ok: true,
    receivedEvent: (req.body && req.body.event) || 'call_analyzed'
  });
};
