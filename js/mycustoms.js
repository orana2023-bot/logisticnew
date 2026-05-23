// MyCustoms Clearance & Compliance Operations Engine
document.addEventListener("DOMContentLoaded", () => {

    // =========================================================================
    // STATE ENGINE (Mock Regulatory Database)
    // =========================================================================

    let declarations = [
        {
            id: "DEC-2026-9041",
            shipmentId: "SHP-8820",
            type: "IMPORT",
            declarant: "Apex Global Logistics Ltd",
            clientCode: "APX-702",
            port: "USLAX",
            mode: "Ocean",
            modeIcon: "fa-ship",
            status: "CLEARED",
            customsValue: 142000,
            dutyRate: 4.5,
            estimatedDuty: 6390,
            hsItems: [
                { hsCode: "8471.30", description: "Portable Computing Devices", origin: "CN", value: 95000, tariff: 3.9, duty: 3705 },
                { hsCode: "8523.51", description: "Solid-State Storage Drives", origin: "CN", value: 47000, tariff: 5.7, duty: 2685 }
            ],
            compliance: [
                { check: "Denied Party Screening", status: "pass" },
                { check: "Import Permit Verified", status: "pass" },
                { check: "Commercial Invoice Attached", status: "pass" },
                { check: "Certificate of Origin Filed", status: "pass" },
                { check: "Hazardous Declaration N/A", status: "pass" },
                { check: "Sanction List Cross-Check", status: "pass" }
            ],
            auditLogs: [
                { time: "2026-05-18 08:14", text: "Declaration submitted via automated booking pipeline", type: "system" },
                { time: "2026-05-18 11:30", text: "Document review completed. All attachments verified.", type: "system" },
                { time: "2026-05-19 09:45", text: "Tariff assessment completed. Duty: $6,390.00", type: "assessment" },
                { time: "2026-05-20 14:22", text: "Physical inspection waived. Cargo released.", type: "clearance" }
            ],
            milestones: [
                { label: "Port Arrival", icon: "fa-anchor", status: "completed" },
                { label: "Doc Clearance", icon: "fa-file-circle-check", status: "completed" },
                { label: "Inspection", icon: "fa-magnifying-glass", status: "completed" },
                { label: "Duty Paid", icon: "fa-money-check-dollar", status: "completed" },
                { label: "Release", icon: "fa-door-open", status: "completed" }
            ],
            scanDetails: {
                containerSeal: "Seal #887201: Intact",
                scanType: "Non-Intrusive X-Ray Scan",
                scanResult: "No anomalies detected",
                officerNotes: "Container cleared via green channel."
            },
            portEvents: [
                { time: "2026-05-18 06:30", location: "Berth T-4, Port of LA", event: "Container offloaded from vessel MV Oceanus", agency: "US CBP", status: "Passed" },
                { time: "2026-05-18 08:14", location: "CBP Gate A-12", event: "Declaration submitted to customs authority", agency: "US CBP", status: "Passed" },
                { time: "2026-05-19 10:00", location: "Inspection Bay C", event: "Non-intrusive scan completed", agency: "US CBP / TSA", status: "Passed" },
                { time: "2026-05-20 14:22", location: "Release Gate R-7", event: "Final customs release — out of gate", agency: "US CBP", status: "Passed" }
            ]
        },
        {
            id: "DEC-2026-9042",
            shipmentId: "SHP-8821",
            type: "IMPORT",
            declarant: "Trans-Pacific Industries",
            clientCode: "TRN-104",
            port: "CNSHA",
            mode: "Ocean",
            modeIcon: "fa-ship",
            status: "UNDER_REVIEW",
            customsValue: 218500,
            dutyRate: 6.2,
            estimatedDuty: 13547,
            hsItems: [
                { hsCode: "7208.51", description: "Hot-Rolled Steel Plates (width ≥600mm)", origin: "DE", value: 158000, tariff: 7.0, duty: 11060 },
                { hsCode: "7216.33", description: "Structural H-Beam Steel Sections", origin: "DE", value: 60500, tariff: 4.1, duty: 2481 }
            ],
            compliance: [
                { check: "Denied Party Screening", status: "pass" },
                { check: "Import Permit Verified", status: "pass" },
                { check: "Commercial Invoice Attached", status: "pass" },
                { check: "Certificate of Origin Filed", status: "pending" },
                { check: "Anti-Dumping Declaration", status: "fail" },
                { check: "Sanction List Cross-Check", status: "pass" }
            ],
            auditLogs: [
                { time: "2026-05-20 10:00", text: "Declaration filed for steel import consignment", type: "system" },
                { time: "2026-05-21 09:15", text: "Document review in progress. Awaiting Certificate of Origin.", type: "review" },
                { time: "2026-05-21 14:40", text: "Anti-dumping declaration missing. Query issued to broker.", type: "query" }
            ],
            queryReason: "Anti-dumping duty declaration form is required for steel imports from EU. Certificate of Origin pending verification.",
            milestones: [
                { label: "Port Arrival", icon: "fa-anchor", status: "completed" },
                { label: "Doc Clearance", icon: "fa-file-circle-check", status: "current" },
                { label: "Inspection", icon: "fa-magnifying-glass", status: "pending" },
                { label: "Duty Paid", icon: "fa-money-check-dollar", status: "pending" },
                { label: "Release", icon: "fa-door-open", status: "pending" }
            ],
            scanDetails: {
                containerSeal: "Seal #990184: Intact",
                scanType: "Pending Physical Audit",
                scanResult: "Awaiting queue assignment",
                officerNotes: "Held for anti-dumping review."
            },
            portEvents: [
                { time: "2026-05-20 07:00", location: "Berth S-9, Shanghai Terminal", event: "Container discharged from MV Pacific Star", agency: "China Customs (GACC)", status: "Passed" },
                { time: "2026-05-20 10:00", location: "Customs Office B-3", event: "Declaration submitted", agency: "GACC", status: "Passed" },
                { time: "2026-05-21 14:40", location: "Review Desk D-1", event: "Query issued — anti-dumping form required", agency: "GACC", status: "Warn" }
            ]
        },
        {
            id: "DEC-2026-9043",
            shipmentId: "SHP-8822",
            type: "EXPORT",
            declarant: "Euro-Baltic Import Group",
            clientCode: "EUB-308",
            port: "NLRTM",
            mode: "Air",
            modeIcon: "fa-plane",
            status: "HOLD",
            customsValue: 67800,
            dutyRate: 0,
            estimatedDuty: 0,
            hsItems: [
                { hsCode: "3004.90", description: "Pharmaceutical Medicaments (packaged)", origin: "IN", value: 45200, tariff: 0, duty: 0 },
                { hsCode: "3002.15", description: "Immunological Products (vaccines)", origin: "IN", value: 22600, tariff: 0, duty: 0 }
            ],
            compliance: [
                { check: "Denied Party Screening", status: "pass" },
                { check: "Export License Verified", status: "fail" },
                { check: "Commercial Invoice Attached", status: "pass" },
                { check: "Health Certificate Required", status: "fail" },
                { check: "Cold Chain Compliance", status: "pending" },
                { check: "Sanction List Cross-Check", status: "pass" }
            ],
            auditLogs: [
                { time: "2026-05-19 16:30", text: "Export declaration submitted for pharmaceutical cargo", type: "system" },
                { time: "2026-05-20 11:00", text: "Health certificate NOT found. Export license missing.", type: "hold" },
                { time: "2026-05-21 08:00", text: "CUSTOMS HOLD: Missing export license and health certificate for pharmaceutical goods.", type: "hold" }
            ],
            milestones: [
                { label: "Port Arrival", icon: "fa-anchor", status: "completed" },
                { label: "Doc Clearance", icon: "fa-file-circle-check", status: "blocked" },
                { label: "Inspection", icon: "fa-magnifying-glass", status: "pending" },
                { label: "Duty Paid", icon: "fa-money-check-dollar", status: "pending" },
                { label: "Release", icon: "fa-door-open", status: "pending" }
            ],
            scanDetails: {
                containerSeal: "Seal #112490: Intact",
                scanType: "Gamma Scan Scheduled",
                scanResult: "Pending",
                officerNotes: "Held: Export license and health certificate required."
            },
            portEvents: [
                { time: "2026-05-19 14:00", location: "Air Cargo Terminal, Rotterdam", event: "Cargo received at export warehouse", agency: "EU Customs", status: "Passed" },
                { time: "2026-05-20 11:00", location: "Export Compliance Desk", event: "Missing export license flagged", agency: "EU Customs", status: "Hold" },
                { time: "2026-05-21 08:00", location: "Regulatory Hold Bay", event: "Customs hold applied — pharma export docs missing", agency: "EU Customs / EMA", status: "Hold" }
            ]
        },
        {
            id: "DEC-2026-9044",
            shipmentId: "SHP-8823",
            type: "IMPORT",
            declarant: "Apex Global Logistics Ltd",
            clientCode: "APX-702",
            port: "SGSIN",
            mode: "Ocean",
            modeIcon: "fa-ship",
            status: "QUERY",
            customsValue: 89400,
            dutyRate: 5.0,
            estimatedDuty: 4470,
            hsItems: [
                { hsCode: "6204.62", description: "Women's Cotton Trousers", origin: "IN", value: 52400, tariff: 5.0, duty: 2620 },
                { hsCode: "6109.10", description: "Cotton T-Shirts (knitted)", origin: "IN", value: 37000, tariff: 5.0, duty: 1850 }
            ],
            compliance: [
                { check: "Denied Party Screening", status: "pass" },
                { check: "Import Permit Verified", status: "pass" },
                { check: "Commercial Invoice Attached", status: "fail" },
                { check: "Certificate of Origin Filed", status: "pass" },
                { check: "Textile Quota Verification", status: "pending" },
                { check: "Sanction List Cross-Check", status: "pass" }
            ],
            auditLogs: [
                { time: "2026-05-21 07:30", text: "Import declaration filed for textile consignment", type: "system" },
                { time: "2026-05-21 15:20", text: "Query: Commercial invoice amount does not match packing list totals.", type: "query" }
            ],
            queryReason: "Declared customs value ($89,400) does not match commercial invoice total ($91,200). Discrepancy of $1,800 requires broker clarification.",
            milestones: [
                { label: "Port Arrival", icon: "fa-anchor", status: "completed" },
                { label: "Doc Clearance", icon: "fa-file-circle-check", status: "current" },
                { label: "Inspection", icon: "fa-magnifying-glass", status: "pending" },
                { label: "Duty Paid", icon: "fa-money-check-dollar", status: "pending" },
                { label: "Release", icon: "fa-door-open", status: "pending" }
            ],
            scanDetails: {
                containerSeal: "Seal #445019: Intact",
                scanType: "Document Audit Only",
                scanResult: "Pending valuation match",
                officerNotes: "Value mismatch under review."
            },
            portEvents: [
                { time: "2026-05-21 05:00", location: "Berth P-2, Singapore Port", event: "Container discharged from MV Asia Express", agency: "SG Customs", status: "Passed" },
                { time: "2026-05-21 07:30", location: "SG Customs Desk", event: "Declaration submitted", agency: "SG Customs", status: "Passed" },
                { time: "2026-05-21 15:20", location: "Valuation Review Desk", event: "Value mismatch query issued to broker", agency: "SG Customs", status: "Warn" }
            ]
        },
        {
            id: "DEC-2026-9045",
            shipmentId: "SHP-8824",
            type: "IMPORT",
            declarant: "Trans-Pacific Industries",
            clientCode: "TRN-104",
            port: "USLAX",
            mode: "Air",
            modeIcon: "fa-plane",
            status: "HOLD",
            customsValue: 34200,
            dutyRate: 8.5,
            estimatedDuty: 2907,
            hsItems: [
                { hsCode: "8541.40", description: "Photovoltaic Solar Cells", origin: "CN", value: 34200, tariff: 8.5, duty: 2907 }
            ],
            compliance: [
                { check: "Denied Party Screening", status: "pass" },
                { check: "Import Permit Verified", status: "pass" },
                { check: "Commercial Invoice Attached", status: "pass" },
                { check: "Anti-Circumvention Review", status: "fail" },
                { check: "Section 301 Tariff Review", status: "fail" },
                { check: "Sanction List Cross-Check", status: "pass" }
            ],
            auditLogs: [
                { time: "2026-05-20 12:00", text: "Import declaration filed for solar components", type: "system" },
                { time: "2026-05-21 10:30", text: "Section 301 tariff flag triggered. Additional duties may apply.", type: "hold" },
                { time: "2026-05-22 08:00", text: "CUSTOMS HOLD: Anti-circumvention review required for CN-origin solar cells.", type: "hold" }
            ],
            milestones: [
                { label: "Port Arrival", icon: "fa-anchor", status: "completed" },
                { label: "Doc Clearance", icon: "fa-file-circle-check", status: "blocked" },
                { label: "Inspection", icon: "fa-magnifying-glass", status: "pending" },
                { label: "Duty Paid", icon: "fa-money-check-dollar", status: "pending" },
                { label: "Release", icon: "fa-door-open", status: "pending" }
            ],
            scanDetails: {
                containerSeal: "Seal #778332: Intact",
                scanType: "Physical Devanning Scheduled",
                scanResult: "Awaiting officer assignment",
                officerNotes: "Anti-circumvention review pending."
            },
            portEvents: [
                { time: "2026-05-20 10:00", location: "LAX Air Cargo Terminal", event: "Air freight consignment received", agency: "US CBP", status: "Passed" },
                { time: "2026-05-21 10:30", location: "Trade Compliance Desk", event: "Section 301 tariff flag raised", agency: "US CBP / USTR", status: "Warn" },
                { time: "2026-05-22 08:00", location: "Hold Bay H-3", event: "Customs hold — anti-circumvention review", agency: "US CBP", status: "Hold" }
            ]
        }
    ];

    let documents = [
        { name: "Commercial_Invoice_SHP8820.pdf", category: "Commercial Invoice", format: "PDF", declarationRef: "DEC-2026-9041", verification: "Verified", uploadDate: "2026-05-18" },
        { name: "Packing_List_SHP8820.pdf", category: "Packing List", format: "PDF", declarationRef: "DEC-2026-9041", verification: "Verified", uploadDate: "2026-05-18" },
        { name: "Certificate_Origin_APX702.pdf", category: "Certificate of Origin", format: "PDF", declarationRef: "DEC-2026-9041", verification: "Verified", uploadDate: "2026-05-17" },
        { name: "BOL_MV_Oceanus_8820.pdf", category: "Bill of Lading", format: "PDF", declarationRef: "DEC-2026-9041", verification: "Verified", uploadDate: "2026-05-16" },
        { name: "Invoice_SHP8821_Steel.pdf", category: "Commercial Invoice", format: "PDF", declarationRef: "DEC-2026-9042", verification: "Verified", uploadDate: "2026-05-20" },
        { name: "Import_License_TRN104.xml", category: "Import License", format: "XML", declarationRef: "DEC-2026-9042", verification: "Pending OCR", uploadDate: "2026-05-20" },
        { name: "BOL_Pacific_Star_8821.pdf", category: "Bill of Lading", format: "PDF", declarationRef: "DEC-2026-9042", verification: "Verified", uploadDate: "2026-05-19" },
        { name: "Invoice_Pharma_EUB308.pdf", category: "Commercial Invoice", format: "PDF", declarationRef: "DEC-2026-9043", verification: "Verified", uploadDate: "2026-05-19" },
        { name: "Packing_List_EUB308.pdf", category: "Packing List", format: "PDF", declarationRef: "DEC-2026-9043", verification: "Pending OCR", uploadDate: "2026-05-19" },
        { name: "Health_Cert_PENDING.pdf", category: "Health Certificate", format: "PDF", declarationRef: "DEC-2026-9043", verification: "Rejected", uploadDate: "2026-05-20" },
        { name: "Invoice_Textile_APX702.pdf", category: "Commercial Invoice", format: "PDF", declarationRef: "DEC-2026-9044", verification: "Rejected", uploadDate: "2026-05-21" },
        { name: "COO_India_Textiles.pdf", category: "Certificate of Origin", format: "PDF", declarationRef: "DEC-2026-9044", verification: "Verified", uploadDate: "2026-05-21" },
        { name: "Packing_List_SHP8823.pdf", category: "Packing List", format: "PDF", declarationRef: "DEC-2026-9044", verification: "Verified", uploadDate: "2026-05-21" },
        { name: "Invoice_Solar_TRN104.pdf", category: "Commercial Invoice", format: "PDF", declarationRef: "DEC-2026-9045", verification: "Verified", uploadDate: "2026-05-20" },
        { name: "Import_License_Solar.pdf", category: "Import License", format: "PDF", declarationRef: "DEC-2026-9045", verification: "Pending OCR", uploadDate: "2026-05-20" }
    ];

    let criticalAlerts = [
        { id: "HOLD-001", shipmentId: "SHP-8822", declarationId: "DEC-2026-9043", port: "NLRTM", reason: "Missing Export License & Health Certificate for pharmaceutical cargo", severity: "critical" },
        { id: "HOLD-002", shipmentId: "SHP-8824", declarationId: "DEC-2026-9045", port: "USLAX", reason: "Section 301 tariff flag — Anti-circumvention review required for CN-origin solar cells", severity: "critical" },
        { id: "HOLD-003", shipmentId: "SHP-8821", declarationId: "DEC-2026-9042", port: "CNSHA", reason: "Anti-dumping declaration form missing for EU steel imports", severity: "warning" }
    ];

    const hsCodeDatabase = [
        { hsCode: "8471.30", commodity: "Portable Computing Devices", duty: 3.9, restriction: "None" },
        { hsCode: "8523.51", commodity: "Solid-State Storage Drives", duty: 5.7, restriction: "None" },
        { hsCode: "7208.51", commodity: "Hot-Rolled Steel Plates (≥600mm)", duty: 7.0, restriction: "Anti-Dumping" },
        { hsCode: "7216.33", commodity: "Structural H-Beam Steel", duty: 4.1, restriction: "None" },
        { hsCode: "3004.90", commodity: "Pharmaceutical Medicaments", duty: 0, restriction: "FDA License" },
        { hsCode: "3002.15", commodity: "Immunological Products (Vaccines)", duty: 0, restriction: "FDA License" },
        { hsCode: "6204.62", commodity: "Women's Cotton Trousers", duty: 5.0, restriction: "None" },
        { hsCode: "6109.10", commodity: "Cotton T-Shirts (Knitted)", duty: 5.0, restriction: "None" },
        { hsCode: "8541.40", commodity: "Photovoltaic Solar Cells", duty: 8.5, restriction: "Section 301" },
        { hsCode: "8517.12", commodity: "Smartphones & Mobile Phones", duty: 0, restriction: "FCC Cert" },
        { hsCode: "2709.00", commodity: "Crude Petroleum Oils", duty: 0.5, restriction: "Sanctioned Origins" },
        { hsCode: "0901.11", commodity: "Coffee (not roasted, not decaf)", duty: 0, restriction: "None" },
        { hsCode: "8703.23", commodity: "Motor Vehicles (1500-3000cc)", duty: 2.5, restriction: "EPA/DOT" },
        { hsCode: "6110.20", commodity: "Cotton Pullovers & Sweaters", duty: 5.0, restriction: "None" },
        { hsCode: "8473.30", commodity: "Computer Parts & Accessories", duty: 0, restriction: "None" },
        { hsCode: "3304.99", commodity: "Beauty & Skin Care Products", duty: 0, restriction: "FDA" }
    ];

    let activeSelectedDeclarationId = "DEC-2026-9041";
    let wizardCurrentStep = 1;

    // =========================================================================
    // CLIENT SIDE TAB SWITCHER
    // =========================================================================
    const navItems = document.querySelectorAll(".nav-item");
    const views = document.querySelectorAll(".viewport-view");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const tabName = item.getAttribute("data-tab");

            navItems.forEach(nav => nav.classList.remove("active"));
            views.forEach(v => v.classList.remove("active"));

            item.classList.add("active");
            document.getElementById(`${tabName}-view`).classList.add("active");

            // Re-render sub-components
            if (tabName === "dashboard") {
                renderAlertsQueue();
                renderHSQuickLookup();
            } else if (tabName === "declarations") {
                renderDeclarationTable();
            } else if (tabName === "declaration-details") {
                renderDeclarationDetails(activeSelectedDeclarationId);
            } else if (tabName === "clearance") {
                renderClearanceTracking(activeSelectedDeclarationId);
            } else if (tabName === "documents") {
                renderDocumentTable();
            }
        });
    });

    // =========================================================================
    // MODAL CONTROL UTILITIES
    // =========================================================================
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add("active");
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
    }

    // HS Lookup Modal
    const hsLookupBtn = document.getElementById("trigger-hs-lookup-btn");
    if (hsLookupBtn) hsLookupBtn.addEventListener("click", () => openModal("hs-modal"));
    const hsModalClose = document.getElementById("hs-modal-close");
    if (hsModalClose) hsModalClose.addEventListener("click", () => closeModal("hs-modal"));

    // New Declaration Modal
    const newDecBtn1 = document.getElementById("trigger-new-declaration-btn");
    const newDecBtn2 = document.getElementById("btn-new-declaration-registry");
    if (newDecBtn1) newDecBtn1.addEventListener("click", () => { resetWizard(); openModal("new-declaration-modal"); });
    if (newDecBtn2) newDecBtn2.addEventListener("click", () => { resetWizard(); openModal("new-declaration-modal"); });
    const wizardCancel = document.getElementById("wizard-cancel");
    if (wizardCancel) wizardCancel.addEventListener("click", () => closeModal("new-declaration-modal"));

    // Resolution Modal
    const resolutionCancel = document.getElementById("resolution-cancel");
    if (resolutionCancel) resolutionCancel.addEventListener("click", () => closeModal("resolution-modal"));

    // Holds alert bell -> navigate to dashboard
    const holdsAlertTrigger = document.getElementById("holds-alert-trigger");
    if (holdsAlertTrigger) {
        holdsAlertTrigger.addEventListener("click", () => {
            const dashTab = document.querySelector('[data-tab="dashboard"]');
            if (dashTab) dashTab.click();
        });
    }

    // =========================================================================
    // HS CODE LOOKUP (Dashboard Quick Widget)
    // =========================================================================
    function renderHSQuickLookup(query) {
        const body = document.getElementById("hs-results-body");
        if (!body) return;
        body.innerHTML = "";

        const searchTerm = (query || "").toLowerCase();
        const results = searchTerm.length > 0
            ? hsCodeDatabase.filter(h => h.commodity.toLowerCase().includes(searchTerm) || h.hsCode.includes(searchTerm))
            : hsCodeDatabase.slice(0, 6);

        if (results.length === 0) {
            body.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 16px; color: var(--text-muted);">No matching commodities found.</td></tr>`;
            return;
        }

        results.forEach(h => {
            let restrictClass = "none";
            if (h.restriction === "Anti-Dumping" || h.restriction.includes("Section")) restrictClass = "sanctioned";
            else if (h.restriction !== "None") restrictClass = "restricted";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="hs-code-val">${h.hsCode}</span></td>
                <td>${h.commodity}</td>
                <td class="text-right" style="font-weight: 600; font-variant-numeric: tabular-nums;">${h.duty}%</td>
                <td><span class="restriction-badge ${restrictClass}">${h.restriction}</span></td>
            `;
            body.appendChild(tr);
        });
    }

    const hsSearchBtn = document.getElementById("hs-search-btn");
    const hsSearchInput = document.getElementById("hs-search-input");
    if (hsSearchBtn && hsSearchInput) {
        hsSearchBtn.addEventListener("click", () => renderHSQuickLookup(hsSearchInput.value));
        hsSearchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") renderHSQuickLookup(hsSearchInput.value); });
    }

    // HS Modal Search
    const hsModalSearch = document.getElementById("hs-modal-search");
    if (hsModalSearch) {
        hsModalSearch.addEventListener("click", () => {
            const keyword = document.getElementById("hs-modal-keyword").value.toLowerCase();
            const resultsBody = document.getElementById("hs-modal-results-body");
            if (!resultsBody) return;
            resultsBody.innerHTML = "";

            const results = hsCodeDatabase.filter(h =>
                h.commodity.toLowerCase().includes(keyword) || h.hsCode.includes(keyword)
            );

            if (results.length === 0) {
                resultsBody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 16px; color: var(--text-muted);">No results found.</td></tr>`;
                return;
            }

            results.forEach(h => {
                let restrictClass = "none";
                if (h.restriction === "Anti-Dumping" || h.restriction.includes("Section")) restrictClass = "sanctioned";
                else if (h.restriction !== "None") restrictClass = "restricted";

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><span class="hs-code-val">${h.hsCode}</span></td>
                    <td>${h.commodity}</td>
                    <td class="text-right" style="font-weight: 600;">${h.duty}%</td>
                    <td><span class="restriction-badge ${restrictClass}">${h.restriction}</span></td>
                `;
                resultsBody.appendChild(tr);
            });
        });
    }

    // =========================================================================
    // CRITICAL ALERTS QUEUE (Dashboard)
    // =========================================================================
    function renderAlertsQueue() {
        const container = document.getElementById("alerts-queue-container");
        if (!container) return;
        container.innerHTML = "";

        if (criticalAlerts.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">All customs holds have been resolved. No active alerts.</div>`;
            // Remove pulse
            const bell = document.getElementById("holds-alert-trigger");
            if (bell) bell.classList.remove("pulsing");
            return;
        }

        criticalAlerts.forEach(alert => {
            const item = document.createElement("div");
            item.className = "alert-item";
            item.innerHTML = `
                <div class="alert-info">
                    <span class="alert-title"><i class="fa-solid fa-${alert.severity === 'critical' ? 'ban' : 'triangle-exclamation'}" style="color: var(--color-${alert.severity === 'critical' ? 'critical' : 'warning'}); margin-right: 6px;"></i>${alert.reason}</span>
                    <span class="alert-meta">${alert.id} · Shipment: ${alert.shipmentId} · Port: ${alert.port}</span>
                </div>
                <button class="btn secondary btn-sm btn-resolve-alert" data-alert-id="${alert.id}" data-reason="${alert.reason}">
                    <i class="fa-solid fa-wrench"></i> Resolve
                </button>
            `;
            container.appendChild(item);
        });

        // Wire resolve buttons
        container.querySelectorAll(".btn-resolve-alert").forEach(btn => {
            btn.addEventListener("click", () => {
                const alertId = btn.getAttribute("data-alert-id");
                const reason = btn.getAttribute("data-reason");
                document.getElementById("resolution-hold-id").value = alertId;
                document.getElementById("resolution-reason").value = reason;
                document.getElementById("resolution-action").value = "";
                openModal("resolution-modal");
            });
        });

        // Update counters
        const holdsCount = document.getElementById("active-holds-count");
        if (holdsCount) holdsCount.textContent = `${criticalAlerts.length} Holds`;
        const queueBadge = document.getElementById("holds-queue-count");
        if (queueBadge) queueBadge.textContent = `${criticalAlerts.length} Active`;
    }

    // Resolution Submit
    const resolutionSubmit = document.getElementById("resolution-submit");
    if (resolutionSubmit) {
        resolutionSubmit.addEventListener("click", () => {
            const alertId = document.getElementById("resolution-hold-id").value;
            const action = document.getElementById("resolution-action").value || "Corrective documents provided.";

            const alertObj = criticalAlerts.find(a => a.id === alertId);
            if (alertObj) {
                // Update declaration status
                const dec = declarations.find(d => d.id === alertObj.declarationId);
                if (dec) {
                    dec.status = "UNDER_REVIEW";
                    dec.auditLogs.push({
                        time: new Date().toISOString().slice(0, 16).replace("T", " "),
                        text: `Hold ${alertId} resolved: "${action}". Declaration returned to review queue.`,
                        type: "system"
                    });
                }
            }

            criticalAlerts = criticalAlerts.filter(a => a.id !== alertId);
            closeModal("resolution-modal");
            updateGlobalKPIs();
            renderAlertsQueue();
            alert(`Hold ${alertId} successfully resolved and logged to audit trail.`);
        });
    }

    // =========================================================================
    // DECLARATION MANAGEMENT DATATABLE
    // =========================================================================
    const decSearchFilter = document.getElementById("declaration-search-filter");
    const decStatusFilter = document.getElementById("filter-declaration-status");
    const decTypeFilter = document.getElementById("filter-declaration-type");
    const decTableBody = document.getElementById("declaration-table-body");

    if (decSearchFilter) decSearchFilter.addEventListener("input", renderDeclarationTable);
    if (decStatusFilter) decStatusFilter.addEventListener("change", renderDeclarationTable);
    if (decTypeFilter) decTypeFilter.addEventListener("change", renderDeclarationTable);

    function renderDeclarationTable() {
        if (!decTableBody) return;
        decTableBody.innerHTML = "";

        const query = (decSearchFilter ? decSearchFilter.value : "").toLowerCase();
        const selectedStatus = decStatusFilter ? decStatusFilter.value : "ALL";
        const selectedType = decTypeFilter ? decTypeFilter.value : "ALL";

        const filtered = declarations.filter(dec => {
            const matchesSearch = dec.id.toLowerCase().includes(query) ||
                                  dec.declarant.toLowerCase().includes(query) ||
                                  dec.clientCode.toLowerCase().includes(query) ||
                                  dec.port.toLowerCase().includes(query) ||
                                  dec.shipmentId.toLowerCase().includes(query);
            const matchesStatus = (selectedStatus === "ALL") || (dec.status === selectedStatus);
            const matchesType = (selectedType === "ALL") || (dec.type === selectedType);
            return matchesSearch && matchesStatus && matchesType;
        });

        if (filtered.length === 0) {
            decTableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 24px; color: var(--text-muted);">No declarations found matching criteria.</td></tr>`;
            return;
        }

        filtered.forEach(dec => {
            const statusClass = dec.status.toLowerCase().replace("_", "-");
            const statusLabel = dec.status.replace("_", " ");

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="checkbox" class="dec-row-check" value="${dec.id}"></td>
                <td><span class="declaration-link" data-id="${dec.id}">${dec.id}</span></td>
                <td>
                    <div class="shipment-mode-cell">
                        <span style="font-weight: 500; color: var(--text-primary);">${dec.shipmentId}</span>
                        <span class="mode-icon"><i class="fa-solid ${dec.modeIcon}"></i> ${dec.mode} ${dec.type}</span>
                    </div>
                </td>
                <td>
                    <span class="client-name-cell">${dec.declarant}</span>
                    <span class="client-code">${dec.clientCode}</span>
                </td>
                <td><span class="port-badge">${dec.port}</span></td>
                <td class="text-right">
                    <span class="amount">$${dec.customsValue.toLocaleString('en-US')}</span>
                    <span class="client-code" style="text-align: right;">Duty: $${dec.estimatedDuty.toLocaleString('en-US')}</span>
                </td>
                <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
                <td class="text-center">
                    <button class="btn secondary btn-sm action-inspect-dec" data-id="${dec.id}" title="Inspect Details">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </td>
            `;
            decTableBody.appendChild(tr);
        });

        // Add click handlers
        decTableBody.querySelectorAll(".declaration-link, .action-inspect-dec").forEach(el => {
            el.addEventListener("click", () => {
                activeSelectedDeclarationId = el.getAttribute("data-id");
                const detailsTab = document.querySelector('[data-tab="declaration-details"]');
                if (detailsTab) detailsTab.click();
            });
        });
    }

    // Batch Submit
    const batchSubmitBtn = document.getElementById("btn-batch-submit");
    if (batchSubmitBtn) {
        batchSubmitBtn.addEventListener("click", () => {
            const checked = document.querySelectorAll(".dec-row-check:checked");
            if (checked.length === 0) {
                alert("Please select at least one declaration for batch submission.");
                return;
            }
            const ids = Array.from(checked).map(c => c.value);
            ids.forEach(id => {
                const dec = declarations.find(d => d.id === id);
                if (dec && dec.status === "DRAFT") {
                    dec.status = "UNDER_REVIEW";
                    dec.auditLogs.push({
                        time: new Date().toISOString().slice(0, 16).replace("T", " "),
                        text: "Batch submitted to customs authority for review.",
                        type: "system"
                    });
                }
            });
            renderDeclarationTable();
            updateGlobalKPIs();
            alert(`${ids.length} declaration(s) batch submitted to customs authority.`);
        });
    }

    // =========================================================================
    // DECLARATION DETAILS VIEW
    // =========================================================================
    function renderDeclarationDetails(id) {
        const dec = declarations.find(d => d.id === id);
        if (!dec) return;

        // Meta fields
        document.getElementById("detail-dec-id").innerText = dec.id;
        document.getElementById("detail-shipment-id").innerText = dec.shipmentId;
        document.getElementById("detail-declarant").innerText = `${dec.declarant} (${dec.clientCode})`;
        document.getElementById("detail-port").innerText = dec.port;

        // Status badge
        const badge = document.getElementById("detail-status-badge");
        const statusClass = dec.status.toLowerCase().replace("_", "-");
        badge.className = `status-pill ${statusClass}`;
        badge.innerText = dec.status.replace("_", " ");

        // HS Line Items
        const hsBody = document.getElementById("detail-hs-body");
        if (hsBody) {
            hsBody.innerHTML = "";
            dec.hsItems.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><span class="hs-code-val">${item.hsCode}</span></td>
                    <td>${item.description}</td>
                    <td>${item.origin}</td>
                    <td class="text-right" style="font-variant-numeric: tabular-nums; font-weight: 600;">$${item.value.toLocaleString('en-US')}</td>
                    <td class="text-right" style="font-variant-numeric: tabular-nums;">${item.tariff}%</td>
                    <td class="text-right" style="font-variant-numeric: tabular-nums; font-weight: 600;">$${item.duty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                `;
                hsBody.appendChild(tr);
            });
        }

        // Totals
        const totalValue = dec.hsItems.reduce((sum, i) => sum + i.value, 0);
        const totalDuty = dec.hsItems.reduce((sum, i) => sum + i.duty, 0);
        document.getElementById("detail-total-value").innerText = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById("detail-total-duty").innerText = `$${totalDuty.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById("detail-total-payable").innerText = `$${(totalValue + totalDuty).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        // Compliance checklist
        const checklistContainer = document.getElementById("compliance-checklist-container");
        if (checklistContainer) {
            checklistContainer.innerHTML = "";
            let passCount = 0;
            dec.compliance.forEach(c => {
                if (c.status === "pass") passCount++;
                const iconClass = c.status === "pass" ? "fa-check" : c.status === "fail" ? "fa-xmark" : "fa-hourglass-half";
                const statusClass = c.status;
                const item = document.createElement("div");
                item.className = "compliance-item";
                item.innerHTML = `
                    <div class="check-icon ${statusClass}"><i class="fa-solid ${iconClass}"></i></div>
                    <span class="check-text">${c.check}</span>
                `;
                checklistContainer.appendChild(item);
            });
            const scoreBadge = document.getElementById("compliance-score-badge");
            if (scoreBadge) {
                scoreBadge.textContent = `${passCount}/${dec.compliance.length} Passed`;
                scoreBadge.className = `badge-pill ${passCount === dec.compliance.length ? 'nominal' : passCount >= dec.compliance.length - 1 ? 'warning' : 'critical'}`;
            }
        }

        // Audit timeline
        const timeline = document.getElementById("detail-audit-timeline");
        if (timeline) {
            timeline.innerHTML = "";
            dec.auditLogs.forEach((log, index) => {
                const step = document.createElement("div");
                let typeClass = "";
                if (log.type === "hold") typeClass = "hold";
                else if (log.type === "query") typeClass = "query";
                else if (index === dec.auditLogs.length - 1) typeClass = "active";

                step.className = `timeline-step ${typeClass}`;
                step.innerHTML = `
                    <div class="timeline-content">
                        <div class="timeline-title">${log.text}</div>
                        <div class="timeline-desc"><i class="fa-solid fa-clock"></i> ${log.time} &middot; ${log.type.toUpperCase()}</div>
                    </div>
                `;
                timeline.appendChild(step);
            });
        }

        // Query resolution panel
        const querySection = document.getElementById("query-resolution-section");
        if (querySection) {
            if (dec.status === "QUERY" || dec.status === "UNDER_REVIEW") {
                if (dec.queryReason) {
                    querySection.style.display = "block";
                    document.getElementById("query-reason-text").innerText = dec.queryReason;
                } else {
                    querySection.style.display = "none";
                }
            } else {
                querySection.style.display = "none";
            }
        }
    }

    // Query resolve button
    const queryResolveBtn = document.getElementById("query-resolve-btn");
    if (queryResolveBtn) {
        queryResolveBtn.addEventListener("click", () => {
            const dec = declarations.find(d => d.id === activeSelectedDeclarationId);
            if (!dec) return;
            const response = document.getElementById("query-response-notes").value || "Compliance statement submitted with supporting evidence.";
            dec.auditLogs.push({
                time: new Date().toISOString().slice(0, 16).replace("T", " "),
                text: `Query resolved: "${response}"`,
                type: "system"
            });
            dec.queryReason = null;
            if (dec.status === "QUERY") dec.status = "UNDER_REVIEW";
            updateGlobalKPIs();
            renderDeclarationDetails(activeSelectedDeclarationId);
            alert("Compliance response submitted successfully.");
        });
    }

    // Query escalate button
    const queryEscalateBtn = document.getElementById("query-escalate-btn");
    if (queryEscalateBtn) {
        queryEscalateBtn.addEventListener("click", () => {
            const dec = declarations.find(d => d.id === activeSelectedDeclarationId);
            if (!dec) return;
            dec.auditLogs.push({
                time: new Date().toISOString().slice(0, 16).replace("T", " "),
                text: "Query escalated to senior customs broker for resolution.",
                type: "system"
            });
            renderDeclarationDetails(activeSelectedDeclarationId);
            alert("Query escalated to senior customs broker.");
        });
    }

    // Amend Declaration
    const amendBtn = document.getElementById("detail-amend-btn");
    if (amendBtn) {
        amendBtn.addEventListener("click", () => {
            const dec = declarations.find(d => d.id === activeSelectedDeclarationId);
            if (!dec) return;
            if (dec.status === "CLEARED") {
                alert("This declaration has been cleared and cannot be amended.");
                return;
            }
            const newValue = prompt("Enter amended customs value ($):", dec.customsValue);
            if (newValue && !isNaN(newValue)) {
                dec.customsValue = parseFloat(newValue);
                dec.estimatedDuty = Math.round(dec.customsValue * dec.dutyRate / 100);
                dec.auditLogs.push({
                    time: new Date().toISOString().slice(0, 16).replace("T", " "),
                    text: `Declaration amended. New customs value: $${parseFloat(newValue).toLocaleString()}.`,
                    type: "system"
                });
                renderDeclarationDetails(activeSelectedDeclarationId);
                updateGlobalKPIs();
            }
        });
    }

    // Upload Doc button → switch to documents tab
    const detailUploadBtn = document.getElementById("detail-upload-doc-btn");
    if (detailUploadBtn) {
        detailUploadBtn.addEventListener("click", () => {
            const docsTab = document.querySelector('[data-tab="documents"]');
            if (docsTab) docsTab.click();
        });
    }

    // =========================================================================
    // CLEARANCE TRACKING
    // =========================================================================
    function renderClearanceTracking(id) {
        const dec = declarations.find(d => d.id === id);
        if (!dec) return;

        // Tracking label
        const trackLabel = document.getElementById("tracking-dec-label");
        if (trackLabel) trackLabel.textContent = dec.id;

        // Milestone Stepper
        const stepperContainer = document.getElementById("milestone-stepper-container");
        if (stepperContainer) {
            stepperContainer.innerHTML = "";
            dec.milestones.forEach(m => {
                const step = document.createElement("div");
                step.className = `milestone-step ${m.status}`;
                step.innerHTML = `
                    <div class="step-circle">
                        <i class="fa-solid ${m.status === 'completed' ? 'fa-check' : m.icon}"></i>
                    </div>
                    <span class="step-label">${m.label}</span>
                `;
                stepperContainer.appendChild(step);
            });
        }

        // Scan Details
        const scanContainer = document.getElementById("scan-details-container");
        if (scanContainer) {
            scanContainer.innerHTML = `
                <div class="scan-detail-row">
                    <span class="detail-label">Container Seal</span>
                    <span class="detail-value">${dec.scanDetails.containerSeal}</span>
                </div>
                <div class="scan-detail-row">
                    <span class="detail-label">Scan Type</span>
                    <span class="detail-value">${dec.scanDetails.scanType}</span>
                </div>
                <div class="scan-detail-row">
                    <span class="detail-label">Scan Result</span>
                    <span class="detail-value ${dec.scanDetails.scanResult.includes('No anomalies') ? 'pass' : 'warn'}">${dec.scanDetails.scanResult}</span>
                </div>
                <div class="scan-detail-row">
                    <span class="detail-label">Officer Notes</span>
                    <span class="detail-value">${dec.scanDetails.officerNotes}</span>
                </div>
            `;
        }

        // Scan status badge
        const scanBadge = document.getElementById("scan-status-badge");
        if (scanBadge) {
            const allCompleted = dec.milestones.every(m => m.status === "completed");
            const hasBlocked = dec.milestones.some(m => m.status === "blocked");
            if (allCompleted) {
                scanBadge.textContent = "Completed";
                scanBadge.className = "badge-pill nominal";
            } else if (hasBlocked) {
                scanBadge.textContent = "Blocked";
                scanBadge.className = "badge-pill critical";
            } else {
                scanBadge.textContent = "In Progress";
                scanBadge.className = "badge-pill warning";
            }
        }

        // Port Event Log
        const portBody = document.getElementById("port-events-body");
        if (portBody) {
            portBody.innerHTML = "";
            dec.portEvents.forEach(ev => {
                const statusClass = ev.status === "Passed" ? "passed" : ev.status === "Warn" ? "warn" : "hold";
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-variant-numeric: tabular-nums; white-space: nowrap;">${ev.time}</td>
                    <td>${ev.location}</td>
                    <td>${ev.event}</td>
                    <td style="font-weight: 500;">${ev.agency}</td>
                    <td><span class="status-pill ${statusClass}">${ev.status}</span></td>
                `;
                portBody.appendChild(tr);
            });
        }

        // Show escalation section if holds exist
        const escCard = document.getElementById("scan-escalation-card");
        if (escCard) {
            const hasHold = dec.milestones.some(m => m.status === "blocked") || dec.status === "HOLD";
            escCard.style.display = hasHold ? "block" : "none";
        }
    }

    // Escalation submit
    const submitEscalation = document.getElementById("submit-escalation-btn");
    if (submitEscalation) {
        submitEscalation.addEventListener("click", () => {
            const notes = document.getElementById("escalation-notes").value || "Inspection hold escalated.";
            const dec = declarations.find(d => d.id === activeSelectedDeclarationId);
            if (dec) {
                dec.auditLogs.push({
                    time: new Date().toISOString().slice(0, 16).replace("T", " "),
                    text: `Escalation report filed: "${notes}"`,
                    type: "hold"
                });
            }
            document.getElementById("escalation-notes").value = "";
            document.getElementById("scan-escalation-card").style.display = "none";
            alert("Inspection escalation report submitted to port authority.");
        });
    }

    const cancelEscalation = document.getElementById("cancel-escalation-btn");
    if (cancelEscalation) {
        cancelEscalation.addEventListener("click", () => {
            document.getElementById("scan-escalation-card").style.display = "none";
        });
    }

    // =========================================================================
    // DOCUMENT CENTER
    // =========================================================================
    const docSearchInput = document.getElementById("doc-search-input");
    const docTableBody = document.getElementById("doc-table-body");
    if (docSearchInput) docSearchInput.addEventListener("input", renderDocumentTable);

    function renderDocumentTable() {
        if (!docTableBody) return;
        docTableBody.innerHTML = "";

        const query = (docSearchInput ? docSearchInput.value : "").toLowerCase();
        const filtered = documents.filter(doc =>
            doc.name.toLowerCase().includes(query) ||
            doc.category.toLowerCase().includes(query) ||
            doc.declarationRef.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            docTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px; color: var(--text-muted);">No documents found.</td></tr>`;
            return;
        }

        filtered.forEach(doc => {
            let verClass = "verified";
            if (doc.verification === "Pending OCR") verClass = "pending-ocr";
            else if (doc.verification === "Rejected") verClass = "rejected";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 500; color: var(--text-primary);"><i class="fa-solid fa-file-pdf" style="color: var(--color-critical); margin-right: 6px;"></i>${doc.name}</td>
                <td>${doc.category}</td>
                <td><span class="port-badge">${doc.format}</span></td>
                <td><span class="declaration-link btn-doc-nav" data-id="${doc.declarationRef}">${doc.declarationRef}</span></td>
                <td><span class="status-pill ${verClass}">${doc.verification}</span></td>
                <td style="font-variant-numeric: tabular-nums;">${doc.uploadDate}</td>
                <td class="text-center">
                    <button class="btn secondary btn-sm" title="Download" style="margin-right: 4px;"><i class="fa-solid fa-download"></i></button>
                    <button class="btn secondary btn-sm btn-verify-doc" data-name="${doc.name}" title="Verify"><i class="fa-solid fa-circle-check"></i></button>
                </td>
            `;
            docTableBody.appendChild(tr);
        });

        // Nav to declaration details
        docTableBody.querySelectorAll(".btn-doc-nav").forEach(el => {
            el.addEventListener("click", () => {
                activeSelectedDeclarationId = el.getAttribute("data-id");
                const detailsTab = document.querySelector('[data-tab="declaration-details"]');
                if (detailsTab) detailsTab.click();
            });
        });

        // Verify action
        docTableBody.querySelectorAll(".btn-verify-doc").forEach(btn => {
            btn.addEventListener("click", () => {
                const docName = btn.getAttribute("data-name");
                const doc = documents.find(d => d.name === docName);
                if (doc) {
                    doc.verification = "Verified";
                    renderDocumentTable();
                    alert(`Document "${docName}" marked as Verified.`);
                }
            });
        });
    }

    // Document Category Card clicks
    const docVaultGrid = document.getElementById("doc-vault-grid");
    if (docVaultGrid) {
        docVaultGrid.querySelectorAll(".doc-category-card").forEach(card => {
            card.addEventListener("click", () => {
                const category = card.getAttribute("data-category");
                const searchMap = {
                    "commercial-invoice": "Commercial Invoice",
                    "packing-list": "Packing List",
                    "certificate-origin": "Certificate of Origin",
                    "import-license": "Import License",
                    "health-cert": "Health Certificate",
                    "bill-of-lading": "Bill of Lading"
                };
                if (docSearchInput) {
                    docSearchInput.value = searchMap[category] || "";
                    renderDocumentTable();
                }
            });
        });
    }

    // Dropzone
    const dropzone = document.getElementById("doc-dropzone");
    const fileInput = document.getElementById("doc-file-input");
    const ocrPanel = document.getElementById("ocr-panel");
    const ocrBody = document.getElementById("ocr-body");

    if (dropzone) {
        dropzone.addEventListener("click", () => { if (fileInput) fileInput.click(); });
        dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); });
        dropzone.addEventListener("dragleave", () => { dropzone.classList.remove("drag-over"); });
        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("drag-over");
            simulateOCR("Uploaded_Document.pdf");
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const fileName = fileInput.files[0] ? fileInput.files[0].name : "Uploaded_Document.pdf";
            simulateOCR(fileName);
        });
    }

    function simulateOCR(fileName) {
        if (!ocrPanel || !ocrBody) return;
        ocrPanel.classList.add("active");

        const statusBadge = document.getElementById("ocr-status-badge");
        if (statusBadge) {
            statusBadge.textContent = "Processing...";
            statusBadge.className = "badge-pill warning";
        }

        // Show loading spinner
        ocrBody.innerHTML = `
            <div class="ocr-loading">
                <div class="spinner"></div>
                <span class="spinner-text">AI extracting document fields from ${fileName}...</span>
            </div>
        `;

        // Simulate processing delay
        setTimeout(() => {
            if (statusBadge) {
                statusBadge.textContent = "Completed";
                statusBadge.className = "badge-pill nominal";
            }

            ocrBody.innerHTML = `
                <div class="ocr-field-row">
                    <span class="ocr-field-label">Document Type</span>
                    <span class="ocr-field-value">Commercial Invoice</span>
                </div>
                <div class="ocr-field-row">
                    <span class="ocr-field-label">Shipper Name</span>
                    <span class="ocr-field-value">Apex Global Logistics Ltd</span>
                </div>
                <div class="ocr-field-row">
                    <span class="ocr-field-label">Invoice Total</span>
                    <span class="ocr-field-value">$142,000.00</span>
                </div>
                <div class="ocr-field-row">
                    <span class="ocr-field-label">Cargo Weight</span>
                    <span class="ocr-field-value">12,480 kg</span>
                </div>
                <div class="ocr-field-row">
                    <span class="ocr-field-label">HS Code (Detected)</span>
                    <span class="ocr-field-value" style="color: var(--color-transit); font-weight: 700;">8471.30</span>
                </div>
                <div class="ocr-field-row">
                    <span class="ocr-field-label">Origin Country</span>
                    <span class="ocr-field-value">China (CN)</span>
                </div>
            `;

            // Add document to registry
            documents.push({
                name: fileName,
                category: "Commercial Invoice",
                format: fileName.split('.').pop().toUpperCase(),
                declarationRef: activeSelectedDeclarationId,
                verification: "Pending OCR",
                uploadDate: new Date().toISOString().slice(0, 10)
            });
            renderDocumentTable();
        }, 2500);
    }

    // Digital Signature
    const sigValidateBtn = document.getElementById("sig-validate-btn");
    if (sigValidateBtn) {
        sigValidateBtn.addEventListener("click", () => {
            const brokerId = document.getElementById("sig-broker-id").value;
            const pin = document.getElementById("sig-pin").value;
            const confirmed = document.getElementById("sig-confirm-checkbox").checked;

            if (!brokerId || !pin) {
                alert("Please enter Broker License ID and Authorization PIN.");
                return;
            }
            if (!confirmed) {
                alert("Please confirm the declaration accuracy checkbox before signing.");
                return;
            }

            const dec = declarations.find(d => d.id === activeSelectedDeclarationId);
            if (dec) {
                dec.auditLogs.push({
                    time: new Date().toISOString().slice(0, 16).replace("T", " "),
                    text: `E-Signature validated. Broker: ${brokerId}. Declaration digitally sealed.`,
                    type: "system"
                });
            }

            alert(`Declaration ${activeSelectedDeclarationId} has been digitally signed and sealed by Broker ${brokerId}.`);
            // Reset form
            document.getElementById("sig-broker-id").value = "";
            document.getElementById("sig-pin").value = "";
            document.getElementById("sig-confirm-checkbox").checked = false;
        });
    }

    const sigClearBtn = document.getElementById("sig-clear-btn");
    if (sigClearBtn) {
        sigClearBtn.addEventListener("click", () => {
            document.getElementById("sig-broker-id").value = "";
            document.getElementById("sig-pin").value = "";
            document.getElementById("sig-confirm-checkbox").checked = false;
        });
    }

    // =========================================================================
    // NEW DECLARATION WIZARD
    // =========================================================================
    const wizardNext = document.getElementById("wizard-next");
    const wizardPrev = document.getElementById("wizard-prev");
    const wizardSubmit = document.getElementById("wizard-submit");

    function resetWizard() {
        wizardCurrentStep = 1;
        updateWizardUI();
    }

    function updateWizardUI() {
        // Update step indicators
        document.querySelectorAll(".wizard-step-indicator").forEach(ind => {
            const step = parseInt(ind.getAttribute("data-wizard-step"));
            ind.classList.remove("active", "done");
            if (step === wizardCurrentStep) ind.classList.add("active");
            else if (step < wizardCurrentStep) ind.classList.add("done");
        });

        // Show/hide pages
        document.querySelectorAll(".wizard-page").forEach(page => page.classList.remove("active"));
        const activePage = document.getElementById(`wizard-page-${wizardCurrentStep}`);
        if (activePage) activePage.classList.add("active");

        // Prev/Next/Submit visibility
        if (wizardPrev) wizardPrev.style.display = wizardCurrentStep > 1 ? "inline-flex" : "none";
        if (wizardNext) wizardNext.style.display = wizardCurrentStep < 4 ? "inline-flex" : "none";
        if (wizardSubmit) wizardSubmit.style.display = wizardCurrentStep === 4 ? "inline-flex" : "none";
    }

    if (wizardNext) {
        wizardNext.addEventListener("click", () => {
            if (wizardCurrentStep < 4) {
                wizardCurrentStep++;
                updateWizardUI();
            }
        });
    }

    if (wizardPrev) {
        wizardPrev.addEventListener("click", () => {
            if (wizardCurrentStep > 1) {
                wizardCurrentStep--;
                updateWizardUI();
            }
        });
    }

    if (wizardSubmit) {
        wizardSubmit.addEventListener("click", () => {
            const shipmentId = document.getElementById("wiz-shipment-id").value || "SHP-MOCK";
            const type = document.getElementById("wiz-type").value;
            const consigneeSelect = document.getElementById("wiz-consignee");
            const consigneeName = consigneeSelect.options[consigneeSelect.selectedIndex].text.split(" (")[0];
            const clientCode = consigneeSelect.options[consigneeSelect.selectedIndex].text.split("(")[1].replace(")", "");
            const portSelect = document.getElementById("wiz-port");
            const port = portSelect.value;
            const hsCode = document.getElementById("wiz-hs-code").value || "0000.00";
            const commodity = document.getElementById("wiz-commodity").value || "General Cargo";
            const originSelect = document.getElementById("wiz-origin");
            const origin = originSelect.value;
            const qty = parseInt(document.getElementById("wiz-qty").value) || 1;
            const customsValue = parseFloat(document.getElementById("wiz-customs-value").value) || 0;
            const freightCost = parseFloat(document.getElementById("wiz-freight-cost").value) || 0;
            const tariffRate = parseFloat(document.getElementById("wiz-tariff-rate").value) || 0;
            const estimatedDuty = Math.round((customsValue + freightCost) * tariffRate / 100);

            const nextId = declarations.length + 9041;
            const newDec = {
                id: `DEC-2026-${nextId}`,
                shipmentId: shipmentId,
                type: type,
                declarant: consigneeName,
                clientCode: clientCode,
                port: port,
                mode: type === "EXPORT" ? "Air" : "Ocean",
                modeIcon: type === "EXPORT" ? "fa-plane" : "fa-ship",
                status: "DRAFT",
                customsValue: customsValue,
                dutyRate: tariffRate,
                estimatedDuty: estimatedDuty,
                hsItems: [
                    { hsCode: hsCode, description: commodity, origin: origin, value: customsValue, tariff: tariffRate, duty: estimatedDuty }
                ],
                compliance: [
                    { check: "Denied Party Screening", status: "pending" },
                    { check: "Import Permit Verified", status: "pending" },
                    { check: "Commercial Invoice Attached", status: "pending" },
                    { check: "Certificate of Origin Filed", status: "pending" },
                    { check: "Hazardous Declaration", status: "pending" },
                    { check: "Sanction List Cross-Check", status: "pending" }
                ],
                auditLogs: [
                    { time: new Date().toISOString().slice(0, 16).replace("T", " "), text: "Declaration created via New Declaration Wizard.", type: "system" }
                ],
                milestones: [
                    { label: "Port Arrival", icon: "fa-anchor", status: "pending" },
                    { label: "Doc Clearance", icon: "fa-file-circle-check", status: "pending" },
                    { label: "Inspection", icon: "fa-magnifying-glass", status: "pending" },
                    { label: "Duty Paid", icon: "fa-money-check-dollar", status: "pending" },
                    { label: "Release", icon: "fa-door-open", status: "pending" }
                ],
                scanDetails: {
                    containerSeal: "Pending assignment",
                    scanType: "Not scheduled",
                    scanResult: "N/A",
                    officerNotes: "Awaiting document clearance."
                },
                portEvents: [
                    { time: new Date().toISOString().slice(0, 16).replace("T", " "), location: "Digital Submission", event: "Declaration created and pending submission", agency: "System", status: "Passed" }
                ]
            };

            declarations.push(newDec);
            closeModal("new-declaration-modal");
            updateGlobalKPIs();
            renderDeclarationTable();
            alert(`Declaration ${newDec.id} successfully created. Status: DRAFT — submit to customs when ready.`);
        });
    }

    // =========================================================================
    // GLOBAL KPI UPDATES
    // =========================================================================
    function updateGlobalKPIs() {
        const activeCount = declarations.filter(d => d.status !== "CLEARED").length;
        const holdCount = declarations.filter(d => d.status === "HOLD").length;
        const totalDuty = declarations.filter(d => d.status !== "CLEARED").reduce((s, d) => s + d.estimatedDuty, 0);

        const kpiActive = document.getElementById("kpi-active-declarations");
        if (kpiActive) kpiActive.textContent = declarations.length;

        const kpiDuty = document.getElementById("kpi-duty-liability");
        if (kpiDuty) kpiDuty.textContent = `$${totalDuty.toLocaleString('en-US')}`;

        const kpiHolds = document.getElementById("kpi-active-holds");
        if (kpiHolds) kpiHolds.textContent = criticalAlerts.length;

        // Sidebar badges
        const pendingBadge = document.getElementById("pending-declarations-badge");
        if (pendingBadge) {
            pendingBadge.textContent = activeCount;
            pendingBadge.style.display = activeCount > 0 ? "block" : "none";
        }

        const docBadge = document.getElementById("doc-queries-badge");
        const rejectedDocs = documents.filter(d => d.verification === "Rejected" || d.verification === "Pending OCR").length;
        if (docBadge) {
            docBadge.textContent = rejectedDocs;
            docBadge.style.display = rejectedDocs > 0 ? "block" : "none";
        }

        // Holds bell pulse
        const bell = document.getElementById("holds-alert-trigger");
        if (bell) {
            if (criticalAlerts.length > 0) bell.classList.add("pulsing");
            else bell.classList.remove("pulsing");
        }
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    updateGlobalKPIs();
    renderAlertsQueue();
    renderHSQuickLookup();

});
