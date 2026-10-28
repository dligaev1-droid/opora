Ростки «Нашего сада» — как пересобрать (рабочая папка /tmp/garden-work, запуск из корня проекта):
1) cut2.py art/item-<вид>.png <вид> /tmp/garden-work/items2   — режет лист 2×2 из GPT на 4 спрайта
2) masks.py   — маски тропинки и предметов по art/garden-NN.webp  → /tmp/garden-work/masks/
3) spots.py   — тонирует спрайты в art/items/ и пишет js/garden-spots.js (места на каждом уровне)
