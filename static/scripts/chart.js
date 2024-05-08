$( document ).ready(function() {
  console.log( "ready!" );
  const intervalID = setInterval(graph, 5000);
});

async function graph() 
{
  const response = await fetch("/data");
  //console.log(response.json());

  const jsonData = await response.json();

  //console.log(jsonData);

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
    //console.log(element);
    formattedTimestamps.push(element);
  });

  //console.log(formattedTimestamps);

  new Chart(document.getElementById("temperature"), {
    type: "line",
    data: {
      labels: formattedTimestamps,
      datasets: [
        {
          label: "Temperature",
          data: temperatures,
          borderWidth: 1,
          backgroundColor: "#928459",
        }
      ],
    },
    options: {
      animation : false,
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
          }
        ],
      },
    },
  });

  new Chart(document.getElementById("humidity"), {
    type: "line",
    data: {
      labels: formattedTimestamps,
      datasets: [
        {
          label: "Humidity",
          data: humidities,
          borderWidth: 1,
          backgroundColor: "#7800d2",
        }
      ],
    },
    options: {
      animation : false,
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
              labelString: "Humidity (%)",
            },
          }
        ],
      },
    },
  });
    
  new Chart(document.getElementById("altitude"), {
    type: "line",
    data: {
      labels: formattedTimestamps,
      datasets: [
          {
            label: "Altitude",
            data: altitudes,
            borderWidth: 1,
            backgroundColor: "#abcdef",
          }
      ],
    },
    options: {
      animation : false,
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
              display: false,
              labelString: "Altitude (m)",
            },
          }
        ],
      },
    },
  });

  new Chart(document.getElementById("pressure"), {
    type: "line",
    data: {
      labels: formattedTimestamps,
      datasets: [
        {
          label: "Pressure",
          data: pressures,
          borderWidth: 1,
          backgroundColor: "#4520d2",
        },
      ],
    },
    options: {
      animation : false,
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
              display: false,
              labelString: "Pressure (hPa)",
            }
          },
        ],
      },
    },
  });
}

graph();