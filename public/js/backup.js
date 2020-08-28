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


// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<strong>Country:</strong> <span style='color:red'>" + d.values[0]["Country/Region"] + "</span><br>";
        text += "<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>" + d.values[0].continent + "</span><br>";
        return text;
    });
g.call(tip);


//그래프 스케일
var x = d3.scaleLinear()
    .range([0, width])
    .domain([0, 220000]);

var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 30000]);

var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);

var continentColor = d3.scaleOrdinal(d3.schemePastel1);


// X Axis
var xAxisCall = d3.axisBottom(x)
    
g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")")
    .call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(y)
    
g.append("g")
    .attr("class", "y axis")
    .call(yAxisCall);

//용도 불명
var continents = ["europe", "asia", "americas", "africa"];


//레전드
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
var contData;
var confirmed;
var deaths;
var dates;
var date = 0;
var interval;
var skipFirst = 0;

//데이터 읽어들이기
var contMatch = d3.map();

var promises = [
    d3.json("data/country-by-continent.json"),
    d3.csv("data/time_series_covid_19_confirmed.csv"),
    d3.csv("data/time_series_covid_19_deaths.csv")
    ]    

//데이터 클리닝
Promise.all(promises).then(function(allData){
    contData = allData[0];
    confirmed = allData[1];
    deaths = allData[2];
    dates = confirmed.columns.slice(4, )
    contData.forEach(function(d, i){
        contMatch.set(d["country"], d["continent"])            
    })

    confirmed.forEach(function(d){
        for(var i = 0; i < dates.length; i++){
            d[dates[i]] = +d[dates[i]]
            d.continent = contMatch.get(d["Country/Region"])
        }
    })

    deaths.forEach(function(d){
        for(var i = 0; i < dates.length; i++){
            d[dates[i]] = +d[dates[i]]
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
}).catch(function(error){
    console.log(error);
})
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------



function update(date){
    var circles = g.selectAll("circle").data(confirmed, function(d){
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
    .attr("cy", function(d, i){
        var length = deaths[i].values.length;
        return y(deaths[i].values[length-1][dates[date]])})
    .attr("cx", function(d, i){
        var length = d.values.length         
        return x(d.values[length-1][dates[date]])})
    .attr("r", function(d){ return 5 });
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




