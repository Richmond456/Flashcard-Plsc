const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dir=path.resolve(__dirname,'..');let stored='';const elements={};
const context={console,Date,Math,JSON,Number,String,Object,Array,Boolean,Set,RegExp,assert,setTimeout:()=>0,clearTimeout(){},location:{hash:'#home'},localStorage:{getItem:()=>null,setItem:(k,v)=>stored=v},window:{STUDY_DATA:null,scrollTo(){}},document:{querySelector:s=>elements[s]||(elements[s]={innerHTML:'',value:'',style:{},textContent:''}),querySelectorAll:()=>[],addEventListener(){},body:{classList:{toggle(){}}}},confirm:()=>true};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(dir,'data.js'),'utf8'),context);
let app=fs.readFileSync(path.join(dir,'app.js'),'utf8').split("$('#profile').addEventListener")[0];vm.runInContext(app,context);
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
