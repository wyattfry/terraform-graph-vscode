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
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'src', 'webview'),
                    vscode.Uri.joinPath(extensionUri, 'node_modules')
                ],
            }
        );
        this._panel.webview.html = "Loading...";
    }

    private getScriptUri(scriptName: string): vscode.Uri {
        const nodeModulesPath = path.join(this._extensionUri.fsPath, 'node_modules');
        let scriptPath: string;

        switch (scriptName) {
            case 'cytoscape':
                scriptPath = path.join(nodeModulesPath, 'cytoscape', 'dist', 'cytoscape.min.js');
                break;
            case 'dagre':
                scriptPath = path.join(nodeModulesPath, 'dagre', 'dist', 'dagre.min.js');
                break;
            case 'cytoscape-dagre':
                scriptPath = path.join(nodeModulesPath, 'cytoscape-dagre', 'cytoscape-dagre.js');
                break;
            default:
                throw new Error(`Unknown script: ${scriptName}`);
        }

        return this._panel.webview.asWebviewUri(vscode.Uri.file(scriptPath));
    }

    public updateContent(dotData: string): void {
        try {
            let htmlTemplate = fs.readFileSync(
                path.join(this._extensionUri.fsPath, 'src', 'webview', 'graphTemplate.html'),
                'utf8'
            );

            // Get the special URI for the script file that VS Code can serve
            const scriptUri = this._panel.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'graph.js')
            );

            // Get the webview URI to add to CSP
            const webviewUri = this._panel.webview.cspSource;

            // Replace all the placeholders in the HTML template
            const html = htmlTemplate
                .replace('{webviewUri}', webviewUri)
                .replace('{cytoscape-uri}', this.getScriptUri('cytoscape').toString())
                .replace('{dagre-uri}', this.getScriptUri('dagre').toString())
                .replace('{cytoscape-dagre-uri}', this.getScriptUri('cytoscape-dagre').toString())
                .replace('{graphScriptUri}', scriptUri.toString())
                .replace('{dotData}', dotData.replace(/`/g, '\u0060').replace(/\\/g, '\\\\'));

            this._panel.webview.html = html;
        } catch (error) {
            console.error('Error updating content:', error);
        }
    }

    public dispose(): void {
        this._panel.dispose();
    }
}
