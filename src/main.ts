import * as vscode from 'vscode';
import { ConnectionManger } from './ConnectionFacede'
import { EventTopics } from './EventDispatcher'
import { initializeSynchronizer } from './Synchronizer'
import { initializeCommunication } from './CommunicationManager'

export var username: string;

// this method is called when extension is activated
export function activate(context: vscode.ExtensionContext) {

	username = process.env.LOGNAME || process.env.USERNAME || process.env.USER || "No Username";
	console.log('extension is now active!', username);
	let conManager = ConnectionManger.getManager(); // Don't Remove! necessary for initialization
	context.subscriptions.push(...initializeSynchronizer());
	initializeCommunication();
	// The command has been defined in the package.json file
	let disposable = vscode.commands.registerCommand('communication.chooseUser', () => {
		(async () => {
			let onlineUsers = conManager.getOnlineUsers();
			console.log('Online Users:', onlineUsers); // TODO Show in Tree View
			const enteredIndex = await vscode.window.showInputBox({ placeHolder: 'Enter User index to View' });
			if (enteredIndex != undefined && conManager.isValidHost(Number(enteredIndex))) {
				// create new document
				await vscode.window.showTextDocument(
					await vscode.workspace.openTextDocument(vscode.Uri.parse('untitled:Social_IDE.py', true)),
					0, false);
				conManager.viewUser(Number(enteredIndex)); // view the selected user
			}
		})();
	});
	// to unregister command after extension is deactivated
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('communication.sendGlobalMessage', () => {
		(async () => {
			const messageToSend = await vscode.window.showInputBox({ placeHolder: 'Enter Message To Send to All' });
			conManager.sendToAll({ topic: EventTopics.MESSAGE, content: username + ": " + messageToSend });
		})();
	});
	// to unregister command after extension is deactivated
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	ConnectionManger.getManager().quit();
}
