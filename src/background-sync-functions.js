const syncStore = {};
self.addEventListener('message', event => {
  if(event.data.type === 'sync') {
    // get a unique id to save the data
    const id = uuid();
    syncStore[id] = event.data;
    // register a sync and pass the id as tag for it to get the data
    self.registration.sync.register(id);
  }
  console.log(event.data);
});

console.log("background-sync:  Hello World!");
self.addEventListener('sync', function (event) {
    if (event.tag == 'eatSomething') {
        event.waitUntil(eatSomething(event.tag));
    }
});

function  eatSomething(tag) {
    return new Promise((resolve, reject) => {
        // TODO send a message back to nc-consumption-form to try to dequeue
        // and save to firebase.  
        // TODO if fails, wait an hour and fire again.
        console.info("sync: eatSomething is happening.", tag);
        resolve();
    });
}