import * as vscode from 'vscode';
import * as dispatcher from './EventDispatcher'
import { ConnectionManger } from './ConnectionFacede'

var activeEditor: vscode.TextEditor | undefined;
var conManager = ConnectionManger.getManager();
/**
 * This class is just setting event handlers when changes are made to file
 * Also make changes made by others
 */
export function initializeSynchronizer(): vscode.Disposable[] {

    activeEditor = vscode.window.activeTextEditor; // current active text editor
    let disposables = []; // used to remove event handlers
    var ignoreChange: boolean = false; // used to avoid submitting changes made by ourself

    disposables.push(vscode.workspace.onDidChangeTextDocument((change: vscode.TextDocumentChangeEvent) => {
        // called when a change is made, by ourself or others
        if (!ignoreChange) { // whether ignore change or not
            if (change.document.fileName == activeEditor?.document.fileName) { // change is made to active editor or other
                if (conManager.isHost)
                    conManager.sendToViewers({ topic: dispatcher.EventTopics.CHANGE, content: change.contentChanges });
                    // conManager.sendToAll({ topic: dispatcher.EventTopics.CHANGE, content: change.contentChanges });
                else
                    conManager.sendToId(conManager.hostId, { topic: dispatcher.EventTopics.CHANGE, content: change.contentChanges });
                    // conManager.sendToAll({ topic: dispatcher.EventTopics.CHANGE, content: change.contentChanges });
            }
        }
        ignoreChange = false; // accept changes again
    }));

    disposables.push(vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
        // called when active window is changes
        if (conManager.isHost)
            activeEditor = editor;
        else {
            activeEditor?.hide();
            activeEditor = editor;
            conManager.unViewUser();
        }
    }));

    // Set Listeners for outer events(change made by others)
    dispatcher.listenTo(dispatcher.EventTopics.CHANGE, function (change: any) {
        //console.log("editing");
        // change is made
        try {
            vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
                // apply changes
                //console.log("array", change);
                change.forEach((c:any) => editBuilder.replace(new vscode.Range(new vscode.Position(c.range[0].line, c.range[0].character),
                    new vscode.Position(c.range[1].line, c.range[1].character)), c.text));
                ignoreChange = true;
            });
        } catch (x) {
            console.log(x);
        }
    });

    dispatcher.listenTo(dispatcher.EventTopics.WHOLE_CODE, function (wholeNewCode: string) {
        // console.log("editing2");
        // request for all code (when connected initially)
        try{
            if (conManager.isHost) {
                conManager.sendToViewers({ topic: dispatcher.EventTopics.WHOLE_CODE, content: vscode.window.activeTextEditor?.document.getText() });
                //conManager.sendToAll({ topic: dispatcher.EventTopics.WHOLE_CODE, content: activeEditor?.document.getText() });
            } else {
                if (activeEditor != undefined) {
                    // set all code to recently received
                    let invalidRange = new vscode.Range(0, 0, activeEditor.document.lineCount, 0);
                    let fullRange = activeEditor.document.validateRange(invalidRange);
                    activeEditor.edit(edit => {
                        edit.replace(fullRange, wholeNewCode);
                        ignoreChange = true;
                    });
                }
            }
        } catch(x) {
            console.log(x);
        }
    }
    );

    return disposables;
}