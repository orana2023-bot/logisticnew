// MyFinance Operations & Accounting Engine
document.addEventListener("DOMContentLoaded", () => {

    // =========================================================================
    // STATE ENGINE (Mock Ledger Database)
    // =========================================================================
    
    let invoices = [];
    let pendingApprovals = [];

    async function loadInvoices() {
        try {
            const response = await fetch('/api/invoices');
            invoices = await response.json();
            renderInvoiceTable();
            updateGlobalKPIs();
        } catch (error) {
            console.error('Error loading invoices:', error);
        }
    }

    async function loadApprovals() {
        try {
            const response = await fetch('/api/approvals');
            pendingApprovals = await response.json();
            renderApprovalsList();
        } catch (error) {
            console.error('Error loading approvals:', error);
        }
    }

    function renderApprovalsList() {
        const container = document.getElementById('approvals-list-container');
        const badge = document.getElementById('approvals-count-badge');
        if (badge) badge.innerText = `${pendingApprovals.length} Tasks`;
        if (!container) return;
        
        container.innerHTML = '';
        pendingApprovals.forEach(app => {
            container.innerHTML += `
                <div class="approval-item">
                    <div class="item-icon"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    <div class="item-info">
                        <strong>${app.type}</strong>
                        <p>${app.description}</p>
                        <small>Requested by: ${app.requested_by}</small>
                    </div>
                </div>
            `;
        });
    }

    let transactions = [
        { ref: "TXN-778901", time: "2026-05-22 09:12", customer: "Apex Global Logistics Ltd", method: "ACH Wire", amount: 6450.00, matchedInvoice: "INV-2026-8911", integrity: "SETTLED" },
        { ref: "TXN-778902", time: "2026-05-21 15:40", customer: "Euro-Baltic Import Group", method: "Bank Transfer", amount: 11200.00, matchedInvoice: "INV-2026-8915", integrity: "SETTLED" }
    ];

    // Approvals are loaded via loadApprovals()

    let unmatchedWires = [
        { ref: "WIRE-MOCK-991", customer: "Trans-Pacific Industries", amount: 14850.00, matchedInvId: "INV-2026-8912", matchScore: 98 },
        { ref: "WIRE-MOCK-992", customer: "Apex Global Logistics Ltd", amount: 22400.00, matchedInvId: "INV-2026-8914", matchScore: 95 }
    ];

    let activeSelectedInvoiceId = "INV-2026-8911";

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

            // Re-render sub-components if needed
            if (tabName === "invoices") {
                renderInvoiceTable();
            } else if (tabName === "invoice-details") {
                renderInvoiceDetails(activeSelectedInvoiceId);
            } else if (tabName === "payments") {
                renderPaymentReconciliation();
                renderTransactionLedger();
            } else if (tabName === "outstanding") {
                renderOutstandingDues();
            }
        });
    });

    // =========================================================================
    // MODAL CONTROL UTILITIES
    // =========================================================================
    function setupModal(modalId, triggerId, cancelId) {
        const modal = document.getElementById(modalId);
        const trigger = document.getElementById(triggerId);
        const cancel = document.getElementById(cancelId);

        if (trigger) {
            trigger.addEventListener("click", () => modal.classList.add("active"));
        }
        if (cancel) {
            cancel.addEventListener("click", () => {
                modal.classList.remove("active");
                // Reset calculator outputs if closing calc
                if (modalId === "calc-modal") {
                    document.getElementById("calc-results-section").style.display = "none";
                }
            });
        }
    }

    setupModal("calc-modal", "trigger-calc-btn", "calc-modal-cancel");
    setupModal("new-invoice-modal", "trigger-new-invoice-btn", "new-invoice-cancel");

    // =========================================================================
    // INTERACTIVE FREIGHT ESTIMATOR
    // =========================================================================
    const calcSubmitBtn = document.getElementById("calc-modal-calculate");
    if (calcSubmitBtn) {
        calcSubmitBtn.addEventListener("click", () => {
            const weight = parseFloat(document.getElementById("calc-weight").value) || 10;
            const volume = parseFloat(document.getElementById("calc-vol").value) || 25;
            const origin = document.getElementById("calc-origin").value;
            const dest = document.getElementById("calc-dest").value;

            // Simple estimation math simulation
            let distanceCoeff = 1.0;
            if ((origin === "SHA" && dest === "ROT") || (origin === "ROT" && dest === "SHA")) distanceCoeff = 2.4;
            if ((origin === "LAX" && dest === "SHA") || (origin === "SHA" && dest === "LAX")) distanceCoeff = 1.8;
            if ((origin === "ROT" && dest === "LAX") || (origin === "LAX" && dest === "ROT")) distanceCoeff = 2.0;

            const baseFreight = (weight * 120 + volume * 15) * distanceCoeff;
            const surcharges = baseFreight * 0.15 + 250; // Fuel & Ancillary
            const tax = (baseFreight + surcharges) * 0.18; // 18% Tax average
            const grandTotal = baseFreight + surcharges + tax;

            document.getElementById("calc-res-base").innerText = `$${baseFreight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            document.getElementById("calc-res-surcharges").innerText = `$${surcharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            document.getElementById("calc-res-tax").innerText = `$${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            document.getElementById("calc-res-total").innerText = `$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            document.getElementById("calc-results-section").style.display = "block";
        });
    }

    // =========================================================================
    // NEW INVOICE INTAKE CREATOR
    // =========================================================================
    const newInvoiceBtn = document.getElementById("new-invoice-submit");
    if (newInvoiceBtn) {
        newInvoiceBtn.addEventListener("click", () => {
            const customerSelect = document.getElementById("new-inv-customer");
            const customerName = customerSelect.options[customerSelect.selectedIndex].text.split(" (")[0];
            const clientCode = customerSelect.options[customerSelect.selectedIndex].text.split(" (")[1].replace(")", "");
            
            const bookingId = document.getElementById("new-inv-booking").value || "BKG-MOCK";
            const route = document.getElementById("new-inv-route").value || "SHA ➔ ROT";
            const baseAmount = parseFloat(document.getElementById("new-inv-base").value) || 1000;
            const surcharges = parseFloat(document.getElementById("new-inv-surcharges").value) || 200;
            const tax = (baseAmount + surcharges) * 0.18;
            const grandTotal = baseAmount + surcharges + tax;

            const newInv = {
                invoice_id: `INV-2026-${nextIdNumber}`,
                customer_name: customerName,
                client_code: clientCode,
                booking_id: bookingId,
                route: route,
                amount: grandTotal,
                base_amount: baseAmount,
                surcharges: surcharges,
                tax: tax,
                due_date: "2026-06-22",
                issue_date: "2026-05-22",
                status: "PENDING"
            };

            fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInv)
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById("new-invoice-modal").classList.remove("active");
                    loadInvoices(); // Refresh everything
                    alert(`Invoice ${newInv.invoice_id} successfully generated and posted to ledger.`);
                } else {
                    alert('Error creating invoice: ' + data.message);
                }
            });
        });
    }

    // =========================================================================
    // INVOICE LEDGER DATATABLE
    // =========================================================================
    const searchFilter = document.getElementById("invoice-search-filter");
    const statusFilter = document.getElementById("filter-invoice-status");
    const tableBody = document.getElementById("invoice-table-body");

    if (searchFilter) searchFilter.addEventListener("input", renderInvoiceTable);
    if (statusFilter) statusFilter.addEventListener("change", renderInvoiceTable);

    function renderInvoiceTable() {
        if (!tableBody) return;
        tableBody.innerHTML = "";

        const query = searchFilter.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        const filtered = invoices.filter(inv => {
            const matchesSearch = inv.id.toLowerCase().includes(query) || 
                                  inv.customer.toLowerCase().includes(query) ||
                                  inv.clientCode.toLowerCase().includes(query) ||
                                  inv.bookingId.toLowerCase().includes(query);
            const matchesStatus = (selectedStatus === "ALL") || (inv.status === selectedStatus);
            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 24px; color: var(--text-muted);">No invoices found matching criteria.</td></tr>`;
            return;
        }

        filtered.forEach(inv => {
            tr.innerHTML = `
                <td><input type="checkbox" class="invoice-row-check" value="${inv.invoice_id}"></td>
                <td><span class="invoice-link" data-id="${inv.invoice_id}">${inv.invoice_id}</span></td>
                <td>
                    <span class="client-name-cell">${inv.customer_name}</span>
                    <span class="client-code">${inv.client_code}</span>
                </td>
                <td><strong>${inv.booking_id}</strong></td>
                <td><span class="route-badge"><i class="fa-solid fa-plane-departure" style="font-size: 0.75rem;"></i> ${inv.route}</span></td>
                <td class="text-right"><span class="amount">$${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                <td>${inv.due_date}</td>
                <td><span class="status-pill ${inv.status.toLowerCase()}">${inv.status}</span></td>
                <td class="text-center">
                    <button class="btn secondary btn-sm action-inspect-btn" data-id="${inv.invoice_id}" title="Inspect Details">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Add event listeners on links
        tableBody.querySelectorAll(".invoice-link, .action-inspect-btn").forEach(el => {
            el.addEventListener("click", () => {
                const targetId = el.getAttribute("data-id");
                activeSelectedInvoiceId = targetId;
                
                // Navigate to details tab
                const detailsTab = document.querySelector('[data-tab="invoice-details"]');
                if (detailsTab) detailsTab.click();
            });
        });
    }

    // =========================================================================
    // INVOICE DETAILS WORKSPACE
    // =========================================================================
    const detailChargesBody = document.getElementById("detail-charges-body");

    async function renderInvoiceDetails(id) {
        try {
            const response = await fetch(`/api/invoices/${id}`);
            const inv = await response.json();
            
            if (!inv.invoice_id) return;

            document.getElementById("detail-invoice-id").innerText = inv.invoice_id;
            document.getElementById("detail-issue-date").innerText = inv.issue_date;
            document.getElementById("detail-client-name").innerText = `${inv.customer_name} (${inv.client_code})`;
            document.getElementById("detail-booking-id").innerText = inv.booking_id;

        // Render status badge
        const badge = document.getElementById("detail-status-badge");
        badge.className = `invoice-status-pill status-pill ${inv.status.toLowerCase()}`;
        badge.innerText = inv.status;

        // Populate itemized charges
        if (detailChargesBody) {
            detailChargesBody.innerHTML = `
                <tr>
                    <td>Standard Ocean Freight Transport Rate</td>
                    <td>$${inv.base_amount.toLocaleString()} / Shipment</td>
                    <td class="text-right">1</td>
                    <td class="text-right">0%</td>
                    <td class="text-right amount-cell">$${inv.base_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td>CHG-FL-02</td>
                    <td>Fluctuation Fuel Adjustments Surcharge</td>
                    <td>$${(inv.surcharges * 0.7).toLocaleString('en-US', { maximumFractionDigits: 0 })} / Unit</td>
                    <td class="text-right">1</td>
                    <td class="text-right">0%</td>
                    <td class="text-right amount-cell">$${(inv.surcharges * 0.7).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td>CHG-AN-05</td>
                    <td>Ancillary Security Surcharges</td>
                    <td>$${(inv.surcharges * 0.3).toLocaleString('en-US', { maximumFractionDigits: 0 })} / Unit</td>
                    <td class="text-right">1</td>
                    <td class="text-right">0%</td>
                    <td class="text-right amount-cell">$${(inv.surcharges * 0.3).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td>CHG-TX-09</td>
                    <td>Value Added Tax (Taxes / GST)</td>
                    <td>18% Value Ratio</td>
                    <td class="text-right">1</td>
                    <td class="text-right">18%</td>
                    <td class="text-right amount-cell">$${inv.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        }

        // Totals summary
        document.getElementById("detail-total-net").innerText = `$${inv.base_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById("detail-total-surcharges").innerText = `$${inv.surcharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById("detail-total-tax").innerText = `$${inv.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById("detail-total-grand").innerText = `$${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Populate Audit logs timeline
        const timeline = document.getElementById("detail-audit-timeline");
        if (timeline) {
            timeline.innerHTML = "";
            inv.auditLogs.forEach((log, index) => {
                const step = document.createElement("div");
                step.className = `timeline-step ${index === inv.auditLogs.length - 1 ? 'active' : ''} ${log.type === 'dispute' ? 'hold' : ''}`;
                step.innerHTML = `
                    <div class="timeline-content">
                        <div class="timeline-title">${log.log_text}</div>
                        <div class="timeline-desc"><i class="fa-solid fa-clock"></i> ${log.log_time} &middot; Mode: ${log.log_type.toUpperCase()}</div>
                    </div>
                `;
                timeline.appendChild(step);
            });
        }

        // Handle dispute panel visibility
        const disputeSection = document.getElementById("active-dispute-section");
        if (disputeSection) {
            if (inv.status === "DISPUTED") {
                disputeSection.style.display = "block";
                document.getElementById("dispute-reason-text").innerText = inv.dispute_reason || "Dispute reason not specified.";
            } else {
                disputeSection.style.display = "none";
            }
        } catch (error) {
            console.error('Error loading invoice details:', error);
        }
    }

    // Raise Dispute Action button trigger
    const raiseDisputeBtn = document.getElementById("details-dispute-btn");
    if (raiseDisputeBtn) {
        raiseDisputeBtn.addEventListener("click", () => {
            const reason = prompt("Enter billing dispute reason code / explanation:");
            if (reason) {
                fetch(`/api/invoices/${activeSelectedInvoiceId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: "DISPUTED", dispute_reason: reason })
                }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadInvoices();
                        renderInvoiceDetails(activeSelectedInvoiceId);
                    }
                });
            }
        });
    }

    // Resolve Dispute: Issue Credit Note
    const approveCreditBtn = document.getElementById("dispute-approve-credit-btn");
    if (approveCreditBtn) {
        approveCreditBtn.addEventListener("click", () => {
            const notes = document.getElementById("dispute-override-notes").value || "Credit note offset balance override.";
            
            fetch(`/api/invoices/${activeSelectedInvoiceId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "PAID", dispute_reason: null })
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadInvoices();
                    renderInvoiceDetails(activeSelectedInvoiceId);
                }
            });
        });
    }

    // Reject dispute claim
    const rejectDisputeBtn = document.getElementById("dispute-reject-btn");
    if (rejectDisputeBtn) {
        rejectDisputeBtn.addEventListener("click", () => {
            const notes = document.getElementById("dispute-override-notes").value || "No discrepancies found in base transport calculations.";
            
            fetch(`/api/invoices/${activeSelectedInvoiceId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "OVERDUE", dispute_reason: notes })
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadInvoices();
                    renderInvoiceDetails(activeSelectedInvoiceId);
                }
            });
        });
    }

    // Print/Download Statement simulation
    const detailsPrintBtn = document.getElementById("details-print-btn");
    if (detailsPrintBtn) {
        detailsPrintBtn.addEventListener("click", () => {
            alert(`Generating clean PDF financial invoice receipt for ${activeSelectedInvoiceId}... File downloaded successfully.`);
        });
    }

    // =========================================================================
    // PAYMENT TRACKING / RECONCILIATION
    // =========================================================================
    const reconcileSplitContainer = document.getElementById("reconcile-split-container");
    const txnTableBody = document.getElementById("txn-table-body");
    const txnSearchInput = document.getElementById("txn-search-input");

    if (txnSearchInput) txnSearchInput.addEventListener("input", renderTransactionLedger);

    function renderPaymentReconciliation() {
        if (!reconcileSplitContainer) return;
        reconcileSplitContainer.innerHTML = "";

        if (unmatchedWires.length === 0) {
            reconcileSplitContainer.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.85rem;">All incoming wires successfully reconciled with billing ledgers.</div>`;
            return;
        }

        unmatchedWires.forEach(wire => {
            const card = document.createElement("div");
            card.className = "matching-card";
            card.innerHTML = `
                <div class="matching-header">
                    <span class="match-source"><i class="fa-solid fa-receipt"></i> WIRE REF: ${wire.ref}</span>
                    <span class="match-percentage">${wire.matchScore}% Match Rate</span>
                </div>
                <div class="match-details">
                    <div>Sender Account: <strong>${wire.customer}</strong></div>
                    <div>Incoming Amount: <strong>$${wire.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                    <div style="margin-top: 4px; font-size: 0.75rem; color: var(--text-muted);">
                        Auto-mapped: Invoice <strong>${wire.matchedInvId}</strong> matches amount perfectly.
                    </div>
                </div>
                <button class="btn nominal btn-sm btn-reconcile-confirm" data-ref="${wire.ref}" style="margin-top: 4px; width: 100%;">
                    Confirm Ledger Match
                </button>
            `;
            reconcileSplitContainer.appendChild(card);
        });

        // Match Wire button action
        reconcileSplitContainer.querySelectorAll(".btn-reconcile-confirm").forEach(btn => {
            btn.addEventListener("click", () => {
                const ref = btn.getAttribute("data-ref");
                const wire = unmatchedWires.find(w => w.ref === ref);
                if (!wire) return;

                // Move wire to transactions database
                transactions.push({
                    ref: wire.ref,
                    time: "2026-05-22 12:57",
                    customer: wire.customer,
                    method: "ACH Transfer",
                    amount: wire.amount,
                    matchedInvoice: wire.matchedInvId,
                    integrity: "SETTLED"
                });

                // Update invoice status to PAID
                const inv = invoices.find(i => i.id === wire.matchedInvId);
                if (inv) {
                    inv.status = "PAID";
                    inv.auditLogs.push({
                        time: "2026-05-22 12:57",
                        text: `Reconciliation match completed. Wire reference: ${wire.ref}. Status set to PAID.`,
                        type: "system"
                    });
                }

                // Remove wire from unmatched
                unmatchedWires = unmatchedWires.filter(w => w.ref !== ref);

                // Update interfaces
                updateGlobalKPIs();
                renderPaymentReconciliation();
                renderTransactionLedger();
                alert(`Bank reconciliation match confirmed for transaction reference: ${ref}`);
            });
        });
    }

    function renderTransactionLedger() {
        if (!txnTableBody) return;
        txnTableBody.innerHTML = "";

        const query = txnSearchInput.value.toLowerCase();
        const filtered = transactions.filter(t => {
            return t.ref.toLowerCase().includes(query) || 
                   t.customer.toLowerCase().includes(query) ||
                   t.matchedInvoice.toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            txnTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 16px; color: var(--text-muted);">No transaction logs found.</td></tr>`;
            return;
        }

        filtered.forEach(t => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${t.ref}</strong></td>
                <td>${t.time}</td>
                <td><span class="client-name-cell">${t.customer}</span></td>
                <td><span class="route-badge"><i class="fa-solid fa-building-columns"></i> ${t.method}</span></td>
                <td class="text-right"><span class="amount" style="color: var(--color-nominal); font-weight: 700;">+$${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                <td><span class="invoice-link btn-inspect-txn-inv" data-id="${t.matchedInvoice}">${t.matchedInvoice}</span></td>
                <td><span class="status-pill paid"><i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> ${t.integrity}</span></td>
            `;
            txnTableBody.appendChild(tr);
        });

        txnTableBody.querySelectorAll(".btn-inspect-txn-inv").forEach(el => {
            el.addEventListener("click", () => {
                activeSelectedInvoiceId = el.getAttribute("data-id");
                const detailsTab = document.querySelector('[data-tab="invoice-details"]');
                if (detailsTab) detailsTab.click();
            });
        });
    }

    // =========================================================================
    // OUTSTANDING RECEIVABLES & AGING LEDGER
    // =========================================================================
    const agingTableBody = document.getElementById("aging-table-body");
    let activeDunningClient = "";
    let activeDunningInvoiceId = "";

    function renderOutstandingDues() {
        if (!agingTableBody) return;
        agingTableBody.innerHTML = "";

        // Summarize dues by client account
        const clientSummaries = {};
        invoices.forEach(inv => {
            if (inv.status === "PAID") return;
            
            if (!clientSummaries[inv.customer_name]) {
                clientSummaries[inv.customer_name] = {
                    clientCode: inv.client_code,
                    total: 0,
                    bucket1: 0, // 0-30 days
                    bucket2: 0, // 31-60 days
                    bucket3: 0, // 61-90 days
                    bucket4: 0, // 90+ days
                    invoiceId: inv.invoice_id,
                    dunningLevel: "Normal",
                    dunningLevelNum: 0
                };
            }

            const data = clientSummaries[inv.customer_name];
            data.total += inv.amount;

            // Mock bucketing placement based on actual invoice objects
            if (inv.invoice_id === "INV-2026-8913") {
                data.bucket3 += inv.amount;
                data.dunningLevel = "Dispute Held";
                data.dunningLevelNum = 2;
            } else if (inv.invoice_id === "INV-2026-8912") {
                data.bucket1 += inv.amount;
                data.dunningLevel = "Overdue Warning";
                data.dunningLevelNum = 1;
            } else if (inv.invoice_id === "INV-2026-8914") {
                data.bucket4 += inv.amount;
                data.dunningLevel = "Direct Hold Escalation";
                data.dunningLevelNum = 3;
            } else {
                data.bucket2 += inv.amount;
                data.dunningLevel = "Warning Pending";
                data.dunningLevelNum = 1;
            }
        });

        const accounts = Object.keys(clientSummaries);
        if (accounts.length === 0) {
            agingTableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 24px; color: var(--text-muted);">No client accounts currently have outstanding balances.</td></tr>`;
            return;
        }

        accounts.forEach(client => {
            const summary = clientSummaries[client];
            const tr = document.createElement("tr");

            let levelClass = "paid";
            if (summary.dunningLevelNum === 1) levelClass = "pending";
            if (summary.dunningLevelNum >= 2) levelClass = "overdue";

            tr.innerHTML = `
                <td>
                    <span class="client-name-cell">${client}</span>
                    <span class="client-code">${summary.clientCode}</span>
                </td>
                <td class="text-right"><strong>$${summary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                <td class="text-right">$${summary.bucket1.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">$${summary.bucket2.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="text-right">$${summary.bucket3.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="text-right" style="color: var(--color-critical); font-weight: 700;">$${summary.bucket4.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td><span class="status-pill ${levelClass}">${summary.dunningLevel}</span></td>
                <td class="text-center">
                    <button class="btn primary btn-sm action-dun-btn" data-client="${client}" data-invoice="${summary.invoiceId}">
                        <i class="fa-solid fa-paper-plane"></i> Send Notice
                    </button>
                </td>
            `;
            agingTableBody.appendChild(tr);
        });

        // Wire click events on notices button
        agingTableBody.querySelectorAll(".action-dun-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                activeDunningClient = btn.getAttribute("data-client");
                activeDunningInvoiceId = btn.getAttribute("data-invoice");

                // Launch dunning modal and preset text
                const dunningModal = document.getElementById("dunning-modal");
                dunningModal.classList.add("active");
                updateDunningTemplate(1);
            });
        });
    }

    // Setup template switching on select drop-down change
    const dunningSelect = document.getElementById("dunning-template");
    if (dunningSelect) {
        dunningSelect.addEventListener("change", () => {
            updateDunningTemplate(dunningSelect.value);
        });
    }

    function updateDunningTemplate(level) {
        const textSection = document.getElementById("dunning-body");
        if (!textSection) return;

        const inv = invoices.find(i => i.invoice_id === activeDunningInvoiceId);
        const amountStr = inv ? `$${inv.amount.toLocaleString()}` : "$0.00";

        if (level == "1") {
            textSection.value = `DEAR ACCOUNTS PAYABLE MANAGER,\n\nThis is a standard payment reminder that outstanding Invoice ${activeDunningInvoiceId} (${amountStr}) was due on ${inv ? inv.due_date : 'breach date'}.\n\nPlease remit payment at your earliest convenience.\n\nBest Regards,\nSATTAR EXIM LLP Finance Treasury Center`;
        } else if (level == "2") {
            textSection.value = `URGENT NOTICE: STATEMENT OVERDUE\n\nYour account has been flagged for non-payment of balance ${amountStr} associated with freight invoice reference ${activeDunningInvoiceId}.\n\nLate fees may apply unless remittance confirmation is received within 48 hours.\n\nFinance Department,\nSATTAR EXIM LLP logistics`;
        } else if (level == "3") {
            textSection.value = `ADMINISTRATIVE DIRECTIVE: DISPATCH HOLD\n\nYour account is in formal default of ${amountStr}.\n\nUnless full invoice settlement is received, operational holds will be applied to all active cargo containers under Booking Ref: ${inv ? inv.booking_id : 'Pending'}.\n\nSATTAR EXIM LLP Legal & Compliance Operations`;
        }
    }

    // Modal submit Send notice
    const sendDunningBtn = document.getElementById("dunning-modal-send");
    if (sendDunningBtn) {
        sendDunningBtn.addEventListener("click", () => {
            const body = document.getElementById("dunning-body").value;
            const inv = invoices.find(i => i.id === activeDunningInvoiceId);
            if (inv) {
                inv.auditLogs.push({
                    time: "2026-05-22 12:57",
                    text: `Dunning notices sent to client. Body: "${body.substring(0, 50)}..."`,
                    type: "dunning"
                });
            }

            document.getElementById("dunning-modal").classList.remove("active");
            alert(`Dunning collection alert successfully dispatched to ${activeDunningClient}.`);
            renderOutstandingDues();
        });
    }

    const cancelDunningBtn = document.getElementById("dunning-modal-cancel");
    if (cancelDunningBtn) {
        cancelDunningBtn.addEventListener("click", () => {
            document.getElementById("dunning-modal").classList.remove("active");
        });
    }

    // =========================================================================
    // LIVE KPI TELEMETRY & APPROVAL ACTIONS
    // =========================================================================
    async function updateGlobalKPIs() {
        try {
            const response = await fetch('/api/finance/stats');
            const stats = await response.json();
            
            let totalRevenue = 0;
            let totalReceivables = 0;
            let activeDisputes = 0;
            let totalUnpaidCount = 0;

            stats.forEach(s => {
                if (s.status === "PAID") {
                    totalRevenue += s.total_amount;
                } else {
                    totalReceivables += s.total_amount;
                    totalUnpaidCount += s.count;
                    if (s.status === "DISPUTED") {
                        activeDisputes += s.count;
                    }
                }
            });

            // Render counters
            const revEl = document.getElementById("kpi-mtd-revenue");
            if (revEl) revEl.innerText = `$${(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
            const recEl = document.getElementById("kpi-total-receivables");
            if (recEl) recEl.innerText = `$${(totalReceivables).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
            const disEl = document.getElementById("kpi-active-disputes");
            if (disEl) disEl.innerText = activeDisputes;

            // Updated side menu badges if they exist
            const dispBadge = document.getElementById("disputed-invoices-badge");
            if (dispBadge) {
                dispBadge.innerText = activeDisputes;
                dispBadge.style.display = activeDisputes > 0 ? "block" : "none";
            }

            const ovrBadge = document.getElementById("overdue-dues-badge");
            const overdueCount = stats.find(s => s.status === "OVERDUE")?.count || 0;
            if (ovrBadge) {
                ovrBadge.innerText = overdueCount;
                ovrBadge.style.display = overdueCount > 0 ? "block" : "none";
            }
        } catch (error) {
            console.error('Error updating KPIs:', error);
        }
    }

    // Initial Loaders
    async function init() {
        await loadInvoices();
        await loadApprovals();
        updateGlobalKPIs();
    }
    init();
});
