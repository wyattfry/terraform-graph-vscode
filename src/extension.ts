// VS Code extension: Terraform Graph Viewer MVP (TypeScript)
// Features: Pan/Zoom, compact layout, uses terraform graph

import * as vscode from 'vscode';
import { TerraformService } from './services/TerraformService';
import { TerraformGraphWebview } from './webview/TerraformGraphWebview';

export function activate(context: vscode.ExtensionContext): void {
	console.log('Terraform Graph Viewer extension is now active.');
	const disposable = vscode.commands.registerCommand('terraform-graph-viewer.open', async () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found.');
			return;
		} else {
			console.log(`Generating graph for workspace: ${workspaceFolder}`);
		}

		try {
			const graphData = await TerraformService.generateGraph(workspaceFolder);
			console.log('Graph data generated successfully.', graphData);
			const webview = new TerraformGraphWebview(context.extensionUri);
			console.log('Creating webview for graph display.', webview);
			webview.updateContent(graphData);
			console.log('Webview content updated with graph data.');
		} catch (error) {
			if (error instanceof Error) {
				vscode.window.showErrorMessage(error.message);
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate(): void { }

