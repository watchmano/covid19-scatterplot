/*
*    main.js
*    Mastering Data Visualization with D3.js
*    6.5 - Event listeners and handlers in D3
*/

//svg 캔버스
var margin = { left:80, right:20, top:50, bottom:100 };
var height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

var contData;
var confirmed;
var deaths;
var dates;
var date = 0;
var interval;
var skipFirst = 0;
var chartFocus = 1;

// X Label
g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Confirmed");

// Y Label
var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Deceased");
//데이터 읽어들이기
var contMatch = d3.map();
var popMatch = d3.map();
$( "#slider" ).slider({
    max: 100,
    min: 1,
    step: 0.1,
    value: 1,
    slide: function(event, ui){
        
        $("#focus").text("x" + ui.value);
        chartFocus = 1/ui.value;
        update(date);
    }
});



var formatTime = d3.timeFormat("%Y-%m-%d");
var timeScale = d3.scaleTime()
    .domain([new Date(2020, 0, 22), new Date(2020, 4, 4)])
    .range([0, 103]);


var formatTime = d3.timeFormat("%Y-%m-%d");

$( "#slider2" ).slider({
    max: 103,
    min: 0,
    step: 1,
    value: date,
    slide: function(event, ui){
        $("#focus2").text(formatTime(timeScale.invert(ui.value)));
        date = ui.value;
        update(date);
    }
});

$("#continent-select")
    .on("change", function(){
        
        update(date);
    })


// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "Country: <span style='color:red'>" + d.values[0]["Country/Region"] + "</span><br>";
        text += "Continent: <span style='color:red;text-transform:capitalize'>" + d.values[0].continent + "</span><br>";
        text += "Population: <span style='color:red;text-transform:capitalize'>" + d.values[0].population[0] + "</span><br>"
        text += "Urban Population: <span style='color:red;text-transform:capitalize'>" + d.values[0].population[1] + "%</span><br>"
        text += "Population Density: <span style='color:red;text-transform:capitalize'>" + d.values[0].population[2] + "/sq.km</span><br>"
        return text;
    });
g.call(tip);


//그래프 스케일
var x = d3.scaleLinear()
    .range([0, width]);
    

var y = d3.scaleLinear()
    .range([height, 0]);
    

var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);

var continentColor = d3.scaleOrdinal(d3.schemePastel1);


// X Axis

    
var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");
    

// Y Axis

    
var yAxisGroup = g.append("g")
    .attr("class", "y axis");
    
var continents = ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];

var legend = g.append("g")
    .attr("transform", "translate(" + (width - 10) + 
        "," + (height - 125) + ")");

continents.forEach(function(continent, i){
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i * 20) + ")");

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", continentColor(continent));

    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(continent);
});

//전역변수들


var promises = [
    d3.json("data/country-by-continent.json"),
    d3.csv("data/time_series_covid_19_confirmed.csv"),
    d3.csv("data/time_series_covid_19_deaths.csv"),
    d3.csv("data/population.csv", function(d){
        d["Population (2020)"] = +d["Population (2020)"]
        d["Urban Pop"] = +d["Urban Pop"]
        d["Density"] = +d["Density"]
        return d
    })
    ]    

//데이터 클리닝
Promise.all(promises).then(function(allData){
    console.log(allData)
    contData = allData[0];
    
    var contNestedData = d3.nest()
            .key(function(d) { return d.continent; })
            .entries(contData);
    console.log(contNestedData)
    confirmed = allData[1];
    deaths = allData[2];
    var popData = allData[3]

    dates = confirmed.columns.slice(4, )
    contData.forEach(function(d, i){
        contMatch.set(d["country"], d["continent"])            
    })

/*d["Population (2020)"] = +d["Population (2020)"]
        d["Urban Pop"] = +d["Urban Pop"]
        d["Density"] = +d["Density"]*/
    popData.forEach(function(d, i){
        popMatch.set(d["Country (or dependency)"], [d["Population (2020)"], d["Urban Pop"], d["Density"]])            
    })

    confirmed.forEach(function(d){
        for(var i = 0; i < dates.length; i++){
            d[dates[i]] = +d[dates[i]]
            d.continent = contMatch.get(d["Country/Region"])
            d.population = popMatch.get(d["Country/Region"]) 
        }
    })

    deaths.forEach(function(d){
        for(var i = 0; i < dates.length; i++){
            d[dates[i]] = +d[dates[i]]
            d.continent = contMatch.get(d["Country/Region"])
        }
    })

    confirmed = d3.nest()
    .key(function(d){return d["Country/Region"];})
    .entries(confirmed);

    deaths = d3.nest()
    .key(function(d){return d["Country/Region"];})
    .entries(deaths);
    
    console.log(confirmed)
    console.log(deaths)
    
    update(date)
}).catch(function(error){
    console.log(error);
})
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------

/*xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));*/



var formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
      var s = formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }

function update(date){
    var t = d3.transition()
        .duration(110);
    x.domain([0, 1200000 * chartFocus]);
    y.domain([0, 70000 * chartFocus]);
    
    var xAxisCall = d3.axisBottom(x).tickFormat(formatAbbreviation)
    xAxisGroup.call(xAxisCall);

    
    var yAxisCall = d3.axisLeft(y).tickFormat(formatAbbreviation)
    yAxisGroup.call(yAxisCall);
    
    var continent = $("#continent-select").val();

    var fconfirmed = confirmed.filter(function(d){
        
        if (continent == "all") { return true; }
        else {
            return d.values[0]["continent"] == continent;
        }
    })
    
    var fdeaths = deaths.filter(function(d){
        
        if (continent == "all") { return true; }
        else {
            return d.values[0]["continent"] == continent;
        }
    })

    
    var circles = g.selectAll("circle").data(fconfirmed, function(d){
    return d.key
    });

// EXIT old elements not present in new data.
circles.exit()
    .attr("class", "exit")
    .remove();

// ENTER new elements present in new data.
circles.enter()
    .append("circle")
    .attr("class", "enter")
    .attr("fill", function(d) { return continentColor(d.values[0].continent); })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .merge(circles)
    .transition(t)
    .attr("cy", function(d, i){
        var length = fdeaths[i].values.length;
        return y(fdeaths[i].values[length-1][dates[date]])})
    .attr("cx", function(d, i){
        var length = d.values.length         
        return x(d.values[length-1][dates[date]])})
    .attr("r", function(d){ return 5 });
 
 $( "#slider2" ).slider('value', date);
 $("#focus2").text(formatTime(timeScale.invert(date)));
}
function step(){
    date = date % 104;
    update(date++);
}

//--------------------------------------------------------------------------------------------------


$("#play-button")
    .on("click", function(){
        var button = $(this);
        if (button.text() == "Play"){
            button.text("Pause");
            interval = setInterval(step, 100);            
        }
        else {
            button.text("Play");
            clearInterval(interval);
        }
    })




