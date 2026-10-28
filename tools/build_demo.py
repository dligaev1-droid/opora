"""Собирает однофайловую демо-версию (CSS, шрифт и все js/*.js внутри) для артефакта Claude.
Запуск: python3 tools/build_demo.py  → ../opora.html (или путь из DEMO_OUT).
Картинки cards/*.webp и art/*.webp передаются в артефакт отдельно, параметром files."""
import re, base64, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
s = open('index.html').read(); css = open('css/style.css').read()
f = base64.b64encode(open('fonts/onest.woff', 'rb').read()).decode()
css = re.sub(r'url\(["\']?(\.\./)?fonts/onest\.woff["\']?\)', lambda m: 'url(data:font/woff;base64,' + f + ')', css)
s = re.sub(r'\s*<link rel="(manifest|icon|apple-touch-icon|preload)"[^>]*>', '', s)
s = s.replace('<link rel="stylesheet" href="css/style.css">', '<style>' + css + '</style>')
s = re.sub(r'<script src="(js/[^"]+)"></script>', lambda m: '<script>' + open(m.group(1)).read().replace('</script', '<\\/script') + '</script>', s)
open(os.environ.get('DEMO_OUT','../opora.html'), 'w').write(s)
print(s.count('<script src'), 'achieve' in s)
