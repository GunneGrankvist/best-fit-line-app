(function() {
  ////////////////////////////////////////////////////////////
  //// Setup /////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  // Data
  const minValue = -1;
  const maxValue = 7;
  const allValues = d3.range(minValue, maxValue + 1);
  const maxPointsCount = 10;

  let points = [];
  let a = 0.5;
  let b = 0.5;

  const nextId = generateId();

  ////////////////////////////////////////////////////////////
  //// Chart /////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  const chartWidth = 600;
  const chartHeight = 600;
  const margin = {
    top: 40,
    right: 40,
    bottom: 20,
    left: 20
  };
  const radius = 12;
  const lineWidth = 2;
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.top - margin.bottom;

  const xScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([height, 0]);

  const xAxis = function(g) {
    g.call(
      d3
        .axisBottom(xScale)
        .tickSize(0)
        .tickValues(allValues)
    )
      .call(g =>
        g
          .selectAll(".tick line")
          .attr("y1", yScale(maxValue) - yScale(0))
          .attr("y2", yScale(minValue) - yScale(0))
      )
      .call(g =>
        g
          .selectAll(".tick text")
          .filter(d => d === 0)
          .attr("text-anchor", "end")
          .attr("x", -3)
      )
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .append("line")
          .attr("class", "domain")
          .attr("stroke", "currentColor")
          .attr("x1", xScale(minValue))
          .attr("x2", xScale(maxValue) + 10)
          .attr("marker-end", "url(#arrow-head)")
      )
      .call(g =>
        g
          .append("text")
          .attr("x", xScale(maxValue) + 20)
          .attr("dy", "0.32em")
          .attr("fill", "currentColor")
          .text("x")
      );
  };

  const yAxis = function(g) {
    g.call(
      d3
        .axisLeft(yScale)
        .tickSize(0)
        .tickValues(allValues)
    )
      .call(g =>
        g
          .selectAll(".tick")
          .filter(d => d === 0)
          .remove()
      )
      .call(g =>
        g
          .selectAll(".tick line")
          .attr("x1", xScale(maxValue) - xScale(0))
          .attr("x2", xScale(minValue) - xScale(0))
      )
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .append("line")
          .attr("class", "domain")
          .attr("stroke", "currentColor")
          .attr("y1", yScale(minValue))
          .attr("y2", yScale(maxValue) - 10)
          .attr("marker-end", "url(#arrow-head)")
      )
      .call(g =>
        g
          .append("text")
          .attr("text-anchor", "middle")
          .attr("y", yScale(maxValue) - 20)
          .attr("fill", "currentColor")
          .text("y")
      );
  };

  const svg = d3
    .select(".chart-container")
    .append("svg")
    .attr("viewBox", [0, 0, chartWidth, chartHeight]);

  const defs = svg.append("defs");
  defs
    .append("clipPath")
    .attr("id", "line-clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
  defs
    .append("clipPath")
    .attr("id", "points-clip")
    .append("rect")
    .attr("x", -radius)
    .attr("y", -radius)
    .attr("width", width + radius * 2)
    .attr("height", height + radius * 2);
  defs
    .append("marker")
    .attr("id", "arrow-head")
    .attr("viewBox", [0, 0, 10, 10])
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z");
  defs
    .append("marker")
    .attr("id", "cross-head")
    .attr("viewBox", [0, 0, 10, 10])
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 10 M 0 10 L 10 0");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const gAxis = g.append("g").attr("class", "axis");
  gAxis
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(xAxis);
  gAxis
    .append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(yAxis);

  const bestLine = g
    .append("g")
    .attr("class", "best-line-layer")
    .attr("clip-path", "url(#line-clip)")
    .append("line")
    .attr("class", "best-line")
    .attr("x1", xScale(minValue))
    .attr("x2", xScale(maxValue));
  const gPoints = g
    .append("g")
    .attr("class", "points-layer")
    .attr("clip-path", "url(#points-clip)");

  g.append("g")
    .attr("class", "interactive-layer")
    .selectAll("circle")
    .data(d3.cross(allValues, allValues))
    .join("circle")
    .attr("cx", d => xScale(d[0]))
    .attr("cy", d => yScale(d[1]))
    .attr("r", radius)
    .attr("fill", "none")
    .style("pointer-events", "all")
    .style("cursor", "pointer")
    .on("click", addPoint);

  const gNotification = svg
    .append("g")
    .attr("class", "notification-layer")
    .style("pointer-events", "none")
    .style("display", "none");
  gNotification
    .append("rect")
    .attr("class", "notification-overlay")
    .attr("width", chartWidth)
    .attr("height", chartHeight);
  const notificationMessage = gNotification
    .append("text")
    .attr("class", "notification-message")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight / 2)
    .attr("dy", "0.32em")
    .attr("text-anchor", "middle");

  function showNotification(message) {
    notificationMessage.text(message);
    gNotification
      .style("display", "block")
      .transition()
      .delay(1000)
      .style("display", "none");
  }

  function updatePoints() {
    gPoints
      .selectAll("g")
      .data(points, p => p.id)
      .join(
        enter =>
          enter
            .append("g")
            .call(g =>
              g
                .append("circle")
                .attr("class", "data-circle")
                .attr("cx", d => xScale(d[0]))
                .attr("cy", d => yScale(d[1]))
                .attr("r", radius)
            )
            .call(g =>
              g
                .append("line")
                .attr("class", "offset-line")
                .attr("marker-start", "url(#cross-head)")
                .attr("stroke-width", lineWidth)
                .attr("x1", d => xScale(d[0]))
                .attr("x2", d => xScale(d[0]))
                .attr("y2", d => yScale(d[1]))
            ),
        update => update,
        exit => exit.remove()
      )
      .call(g =>
        g.select(".offset-line").attr("y1", d => yScale(a + b * d[0]))
      );
  }

  function updateLine() {
    const y1 = yScale(a + b * minValue);
    const y2 = yScale(a + b * maxValue);
    bestLine
      .attr("y1", y1)
      .attr("y2", y2)
      .attr("stroke-width", lineWidth);
    updatePoints();
    updateTable();
  }

  ////////////////////////////////////////////////////////////
  //// Equation //////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  d3.select("#a-value")
    .attr("value", a)
    .on("input", function() {
      a = +this.value;
      updateLine();
    });

  d3.select("#b-value")
    .attr("value", b)
    .on("input", function() {
      b = +this.value;
      updateLine();
    });

  ////////////////////////////////////////////////////////////
  //// Table /////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  const tbody = d3.select(".table-container tbody");
  const sseValue = d3.select(".sse-cell");
  function updateTable() {
    tbody
      .selectAll("tr")
      .data(points, p => p.id)
      .join(
        enter =>
          enter
            .append("tr")
            .call(tr =>
              tr
                .append("td")
                .append("button")
                .style("cursor", "pointer")
                .text("×")
                .on("click", removePoint)
            )
            .call(tr => tr.append("td").text(d => d[0]))
            .call(tr => tr.append("td").text(d => d[1]))
            .call(tr =>
              tr
                .append("td")
                .attr("class", "offset-cell")
                .text(d => d[1])
            )
            .call(tr =>
              tr
                .append("td")
                .attr("class", "offset2-cell")
                .text(d => d[1])
            ),
        update => update,
        exit => exit.remove()
      )
      .call(tr =>
        tr.select(".offset-cell").text(d => (d[1] - (a + b * d[0])).toFixed(2))
      )
      .call(tr =>
        tr
          .select(".offset2-cell")
          .text(d => Math.pow(d[1] - (a + b * d[0]), 2).toFixed(2))
      );
    sseValue.text(
      d3.sum(points.map(d => Math.pow(d[1] - (a + b * d[0]), 2))).toFixed(2)
    );
  }

  ////////////////////////////////////////////////////////////
  //// Shared ////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  function addPoint(p) {
    if (points.length === maxPointsCount) {
      showNotification(
        `You can only add a maximum of ${maxPointsCount} points`
      );
    } else {
      console.log("Add " + p);
      p.id = nextId();
      points.push(p);
      updatePoints();
      updateTable();
    }
  }

  function removePoint(p) {
    console.log("Remove " + p);
    points.splice(points.indexOf(p), 1);
    updatePoints();
    updateTable();
  }

  // Init
  updateLine();

  ////////////////////////////////////////////////////////////
  //// Utilities /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  function generateId() {
    let i = 0;
    return function() {
      return i++;
    };
  }
})();
