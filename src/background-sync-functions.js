const syncStore = [];

self.addEventListener('message', event => {
//if (isObject(event.data)) {
        if (event.data.type === 'somethingWasEaten') {
            //     const id = event.data.id || uuid()
            // pass the port into the memory store
            syncStore[event.data.addedId] = Object.assign({ port: event.ports[0] }, event.data);
            self.registration.sync.register(event.data.addedId);
        }
//    }
    console.info("message sent to service worker: ", event.data);
});

// console.log("background-sync:  Hello World!");
self.addEventListener('sync', function (event) {
    event.waitUntil(eatSomething(event.tag));
});

function eatSomething(addedId) {
    return new Promise((resolve, reject) => {
        const {port} = syncStore[addedId] || {};
        delete syncStore[addedId];
        // send a message to try to talk to firebase
        port.postMessage(addedId);
        // TODO instead of talking back and forth we should just 
        // talk through the indexedDB record...so the test here
        // would be to reject if the indexeddb record exists, and 
        // resolve if it is gone.
        console.info("sw sync event: we are online (for the moment); please send the following eaten item to firebase storage:", addedId);
        resolve();
    });
}