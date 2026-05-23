document.getElementById("bookingForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let sender = document.getElementById("sender").value;
    let receiver = document.getElementById("receiver").value;
    let origin = document.getElementById("origin").value;
    let destination = document.getElementById("destination").value;
    let weight = parseFloat(document.getElementById("weight").value);
    let type = document.getElementById("type").value;

    let rate = 0;

    // Dynamic pricing logic
    if (type === "Air") rate = 20;
    else if (type === "Ocean") rate = 10;
    else if (type === "Road") rate = 8;
    else if (type === "Rail") rate = 6;

    let cost = weight * rate;

    // Generate tracking ID
    let trackingId = "TRK" + Math.floor(Math.random() * 1000000);

    let resultDiv = document.getElementById("result");
    resultDiv.classList.remove("hidden");

    resultDiv.innerHTML = `
        <strong>✅ Booking Confirmed!</strong><br>
        Tracking ID: ${trackingId} <br>
        From: ${origin} → ${destination} <br>
        Type: ${type} <br>
        Total Cost: $${cost}
    `;
});