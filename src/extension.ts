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
		}

		try {
			const graphData = await TerraformService.generateGraph(workspaceFolder);
			const webview = new TerraformGraphWebview(context.extensionUri);
			webview.updateContent(graphData);
		} catch (error) {
			if (error instanceof Error) {
				vscode.window.showErrorMessage(error.message);
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate(): void { }

