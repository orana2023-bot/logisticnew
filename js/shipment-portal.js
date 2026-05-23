 const form = document.getElementById('shipmentForm');
    const cardsContainer = document.getElementById('cardsContainer');

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const shipmentData = {
        shipmentId: document.getElementById('shipmentId').value,
        orderNumber: document.getElementById('orderNumber').value,
        contents: document.getElementById('contents').value,
        carrier: document.getElementById('carrier').value,
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        status: document.getElementById('status').value,
        receiver: document.getElementById('receiver').value
      };

      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <h3>Shipment ${shipmentData.shipmentId}</h3>
        <p><strong>Order:</strong> ${shipmentData.orderNumber}</p>
        <p><strong>Contents:</strong> ${shipmentData.contents}</p>
        <p><strong>Carrier:</strong> ${shipmentData.carrier}</p>
        <p><strong>Route:</strong> ${shipmentData.origin} → ${shipmentData.destination}</p>
        <p><strong>Delivery Date:</strong> ${shipmentData.deliveryDate}</p>
        <p><strong>Status:</strong> ${shipmentData.status}</p>
        <p><strong>Receiver:</strong> ${shipmentData.receiver}</p>
      `;

      cardsContainer.appendChild(card);
      form.reset();
    });