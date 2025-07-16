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
                    vscode.Uri.joinPath(extensionUri, 'src', 'webview')
                ],
                devTools: true // Enable DevTools for debugging
            }
        );
        this._panel.webview.html = "Loading...";
    }

    public updateContent(dotData: string): void {
        try {
            const htmlTemplate = fs.readFileSync(
                path.join(this._extensionUri.fsPath, 'src', 'webview', 'graphTemplate.html'),
                'utf8'
            );

            // Get the special URI for the script file that VS Code can serve
            const scriptUri = this._panel.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'graph.js')
            );

            // Get the webview URI to add to CSP
            const webviewUri = this._panel.webview.cspSource;

            // Replace the placeholders in the HTML template
            const html = htmlTemplate
                .replace('{webviewUri}', webviewUri)
                .replace('{graphScriptUri}', scriptUri.toString())
                .replace('{dotData}', dotData.replace(/`/g, '\u0060').replace(/\\/g, '\\\\'));

            this._panel.webview.html = html;
        }

    public dispose(): void {
        this._panel.dispose();
    }
}
