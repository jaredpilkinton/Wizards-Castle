const C="wcastle-v2";
const A=["./manifest.webmanifest"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>c.addAll(A)));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  const isPage=e.request.mode==="navigate" ||
    u.pathname.endsWith("/") ||
    u.pathname.endsWith("/index.html");

  if(isPage){
    e.respondWith(
      fetch(e.request,{cache:"no-store"})
        .then(r=>{
          const copy=r.clone();
          caches.open(C).then(c=>c.put("./index.html",copy));
          return r;
        })
        .catch(()=>caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached=>
      cached || fetch(e.request).then(r=>{
        const copy=r.clone();
        caches.open(C).then(c=>c.put(e.request,copy));
        return r;
      })
    )
  );
});
