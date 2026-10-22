/**
 * ============================================================================
 * TIBERIUS AI // TRADITIONAL CONTRACTOR TELEPHONY & AI ROUTING CONFIGURATION
 * ============================================================================
 * IMPORTANT RULE:
 * - Visible display phone numbers on the website ALWAYS remain the persona's
 *   published local number:
 *     • Tree Service (IronOak): "(830) 555-0148"
 *     • Pest Control (Lone Star Shield): "(830) 555-0192"
 * - Only click-to-call (`tel:`) and click-to-text (`sms:`) links/buttons route
 *   to `retellVoiceNumber` (+18304652566) and `smsAgentNumber` (+18303608517).
 * - `smsRoutingMode` defaults to `'manual'` ("Manual / Office Hours Handover")
 *   so office staff or the crew chief can handle back-office communication
 *   during business hours without the AI talking over them, and can be toggled
 *   to `'ai_autopilot'` for 24/7 automatic AI SMS responses.
 * ============================================================================
 */
(function () {
  'use strict';

  const STORAGE_KEY_CONFIG = 'tiberius_traditional_telephony_v1';

  const DEFAULT_CONFIG = {
    treeDisplayPhone: '(830) 555-0148',
    pestDisplayPhone: '(830) 555-0192',

    // Click-to-Call destination -> Retell AI Voice Agent Number (E.164 format)
    retellVoiceNumber: '+18304652566',

    // Click-to-Text destination -> Twilio SMS AI Agent Number (E.164 format)
    smsAgentNumber: '+18303608517',

    // Default SMS Routing Mode:
    // 'manual'       -> Manual / Office Hours Employee Handover (DEFAULT)
    // 'ai_autopilot' -> AI Agent answers incoming texts automatically 24/7
    // 'draft'        -> AI Co-Pilot prepares suggested SMS draft for approval
    smsRoutingMode: 'manual',

    geminiModel: 'gemini-2.5-flash',
    geminiApiKey: '',

    defaultTreeSmsBody:
      'Hi IronOak Tree Service, I would like a ballpark estimate for tree work / land clearing at my property.',
    defaultPestSmsBody:
      'Hi Lone Star Shield Pest & Termite, I would like a same-day pest control quote.'
  };

  function loadConfig() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_CONFIG, parsed, {
          treeDisplayPhone: '(830) 555-0148',
          pestDisplayPhone: '(830) 555-0192'
        });
      }
    } catch (_err) {
      // Ignore storage errors
    }
    return Object.assign({}, DEFAULT_CONFIG);
  }

  function saveConfig(partial) {
    const current = loadConfig();
    const updated = Object.assign({}, current, partial, {
      treeDisplayPhone: '(830) 555-0148',
      pestDisplayPhone: '(830) 555-0192'
    });
    try {
      window.localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    } catch (_err) {
      // Ignore storage errors
    }
    window.TIBERIUS_TELEPHONY = updated;
    applyClickTargetsToDom(updated);
    return updated;
  }

  function normalizeE164(input, fallback) {
    if (!input || typeof input !== 'string') return fallback;
    const digits = input.replace(/[^\d+]/g, '');
    if (!digits) return fallback;
    if (digits.startsWith('+')) return digits;
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    return '+' + digits;
  }

  /**
   * Updates ONLY the `href` attributes of click-to-call (`tel:`) and click-to-text (`sms:`)
   * links across the page while strictly preserving visible phone numbers.
   */
  function applyClickTargetsToDom(cfg) {
    const activeCfg = cfg || loadConfig();
    const voiceE164 = normalizeE164(activeCfg.retellVoiceNumber, DEFAULT_CONFIG.retellVoiceNumber);
    const smsE164 = normalizeE164(activeCfg.smsAgentNumber, DEFAULT_CONFIG.smsAgentNumber);

    const headerEl = document.getElementById('cs-navigation');
    const isTree =
      (headerEl && headerEl.getAttribute('data-brand') === 'tree') ||
      window.location.pathname.includes('tree-service');

    const defaultBody = isTree
      ? activeCfg.defaultTreeSmsBody || DEFAULT_CONFIG.defaultTreeSmsBody
      : activeCfg.defaultPestSmsBody || DEFAULT_CONFIG.defaultPestSmsBody;
    const encodedBody = encodeURIComponent(defaultBody);

    // 1. All Click-to-Call links (`a[href^="tel:"]` or `[data-click-to-call]`)
    document.querySelectorAll('a[href^="tel:"], a[data-click-to-call]').forEach((el) => {
      el.setAttribute('href', `tel:${voiceE164}`);
      el.setAttribute('data-retell-voice-target', voiceE164);
    });

    // 2. All Click-to-Text links (`a[href^="sms:"]` or `[data-click-to-text]`)
    document.querySelectorAll('a[href^="sms:"], a[data-click-to-text]').forEach((el) => {
      const customBody = el.getAttribute('data-sms-body');
      const bodyParam = customBody ? encodeURIComponent(customBody) : encodedBody;
      el.setAttribute('href', `sms:${smsE164}?&body=${bodyParam}`);
      el.setAttribute('data-sms-agent-target', smsE164);
    });
  }

  const currentConfig = loadConfig();
  window.TIBERIUS_TELEPHONY = currentConfig;
  window.TiberiusTelephony = {
    getConfig: loadConfig,
    saveConfig: saveConfig,
    normalizeE164: normalizeE164,
    applyClickTargetsToDom: applyClickTargetsToDom
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyClickTargetsToDom(loadConfig());
    });
  } else {
    applyClickTargetsToDom(currentConfig);
  }
})();
