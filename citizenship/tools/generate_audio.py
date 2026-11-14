import json,re,hashlib,subprocess,time
from pathlib import Path
import ptts
root=Path(__file__).resolve().parents[1]
s=(root/'data.js').read_text();d=json.loads(s[s.index('{'):].rstrip(';\n'))
texts=[]
for q in d['questions']:texts.extend([q['q'],q['a'],q['q']+'. Example answer: '+q['a']])
for q in d['interview']:texts.append(re.sub(r'^\d+\. ','',q['q']))
for e in d['english']:texts.extend([e['read'],e['write']])
texts.extend(['Welcome to your citizenship study space. Take your time, and answer each question clearly. What is the supreme law of the land?','Do you understand the Oath of Allegiance? Do you have any questions?'])
texts=list(dict.fromkeys(texts));ptts.set_num_threads(2);tts=ptts.TTS('hf://gradium/phonon-31m-en',lang='en',quant='q8',revision='92741c5b07d085ff840e26fea8ce43110b87852f');manifest={}
for i,text in enumerate(texts):
 name=hashlib.sha256(text.encode()).hexdigest()[:16]+'.mp3';out=root/'audio'/name
 if not out.exists():
  tts.save('/tmp/citizenship-voice.wav',text,voice='Easton')
  subprocess.run(['ffmpeg','-y','-loglevel','error','-i','/tmp/citizenship-voice.wav','-codec:a','libmp3lame','-b:a','48k',str(out)],check=True)
 manifest[text]='audio/'+name
 if i%25==0:print(i+1,'/',len(texts),flush=True)
(root/'audio-manifest.js').write_text('window.STUDY_AUDIO = '+json.dumps(manifest,ensure_ascii=False)+';\n')
print('DONE',len(texts),flush=True)
