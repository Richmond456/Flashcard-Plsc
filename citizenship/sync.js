/* Optional account sync. Never loads the Firebase SDK before project configuration exists. */
'use strict';
let cloud=null,cloudUser=null,cloudApplying=false,cloudBusy=false,cloudTimer=null,cloudLocalId=null,cloudUnsubscribe=null,googleTimer=null;
function cloudConfigured(){const c=window.CITIZENSHIP_FIREBASE_CONFIG;return !!(c&&c.apiKey&&c.authDomain&&c.projectId&&c.appId)}
function syncPanel(){return `<div class="card" style="margin-top:20px"><h2>Automatic progress sync</h2>${cloudConfigured()?`<p>Use one account per person to keep progress separate across devices. Connect the selected profile only. Sign in to the same account on your other device.</p><p id="sync-status" role="status">${cloudUser?'Connected':'Sign in to connect this profile.'}</p><div class="actions"><button type="button" id="sync-google">Continue with Google</button></div><form id="sync-form"><label>Email<input id="sync-email" type="email" autocomplete="email" required></label><label>Password<input id="sync-password" type="password" autocomplete="current-password" minlength="8" required></label><div class="actions"><button type="submit" data-sync-submit="signin">Sign in</button><button type="submit" data-sync-submit="signup" class="secondary">Create account</button><button type="button" id="sync-signout" class="quiet">Sign out</button></div></form><p class="muted">Email and password are handled by Firebase Authentication; this site does not save passwords. Sign out before switching to another family member's account.</p>`:`<p>Account sync is being prepared. You can continue studying offline and use backups in the meantime.</p>`}</div>`}
function syncStatus(t){const el=document.querySelector('#sync-status');if(el)el.textContent=t}
function cloudPayload(p){return {name:p.name,records:p.records||{},tests:(p.tests||[]).slice(-50),checks:p.checks||{},officials:p.officials||{},verifiedDate:p.verifiedDate||'',studyDays:p.studyDays||[],simple:!!p.simple,special:!!p.special,large:!!p.large,dark:!!p.dark,rate:p.rate||.95,updatedAt:Date.now()}}
function mergeCloud(local,remote){
  const merged={...local,records:{...remote.records,...local.records},checks:{...remote.checks,...local.checks},officials:{...remote.officials,...local.officials}};
  for(const [id,r] of Object.entries(remote.records||{})){const l=local.records?.[id];if(!l||r.last>l.last)merged.records[id]=r}
  merged.studyDays=[...new Set([...(remote.studyDays||[]),...(local.studyDays||[])])].sort();
  const seen=new Set();merged.tests=[...(remote.tests||[]),...(local.tests||[])].filter(t=>{const key=[t.mode,t.date,t.correct,t.total].join(':');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>a.date-b.date).slice(-50);
  if((remote.updatedAt||0)>(local.syncUpdatedAt||0))for(const k of ['name','simple','special','large','dark','rate','verifiedDate'])if(remote[k]!==undefined)merged[k]=remote[k];
  merged.syncUpdatedAt=Math.max(remote.updatedAt||0,local.syncUpdatedAt||0);return merged;
}
async function initCloud(){if(!cloudConfigured()||cloud)return;
  const ver='13.2.0',base='https://www.gstatic.com/firebasejs/'+ver+'/';
  const [{initializeApp},auth,store]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
  const app=initializeApp(window.CITIZENSHIP_FIREBASE_CONFIG),authentication=auth.getAuth(app);
  const firestore=store.initializeFirestore(app,{localCache:store.persistentLocalCache({tabManager:store.persistentMultipleTabManager()})});
  cloud={auth,store,authentication,firestore};
  auth.onAuthStateChanged(authentication,async user=>{
    cloudUser=user;if(user)clearTimeout(googleTimer);if(cloudUnsubscribe){cloudUnsubscribe();cloudUnsubscribe=null}
    if(!user){cloudLocalId=null;syncStatus('Signed out. Progress continues to save on this device.');return}
    // The account is attached explicitly on sign-in, never to whichever profile is later selected.
    const ref=store.doc(firestore,'studyProfiles',user.uid);
    try{
      const remote=await store.getDoc(ref);
      if(remote.exists()){
        const data=remote.data();let id=Object.keys(db.profiles).find(id=>db.profiles[id].cloudUid===user.uid);
        if(!id){id='cloud_'+user.uid;db.profiles[id]=fresh(String(data.name||'Study').slice(0,30))}
        cloudLocalId=id;db.profiles[id]=mergeCloud(db.profiles[id],data);db.profiles[id].cloudUid=user.uid;db.active=id;cloudApplying=true;save();cloudApplying=false;profiles();render();
      }else{
        cloudLocalId=db.active;db.profiles[cloudLocalId].cloudUid=user.uid;cloudApplying=true;save();cloudApplying=false;await store.setDoc(ref,cloudPayload(P()));
      }
      syncStatus('Connected. Changes sync when online.');
      cloudUnsubscribe=store.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
        if(!snapshot.exists()||!cloudLocalId)return;
        const p=db.profiles[cloudLocalId];if(!p)return;
        const next=mergeCloud(p,snapshot.data());
        db.profiles[cloudLocalId]=next;cloudApplying=true;save();cloudApplying=false;if(db.active===cloudLocalId){profiles();if(!cloudBusy)render()}
        syncStatus(snapshot.metadata.hasPendingWrites?'Saving changes…':snapshot.metadata.fromCache?'Offline — will sync later.':'Saved across devices.');
      },()=>syncStatus('Sync could not read your progress. Check your connection and security rules.'));
    }catch{syncStatus('Could not connect. Check your connection and security rules.')} 
  });
}
function queueCloudSave(){if(cloudApplying||!cloudUser||!cloud||db.active!==cloudLocalId)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(async()=>{
  if(!cloudUser||!db.profiles[cloudLocalId])return;
  cloudBusy=true;try{const ref=cloud.store.doc(cloud.firestore,'studyProfiles',cloudUser.uid);await cloud.store.setDoc(ref,cloudPayload(db.profiles[cloudLocalId]));syncStatus('Saved across devices.')}catch{syncStatus('Sync pending. Local progress is saved; check your connection.')}finally{cloudBusy=false}
},900)}
async function cloudSubmit(kind,email,password){
  try{await initCloud();if(!cloud)throw Error('Firebase is not configured');
    if(kind==='signup')await cloud.auth.createUserWithEmailAndPassword(cloud.authentication,email,password);
    else await cloud.auth.signInWithEmailAndPassword(cloud.authentication,email,password);
  }catch(e){syncStatus(e.code==='auth/email-already-in-use'?'Account exists. Sign in instead.':e.code==='auth/invalid-credential'?'Check your email and password.':'Could not sign in. Check your details and try again.')}}
document.addEventListener('submit',e=>{if(e.target.id!=='sync-form')return;e.preventDefault();const b=e.submitter;cloudSubmit(b?.dataset.syncSubmit||'signin',document.querySelector('#sync-email').value,document.querySelector('#sync-password').value)});
document.addEventListener('click',e=>{
  if(e.target.id==='sync-google'){
    if(!cloud){syncStatus('Sign-in is loading. Try again in a moment.');return}
    syncStatus('Opening Google sign-in…');clearTimeout(googleTimer);googleTimer=setTimeout(()=>{if(!cloudUser)syncStatus('If the Google window stays blank, close it and open this study site in regular Chrome or Safari. Email/password sign-in is also available.')},12000);cloud.auth.signInWithPopup(cloud.authentication,new cloud.auth.GoogleAuthProvider()).catch(err=>{clearTimeout(googleTimer);
      syncStatus(err.code==='auth/popup-blocked'?'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.':err.code==='auth/unauthorized-domain'?'Add richmond456.github.io to Firebase Authentication authorized domains.':err.code==='auth/popup-closed-by-user'?'Google sign-in was closed. You can try again.':'Google sign-in failed. Try again or use email and password.');
    });
  }
  if(e.target.id==='sync-signout'&&cloud)cloud.auth.signOut(cloud.authentication)
});
if(cloudConfigured())initCloud().catch(()=>{});
window.addEventListener('online',()=>{if(cloudConfigured()&&!cloud)initCloud().catch(()=>{})});

