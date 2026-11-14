/* One navigation tree, presented as a modal side menu on small screens. */
(()=>{
 const sidebar=document.getElementById('study-sidebar'),layout=document.querySelector('.layout'),drawer=document.getElementById('mobile-menu'),open=document.getElementById('menu-open'),close=document.getElementById('menu-close');
 if(!sidebar||!drawer)return;
 const media=matchMedia('(max-width: 800px)');
 const tools=document.createElement('div');tools.className='menu-tools';tools.innerHTML='<p class="nav-label">STUDY TOOLS</p>';sidebar.append(tools);
 for(const id of ['audio-settings','theme-toggle','font-size','simple-toggle','add-profile']){const el=document.getElementById(id);if(el)tools.append(el)}
 document.getElementById('font-size').textContent='Aa Text size';
 document.getElementById('audio-settings').textContent='Voice & speed';
 const labels={home:'Home',cards:'Flashcards',quiz:'Practice quiz',exam:'Oral mock test',bank:'All questions',english:'English practice',interview:'Interview questions',plan:'Study plan',guide:'Print & resources',settings:'Account & settings',daily:'Today’s practice',full:'Full interview practice',progress:'My progress',offline:'Offline & devices'};
 const nav=sidebar.querySelector('nav');
 const groups=[['PRACTICE',['home','daily','cards','quiz','bank','english','interview','exam','full']],['MY STUDY',['progress','plan','guide','settings','offline']]];
 const links=new Map([...nav.querySelectorAll('a')].map(a=>[a.hash.slice(1),a]));
 for(const [title,ids] of groups){const h=document.createElement('div');h.className='nav-group';h.textContent=title;nav.append(h);for(const id of ids){const a=links.get(id);if(a){a.textContent=labels[id];nav.append(a)}}}
 sidebar.querySelector('.mobile-navigation')?.remove();sidebar.querySelector(':scope > .nav-label')?.remove();
 function shut(){if(drawer.open)drawer.close();open.setAttribute('aria-expanded','false');document.body.classList.remove('menu-is-open')}
 function place(){shut();if(media.matches)drawer.append(sidebar);else layout.prepend(sidebar)}
 open.addEventListener('click',()=>{drawer.showModal();open.setAttribute('aria-expanded','true');document.body.classList.add('menu-is-open')});
 close.addEventListener('click',shut);drawer.addEventListener('close',()=>{open.setAttribute('aria-expanded','false');document.body.classList.remove('menu-is-open')});
 drawer.addEventListener('click',e=>{if(e.target===drawer){const r=drawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)shut()}});
 sidebar.addEventListener('click',e=>{if(e.target.closest('a,button'))shut()});window.addEventListener('hashchange',shut);media.addEventListener('change',place);place();
})();
