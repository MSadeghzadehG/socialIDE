import { username } from './main'
import { eventOccurred, listenTo, EventTopics, Event } from './EventDispatcher'

const Scaledrone = require('scaledrone-node');
/**
 * There are 3 rooms:
 * 1. observable-global : everyone joins it at first
 * 2. clientID : private room only he/she is member of, others can only send to it
 * 3. observable-clientID : viewers of a host are joined at it
 */
type ConnectionMessage = {
  receiver: string;
  content: Event;
}
type Member = {
  id: string, clientData: { name: string }
};

var drone: any;
export var myId: string = "UNINITIALIZED";
var myPrivateRoom: any;
var globalRoom: any;
var hostRoom: any | undefined;
export var onlineUsers: Member[]; // No need to initialize

var lastSentTime = 0;
var messageQueue: ConnectionMessage[] = [];

listenTo(EventTopics.HANDSHAKE, (e) => {
  if (myId == "UNINITIALIZED") {
    myId = e;
    console.log("joined with id", myId);
    myPrivateRoom = drone.subscribe(myId); // private room only I am at
    myPrivateRoom.on('message', (message: any) => { // used for data received event
      eventOccurred(message.data);
    });
  }
});

const delayMillieSeconds = 50;

export function send(msg: ConnectionMessage | undefined) {
  if (msg == undefined)
    return
  if (Date.now() - lastSentTime > delayMillieSeconds) {
    lastSentTime = Date.now();
    drone.publish({
      room: msg.receiver,
      message: msg.content
    });
    if (messageQueue.length != 0) {
      setTimeout(() => { send(messageQueue.shift()) }, delayMillieSeconds);
    }
  } else
    messageQueue.push(msg);
}

export function joinHostRoom(hostId: string) {
  console.log('join host room', hostId);
  hostRoom?.unsubscribe();
  hostRoom = drone.subscribe('observable-' + hostId);
  hostRoom.on('open', (error: any) => {
    if (error) {
      console.error(error);
    } else {
      // Connected to global room :
      console.log('Connected to Host', hostId);
    }
  });
  hostRoom.on('message', (message: any) => { // used for data received event
    eventOccurred(message.data);
  });
}
export function leaveHostRoom() {
  console.log('left host room', hostRoom);
  hostRoom?.unsubscribe();
}
export function initialize() {
  drone = new Scaledrone('6c7P3JiJufXLEdAt', {
    // Data sent with every message
    data: {
      name: username,
    },
  });

  globalRoom = drone.subscribe('observable-global'); // global room everyone is in it

  globalRoom.on('open', (error: any) => {
    if (error) {
      return console.error(error);
    } else {
      // Connected to global room
    }
  });

  globalRoom.on('members', (m: any) => {
    // get all users when successfully connected to the global room
    if (myId == "UNINITIALIZED")
      send({ receiver: 'observable-global', content: { topic: EventTopics.HANDSHAKE, content: "handshake" } })
    onlineUsers = m;
  });

  globalRoom.on('member_join', (m: Member) => {
    onlineUsers.push(m);
    console.log('joined global:', m);
  });

  globalRoom.on('member_leave', ({ id }: any) => {
    const index = onlineUsers.findIndex(member => member.id === id);
    onlineUsers.splice(index, 1);
    console.log('left global:', id);
  });

  globalRoom.on('message', (message: { data: Event, clientId: string }) => { // used for data received event
    if (message.data.topic != EventTopics.HANDSHAKE)
      eventOccurred(message.data);
    else
      eventOccurred({ topic: EventTopics.HANDSHAKE, content: message.clientId });
  });
  drone.on('close', (event: any) => {
    console.log('Connection is closed', event);
  });

  drone.on('error', (error: any) => {
    console.error(error);
  });

}

export function terminate() {
  drone.close();
}
