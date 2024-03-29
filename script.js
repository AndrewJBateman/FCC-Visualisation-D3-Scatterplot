/*set up container area*/
const body = d3.select("body");
const height = 400,
  width = 700;
const container = body
  .append("svg")
  .attr("height", height + 200 + "px")
  .attr("width", width + 100 + "px");
/*import json data using d3 v5 new method with then promise*/
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((data) => {
  // extract time minutes and seconds as strings from json data then
  // create a new date (1995 is just a placeholder)
  data.forEach((d) => {
    const parseMins = d.Time.slice(0, 2);
    const parseSecs = d.Time.slice(3, 5);
    d.Time = new Date(1995, 1, 1, 1, parseMins, parseSecs);
  });

  //function to open URL link in a new window
  function openURL(d) {
    const win = window.open(d.URL, "_blank");
    win.focus();
  }

  /*vertical & horizontal scales*/
  const verticalScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Time))
    .range([0, height])
    .nice(); //axis ends with round number
  const minYear = d3.min(data, (d) => d.Year);
  const horizontalScale = d3
    .scaleLinear()
    .domain([minYear - 1, d3.max(data, (d) => d.Year) + 1])
    .range([0, width]);

  /*y & x axes*/
  const yAxis = d3
    .axisLeft(verticalScale)
    .tickFormat(d3.timeFormat("%M:%S"))
    .ticks(d3.timeSecond, 10); //every 10 seconds
  const xAxis = d3.axisBottom(horizontalScale).tickFormat(d3.format("d"));

  /*plot area*/
  const display = container.append("g").attr("transform", "translate(70, 40)");

  /*tooltip*/
  const tooltip = body.append("div").attr("id", "tooltip");

  display
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", "4px")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time)
    .attr("cx", (d) => horizontalScale(d.Year))
    .attr("cy", (d) => verticalScale(d.Time))
    .attr("fill", (d) => (d.Doping == "" ? "blue" : "pink"))
    .attr("stroke", "grey")
    .on("mouseover", (d) => {
      const time = d.Time.toString().split(":");
      const tooltipText =
        d.Name +
        ", nationality: " +
        d.Nationality +
        "<br/>" +
        "Year: " +
        d.Year +
        "<br/>" +
        "Place: " +
        d.Place +
        "<br/>" +
        "Time: " +
        time[1] +
        ":" +
        time[2].substring(0, 2) +
        (d.Doping == ""
          ? "<br/>" + "Doping: none"
          : "<br/>" + "Doping: " + d.Doping);
      tooltip.html(tooltipText);
      tooltip
        .attr("data-year", d.Year)
        .style("left", `${d3.event.pageX + 5}px`)
        .style("top", `${d3.event.pageY + 5}px`)
        .transition()
        .duration(500)
        .style("opacity", 0.8);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(1500).style("opacity", 0);
    })
    .on("click", (d) => {
      if (d.URL) openURL(d); //only applies to pink dots
    });

  /* y and x axes */

  container
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(70, 40)")
    .call(yAxis);
  container
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(70, " + (height + 40) + ")")
    .call(xAxis);

  /*legends to define coloured dots*/
  const legend = display
    .append("g")
    .attr("id", "legend")
    .style("font-size", "18px")
    .style("fill", "blue")
    .attr("height", 50)
    .attr("width", 200)
    .attr("transform", "translate(" + (width - 300) + ", 0)");

  legend
    .append("text")
    .text("Cyclists with no doping allegations")
    .attr("transform", "translate(0, 42)");

  legend
    .append("circle")
    .attr("transform", "translate(300, 0)")
    .attr("r", 8)
    .attr("class", "legend")
    .attr("fill", "pink");

  legend
    .append("text")
    .text("Cyclists with doping allegations")
    .attr("transform", "translate(0, 10)");

  legend
    .append("circle")
    .attr("transform", "translate(300, 35)")
    .attr("r", 8)
    .attr("class", "legend")
    .style("fill", "blue");

  //add x axis label
  display
    .append("g")
    .append("text")
    .attr("y", height + 20)
    .attr("dy", "1em")
    .style("font-size", "16px")
    .attr("fill", "blue")
    .text("Year");
  //add y axis label
  display
    .append("g")
    .append("text")
    .attr("x", -100)
    .attr("dy", "-2.8em")
    .attr("transform", "rotate(-90)")
    .style("font-size", "16px")
    .attr("fill", "blue")
    .text("Time (seconds)");
});
