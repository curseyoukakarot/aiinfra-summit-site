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
 ('dean-nelson','Dean Nelson','Chairman & Founder','Infrastructure Masons','deannelson',None),
 ('carl-brown','Carl Brown','GM of Sales & Business Development','Supermicro','carlbrown40',None),
 ('jeremiah-owyang','Jeremiah Owyang','GP','Blitzscaling','jowyang',None),
 ('kyle-sosnowski','Kyle Sosnowski','VP of engineering','Crusoe','kylekyle',None),
 ('joo-young-kim','Joo-Young Kim','CEO & Founder','HyperAccel','joo-young-kim-7b227955',None),
 ('luke-norris','Luke Norris','CEO','Kamiwaza','lukenorris',None),
 ('vik-malyala','Vik Malyala','Managing Director & President','Supermicro','malyala',None),
 ('nicole-wemple','Nicole Wemple','GTM, Enterprise','Hex','nicolewemple',None),
 ('tim-shea','Tim Shea','CEO','Latticework Insights','sheanineseven',None),
 ('kyle-morris','Kyle Morris','Founder, AGI House Resident','Epilogue','kylejohnmorris',None),
 ('duncan-ng','Duncan Ng','VP of Solutions Engineering','Vultr','duncan-ng',None),
 ('rahul-kar','Rahul Kar','CEO','Hammerhead.ai','rahulkar',None),
 ('louann-conner','LouAnn Conner','CEO','Sagacious Think','louannconner',None),
 ('tim-zhou','Tim Zhou','VP of Engineering','Micas Networks','tim-xin-zhou',None),
 ('nicola-tan','Nicola Tan','Enterprise AI GTM','AMD','nicolatan',None),
 ('lukas-gentele','Lukas Gentele','CEO','vCluster','gentele',None),
 ('meenal-iyer','Meenal Iyer','SVP of Data','Survey Monkey','meenal-iyer',None),
 ('matt-chow','Matt Chow','Chief Mental Health Officer','Telus Health','drmattchow',None),
 ('brian-sparkes','Brian Sparkes','Chief Venture Officer','Stak Ventures','brian%F0%9F%92%A5-sparkes-9967a8a0',None),
 ('aj-thomas','AJ Thomas','GP','Good Trouble Ventures','chaospilot',None),
 ('jay-jubran','Jay Jubran','Global Head of Infrastructure','IBM','jsjubran',None),
 ('mel-lim','Mel Lim','CEO','Chateauz','mellim',None),
 ('robert-scoble','Robert Scoble','CEO','Unaligned','scobleizer',None),
 ('stephanie-sparks','Stephanie Sparks','Attorney in Chief','Sparks Law','stephanie-o-sparks',None),
 ('brad-garsten','Brad Garsten','CEO','Quanta Networks','bradgarsten',None),
 ('okhtay-azarmanesh','Okhtay Azarmanesh','Principal AI architect','Snowflake','oxtay',None),
 ('rachel-zhao','Rachel Zhao','Sr. Program Manager','Supermicro','rachaelzhao',None),
 ('vasanth-mohan','Vasanth Mohan','Director of Product Marketing and Developer Relations','SambaNova','v-mohan',None),
 ('yujing-qian','Yujing Qian','Head of Engineering','GMI','yujing-qian-ab782381',None),
 ('wilson-liu','Wilson Liu','Head of CDN','Tencent Cloud','wilson-liu-wei',None),
 ('vince-fong','Vince Fong','CEO','Highrise AI','vtmfong',None),
 ('chris-dolan','Chris Dolan','Chief Data Center Officer','Crusoe','chris-dolan-84973',None),
 ('rajesh-gopinath','Rajesh Gopinath','Data center power systems engineering','Oracle','rajeshgopinath',None),
 ('carmen-li','Carmen Li','CEO','Compute Exchange','carmenrli',None),
 ('radhika-iyengar','Radhika Iyengar','Managing Partner','Starchain Ventures','radhikaiyengar13',None),
 ('john-brzowski','John Brzowski','CTO','Neuron Group','jbrzozowski',None),
 ('vaughn-stewart','Vaughn Stewart','VP of Engineering','Vast Data','vstewed',None),
 ('chad-mcdonald','Chad McDonald','CISO Advisor','TA Associates','chadwmcdonald',None),
 ('parker-gregg','Parker Gregg','VP of Business Development','HiVolt','parkergregg',None),
 ('anna-belova','Anna Belova','','','aibelova',None),
 ('michael-roy','Michael Roy','','AMD','mikeroysoft',None),
 ('bobby-napiltonia','Bobby Napiltonia','Founder','The GTM firm','bobby-napiltonia-8b82624',None),
 ('raghu-banda','Raghu Banda','Enterprise Architect Advisor - AI Strategy','SAP Americas','banda',None),
]
IN_ICON = ('<svg class="ev-speaker__in" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>')
e = html.escape

def card(slug, name, title, co, handle, tag):
    photo = os.path.exists(os.path.join(ROOT, 'assets/speakers', slug + '.jpg'))
    initials = ''.join(w[0] for w in name.split()[:2])
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
