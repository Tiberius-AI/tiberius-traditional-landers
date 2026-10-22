/**
 * IronOak Tree Service & Land Clearing — Full AI Lead Capture & Back-Office Controller
 * Handles:
 *  1. Single-Card Photo & Scope Estimator (createImageBitmap client-side resize + /api/ai-estimate + fallback)
 *  2. 6-Card Capability Specification Lightbox
 *  3. Interactive Tree & Acreage Cost Calculator
 *  4. 3-Mode Conversational AI Concierge Drawer (Chat, Instant SMS Quote, Arborist Callback)
 *  5. 3-Pane Back-Office Conversation Room (Manual Office Hours default, AI Autopilot, AI Draft Co-Pilot)
 */
(function () {
  'use strict';

  const STORAGE_KEY_THREADS = 'tiberius_tree_bo_threads_v1';
  const STORAGE_KEY_ACTIVE_LEAD = 'tiberius_active_lead';
  const IS_STATIC_ELEVENTY_DEV =
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port === '8080';

  // =========================================================================
  // 1. CAPABILITY SPECIFICATION DATA (6 WORKHORSE CARDS)
  // =========================================================================
  const CAPABILITY_SPECS = {
    'crane-removal': {
      tag: 'ZERO-IMPACT CRANE RIGGING • ISA TX-4491A',
      title: 'Technical Crane Removals',
      price: '$1,800 – $6,500+',
      equipment: '45-Ton Hydraulic Crane + Spider Lift + AlturnaMATS®',
      desc: 'Designed for hazardous, hollow, or storm-compromised Live Oaks, Spanish Oaks, and Pecans overhanging roofs, pools, septic drainfields, or utility lines. Sections are rigged on dynema slings and lifted vertically—nothing hits your turf.',
      checklist: [
        '100% AlturnaMATS® interlocking ground protection over driveways & St. Augustine / Zoysia turf',
        'Zero-drop vertical crane picks over standing-seam metal & tile roofs',
        'Full brush chipping, hardwood log haul-off, and magnetic nail/debris sweep',
        'Immediate wound painting on any adjacent oaks to prevent Texas Oak Wilt beetles'
      ],
      defaultScope: 'Hazardous 60ft oak overhanging roof/patio needing zero-impact crane removal and haul-off'
    },
    'oak-wilt': {
      tag: 'TEXAS OAK WILT CERTIFIED PROTOCOL',
      title: 'Oak Wilt Management & Systemic Injections',
      price: '$450 – $4,200+',
      equipment: 'Macro-Infusion Root Flare Systems + 48" Rock Saw Trencher',
      desc: 'Bretziella fagacearum (Texas Oak Wilt) spreads rapidly through interconnected Live Oak root grafts and sap-feeding nitidulid beetles. Our ISA Certified Arborists execute strict containment and preventative immunization.',
      checklist: [
        'High-volume Alamo® (propiconazole) systemic root-flare macro-infusion injections',
        '100-foot perimeter root-graft barrier trenching (48–60 inches deep through Hill Country caliche)',
        '100% tool sterilization with Lysol/chlorine between properties and immediate wound paint within 10 minutes',
        'Written ISA Arborist diagnostic letter for HOA permits & real estate disclosures'
      ],
      defaultScope: 'Texas Oak Wilt risk evaluation, preventative propiconazole injections for heritage live oaks, and seasonal pruning'
    },
    'forestry-mulching': {
      tag: '1–50+ ACRE RANCH & LOT CLEARING',
      title: 'Lot Clearing & Forestry Mulching',
      price: '$1,650 – $2,800 / Acre',
      equipment: 'High-Flow Tracked Forestry Mulcher (Fecon Carbide Head)',
      desc: 'Transform overgrown Ashe Juniper (cedar), mesquite, huisache, and prickly pear into a clean, park-like carpet of nutrient-rich mulch in a single pass—without ripping up topsoil or compacting heritage oak root zones.',
      checklist: [
        'Selective clearing that preserves desirable Live Oaks, Spanish Oaks, and Elms',
        'Zero burn piles, zero smoke permits, and zero roll-off dumpster haul fees',
        'Instant erosion control barrier over limestone slopes and creek beds',
        'Ideal for custom home pad sites, fence-line right-of-ways, and hunting ranch trails'
      ],
      defaultScope: '3 acres of heavy cedar and brush needing selective forestry mulching around heritage oaks'
    },
    'canopy-pruning': {
      tag: 'ANSI A300 STRUCTURAL ARBORICULTURE',
      title: 'Heritage Oak Structural Pruning & Cabling',
      price: '$650 – $2,400',
      equipment: 'Tracked 75ft Backyard Spider Lift + Sterilized Hand Saws',
      desc: 'Never let "tree toppers" lion-tail or spike your heritage oaks. We follow strict ANSI A300 structural pruning standards to reduce end-weight on heavy horizontal limbs, clear rooflines by 8–10 feet, and install dynamic Cobra® support cables.',
      checklist: [
        'Spikeless climbing & compact 36-inch-gate tracked spider lift access',
        'Deadwood extraction (2 inches and larger) + canopy elevation over driveways & roofs',
        'Every single cut sealed immediately with black asphaltic latex paint year-round',
        'Non-invasive Cobra® dynamic cabling for split-crotch co-dominant trunks'
      ],
      defaultScope: '4 mature live oaks needing ANSI A300 structural canopy raising, roof clearance, and Oak Wilt sealing'
    },
    'stump-grinding': {
      tag: 'BELOW-GRADE HARDWOOD GRINDING',
      title: 'Deep Stump & Surface Root Grinding',
      price: '$250 – $950',
      equipment: 'Bandit Self-Propelled Tracked Diesel Grinder (35" Width)',
      desc: 'We grind stubborn Live Oak, Cedar, and Pecan stumps 8 to 14 inches below finish grade so you can sod, plant, or pour concrete without sinkholes or resprouting suckers.',
      checklist: [
        'Fits through standard 36-inch residential backyard fence gates',
        'Texas 811 underground utility, fiber, and irrigation line pre-check included',
        'Heavy mesh containment curtains to protect nearby windows, vehicles, and pool decks',
        'Optional mulch backfill grading or complete grindings haul-off + topsoil dressing'
      ],
      defaultScope: 'Grind 2 large hardwood oak stumps 12 inches below grade through a 36-inch backyard gate'
    },
    'storm-response': {
      tag: '24/7 EMERGENCY RAPID DISPATCH',
      title: '24/7 Storm & Structural Extraction',
      price: '$1,500 – $5,800+ (Insurance Ready)',
      equipment: 'Emergency Crane Unit + Rigging Crew + Heavy Roof Tarps',
      desc: 'When Hill Country microbursts or ice storms drop heavy timber onto your roof, garage, or driveway, cutting the wrong limb can cause catastrophic spring-pole roof collapse. Our crane crew lifts the load vertically and secures the structure.',
      checklist: [
        'Priority 24/7 dispatch for trees resting on roofs, vehicles, or blocking primary exits',
        'Vertical tension-free crane lifting to prevent secondary rafter or truss damage',
        'Immediate weatherproof roof tarping once timber is cleared',
        'Itemized Xactimate-aligned invoice + timestamped before/after photos for your insurance adjuster'
      ],
      defaultScope: 'Emergency storm-damaged oak limb resting on roof structure needing immediate crane extraction'
    }
  };

  // =========================================================================
  // 2. INITIAL BACK-OFFICE THREADS (CENTRAL TEXAS TREE SERVICE PERSONAS)
  // =========================================================================
  const DEFAULT_THREADS = [
    {
      id: 'tree-lead-101',
      name: 'Garrett Vance',
      phone: '(830) 555-0184',
      location: 'Vintage Oaks • New Braunfels, TX 78132',
      service: '45-Ton Crane Over-Roof Oak Removal',
      estimate: '$3,400 – $4,200',
      equipment: '45-Ton Hydraulic Crane + AlturnaMATS® + Stump Grinder',
      oakWilt: 'Sterilized Saws + Immediate Wound Paint on 2 Adjacent Oaks',
      source: 'Website Photo Estimator',
      status: 'Action Required',
      handoverMode: 'manual',
      unread: true,
      notes: '65ft dead live oak leaning 15 degrees over standing-seam metal roof and aerobic septic spray field. 14ft wide paved driveway access.',
      suggestedDraft: 'Hi Garrett — ISA Arborist Cody with IronOak here. I reviewed your Vintage Oaks photo: our 45-ton crane can set up on your concrete drive using AlturnaMATS so we never touch the septic field. Ballpark is $3,400–$4,200 complete. Does tomorrow at 8:30 AM or 2:00 PM work for a 15-min site check?',
      messages: [
        {
          sender: 'system',
          time: '10:14 AM',
          text: '📸 Photo Estimator Lead Captured • Uploaded 1 canopy photo • Scope: 65ft dead live oak leaning over metal roof & septic field in Vintage Oaks (78132).'
        },
        {
          sender: 'ai',
          time: '10:14 AM',
          text: 'Hi Garrett! This is Oakley at IronOak Tree Service (ISA #TX-4491A). Based on your photo and 65ft over-roof rigging scope, our preliminary turnkey ballpark is $3,400 – $4,200 including AlturnaMATS turf protection and haul-off.'
        },
        {
          sender: 'customer',
          time: '10:16 AM',
          text: 'Thanks. My main concern is our aerobic septic tank is right beside that oak. Can you guys get it out without driving heavy trucks on the back lawn?'
        }
      ]
    },
    {
      id: 'tree-lead-102',
      name: 'Col. Rick Henderson',
      phone: '(830) 555-0144',
      location: 'Spring Branch / Boerne, TX 78070',
      service: '5-Acre Cedar & Brush Forestry Mulching',
      estimate: '$8,500 – $10,500',
      equipment: 'High-Flow Fecon Tracked Forestry Mulcher + Skid Steer',
      oakWilt: 'Root-Zone Buffer Preserved Around Heritage Live Oaks',
      source: 'Interactive Acreage Calculator',
      status: 'AI Qualification',
      handoverMode: 'autopilot',
      unread: false,
      notes: '5 acres of dense Ashe Juniper (cedar) and agarita along creek draw. Wants all Live Oaks and Spanish Oaks saved and sculpted.',
      suggestedDraft: 'Col. Henderson — our High-Flow Fecon mulcher operator can clear those 5 acres in 2.5 days at $1,750–$2,100/acre with zero burn piles. Want to walk the property lines Thursday at 10:00 AM?',
      messages: [
        {
          sender: 'system',
          time: '9:40 AM',
          text: '🧮 Calculator Lead Captured • 5 Acres Cedar/Brush Forestry Mulching • Spring Branch 78070.'
        },
        {
          sender: 'customer',
          time: '9:42 AM',
          text: 'Do you haul off the cedar or leave it mulched on the ground? And how close can the mulcher get to our big oaks?'
        },
        {
          sender: 'ai',
          time: '9:42 AM',
          text: 'Great question, Col. Henderson! Our forestry mulcher shreds cedar standing in place into a 2-inch erosion-controlling mulch layer—so there are zero burn piles and zero haul-off fees. Around your heritage oaks, we feather back outside the critical root flare and hand-trim lower limbs with sterilized saws + Oak Wilt wound paint.'
        }
      ]
    },
    {
      id: 'tree-lead-103',
      name: 'Melissa Dominguez',
      phone: '(210) 555-0191',
      location: 'Alamo Heights • San Antonio, TX 78209',
      service: 'Emergency Split Pecan Limb Over Garage',
      estimate: '$1,850 – $2,600',
      equipment: '75ft Tracked Backyard Spider Lift + Rigging Crew',
      oakWilt: 'ANSI A300 Reduction Cut + Structural Cable Check',
      source: 'Oakley AI Concierge Chat',
      status: 'Action Required',
      handoverMode: 'draft',
      unread: true,
      notes: 'Large 18-inch diameter pecan limb split at main crotch and resting on detached garage ridge. Needs vertical crane/spider lift relief before cutting.',
      suggestedDraft: 'Hi Melissa — our emergency rigging crew is wrapping up in North San Antonio and can be at your Alamo Heights property by 1:30 PM today to safely lift that pecan limb off the garage roof and provide Xactimate photos for your insurance. Shall I lock you in?',
      messages: [
        {
          sender: 'customer',
          time: '8:55 AM',
          text: 'A huge pecan limb cracked last night and is sitting on our detached garage roof in Alamo Heights. Can someone come today before it rolls?'
        },
        {
          sender: 'ai',
          time: '8:55 AM',
          text: 'We have you marked Priority Emergency, Melissa. Please stay clear of the area below the limb—split pecan wood holds heavy spring tension. I have alerted our San Antonio rigging crew chief with your address.'
        }
      ]
    },
    {
      id: 'tree-lead-104',
      name: 'Travis & Jenna Keller',
      phone: '(830) 555-0128',
      location: 'Gruene • New Braunfels, TX 78130',
      service: 'Heritage Oak Pruning & Oak Wilt Injections (4 Trees)',
      estimate: '$1,950 – $2,650',
      equipment: 'ISA Arborist Climbing Crew + Alamo® Macro-Infusion Kit',
      oakWilt: '100% Sterilized Blades + Immediate Latex Wound Sealant',
      source: 'Digital Clipboard Estimator',
      status: 'Walkthrough Booked',
      handoverMode: 'manual',
      unread: false,
      notes: '4 century live oaks overhanging circular drive in Gruene. Neighbor 3 doors down lost a red oak last month; homeowners want preventative Alamo injections + canopy raise.',
      suggestedDraft: 'Confirmed for tomorrow at 8:30 AM, Travis! ISA Arborist Cody (#TX-4491A) will inspect the root flares on all 4 live oaks and bring the Alamo macro-infusion specs.',
      messages: [
        {
          sender: 'system',
          time: 'Yesterday',
          text: '📋 Digital Clipboard Lead • 4 Heritage Live Oaks • Gruene 78130 • Oak Wilt Injection + Canopy Raise.'
        },
        {
          sender: 'ai',
          time: 'Yesterday',
          text: '📅 ISA Arborist Walkthrough confirmed for Tomorrow 8:30 AM – 9:30 AM at your Gruene property.'
        }
      ]
    }
  ];

  // State
  let threads = loadThreads();
  let activeThreadId = threads[0] ? threads[0].id : null;
  let activeQueueFilter = 'all';
  let currentPhotoDataUrl = null;
  let currentPhotoName = '';
  let lastEstimateResult = null;

  function loadThreads() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_THREADS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      // ignore storage errors
    }
    return JSON.parse(JSON.stringify(DEFAULT_THREADS));
  }

  function saveThreads() {
    try {
      localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
    } catch (err) {
      // ignore storage errors
    }
    updateHeaderBadge();
  }

  function updateHeaderBadge() {
    const badge = document.getElementById('boUnreadBadge');
    if (!badge) return;
    const unreadCount = threads.filter((t) => t.unread || t.status === 'Action Required').length;
    badge.textContent = String(unreadCount || threads.length);
  }

  // =========================================================================
  // 3. DETERMINISTIC ARBORIST AI FALLBACK ENGINE
  // =========================================================================
  function buildDeterministicTreeEstimate(scopeText) {
    const lower = (scopeText || '').toLowerCase();
    const isMulching = /acre|mulch|cedar|brush|lot|clearing|ranch|mesquite/.test(lower);
    const isOakWilt = /oak wilt|inject|trench|fungus|dying oak|red oak/.test(lower);
    const isEmergency = /storm|emergency|fell|fallen|split|resting on|blocking/.test(lower);
    const isStump = /stump/.test(lower) && !/remove|removal|crane|overhanging/.test(lower);
    const isPruning = /trim|prune|pruning|canopy|raise|deadwood/.test(lower) && !/remove|removal/.test(lower);

    if (isMulching) {
      return {
        estimateRange: '$3,400 – $5,600',
        serviceTitle: 'Selective Cedar & Brush Forestry Mulching',
        equipment: 'High-Flow Fecon Tracked Forestry Mulcher + ISA Spotter',
        timeline: '1–2 Days On-Site • Zero Burn Piles or Haul Fees',
        summary: 'Based on your acreage/brush scope, our High-Flow Tracked Forestry Mulcher will grind cedar, mesquite, and underbrush directly into an erosion-controlling mulch layer while preserving the critical root zones of your desirable Live and Spanish Oaks.',
        lineItems: [
          { label: 'High-Flow Tracked Forestry Mulcher & Operator', range: '$2,800 – $4,600' },
          { label: 'Selective Oak Root-Zone Protection & Lower Canopy Raise', range: '$450 – $750' },
          { label: 'Immediate Oak Wilt Wound Sealing on Cut Oak Limbs', range: 'Included ($0)' }
        ]
      };
    }

    if (isOakWilt) {
      return {
        estimateRange: '$1,250 – $3,400',
        serviceTitle: 'Texas Oak Wilt Containment & Systemic Macro-Infusion',
        equipment: 'ISA Certified Arborist (#TX-4491A) + Alamo® Macro-Infusion System',
        timeline: 'Same-Week Treatment • 24-Month Protection Window',
        summary: 'Texas Oak Wilt requires immediate root-flare immunization and strict tool sterilization. Our ISA Certified Arborist will calculate exact DBH (diameter at breast height) dosages of Alamo® propiconazole and map any required root-graft trench barriers.',
        lineItems: [
          { label: 'ISA Certified Arborist Diagnostic & Root-Graft Mapping', range: 'Included ($0)' },
          { label: 'High-Volume Alamo® Systemic Root-Flare Injections', range: '$850 – $2,100' },
          { label: 'Diseased Canopy Removal / Trenching Containment Reserve', range: '$400 – $1,300' }
        ]
      };
    }

    if (isEmergency) {
      return {
        estimateRange: '$2,100 – $4,400',
        serviceTitle: 'Priority Emergency Storm & Structural Timber Extraction',
        equipment: '45-Ton Hydraulic Crane + Spider Lift + Roof Tarp Kit',
        timeline: 'Priority Same-Day / Next-Morning Dispatch',
        summary: 'Storm-loaded limbs over roofs carry severe spring-pole tension. We position our hydraulic crane to lift the timber vertically off your structure with zero additional roof weight, followed by complete debris chipping and insurance documentation.',
        lineItems: [
          { label: 'Vertical Crane Rigging & Tension-Free Roof Extraction', range: '$1,550 – $3,200' },
          { label: 'Emergency Structural Roof Tarping & Magnetic Sweep', range: '$250 – $550' },
          { label: 'Chipping, Log Haul-Off & Xactimate Insurance Photo Packet', range: '$300 – $650' }
        ]
      };
    }

    if (isStump) {
      return {
        estimateRange: '$350 – $750',
        serviceTitle: 'Below-Grade Tracked Diesel Stump & Surface Root Grinding',
        equipment: '35"-Gate Tracked Diesel Grinder + Debris Containment Screens',
        timeline: 'Half-Day Window • 811 Utility Pre-Check Included',
        summary: 'Our self-propelled tracked diesel stump grinder passes easily through standard 36-inch residential backyard gates and grinds hardwood oak/pecan stumps 10–12 inches below grade.',
        lineItems: [
          { label: 'Deep Hardwood Stump & Flare Grinding (10–12" Below Grade)', range: '$275 – $550' },
          { label: 'Surface Root Chasing & Grade Backfill Raking', range: '$75 – $200' },
          { label: 'Texas 811 Underground Line Locate & Window Shielding', range: 'Included ($0)' }
        ]
      };
    }

    if (isPruning) {
      return {
        estimateRange: '$950 – $2,150',
        serviceTitle: 'ANSI A300 Heritage Oak Structural Pruning & Canopy Elevation',
        equipment: '75ft Tracked Spider Lift + Sterilized Saws + 18" Chipper',
        timeline: '1 Day On-Site • 100% Oak Wilt Wound Paint Protocol',
        summary: 'We perform spikeless ANSI A300 crown thinning, deadwood removal, and 8–10ft roof/driveway clearance. Every single cut is painted within 10 minutes to block nitidulid sap beetles.',
        lineItems: [
          { label: 'ISA Structural Crown Thinning & Roofline Clearance', range: '$750 – $1,650' },
          { label: 'Sterilized Blade Protocol & Immediate Asphaltic Wound Sealing', range: 'Included ($0)' },
          { label: 'Full Brush Chipping, Rake-Out & Blower Cleanup', range: '$200 – $500' }
        ]
      };
    }

    // Default: Technical Crane / Large Tree Removal
    return {
      estimateRange: '$2,450 – $3,950',
      serviceTitle: 'Zero-Impact Technical Tree Removal & Stump Grinding',
      equipment: '45-Ton Hydraulic Crane + AlturnaMATS® + Tracked Grinder',
      timeline: '1 Day On-Site • Next ISA Walkthrough Available Tomorrow',
      summary: 'For mature Central Texas oaks near structures, fences, or septic fields, we deploy composite AlturnaMATS® over your lawn and lift each section via crane or rope-rigging so nothing impacts your turf or roof.',
      lineItems: [
        { label: 'Zero-Impact Crane / Technical Rigging & Sectional Takedown', range: '$1,750 – $2,850' },
        { label: 'AlturnaMATS® Turf Protection, Brush Chipping & Log Haul-Off', range: '$400 – $650' },
        { label: 'Deep Stump Grinding + Adjacent Oak Wilt Wound Sealing', range: '$300 – $450' }
      ]
    };
  }

  // =========================================================================
  // 4. PHOTO UPLOAD & STREAMLINED SINGLE-CARD ESTIMATOR
  // =========================================================================
  function initPhotoEstimator() {
    const fileInput = document.getElementById('treePhotoInput');
    const triggerBtn = document.getElementById('treePhotoTriggerBtn');
    const previewWrap = document.getElementById('treePhotoPreviewWrap');
    const previewImg = document.getElementById('treePhotoPreviewImg');
    const previewName = document.getElementById('treePhotoPreviewName');
    const removeBtn = document.getElementById('treePhotoRemoveBtn');
    const scopeInput = document.getElementById('treeScopeInput');
    const phoneInput = document.getElementById('treeEstimatorPhone');
    const form = document.getElementById('treePhotoEstimatorForm');
    const submitBtn = document.getElementById('treeEstimatorSubmitBtn');

    // Quick Scope Pills
    document.querySelectorAll('[data-scope-pill]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-scope-pill]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        if (scopeInput) {
          scopeInput.value = pill.getAttribute('data-scope-pill') || '';
          scopeInput.focus();
        }
      });
    });

    if (triggerBtn && fileInput) {
      triggerBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        currentPhotoName = file.name;

        try {
          if (window.createImageBitmap) {
            const bitmap = await window.createImageBitmap(file);
            const maxDim = 1280;
            let w = bitmap.width;
            let h = bitmap.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, w, h);
            currentPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          } else {
            currentPhotoDataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
          }

          if (previewImg && previewWrap && triggerBtn) {
            previewImg.src = currentPhotoDataUrl;
            if (previewName) previewName.textContent = currentPhotoName;
            previewWrap.hidden = false;
            triggerBtn.hidden = true;
          }
        } catch (err) {
          console.warn('Photo preview fallback:', err);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        currentPhotoDataUrl = null;
        currentPhotoName = '';
        if (fileInput) fileInput.value = '';
        if (previewWrap) previewWrap.hidden = true;
        if (triggerBtn) triggerBtn.hidden = false;
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const scopeVal = (scopeInput && scopeInput.value.trim()) || 'Large live oak removal & canopy pruning near residence';
        const phoneVal = (phoneInput && phoneInput.value.trim()) || '(830) 555-0199';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Analyzing Canopy & Calculating Iron...';
        }

        let estimate = buildDeterministicTreeEstimate(scopeVal);

        // Attempt live /api/ai-estimate call in serverless production, or instant deterministic engine on static 11ty dev server
        if (!IS_STATIC_ELEVENTY_DEV) {
          try {
            const resp = await fetch('/api/ai-estimate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                trade: 'tree-service',
                businessName: 'IronOak Tree Service & Land Clearing',
                scope: scopeVal,
                phone: phoneVal,
                hasPhoto: Boolean(currentPhotoDataUrl)
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.estimateRange) {
                estimate = {
                  estimateRange: data.estimateRange,
                  serviceTitle: data.serviceTitle || estimate.serviceTitle,
                  equipment: data.equipment || estimate.equipment,
                  timeline: data.timeline || estimate.timeline,
                  summary: data.summary || estimate.summary,
                  lineItems: Array.isArray(data.lineItems) && data.lineItems.length ? data.lineItems : estimate.lineItems
                };
              }
            }
          } catch (err) {
            // Use deterministic ISA Arborist fallback
          }
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Get Instant Tree Ballpark →';
        }

        lastEstimateResult = {
          ...estimate,
          scope: scopeVal,
          phone: phoneVal,
          hasPhoto: Boolean(currentPhotoDataUrl),
          photoUrl: currentPhotoDataUrl
        };

        // Sync lead to Back-Office Room + sessionStorage
        syncLeadToBackoffice({
          name: 'Property Owner (' + phoneVal.slice(-4) + ')',
          phone: phoneVal,
          location: 'Comal / Bexar County, TX',
          service: estimate.serviceTitle,
          estimate: estimate.estimateRange,
          equipment: estimate.equipment,
          notes: scopeVal,
          source: currentPhotoDataUrl ? 'Photo & Scope AI Estimator (Photo Attached)' : 'Instant AI Scope Estimator'
        });

        openEstimateResultModal(lastEstimateResult);
        showCrossPillarToast(
          'Tree Ballpark Logged in Back-Office Room',
          estimate.estimateRange + ' • ' + estimate.serviceTitle
        );
      });
    }
  }

  function openEstimateResultModal(est) {
    const modal = document.getElementById('estimate-result-modal');
    if (!modal) return;

    const rangeEl = document.getElementById('estModalRange');
    const timelineEl = document.getElementById('estModalTimeline');
    const summaryEl = document.getElementById('estModalSummary');
    const itemsEl = document.getElementById('estModalLineItems');
    const photoBadge = document.getElementById('estModalPhotoBadge');
    const photoImg = document.getElementById('estModalPhotoImg');

    if (rangeEl) rangeEl.textContent = est.estimateRange;
    if (timelineEl) timelineEl.textContent = est.timeline;
    if (summaryEl) summaryEl.textContent = est.summary;

    if (photoBadge && photoImg) {
      if (est.hasPhoto && est.photoUrl) {
        photoImg.src = est.photoUrl;
        photoBadge.hidden = false;
      } else {
        photoBadge.hidden = true;
      }
    }

    if (itemsEl && Array.isArray(est.lineItems)) {
      itemsEl.innerHTML = est.lineItems
        .map(
          (item) => `
          <div class="cs-est-line-row">
            <span>${item.label}</span>
            <strong>${item.range}</strong>
          </div>
        `
        )
        .join('');
    }

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
  }

  // =========================================================================
  // 5. CAPABILITY SPECIFICATION LIGHTBOX (6 CARDS)
  // =========================================================================
  function initCapabilityLightbox() {
    const modal = document.getElementById('capability-lightbox');
    const closeBtn = document.getElementById('capModalCloseBtn');
    const priceBtn = document.getElementById('capModalPriceBtn');
    let activeCapSpec = null;

    document.querySelectorAll('[data-capability-id]').forEach((card) => {
      const openCard = () => {
        const id = card.getAttribute('data-capability-id');
        const spec = CAPABILITY_SPECS[id];
        if (!spec || !modal) return;
        activeCapSpec = spec;

        document.getElementById('capModalTag').textContent = spec.tag;
        document.getElementById('capModalTitle').textContent = spec.title;
        document.getElementById('capModalPrice').textContent = spec.price;
        document.getElementById('capModalEquipment').textContent = spec.equipment;
        document.getElementById('capModalDesc').textContent = spec.desc;

        const listEl = document.getElementById('capModalChecklist');
        if (listEl) {
          listEl.innerHTML = spec.checklist.map((item) => `<li>✓ ${item}</li>`).join('');
        }

        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
      };

      card.addEventListener('click', openCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCard();
        }
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
      });
    }

    if (priceBtn && modal) {
      priceBtn.addEventListener('click', () => {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        if (activeCapSpec) {
          syncLeadToBackoffice({
            name: 'Website Visitor (Spec Inquiry)',
            phone: '(830) 555-0199',
            location: 'New Braunfels / San Antonio, TX',
            service: activeCapSpec.title,
            estimate: activeCapSpec.price,
            equipment: activeCapSpec.equipment,
            notes: activeCapSpec.defaultScope,
            source: 'Capability Spec Lightbox'
          });
          showCrossPillarToast(
            'Inquiry Synced to Back-Office Room',
            `${activeCapSpec.title} • ${activeCapSpec.price}`
          );
        }
        const scopeInput = document.getElementById('treeScopeInput');
        const estimatorSection = document.getElementById('photo-estimator');
        if (scopeInput && activeCapSpec) {
          scopeInput.value = activeCapSpec.defaultScope;
        }
        if (estimatorSection) {
          estimatorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const phoneInput = document.getElementById('treeEstimatorPhone');
            if (phoneInput) phoneInput.focus();
          }, 450);
        }
      });
    }
  }

  // =========================================================================
  // 6. INTERACTIVE TREE & ACREAGE COST CALCULATOR
  // =========================================================================
  function initTreeCalculator() {
    let service = 'removal';
    let scale = 'large';
    let access = 'tight';

    const stumpCheck = document.getElementById('calcStumpCheck');
    const priceOut = document.getElementById('calcPriceOutput');
    const summaryOut = document.getElementById('calcScopeSummary');
    const crewOut = document.getElementById('calcCrewAssigned');
    const turfOut = document.getElementById('calcTurfSpec');
    const durationOut = document.getElementById('calcDurationSpec');
    const lockBtn = document.getElementById('calcLockQuoteBtn');

    function recalculate() {
      const includeStump = stumpCheck ? stumpCheck.checked : true;
      let min = 1800;
      let max = 2800;
      let crew = 'ISA Climber + 75ft Spider Lift + 18" Brush Chipper';
      let turf = 'AlturnaMATS® Ground Protection + Zero-Drop Lowering';
      let duration = '1 Day (6–8 Hours, Clean Raked Haul-Off)';
      let serviceLabel = 'Technical Removal';

      if (service === 'removal') {
        serviceLabel = 'Technical Tree Removal';
        if (scale === 'small') { min = 950; max = 1650; }
        else if (scale === 'large') { min = 2100; max = 3300; }
        else { min = 3600; max = 5800; }
      } else if (service === 'pruning') {
        serviceLabel = 'Heritage Canopy Structural Pruning (3–5 Trees)';
        if (scale === 'small') { min = 650; max = 1150; }
        else if (scale === 'large') { min = 1250; max = 2100; }
        else { min = 2200; max = 3600; }
        crew = 'ISA Certified Canopy Crew + 75ft Spider Lift + Sterilized Saws';
        duration = 'Half to Full Day (100% Oak Wilt Wound Sealing Included)';
      } else if (service === 'mulching') {
        serviceLabel = 'Selective Cedar & Brush Forestry Mulching';
        if (scale === 'small') { min = 1750; max = 2600; duration = '1 Day (1 Acre Selective Clearing)'; }
        else if (scale === 'large') { min = 3600; max = 5800; duration = '1.5 – 2 Days (2–3 Acres Selective Mulching)'; }
        else { min = 7800; max = 12500; duration = '3 – 4 Days (5+ Acres Ranch & Trail Mulching)'; }
        crew = 'High-Flow Tracked Fecon Forestry Mulcher + Skid Steer Spotter';
        turf = 'Low-Ground-Pressure Rubber Tracks + Root-Flare Buffer Zone';
      } else if (service === 'oakwilt') {
        serviceLabel = 'Texas Oak Wilt Containment & Systemic Injections';
        if (scale === 'small') { min = 650; max = 1350; }
        else if (scale === 'large') { min = 1450; max = 2850; }
        else { min = 3100; max = 5400; }
        crew = 'ISA Certified Arborist (#TX-4491A) + Alamo® Macro-Infusion Rig';
        turf = 'Non-Invasive Root Flare Macro-Infusion + Sterilized Protocol';
        duration = 'Half Day On-Site (24-Month Systemic Protection)';
      }

      if (access === 'open') {
        min = Math.round(min * 0.88);
        max = Math.round(max * 0.9);
      } else if (access === 'overroof') {
        min = Math.round(min * 1.25);
        max = Math.round(max * 1.3);
        if (service === 'removal') {
          crew = '45-Ton Hydraulic Crane + ISA Rigging Specialist + Chipper Truck';
          turf = 'Full AlturnaMATS® Driveway/Turf Shield + Vertical Crane Picks';
        }
      }

      if (includeStump && service === 'removal') {
        min += 300;
        max += 350;
      }

      const fmt = (n) => '$' + n.toLocaleString('en-US');
      if (priceOut) priceOut.textContent = `${fmt(min)} – ${fmt(max)}`;

      const scaleLabel =
        scale === 'small'
          ? 'Medium Scale (Under 35 ft / 1 Acre)'
          : scale === 'large'
          ? 'Large Heritage Scale (35–65 ft / 2–3 Acres)'
          : 'Specimen / Multi-Tree Scale (65+ ft / 5+ Acres)';

      const accessLabel =
        access === 'open'
          ? 'Direct Pasture / Driveway Access'
          : access === 'tight'
          ? 'Fenced Yard / Septic & Turf Protection'
          : 'Over-Roof / Utility Line Crane Rigging';

      if (summaryOut) {
        summaryOut.textContent = `${scaleLabel} • ${serviceLabel} • ${accessLabel}${
          includeStump && service === 'removal' ? ' • Deep Stump Grinding Included' : ''
        }`;
      }
      if (crewOut) crewOut.textContent = crew;
      if (turfOut) turfOut.textContent = turf;
      if (durationOut) durationOut.textContent = duration;
    }

    function bindGroup(containerId, attrName, setter) {
      const group = document.getElementById(containerId);
      if (!group) return;
      group.querySelectorAll(`[${attrName}]`).forEach((btn) => {
        btn.addEventListener('click', () => {
          group.querySelectorAll(`[${attrName}]`).forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          setter(btn.getAttribute(attrName));
          recalculate();
        });
      });
    }

    bindGroup('calcServiceGroup', 'data-calc-service', (v) => { service = v; });
    bindGroup('calcScaleGroup', 'data-calc-scale', (v) => { scale = v; });
    bindGroup('calcAccessGroup', 'data-calc-access', (v) => { access = v; });
    if (stumpCheck) stumpCheck.addEventListener('change', recalculate);

    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        const summaryText = summaryOut ? summaryOut.textContent.trim() : '';
        const priceText = priceOut ? priceOut.textContent.trim() : '';
        const crewText = crewOut ? crewOut.textContent.trim() : '75ft Tracked Spider Lift + Sterilized Saws';
        const serviceTitleMap = {
          removal: 'Technical Tree Removal & Rigging',
          pruning: 'Tree Trimming & Structural Canopy Pruning',
          mulching: 'Selective Cedar & Brush Forestry Mulching',
          oakwilt: 'Texas Oak Wilt Containment & Systemic Injections'
        };
        const chosenServiceTitle = serviceTitleMap[service] || 'Tree Trimming & Structural Canopy Pruning';

        syncLeadToBackoffice({
          name: 'Property Owner (Calculator Inquiry)',
          phone: '(830) 555-0199',
          location: 'New Braunfels / San Antonio, TX',
          service: chosenServiceTitle,
          estimate: priceText || '$950 – $2,150',
          equipment: crewText,
          notes: summaryText,
          source: 'Interactive Tree & Acreage Calculator'
        });

        showCrossPillarToast(
          'Calculator Inquiry Synced to Back-Office',
          `${chosenServiceTitle} • ${priceText}`
        );

        const scopeInput = document.getElementById('treeScopeInput');
        const estimatorSection = document.getElementById('photo-estimator');
        if (scopeInput) {
          scopeInput.value = `${summaryText} (Calculator Ballpark: ${priceText})`;
        }
        if (estimatorSection) {
          estimatorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const phoneInput = document.getElementById('treeEstimatorPhone');
            if (phoneInput) phoneInput.focus();
          }, 450);
        }
      });
    }

    recalculate();
  }

  // =========================================================================
  // 7. 3-MODE CONVERSATIONAL AI CONCIERGE DRAWER (OAKLEY AI)
  // =========================================================================
  function getOakleyAiReply(userMessage) {
    const q = (userMessage || '').toLowerCase();
    if (/oak wilt|trim|when to trim|beetle|paint|february|jun/.test(q)) {
      return 'Under Texas Oak Wilt guidelines, we avoid pruning oaks during peak fungal mat & nitidulid beetle season (Feb 1 – June 30) unless addressing an immediate storm hazard. Regardless of the month, our ISA Certified crew sterilizes saws between properties and applies asphaltic wound paint within 10 minutes of every cut. Would you like an ISA Arborist to inspect your oaks?';
    }
    if (/mulch|acre|cedar|lot|clearing|brush/.test(q)) {
      return 'Our High-Flow Tracked Forestry Mulcher clears cedar, mesquite, and underbrush for $1,650 – $2,800 per acre depending on stem density and limestone terrain. Everything is shredded into a protective topsoil mulch layer with zero burn piles or haul-off fees. How many acres are you looking to clear?';
    }
    if (/cost|price|how much|55ft|60ft|remove|removal|crane/.test(q)) {
      return 'For a mature 50–65ft Central Texas Live Oak near a home, fence, or septic system, zero-impact technical or crane removal typically ranges from $2,200 to $4,200 including AlturnaMATS® turf protection, brush chipping, log haul-off, and deep stump grinding. Drop your mobile number below and I can text you a written breakdown!';
    }
    if (/storm|emergency|fallen|roof|split|today/.test(q)) {
      return 'We treat split or roof-resting timber as a Priority 1 Emergency. Our 45-ton crane and spider lift crew lifts the limb vertically so it never rolls or punches through rafters, and we provide full Xactimate photo documentation for your homeowners insurance. Click "Lock In Written SMS Estimate" below or call (830) 555-0148 for immediate dispatch.';
    }
    return 'I can help you price tree removals, ANSI A300 heritage oak pruning, Texas Oak Wilt containment, or acreage forestry mulching across New Braunfels, San Marcos, Seguin, and San Antonio. Tell me roughly how tall the trees are (or how many acres) and whether they overhang any structures!';
  }

  function initAiConciergeDrawer() {
    const backdrop = document.getElementById('aiConciergeBackdrop');
    const closeBtn = document.getElementById('aiDrawerCloseBtn');
    const chatMessages = document.getElementById('aiChatMessages');
    const chatComposer = document.getElementById('aiChatComposerForm');
    const chatInput = document.getElementById('aiChatInput');
    const toggleInlineLeadBtn = document.getElementById('aiToggleInlineLeadBtn');
    const inlineLeadForm = document.getElementById('aiChatLeadForm');
    const smsForm = document.getElementById('aiSmsForm');
    const callbackForm = document.getElementById('aiCallbackForm');

    function appendChatBubble(sender, text) {
      if (!chatMessages) return;
      const div = document.createElement('div');
      div.className = `cs-ai-msg cs-ai-msg-${sender}`;
      div.innerHTML = `<div class="cs-ai-bubble">${text}</div>`;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Seed initial greeting
    if (chatMessages && chatMessages.children.length === 0) {
      appendChatBubble(
        'ai',
        'Howdy! I’m <strong>Oakley</strong>, IronOak’s AI Arborist & Dispatch Concierge (ISA #TX-4491A). Ask me about crane tree removal costs, Texas Oak Wilt protocols, or per-acre forestry mulching—or lock in an instant written ballpark!'
      );
    }

    function switchAiTab(mode) {
      document.querySelectorAll('[data-ai-mode]').forEach((tab) => {
        const active = tab.getAttribute('data-ai-mode') === mode;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const panelChat = document.getElementById('aiPanelChat');
      const panelSms = document.getElementById('aiPanelSms');
      const panelCallback = document.getElementById('aiPanelCallback');
      if (panelChat) panelChat.hidden = mode !== 'chat';
      if (panelSms) panelSms.hidden = mode !== 'sms';
      if (panelCallback) panelCallback.hidden = mode !== 'callback';
    }

    function openDrawer(mode) {
      if (!backdrop) return;
      backdrop.hidden = false;
      backdrop.setAttribute('aria-hidden', 'false');
      switchAiTab(mode || 'chat');
    }

    function closeDrawer() {
      if (!backdrop) return;
      backdrop.hidden = true;
      backdrop.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('[data-open-ai-drawer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-open-ai-drawer') || 'chat';
        openDrawer(mode);
      });
    });

    document.querySelectorAll('[data-ai-mode]').forEach((tab) => {
      tab.addEventListener('click', () => switchAiTab(tab.getAttribute('data-ai-mode')));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeDrawer();
      });
    }

    let liveChatThreadId = null;

    function syncChatExchangeToBackoffice(userText, aiText) {
      const est = buildDeterministicTreeEstimate(userText);
      let existing = liveChatThreadId
        ? threads.find((t) => t.id === liveChatThreadId)
        : null;

      if (!existing) {
        liveChatThreadId = 'tree-chat-' + Date.now();
        existing = {
          id: liveChatThreadId,
          name: 'Website Homeowner (Live Chat)',
          phone: 'Pending / In Chat',
          location: 'New Braunfels / San Antonio, TX',
          service: est.serviceTitle,
          estimate: est.estimateRange,
          equipment: est.equipment,
          oakWilt: 'Sterilized Saws + Immediate Asphaltic Wound Sealant',
          source: 'Oakley AI Concierge Chat',
          status: 'Action Required',
          handoverMode: 'manual',
          unread: true,
          notes: userText,
          suggestedDraft: `Hi there — ISA Arborist Cody with IronOak Tree Service (#TX-4491A) here. Following up on your chat inquiry about ${est.serviceTitle} (${est.estimateRange}). Would tomorrow at 8:30 AM or 2:00 PM work for a quick 15-minute property walkthrough?`,
          messages: [
            {
              sender: 'system',
              time: 'Just now',
              text: `💬 Live Oakley AI Chat Started • Detected Scope: ${est.serviceTitle} (${est.estimateRange}).`
            },
            {
              sender: 'customer',
              time: 'Just now',
              text: userText
            },
            {
              sender: 'ai',
              time: 'Just now',
              text: aiText
            }
          ]
        };
        threads.unshift(existing);
      } else {
        existing.service = est.serviceTitle;
        existing.estimate = est.estimateRange;
        existing.equipment = est.equipment;
        existing.notes = userText;
        existing.status = 'Action Required';
        existing.unread = true;
        existing.messages.push(
          { sender: 'customer', time: 'Just now', text: userText },
          { sender: 'ai', time: 'Just now', text: aiText }
        );
      }

      activeThreadId = existing.id;
      saveThreads();
      renderBackoffice();
      showCrossPillarToast(
        'Tree Inquiry Logged in Back-Office',
        `${est.serviceTitle} • ${est.estimateRange}`
      );
    }

    // Quick Chips
    document.querySelectorAll('[data-ai-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-ai-chip');
        if (!q) return;
        appendChatBubble('user', q);
        const reply = getOakleyAiReply(q);
        setTimeout(() => {
          appendChatBubble('ai', reply);
          syncChatExchangeToBackoffice(q, reply);
        }, 350);
      });
    });

    // Chat Composer
    if (chatComposer && chatInput) {
      chatComposer.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';
        appendChatBubble('user', text);
        const reply = getOakleyAiReply(text);
        setTimeout(() => {
          appendChatBubble('ai', reply);
          syncChatExchangeToBackoffice(text, reply);
        }, 350);
      });
    }

    // Inline Lead Form Toggle
    if (toggleInlineLeadBtn && inlineLeadForm) {
      toggleInlineLeadBtn.addEventListener('click', () => {
        inlineLeadForm.hidden = !inlineLeadForm.hidden;
      });

      inlineLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(inlineLeadForm);
        const name = String(fd.get('name') || 'Homeowner');
        const phone = String(fd.get('phone') || '(830) 555-0199');
        const scope = String(fd.get('scope') || 'Tree trimming & canopy pruning');
        const est = buildDeterministicTreeEstimate(scope);

        if (liveChatThreadId) {
          const existing = threads.find((t) => t.id === liveChatThreadId);
          if (existing) {
            existing.name = name;
            existing.phone = phone;
            existing.service = est.serviceTitle;
            existing.estimate = est.estimateRange;
            existing.equipment = est.equipment;
            existing.notes = scope;
            existing.source = 'Oakley AI Chat Inline Capture';
            existing.messages.push({
              sender: 'system',
              time: 'Just now',
              text: `📋 Contact Details Locked In: ${name} (${phone}) • Scope: ${scope} • Estimate: ${est.estimateRange}`
            });
            activeThreadId = existing.id;
            saveThreads();
            renderBackoffice();
          } else {
            syncLeadToBackoffice({
              name,
              phone,
              location: 'Central Texas Service Area',
              service: est.serviceTitle,
              estimate: est.estimateRange,
              equipment: est.equipment,
              notes: scope,
              source: 'Oakley AI Chat Inline Capture'
            });
          }
        } else {
          syncLeadToBackoffice({
            name,
            phone,
            location: 'Central Texas Service Area',
            service: est.serviceTitle,
            estimate: est.estimateRange,
            equipment: est.equipment,
            notes: scope,
            source: 'Oakley AI Chat Inline Capture'
          });
        }

        inlineLeadForm.hidden = true;
        appendChatBubble(
          'ai',
          `✅ Got it, <strong>${name}</strong>! Your preliminary ballpark for <em>${est.serviceTitle}</em> is <strong>${est.estimateRange}</strong>. We just dispatched your written estimate via SMS to <strong>${phone}</strong> and created your ticket in the IronOak Command Room.`
        );
        showCrossPillarToast('AI Chat Lead Synced to Back-Office', `${name} • ${est.estimateRange}`);
      });
    }

    // Mode 2: Instant SMS Form
    if (smsForm) {
      smsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(smsForm);
        const name = String(fd.get('name') || 'Property Owner');
        const phone = String(fd.get('phone') || '(830) 555-0199');
        const service = String(fd.get('service') || 'Technical Crane Tree Removal');
        const notes = String(fd.get('notes') || '');
        const est = buildDeterministicTreeEstimate(service + ' ' + notes);

        const targetPhone = window.TiberiusTelephony
          ? window.TiberiusTelephony.getSmsDestination(phone)
          : phone;

        if (!IS_STATIC_ELEVENTY_DEV) {
          try {
            await fetch('/api/sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: targetPhone,
                name,
                trade: 'tree-service',
                message: `IronOak Tree Service (ISA #TX-4491A): Hi ${name}, your preliminary ballpark for ${service} is ${est.estimateRange}. Reply with a tree photo or preferred walkthrough time!`
              })
            });
          } catch (err) {
            // Local demo fallback
          }
        }

        syncLeadToBackoffice({
          name,
          phone,
          location: 'Comal / Bexar County, TX',
          service,
          estimate: est.estimateRange,
          equipment: est.equipment,
          notes,
          source: 'Instant SMS Quote Drawer'
        });

        const feedback = document.getElementById('aiSmsFeedback');
        if (feedback) {
          feedback.hidden = false;
          feedback.innerHTML = `✅ <strong>Written Ballpark Sent (${est.estimateRange})!</strong> Check your mobile (${phone}) or inspect the live thread in the Back-Office Room.`;
        }
        showCrossPillarToast('SMS Quote Dispatched & Logged', `${name} • ${est.estimateRange}`);
      });
    }

    // Mode 3: Arborist Callback Form
    if (callbackForm) {
      callbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(callbackForm);
        const name = String(fd.get('name') || 'Property Owner');
        const phone = String(fd.get('phone') || '(830) 555-0144');
        const windowTime = String(fd.get('window') || 'Immediate');
        const notes = String(fd.get('notes') || '');
        const est = buildDeterministicTreeEstimate(notes);

        if (!IS_STATIC_ELEVENTY_DEV) {
          try {
            await fetch('/api/retell', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                phone,
                trade: 'tree-service',
                window: windowTime,
                notes
              })
            });
          } catch (err) {
            // Local demo fallback
          }
        }

        syncLeadToBackoffice({
          name,
          phone,
          location: 'Central Texas Property',
          service: `ISA Arborist Callback (${windowTime})`,
          estimate: est.estimateRange,
          equipment: est.equipment,
          notes,
          source: 'ISA Arborist Callback Drawer'
        });

        const feedback = document.getElementById('aiCallbackFeedback');
        if (feedback) {
          feedback.hidden = false;
          feedback.innerHTML = `✅ <strong>ISA Arborist Callback Queued (${windowTime})!</strong> Lead Arborist Cody (#TX-4491A) has your scope notes.`;
        }
        showCrossPillarToast('Arborist Callback Ticket Created', `${name} • ${windowTime}`);
      });
    }

    // Expose opener for Estimate Result Modal
    window.openIronOakAiDrawer = openDrawer;
  }

  // =========================================================================
  // 8. PILLAR 2: 3-PANE BACK-OFFICE CONVERSATION ROOM
  // =========================================================================
  function syncLeadToBackoffice(leadInput) {
    const newThread = {
      id: 'tree-lead-' + Date.now(),
      name: leadInput.name || 'New Property Owner',
      phone: leadInput.phone || '(830) 555-0199',
      location: leadInput.location || 'New Braunfels, TX 78132',
      service: leadInput.service || 'Technical Tree Removal',
      estimate: leadInput.estimate || '$2,450 – $3,950',
      equipment: leadInput.equipment || '45-Ton Hydraulic Crane + AlturnaMATS®',
      oakWilt: 'Sterilized Saws + Immediate Asphaltic Wound Sealant',
      source: leadInput.source || 'Website Estimator',
      status: 'Action Required',
      handoverMode: 'manual',
      unread: true,
      notes: leadInput.notes || 'Customer requested tree service & equipment ballpark.',
      suggestedDraft: `Hi ${leadInput.name || 'there'} — ISA Arborist Cody with IronOak Tree Service (#TX-4491A) here. I reviewed your ${leadInput.service || 'tree'} request (ballpark ${leadInput.estimate || '$2,450–$3,950'}). We have a crew in your area tomorrow at 8:30 AM or 2:00 PM for a quick 15-minute walkthrough—which slot works best?`,
      messages: [
        {
          sender: 'system',
          time: 'Just now',
          text: `🔔 Live Lead Synced via ${leadInput.source || 'Website'} • ${leadInput.service} • Preliminary Range: ${leadInput.estimate}.`
        },
        {
          sender: 'ai',
          time: 'Just now',
          text: `Hi ${leadInput.name || 'there'}! Oakley AI from IronOak Tree Service here. We logged your project scope (${leadInput.notes || leadInput.service}) with a preliminary ballpark of ${leadInput.estimate}.`
        }
      ]
    };

    threads.unshift(newThread);
    activeThreadId = newThread.id;
    saveThreads();
    renderBackoffice();

    // Also persist to sessionStorage for /ai-conversation/ shared route
    try {
      sessionStorage.setItem(
        STORAGE_KEY_ACTIVE_LEAD,
        JSON.stringify({
          trade: 'tree-service',
          businessName: 'IronOak Tree Service & Land Clearing',
          phoneFormatted: '(830) 555-0148',
          name: newThread.name,
          phone: newThread.phone,
          zip: newThread.location,
          service: newThread.service,
          urgency: newThread.equipment,
          notes: newThread.notes,
          estimateRange: newThread.estimate
        })
      );
    } catch (err) {
      // ignore
    }
  }

  window.syncTreeLeadToBackoffice = syncLeadToBackoffice;

  function renderBackoffice() {
    const listEl = document.getElementById('boThreadList');
    const countLabel = document.getElementById('boQueueCountLabel');
    if (!listEl) return;

    const filtered = threads.filter((t) => {
      if (activeQueueFilter === 'all') return true;
      return t.status === activeQueueFilter;
    });

    if (countLabel) {
      countLabel.textContent = `${filtered.length} Open Thread${filtered.length === 1 ? '' : 's'}`;
    }

    listEl.innerHTML = filtered
      .map((t) => {
        const isActive = t.id === activeThreadId;
        const statusClass =
          t.status === 'Action Required'
            ? 'bo-badge-urgent'
            : t.status === 'AI Qualification'
            ? 'bo-badge-ai'
            : 'bo-badge-booked';
        return `
          <button type="button" class="bo-thread-item ${isActive ? 'active' : ''}" data-thread-id="${t.id}">
            <div class="bo-thread-top">
              <strong>${t.name}</strong>
              <span class="bo-thread-badge ${statusClass}">${t.status}</span>
            </div>
            <div class="bo-thread-service">${t.service}</div>
            <div class="bo-thread-bottom">
              <span>${t.estimate}</span>
              <span>${t.location.split('•')[0]}</span>
            </div>
          </button>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-thread-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeThreadId = btn.getAttribute('data-thread-id');
        const current = threads.find((t) => t.id === activeThreadId);
        if (current) current.unread = false;
        saveThreads();
        renderBackoffice();
      });
    });

    const active = threads.find((t) => t.id === activeThreadId) || threads[0];
    if (!active) return;

    // Pane 2 Header
    const nameEl = document.getElementById('boActiveLeadName');
    const metaEl = document.getElementById('boActiveLeadMeta');
    if (nameEl) nameEl.textContent = active.name;
    if (metaEl) metaEl.textContent = `${active.phone} • ${active.location} • ${active.service}`;

    // Handover buttons
    document.querySelectorAll('[data-handover-mode]').forEach((btn) => {
      const m = btn.getAttribute('data-handover-mode');
      btn.classList.toggle('active', m === (active.handoverMode || 'manual'));
    });

    // Timeline messages
    const msgWrap = document.getElementById('boTimelineMessages');
    if (msgWrap) {
      msgWrap.innerHTML = active.messages
        .map((m) => {
          const roleLabel =
            m.sender === 'customer'
              ? active.name
              : m.sender === 'ai'
              ? '🌲 Oakley AI'
              : m.sender === 'staff'
              ? '👷 ISA Arborist Dispatch'
              : '⚙️ System Event';
          return `
            <div class="bo-msg bo-msg-${m.sender}">
              <div class="bo-msg-meta">
                <strong>${roleLabel}</strong>
                <span>${m.time}</span>
              </div>
              <div class="bo-msg-bubble">${m.text}</div>
            </div>
          `;
        })
        .join('');
      msgWrap.scrollTop = msgWrap.scrollHeight;
    }

    // AI Draft Banner
    const draftBanner = document.getElementById('boAiDraftBanner');
    const draftTextarea = document.getElementById('boAiDraftTextarea');
    if (draftBanner && draftTextarea) {
      if (active.suggestedDraft && active.handoverMode !== 'autopilot') {
        draftBanner.hidden = false;
        draftTextarea.value = active.suggestedDraft;
      } else {
        draftBanner.hidden = true;
      }
    }

    // Pane 3 Brief
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setTxt('boBriefStatusBadge', active.status);
    setTxt('boBriefEstimate', active.estimate);
    setTxt('boBriefService', active.service);
    setTxt('boBriefEquipment', active.equipment);
    setTxt('boBriefOakWilt', active.oakWilt || 'Sterilized Saws + Immediate Wound Paint');
    setTxt('boBriefLocation', active.location);
    setTxt('boBriefSource', active.source);
    setTxt('boBriefNotes', active.notes);
  }

  function initBackofficeRoom() {
    const shell = document.getElementById('backofficeShell');
    const openBtn = document.getElementById('openBackofficeBtn');
    const closeBtn = document.getElementById('boCloseBtn');
    const simForm = document.getElementById('boSimulateSmsForm');
    const simInput = document.getElementById('boSimulateSmsInput');
    const composerForm = document.getElementById('boComposerForm');
    const composerInput = document.getElementById('boComposerInput');
    const approveDraftBtn = document.getElementById('boApproveDraftBtn');
    const dismissDraftBtn = document.getElementById('boDismissDraftBtn');
    const draftTextarea = document.getElementById('boAiDraftTextarea');

    function openBackoffice() {
      if (!shell) return;
      shell.hidden = false;
      shell.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      renderBackoffice();
    }

    function closeBackoffice() {
      if (!shell) return;
      shell.hidden = true;
      shell.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openBackoffice);
    document.querySelectorAll('[data-open-backoffice]').forEach((btn) => {
      if (btn !== openBtn) btn.addEventListener('click', openBackoffice);
    });
    if (closeBtn) closeBtn.addEventListener('click', closeBackoffice);

    // Keyboard shortcut Cmd/Ctrl + K or Escape
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (shell && shell.hidden) openBackoffice();
        else closeBackoffice();
      } else if (e.key === 'Escape') {
        if (shell && !shell.hidden) closeBackoffice();
      }
    });

    // Queue Filter Pills
    document.querySelectorAll('[data-bo-filter]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-bo-filter]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        activeQueueFilter = pill.getAttribute('data-bo-filter') || 'all';
        renderBackoffice();
      });
    });

    // 3-Mode Handover Toggle
    document.querySelectorAll('[data-handover-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        active.handoverMode = btn.getAttribute('data-handover-mode') || 'manual';
        if (active.handoverMode === 'autopilot') {
          active.status = 'AI Qualification';
        }
        saveThreads();
        renderBackoffice();
      });
    });

    // Simulate Inbound Customer SMS
    if (simForm && simInput) {
      simForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const text =
          simInput.value.trim() ||
          'Will your crane fit in a 12-foot driveway gate without cracking the concrete?';
        simInput.value = '';

        active.messages.push({
          sender: 'customer',
          time: 'Just now',
          text
        });

        const aiReply = getOakleyAiReply(text);

        if (active.handoverMode === 'autopilot') {
          active.status = 'AI Qualification';
          saveThreads();
          renderBackoffice();
          setTimeout(() => {
            active.messages.push({
              sender: 'ai',
              time: 'Just now',
              text: aiReply
            });
            saveThreads();
            renderBackoffice();
          }, 650);
        } else {
          // Manual or Draft Co-Pilot mode: flag Action Required & prepare draft
          active.status = 'Action Required';
          active.suggestedDraft = aiReply;
          saveThreads();
          renderBackoffice();
        }
      });
    }

    // Approve AI Suggested Draft
    if (approveDraftBtn && draftTextarea) {
      approveDraftBtn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const text = draftTextarea.value.trim();
        if (!text) return;
        active.messages.push({
          sender: 'staff',
          time: 'Just now',
          text
        });
        active.suggestedDraft = '';
        active.status = 'Walkthrough Booked';
        saveThreads();
        renderBackoffice();
      });
    }

    if (dismissDraftBtn) {
      dismissDraftBtn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        active.suggestedDraft = '';
        saveThreads();
        renderBackoffice();
      });
    }

    // Manual Outbound Composer
    if (composerForm && composerInput) {
      composerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const text = composerInput.value.trim();
        if (!text) return;
        composerInput.value = '';
        active.messages.push({
          sender: 'staff',
          time: 'Just now',
          text
        });
        active.status = 'AI Qualification';
        saveThreads();
        renderBackoffice();
      });
    }

    // 1-Click Cal.com Walkthrough Slot Dispatch
    document.querySelectorAll('[data-cal-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const slot = btn.getAttribute('data-cal-slot');
        active.messages.push({
          sender: 'staff',
          time: 'Just now',
          text: `📅 ISA Certified Arborist Walkthrough Dispatched: ${slot}. Reply YES to lock in this arrival window at ${active.location}.`
        });
        active.status = 'Walkthrough Booked';
        active.suggestedDraft = '';
        saveThreads();
        renderBackoffice();
      });
    });

    // Telephony Modal inside Back-Office
    const telOpenBtn = document.getElementById('boOpenTelephonyConfigBtn');
    const telModal = document.getElementById('telephonyConfigModal');
    const telCloseBtn = document.getElementById('telModalCloseBtn');
    const telForm = document.getElementById('telephonyConfigForm');
    const telInput = document.getElementById('telOverridePhone');

    if (telOpenBtn && telModal) {
      telOpenBtn.addEventListener('click', () => {
        if (telInput && window.TiberiusTelephony) {
          telInput.value = window.TiberiusTelephony.getOverridePhone() || '';
        }
        telModal.hidden = false;
        telModal.setAttribute('aria-hidden', 'false');
      });
    }
    if (telCloseBtn && telModal) {
      telCloseBtn.addEventListener('click', () => {
        telModal.hidden = true;
        telModal.setAttribute('aria-hidden', 'true');
      });
    }
    if (telForm && telModal) {
      telForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (telInput && window.TiberiusTelephony) {
          window.TiberiusTelephony.setOverridePhone(telInput.value.trim());
        }
        telModal.hidden = true;
        telModal.setAttribute('aria-hidden', 'true');
        showCrossPillarToast(
          'Live Demo Telephony Override Saved',
          telInput && telInput.value.trim()
            ? `Routing SMS to ${telInput.value.trim()}`
            : 'Using default demo SMS routing'
        );
      });
    }

    window.openIronOakBackoffice = openBackoffice;
    updateHeaderBadge();
    renderBackoffice();
  }

  // =========================================================================
  // 9. ESTIMATE MODAL ACTIONS, CROSS-PILLAR TOAST & FLOATING LAUNCHER
  // =========================================================================
  let toastTimer = null;
  function showCrossPillarToast(title, sub) {
    const toast = document.getElementById('crossPillarToast');
    const titleEl = document.getElementById('crossPillarToastTitle');
    const subEl = document.getElementById('crossPillarToastSub');
    if (!toast) return;
    if (titleEl && title) titleEl.textContent = title;
    if (subEl && sub) subEl.textContent = sub;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 5500);
  }

  function initModalsAndFloatingUi() {
    const estModal = document.getElementById('estimate-result-modal');
    const estClose = document.getElementById('estModalCloseBtn');
    const estOpenChat = document.getElementById('estModalOpenChatBtn');
    const estOpenBo = document.getElementById('estModalOpenBackofficeBtn');

    if (estClose && estModal) {
      estClose.addEventListener('click', () => {
        estModal.hidden = true;
        estModal.setAttribute('aria-hidden', 'true');
      });
    }
    if (estOpenChat && estModal) {
      estOpenChat.addEventListener('click', () => {
        estModal.hidden = true;
        estModal.setAttribute('aria-hidden', 'true');
        if (window.openIronOakAiDrawer) window.openIronOakAiDrawer('chat');
      });
    }
    if (estOpenBo && estModal) {
      estOpenBo.addEventListener('click', () => {
        estModal.hidden = true;
        estModal.setAttribute('aria-hidden', 'true');
        if (window.openIronOakBackoffice) window.openIronOakBackoffice();
      });
    }

    // Toast actions
    const toast = document.getElementById('crossPillarToast');
    const toastOpenBo = document.getElementById('toastOpenBackofficeBtn');
    const toastDismiss = document.getElementById('toastDismissBtn');
    if (toastOpenBo && toast) {
      toastOpenBo.addEventListener('click', () => {
        toast.hidden = true;
        if (window.openIronOakBackoffice) window.openIronOakBackoffice();
      });
    }
    if (toastDismiss && toast) {
      toastDismiss.addEventListener('click', () => {
        toast.hidden = true;
      });
    }
  }

  function reconcileActiveSessionLead() {
    let importedAny = false;
    try {
      const rawSession =
        sessionStorage.getItem(STORAGE_KEY_ACTIVE_LEAD) ||
        localStorage.getItem('tiberius_latest_lead');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed && (!parsed.trade || parsed.trade === 'tree-service')) {
          const svc = String(parsed.service || parsed.serviceType || 'Tree Trimming & Canopy Pruning');
          const alreadyExists = threads.some(
            (t) =>
              (parsed.id && t.id === parsed.id) ||
              (t.name === parsed.name && t.service === svc)
          );
          if (!alreadyExists) {
            const est = buildDeterministicTreeEstimate(svc + ' ' + (parsed.notes || ''));
            const newT = {
              id: parsed.id || 'tree-lead-' + Date.now(),
              name: parsed.name || 'Property Owner',
              phone: parsed.phone || '(830) 555-0199',
              location: parsed.zip || 'New Braunfels, TX 78132',
              service: svc,
              estimate: parsed.estimateRange || est.estimateRange,
              equipment: parsed.equipment || est.equipment,
              oakWilt: '100% Sterilized Blades + Immediate Latex Wound Sealant',
              source: 'Website Tree Inquiry',
              status: 'Action Required',
              handoverMode: 'manual',
              unread: true,
              notes: parsed.notes || `${svc} inquiry submitted (${parsed.urgency || 'Standard'})`,
              suggestedDraft: `Hi ${parsed.name || 'there'} — ISA Arborist Cody with IronOak Tree Service (#TX-4491A) here. I reviewed your ${svc} inquiry (${parsed.estimateRange || est.estimateRange}). We have an ISA crew in ${parsed.zip || 'New Braunfels'} tomorrow at 8:30 AM or 2:00 PM for a quick 15-minute walkthrough—which window works best?`,
              messages: Array.isArray(parsed.chatTranscript) && parsed.chatTranscript.length > 0
                ? parsed.chatTranscript
                : [
                    {
                      sender: 'system',
                      time: 'Just now',
                      text: `🔔 Tree Inquiry Synced • ${svc} • Preliminary Ballpark: ${parsed.estimateRange || est.estimateRange}.`
                    },
                    {
                      sender: 'ai',
                      time: 'Just now',
                      text: `Hi ${parsed.name || 'there'}! Oakley AI from IronOak Tree Service here. We logged your ${svc} scope with a preliminary ballpark of ${parsed.estimateRange || est.estimateRange}.`
                    }
                  ]
            };
            threads.unshift(newT);
            activeThreadId = newT.id;
            importedAny = true;
          }
        }
      }

      // Ensure the user's tree trimming inquiry appears at the top of the Back-Office queue
      if (!localStorage.getItem('tiberius_tree_trimming_synced_v2')) {
        const topIsTrimming =
          threads[0] && /trim|prune|pruning|canopy/i.test(threads[0].service + ' ' + threads[0].notes);
        if (!topIsTrimming) {
          const trimThread = {
            id: 'tree-trim-inquiry-' + Date.now(),
            name: 'Property Owner (Tree Trimming Inquiry)',
            phone: '(830) 555-0199',
            location: 'New Braunfels / Comal County, TX 78132',
            service: 'Tree Trimming & Structural Canopy Pruning',
            estimate: '$950 – $2,150',
            equipment: '75ft Tracked Spider Lift + Sterilized Saws + 18" Chipper',
            oakWilt: '100% Sterilized Blades + Immediate Latex Wound Sealant',
            source: 'Website Tree Trimming Inquiry',
            status: 'Action Required',
            handoverMode: 'manual',
            unread: true,
            notes: 'Tree trimming, canopy raising over roof/driveway, deadwood extraction, and immediate Texas Oak Wilt wound sealing.',
            suggestedDraft: 'Hi there — ISA Arborist Cody with IronOak Tree Service (#TX-4491A) here! I received your Tree Trimming & Canopy Pruning inquiry (ballpark $950 – $2,150 including sterilized saws, Oak Wilt wound sealing, and full brush haul-off). Would tomorrow at 8:30 AM or 2:00 PM work for a quick 15-minute walkthrough?',
            messages: [
              {
                sender: 'system',
                time: 'Just now',
                text: '🌿 Live Tree Trimming Inquiry Logged • ANSI A300 Canopy Pruning & Oak Wilt Sealing • Ballpark: $950 – $2,150.'
              },
              {
                sender: 'customer',
                time: 'Just now',
                text: 'I need an estimate for tree trimming and canopy pruning on our mature oaks.'
              },
              {
                sender: 'ai',
                time: 'Just now',
                text: 'Got it! For ANSI A300 structural tree trimming, deadwood removal, and 8–10ft roofline clearance with immediate Texas Oak Wilt wound painting, our typical turnkey range is $950 – $2,150 including full brush chipping and cleanup. I have flagged Lead ISA Arborist Cody (#TX-4491A) in our Dispatch Room!'
              }
            ]
          };
          threads.unshift(trimThread);
          activeThreadId = trimThread.id;
          importedAny = true;
        }
        localStorage.setItem('tiberius_tree_trimming_synced_v2', '1');
      }

      if (importedAny) {
        saveThreads();
        renderBackoffice();
      }
    } catch (err) {
      // ignore storage errors
    }
  }

  // Initialize everything on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.getElementById('heroBgVideo');
    if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.defaultMuted = true;
      heroVideo.loop = true;
      heroVideo.playsInline = true;
      heroVideo.play().catch(() => {});
    }
    initPhotoEstimator();
    initCapabilityLightbox();
    initTreeCalculator();
    initAiConciergeDrawer();
    initBackofficeRoom();
    initModalsAndFloatingUi();
    reconcileActiveSessionLead();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openBackoffice') === '1' && window.openIronOakBackoffice) {
      window.openIronOakBackoffice();
    }
  });

  window.addEventListener('pageshow', () => {
    threads = loadThreads();
    reconcileActiveSessionLead();
    renderBackoffice();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_THREADS || e.key === 'tiberius_latest_lead') {
      threads = loadThreads();
      reconcileActiveSessionLead();
      renderBackoffice();
    }
  });
})();
