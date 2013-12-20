var regions = { "NE": "North East" , "S": "South", "MW": "Mid-West", "W": "West" },
	w = 925,
	h = 550,
	margin = 30,
	startYear = 1990, 
	endYear = 2013,
	startVal = 0,
	endVal = 10000,
	y = d3.scale.linear().domain([endVal, startVal]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([1990, 2012]).range([0 + margin -5, w]),
	years = d3.range(startYear, endYear);

var vis = d3.select("#vis")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    // .attr("transform", "translate(0, 600)");

			
var line = d3.svg.line()
    .x(function(d,i) { return x(d.x); })
    .y(function(d) { return y(d.y); });
					

// Regions
var counties_regions = {};
d3.text('data/county-cross.csv', 'text/csv', function(text) {
    var regions = d3.csv.parseRows(text);
    for (i=1; i < regions.length; i++) {
        counties_regions[regions[i][0]] = regions[i][8];
    }
});

var startEnd = {},
    countyFips = {};
d3.text('data/RGDP-counties.csv', 'text/csv', function(text) {
    var counties = d3.csv.parseRows(text);
    
    for (i=1; i < counties.length; i++) {
        var values = counties[i].slice(2, counties[i.length-1]);
        var currData = [];
        //countyFips[counties[i][1]] = counties[i][0];
        
        var started = false;
        for (j=0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({ x: years[j], y: values[j] });
            
                if (!started) {
                    startEnd[counties[i][1]] = { 'startYear':years[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[countries[i][1]]['endYear'] = years[j];
                    startEnd[countries[i][1]]['endVal'] = values[j];
                }
                
            }
        }
        vis.append("svg:path")
            .data([currData])
            .attr("county", counties[i][1])
            .attr("class", counties_regions[counties[i][1]])
            .attr("d", line)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);
    }
});  
    
vis.append("svg:line")
    .attr("x1", x(1990))
    .attr("y1", y(startVal))
    .attr("x2", x(2012))
    .attr("y2", y(startVal))
    .attr("class", "axis")

vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startVal))
    .attr("x2", x(startYear))
    .attr("y2", y(endVal))
    .attr("class", "axis")
			
vis.selectAll(".xLabel")
    .data(x.ticks(5))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", h-10)
    .attr("text-anchor", "middle")

vis.selectAll(".yLabel")
    .data(y.ticks(4))
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(String)
	.attr("x", 0)
	.attr("y", function(d) { return y(d) })
	.attr("text-anchor", "right")
	.attr("dy", 3)
			
vis.selectAll(".xTicks")
    .data(x.ticks(5))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", y(startAge))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", y(startAge)+7)
	
vis.selectAll(".yTicks")
    .data(y.ticks(4))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return y(d); })
    .attr("x1", x(1989.5))
    .attr("y2", function(d) { return y(d); })
    .attr("x2", x(1990))

function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length-9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

function onmouseover(d, i) {
    var currClass = d3.select(this).attr("class");
    d3.select(this)
        .attr("class", currClass + " current");
    
    var countyCode = $(this).attr("county");
    var countyVals = startEnd[countyCode];
    var percentChange = 100 * (countyVals['endVal'] - countyVals['startVal']) / countyVals['startVal'];
    
    var blurb = '<h2>' + countyCodes[countyCode] + '</h2>';
    blurb += "<p>On average: a life expectancy of " + Math.round(countyVals['startVal']) + " years in " + countyVals['startYear'] + " and " + Math.round(countyVals['endVal']) + " years in " + countyVals['endYear'] + ", ";
    if (percentChange >= 0) {
        blurb += "an increase of " + Math.round(percentChange) + " percent."
    } else {
        blurb += "a decrease of " + -1 * Math.round(percentChange) + " percent."
    }
    blurb += "</p>";
    
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}
function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length-8);
    d3.select(this)
        .attr("class", prevClass);
    // $("#blurb").text("hi again");
    $("#default-blurb").show();
    $("#blurb-content").html('');
}

function showRegion(regionCode) {
    var counties = d3.selectAll("path."+regionCode);
    if (counties.classed('highlight')) {
        counties.attr("class", regionCode);
    } else {
        counties.classed('highlight', true);
    }
}

