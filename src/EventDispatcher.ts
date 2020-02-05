export enum EventTopics {
    // Communication:
    MESSAGE,
    HANDSHAKE, // used to determine id
    // Code Synchronization:
    CHANGE, // change in code
    WHOLE_CODE, // send/receive whole code in editor
    // Run:
    COMMAND,
    EXECUTION_IO
}

export interface Event {
    topic: EventTopics;
    content: any;
}

type ListenerType = { (e: any): any }; // listener should be function with one argument

var listeners: Array<(Array<ListenerType>)> = new Array(Object.keys(EventTopics).length / 2)
    .fill(0).map(() => new Array()); // initialize array based on size of Topics

export function eventOccurred(e: Event) { // call listeners based on topic of event
    console.log('occurred', e);
    try {
        listeners[e.topic].forEach(listener => listener(e.content));
    } catch (x) {
        console.log(x);
    }
}

export function listenTo(topic: EventTopics, listener: ListenerType) { // add listener
    listeners[topic].push(listener);
}