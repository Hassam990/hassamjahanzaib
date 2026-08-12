const E="modulepreload",p=function(s){return s.startsWith("/")||s.startsWith("http")?s:"/assets/js/"+s},v={},_=function(d,c,m){if(!c||c.length===0)return d();const a=document.getElementsByTagName("link");return Promise.all(c.map(e=>{if(e=p(e),e in v)return;v[e]=!0;const r=e.endsWith(".css"),u=r?'[rel="stylesheet"]':"";if(!!m)for(let i=a.length-1;i>=0;i--){const l=a[i];if(l.href===e&&(!r||l.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${e}"]${u}`))return;const t=document.createElement("link");if(t.rel=r?"stylesheet":E,r||(t.as="script",t.crossOrigin=""),t.href=e,document.head.appendChild(t),r)return new Promise((i,l)=>{t.addEventListener("load",i),t.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${e}`)))})})).then(()=>d()).catch(e=>{const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=e,window.dispatchEvent(r),!r.defaultPrevented)throw e})};

let h=$(".loader-main");

const loadApp=async(offset)=>{
    return _(()=>import("/assets/js/main-App.js").then(function(o){return o.b}),[]).then(o=>new o.default(offset));
};

const P=async()=>{
    if($("main").attr("data-barba-namespace")==="home"){
        const r=h.find(".loader-main__circle");
        const u=h.find(".f-36").eq(0);
        const l=80;
        let done=false;

        const finish=async()=>{
            if(done)return;
            done=true;
            u.text(99);
            r.css("--percent","79.2%");
            try{ await loadApp(100-l+10); }catch(err){ console.warn("main-App load error",err); }
            u.text(100);
            r.css("--percent","100%");
            setTimeout(()=>{ h.addClass("hide"); },400);
        };

        // Animate counter from 0 to 80 over 1.2s, then finish
        let count=0;
        const step=()=>{
            if(done)return;
            count++;
            u.text(count);
            r.css("--percent",(count*0.8)+"%");
            if(count<l){ setTimeout(step, 1200/l); }
            else{ finish(); }
        };
        setTimeout(step, 100);

        // Safety: force finish after 4s regardless
        setTimeout(finish, 4000);

    } else {
        h.remove();
        try{ await loadApp(); }catch(err){ console.warn("main-App load error",err); }
    }
};

P();
export{_};
