document.addEventListener('DOMContentLoaded', () => {
    const trackBtn = document.getElementById('trackBtn');
    const trackingInput = document.getElementById('trackingInput');
    const resultContainer = document.getElementById('trackingResult');
    const errorMsg = document.getElementById('errorMsg');

    // Allow pressing Enter in input
    trackingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') trackBtn.click();
    });

    trackBtn.addEventListener('click', async () => {
        const id = trackingInput.value.trim();
        if (!id) {
            trackingInput.focus();
            return;
        }

        // Loading state
        trackBtn.disabled = true;
        trackBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Tracking...';
        resultContainer.classList.add('hidden');
        errorMsg.classList.add('hidden');

        try {
            const response = await fetch(`/api/track/${encodeURIComponent(id)}`);
            const data = await response.json();

            if (data.found) {
                showResult(data.shipment);
            } else {
                showError(data.message || 'No shipment found for this tracking ID.');
            }
        } catch (err) {
            showError('Network error. Please make sure the server is running.');
        } finally {
            trackBtn.disabled = false;
            trackBtn.innerHTML = 'Track';
        }
    });

    function showResult(s) {
        errorMsg.classList.add('hidden');
        resultContainer.classList.remove('hidden');

        // ---- Basic Info ----
        document.getElementById('resTrackingId').innerText = s.tracking || '--';
        document.getElementById('resLocation').innerText = s.delivery || '--';

        // ---- Status Pill ----
        const statusEl = document.getElementById('resStatusText');
        statusEl.innerText = s.status || '--';
        statusEl.className = 'value status-pill';
        const statusClass = {
            'Pending':    'status-pending',
            'In Transit': 'status-transit',
            'Delivered':  'status-delivered',
            'Cancelled':  'status-cancelled'
        };
        statusEl.classList.add(statusClass[s.status] || 'status-pending');

        // ---- Extended Details ----
        populateDetail('detName', s.name);
        populateDetail('detPhone', s.phone);
        populateDetail('detPickup', s.pickup);
        populateDetail('detDelivery', s.delivery);
        populateDetail('detMode', s.mode || 'Unspecified');
        populateDetail('detETA', s.eta || 'Not Available');
        populateDetail('detParcel', s.parcel || 'N/A');
        populateDetail('detPrice', s.price ? `$${parseFloat(s.price).toLocaleString('en-US', {minimumFractionDigits: 2})}` : 'N/A');

        // ---- Progress Bar ----
        const percent = s.progress || 0;
        const progressBar = document.getElementById('dynamicProgressBar');
        progressBar.style.width = percent + '%';
        progressBar.innerText = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);

        if (percent <= 25) progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-info';
        else if (percent <= 75) progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-primary';
        else progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';

        // ---- Step Labels ----
        updateLabels(percent);
    }

    function populateDetail(id, val) {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '--';
    }

    function updateLabels(percent) {
        const labels = ['ordered', 'shipped', 'transit', 'delivered'];
        labels.forEach((label, index) => {
            const element = document.getElementById(`label-${label}`);
            if (!element) return;
            const stepPercent = (index + 1) * 25;
            element.style.color = percent >= stepPercent ? '#1e3c72' : '#adb5bd';
            element.style.opacity = percent >= stepPercent ? '1' : '0.5';
            element.style.fontWeight = percent >= stepPercent ? '700' : '400';
        });
    }

    function showError(msg) {
        resultContainer.classList.add('hidden');
        errorMsg.classList.remove('hidden');
        const msgEl = errorMsg.querySelector('p');
        if (msgEl) msgEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
    }
});