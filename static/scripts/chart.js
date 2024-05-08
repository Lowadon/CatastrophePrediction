async function graph(data) {
    console.log("test");
    const response = await fetch("/data");
    //console.log(response.json());
  
    const jsonData = await response.json();
  
    const promiseData = jsonData;
  
    console.log(promiseData);
    const temperatures = promiseData.map(
      (measurement) => measurement.temperature
    );
    const humidities = promiseData.map((measurement) => measurement.humidity);
    const altitudes = promiseData.map((measurement) => measurement.altitude);
    const pressures = promiseData.map((measurement) => measurement.pressure);
    const timestamps = promiseData.map(
      (measurement) => new Date(measurement.timestamp)
    );
  
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
  
  graph();