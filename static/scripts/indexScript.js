import Chart from 'chart.js/auto';
// List entries in database
/*
$(document).ready(function () {
    $.ajax({
        url: "/getSystemInfo",
        method: "GET",
        dataType: "json",
        success: function (data) {
            data.forEach(function (entry) {
                const entryHtml = createEntry(entry);
                $("#sysInfoList").append(entryHtml);
            });
        },
        error: function (error) {
            console.error("Error fetching data for List 1: " + error.responseText);
        },
    });
});
*/


    
(async function() {
const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
];

new Chart(
    document.getElementById('acquisitions'),
    {
    type: 'bar',
    data: {
        labels: data.map(row => row.year),
        datasets: [
        {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
        }
        ]
    }
    }
);
})();