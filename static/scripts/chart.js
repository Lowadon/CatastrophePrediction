async function graph() {
    console.log("test");
    const response = await fetch("/data");
    //console.log(response.json());
  
    const jsonData = await response.json();
  
    console.log(jsonData);
	
    const temperatures 	= jsonData.map((entries) => entries.temperature);
    const humidities 	= jsonData.map((entries) => entries.humidity);
    const altitudes 	= jsonData.map((entries) => entries.altitude);
    const pressures 	= jsonData.map((entries) => entries.pressure);
    const timestamps 	= jsonData.map((entries) => new Date(entries.recorded_at));
  
    const formattedTimestamps = [];
  
    timestamps.forEach((element) => {
      const month = element.toLocaleString("default", { month: "long" });
      element =
        element.getDate() +
        ". " +
        month +
        " " +
        element.getHours() +
        ":" +
        element.getMinutes();
      console.log(element);
      formattedTimestamps.push(element);
    });
  
    console.log(formattedTimestamps);
  
    new Chart(document.getElementById("acquisitions"), {
      type: "line",
      data: {
        labels: formattedTimestamps,
        datasets: [
          {
            label: "Temperature",
            data: temperatures,
            borderWidth: 1,
            backgroundColor: "#928459",
          },
          {
            label: "Humidity",
            data: humidities,
            borderWidth: 1,
            backgroundColor: "#7800d2",
          },
          
          {
              label: "Altitude",
              data: altitudes,
              borderWidth: 1,
              backgroundColor: "#abcdef",
            },
            
          {
              label: "Pressure",
              data: pressures,
              borderWidth: 1,
              backgroundColor: "#4520d2",
            },
        ],
      },
      options: {
        scales: {
          x: [
            {
              type: "time",
              time: {
                unit: "hour",
              },
              scaleLabel: {
                display: true,
                labelString: "Time",
              },
            },
          ],
          y: [
            {
              scaleLabel: {
                display: true,
                labelString: "Temperature (°C)",
              },
            },
            {
              scaleLabel: {
                display: true,
                labelString: "Humidity (%)",
              },
            },
            {
              scaleLabel: {
                display: false,
                labelString: "Altitude (m)",
              },
            },
            {
              scaleLabel: {
                display: false,
                labelString: "Pressure (hPa)",
              },
            },
          ],
        },
      },
    });
  }