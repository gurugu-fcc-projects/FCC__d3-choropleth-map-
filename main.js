//--> Main data sources
const countyDataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationDataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

//--> Set up main elements
const width = 1000;
const height = 600;

const path = d3.geoPath();

const svg = d3
  .select(".content")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const legend = svg
  .append("g")
  .attr("id", "legend")
  .attr("transform", `translate(${width / 2}, 20)`);

//--> Add description
d3.select("header")
  .append("h4")
  .text(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
  )
  .attr("id", "description");

//--> Load data
const chart = async () => {
  const [topology, edu] = await Promise.all([
    d3.json(countyDataUrl),
    d3.json(educationDataUrl),
  ]);
  const landData = topojson.feature(
    topology,
    topology.objects.counties
  ).features;

  //--> Min and max education values
  const [eduMin, eduMax] = d3.extent(edu, d => d.bachelorsOrHigher);

  //--> Color scale
  const colorScale = d3
    .scaleThreshold()
    .domain(d3.range(eduMin, 100, 100 / 7))
    .range(d3.schemeBlues[8]);

  console.log(colorScale.domain());
  //--> Normalize land data
  const landDataNormalized = landData.map(d => {
    const result = edu.find(item => item.fips === d.id);

    return {
      ...d,
      fill: colorScale(result.bachelorsOrHigher),
      edu: result.bachelorsOrHigher,
    };
  });

  //--> Display geo data
  svg
    .selectAll("path")
    .data(landDataNormalized)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "lightblue")
    .attr("fill", d => d.fill)
    .classed("county", true)
    .attr("data-fips", d => d.id)
    .attr("data-education", d => d.edu);

  //--> Legend
  const legendData = colorScale.range().map(d => {
    d = colorScale.invertExtent(d);
    console.log(d);
    if (!d[0]) d[0] = 0;
    if (!d[1]) d[1] = 100;

    return d;
  });

  const legendItemWidth = 40;
  const legendItemHeight = 20;

  legend
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .classed("legend-item", true)
    .attr("x", (_, i) => i * legendItemWidth)
    .attr("width", legendItemWidth)
    .attr("height", legendItemHeight)
    .attr("fill", d => colorScale(d[0]));

  legend
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .classed("legend-item-text", true)
    .attr("x", (_, i) => (i + 1) * legendItemWidth - 7)
    .attr("y", legendItemHeight * 2 - 5)
    .text(d => `${Math.round(d[1])}%`);
};

chart();
