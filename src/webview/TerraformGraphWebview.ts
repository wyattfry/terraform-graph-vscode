import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class TerraformGraphWebview {
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
        this._panel = vscode.window.createWebviewPanel(
            'terraformGraph',
            'Terraform Dependency Graph',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );
    }

    public updateContent(dotData: string): void {
        const htmlTemplate = fs.readFileSync(
            path.join(this._extensionUri.fsPath, 'src', 'webview', 'graphTemplate.html'),
            'utf8'
        );

        const graphInitScript = `
            const dot = \`${dotData.replace(/`/g, '\u0060')}\`;
            const edges = [...dot.matchAll(/"([^"]+)" -> "([^"]+)"/g)].map(m => ({ data: { id: m[1] + '_' + m[2], source: m[1], target: m[2] } }));
            const nodesMap = new Set(edges.flatMap(e => [e.data.source, e.data.target]));
            const nodes = Array.from(nodesMap).map(id => ({ data: { id } }));

            const cy = cytoscape({
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
        `;

        this._panel.webview.html = htmlTemplate.replace('${graphInitScript}', graphInitScript);
    }

    public dispose(): void {
        this._panel.dispose();
    }
}
