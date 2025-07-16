import cytoscape from 'cytoscape';

declare global {
    interface Window {
        cytoscape: typeof cytoscape;
    }
}

export function initializeGraph(dotData: string): void {
    const dot = dotData;
    const edges = [...dot.matchAll(/"([^"]+)" -> "([^"]+)"/g)]
        .map(m => ({ data: { id: m[1] + '_' + m[2], source: m[1], target: m[2] } }));
    const nodesMap = new Set(edges.flatMap(e => [e.data.source, e.data.target]));
    const nodes = Array.from(nodesMap).map(id => ({ data: { id } }));

    const cy = (window as any).cytoscape({
        container: document.getElementById('cy'),
        elements: nodes.concat(edges),
        layout: {
            name: 'cola',
            animate: true
        },
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'color': '#000',
                    'background-color': '#61bffc',
                    'font-size': 10,
                    'shape': 'roundrectangle',
                    'padding': '5px'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 1,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            }
        ]
    });
}
