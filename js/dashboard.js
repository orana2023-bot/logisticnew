const shipments = [
  { trackingId: "TRK001", sender: "Soumodip", receiver: "Rahul", status: "Pending", currentLocation: "Kolkata" },
  { trackingId: "TRK002", sender: "Amit", receiver: "Priya", status: "In Transit", currentLocation: "Delhi" },
  { trackingId: "TRK003", sender: "Riya", receiver: "Ankit", status: "Delivered", currentLocation: "Mumbai" },
  { trackingId: "TRK004", sender: "Neha", receiver: "Arjun", status: "In Transit", currentLocation: "Hyderabad" }
];

let filteredData = [...shipments];

function renderTable(data) {
  const table = document.getElementById("shipmentTable");
  table.innerHTML = "";

  data.forEach(s => {
    const statusClass =
      s.status === "Pending" ? "pending" :
      s.status === "In Transit" ? "transit" : "delivered";

    const row = `
      <tr>
        <td>${s.trackingId}</td>
        <td>${s.sender}</td>
        <td>${s.receiver}</td>
        <td><span class="status ${statusClass}">${s.status}</span></td>
        <td>${s.currentLocation}</td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

function updateCounts() {
  document.getElementById("pendingCount").innerText =
    shipments.filter(s => s.status === "Pending").length;

  document.getElementById("transitCount").innerText =
    shipments.filter(s => s.status === "In Transit").length;

  document.getElementById("deliveredCount").innerText =
    shipments.filter(s => s.status === "Delivered").length;
}

function filterStatus(status) {
  if (status === "All") {
    filteredData = shipments;
  } else {
    filteredData = shipments.filter(s => s.status === status);
  }
  renderTable(filteredData);
}

function searchShipment() {
  const value = document.getElementById("searchInput").value.toLowerCase();

  const filtered = filteredData.filter(s =>
    s.trackingId.toLowerCase().includes(value)
  );

  renderTable(filtered);
}

// Initial Load
updateCounts();
renderTable(shipments);