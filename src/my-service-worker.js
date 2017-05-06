/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/* eslint no-console: ["error", { allow: ["info"] }] */

console.info(
  'I am going to do my own service work thank you very much!'
);
self.addEventListener('fetch', function(event){
    event.respondWith(
//         new Response('Hello there <b>world</b>!!', {
//             headers: { 'Content-Type': 'text/HTML'}
//         })
        fetch(event.request).then(function(response) {
            if (response.status === 404) {
                return new Response('Wow man, this page was not found...');
            }
            return response;
        }).catch(function() {
            return new Response('Whoa dude!  totally bummed out man... :-( ');
        })
    );
});
