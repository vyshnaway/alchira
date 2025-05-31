// Shared event queue
let eventQueue = [];

// Function to handle events (called by watchFolders)
export function handleEvent(event) {
    console.log(`Adding event to queue: ${JSON.stringify(event)}`);
    eventQueue.push(event);
}

// Function to dequeue events (called by execute, including future AssemblyScript version)
export function dequeueEvent() {
    if (eventQueue.length > 0) {
        const event = eventQueue.shift();
        console.log(`Dequeuing event: ${JSON.stringify(event)}`);
        return event;
    }
    return null; // Return null if no events
}

// Function to check if there are events (useful for polling in execute)
export function hasEvents() {
    return eventQueue.length > 0;
}

// Function to clear the queue (optional, for cleanup)
export function clearQueue() {
    eventQueue = [];
    console.log('Event queue cleared');
}