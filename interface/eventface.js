// Shared event queue
let eventQueue = [];

// Function to handle events (called by watchFolders)
export function queueEvent(event) { eventQueue.push(event); }
// Function to check if there are events (useful for polling  in execute)
export function hasEvents() { return eventQueue.length > 0; }
// Function to clear the queue (optional, for cleanup)
export function clearQueue() { eventQueue = []; }

// Function to dequeue events (called by execute, including future AssemblyScript version)
export function dequeueEvent() {
    if (eventQueue.length > 0) {
        const event = eventQueue.shift();
        return event;
    }
    return null; // Return null if no events
}

