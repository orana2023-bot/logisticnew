// Hub Module State & Operations Engine
document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // Mock Telemetry Data Models
    // ----------------------------------------------------
    let shipments = [];

    async function loadShipments() {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            // Map backend fields to frontend expected fields
            shipments = data.map(b => ({
                id: b.tracking,
                realId: b.id, // Keep the actual DB ID for updates if needed
                mode: b.mode,
                payload: b.parcel,
                origin: b.pickup,
                destination: b.delivery,
                status: b.status,
                badgeClass: getBadgeClass(b.status),
                eta: b.eta || "TBD",
                progress: b.progress || 0
            }));
            executeFilters();
            updateStats();
        } catch (error) {
            console.error('Error loading shipments:', error);
        }
    }

    function getBadgeClass(status) {
        switch(status) {
            case 'Delivered': return 'nominal';
            case 'Shipped': return 'transit';
            case 'In-Transit': return 'transit';
            case 'Delayed': return 'warning';
            case 'Customs Hold': return 'critical';
            case 'Pending': return 'warning';
            default: return 'transit';
        }
    }

    let alerts = [
        { id: "ALT-001", code: "TRK-7749", severity: "critical", title: "Customs Regulatory Blockade", desc: "Kolkata Branch reports missing clearance seals on Container 4B.", actionText: "Resolve Block" },
        { id: "ALT-002", code: "TRK-1120", severity: "warning", title: "Inland Route Traffic Congestion", desc: "Roadway construction near Brandenburg border causing 4-hour delay.", actionText: "Re-route Vehicle" },
        { id: "ALT-003", code: "TRK-3011", severity: "critical", title: "Cold Chain Thermal Threshold Breached", desc: "Sensor B12 reports internal temperature at +6°C (Target: -18°C).", actionText: "Initiate Cooling Audit" }
    ];

    let carriers = [
        { name: "Maersk Logistics", sla: 98.4, color: "#10b981" },
        { name: "DHL Express", sla: 96.1, color: "#0ea5e9" },
        { name: "FedEx Trade Networks", sla: 91.8, color: "#f59e0b" },
        { name: "CMA CGM", sla: 84.5, color: "#ef4444" }
    ];

    // ----------------------------------------------------
    // Tab switching (View Navigation)
    // ----------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const views = document.querySelectorAll('.hub-view');
    const pageTitle = document.getElementById('view-title-text');
    const pageSubtitle = document.getElementById('view-subtitle-text');

    const subtitles = {
        'dashboard': 'Central control panel for active telemetry and overview analytics',
        'monitoring': 'Dynamic ledger tracking all active logistics waybills & containers',
        'alerts': 'Triage dashboard for exception holds, hazards, and sensor thresholds',
        'analytics': 'Historical SLA metrics, carrier compliance, and volume distribution'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');

            // Toggle active sidebar link
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch view panel
            views.forEach(view => view.classList.remove('active'));
            const activeView = document.getElementById(`${targetTab}-view`);
            if (activeView) activeView.classList.add('active');

            // Update title text
            pageTitle.innerText = item.querySelector('span').innerText;
            pageSubtitle.innerText = subtitles[targetTab];

            // Close drawers when navigating
            closeDrawer();
        });
    });

    // ----------------------------------------------------
    // Rendering Logic
    // ----------------------------------------------------

    // 1. Render Shipments Table
    const tbody = document.getElementById('shipments-tbody');
    function renderShipments(data) {
        if (!tbody) return;
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No matching active shipments found.</td></tr>`;
            return;
        }

        data.forEach(s => {
            tbody.innerHTML += `
                <tr data-shipment-id="${s.id}">
                    <td><strong>${s.id}</strong></td>
                    <td><span class="badge-pill ${s.badgeClass}">${s.status}</span></td>
                    <td><i class="fa-solid ${getModeIcon(s.mode)}"></i> ${s.mode}</td>
                    <td>${s.payload}</td>
                    <td>${s.origin}</td>
                    <td>${s.destination}</td>
                    <td>${s.eta}</td>
                </tr>
            `;
        });

        // Add Click Listeners to rows
        document.querySelectorAll('#shipments-tbody tr').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.getAttribute('data-shipment-id');
                const shipment = shipments.find(s => s.id === id);
                if (shipment) openDrawer(shipment);
            });
        });
    }

    function getModeIcon(mode) {
        switch(mode) {
            case 'Air': return 'fa-plane';
            case 'Ocean': return 'fa-ship';
            case 'Sea': return 'fa-ship';
            case 'Road': return 'fa-truck';
            case 'Rail': return 'fa-train';
            default: return 'fa-box';
        }
    }

    // 2. Render Exception & Alerts Panel
    const alertsContainer = document.getElementById('alerts-container');
    const alertsBadge = document.getElementById('alerts-nav-badge');

    function renderAlerts() {
        if (alertsBadge) alertsBadge.innerText = alerts.length;
        if (!alertsContainer) return;
        
        alertsContainer.innerHTML = '';
        if (alerts.length === 0) {
            alertsContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i class="fa-solid fa-check-circle" style="font-size: 2.5rem; color: var(--color-nominal); margin-bottom: 12px;"></i><p>Excellent. Zero unresolved operations alerts logged.</p></div>`;
            return;
        }

        alerts.forEach(a => {
            alertsContainer.innerHTML += `
                <div class="alert-strip ${a.severity}" data-alert-id="${a.id}">
                    <i class="fa-solid ${a.severity === 'critical' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}" style="font-size: 1.25rem;"></i>
                    <div>
                        <div class="alert-title">${a.title} (${a.code})</div>
                        <div class="alert-desc">${a.desc}</div>
                    </div>
                    <div class="alert-actions-group">
                        <button class="btn-pill primary action-resolve-btn" data-id="${a.id}" data-code="${a.code}">${a.actionText}</button>
                    </div>
                </div>
            `;
        });

        // Setup resolve click actions
        document.querySelectorAll('.action-resolve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertId = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                openResolutionModal(alertId, code);
            });
        });
    }

    // 3. Render Carrier Ratings Scorecards
    const carrierContainer = document.getElementById('carrier-rankings');
    function renderCarriers() {
        if (!carrierContainer) return;
        carrierContainer.innerHTML = '';
        carriers.forEach(c => {
            carrierContainer.innerHTML += `
                <div class="carrier-item">
                    <strong>${c.name}</strong>
                    <div class="carrier-progress-bar">
                        <div class="carrier-progress-fill" style="width: ${c.sla}%; background-color: ${c.color}"></div>
                    </div>
                    <span style="font-weight: 700; color: ${c.color}; text-align: right;">${c.sla}%</span>
                </div>
            `;
        });
    }

    // ----------------------------------------------------
    // Detail Slide-out Drawer Operations
    // ----------------------------------------------------
    const drawer = document.getElementById('detail-drawer');
    const drawerClose = document.getElementById('drawer-close');

    function openDrawer(s) {
        if (!drawer) return;
        
        document.getElementById('drawer-id').innerText = s.id;
        document.getElementById('drawer-payload').innerText = s.payload;
        document.getElementById('drawer-origin').innerText = s.origin;
        document.getElementById('drawer-destination').innerText = s.destination;
        document.getElementById('drawer-eta').innerText = s.eta;

        const timeline = document.getElementById('drawer-timeline');
        timeline.innerHTML = '';

        // Generate milestones based on shipment progress
        const stages = [
            { title: "Booking Confirmation & Waybill Issue", desc: `Port of ${s.origin.split(' ')[0]}`, time: "May 18, 08:30 AM" },
            { title: "Port Gated & Loaded", desc: "Cleared shipping stack inspectors", time: "May 20, 11:15 AM" },
            { title: "Customs Inspection Cleared", desc: "Regulatory clearance approved", time: s.progress > 40 ? "May 21, 04:00 PM" : "Awaiting clearance documents" },
            { title: "Vessel Dispatched / Gated Out", desc: "In Route to destination", time: s.progress >= 60 ? "May 22, 09:12 AM" : "En-route queue scheduled" },
            { title: "Arrival at Terminal", desc: `Port of ${s.destination.split(' ')[0]}`, time: s.progress === 100 ? "Completed" : "Scheduled Arrival" }
        ];

        stages.forEach((stage, idx) => {
            let statusClass = '';
            if (s.progress === 100) statusClass = 'completed';
            else if (s.status === 'Delayed' && idx === 3) statusClass = 'delayed';
            else if (idx * 25 < s.progress) statusClass = 'completed';
            else if (idx * 25 === Math.floor(s.progress / 25) * 25) statusClass = 'active';

            timeline.innerHTML += `
                <div class="milestone-step ${statusClass}">
                    <div class="milestone-dot"></div>
                    <div class="milestone-info">
                        <div class="milestone-title">${stage.title}</div>
                        <div class="milestone-desc">${stage.desc}</div>
                        <div class="milestone-time">${stage.time}</div>
                    </div>
                </div>
            `;
        });

        drawer.classList.add('open');
    }

    function closeDrawer() {
        if (drawer) drawer.classList.remove('open');
    }

    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

    // ----------------------------------------------------
    // Action Resolution Modal
    // ----------------------------------------------------
    const modal = document.getElementById('resolution-modal');
    const modalConfirm = document.getElementById('modal-confirm-btn');
    const modalCancel = document.getElementById('modal-cancel-btn');
    let activeResolvingId = null;

    function openResolutionModal(alertId, targetCode) {
        activeResolvingId = alertId;
        const alertItem = alerts.find(a => a.id === alertId);
        if (!alertItem || !modal) return;

        document.getElementById('modal-alert-title').innerText = alertItem.title;
        document.getElementById('modal-alert-desc').innerText = `Select resolving pathway for code ${targetCode}. Dispatch overrides will apply instantly to transport routing tables.`;
        modal.classList.add('open');
    }

    function closeResolutionModal() {
        if (modal) modal.classList.remove('open');
        activeResolvingId = null;
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            if (activeResolvingId) {
                // Remove alert from list
                const alertIndex = alerts.findIndex(a => a.id === activeResolvingId);
                const code = alerts[alertIndex].code;
                
                // If it's a customs hold, update the status of the shipment
                const targetShipment = shipments.find(s => s.id === code);
                if (targetShipment) {
                    targetShipment.status = "In-Transit";
                    targetShipment.badgeClass = "transit";
                    targetShipment.progress = 60;
                }

                alerts.splice(alertIndex, 1);
                
                // Re-render and close
                renderAlerts();
                renderShipments(shipments);
                updateStats();
                closeResolutionModal();
            }
        });
    }

    if (modalCancel) modalCancel.addEventListener('click', closeResolutionModal);

    // ----------------------------------------------------
    // Search & Filtering Logics
    // ----------------------------------------------------
    const searchInput = document.getElementById('ledger-search');
    const modeFilter = document.getElementById('mode-filter');
    const statusFilter = document.getElementById('status-filter');

    function executeFilters() {
        let filtered = [...shipments];
        const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const mode = modeFilter ? modeFilter.value : 'All';
        const status = statusFilter ? statusFilter.value : 'All';

        if (search) {
            filtered = filtered.filter(s => 
                s.id.toLowerCase().includes(search) || 
                s.payload.toLowerCase().includes(search) ||
                s.origin.toLowerCase().includes(search) ||
                s.destination.toLowerCase().includes(search)
            );
        }

        if (mode !== 'All') {
            filtered = filtered.filter(s => s.mode === mode);
        }

        if (status !== 'All') {
            filtered = filtered.filter(s => s.status === status);
        }

        renderShipments(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', executeFilters);
    if (modeFilter) modeFilter.addEventListener('change', executeFilters);
    if (statusFilter) statusFilter.addEventListener('change', executeFilters);

    // Global Header Search
    const globalSearchInput = document.getElementById('global-search-input');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const term = globalSearchInput.value.trim().toUpperCase();
                // Find shipment
                const found = shipments.find(s => s.id === term);
                if (found) {
                    // Navigate to ledger
                    const monitoringTabItem = document.querySelector('.nav-item[data-tab="monitoring"]');
                    if (monitoringTabItem) {
                        monitoringTabItem.click();
                        if (searchInput) {
                            searchInput.value = term;
                            executeFilters();
                        }
                    }
                    openDrawer(found);
                } else {
                    alert(`No active shipment matches code ${term}. Try searching "TRK-8921"`);
                }
                globalSearchInput.value = '';
            }
        });
    }

    // ----------------------------------------------------
    // Statistics & Visual telemetries
    // ----------------------------------------------------
    function updateStats() {
        const totalCount = shipments.length;
        const delayedCount = shipments.filter(s => s.status === 'Delayed').length;
        const exceptionCount = alerts.length;
        const transitPercentage = Math.round((shipments.filter(s => s.status === 'In-Transit').length / totalCount) * 100);

        document.getElementById('stat-total-shipments').innerText = totalCount;
        document.getElementById('stat-active-alerts').innerText = exceptionCount;
        document.getElementById('stat-delayed-trips').innerText = delayedCount;
        document.getElementById('stat-transit-percentage').innerText = `${transitPercentage}%`;

        // Pulse warning if exception count is high
        const alertCard = document.getElementById('alerts-kpi-card');
        if (alertCard) {
            if (exceptionCount > 0) {
                alertCard.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                alertCard.querySelector('.kpi-value').style.color = 'var(--color-critical)';
            } else {
                alertCard.style.borderColor = 'var(--border-color)';
                alertCard.querySelector('.kpi-value').style.color = 'var(--text-primary)';
            }
        }
    }

    // ----------------------------------------------------
    // Dynamic Telemetry Loop (Simulating WebSocket)
    // ----------------------------------------------------
    setInterval(() => {
        // We use live data now, so we refresh from backend
        loadShipments();

        // Tweak carrier SLAs marginally
        carriers.forEach(c => {
            const shift = (Math.random() - 0.5) * 0.2;
            c.sla = Math.min(Math.max(parseFloat((c.sla + shift).toFixed(1)), 80), 100);
        });

        // Trigger updates
        renderCarriers();
        updateCharts();

    }, 10000); // 10 seconds refresh

    // Render static charts bar sizing
    function updateCharts() {
        const barShanghai = document.getElementById('bar-shanghai');
        const barFrankfurt = document.getElementById('bar-frankfurt');
        const barRotterdam = document.getElementById('bar-rotterdam');
        const barSantos = document.getElementById('bar-santos');

        if (barShanghai) barShanghai.style.height = '85%';
        if (barFrankfurt) barFrankfurt.style.height = '60%';
        if (barRotterdam) barRotterdam.style.height = '45%';
        if (barSantos) barSantos.style.height = '70%';
    }

    // ----------------------------------------------------
    // Initializer
    // ----------------------------------------------------
    loadShipments();
    renderAlerts();
    renderCarriers();
    setTimeout(updateCharts, 300);
});
