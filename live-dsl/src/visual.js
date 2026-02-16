import * as d3 from 'd3';

/**
 * Render a D3 tree layout for the parse tree.
 * Supports zoom/pan and node click highlighting.
 * @param {SVGSVGElement} svgElement - The SVG element to render into
 * @param {object|null} data - Root node of the tree
 * @param {object} options - { onNodeClick: (node) => void }
 */
export function renderTree(svgElement, data, { onNodeClick } = {}) {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  // Show fallback if no tree
  if (!data) {
    svg
      .attr('viewBox', '0 0 400 200')
      .append('text')
      .attr('x', 200)
      .attr('y', 100)
      .attr('text-anchor', 'middle')
      .attr('fill', '#98a2b3')
      .attr('font-size', 14)
      .text('No parse tree (check status)');
    return;
  }

  // Build D3 hierarchy and layout
  const root = d3.hierarchy(data);
  const dx = 28;
  const dy = 180;
  const treeLayout = d3.tree().nodeSize([dx, dy]);
  treeLayout(root);

  const nodes = root.descendants();
  const links = root.links();

  const x0 = d3.min(nodes, (d) => d.x) ?? 0;
  const x1 = d3.max(nodes, (d) => d.x) ?? 0;
  const y1 = d3.max(nodes, (d) => d.y) ?? 0;
  const margin = 24;

  svg.attr('viewBox', [0, 0, y1 + margin * 2, x1 - x0 + margin * 2]);

  // Add zoom/pan layer
  const zoomLayer = svg.append('g');
  const g = zoomLayer
    .append('g')
    .attr('transform', `translate(${margin},${-x0 + margin})`);

  // Enable zoom and pan
  const zoomBehavior = d3
    .zoom()
    .scaleExtent([0.3, 2.5])
    .on('zoom', (event) => {
      zoomLayer.attr('transform', event.transform);
    });
  svg.call(zoomBehavior).on('dblclick.zoom', null);

  // Draw links
  g.append('g')
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('class', 'link')
    .attr(
      'd',
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x),
    );

  // Draw nodes
  const node = g
    .append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', (d) => `node ${d.data.type === 'terminal' ? 'node-terminal' : ''}`)
    .attr('transform', (d) => `translate(${d.y},${d.x})`)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation();
      if (onNodeClick) {
        onNodeClick(d.data);
      }
    });

  node.append('circle').attr('r', 6);

  node
    .append('text')
    .attr('dy', '0.32em')
    .attr('x', (d) => (d.children ? -10 : 10))
    .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
    .text((d) => d.data.label);
}
