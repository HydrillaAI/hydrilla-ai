#!/usr/bin/env python3
"""Kit QA for the hydrilla.ai build kit. Run from the kit root: python3 qa/kit_qa.py"""
import re, os, glob, json, sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
R=[]; FAIL=0
def res(name, ok, detail=''):
    global FAIL
    R.append(('PASS' if ok else 'FAIL', name, detail)); FAIL+= (not ok)
def rd(p): return open(p,encoding='utf-8').read()
pages={}
for p in sorted(glob.glob('pages/*.md')):
    slug=os.path.basename(p)[:-3]
    if slug.startswith('_'): continue
    s=rd(p)
    m=re.search(r'<!-- COPY:START -->(.*?)<!-- COPY:END -->',s,re.S)
    copy=m.group(1) if m else ''
    meta='\n'.join(re.findall(r'^\| (?:Title[^|]*|Meta description|OG title|H1) \| (.*) \|$',s,re.M))
    pages[slug]=dict(raw=s,copy=copy,meta=meta)
llms=rd('seo-geo/llms.txt'); llmsf=rd('seo-geo/llms-full.txt'); schema=rd('seo-geo/schema.md'); nav=rd('nav-footer.md'); routing=rd('routing.md')
def strip_urls(t): return re.sub(r'https?://\S+|\]\([^)]*\)|`/[^`]*`','',t)
def ship_texts():
    for k,v in pages.items(): yield 'pages/'+k, v['copy']+'\n'+v['meta']
    yield 'seo-geo/llms.txt', llms; yield 'seo-geo/llms-full.txt', llmsf
    yield 'seo-geo/schema.md (JSON)', '\n'.join(re.findall(r'```json(.*?)```',schema,re.S))
    yield 'nav-footer.md', '\n'.join(l for l in nav.split('\n') if not l.startswith('>') and not l.startswith('Removed from'))
ALL=list(ship_texts())
def scan(name, pattern, flags=re.I, allow=lambda f:False, urls=True):
    hits=[]
    for f,t in ALL:
        if allow(f): continue
        tt=strip_urls(t) if urls else t
        for m in re.finditer(pattern,tt,flags): hits.append(f"{f}: '{m.group(0)}'")
    res(name, not hits, '; '.join(hits[:12]))
# 1. markers and jargon (whole kit files except docs that discuss the rule)
hits=[]
for p in glob.glob('pages/*.md')+glob.glob('seo-geo/*')+['nav-footer.md','routing.md']:
    t=rd(p)
    for m in re.finditer(r'\[VERIFY|\bOQ\d+\b|\bS\d{1,2}\b(?! [a-z])|\bD\d{1,2}\b|Confirmed \(Rishi\)|Headline options',t): hits.append(f'{p}: {m.group(0)}')
res('No [VERIFY] markers or plan jargon (OQ/S/D numbers, Headline options)', not hits, '; '.join(hits[:12]))
# 2. banned words
BANNED=r"\b(revolutionary|game-changing|cutting-edge|state-of-the-art|next-gen|unleash|unlock|supercharge|seamless|effortless|magic(al)?|world-class|best-in-class|industry-leading|leverage|empower|elevate|delve|look no further|transform your workflow|fast-paced world|production-ready|game-ready|one-click|10×|in seconds|instantly)\b|#1\b"
scan('Banned marketing words', BANNED)
scan('No "AI for 3D"', r'AI for 3D')
scan('No "BlueFox 3D"/"BlueFox3D"/"Blue Fox" in visible text', r'BlueFox ?3D|Blue Fox|Bluefox\b', flags=0)
scan('No BYOK / own key / pick the model', r'\bBYOK\b|bring your own key|own (API )?key|pick the model|choose the model')
hits=[]
for f,t in ALL:
    for m in re.finditer(r'Water Agent',t):
        w=t[max(0,m.start()-200):m.end()+200]
        if re.search(r'API key|\bkey\b',w,re.I): hits.append(f)
res('No key wording within 200 chars of "Water Agent"', not hits, ', '.join(sorted(set(hits))))
scan('No SSO / SLA / early access / beta / waitlist', r'single sign-on|\bSSO\b|\bSLA\b|service-level|early access|\bbeta\b|waitlist|named contact')
scan('No partner/licensed/official wording', r'\bpartner(ship)?s?\b|\blicensed\b|\bofficial\b|in collaboration with|not affiliated|\bunrelated\b')
scan('"Clerk" only on /security', r'\bClerk\b', flags=0, allow=lambda f:f in ('pages/security','seo-geo/llms-full.txt'))
cl=[x for x in re.split(r'\n---\n',llmsf) if 'Clerk' in x and 'URL: https://hydrilla.ai/security' not in x]
res('llms-full: "Clerk" only inside the /security section', not cl)
scan('No "40%" / "up to"', r'40 ?%|up to \d+ ?%')
hits=[]
for f,t in ALL:
    for m in re.finditer(r'33 ?%',t):
        if 'Hourly Pro' not in t[max(0,m.start()-160):m.end()+160]: hits.append(f)
res('"33%" only beside Hourly Pro', not hits, ', '.join(hits))
scan('Competitors named only on /compare pages', r'\b(Meshy|Tripo|Hyper3D|Rodin|Deemos|Trellis|TRELLIS|Sloyd)\b', flags=0,
     allow=lambda f: f.startswith('pages/compare') or f in ('seo-geo/llms.txt','seo-geo/llms-full.txt','nav-footer.md','seo-geo/schema.md (JSON)'))
# llms: competitors only in compare lines
bad=[l for l in (llms+'\n'+llmsf).split('\n') if re.search(r'Meshy|Tripo|Hyper3D|Rodin|Trellis|TRELLIS|Sloyd',l) and 'compare' not in l.lower() and not l.startswith('|')]
# llms-full contains compare page bodies; check by section
sec=re.split(r'\n---\n',llmsf); bad=[]
for s_ in sec:
    u=re.search(r'URL: (\S+)',s_)
    if re.search(r'Meshy|Tripo|Hyper3D|Rodin|Trellis|TRELLIS|Sloyd',s_) and not (u and '/compare' in u.group(1)) and 'URL:' in s_: bad.append(u.group(1))
res('llms-full: competitors only inside compare page sections', not bad, ', '.join(bad))
scan('No em dashes or exclamation marks in copy', r'—|(?<![<`])!(?!\[|--)', flags=0, allow=lambda f: f.startswith('seo-geo/schema'))
# 3. brand line placement
BL='Hydrilla AI is an AI 3D workspace for studio and artist pipelines.'
where=[f for f,t in ALL if BL in t]
allowed={'pages/about','pages/brand','seo-geo/llms.txt','seo-geo/llms-full.txt','seo-geo/schema.md (JSON)'}
extra=[f for f in where if f not in allowed]
# llms-full contains /about page text: fine
res('Brand line only on /about, /brand, llms, Organization schema', not extra and 'pages/about' in where, f'found in: {where}')
ab=pages['about']
res('/about hero and meta carry the brand line', BL in ab['copy'] and BL in ab['meta'])
# 4. export / format owner rule
OWN=lambda f: f in ('pages/features','pages/docs','pages/blog-import-ai-meshes') or f.startswith('pages/integrations')
hits=[]
for f,t in ALL:
    if not f.startswith('pages/') or OWN(f): continue
    tt=strip_urls(t)
    if f.startswith('pages/compare-') and f!='pages/compare-how-to-choose':
        # only Hydrilla column (2nd cell) and prose are checked
        rows=[l for l in tt.split('\n') if l.startswith('|')]
        prose='\n'.join(l for l in tt.split('\n') if not l.startswith('|'))
        cells='\n'.join((l.split('|')[2] if len(l.split('|'))>2 else '') for l in rows)
        tt=prose+'\n'+cells
    for m in re.finditer(r'\b(GLB|FBX|OBJ|USDZ|glTF)\b',tt): hits.append(f"{f}: {m.group(0)}")
    for m in re.finditer(r'\b(export|send)\w*\b[^.\n]{0,40}\b(Blender|Unity|Unreal|Godot)\b',tt,re.I): hits.append(f"{f}: '{m.group(0)}'")
res('Export/format owner rule (formats and "export/send to Blender/Unity/Unreal" only on /features, /integrations*, /docs, import guide)', not hits, '; '.join(hits[:12]))
for k in ('seo-geo/llms.txt',):
    t=dict(ALL)[k]
    h=re.findall(r'\b(GLB|FBX|OBJ|USDZ)\b',t)
    res('llms.txt has no format list (points to /features)', not h, str(h))
pr=pages['pricing']['copy']+pages['pricing']['meta']
res('/pricing: no formats, no "no card needed", trial needs a card, credits 100/900/3,000, no rollover',
    not re.search(r'GLB|FBX|OBJ|USDZ|format|no card',pr,re.I) and 'The trial needs a card' in pr and all(x in pr for x in ('100 credits','900 credits','3,000 credits')) and 'carry over' in pr)
# 5. BlueFox naming
warn=[]
for k,v in pages.items():
    lines=[l for l in v['copy'].split('\n') if 'BlueFox' in l and not l.startswith(('#','|','**[','Alt','Visual','Card')) and not re.match(r'^\[.*\]\(.*\)$',l.strip())]
    if lines and "BlueFox, Hydrilla's 3D model" not in lines[0] and k not in ('changelog','brand','research','compare-how-to-choose'):
        warn.append(k)
res('First prose mention of BlueFox reads "BlueFox, Hydrilla\'s 3D model"', not warn, ', '.join(warn))
okp={'bluefox','research','docs','changelog','compare-meshy','compare-tripo','compare-hyper3d','compare-trellis','compare-sloyd','brand'}
bad=[]
for k,v in pages.items():
    for l in (v['copy']+'\n'+v['meta']).split('\n'):
        if 'BlueFox 1' in l and k not in okp and not l.startswith('|'): bad.append(f'{k}: {l[:60]}')
res('"BlueFox 1" only in spec/model-card/docs/changelog/compare-table spots', not bad, '; '.join(bad[:8]))
# 6. Water Agent rules
w=pages['water']['copy']
res('/water: definition verbatim, "no credits" once, plugin line present',
    'Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.' in w
    and w.lower().count('no credits')==1 and 'inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin' in w)
# 7. word counts
def wc(t):
    t='\n'.join(l for l in t.split('\n') if not re.match(r'\s*(\*\*\[.*\]\*\*|Visual:|Alt text|Diagram|Screenshots|Form fields|Form submit|Copy buttons|Asset grid|Logo row|Toggle:|Button:)',l))
    t=re.sub(r'\]\([^)]*\)',']',t); t=re.sub(r'[#*|>`\[\]→-]',' ',t)
    return len(re.findall(r"[A-Za-z0-9$][\w'.,$%/&+]*",t))
counts={k:wc(v['copy']) for k,v in pages.items()}
over={k:c for k,c in counts.items() if c>600}
res('Every page at or under 600 words', not over, str(over))
# 8. redirects: single hop, no chains, targets are final routes
sec2=routing.split('## 2.')[1].split('## 3.')[0]
pairs=re.findall(r'^\| `([^`]+)`(?:[^|]*)\| `([^`]+)`',sec2,re.M)
routes=set(re.findall(r'^\| `(/[^`]*)` \| `?[\w.-]*',routing.split('## 1.')[1].split('## 2.')[0],re.M))
srcs={a.rstrip('/') for a,b in pairs}
chains=[(a,b) for a,b in pairs if b.split('?')[0].replace('https://hydrilla.ai','') in srcs]
badt=[(a,b) for a,b in pairs if b.startswith('/') and b.split('?')[0] not in routes]
res(f'Redirects: {len(pairs)} rules, single hop, no chains or loops', not chains, str(chains))
res('Redirect targets are all final indexable routes', not badt, str(badt))
res('/bluefox is a target only, and the live /bluefox -> /bluefox3d removal is noted', '/bluefox' not in srcs and 'Remove the live `/bluefox` → `/bluefox3d` redirect' in routing)
# internal links in pages must not hit a redirect source
il=[]
for k,v in pages.items():
    for u in re.findall(r'\]\((/[^)#?\s]*)',v['copy']):
        if u.rstrip('/') in srcs: il.append(f'{k}: {u}')
        elif u not in routes and not u.startswith('/app') : il.append(f'{k}: {u} (unknown route)')
res('Internal links point at final routes (no redirect hops)', not il, '; '.join(il[:10]))
# report
out=[f'Kit QA: {len(R)-FAIL}/{len(R)} checks pass']
for st,n,d in R: out.append(f'[{st}] {n}'+(f'\n        {d}' if d and st=='FAIL' else ''))
out.append('\nWord counts (page copy): '+', '.join(f'{k} {c}' for k,c in sorted(counts.items(),key=lambda x:-x[1])))
txt='\n'.join(out); print(txt)
open('qa/kit_qa_results.txt','w').write(txt+'\n')
sys.exit(1 if FAIL else 0)
