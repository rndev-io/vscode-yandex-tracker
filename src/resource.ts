import * as vscode from 'vscode';
import * as path from 'path';

export class Resource {
    readonly icons: {
        Tracker: string;
    };

    constructor(context: vscode.ExtensionContext){
        this.icons = {
            Tracker: context.asAbsolutePath(path.join('resources', 'icons', 'tracker.svg')),
        }
    }
}