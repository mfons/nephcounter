const syncStore = {};

self.addEventListener('message', event => {
//if (isObject(event.data)) {
        if (event.data.type === 'somethingWasEaten') {
            //     const id = event.data.id || uuid()
            // pass the port into the memory store
            syncStore[event.data.addId] = Object.assign({ port: event.ports[0] }, event.data);
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
        port.postMessage(addedId);
        console.info("sw sync event: we are online (for the moment); please send the following eaten item to firebase storage:", addedId);
        resolve();
    });
}