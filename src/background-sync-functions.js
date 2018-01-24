console.log("background-sync:  Hello World!");
self.addEventListener('sync', function (event) {
    if (event.tag == 'eatSomething') {
        event.waitUntil(eatSomething());
    }
});

function  eatSomething() {
    return new Promise((resolve, reject) => {
        // TODO read from redux queue of things to eat,
        // write it to firebase somehow.
        console.info("sync: eatSomething is happening.");
        resolve();
    });
}