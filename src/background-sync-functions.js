const syncStore = [];

self.addEventListener('message', async (event) => {
    if (event.data.type === 'somethingWasEaten') {
        //     const id = event.data.id || uuid()
        // pass the port into the memory store
        syncStore[event.data.addedId] = Object.assign({ port: event.ports[0] }, event.data);
        await self.registration.sync.register(event.data.addedId);
            // .then(() => {
            //     console.log('Sync registered');
            // })
            // .catch((err) => {
            //     console.warn('Error with sync registration: ', err);
            // });
    }
    console.info("message sent to service worker: ", event.data);
});

self.addEventListener('sync', function (event) {
    console.info("in SW sync event handler for ", event.tag);
    event.waitUntil(allEatenThingsSaved(event.tag));
});

function allEatenThingsSaved(addedId) {
    return new Promise((resolve, reject) => {
        const { port } = syncStore[addedId] || {};
        // Instead of messaging back and forth we just 
        // "talk" through the indexedDB record...so the test here
        // would be to reject if the indexeddb record exists, and 
        // resolve if it is gone.
        areThereRecordsInTheQueue()
            .then(() => {
                // clients.matchAll({ includeUncontrolled: true })
                //     .then(clients => {
                //         clients.forEach(client => client.postMessage('Please post queued records. Sincerely, Sync.'))
                //     });
                port.postMessage('Please post queued records. Sincerely, Sync.');
                reject();
            })
            .catch(() => {
                // clients.matchAll({ includeUncontrolled: true })
                //     .then(clients => {
                //         clients.forEach(client => client.postMessage('There are no more queued records!  Good job! Sincerely, Sync.'))
                //     });
                port.postMessage('There are no more queued records!  Good job! Sincerely, Sync.');
                delete syncStore[addedId];
                resolve();
            });
        console.info("sw sync event: ", addedId);
    });
}

function areThereRecordsInTheQueue() {
    return new Promise((resolve, reject) => {
        var db;
        var request = self.indexedDB.open("NephcounterOffLineDB");
        request.onerror = function (event) {
            // Do something with request.errorCode!
            console.log("NephcounterOffLineDB creation failed!", event)
            reject("open of database failed with error!");
        }; // end of onerror
        request.onsuccess = function (event) {
            console.log("NephcounterOffLineDB open succeeded!");
            db = event.target.result;
            if (!db.objectStoreNames.contains('eatenItemsQueue')) {
                // TODO should this be a "resolve" or a "reject"?
                reject("eatenItemsQueue object store has not been created yet to save to.");
                console.warn("eatenItemsQueue object store has not been created yet to save to.", db.objectStoreNames);
                db.close();
                return;
            }
            var objectStore = db.transaction(["eatenItemsQueue"], "readonly").objectStore("eatenItemsQueue");
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);
                    //cursor.continue();
                    resolve(); // tell sync to try again later
                }
                else {
                    //alert("No more entries!");
                    reject();
                }
                db.close();
            };
        }; // end of onsuccess

        // This is done only if there is no database and one needs to be created before we read from it.
        request.onupgradeneeded = function (event) {
            console.log("an upgrade is needed...");
            var db = event.target.result;
        }; // end of onupgradeneeded
    });
}