// List entries in database

function getData()
{
    $.ajax({
        url: "/data",
        method: "get",
        dataType: "json",
        success: function (data) 
        {
            console.log(data);
        },
        error: function (error) {
            console.error("Error fetching data");
        },
    });
}

/*
const xValues = [50,60,70,80,90,100,110,120,130,140,150];
const yValues = [7,8,8,9,9,9,10,11,14,14,15];

new Chart("acquisitions", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor:"rgba(0,0,255,1.0)",
      borderColor: "rgba(0,0,255,0.1)",
      data: yValues
    }]
  },
  options:
  {
    legend: {display: false},
    scales: {
    yAxes: [{ticks: {min: 6, max:16}}], 
    }
}
});
*/