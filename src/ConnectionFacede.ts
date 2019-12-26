import * as connectionSetup from './ConnectionSetup';
export class ConnectionManger {
    private static sigleton_manager: ConnectionManger;
    //singleton is used, so private constructor 
    private constructor() {
        connectionSetup.intialize();
    }
    public static get_manager() {
        if (this.sigleton_manager == undefined) {
            this.sigleton_manager = new ConnectionManger();
        }
        return this.sigleton_manager;
    }
    get_online_users() {
        return connectionSetup.online_users;
    }
    send_to_all(msg: string) {
        if (msg != '')
            connectionSetup.send_message({ receiver: 'observable-room', topic: 'chat', content: msg });
    }
    send_to(msg: string, receiver_user_id: string) {
        connectionSetup.send_message({ receiver: receiver_user_id, topic: 'chat', content: msg });
    }
    quit() {
        connectionSetup.terminate();
    }
}