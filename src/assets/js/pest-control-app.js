/**
 * Lone Star Shield Pest & Termite — Full AI Lead Capture & Back-Office Controller
 * Handles:
 *  1. Single-Card Bug/Damage Photo & Pest ID Estimator (createImageBitmap + TPCL #089412 engine)
 *  2. 6-Card Treatment Protocol Lightbox
 *  3. Interactive Pest & Termite Pricing Calculator
 *  4. 3-Mode Shield AI Pest Dispatch Concierge Drawer (Chat, Instant SMS Quote, Inspector Callback)
 *  5. 3-Pane Pest Back-Office Conversation Room (Manual Office Hours default, AI Autopilot, AI Draft Co-Pilot)
 */
(function () {
  'use strict';

  const STORAGE_KEY_THREADS = 'tiberius_pest_bo_threads_v1';
  const STORAGE_KEY_ACTIVE_LEAD = 'tiberius_active_lead';
  const IS_STATIC_ELEVENTY_DEV =
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port === '8080';

  // =========================================================================
  // 1. 6-CARD TPCL #089412 TREATMENT PROTOCOL DATA
  // =========================================================================
  const PEST_PROTOCOLS = {
    'scorpion-seal': {
      tag: 'MICRO-ENCAPSULATED SCORPION BARRIER • TPCL #089412',
      title: 'Scorpion & Spider Barrier Seal',
      price: '$149 Initial • $115/Qtr',
      chem: 'Demand® CS Micro-Cap + Delta Dust Weep-Hole Injection',
      desc: 'Striped bark scorpions flatten to the thickness of a credit card and enter Central Texas homes through brick weep holes and soffit gaps. Standard sprays fail because scorpions walk high on their claws; our micro-encapsulated barrier adheres to their exoskeleton on contact.',
      checklist: [
        'Waterproof Delta Dust® injection into every exterior brick/stone weep hole and plumbing chase',
        '10-foot foundation & limestone retaining-wall barrier with Demand® CS micro-capsules',
        '30-foot extension-pole eave, soffit, and wasp/spider web sweep',
        '100% Kid & Pet safe once dry (~30 minutes) + Unlimited Free Re-Treatments'
      ],
      defaultScope: 'Striped bark scorpions & spiders inside home (~2,400 sq ft) needing weep-hole dusting and perimeter barrier'
    },
    'termite-wdi': {
      tag: '$250,000 SUBTERRANEAN TERMITE DAMAGE WARRANTY',
      title: 'Termite Defense & Real Estate WDI Reports',
      price: '$95 WDI Report / $650 – $1,450 Barrier',
      chem: 'Termidor® HE Non-Repellent Trenching + Trelona® Bait Stations',
      desc: 'Central Texas slab foundations sit over high-activity subterranean termite soil. We apply non-repellent Termidor® HE around your slab perimeter and bath traps so foraging termites transfer the active ingredient back to destroy the queen and colony.',
      checklist: [
        'Full thermal moisture scan + slab expansion joint & bath-trap inspection',
        'Termidor® HE continuous liquid trench-and-treat barrier or Trelona® ATBS baiting',
        'Same-day Texas Official Wood Destroying Insect (WDI) reports for VA, FHA & conventional closings',
        'Backed by our transferable $250,000 Termite Re-Treatment & Repair Warranty'
      ],
      defaultScope: 'Subterranean termite mud tubes on slab foundation — need Termidor barrier quote & WDI inspection'
    },
    'rodent-exclusion': {
      tag: '100% CHEW-PROOF STEEL EXCLUSION + SANITIZATION',
      title: 'Rodent Exclusion & Attic Sanitization',
      price: '$395 – $1,250 Turnkey',
      chem: '1/4" Galvanized Hardware Cloth + Copper Mesh + Hospital Enzyme Fog',
      desc: 'Throwing poison into an attic leaves dead rodents smelling inside your drywall and never stops new roof rats from entering. We physically seal every roofline gap, trap active rodents, and neutralize pheromones so new rats cannot track the scent.',
      checklist: [
        'Full roof-return, gable vent, soffit gap, and AC line-set steel-mesh exclusion',
        'Mechanical snap-trapping & Tamper-Resistant exterior perimeter stations (safe around pets/wildlife)',
        'HEPA droppings removal + commercial enzyme attic misting to erase rodent pheromone trails',
        'Backed by a 1-Year Chew-Through & Re-Entry Exclusion Warranty'
      ],
      defaultScope: 'Roof rats / scratching in attic at night — need roofline steel-mesh exclusion, trapping & sanitization'
    },
    'roach-fireant': {
      tag: 'COLONY ERADICATION + SEASON-LONG YARD SHIELD',
      title: 'German Roach & Fire Ant Knockdown',
      price: '$129 – $179 Initial',
      chem: 'Alpine® WSG + Gentrol® IGR Gel + TopChoice® Yard Granular',
      desc: 'We eliminate interior German and American roach populations without requiring you to empty every kitchen cabinet, while neutralizing aggressive Texas fire ant mounds across your entire lawn.',
      checklist: [
        'Odorless Alpine® WSG crack-and-crevice treatment behind appliances and plumbing voids',
        'Gentrol® Insect Growth Regulator (IGR) to halt roach egg reproduction',
        'Precision protein/carbohydrate gel baiting inside cabinet hinges',
        'Full-lawn fire ant mound drench + broadcast granular barrier'
      ],
      defaultScope: 'German roaches in kitchen + fire ant mounds across backyard lawn needing full knockdown'
    },
    'mosquito-tick': {
      tag: 'BACKYARD MOSQUITO, FLEA & TICK SHIELD',
      title: 'Mosquito, Flea & Tick Yard Fogging',
      price: '$89 / Monthly Barrier (or $119 Single Event)',
      chem: 'OneGuard® Dual-Action Micro-Cap + IGR + In2Care® Traps',
      desc: 'Take back your patio, pool deck, and shaded live oak yard. Our high-pressure backpack misting coats the undersides of leaves where mosquitoes rest, paired with In2Care® stations that turn mosquitoes into larvicide carriers.',
      checklist: [
        'High-pressure misting of shaded shrubs, ivy beds, oak canopies, and fence lines',
        'Integrated Insect Growth Regulator (IGR) that stops flea, tick, and mosquito larvae from maturing',
        'Safe for dogs, cats, and kids 30 minutes after application',
        'Special single-visit outdoor wedding & backyard party knockdown packages available'
      ],
      defaultScope: 'Backyard mosquito, flea & tick barrier fogging for shaded patio and dog run'
    },
    'commercial-pest': {
      tag: 'HEALTH DEPARTMENT & THIRD-PARTY AUDIT READY',
      title: 'Commercial & Restaurant Pest Compliance',
      price: '$145 – $285 / Month',
      chem: 'Zero-Odor IPM Baiting + ILT Fly Lights + Barcode Station Logs',
      desc: 'Protect your Google rating and pass every Comal, Guadalupe, and Bexar County health inspection with zero stress. We service restaurants, medical offices, schools, and warehouses after-hours.',
      checklist: [
        'Floor-drain bio-foam enzyme treatment to eliminate drain flies and phorid flies',
        'Tamper-resistant exterior rodent stations with digital barcode scan logs',
        ' German roach, stored-product pest, and commercial kitchen grease-trap IPM',
        'Priority 2-hour emergency response if an employee ever spots pest activity'
      ],
      defaultScope: 'Commercial / restaurant monthly IPM pest, drain fly & rodent compliance program'
    }
  };

  // =========================================================================
  // 2. INITIAL BACK-OFFICE THREADS (LONE STAR SHIELD PERSONAS)
  // =========================================================================
  const DEFAULT_THREADS = [
    {
      id: 'pest-lead-201',
      name: 'Marcus Webb',
      phone: '(830) 555-0162',
      location: 'Veramendi • New Braunfels, TX 78132',
      service: 'Bark Scorpion Weep-Hole & Perimeter Seal',
      estimate: '$149 Initial • $115/Qtr',
      chem: 'Demand® CS Micro-Cap + Delta Dust Weep Holes',
      safety: 'Botanical Interior + 30-Min Yard Dry Time (Dog Safe)',
      source: 'Website Photo ID Estimator',
      status: 'Action Required',
      handoverMode: 'manual',
      unread: true,
      notes: '2,650 sq ft 2-story home backing up to greenbelt in Veramendi. Found 2 striped bark scorpions in upstairs bathroom. Has 2 golden retrievers.',
      suggestedDraft: 'Hi Marcus — Lead Tech Ryan with Lone Star Shield (TPCL #089412) here. I saw your Veramendi scorpion ticket ($149 initial / $115 qtr). Because you back up to the greenbelt, we dust every brick weep hole and apply Demand CS along the limestone fence. It is 100% safe for your 2 golden retrievers once dry (30 mins). Want our 2:00 PM slot today?',
      messages: [
        {
          sender: 'system',
          time: '11:02 AM',
          text: '📸 Photo ID Estimator Lead • Uploaded 1 bark scorpion photo • Veramendi 78132 (2,650 sq ft).'
        },
        {
          sender: 'ai',
          time: '11:02 AM',
          text: 'Hi Marcus! Shield AI from Lone Star Shield Pest & Termite here. We confirmed Centruroides vittatus (Striped Bark Scorpion) from your photo. Your locked-in rate for our Weep-Hole & 10ft Perimeter Seal is $149 initial ($115/qtr with free re-treats).'
        },
        {
          sender: 'customer',
          time: '11:05 AM',
          text: 'Sounds good. We have two golden retrievers that use the backyard—how long after you spray can they go outside?'
        }
      ]
    },
    {
      id: 'pest-lead-202',
      name: 'Brenda Villarreal, Realtor®',
      phone: '(830) 555-0139',
      location: 'Cordillera / Seguin, TX 78155',
      service: 'VA Closing WDI Report + Termidor Spot Barrier',
      estimate: '$95 WDI • $685 Termidor Trench',
      chem: 'Termidor® HE Non-Repellent Liquid Barrier',
      safety: 'Sub-Slab & Exterior Foundation Trench ($250K Warranty)',
      source: 'Shield AI Concierge Drawer',
      status: 'Action Required',
      handoverMode: 'draft',
      unread: true,
      notes: 'VA loan closing next Tuesday in Seguin (78155). Home inspector noted 2 mud tubes on garage stem wall. Needs official TX WDI report + Termidor treatment invoice.',
      suggestedDraft: 'Hi Brenda — we can have TPCL Certified Termite Inspector Nate at the Seguin listing tomorrow at 8:30 AM to complete the official TX WDI report ($95) and Termidor HE garage trench treatment ($685) with the transferable warranty certificate ready for title by 2 PM.',
      messages: [
        {
          sender: 'customer',
          time: '10:20 AM',
          text: 'Hi! I have a VA buyer closing next Tuesday in Seguin and the home inspector found two termite mud tubes on the garage slab. How fast can you do the WDI and treatment?'
        },
        {
          sender: 'ai',
          time: '10:20 AM',
          text: 'We handle rush real estate closings daily, Brenda! Our licensed TPCL termite specialist can perform the official Texas WDI inspection ($95) and same-visit Termidor® HE barrier treatment ($685) so title has the clean WDI + warranty certificate within 24 hours.'
        }
      ]
    },
    {
      id: 'pest-lead-203',
      name: 'David & Kimitzer Cho',
      phone: '(210) 555-0174',
      location: 'Stone Oak • San Antonio, TX 78258',
      service: 'Attic Roof Rat Steel-Mesh Exclusion (6 Entry Points)',
      estimate: '$650 – $890 Turnkey',
      chem: '1/4" Galvanized Steel Hardware Cloth + Enzyme Attic Mist',
      safety: 'Zero Attic Poison • Mechanical Trapping + 1-Yr Warranty',
      source: 'Interactive Pricing Calculator',
      status: 'AI Qualification',
      handoverMode: 'autopilot',
      unread: false,
      notes: 'Hearing scratching above master bedroom ceiling at 3 AM in Stone Oak. Mature oak limbs overhang roofline.',
      suggestedDraft: 'Hi David — our exclusion specialist can inspect your Stone Oak roofline tomorrow at 1:00 PM and seal all roof returns with chew-proof steel mesh.',
      messages: [
        {
          sender: 'system',
          time: '9:15 AM',
          text: '🧮 Calculator Lead • Roof Rats / Attic Exclusion • 3,100 sq ft • Stone Oak 78258.'
        },
        {
          sender: 'customer',
          time: '9:17 AM',
          text: 'Do you guys use poison in the attic? I do not want a rat dying inside our walls.'
        },
        {
          sender: 'ai',
          time: '9:17 AM',
          text: 'Never! We strictly avoid rodenticide baits inside attics so you never have odor issues in your walls. Instead, we seal every roof return and weep gap with chew-proof 1/4" galvanized steel mesh, use mechanical traps inside the attic to remove any trapped rats, and mist commercial enzyme sanitizer.'
        }
      ]
    },
    {
      id: 'pest-lead-204',
      name: 'Carlos & Elena Garza',
      phone: '(830) 555-0118',
      location: 'Cibolo / Schertz, TX 78108',
      service: 'Same-Day German Roach & Fire Ant Yard Knockdown',
      estimate: '$149 Initial • $109/Qtr',
      chem: 'Alpine® WSG + Gentrol® IGR + TopChoice® Fire Ant Granular',
      safety: 'No Cabinet Emptying Required • Kid & Pet Safe',
      source: 'PPC Hero Intake Card',
      status: 'Route Slot Booked',
      handoverMode: 'manual',
      unread: false,
      notes: '1,950 sq ft single-story home in Cibolo. Wants fire ant mounds in backyard knocked down before weekend birthday party.',
      suggestedDraft: 'Confirmed for Today 2:00 PM – 4:00 PM, Carlos! Tech Ryan will text you when he is 15 minutes out.',
      messages: [
        {
          sender: 'system',
          time: '8:30 AM',
          text: '📋 PPC Split Hero Lead • Roaches & Fire Ants • Cibolo 78108 • Emergency Today.'
        },
        {
          sender: 'staff',
          time: '8:35 AM',
          text: '🚐 Route Slot Dispatched: Today 2:00 PM – 4:00 PM (Same-Day Scorpion & Pest Route). Confirmed with homeowner.'
        }
      ]
    }
  ];

  let threads = loadThreads();
  let activeThreadId = threads[0] ? threads[0].id : null;
  let activeFilter = 'all';
  let currentPhotoUrl = null;

  function loadThreads() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_THREADS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      // ignore
    }
    return JSON.parse(JSON.stringify(DEFAULT_THREADS));
  }

  function saveThreads() {
    try {
      localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
    } catch (err) {
      // ignore
    }
    updateBadge();
  }

  function updateBadge() {
    const badge = document.getElementById('boUnreadBadge');
    if (!badge) return;
    const count = threads.filter((t) => t.unread || t.status === 'Action Required').length;
    badge.textContent = String(count || threads.length);
  }

  // =========================================================================
  // 3. DETERMINISTIC TPCL #089412 PEST AI ENGINE
  // =========================================================================
  function buildDeterministicPestEstimate(scopeText) {
    const lower = (scopeText || '').toLowerCase();
    const isTermite = /termite|mud tube|wdi|wood|swarmer|clos/.test(lower);
    const isRodent = /rat|rodent|mouse|mice|attic|scratch|exclusion|dropp/.test(lower);
    const isMosquito = /mosquito|flea|tick|fog|yard barrier|backyard/.test(lower) && !/scorpion|roach/.test(lower);
    const isRoachAnt = /roach|fire ant|ant|kitchen/.test(lower) && !/scorpion/.test(lower);

    if (isTermite) {
      return {
        estimateRange: '$95 WDI • $685 – $1,250 Barrier',
        serviceTitle: 'Termidor® HE Subterranean Termite Defense & WDI Report',
        chem: 'Termidor® HE Non-Repellent Trenching + Thermal Moisture Scan',
        timeline: 'Same-Day / Next-Morning TPCL Termite Inspector Available',
        summary: 'Subterranean termites in Central Texas travel through mud tubes from soil into slab expansion joints. We perform a thermal moisture scan, issue official Texas WDI documentation, and establish a continuous Termidor® HE colony-eliminating barrier.',
        lineItems: [
          { label: 'Licensed TPCL Thermal Scan & Official Texas WDI Inspection', range: '$95 ($0 w/ Barrier)' },
          { label: 'Termidor® HE Foundation Trench & Bath-Trap Treatment', range: '$685 – $1,250' },
          { label: 'Transferable $250,000 Termite Damage & Re-Treatment Warranty', range: 'Included ($0)' }
        ]
      };
    }

    if (isRodent) {
      return {
        estimateRange: '$450 – $950 Turnkey',
        serviceTitle: '100% Steel-Mesh Rodent Exclusion & Attic Sanitization',
        chem: '1/4" Galvanized Steel Hardware Cloth + Enzyme Pheromone Fog',
        timeline: 'Same-Day Attic Inspection • 1-Year Chew-Proof Warranty',
        summary: 'We never throw poison in your attic. Our exclusion team seals every roof return, gable vent, and AC chase with chew-proof galvanized steel mesh, removes active roof rats with mechanical traps, and sanitizes pheromone trails.',
        lineItems: [
          { label: 'Full Roofline, Soffit & Weep-Gap Steel-Mesh Sealing', range: '$325 – $650' },
          { label: 'Mechanical Attic Trapping & Exterior Tamper-Proof Stations', range: '$125 – $200' },
          { label: 'Attic Pheromone Sanitization & 1-Year Exclusion Warranty', range: 'Included ($0)' }
        ]
      };
    }

    if (isMosquito) {
      return {
        estimateRange: '$89 / Mo (or $119 Single Knockdown)',
        serviceTitle: 'Backyard Mosquito, Flea & Tick Dual-Action Barrier',
        chem: 'OneGuard® Micro-Cap + NyGuard® IGR + In2Care® Larvicide',
        timeline: 'Same-Day Yard Treatment • Safe for Dogs & Kids in 30 Mins',
        summary: 'We coat shaded foliage, oak canopies, and dog runs with a micro-encapsulated adulticide + Insect Growth Regulator (IGR) that knocks down biting mosquitoes, fleas, and ticks on contact and blocks larvae for 21–30 days.',
        lineItems: [
          { label: 'High-Pressure Foliage, Patio & Canopy Backpack Misting', range: '$89 – $119' },
          { label: 'Flea & Tick Yard Turf IGR Growth Regulator', range: 'Included ($0)' },
          { label: '21-Day Bite-Free Re-Spray Guarantee', range: 'Included ($0)' }
        ]
      };
    }

    if (isRoachAnt) {
      return {
        estimateRange: '$129 Initial • $109/Qtr',
        serviceTitle: 'German Roach IGR Eradication & Fire Ant Yard Knockdown',
        chem: 'Alpine® WSG + Gentrol® IGR Gel + TopChoice® Yard Granular',
        timeline: 'Same-Day Route Slot Open • No Cabinet Prep Needed',
        summary: 'Our odorless Alpine® WSG + Gentrol® IGR protocol eliminates German and American roaches deep inside kitchen hinges and plumbing voids without emptying your cabinets, plus full-yard fire ant mound neutralization.',
        lineItems: [
          { label: 'Interior Kitchen/Bath Alpine® WSG + Gentrol® IGR Gel Baiting', range: '$95 – $129' },
          { label: 'Full-Lawn Fire Ant Mound Drench & Granular Barrier', range: '$34 – $50' },
          { label: 'Unlimited Free Re-Treatments Between Scheduled Visits', range: 'Included ($0)' }
        ]
      };
    }

    // Default: Bark Scorpion & Spider Barrier Seal
    return {
      estimateRange: '$149 Initial • $115/Qtr',
      serviceTitle: 'Bark Scorpion Weep-Hole & 10ft Micro-Cap Perimeter Seal',
      chem: 'Demand® CS Micro-Cap + Delta Dust® Weep-Hole Injection',
      timeline: 'Same-Day Route Slot Available Today • 100% Kid & Pet Safe',
      summary: 'Designed specifically for Central Texas striped bark scorpions, black widows, and wolf spiders. We inject waterproof Delta Dust® into every exterior weep hole and lay a 10-foot Demand® CS micro-capsule barrier around your slab and eaves.',
      lineItems: [
        { label: '10ft Demand® CS Micro-Encapsulated Foundation & Patio Seal', range: '$115 – $149' },
        { label: 'Exterior Brick Weep-Hole Dusting & 30ft Eave Web Sweep', range: 'Included ($0)' },
        { label: 'Botanical Interior Baseboard Shield + 100% Free Re-Treats', range: 'Included ($0)' }
      ]
    };
  }

  // =========================================================================
  // 4. SINGLE-CARD PHOTO & PEST ID ESTIMATOR
  // =========================================================================
  function initPestPhotoEstimator() {
    const fileInput = document.getElementById('pestPhotoInput');
    const triggerBtn = document.getElementById('pestPhotoTriggerBtn');
    const previewWrap = document.getElementById('pestPhotoPreviewWrap');
    const previewImg = document.getElementById('pestPhotoPreviewImg');
    const previewName = document.getElementById('pestPhotoPreviewName');
    const removeBtn = document.getElementById('pestPhotoRemoveBtn');
    const scopeInput = document.getElementById('pestScopeInput');
    const phoneInput = document.getElementById('pestEstimatorPhone');
    const form = document.getElementById('pestPhotoEstimatorForm');
    const submitBtn = document.getElementById('pestEstimatorSubmitBtn');

    document.querySelectorAll('[data-pest-pill]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-pest-pill]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        if (scopeInput) {
          scopeInput.value = pill.getAttribute('data-pest-pill') || '';
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
        try {
          if (window.createImageBitmap) {
            const bmp = await window.createImageBitmap(file);
            const maxDim = 1280;
            let w = bmp.width;
            let h = bmp.height;
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
            canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
            currentPhotoUrl = canvas.toDataURL('image/jpeg', 0.82);
          } else {
            currentPhotoUrl = await new Promise((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result);
              r.readAsDataURL(file);
            });
          }

          if (previewImg && previewWrap && triggerBtn) {
            previewImg.src = currentPhotoUrl;
            if (previewName) previewName.textContent = file.name;
            previewWrap.hidden = false;
            triggerBtn.hidden = true;
          }
        } catch (err) {
          console.warn('Pest photo preview notice:', err);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        currentPhotoUrl = null;
        if (fileInput) fileInput.value = '';
        if (previewWrap) previewWrap.hidden = true;
        if (triggerBtn) triggerBtn.hidden = false;
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const scopeVal =
          (scopeInput && scopeInput.value.trim()) ||
          'Striped bark scorpions & spiders inside home (~2,400 sq ft)';
        const phoneVal = (phoneInput && phoneInput.value.trim()) || '(830) 555-0199';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Running TPCL Diagnostic...';
        }

        let est = buildDeterministicPestEstimate(scopeVal);

        if (!IS_STATIC_ELEVENTY_DEV) {
          try {
            const resp = await fetch('/api/ai-estimate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                trade: 'pest-control',
                businessName: 'Lone Star Shield Pest & Termite',
                scope: scopeVal,
                phone: phoneVal,
                hasPhoto: Boolean(currentPhotoUrl)
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.estimateRange) {
                est = {
                  estimateRange: data.estimateRange,
                  serviceTitle: data.serviceTitle || est.serviceTitle,
                  chem: data.equipment || est.chem,
                  timeline: data.timeline || est.timeline,
                  summary: data.summary || est.summary,
                  lineItems: Array.isArray(data.lineItems) && data.lineItems.length ? data.lineItems : est.lineItems
                };
              }
            }
          } catch (err) {
            // use deterministic fallback
          }
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Get Instant Pest Quote →';
        }

        syncPestLeadToBackoffice({
          name: 'Homeowner (' + phoneVal.slice(-4) + ')',
          phone: phoneVal,
          location: 'Comal / Guadalupe / Bexar County, TX',
          service: est.serviceTitle,
          estimate: est.estimateRange,
          chem: est.chem,
          notes: scopeVal,
          source: currentPhotoUrl ? 'Photo ID Estimator (Photo Attached)' : 'Instant Pest Scope Estimator'
        });

        openPestEstimateModal({
          ...est,
          hasPhoto: Boolean(currentPhotoUrl),
          photoUrl: currentPhotoUrl
        });

        showPestToast(
          'Pest Diagnostic Logged in Back-Office',
          est.estimateRange + ' • ' + est.serviceTitle
        );
      });
    }
  }

  function openPestEstimateModal(est) {
    const modal = document.getElementById('pest-estimate-modal');
    if (!modal) return;
    document.getElementById('pestEstRange').textContent = est.estimateRange;
    document.getElementById('pestEstTimeline').textContent = est.timeline;
    document.getElementById('pestEstSummary').textContent = est.summary;

    const badge = document.getElementById('pestEstPhotoBadge');
    const img = document.getElementById('pestEstPhotoImg');
    if (badge && img) {
      if (est.hasPhoto && est.photoUrl) {
        img.src = est.photoUrl;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    const listEl = document.getElementById('pestEstLineItems');
    if (listEl && Array.isArray(est.lineItems)) {
      listEl.innerHTML = est.lineItems
        .map(
          (i) => `
          <div class="pest-est-row">
            <span>${i.label}</span>
            <strong>${i.range}</strong>
          </div>
        `
        )
        .join('');
    }

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
  }

  // =========================================================================
  // 5. 6-CARD TREATMENT PROTOCOL LIGHTBOX
  // =========================================================================
  function initPestCapabilityLightbox() {
    const modal = document.getElementById('pest-capability-lightbox');
    const closeBtn = document.getElementById('pestCapCloseBtn');
    const selectBtn = document.getElementById('pestCapSelectBtn');
    let activeSpec = null;

    document.querySelectorAll('[data-pest-cap]').forEach((card) => {
      const openCard = () => {
        const key = card.getAttribute('data-pest-cap');
        const spec = PEST_PROTOCOLS[key];
        if (!spec || !modal) return;
        activeSpec = spec;

        document.getElementById('pestCapTag').textContent = spec.tag;
        document.getElementById('pestCapTitle').textContent = spec.title;
        document.getElementById('pestCapPrice').textContent = spec.price;
        document.getElementById('pestCapChem').textContent = spec.chem;
        document.getElementById('pestCapDesc').textContent = spec.desc;

        const ul = document.getElementById('pestCapChecklist');
        if (ul) {
          ul.innerHTML = spec.checklist.map((item) => `<li>✓ ${item}</li>`).join('');
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

    if (selectBtn && modal) {
      selectBtn.addEventListener('click', () => {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        if (activeSpec) {
          syncPestLeadToBackoffice({
            name: 'Website Visitor (Protocol Inquiry)',
            phone: '(830) 555-0199',
            location: 'Comal / Bexar County, TX',
            service: activeSpec.title,
            estimate: activeSpec.price,
            chem: activeSpec.chem,
            notes: activeSpec.defaultScope,
            source: 'TPCL Protocol Lightbox'
          });
          showPestToast('Protocol Inquiry Logged in Back-Office', `${activeSpec.title} • ${activeSpec.price}`);
        }
        const scopeInput = document.getElementById('pestScopeInput');
        const section = document.getElementById('pest-photo-estimator');
        if (scopeInput && activeSpec) {
          scopeInput.value = activeSpec.defaultScope;
        }
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const phone = document.getElementById('pestEstimatorPhone');
            if (phone) phone.focus();
          }, 400);
        }
      });
    }
  }

  // =========================================================================
  // 6. INTERACTIVE PEST & TERMITE PRICING CALCULATOR
  // =========================================================================
  function initPestCalculator() {
    let target = 'scorpions';
    let size = 'medium';
    let plan = 'quarterly';

    const fireAntCheck = document.getElementById('pestCalcFireAntCheck');
    const priceEl = document.getElementById('pestCalcPriceDisplay');
    const summaryEl = document.getElementById('pestCalcSummaryText');
    const chemEl = document.getElementById('pestCalcChemSpec');
    const safeEl = document.getElementById('pestCalcSafeSpec');
    const warrantyEl = document.getElementById('pestCalcWarrantySpec');
    const lockBtn = document.getElementById('pestCalcLockBtn');

    function recalculate() {
      const addFireAnt = fireAntCheck ? fireAntCheck.checked : true;
      let initPrice = 129;
      let qtrPrice = 109;
      let chem = 'Demand® CS Micro-Cap Perimeter + Botanical Interior Crack/Crevice';
      let safe = '100% Safe Once Dry (~30 Minutes) • Zero Harsh Odors';
      let warranty = 'Unlimited Free Re-Seals • Same-Day Dispatch Available';
      let label = 'Scorpion & General Pest Barrier';

      if (target === 'scorpions') {
        if (size === 'small') { initPrice = 119; qtrPrice = 99; }
        else if (size === 'medium') { initPrice = 135; qtrPrice = 115; }
        else { initPrice = 165; qtrPrice = 135; }
        if (addFireAnt) initPrice += 25;
      } else if (target === 'termites') {
        label = 'Termidor® HE Subterranean Termite Defense + WDI';
        chem = 'Termidor® HE Non-Repellent Trenching + Thermal Moisture Scan';
        safe = 'Exterior Sub-Slab Trenching • Zero Indoor Fumes';
        warranty = '$250,000 Transferable Termite Repair & Re-Treat Warranty';
        if (size === 'small') { initPrice = 650; qtrPrice = 195; }
        else if (size === 'medium') { initPrice = 850; qtrPrice = 225; }
        else { initPrice = 1190; qtrPrice = 265; }
      } else if (target === 'rodents') {
        label = 'Steel-Mesh Roofline Rodent Exclusion & Sanitization';
        chem = '1/4" Galvanized Steel Hardware Cloth + Enzyme Attic Mist';
        safe = 'Zero Attic Poison • Tamper-Proof Mechanical Trapping';
        warranty = '1-Year Chew-Proof Exclusion Warranty + Free Follow-Up';
        if (size === 'small') { initPrice = 395; qtrPrice = 99; }
        else if (size === 'medium') { initPrice = 585; qtrPrice = 115; }
        else { initPrice = 845; qtrPrice = 135; }
      } else if (target === 'mosquito') {
        label = 'Backyard Mosquito, Flea & Tick Barrier Fogging';
        chem = 'OneGuard® Micro-Cap + NyGuard® IGR + In2Care® Stations';
        safe = 'Dog, Cat & Kid Safe 30 Mins After Foliage Misting';
        warranty = '21-Day Bite-Free Backyard Re-Spray Guarantee';
        if (size === 'small') { initPrice = 79; qtrPrice = 79; }
        else if (size === 'medium') { initPrice = 89; qtrPrice = 89; }
        else { initPrice = 119; qtrPrice = 115; }
      }

      let priceDisplay = `$${initPrice} Initial • $${qtrPrice}/Qtr`;
      if (target === 'termites') {
        priceDisplay = `$${initPrice} Turnkey Barrier ($95 WDI Only)`;
      } else if (target === 'rodents') {
        priceDisplay = `$${initPrice} Turnkey Exclusion`;
      } else if (plan === 'onetime') {
        priceDisplay = `$${initPrice + 40} One-Time Knockdown (30-Day Guarantee)`;
      } else if (plan === 'bundle') {
        priceDisplay = `$${initPrice + 65} Initial • $149/Qtr Total Bundle`;
      }

      if (priceEl) priceEl.textContent = priceDisplay;

      const sizeText =
        size === 'small'
          ? 'Under 2,000 sq ft Home'
          : size === 'medium'
          ? '2,000–3,500 sq ft Home'
          : '3,500+ sq ft / Acreage Property';

      if (summaryEl) {
        summaryEl.textContent = `${sizeText} • ${label}${
          addFireAnt ? ' + Yard Fire Ant Mound Granular' : ''
        }`;
      }
      if (chemEl) chemEl.textContent = chem;
      if (safeEl) safeEl.textContent = safe;
      if (warrantyEl) warrantyEl.textContent = warranty;
    }

    function bindGroup(id, attr, setter) {
      const group = document.getElementById(id);
      if (!group) return;
      group.querySelectorAll(`[${attr}]`).forEach((btn) => {
        btn.addEventListener('click', () => {
          group.querySelectorAll(`[${attr}]`).forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          setter(btn.getAttribute(attr));
          recalculate();
        });
      });
    }

    bindGroup('pestCalcTargetGroup', 'data-pest-target', (v) => { target = v; });
    bindGroup('pestCalcSizeGroup', 'data-pest-size', (v) => { size = v; });
    bindGroup('pestCalcPlanGroup', 'data-pest-plan', (v) => { plan = v; });
    if (fireAntCheck) fireAntCheck.addEventListener('change', recalculate);

    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        const sumText = summaryEl ? summaryEl.textContent.trim() : 'Pest Control Plan';
        const prText = priceEl ? priceEl.textContent.trim() : '$149 Initial';
        const chText = chemEl ? chemEl.textContent.trim() : 'Demand® CS Micro-Cap Perimeter';
        syncPestLeadToBackoffice({
          name: 'Homeowner (Calculator Inquiry)',
          phone: '(830) 555-0199',
          location: 'Comal / Bexar County, TX',
          service: sumText.split('•')[1] ? sumText.split('•')[1].trim() : 'Pest & Termite Barrier Plan',
          estimate: prText,
          chem: chText,
          notes: sumText,
          source: 'Interactive Pest & Termite Calculator'
        });
        showPestToast('Calculator Inquiry Logged in Back-Office', `${prText}`);

        const scopeInput = document.getElementById('pestScopeInput');
        const section = document.getElementById('pest-photo-estimator');
        if (scopeInput && summaryEl && priceEl) {
          scopeInput.value = `${summaryEl.textContent.trim()} (${priceEl.textContent.trim()})`;
        }
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const phone = document.getElementById('pestEstimatorPhone');
            if (phone) phone.focus();
          }, 400);
        }
      });
    }

    recalculate();
  }

  // =========================================================================
  // 7. 3-MODE SHIELD AI CONCIERGE DRAWER
  // =========================================================================
  function getShieldAiReply(qText) {
    const q = (qText || '').toLowerCase();
    if (/dog|pet|kid|child|baby|safe|dry/.test(q)) {
      return '100% Kid & Pet Safe! Inside your home we use targeted botanical and crack-and-crevice gel applications behind appliances and weep holes where paws and hands never reach. Outside, our Demand® CS barrier dries in 30 minutes—once dry, dogs and kids can play on the lawn and patio immediately.';
    }
    if (/scorpion|spider|price|cost|how much/.test(q)) {
      return 'Our Bark Scorpion & Spider Barrier Seal starts at $129–$149 for the initial knockdown ($115/quarter with unlimited free re-treatments). We inject waterproof Delta Dust® into every brick weep hole, sweep eaves up to 30 feet, and apply a 10-foot micro-encapsulated perimeter barrier.';
    }
    if (/termite|wdi|mud tube|closing|va|fha/.test(q)) {
      return 'We perform same-day Texas Official WDI (Wood Destroying Insect) inspections for $95 and deliver VA/FHA-compliant reports within hours. If active subterranean termites are present, our Termidor® HE barrier treatments start at $650 and include a transferable $250,000 damage warranty.';
    }
    if (/rat|rodent|mouse|attic|scratch|exclusion/.test(q)) {
      return 'We never just toss poison in your attic! Our Rodent Exclusion crew seals every roof return, soffit gap, and AC line chase with chew-proof 1/4" galvanized steel hardware cloth ($395–$950 turnkey), traps active roof rats mechanically, and mists enzyme sanitizer backed by a 1-year warranty.';
    }
    return 'I can lock in your upfront price for bark scorpions, subterranean termites/WDI reports, attic rodent exclusion, German roaches, or mosquito yard barriers across New Braunfels, San Marcos, Seguin, and San Antonio. What pest activity are you seeing, and roughly how many square feet is the property?';
  }

  function initPestAiDrawer() {
    const backdrop = document.getElementById('pestAiBackdrop');
    const closeBtn = document.getElementById('pestAiCloseBtn');
    const msgBox = document.getElementById('pestChatMessages');
    const composer = document.getElementById('pestChatComposer');
    const chatInput = document.getElementById('pestChatInput');
    const toggleLeadBtn = document.getElementById('pestToggleInlineLeadBtn');
    const inlineLeadForm = document.getElementById('pestChatLeadForm');
    const smsForm = document.getElementById('pestAiSmsForm');
    const callbackForm = document.getElementById('pestAiCallbackForm');

    function appendBubble(role, html) {
      if (!msgBox) return;
      const div = document.createElement('div');
      div.className = `pest-msg pest-msg-${role}`;
      div.innerHTML = `<div class="pest-bubble">${html}</div>`;
      msgBox.appendChild(div);
      msgBox.scrollTop = msgBox.scrollHeight;
    }

    if (msgBox && msgBox.children.length === 0) {
      appendBubble(
        'ai',
        'Howdy! I’m <strong>Shield AI</strong> at Lone Star Shield Pest & Termite (TPCL #089412). Ask me about bark scorpion weep-hole seals, kid/pet safety, WDI termite reports, or attic rat exclusion—or lock in a same-day route slot!'
      );
    }

    function switchTab(mode) {
      document.querySelectorAll('[data-pest-mode]').forEach((t) => {
        const active = t.getAttribute('data-pest-mode') === mode;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.getElementById('pestPanelChat').hidden = mode !== 'chat';
      document.getElementById('pestPanelSms').hidden = mode !== 'sms';
      document.getElementById('pestPanelCallback').hidden = mode !== 'callback';
    }

    function openDrawer(mode) {
      if (!backdrop) return;
      backdrop.hidden = false;
      backdrop.setAttribute('aria-hidden', 'false');
      switchTab(mode || 'chat');
    }

    function closeDrawer() {
      if (!backdrop) return;
      backdrop.hidden = true;
      backdrop.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('[data-open-pest-ai]').forEach((btn) => {
      btn.addEventListener('click', () => openDrawer(btn.getAttribute('data-open-pest-ai') || 'chat'));
    });

    document.querySelectorAll('[data-pest-mode]').forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.getAttribute('data-pest-mode')));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeDrawer();
      });
    }

    let livePestChatId = null;
    function syncPestChatToBo(userText, aiText) {
      const est = buildDeterministicPestEstimate(userText);
      let cur = livePestChatId ? threads.find((t) => t.id === livePestChatId) : null;
      if (!cur) {
        livePestChatId = 'pest-chat-' + Date.now();
        cur = {
          id: livePestChatId,
          name: 'Website Homeowner (Live Chat)',
          phone: 'Pending / In Chat',
          location: 'Comal / Bexar County, TX',
          service: est.serviceTitle,
          estimate: est.estimateRange,
          chem: est.chem,
          safety: 'Botanical Interior + 30-Min Yard Dry Time (100% Kid/Pet Safe)',
          source: 'Shield AI Live Chat',
          status: 'Action Required',
          handoverMode: 'manual',
          unread: true,
          notes: userText,
          suggestedDraft: `Hi there — Lead Tech Ryan with Lone Star Shield Pest & Termite (TPCL #089412) here. Following up on your chat inquiry about ${est.serviceTitle} (${est.estimateRange}). We have an open route slot today at 2:00 PM or tomorrow at 8:30 AM!`,
          messages: [
            { sender: 'system', time: 'Just now', text: `💬 Shield AI Live Chat • ${est.serviceTitle} (${est.estimateRange})` },
            { sender: 'customer', time: 'Just now', text: userText },
            { sender: 'ai', time: 'Just now', text: aiText }
          ]
        };
        threads.unshift(cur);
      } else {
        cur.service = est.serviceTitle;
        cur.estimate = est.estimateRange;
        cur.chem = est.chem;
        cur.notes = userText;
        cur.status = 'Action Required';
        cur.unread = true;
        cur.messages.push(
          { sender: 'customer', time: 'Just now', text: userText },
          { sender: 'ai', time: 'Just now', text: aiText }
        );
      }
      activeThreadId = cur.id;
      saveThreads();
      renderPestBackoffice();
      showPestToast('Pest Inquiry Logged in Back-Office', `${est.serviceTitle} • ${est.estimateRange}`);
    }

    document.querySelectorAll('[data-pest-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-pest-chip');
        if (!q) return;
        appendBubble('user', q);
        const reply = getShieldAiReply(q);
        setTimeout(() => {
          appendBubble('ai', reply);
          syncPestChatToBo(q, reply);
        }, 300);
      });
    });

    if (composer && chatInput) {
      composer.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';
        appendBubble('user', text);
        const reply = getShieldAiReply(text);
        setTimeout(() => {
          appendBubble('ai', reply);
          syncPestChatToBo(text, reply);
        }, 300);
      });
    }

    if (toggleLeadBtn && inlineLeadForm) {
      toggleLeadBtn.addEventListener('click', () => {
        inlineLeadForm.hidden = !inlineLeadForm.hidden;
      });
      inlineLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(inlineLeadForm);
        const name = String(fd.get('name') || 'Homeowner');
        const phone = String(fd.get('phone') || '(830) 555-0199');
        const scope = String(fd.get('scope') || 'Bark Scorpion & Spider Seal');
        const est = buildDeterministicPestEstimate(scope);

        syncPestLeadToBackoffice({
          name,
          phone,
          location: 'Comal / Bexar County, TX',
          service: est.serviceTitle,
          estimate: est.estimateRange,
          chem: est.chem,
          notes: scope,
          source: 'Shield AI Chat Inline Capture'
        });

        inlineLeadForm.hidden = true;
        appendBubble(
          'ai',
          `✅ Locked in, <strong>${name}</strong>! Your upfront quote for <em>${est.serviceTitle}</em> is <strong>${est.estimateRange}</strong>. We just texted your written confirmation to <strong>${phone}</strong> and alerted our route dispatcher.`
        );
        showPestToast('AI Chat Lead Synced to Back-Office', `${name} • ${est.estimateRange}`);
      });
    }

    if (smsForm) {
      smsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(smsForm);
        const name = String(fd.get('name') || 'Homeowner');
        const phone = String(fd.get('phone') || '(830) 555-0199');
        const service = String(fd.get('service') || 'Scorpion & Spider Barrier Seal');
        const notes = String(fd.get('notes') || '');
        const est = buildDeterministicPestEstimate(service + ' ' + notes);

        if (!IS_STATIC_ELEVENTY_DEV) {
          try {
            await fetch('/api/sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: phone,
                name,
                trade: 'pest-control',
                message: `Lone Star Shield Pest & Termite (TPCL #089412): Hi ${name}, your upfront quote for ${service} is ${est.estimateRange}. Reply YES to claim today's 2 PM route slot!`
              })
            });
          } catch (err) {
            // fallback
          }
        }

        syncPestLeadToBackoffice({
          name,
          phone,
          location: 'New Braunfels / San Antonio Area',
          service,
          estimate: est.estimateRange,
          chem: est.chem,
          notes,
          source: 'Instant SMS Quote Drawer'
        });

        const fb = document.getElementById('pestSmsFeedback');
        if (fb) {
          fb.hidden = false;
          fb.innerHTML = `✅ <strong>Written Quote Dispatched (${est.estimateRange})!</strong> Check your mobile (${phone}) or inspect the live ticket in the Back-Office Room.`;
        }
        showPestToast('SMS Pest Quote Dispatched', `${name} • ${est.estimateRange}`);
      });
    }

    if (callbackForm) {
      callbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(callbackForm);
        const name = String(fd.get('name') || 'Homeowner');
        const phone = String(fd.get('phone') || '(830) 555-0192');
        const windowTime = String(fd.get('window') || 'Immediate');
        const notes = String(fd.get('notes') || '');
        const est = buildDeterministicPestEstimate(notes);

        if (!IS_STATIC_ELEVENTY_DEV) {
          try {
            await fetch('/api/retell', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, phone, trade: 'pest-control', window: windowTime, notes })
            });
          } catch (err) {
            // fallback
          }
        }

        syncPestLeadToBackoffice({
          name,
          phone,
          location: 'Central Texas Service Area',
          service: `TPCL Inspector Callback (${windowTime})`,
          estimate: est.estimateRange,
          chem: est.chem,
          notes,
          source: 'TPCL Inspector Callback Drawer'
        });

        const fb = document.getElementById('pestCallbackFeedback');
        if (fb) {
          fb.hidden = false;
          fb.innerHTML = `✅ <strong>TPCL Inspector Callback Queued (${windowTime})!</strong> Lead Specialist Ryan (#TPCL-089412) has your property notes.`;
        }
        showPestToast('Inspector Callback Ticket Logged', `${name} • ${windowTime}`);
      });
    }

    window.openPestAiDrawer = openDrawer;
  }

  // =========================================================================
  // 8. PILLAR 2: 3-PANE PEST BACK-OFFICE CONVERSATION ROOM
  // =========================================================================
  function syncPestLeadToBackoffice(input) {
    const newThread = {
      id: 'pest-lead-' + Date.now(),
      name: input.name || 'New Homeowner',
      phone: input.phone || '(830) 555-0199',
      location: input.location || 'New Braunfels, TX 78130',
      service: input.service || 'Scorpion & Spider Barrier Seal',
      estimate: input.estimate || '$149 Initial • $115/Qtr',
      chem: input.chem || 'Demand® CS Micro-Cap + Delta Dust Weep Holes',
      safety: 'Botanical Interior + 30-Min Yard Dry Time (100% Kid/Pet Safe)',
      source: input.source || 'Website Estimator',
      status: 'Action Required',
      handoverMode: 'manual',
      unread: true,
      notes: input.notes || 'Requested same-day pest control pricing and availability.',
      suggestedDraft: `Hi ${input.name || 'there'} — Lead Tech Ryan with Lone Star Shield Pest & Termite (TPCL #089412) here. I reviewed your ${input.service || 'pest'} request (${input.estimate || '$149 initial'}). Our route truck has an open arrival window today from 2:00 PM – 4:00 PM or tomorrow at 8:30 AM. Which slot works best for you?`,
      messages: [
        {
          sender: 'system',
          time: 'Just now',
          text: `🔔 Live Ticket Synced via ${input.source || 'Website'} • ${input.service} • Upfront Quote: ${input.estimate}.`
        },
        {
          sender: 'ai',
          time: 'Just now',
          text: `Hi ${input.name || 'there'}! Shield AI from Lone Star Shield Pest & Termite here. We logged your ${input.service} scope (${input.notes || 'Standard'}) at ${input.estimate} with 100% free re-treatments.`
        }
      ]
    };

    threads.unshift(newThread);
    activeThreadId = newThread.id;
    saveThreads();
    renderPestBackoffice();

    try {
      sessionStorage.setItem(
        STORAGE_KEY_ACTIVE_LEAD,
        JSON.stringify({
          trade: 'pest-control',
          businessName: 'Lone Star Shield Pest & Termite',
          phoneFormatted: '(830) 555-0192',
          name: newThread.name,
          phone: newThread.phone,
          zip: newThread.location,
          service: newThread.service,
          serviceType: newThread.service,
          urgency: 'Same-Day Dispatch',
          notes: newThread.notes
        })
      );
    } catch (err) {
      // ignore
    }
  }

  window.syncPestLeadToBackoffice = syncPestLeadToBackoffice;

  function renderPestBackoffice() {
    const listEl = document.getElementById('pboThreadList');
    const countEl = document.getElementById('pboQueueCount');
    if (!listEl) return;

    const filtered = threads.filter((t) => {
      if (activeFilter === 'all') return true;
      return t.status === activeFilter;
    });

    if (countEl) {
      countEl.textContent = `${filtered.length} Open Thread${filtered.length === 1 ? '' : 's'}`;
    }

    listEl.innerHTML = filtered
      .map((t) => {
        const isActive = t.id === activeThreadId;
        const badgeClass =
          t.status === 'Action Required'
            ? 'pbo-badge-urgent'
            : t.status === 'AI Qualification'
            ? 'pbo-badge-ai'
            : 'pbo-badge-booked';
        return `
          <button type="button" class="pbo-thread-item ${isActive ? 'active' : ''}" data-pbo-id="${t.id}">
            <div class="pbo-thread-top">
              <strong>${t.name}</strong>
              <span class="pbo-badge ${badgeClass}">${t.status}</span>
            </div>
            <div class="pbo-thread-service">${t.service}</div>
            <div class="pbo-thread-bottom">
              <span>${t.estimate}</span>
              <span>${t.location.split('•')[0]}</span>
            </div>
          </button>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-pbo-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeThreadId = btn.getAttribute('data-pbo-id');
        const cur = threads.find((t) => t.id === activeThreadId);
        if (cur) cur.unread = false;
        saveThreads();
        renderPestBackoffice();
      });
    });

    const active = threads.find((t) => t.id === activeThreadId) || threads[0];
    if (!active) return;

    document.getElementById('pboActiveName').textContent = active.name;
    document.getElementById('pboActiveMeta').textContent = `${active.phone} • ${active.location} • ${active.service}`;

    document.querySelectorAll('[data-pbo-mode]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-pbo-mode') === (active.handoverMode || 'manual'));
    });

    const msgEl = document.getElementById('pboTimelineMessages');
    if (msgEl) {
      msgEl.innerHTML = active.messages
        .map((m) => {
          const senderName =
            m.sender === 'customer'
              ? active.name
              : m.sender === 'ai'
              ? '🛡️ Shield AI'
              : m.sender === 'staff'
              ? '👷 TPCL Lead Tech'
              : '⚙️ System Event';
          return `
            <div class="pbo-msg pbo-msg-${m.sender}">
              <div class="pbo-msg-meta">
                <strong>${senderName}</strong>
                <span>${m.time}</span>
              </div>
              <div class="pbo-msg-bubble">${m.text}</div>
            </div>
          `;
        })
        .join('');
      msgEl.scrollTop = msgEl.scrollHeight;
    }

    const draftBanner = document.getElementById('pboDraftBanner');
    const draftTextarea = document.getElementById('pboDraftTextarea');
    if (draftBanner && draftTextarea) {
      if (active.suggestedDraft && active.handoverMode !== 'autopilot') {
        draftBanner.hidden = false;
        draftTextarea.value = active.suggestedDraft;
      } else {
        draftBanner.hidden = true;
      }
    }

    const setTxt = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    setTxt('pboBriefBadge', active.status);
    setTxt('pboBriefPrice', active.estimate);
    setTxt('pboBriefService', active.service);
    setTxt('pboBriefChem', active.chem);
    setTxt('pboBriefSafety', active.safety || 'Botanical Interior + 30-Min Yard Dry Time');
    setTxt('pboBriefLocation', active.location);
    setTxt('pboBriefSource', active.source);
    setTxt('pboBriefNotes', active.notes);
  }

  function initPestBackoffice() {
    const shell = document.getElementById('pestBackofficeShell');
    const closeBtn = document.getElementById('pboCloseBtn');
    const simForm = document.getElementById('pboSimForm');
    const simInput = document.getElementById('pboSimInput');
    const composerForm = document.getElementById('pboComposerForm');
    const composerInput = document.getElementById('pboComposerInput');
    const approveBtn = document.getElementById('pboApproveDraftBtn');
    const dismissBtn = document.getElementById('pboDismissDraftBtn');
    const draftText = document.getElementById('pboDraftTextarea');

    function openBo() {
      if (!shell) return;
      shell.hidden = false;
      shell.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      renderPestBackoffice();
    }

    function closeBo() {
      if (!shell) return;
      shell.hidden = true;
      shell.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('#openBackofficeBtn, [data-open-backoffice]').forEach((btn) => {
      btn.addEventListener('click', openBo);
    });
    if (closeBtn) closeBtn.addEventListener('click', closeBo);

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (shell && shell.hidden) openBo();
        else closeBo();
      } else if (e.key === 'Escape' && shell && !shell.hidden) {
        closeBo();
      }
    });

    document.querySelectorAll('[data-pbo-filter]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-pbo-filter]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.getAttribute('data-pbo-filter') || 'all';
        renderPestBackoffice();
      });
    });

    document.querySelectorAll('[data-pbo-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        active.handoverMode = btn.getAttribute('data-pbo-mode') || 'manual';
        if (active.handoverMode === 'autopilot') active.status = 'AI Qualification';
        saveThreads();
        renderPestBackoffice();
      });
    });

    if (simForm && simInput) {
      simForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const text =
          simInput.value.trim() ||
          'How long until our dogs can go back in the backyard after you spray?';
        simInput.value = '';

        active.messages.push({ sender: 'customer', time: 'Just now', text });
        const reply = getShieldAiReply(text);

        if (active.handoverMode === 'autopilot') {
          active.status = 'AI Qualification';
          saveThreads();
          renderPestBackoffice();
          setTimeout(() => {
            active.messages.push({ sender: 'ai', time: 'Just now', text: reply });
            saveThreads();
            renderPestBackoffice();
          }, 550);
        } else {
          active.status = 'Action Required';
          active.suggestedDraft = reply;
          saveThreads();
          renderPestBackoffice();
        }
      });
    }

    if (approveBtn && draftText) {
      approveBtn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const val = draftText.value.trim();
        if (!val) return;
        active.messages.push({ sender: 'staff', time: 'Just now', text: val });
        active.suggestedDraft = '';
        active.status = 'Route Slot Booked';
        saveThreads();
        renderPestBackoffice();
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        active.suggestedDraft = '';
        saveThreads();
        renderPestBackoffice();
      });
    }

    if (composerForm && composerInput) {
      composerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const val = composerInput.value.trim();
        if (!val) return;
        composerInput.value = '';
        active.messages.push({ sender: 'staff', time: 'Just now', text: val });
        active.status = 'AI Qualification';
        saveThreads();
        renderPestBackoffice();
      });
    }

    document.querySelectorAll('[data-pbo-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const active = threads.find((t) => t.id === activeThreadId);
        if (!active) return;
        const slot = btn.getAttribute('data-pbo-slot');
        active.messages.push({
          sender: 'staff',
          time: 'Just now',
          text: `🚐 TPCL Route Arrival Dispatched: ${slot}. Reply YES to lock in this arrival window at ${active.location}.`
        });
        active.status = 'Route Slot Booked';
        active.suggestedDraft = '';
        saveThreads();
        renderPestBackoffice();
      });
    });

    // Telephony Modal
    const telOpen = document.getElementById('pboOpenTelephonyBtn');
    const telModal = document.getElementById('pestTelephonyModal');
    const telClose = document.getElementById('pestTelCloseBtn');
    const telForm = document.getElementById('pestTelephonyForm');
    const telInput = document.getElementById('pestTelInput');

    if (telOpen && telModal) {
      telOpen.addEventListener('click', () => {
        if (telInput && window.TiberiusTelephony) {
          telInput.value = window.TiberiusTelephony.getOverridePhone() || '';
        }
        telModal.hidden = false;
        telModal.setAttribute('aria-hidden', 'false');
      });
    }
    if (telClose && telModal) {
      telClose.addEventListener('click', () => {
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
        showPestToast(
          'Live Demo Telephony Override Saved',
          telInput && telInput.value.trim()
            ? `Routing SMS to ${telInput.value.trim()}`
            : 'Using default demo SMS routing'
        );
      });
    }

    window.openPestBackoffice = openBo;
    updateBadge();
    renderPestBackoffice();
  }

  // =========================================================================
  // 9. ESTIMATE MODAL & TOAST CONTROLLERS
  // =========================================================================
  let toastTimer = null;
  function showPestToast(title, sub) {
    const toast = document.getElementById('pestCrossPillarToast');
    const tEl = document.getElementById('pestToastTitle');
    const sEl = document.getElementById('pestToastSub');
    if (!toast) return;
    if (tEl && title) tEl.textContent = title;
    if (sEl && sub) sEl.textContent = sub;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 5500);
  }

  function initModalsAndToast() {
    const estModal = document.getElementById('pest-estimate-modal');
    const estClose = document.getElementById('pestEstCloseBtn');
    const estOpenChat = document.getElementById('pestEstOpenChatBtn');
    const estOpenBo = document.getElementById('pestEstOpenBoBtn');

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
        if (window.openPestAiDrawer) window.openPestAiDrawer('chat');
      });
    }
    if (estOpenBo && estModal) {
      estOpenBo.addEventListener('click', () => {
        estModal.hidden = true;
        estModal.setAttribute('aria-hidden', 'true');
        if (window.openPestBackoffice) window.openPestBackoffice();
      });
    }

    const toast = document.getElementById('pestCrossPillarToast');
    const toastOpenBo = document.getElementById('pestToastOpenBoBtn');
    const toastClose = document.getElementById('pestToastCloseBtn');
    if (toastOpenBo && toast) {
      toastOpenBo.addEventListener('click', () => {
        toast.hidden = true;
        if (window.openPestBackoffice) window.openPestBackoffice();
      });
    }
    if (toastClose && toast) {
      toastClose.addEventListener('click', () => {
        toast.hidden = true;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.getElementById('pestHeroBgVideo');
    if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.defaultMuted = true;
      heroVideo.loop = true;
      heroVideo.playsInline = true;
      heroVideo.play().catch(() => {});
    }
    initPestPhotoEstimator();
    initPestCapabilityLightbox();
    initPestCalculator();
    initPestAiDrawer();
    initPestBackoffice();
    initModalsAndToast();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openBackoffice') === '1' && window.openPestBackoffice) {
      window.openPestBackoffice();
    }
  });
})();
