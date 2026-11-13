'use strict';
const CACHE='citizenship-family-v14-20261113';
const ASSETS=['./','index.html','style.css','data.js','learning-content.js','learning.js','firebase-config.js','sync.js','app.js','manifest.webmanifest','icon.svg','Family_Study_Guide.pdf'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('citizenship-family-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  // Keep one complete version until the next service worker activates.
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    if(event.request.mode==='navigate')return fetch(event.request).catch(()=>cache.match('index.html'));
    return fetch(event.request);
  }));
});