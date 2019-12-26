import { Message } from './MessageInterface'
const Scaledrone = require('scaledrone-node');
let drone: any;
let my_id: any;
let my_room;
export let online_users: { id: any; }[];

export function send_message(msg: Message) {
  console.log('sending: ', msg);
  drone.publish({
    room: msg.receiver,
    message: msg.content
  });
}

export function intialize() {
  drone = new Scaledrone('6c7P3JiJufXLEdAt', {
    // Data sent with every message
    data: {
      name: 'Amir',
    },
  });

  const obervable_room = drone.subscribe('observable-room');

  obervable_room.on('open', (error: any) => {
    if (error) {
      return console.error(error);
    }
    // Connected to a room
  });

  obervable_room.on('members', (m: any) => {
    // when user has successfully connected to an observable room
    online_users = m;
    my_id = m[m.length - 1].id;
    my_room = drone.subscribe(my_id);
    my_room.on('data', (text: string, member: { id: any; clientData: any }) => {
      if (member) {
        console.log('received:', text, 'from:', member.id, 'name:', member.clientData.name || 'name not received');
      } else {
        // Message is from server :?
        console.log('server:', text);
      }
    });
    console.log('my id', my_id);
  });

  obervable_room.on('member_join', (m: any) => {
    online_users.push(m);
    console.log('joined:', m);
  });

  obervable_room.on('member_leave', ({ id }: any) => {
    const index = online_users.findIndex((member: { id: any; }) => member.id === id);
    online_users.splice(index, 1);
    console.log('left:', id);
  });

  obervable_room.on('data', (text: string, member: { id: any; }) => {
    if (member) {
      console.log('received:', text, 'from:', member.id);
    } else {
      // Message is from server :?
      console.log('server:', text);
    }
  });

  drone.on('close', (event: any) => {
    console.log('Connection was closed', event);
  });

  drone.on('error', (error: any) => {
    console.error(error);
  });

}

export function terminate() {
  console.log('FUCKKKK');
  drone.close();
}
