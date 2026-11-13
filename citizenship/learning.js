/* Learning tools use the same local profile and question bank as the core app. */
function setupFamily(){
  if(db.familySetup)return;
  const emptyFamily=db.active==='family' && Object.keys(P().records).length===0 && P().tests.length===0;
  for(const name of ['Richmond','Davis','Desmond','Tomi','Maurice']){
    if(!Object.values(db.profiles).some(p=>p.name.toLowerCase()===name.toLowerCase())){
      const p=fresh(name);p.simple=name==='Tomi';p.large=p.simple;p.rate=p.simple ? .85 : .95;
      db.profiles['family_'+name.toLowerCase()]=p;
    }
  }
  if(emptyFamily){db.active=Object.keys(db.profiles).find(id=>db.profiles[id].name==='Richmond');delete db.profiles.family;}
  db.familySetup=true;save();
}
function learningHelp(q){const n=window.LEARNING_NOTES[q.id];return n?`<details class="learning-help" ${P().simple?'open':''}><summary>Understand it · memory tip</summary><p>${esc(n.explain)}</p><p><strong>Remember:</strong> ${esc(n.tip)}</p><button class="secondary" data-help-audio="${q.id}">▶ Hear explanation</button><p class="muted">Study explanation, not an extra answer to memorize. The official question above stays unchanged.</p></details>`:''}
function localDay(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
function studyStreak(days,now=new Date()){
  const dates=new Set(days||[]);let d=new Date(now.getFullYear(),now.getMonth(),now.getDate()),n=0;
  if(!dates.has(localDay(d)))d.setDate(d.getDate()-1);
  while(dates.has(localDay(d))){n++;d.setDate(d.getDate()-1)}return n;
}
function topicStats(){return [...new Set(pool().map(q=>q.category))].map(name=>{
  const qs=pool().filter(q=>q.category===name),rs=qs.map(q=>P().records[q.id]).filter(Boolean),right=rs.reduce((n,r)=>n+r.right,0),attempts=rs.reduce((n,r)=>n+r.right+r.wrong,0);
  return {name,total:qs.length,seen:rs.length,mastered:rs.filter(r=>r.streak>=3).length,right,attempts,due:rs.filter(r=>r.due<=Date.now()).length};
})}
function dailyQuestions(){
  const now=Date.now(),strength=Object.fromEntries(topicStats().map(t=>[t.name,t.attempts?t.right/t.attempts:0]));
  const priority=q=>{const r=P().records[q.id];return !r?2:r.due<=now?0:r.streak===0?1:3};
  return shuffle(pool()).sort((a,b)=>priority(a)-priority(b)||strength[a.category]-strength[b.category]).slice(0,P().simple?5:10);
}
function progress(){return heading('See your progress.','Each profile has its own practice history. Confidence means three correct self-checks in a row, not a prediction of an interview result.')+`<div class="stats"><div class="stat"><strong>${studyStreak(P().studyDays)}</strong><span>Day practice streak</span></div><div class="stat"><strong>${(P().studyDays||[]).length}</strong><span>Days practiced</span></div><div class="stat"><strong>${stats().due.length}</strong><span>Questions due</span></div></div><div class="grid">${topicStats().map(t=>`<section class="card"><h2>${esc(t.name)}</h2><p>${t.seen}/${t.total} practiced · ${t.mastered} confident · ${t.due} due</p><progress max="${t.total}" value="${t.mastered}" aria-label="${esc(t.name)} confident questions"></progress><p>${t.attempts?Math.round(t.right/t.attempts*100)+'% correct across '+t.attempts+' checks':'No answers checked yet.'}</p><a href="#cards" data-study-topic="${esc(t.name)}">Practice this topic →</a></section>`).join('')}</div><div class="card" style="margin-top:20px"><h2>A good next step</h2><p>Daily practice puts overdue questions first, then missed and new questions. Topics with lower accuracy come first within each group. Correct answers return after 1, 3, 7, then 14 days.</p>${button('Start daily practice','daily')}<p class="muted">Streak tracking starts with this update. Earlier question records are kept.</p></div>`}
let dailySession=null,fullSession=null;
function daily(){return heading('One small session today.','Review what needs attention, then practice one English sentence and one personal question.')+`<div id="daily-area"></div>`}
function drawDaily(){
  if(!dailySession||dailySession.profile!==db.active)dailySession={profile:db.active,items:dailyQuestions(),at:0,correct:0,shown:false};
  const s=dailySession,q=s.items[s.at];
  if(!q){$('#daily-area').innerHTML=`<div class="card"><h2>Daily civics complete ✓</h2><p>${s.correct} of ${s.items.length} checked correct. Missed answers will return for review.</p><h3>Read this aloud</h3><p>${esc(E[new Date().getDate()%E.length].read)}</p><h3>Answer truthfully aloud</h3><p>${esc(I[new Date().getDate()%I.length].q)}</p><p>Your personal answer stays with you. Ask a family member to listen.</p><div class="actions"><a href="#progress">See progress →</a><a href="#english">Practice writing →</a>${button('Another session','daily-restart','secondary')}</div></div>`;return;}
  $('#daily-area').innerHTML=`<div class="card question-card"><span class="pill">${s.at+1} / ${s.items.length} · DAILY REVIEW</span><h2>${esc(q.q)}</h2>${button('▶ Listen','daily-listen','secondary')}${s.shown?`<div class="answer">${esc(answer(q))}</div>${dynamicNote(q)}${learningHelp(q)}<div class="actions">${button('Practice again','daily-no','secondary')}${button('Got it ✓','daily-yes')}</div>`:`<p>Say your answer aloud first.</p>${button('Show answer','daily-reveal')}`}</div>`;
}
function full(){return heading('Practice the whole conversation.','A guided rehearsal: personal questions, civics, reading, writing, and closing. The real officer may use a different order and ask follow-up questions.')+`<div class="notice">Practice only. Use truthful personal answers; none are typed or recorded. Reading, writing and spoken answers are self-checked. This cannot determine eligibility or an official test result.</div><div id="full-area"></div>`}
function startFull(){fullSession={profile:db.active,stage:'personal',at:0,personal:shuffle(I).slice(0,6),civics:shuffle(pool()).slice(0,P().special?10:20),need:P().special?6:12,correct:0,wrong:0,reveal:false,reading:shuffle(E).slice(0,3),writing:shuffle(E).slice(0,3),readOK:false,writeOK:false};drawFull()}
function advanceFull(ok){const s=fullSession;if(!s||s.profile!==db.active)return;
  if(s.stage==='personal'){if(++s.at===s.personal.length){s.stage='civics';s.at=0;}}
  else if(s.stage==='civics'){record(s.civics[s.at].id,ok);s.correct+=ok?1:0;s.wrong+=ok?0:1;s.at++;if(s.correct>=s.need||s.wrong>s.civics.length-s.need||s.at===s.civics.length){s.stage='reading';s.at=0;}}
  else if(s.stage==='reading'){s.readOK=ok;if(ok||++s.at===3){s.stage='writing';s.at=0;}}
  else if(s.stage==='writing'){s.writeOK=ok;if(ok||++s.at===3){s.stage='closing';s.at=0;}}
  else if(s.stage==='closing'){s.stage='done';P().tests.push({mode:'Full interview rehearsal',date:Date.now(),correct:s.correct,total:s.correct+s.wrong});save();}
  s.reveal=false;stopSpeech();drawFull();
}
function drawFull(){
  const s=fullSession,area=$('#full-area');if(!s||s.profile!==db.active){area.innerHTML=`<div class="card"><h2>Invite a family member to be the officer</h2><p>Allow about 20–30 minutes. Say your answers aloud. You can listen to a prompt, then reveal the example when ready.</p><p>${P().simple?'Simple English help is on. Take your time and use the explanation buttons.':'Keep answers hidden until you have answered.'}</p>${button('Begin full rehearsal','full-start')}</div>`;return;}
  let body='',prompt='';
  if(s.stage==='personal'){const q=s.personal[s.at];prompt=q.q;body=`<p>Personal question ${s.at+1} of 6</p><h2>${esc(prompt)}</h2><p>Answer using your own circumstances, not the example.</p><details><summary>Example answer</summary><p>${esc(q.a)}</p></details>${button('I practiced my answer →','full-next')}`;}
  if(s.stage==='civics'){const q=s.civics[s.at];prompt=q.q;body=`<p>Civics ${s.at+1} · ${s.correct} correct · ${s.wrong} missed</p><h2>${esc(prompt)}</h2>${s.reveal?`<div class="answer">${esc(answer(q))}</div>${dynamicNote(q)}${learningHelp(q)}<p>Other officially accepted answers can also be correct. Check the USCIS answer bank if yours differs.</p><div class="actions">${button('Needs practice','full-no','secondary')}${button('Correct','full-yes')}</div>`:button('Compare my answer','full-reveal')}`;}
  if(s.stage==='reading'){prompt=s.reading[s.at].read;body=`<p>Reading attempt ${s.at+1} of 3</p><h2>${esc(prompt)}</h2><p>Read the sentence aloud. Ask your practice partner whether the meaning was clear. Listening first is a learning aid.</p><div class="actions">${button('Try another sentence','full-no','secondary')}${button('Read successfully','full-yes')}</div>`;}
  if(s.stage==='writing'){prompt=s.writing[s.at].write;body=`<p>Writing attempt ${s.at+1} of 3</p><h2>Listen, then write on paper.</h2><p>Use the Listen button or ask your partner to dictate the sentence. Do not look at the answer first.</p>${s.reveal?`<div class="answer">${esc(prompt)}</div><p>Compare with your written sentence. This is a self-check, not USCIS scoring.</p><div class="actions">${button('Try another sentence','full-no','secondary')}${button('Written successfully','full-yes')}</div>`:button('Show sentence to compare','full-reveal')}`;}
  if(s.stage==='closing'){prompt='Do you understand the Oath of Allegiance? Do you have any questions?';body=`<h2>Finish the conversation</h2><p>Practice asking: “Could you please repeat that?” or “Could you explain that word?”</p><p>Review the actual oath questions on your N-400 and answer truthfully. Do not memorize an example yes or no.</p><p>Ask your partner: “What should I do next?”</p>${button('Finish rehearsal','full-next')}`;}
  if(s.stage==='done'){body=`<h2>Rehearsal complete ✓</h2><p>Civics: ${s.correct}/${s.correct+s.wrong} correct · ${s.correct>=s.need?'practice target reached':'keep reviewing'}</p><p>Reading: ${s.readOK?'self-checked successful':'needs practice'} · Writing: ${s.writeOK?'self-checked successful':'needs practice'}</p><p>Personal questions and speaking are not graded here. Review your actual submitted N-400 before your appointment.</p><div class="actions"><a href="#progress">See topic progress →</a>${button('Start again','full-start','secondary')}</div>`;}
  s.prompt=prompt;area.innerHTML=`<div class="card question-card"><span class="pill">${esc(s.stage.toUpperCase())}</span>${body}${prompt?`<div class="actions">${button('▶ Listen','full-listen','secondary')}${button('Stop audio','stop-audio','quiet')}</div>`:''}</div>`;
}
function vocabularyHelp(){return `<details class="learning-help" ${P().simple?'open':''}><summary>Useful words in simple English</summary><dl>${Object.entries({amendment:'A change or addition to the Constitution.',rights:'Freedoms or protections that the law gives people.',citizen:'A person who belongs to a country legally.',representative:'A person chosen to act for other people.',elect:'Choose by voting.',term:'The length of time someone holds an office.',federal:'About the national government.',branch:'One part of government.',veto:'Reject a bill.',bill:'A proposed law.',oath:'A serious promise.',allegiance:'Loyalty to a country.',independence:'Freedom from another country’s control.',discrimination:'Unfair treatment because of things such as race.',Constitution:'The highest law and basic plan for U.S. government.',adopt:'Accept or approve officially.',abolish:'End something officially.',dictation:'Listen to words and write them down.'}).map(([w,m])=>`<dt><strong>${esc(w)}</strong></dt><dd>${esc(m)}</dd>`).join('')}</dl><p>Practice asking: “Could you please repeat that?” and “What does that word mean?”</p></details>`}
function setupLearning(){
  const nav=$('nav');nav.insertAdjacentHTML('beforeend','<a href="#daily">☀ <span>Daily practice</span></a><a href="#full">☏ <span>Full rehearsal</span></a><a href="#progress">▥ <span>Topic progress</span></a><a href="#offline">↓ <span>Offline & devices</span></a>');
  nav.insertAdjacentHTML('beforebegin','<label class="mobile-navigation">Go to a section<select id="mobile-page">'+Array.from(nav.querySelectorAll('a')).map(a=>'<option value="'+a.hash.slice(1)+'">'+esc(a.textContent.trim())+'</option>').join('')+'</select></label>');
  $('#mobile-page').onchange=e=>{location.hash=e.target.value};
  $('#font-size').insertAdjacentHTML('beforebegin','<button id="simple-toggle" class="quiet">Simple English</button>');
  $('#simple-toggle').onclick=()=>{P().simple=!P().simple;save();profiles();render()};
  document.addEventListener('click',e=>{
    const topic=e.target.closest('[data-study-topic]');if(topic){setTimeout(()=>{if($('#card-topic')){$('#card-topic').value=topic.dataset.studyTopic;setCards();}},0);}
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.helpAudio){const n=window.LEARNING_NOTES[b.dataset.helpAudio];speech(n.explain+'. Remember: '+n.tip);return;}
    switch(b.dataset.action){
      case'daily-restart':dailySession=null;drawDaily();break;
      case'daily-listen':speech(dailySession.items[dailySession.at].q);break;
      case'daily-reveal':dailySession.shown=true;drawDaily();break;
      case'daily-yes':case'daily-no':{const s=dailySession;if(!s?.shown||!s.items[s.at])return;const ok=b.dataset.action==='daily-yes';record(s.items[s.at].id,ok);s.correct+=ok?1:0;s.at++;s.shown=false;stopSpeech();drawDaily();break;}
      case'full-start':startFull();break;
      case'full-next':advanceFull(true);break;
      case'full-yes':advanceFull(true);break;
      case'full-no':advanceFull(false);break;
      case'full-reveal':fullSession.reveal=true;drawFull();break;
      case'full-listen':speech(fullSession.prompt);break;
    }
  });
}
function offline(){return heading('Study wherever you are.','Free, without an account. Sign in on each device to sync your profile; local practice remains available.')+`<div class="grid"><div class="card"><h2>Use it offline</h2><p id="offline-status" role="status">${esc(offlineStatus)}</p><p>Open the site online once and wait for “Ready for offline study.” The question bank, explanations, exercises and PDF are saved on this device. Online voices and official links still need internet.</p><p>Browsers can remove stored data when storage is low. Keep a progress backup.</p><h3>Add a shortcut</h3><p><strong>iPhone:</strong> Open in Safari, use Share, then Add to Home Screen.</p><p><strong>Android:</strong> Open the browser menu and look for Install app or Add to Home screen.</p><p><strong>Windows:</strong> Bookmark this page or use your browser's install option when offered.</p><p id="update-status"></p>${button('Check for app updates','check-update','secondary')}</div><div class="card"><h2>Move progress to another device</h2><ol><li>On the device with your latest practice, open Settings and export progress.</li><li>Move the downloaded JSON file using Files, AirDrop, email to yourself, or a USB drive.</li><li>On the other device, open Settings and import it. Imported profiles are added as separate copies so existing progress stays safe.</li><li>Select the imported profile to continue from that backup.</li></ol><p>Backups are manual; account sign-in provides automatic sync. The backup contains nicknames, practice history and saved officials. No personal interview answers are stored.</p><a href="#settings">Open backup settings →</a></div></div><div class="card" style="margin-top:20px"><h2>Make the voice easier to follow</h2><p>Open Voice, preview the available voices, and choose one you like. Enhanced, natural or neural voices appear first when the device provides them. Tomi starts at a slower 0.85× pace; speed is adjustable for everyone.</p><p>We use your device's free speech voices. The same voice is not guaranteed on iPhone, Android and Windows. No paid speech service or cloned voice is used.</p></div>`}
let offlineStatus='Preparing offline study…',offlineRegistration=null;
function setOfflineStatus(t){offlineStatus=t;if($('#offline-status'))$('#offline-status').textContent=t;}
function setupOffline(){
  if(!('serviceWorker' in navigator)){setOfflineStatus('Offline installation is unavailable in this browser. Download the PDF for offline reading.');return;}
  navigator.serviceWorker.register('sw.js',{scope:'./'}).then(reg=>{
    offlineRegistration=reg;
    const ready=()=>setOfflineStatus('Ready for offline study on this device.');
    if(reg.active)ready();
    const watch=worker=>{if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='activated')ready();if(worker.state==='installed'&&reg.waiting)toast('A study app update is ready. Close all study tabs, then reopen to apply it.');if(worker.state==='redundant'&&!reg.active)setOfflineStatus('Offline setup did not finish. Reopen online to try again.');});};
    watch(reg.installing);reg.addEventListener('updatefound',()=>watch(reg.installing));
  }).catch(()=>setOfflineStatus('Offline setup did not finish. You can still download the PDF. Try reopening online.'));
  document.addEventListener('click',async e=>{if(e.target.closest('[data-action="check-update"]')){try{await offlineRegistration?.update();$('#update-status').textContent=offlineRegistration?.waiting?'An update is ready. Close every tab of this study site and reopen it.':'Update check complete. If a download is in progress, it will be ready shortly.';}catch{toast('Could not check for updates. Try again when online.')}}});
}
