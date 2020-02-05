import * as vscode from 'vscode';
import { EventTopics, listenTo } from './EventDispatcher'
import * as fs from 'fs';
import * as path from 'path';
import { ConnectionManger } from './ConnectionFacede'

class UserItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}`;
    }

    get description(): string {
        return this.label;
    }

    // contextValue = 'dependency';
}
class OnlineUserProvider implements vscode.TreeDataProvider<UserItem>{
    private _onDidChangeTreeData: vscode.EventEmitter<UserItem | undefined> = new vscode.EventEmitter<UserItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<UserItem | undefined> = this._onDidChangeTreeData.event;

    constructor() {
    }

    getChildren(element?: UserItem): Thenable<UserItem[]> {
        let res = []
        for (let u in ConnectionManger.getManager().getOnlineUsers())
            res.push(new UserItem(u, vscode.TreeItemCollapsibleState.None, { command: 'communication.chooseUser', title: 'salam', arguments: [u] }));
        return Promise.resolve(res);
    }
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: UserItem): vscode.TreeItem {
        return element;
    }

}

export function initializeCommunication() {
    var globalMessagingOutput = vscode.window.createOutputChannel("Global Messages");
    listenTo(EventTopics.MESSAGE, (m: any) => {
        globalMessagingOutput.appendLine(m);
    });
    vscode.window.registerTreeDataProvider('onlineUsers', new OnlineUserProvider())
}