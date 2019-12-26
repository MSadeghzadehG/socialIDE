import * as vscode from 'vscode';
import { ConnectionManger } from './ConnectionFacede'
// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('extension is now active!');
	let manager = ConnectionManger.get_manager(); // Don't Remove! necessary for initilization
	// The command has been defined in the package.json file
	let disposable = vscode.commands.registerCommand('chat.send_to_all', () => {
		vscode.window.showInformationMessage('Hello');
		(async () => {
			const msg = await vscode.window.showInputBox({ placeHolder: 'Entrer Message to Send' });
			manager.send_to_all(msg || '');
		})();

	});
	// to unregister command afrer extention is deactivated
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	ConnectionManger.get_manager().quit();
}
