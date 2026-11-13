const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dir=path.resolve(__dirname,'..');let stored='';const elements={};
const context={console,Date,Math,JSON,Number,String,Object,Array,Boolean,Set,RegExp,assert,setTimeout:()=>0,clearTimeout(){},location:{hash:'#home'},localStorage:{getItem:()=>null,setItem:(k,v)=>stored=v},window:{STUDY_DATA:null,scrollTo(){},addEventListener(){}},document:{querySelector:s=>elements[s]||(elements[s]={innerHTML:'',value:'',style:{},textContent:''}),querySelectorAll:()=>[],addEventListener(){},body:{classList:{toggle(){}}}},confirm:()=>true};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(dir,'data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(dir,'learning-content.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(dir,'learning.js'),'utf8'),context);
let app=fs.readFileSync(path.join(dir,'app.js'),'utf8').split("setupFamily();setupLearning();")[0];vm.runInContext(app,context);
vm.runInContext(`
assert.equal(Q.length,128);assert.equal(new Set(Q.map(q=>q.id)).size,128);assert.equal(Q.filter(q=>q.star).length,20);assert.equal(I.length,44);assert.equal(E.length,18);assert.equal(G.length,0);
for(const special of [false,true]){P().special=special;for(const ok of [true,false]){startExam();assert.equal(new Set(session.items.map(q=>q.id)).size,session.items.length);let count=0;while(!session.done){result(ok);nextSession();count++;assert(count<=20)}assert.equal(count,special?(ok?6:5):(ok?12:9));assert.equal(P().tests.at(-1).pass,ok)}}
P().special=false;startExam();for(let i=0;i<19;i++){result(i%2===0);nextSession();if(session.done)break}assert(session.done);assert.equal(session.results.length,18);assert.equal(session.correct,9);
startQuiz();assert.equal(session.items.length,10);assert.equal(new Set(session.items.map(q=>q.id)).size,10);while(!session.done){result(true);nextSession()}assert.equal(session.correct,10);assert.equal(P().tests.at(-1).total,10);
for(const [id,wrong] of Object.entries(MC)){let q=Q.find(q=>q.id==id);assert(q);assert.equal(wrong.length,3);assert(!wrong.includes(q.a));assert.equal(new Set(wrong).size,3)}
record(1,false);assert.equal(P().records[1].streak,0);for(let i=0;i<3;i++)record(1,true);assert.equal(P().records[1].streak,3);assert(P().records[1].due>Date.now());
P().officials[38]={name:'Verified official',date:'2027-01-05'};assert.equal(answer(Q.find(q=>q.id===38)),'Verified official');assert.equal(esc('<script>'),'&lt;script&gt;');
const oldProfile=P();db.profiles.other=fresh('Other');db.active='other';assert.equal(Object.keys(P().records).length,0);assert(oldProfile.records[1]);
console.log('PASS: bank completeness; 44 interviews; four stopping thresholds; mixed failure; no repeated questions; quiz completion; review scheduling; current-answer override; profile isolation.');
`,context);assert(JSON.parse(stored).profiles);console.log('PASS: progress serializes to browser storage.');

vm.runInContext(`
db={active:'family',profiles:{family:fresh('Family')}};setupFamily();assert.equal(Object.keys(db.profiles).length,5);assert.equal(P().name,'Richmond');assert(db.profiles.family_tomi.simple);setupFamily();assert.equal(Object.keys(db.profiles).length,5);
assert.equal(Object.keys(window.LEARNING_NOTES).length,128);for(const q of Q){assert(window.LEARNING_NOTES[q.id].explain);assert(window.LEARNING_NOTES[q.id].tip)}
db.active='family_tomi';assert.equal(dailyQuestions().length,5);db.active='family_richmond';assert.equal(dailyQuestions().length,10);assert.equal(new Set(dailyQuestions().map(q=>q.id)).size,10);
record(128,false);assert.equal(dailyQuestions()[0].id,128);assert.equal(studyStreak(['2026-11-11','2026-11-12'],new Date(2026,10,13)),2);assert.equal(studyStreak(['2026-11-10'],new Date(2026,10,13)),0);
assert.equal(topicStats().reduce((n,t)=>n+t.total,0),128);
for(const ok of [true,false]){startFull();for(let i=0;i<6;i++)advanceFull(true);assert.equal(fullSession.stage,'civics');let count=0;while(fullSession.stage==='civics'){advanceFull(ok);assert(++count<=20)}assert.equal(count,ok?12:9);for(let i=0;i<(ok?1:3);i++)advanceFull(ok);assert.equal(fullSession.stage,'writing');for(let i=0;i<(ok?1:3);i++)advanceFull(ok);assert.equal(fullSession.stage,'closing');advanceFull(true);assert.equal(fullSession.stage,'done');assert.equal(fullSession.readOK,ok);assert.equal(fullSession.writeOK,ok);}
const existing=P();setupFamily();assert.equal(P(),existing);
console.log('PASS: family migration is idempotent; 128 explanation pairs; daily priorities and unique questions; local-day streak; topic totals; full rehearsal success and failure flows.');
`,context);
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');for(const f of ['index.html','style.css','data.js','learning-content.js','learning.js','app.js','manifest.webmanifest','icon.svg','Family_Study_Guide.pdf']){assert(fs.existsSync(path.join(dir,f)));assert(sw.includes(f))}console.log('PASS: offline assets exist and are cached.');
(async()=>{
  context.testBackup=JSON.stringify({active:'t',profiles:{t:{name:'Tomi',simple:true,studyDays:['2026-11-13'],records:{1:{right:2,wrong:0,streak:2,last:1,due:2}},tests:[],checks:{},officials:{},rate:.85}}});
  await vm.runInContext(`(async()=>{profiles=()=>{};render=()=>{};const count=Object.keys(db.profiles).length,original=db.profiles.family_richmond;await importBackup({size:testBackup.length,text:async()=>testBackup});assert.equal(Object.keys(db.profiles).length,count+1);assert.equal(db.profiles.family_richmond,original);assert(P().simple);assert.equal(P().records[1].right,2);assert.equal(P().studyDays[0],'2026-11-13');await importBackup({size:10,text:async()=>'{bad json'});assert.equal(Object.keys(db.profiles).length,count+1);})()`,context);
  console.log('PASS: imported backups preserve old profiles, preferences and study days; malformed imports leave data unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1});
vm.runInContext(fs.readFileSync(path.join(dir,'sync.js'),'utf8'),context);
vm.runInContext(`
const local={name:'Richmond',records:{1:{right:2,wrong:0,last:200},2:{right:1,wrong:0,last:100}},tests:[{mode:'Practice quiz',date:200,correct:8,total:10}],studyDays:['2026-11-12'],checks:{},officials:{},syncUpdatedAt:10};
const remote={name:'Richmond',records:{1:{right:1,wrong:0,last:100},2:{right:3,wrong:0,last:300}},tests:[{mode:'Practice quiz',date:200,correct:8,total:10}],studyDays:['2026-11-11'],checks:{},officials:{},updatedAt:20};
const merged=mergeCloud(local,remote);assert.equal(merged.records[1].right,2);assert.equal(merged.records[2].right,3);assert.equal(merged.tests.length,1);assert.equal(merged.studyDays.length,2);assert.equal(cloudPayload(fresh('Test')).name,'Test');
console.log('PASS: cloud merge keeps newer question checks and deduplicates tests and practice days.');
`,context);
vm.runInContext(`
db.active='family_richmond';P().checks.n400Filed=false;assert(plan().includes('N-400 not filed yet'));assert(plan().includes('Before filing: preparation checklist'));assert(interview().includes('Before filing'));assert(guide().includes('while preparing Form N-400'));
P().checks.n400Filed=true;assert(plan().includes('N-400 marked as filed'));assert(plan().includes('After filing: interview checklist'));P().checks.n400Filed=false;
console.log('PASS: filing status shows the right study checklist for each stage.');
`,context);
vm.runInContext(`
window.CITIZENSHIP_FIREBASE_CONFIG={apiKey:'test',authDomain:'test',projectId:'test',appId:'test'};
cloudUser={uid:'uid',email:'richmond@example.com'};cloudLocalId=db.active;
assert(syncPanel().includes('Signed in and syncing'));assert(!syncPanel().includes('id="sync-form"'));
let connected=db.active;db.active='family_desmond';assert(syncPanel().includes('Signed in to another profile'));db.active=connected;
cloudUser=null;assert(syncPanel().includes('id="sync-form"'));
console.log('PASS: connected account hides password form and warns on profile mismatch.');
`,context);
