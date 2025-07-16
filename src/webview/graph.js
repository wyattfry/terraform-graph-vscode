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

    const nodesMap = new Set(edges.flatMap(e => [e.data.source, e.data.target]));
    const nodes = [];
    Array.from(nodesMap).forEach(id => {
        const parts = id.split(".");
        const type = id.startsWith('data') ? 'data' : 'resource';
        const resourceType = parts[parts.length - 2];
        const name = parts[parts.length - 1];
        const boxFillColor = type === "data" ? '#b4d8fa' : '#64aff5';

        // Main node
        nodes.push({
            data: {
                id: id,
                resourceType: resourceType,
                name: name,
                boxFillColor: boxFillColor
            }
        });
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

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: [...nodes, ...edges],
            layout: {
                name: 'dagre',
                rankDir: 'TB',
                rankSep: 100,           // Increase vertical spacing
                nodeSep: 100,           // Increase horizontal spacing
                nodeDimensionsIncludeLabels: true, // Consider labels in layout calculations
                animate: true,
                animationDuration: 500,
                fit: true
            },
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': function (ele) {
                            const resourceType = ele.data('resourceType');
                            const name = ele.data('name');
                            // Add some padding with spaces to help text wrapping
                            return resourceType + '\n' + name;
                        },
                        'background-color': 'data(boxFillColor)',
                        'border-width': 2,
                        'border-color': '#666',
                        'shape': 'roundrectangle',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-family': 'monospace',
                        'text-wrap': 'wrap',
                        'text-max-width': '200px', // Allow wider text before wrapping
                        'width': 'label',  // Size to fit the label
                        'height': 'label', // Size to fit the label
                        'padding': '20',   // Add padding around the text
                        'text-margin-y': 0,
                        'font-size': 12,
                        'text-justification': 'center'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#666',
                        'target-arrow-color': '#666',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'control-point-step-size': 100,  // Increase curve intensity
                        'arrow-scale': 1.2,
                        'target-arrow-fill': 'filled',
                        'edge-distances': 'node-position', // Changed to improve curve paths

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
