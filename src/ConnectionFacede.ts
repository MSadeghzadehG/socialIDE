import * as connectionSetup from './ConnectionSetup';
import { Event, EventTopics } from './EventDispatcher';

export class ConnectionManger {
    private static _singletonManager: ConnectionManger;
    isHost: boolean = true;
    hostId: string = "";

    //singleton is used, so private constructor 
    private constructor() {
        connectionSetup.initialize();
    }
    public static getManager() {
        if (this._singletonManager == undefined) {
            this._singletonManager = new ConnectionManger();
        }
        return this._singletonManager;
    }
    getOnlineUsers() {
        return connectionSetup.onlineUsers;
    }
    sendToAll(e: Event) { // send message to all online users
        connectionSetup.send({ receiver: "observable-global", content: e });
    }
    sendToId(receiverUserId: string, e: Event) {
        connectionSetup.send({ receiver: receiverUserId, content: e });
    }
    sendToViewers(e: Event) {
        if (this.isHost)
            connectionSetup.send({ receiver: 'observable-' + connectionSetup.myId, content: e });
        else
            console.error('something is wrong, viewer trying to send to viewers', e);
    }
    isValidHost(userIndex: number): boolean { // validate host index
        return userIndex < connectionSetup.onlineUsers.length &&
            connectionSetup.onlineUsers[userIndex].id != connectionSetup.myId;
    }
    viewUser(userIndex: number): void {
        this.hostId = connectionSetup.onlineUsers[userIndex].id
        if (this.hostId != connectionSetup.myId) { // don't view yourself
            this.isHost = false;
            connectionSetup.joinHostRoom(this.hostId);
            connectionSetup.send({
                receiver: this.hostId,
                content: { topic: EventTopics.WHOLE_CODE, content: "" }
            })
        } else {
            this.hostId = "";
        }
    }
    unViewUser() {
        this.isHost = true;
        connectionSetup.leaveHostRoom();
        this.hostId = "";
    }
    quit() {
        connectionSetup.terminate();
    }
}