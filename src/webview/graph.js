// @ts-check

/**
 * Initializes the Terraform graph visualization
 * @param {string} dotData The DOT format graph data from terraform graph
 */
function initializeGraph(dotData) {

    const edges = [...dotData.matchAll(/"([^"]+)" -> "([^"]+)"/g)]
        .map(m => ({ data: { id: m[2] + '_' + m[1], source: m[2], target: m[1] } }));

    const allSources = new Set(edges.map(e => e.data.source));
    const allTargets = new Set(edges.map(e => e.data.target));
    const rootNodes = Array.from(allSources).filter(s => !allTargets.has(s));
    console.log('Root nodes:', rootNodes);

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

    console.log('Creating nodes:', nodes);

    try {
        if (!window.cytoscape) {
            console.error('Cytoscape is not loaded!');
            return;
        }
        if (!window.dagre) {
            console.error('Dagre library is not loaded!');
            return;
        }
        if (!window.cytoscapeDagre) {
            console.error('Cytoscape-dagre extension is not loaded!');
            return;
        }

        // Register the dagre layout
        cytoscapeDagre(cytoscape);
        console.log('Dagre layout registered with Cytoscape');

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: [...nodes, ...edges],
            layout: {
                name: 'dagre',
                rankDir: 'TB',          // Top to Bottom layout
                align: 'UL',           // Align nodes at the Upper Left
                rankSep: 75,           // Vertical spacing between nodes
                nodeSep: 50,           // Horizontal spacing between nodes
                edgeSep: 10,           // Edge spacing
                ranker: 'network-simplex', // Layer assignment method
                animate: true,
                animationDuration: 500,
                fit: true,
                padding: 30
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

        console.log('Cytoscape instance created successfully');
    } catch (error) {
        console.error('Error creating cytoscape instance:', error);
    }
}
