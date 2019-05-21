import * as vscode from 'vscode';
import { Tracker, Issue } from '../api';
import { Resource } from '../resource';

export class IssuesProvider implements vscode.TreeDataProvider<IssueItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<IssueItem | undefined> = new vscode.EventEmitter<IssueItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<IssueItem | undefined> = this._onDidChangeTreeData.event;

    private tracker: Tracker;

    private resource: Resource;

    private query: string;

    private issues: AsyncIterator<Issue>;

    private nodes: Issue[];

    constructor(tracker: Tracker, resource: Resource, query: string) {
        this.tracker = tracker;
        this.resource = resource;
        this.query = query;
        this.issues = this.tracker.issues().search(query);
        this.nodes = [];
    }

    refresh() {
        this.issues = this.tracker.issues().search(this.query);
        this.nodes = [];
        this._onDidChangeTreeData.fire();
    }

    loadMore() {
        this._onDidChangeTreeData.fire();
    }

    async getChildren(element?: IssueItem): Promise<Issue[]> {
        let perPanel = 50;
        while(perPanel !== 0){
            const issue = await this.issues.next();
            if (issue === undefined) {
                break;
            }
            this.nodes.push(issue.value);
            perPanel--;
        }
        return this.nodes;
    }

    async getTreeItem(element: Issue): Promise<vscode.TreeItem> {
        return {
            id: element.number(),
            label: element.number(),
            description: await element.description(),
            tooltip: await element.description(),
            iconPath: this.resource.icons.Tracker,
            command: {
                command: 'vscode-yandex-tracker.openIssue',
                title: 'Open Issue',
                arguments: [element.number()],
            }
        };
    }
}

export class IssueItem implements vscode.TreeItem {

}