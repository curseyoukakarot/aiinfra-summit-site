"""Regenerate the speaker grid in index.html from the list below.

Edit S (order = display order), drop headshots in assets/speakers/<slug>.jpg
(square, 400x400), then run:  python3 tools/speakers.py
Cards link to LinkedIn when a handle is set; photo if present, else initials.
Text is plain (no HTML entities) - the script escapes it."""
import os, re, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LI = 'https://www.linkedin.com/in/'
# slug, name, title, company, linkedin handle (None = not verified yet), tag (e.g. 'Keynote', 'Host')
S = [
 ('victor-kuarsingh','Victor Kuarsingh','Former MVP, Capital One','Former Capital One / OCI','victorkuarsingh','Keynote'),
 ('murali-gandluru','Murali Gandluru','SVP, Data Center Networking','Cisco','muraligandluru',None),
 ('kiran-kamity','Kiran Kamity','VP Product, Data Center Networking','Cisco','kirankamity',None),
 ('aravind-srikumar','Aravind Srikumar','SVP of Product & Marketing','Upscale','aravind-srikumar-a6227019',None),
 ('lamia-youseff','Lamia Youseff','Founder','Jazz Computing','lyouseff','Keynote'),
 ('rob-naidoff','Rob Naidoff','VP Sales & GTM, Americas','SambaNova','rob-naidoff-6aa43023',None),
 ('john-brzozowski','John Brzozowski','Co-Founder','IPClear','jbrzozowski',None),
 ('andy-holland','Andy Holland','Sales Director - AI Infrastructure','DriveNets','andrewholland238',None),
 ('drew-pletcher','Drew Pletcher','Principal Architect','Lightning AI','drew-pletcher-a14907',None),
 ('dean-nelson','Dean Nelson','Founder & Chairman','iMasons','deannelson',None),
 ('david-goldman','David Goldman','Partner','Celesta Capital','david-goldman-a72895a5',None),
 ('david-hefter','David Hefter','AI Investment Strategist','BlackRock','david-hefter',None),
 ('shesh-s','Shesh S','Sr. Investment Director','SK Telecom Ventures','sheshu77',None),
 ('roger-chen','Roger Chen','Professor, Strategy & Innovation','USF','roger-rongxin-chen',None),
 ('vyoma-gajjar','Vyoma Gajjar','Sr Principal AI Architect','ServiceNow','vyomagajjar','Moderator'),
 ('akansha-aggarwal','Akansha Aggarwal','SVP, Commercial Growth & Transformation','Uber Freight','leadtochangeakansha',None),
 ('meenal-iyer','Meenal Iyer','SVP, Data & Enterprise AI','SurveyMonkey','meenal-iyer',None),
 ('wanyu-bian','Wanyu Bian','ML Engineer / Architect','Apple','wanyu-bian-phd',None),
 ('tamar-bercovici','Tamar Bercovici','VP of Engineering','Box','tamarbercovici',None),
 ('sandhya-subramani','Sandhya Subramani','Sr. Developer Advocate, Generative AI','AWS','sandhyasubramani',None),
 ('liran-zvibel','Liran Zvibel','CEO & Co-Founder','WEKA','liranzvibel',None),
 ('ravi-singh','Ravi Singh','Director of Product Strategy and Management','AMD','rksingh',None),
 ('gautam-kumar','Gautam Kumar','Engineering','Elorian.ai','gautam-kumar-03140815',None),
 ('simran-arora','Simran Arora','SVP of Research','Together AI','simran-arora',None),
]
IN_ICON = ('<svg class="ev-speaker__in" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>')
e = html.escape

def card(slug, name, title, co, handle, tag):
    photo = os.path.exists(os.path.join(ROOT, 'assets/speakers', slug + '.jpg'))
    words = [w for w in name.split() if w[0].isalpha()]  # skip nicknames like "(Sas)"
    initials = words[0][0] + (words[-1][0] if len(words) > 1 else '')
    avatar = (f'<img src="assets/speakers/{slug}.jpg" alt="" width="200" height="200" loading="lazy" />'
              if photo else f'<span aria-hidden="true">{e(initials)}</span>')
    tag_html = f'<span class="ev-speaker__tag">{e(tag)}</span>' if tag else ''
    inner = (f'<span class="ev-speaker__avatar">{avatar}</span>'
             f'<span class="ev-speaker__body"><span class="ev-speaker__co mono"><span>{e(co)}</span>{tag_html}</span>'
             f'<h3 class="ev-speaker__name">{e(name)}</h3><span class="ev-speaker__title">{e(title)}</span></span>')
    if handle:
        return (f'        <a class="ev-speaker" href="{LI}{handle}/" target="_blank" rel="noopener">{inner}{IN_ICON}'
                f'<span class="ev-sr">LinkedIn profile, opens in a new tab</span></a>')
    return f'        <article class="ev-speaker">{inner}</article>'

p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8').read()
grid = '\n'.join(card(*row) for row in S)
s, n = re.subn(r'(<!-- speakers:start -->).*?(\n[ \t]*<!-- speakers:end -->)',
               lambda m: m.group(1) + '\n' + grid + m.group(2), s, count=1, flags=re.S)
assert n == 1, 'speaker markers not found in index.html'
open(p, 'w', encoding='utf-8').write(s)
print('cards:', len(S), '| linked:', sum(1 for r in S if r[4]), '| photos:',
      sum(os.path.exists(os.path.join(ROOT, 'assets/speakers', r[0] + '.jpg')) for r in S))
