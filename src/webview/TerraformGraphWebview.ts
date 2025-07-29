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
                    vscode.Uri.joinPath(extensionUri, 'out', 'webview'),
                    vscode.Uri.joinPath(extensionUri, 'src', 'webview'), // For development
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

    private getAssetPath(filename: string): string {
        // Try compiled output first, then fallback to source (for development)
        const outPath = path.join(this._extensionUri.fsPath, 'out', 'webview', filename);
        const srcPath = path.join(this._extensionUri.fsPath, 'src', 'webview', filename);

        if (fs.existsSync(outPath)) {
            return outPath;
        } else if (fs.existsSync(srcPath)) {
            return srcPath;
        } else {
            throw new Error(`Asset not found: ${filename}`);
        }
    }

    public updateContent(dotData: string): void {
        try {
            const htmlPath = this.getAssetPath('graphTemplate.html');
            let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');

            // Get the special URI for the script file that VS Code can serve
            const scriptPath = this.getAssetPath('graph.js');
            const scriptUri = this._panel.webview.asWebviewUri(vscode.Uri.file(scriptPath));

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
            this._panel.webview.html = `<!DOCTYPE html><html><body><h1>Error loading graph</h1><p>There was an error loading the graph.</p><h2>Error Details:</h2><pre>${error}</pre></body></html>`;
            vscode.window.showErrorMessage('Failed to load the Terraform graph. Check the console for details.');
        }
    }

    public dispose(): void {
        this._panel.dispose();
    }
}