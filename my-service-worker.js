
/* eslint no-console: ["error", { allow: ["info"] }] */

var staticCacheName = 'nephcounter-static-v1';
self.addEventListener('install', function(event) {
  var urlsToCache = [
    '/',
    'js/main.js',
    'css/main.css',
    'imgs/icon.png',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
  ];

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache){
      return cache.addAll(urlsToCache).then(function() {
        console.log('requests have been added to the cache');
      }).catch(function() {
        console.log('requests have NOT been added to the cache');
      });
    })
  );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('nephcounter-') &&
                   cacheName != staticCacheName;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });

self.addEventListener('fetch', function(event) {
  event.respondWith(
//     caches.open('wittr-static-v1').then(function(cache){
//       return cache.match(event.request).catch(function() {
//         return fetch(event.request);
//       });
//     })
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});


// console.info(
//   'I am going to do my own service work thank you very much!'
// );
// self.addEventListener('fetch', function(event){
//     event.respondWith(
// //         new Response('Hello there <b>world</b>!!', {
// //             headers: { 'Content-Type': 'text/HTML'}
// //         })
//         fetch(event.request).then(function(response) {
//             if (response.status === 404) {
//                 return new Response('Wow man, this page was not found...');
//             }
//             return response;
//         }).catch(function() {
//             return new Response('Whoa dude!  totally bummed out man... :-( ');
//         })
//     );
// });

// ++++++++listen for the "message" event, and call
// skipWaiting if you get the appropriate message
self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  });
  
