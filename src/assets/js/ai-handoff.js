document.addEventListener("DOMContentLoaded", () => {
  const intakeForms = document.querySelectorAll("[data-ai-intake-form]");

  function getTreeSpecsForService(serviceStr, notesStr) {
    const combined = ((serviceStr || "") + " " + (notesStr || "")).toLowerCase();
    if (/trim|prune|pruning|canopy|raise|deadwood|oak wilt/.test(combined)) {
      return {
        estimate: "$950 – $2,150",
        equipment: "75ft Tracked Spider Lift + Sterilized Saws + 18\" Chipper",
        oakWilt: "100% Sterilized Blades + Immediate Latex Wound Sealant"
      };
    }
    if (/mulch|acre|cedar|lot|clearing|brush/.test(combined)) {
      return {
        estimate: "$3,400 – $5,600",
        equipment: "High-Flow Fecon Tracked Forestry Mulcher + ISA Spotter",
        oakWilt: "Root-Zone Buffer Preserved Around Heritage Live Oaks"
      };
    }
    if (/stump/.test(combined) && !/remove|removal|crane/.test(combined)) {
      return {
        estimate: "$350 – $750",
        equipment: "35\"-Gate Tracked Diesel Grinder + Debris Containment Screens",
        oakWilt: "Texas 811 Underground Line Locate Included"
      };
    }
    if (/storm|emergency|structure|roof/.test(combined)) {
      return {
        estimate: "$2,100 – $4,400",
        equipment: "45-Ton Hydraulic Crane + Spider Lift + Roof Tarp Kit",
        oakWilt: "Immediate Weatherproof Tarping & Xactimate Photo Packet"
      };
    }
    return {
      estimate: "$2,450 – $3,950",
      equipment: "45-Ton Hydraulic Crane + AlturnaMATS® + Tracked Grinder",
      oakWilt: "Sterilized Saws + Immediate Asphaltic Wound Sealant"
    };
  }

  intakeForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Syncing to Back-Office & Dispatch...";
      }

      const formData = new FormData(form);
      const serviceVal =
        formData.get("service") ||
        formData.get("serviceType") ||
        "Tree Trimming & Canopy Pruning";
      const tradeVal = form.dataset.trade || "tree-service";
      const notesVal = formData.get("notes") || "";
      const urgencyVal = formData.get("urgency") || "Standard";
      const treeSpecs = getTreeSpecsForService(String(serviceVal), String(notesVal));

      const payload = {
        id: "lead-" + Date.now(),
        trade: tradeVal,
        businessName:
          form.dataset.businessName ||
          (tradeVal === "tree-service"
            ? "IronOak Tree Service & Land Clearing"
            : "Lone Star Shield Pest & Termite"),
        phoneFormatted:
          form.dataset.phone ||
          (tradeVal === "tree-service" ? "(830) 555-0148" : "(830) 555-0192"),
        name: String(formData.get("name") || "Property Owner"),
        phone: String(formData.get("phone") || "(830) 555-0199"),
        zip: String(formData.get("zip") || "78132"),
        service: String(serviceVal),
        serviceType: String(serviceVal),
        urgency: String(urgencyVal),
        notes: String(notesVal),
        estimateRange:
          tradeVal === "tree-service" ? treeSpecs.estimate : "$149 Initial • $115/Qtr",
        equipment:
          tradeVal === "tree-service"
            ? treeSpecs.equipment
            : "Demand® CS Micro-Cap + Botanical Interior",
        timestamp: new Date().toISOString(),
        sourceUrl: window.location.href
      };

      // Sync to Tree or Pest Back-Office Room if present on page
      if (tradeVal === "tree-service" && typeof window.syncTreeLeadToBackoffice === "function") {
        window.syncTreeLeadToBackoffice({
          id: payload.id,
          name: payload.name,
          phone: payload.phone,
          location: payload.zip,
          service: payload.service,
          estimate: treeSpecs.estimate,
          equipment: treeSpecs.equipment,
          oakWilt: treeSpecs.oakWilt,
          notes: payload.notes ? `${payload.notes} (${payload.urgency})` : payload.urgency,
          source: "Digital Clipboard Estimator"
        });
      } else if (tradeVal === "pest-control" && typeof window.syncPestLeadToBackoffice === "function") {
        window.syncPestLeadToBackoffice({
          id: payload.id,
          name: payload.name,
          phone: payload.phone,
          location: payload.zip,
          service: payload.service,
          estimate: "$149 Initial • $115/Qtr",
          chem: "Demand® CS Micro-Cap + Botanical Interior",
          notes: payload.notes ? `${payload.notes} (${payload.urgency})` : payload.urgency,
          source: "PPC Split Hero Intake Card"
        });
      }

      try {
        const webhookUrl = form.dataset.webhook;
        if (webhookUrl && !webhookUrl.includes("your-webhook")) {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        console.warn("Webhook background handoff notice:", err);
      }

      // Save context for the shared AI Conversation page & Back-Office auto-import
      sessionStorage.setItem("tiberius_active_lead", JSON.stringify(payload));
      localStorage.setItem("tiberius_latest_lead", JSON.stringify(payload));

      // Redirect to shared AI conversation page with URL params as fallback
      const targetPath = form.dataset.aiUrl || form.dataset.aiPage || "/ai-conversation/";
      const aiUrl = new URL(targetPath, window.location.origin);
      aiUrl.searchParams.set("trade", payload.trade);
      aiUrl.searchParams.set("name", payload.name);
      aiUrl.searchParams.set("zip", payload.zip);
      aiUrl.searchParams.set("service", payload.service);
      window.location.href = aiUrl.toString();
    });
  });
});
