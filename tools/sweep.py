"""Открывает все экраны (VIEWS) в трёх состояниях доступа и ловит ошибки JS и пустые экраны.
Нужен запущенный сервер: python3 -m http.server 8767 из корня проекта."""
import asyncio
from playwright.async_api import async_playwright
async def main():
  errs=[]
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await (await b.new_context(viewport={"width":360,"height":780},service_workers="block")).new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto("http://localhost:8767/"); await pg.wait_for_timeout(400)
    rs=await pg.evaluate("Object.keys(VIEWS)")
    for st in ["", "S.intim={adult:true}; save()", "S.love.plus=true; S.love.all=true; save()"]:
      if st: await pg.evaluate(st)
      for r in rs:
        await pg.evaluate(f"go('{r}')"); await pg.wait_for_timeout(15)
        n=await pg.evaluate("document.querySelector('#app').innerText.length")
        if n<20: errs.append("empty "+r)
    print(len(rs),"routes", errs[:10])
    await b.close()
asyncio.run(main())
