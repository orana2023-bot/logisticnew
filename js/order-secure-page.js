document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const materialSelect = document.getElementById('materialSelect');
    const qtyInput = document.getElementById('qtyInput');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');

    const summaryItemName = document.getElementById('summaryItemName');
    const summaryQtyVal = document.getElementById('summaryQtyVal');

    const defaultAddressRadio = document.getElementById('defaultAddress');
    const customAddressRadio = document.getElementById('customAddress');
    const customAddressFields = document.getElementById('customAddressFields');
    const customInputs = customAddressFields ? customAddressFields.querySelectorAll('input') : [];

    const submitBtn = document.getElementById('submitBtn');

    function updateSummary() {
        if (summaryItemName && materialSelect) summaryItemName.textContent = materialSelect.value;
        if (summaryQtyVal && qtyInput) summaryQtyVal.textContent = qtyInput.value;
    }

    if (materialSelect) materialSelect.addEventListener('change', updateSummary);

    if (qtyInput) {
        qtyInput.addEventListener('input', () => {
            if (qtyInput.value < 1) qtyInput.value = 1;
            updateSummary();
        });
    }

    if (qtyMinus) {
        qtyMinus.addEventListener('click', () => {
            let currentVal = parseInt(qtyInput.value);
            if (currentVal > 1) {
                qtyInput.value = currentVal - 1;
                updateSummary();
            }
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener('click', () => {
            let currentVal = parseInt(qtyInput.value);
            qtyInput.value = currentVal + 1;
            updateSummary();
        });
    }

    function toggleAddressFields() {
        if (!customAddressFields || !customAddressRadio) return;

        if (customAddressRadio.checked) {
            customAddressFields.style.opacity = '1';
            customAddressFields.style.pointerEvents = 'auto';
            customInputs.forEach(input => input.disabled = false);
        } else {
            customAddressFields.style.opacity = '0.5';
            customAddressFields.style.pointerEvents = 'none';
            customInputs.forEach(input => {
                input.disabled = true;
                input.value = '';
            });
        }
    }

    if (defaultAddressRadio) defaultAddressRadio.addEventListener('change', toggleAddressFields);
    if (customAddressRadio) customAddressRadio.addEventListener('change', toggleAddressFields);

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'PROCESSING...';
            submitBtn.style.backgroundColor = '#48bb78';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'REQUEST SUBMITTED ✔';

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                    if (qtyInput) qtyInput.value = 1;
                    if (defaultAddressRadio) defaultAddressRadio.checked = true;
                    toggleAddressFields();
                    updateSummary();
                }, 3000);
            }, 1500);
        });
    }
});