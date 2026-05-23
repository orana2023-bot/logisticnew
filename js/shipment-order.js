
    function calculateShipment() {
      const origin = document.getElementById("origin").value;
      const destination = document.getElementById("destination").value;
      const weight = parseFloat(document.getElementById("weight").value);

      if (!origin || !destination || !weight || weight <= 0) {
        document.getElementById("result").innerText = "Please fill all fields correctly.";
        return;
      }

      let baseRate = 50; 
      let distanceFactor = origin === destination ? 1 : 2; 
      let cost = baseRate * distanceFactor + weight * 10;

      document.getElementById("result").innerText = 
        `Estimated Shipping Cost: $${cost.toFixed(2)}`;
    }
  
