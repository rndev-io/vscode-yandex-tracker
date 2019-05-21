import * as path from 'path';
import * as vscode from 'vscode';
import { Tracker } from '../api';

export class IssuePanel {
    private context: vscode.ExtensionContext;

    private tracker: Tracker;

    private panel: vscode.WebviewPanel | null;

    private disposables: vscode.Disposable[];


    constructor(context: vscode.ExtensionContext, tracker: Tracker) {
        this.context = context;
        this.tracker = tracker;
        this.disposables = [];
        this.panel = null;
    }

    async show(ticketNumber: string) {
        const column = (vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined) || vscode.ViewColumn.One;
        if(!this.panel) {
            this.panel = vscode.window.createWebviewPanel(
                'react',
                ticketNumber,
                column,
                {enableScripts: true, localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'media'))]}
            );
            this.panel.webview.html = this.webviewHTML();
            this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        } else {
            this.panel.reveal(column);
            this.panel.title = ticketNumber;
        }
        const issue = this.tracker.issues().get(ticketNumber);
        const comments = await Promise.all((await issue.comments().all()).map((c) => {return c.raw();}));
        this.panel.webview.postMessage({
            command: 'issue',
            args: {
                issue: await issue.raw(),
                front: this.tracker.front(),
                comments: comments
            }
        });
    }

    private dispose() {
        if(this.panel === null) {
            return;
        }
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
        this.panel = null;
    }

    private webviewHTML() {
        const scriptPathOnDisk = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'index.js'));
        const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
        const nonce = this.nonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                <title>Issues</title>
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}'; style-src vscode-resource: 'unsafe-inline' http: https: data:;">
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }

    private nonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}