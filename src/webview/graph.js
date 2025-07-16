// @ts-check

/**
 * Initializes the Terraform graph visualization
 * @param {string} dotData The DOT format graph data from terraform graph
 */
function initializeGraph(dotData) {
    const edges = [...dotData.matchAll(/"([^"]+)" -> "([^"]+)"/g)]
        .map(m => ({ data: { id: m[1] + '_' + m[2], source: m[1], target: m[2] } }));

    const allSources = new Set(edges.map(e => e.data.source));
    const allTargets = new Set(edges.map(e => e.data.target));
    const rootNodes = Array.from(allSources).filter(s => !allTargets.has(s));

    const nodesMap = new Set(edges.flatMap(e => [e.data.source, e.data.target]));
    const nodes = Array.from(nodesMap).map(id => {
        let label = id.split(".").join('\n');
        let boxFillColor = "";
        if (id.startsWith("data.")) {
            boxFillColor = '#b4d8fa';
        } else {
            boxFillColor = '#64aff5';
        }

        return { data: { id, label, boxFillColor } };
    });

    const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [...nodes, ...edges],
        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 30,
            roots: rootNodes,
            animate: true,
            spacingFactor: .8,
            fit: true,
            avoidOverlap: true,
            grid: true,
            transform: (node, position) => {
                return { x: position.x, y: -position.y }; // flip vertically
            }
        },
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'font-family': 'monospace',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'color': 'var(--vscode-editor-foreground)',
                    'background-color': 'data(boxFillColor)',
                    'border-width': 1,
                    'border-color': '#999',
                    'font-size': 12,
                    'shape': 'roundrectangle',
                    'padding': '8px',
                    'text-wrap': 'wrap',
                    'text-justification': 'left',
                    'text-max-width': '160px',
                    'width': 'label',
                    'height': 'label'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 1,
                    'line-color': '#888',
                    'target-arrow-color': '#888',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],
        wheelSensitivity: 0.1
    });
}
