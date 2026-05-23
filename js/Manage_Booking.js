// Manage Bookings Operations Engine
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // Storage & State Sync
    // ----------------------------------------------------
    let bookings = [];

    let currentEditIdx = null;

    async function loadBookings() {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            bookings = data;
            renderRegistry(bookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    }

    function generateTracking() {
        return "TRK" + Math.floor(Math.random() * 900000 + 100000);
    }

    // ----------------------------------------------------
    // Tab switching (Dashboard vs Create Wizard)
    // ----------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const views = document.querySelectorAll('.viewport-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');

            // Switch Nav Selection
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch View Selection
            views.forEach(view => view.classList.remove('active'));
            const activeView = document.getElementById(`${targetTab}-view`);
            if (activeView) activeView.classList.add('active');

            // Close drawers
            closeDrawer();
            
            // Discard active edit flags if navigating away from wizard
            if (targetTab !== 'create-wizard') {
                resetWizardForm();
            }
        });
    });

    // ----------------------------------------------------
    // Wizard Stepper Lifecycle (Create Wizard)
    // ----------------------------------------------------
    let currentStep = 1;
    const stepNodes = document.querySelectorAll('.step-node');
    const wizardPanes = document.querySelectorAll('.wizard-pane');
    const stepperFill = document.querySelector('.stepper-bar-fill');
    
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    // Auto-update price quote on inputs
    const inputPrice = document.getElementById('price');
    const quotePrice = document.getElementById('quote-price-value');
    const selectMode = document.getElementById('transport-mode');

    function updatePriceEstimation() {
        const weight = parseFloat(document.getElementById('parcel-weight').value) || 0;
        const volume = parseFloat(document.getElementById('parcel-volume').value) || 0;
        const mode = selectMode.value;

        let multiplier = 1200;
        if (mode === 'Air') multiplier = 4500;
        else if (mode === 'Road') multiplier = 800;
        else if (mode === 'Rail') multiplier = 1500;

        const computedPrice = Math.max(Math.round((weight * 250 + volume * 400) * (multiplier / 1000)), 15000);
        if (inputPrice && !currentEditIdx) {
            inputPrice.value = computedPrice;
        }
        if (quotePrice) {
            quotePrice.innerText = `₹${computedPrice.toLocaleString()}`;
        }
    }

    // Bind event listeners for real-time quote updating
    ['parcel-weight', 'parcel-volume'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePriceEstimation);
    });
    if (selectMode) selectMode.addEventListener('change', updatePriceEstimation);

    function updateStepUI() {
        // Stepper Progress Line Fill
        const percentage = ((currentStep - 1) / (stepNodes.length - 1)) * 100;
        if (stepperFill) stepperFill.style.width = `${percentage}%`;

        // Update step states
        stepNodes.forEach((node, idx) => {
            const stepNum = idx + 1;
            node.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                node.classList.add('active');
            } else if (stepNum < currentStep) {
                node.classList.add('completed');
            }
        });

        // Toggle form panels
        wizardPanes.forEach((pane, idx) => {
            pane.classList.remove('active');
            if (idx + 1 === currentStep) {
                pane.classList.add('active');
            }
        });

        // Button Controls
        if (currentStep === 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-flex';
        }

        if (currentStep === stepNodes.length) {
            nextBtn.innerHTML = currentEditIdx !== null ? `Apply Modifications <i class="fa-solid fa-check"></i>` : `Confirm & Book <i class="fa-solid fa-circle-check"></i>`;
        } else {
            nextBtn.innerHTML = `Continue <i class="fa-solid fa-arrow-right"></i>`;
        }

        // Trigger step-4 summary card rendering
        if (currentStep === 4) {
            populateSummaryReview();
        }
    }

    function populateSummaryReview() {
        document.getElementById('sum-name').innerText = document.getElementById('name').value || 'N/A';
        document.getElementById('sum-phone').innerText = document.getElementById('phone').value || 'N/A';
        document.getElementById('sum-pickup').innerText = document.getElementById('pickup').value || 'N/A';
        document.getElementById('sum-delivery').innerText = document.getElementById('delivery').value || 'N/A';
        document.getElementById('sum-mode').innerText = selectMode.value;
        document.getElementById('sum-parcel').innerText = document.getElementById('parcel').value || 'Consignment Details';
        document.getElementById('sum-price').innerText = `₹${(parseFloat(document.getElementById('price').value) || 0).toLocaleString()}`;
    }

    function validateStep(step) {
        if (step === 1) {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            if (!name || !phone) {
                alert("Please fill in Customer Name and Contact Phone.");
                return false;
            }
        } else if (step === 2) {
            const pickup = document.getElementById('pickup').value;
            const delivery = document.getElementById('delivery').value;
            if (!pickup || !delivery) {
                alert("Please fill in Origin Pickup and Destination Delivery terminals.");
                return false;
            }
        }
        return true;
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < stepNodes.length) {
                if (validateStep(currentStep)) {
                    currentStep++;
                    updateStepUI();
                }
            } else {
                // Confirm action on final step (Wizard complete)
                addOrUpdateBooking();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepUI();
            }
        });
    }

    function resetWizardForm() {
        currentStep = 1;
        currentEditIdx = null;
        document.querySelectorAll('.wizard-pane input').forEach(input => input.value = '');
        document.querySelectorAll('.wizard-pane select').forEach(select => select.selectedIndex = 0);
        document.getElementById('price').value = '';
        if (document.getElementById('wizard-delta-viewer')) {
            document.getElementById('wizard-delta-viewer').style.display = 'none';
        }
        updateStepUI();
    }

    // ----------------------------------------------------
    // Dynamic Booking CRUDS
    // ----------------------------------------------------
    const tbody = document.getElementById('tbody');

    function renderRegistry(data) {
        if (!tbody) return;
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">No operational bookings found in index.</td></tr>`;
            return;
        }

        data.forEach((b, i) => {
            const statusClass = b.status === 'Delivered' ? 'nominal' : (b.status === 'Shipped' ? 'transit' : 'warning');
            tbody.innerHTML += `
                <tr>
                    <td><strong>#${b.id}</strong></td>
                    <td><span style="font-family: monospace; font-weight: 600; color: var(--color-transit);">${b.tracking}</span></td>
                    <td>${b.name}</td>
                    <td>${b.phone}</td>
                    <td>${b.pickup}</td>
                    <td>${b.delivery}</td>
                    <td><strong>₹${(parseFloat(b.price) || 0).toLocaleString()}</strong></td>
                    <td><span class="badge-pill ${statusClass}">${b.status}</span></td>
                    <td>
                        <div class="action-icons">
                            <button class="btn-action-icon view" title="View details milestone" onclick="viewDetails(${b.id})">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn-action-icon edit" title="Edit Booking details" onclick="editBooking(${b.id})">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button class="btn-action-icon delete" title="Cancel Booking" onclick="cancelBooking(${b.id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        updateKPIs();
    }

    function updateKPIs() {
        const total = bookings.length;
        const delivered = bookings.filter(b => b.status === "Delivered").length;
        const pending = bookings.filter(b => b.status === "Pending").length;
        const shipped = bookings.filter(b => b.status === "Shipped").length;

        document.getElementById("total").innerText = total;
        document.getElementById("delivered").innerText = delivered;
        document.getElementById("pending").innerText = pending;
        document.getElementById("shipped").innerText = shipped;

        const percent = total ? Math.round((delivered / total) * 100) : 0;
        const progressFill = document.getElementById("progress");
        if (progressFill) progressFill.style.width = percent + "%";
    }

    async function addOrUpdateBooking() {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const pickup = document.getElementById('pickup').value;
        const delivery = document.getElementById('delivery').value;
        const parcel = document.getElementById('parcel').value;
        const price = document.getElementById('price').value;
        const status = document.getElementById('status').value;
        const mode = selectMode.value;

        const bookingData = {
            name, phone, pickup, delivery, parcel, price, status, mode
        };

        try {
            let response;
            if (currentEditIdx !== null) {
                // Update Existing
                const bookingId = bookings[currentEditIdx].id;
                response = await fetch(`/api/bookings/${bookingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });
            } else {
                // Add New
                bookingData.tracking = generateTracking();
                response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });
            }

            const result = await response.json();
            if (result.success) {
                alert(result.message);
                await loadBookings();
                resetWizardForm();
                
                // Return to Dashboard View
                const dashboardTab = document.querySelector('.nav-item[data-tab="dashboard"]');
                if (dashboardTab) dashboardTab.click();
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            alert("An error occurred while saving the booking.");
        }
    }

    // Expose CRUD actions globally for HTML click listeners
    window.viewDetails = function(id) {
        const b = bookings.find(item => item.id === id);
        if (!b) return;

        document.getElementById('drawer-id').innerText = b.tracking;
        document.getElementById('drawer-name').innerText = b.name;
        document.getElementById('drawer-phone').innerText = b.phone;
        document.getElementById('drawer-pickup').innerText = b.pickup;
        document.getElementById('drawer-delivery').innerText = b.delivery;
        document.getElementById('drawer-parcel').innerText = b.parcel;
        document.getElementById('drawer-price').innerText = `₹${(parseFloat(b.price) || 0).toLocaleString()}`;
        document.getElementById('drawer-status').className = `badge-pill ${b.status === 'Delivered' ? 'nominal' : (b.status === 'Shipped' ? 'transit' : 'warning')}`;
        document.getElementById('drawer-status').innerText = b.status;

        // Generate visual connecting milestone stepper
        const stepper = document.getElementById('drawer-timeline');
        stepper.innerHTML = '';

        const milestones = [
            { title: "Booking Confirmation & Waybill Issued", desc: "Digital ledgers updated", time: "Gate Scheduled" },
            { title: "Vessel Gated & Manifest Registered", desc: `Origin: ${b.pickup}`, time: "Nominal" },
            { title: "Customs Inspections Cleared", desc: "Port terminal seals verified", time: "Completed" },
            { title: "Transport Dispatch Out-of-Gate", desc: `Mode: ${b.mode}`, time: "Completed" },
            { title: "Dispatched and Gated Out", desc: `Destination: ${b.delivery}`, time: "Completed" }
        ];

        let reachedIndex = 1;
        if (b.status === 'Shipped') reachedIndex = 3;
        else if (b.status === 'Delivered') reachedIndex = 5;

        milestones.forEach((m, idx) => {
            let stateClass = '';
            if (idx + 1 < reachedIndex) stateClass = 'completed';
            else if (idx + 1 === reachedIndex) stateClass = 'active';

            stepper.innerHTML += `
                <div class="milestone-step ${stateClass}">
                    <div class="milestone-dot"></div>
                    <div class="milestone-info">
                        <div class="milestone-title">${m.title}</div>
                        <div class="milestone-desc">${m.desc}</div>
                    </div>
                </div>
            `;
        });

        document.getElementById('detail-drawer').classList.add('open');
    };

    window.closeDrawer = function() {
        const drawer = document.getElementById('detail-drawer');
        if (drawer) drawer.classList.remove('open');
    };

    window.editBooking = function(id) {
        const idx = bookings.findIndex(item => item.id === id);
        if (idx === -1) return;

        currentEditIdx = idx;
        const b = bookings[idx];

        // Populate form inputs
        document.getElementById('name').value = b.name;
        document.getElementById('phone').value = b.phone;
        document.getElementById('pickup').value = b.pickup;
        document.getElementById('delivery').value = b.delivery;
        document.getElementById('parcel').value = b.parcel;
        document.getElementById('price').value = b.price;
        document.getElementById('status').value = b.status;
        selectMode.value = b.mode || 'Ocean';

        // Render Delta revision display
        if (document.getElementById('wizard-delta-viewer')) {
            document.getElementById('wizard-delta-viewer').style.display = 'block';
            document.getElementById('delta-orig-pickup').innerText = b.pickup;
            document.getElementById('delta-orig-delivery').innerText = b.delivery;
            
            // Add listeners to reflect updates
            document.getElementById('pickup').addEventListener('input', (e) => {
                document.getElementById('delta-mod-pickup').innerText = e.target.value || 'N/A';
            });
            document.getElementById('delivery').addEventListener('input', (e) => {
                document.getElementById('delta-mod-delivery').innerText = e.target.value || 'N/A';
            });
            document.getElementById('delta-mod-pickup').innerText = b.pickup;
            document.getElementById('delta-mod-delivery').innerText = b.delivery;
        }

        // Navigate to wizard tab
        const wizardTab = document.querySelector('.nav-item[data-tab="create-wizard"]');
        if (wizardTab) {
            wizardTab.click();
            currentStep = 1;
            updateStepUI();
        }
    };

    window.cancelBooking = async function(id) {
        if (confirm("Are you sure you want to cancel and delete this operational booking manifest?")) {
            try {
                const response = await fetch(`/api/bookings/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    alert(result.message);
                    await loadBookings();
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error('Error deleting booking:', error);
            }
        }
    };

    window.clearAll = async function() {
        if (confirm("Warning: This will clear all database booking records. Proceed?")) {
            try {
                const response = await fetch('/api/bookings/clear', {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    alert(result.message);
                    await loadBookings();
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error('Error clearing bookings:', error);
            }
        }
    };

    // ----------------------------------------------------
    // Search Filter
    // ----------------------------------------------------
    const searchInput = document.getElementById('search');
    
    function executeSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            renderRegistry(bookings);
            return;
        }

        const filtered = bookings.filter(b => 
            b.tracking.toLowerCase().includes(query) ||
            b.name.toLowerCase().includes(query) ||
            b.pickup.toLowerCase().includes(query) ||
            b.delivery.toLowerCase().includes(query)
        );

        renderRegistry(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', executeSearch);
    }

    // Global Header Search
    const globalSearchInput = document.getElementById('global-search-input');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = globalSearchInput.value.trim().toLowerCase();
                const found = bookings.find(b => b.tracking.toLowerCase() === query || b.name.toLowerCase().includes(query));
                if (found) {
                    viewDetails(found.id);
                } else {
                    alert(`No active booking matches query "${query}"`);
                }
                globalSearchInput.value = '';
            }
        });
    }

    // Initial load
    loadBookings();
    resetWizardForm();
});