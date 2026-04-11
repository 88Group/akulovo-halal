/**
 * generate-card.js — Двусторонняя визитка 300 DPI
 * Выход: Shared/business-card-front.jpg  +  Shared/business-card-back.jpg
 * Запуск: node scripts/generate-card.js
 */

const puppeteer = require('puppeteer');
const QRCode    = require('qrcode');
const path      = require('path');
const fs        = require('fs');

// При 300 DPI: 1мм = 11.811px
// Минимум читаемый шрифт: 8pt = 8/72*25.4мм = 2.82мм = ~33px
// Телефон/акцент:        12pt = ~50px
// Заголовок:             20pt = ~83px

const MM  = v => Math.round(v * 300 / 25.4);
const W   = MM(96);  // 1134px — 90мм + 3мм вылет с каждой стороны
const H   = MM(56);  //  661px — 50мм + 3мм вылет
const BL  = MM(3);   //   35px — вылет
const PAD = MM(5);   //   59px — safe zone padding

const GREEN = '#1a4a28';
const GOLD  = '#f5c518';
const CREAM = '#faf6ed';
const DARK  = '#0d1f13';

function toDataURI(file) {
  const ext  = path.extname(file).slice(1).replace('jpg','jpeg');
  const data = fs.readFileSync(file).toString('base64');
  return `data:image/${ext};base64,${data}`;
}
const PHOTO = toDataURI(path.join(__dirname,'..','Shared','mutton2.png'));

// ─── ЛИЦЕВАЯ ──────────────────────────────────────────────────────────────────
const front = () => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}

.card{
  width:${W}px;height:${H}px;position:relative;
  font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;
}

/* Фото — полный фон */
.photo-bg{
  position:absolute;inset:0;
}
.photo-bg img{
  width:100%;height:100%;object-fit:cover;object-position:center center;
  filter:brightness(.38) saturate(.65);
  display:block;
}
/* Зелёный оверлей — сильнее слева, прозрачнее справа */
.photo-bg::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(100deg,
    rgba(10,30,15,.97) 0%,
    rgba(13,31,19,.88) 40%,
    rgba(13,31,19,.55) 70%,
    rgba(13,31,19,.2) 100%
  );
}

/* Угловые метки реза */
.m{position:absolute;width:${BL}px;height:${BL}px;z-index:5}
.tl{top:0;left:0;border-top:1.5px solid rgba(255,255,255,.3);border-left:1.5px solid rgba(255,255,255,.3)}
.tr{top:0;right:0;border-top:1.5px solid rgba(255,255,255,.3);border-right:1.5px solid rgba(255,255,255,.3)}
.bl{bottom:0;left:0;border-bottom:1.5px solid rgba(255,255,255,.3);border-left:1.5px solid rgba(255,255,255,.3)}
.br{bottom:0;right:0;border-bottom:1.5px solid rgba(255,255,255,.3);border-right:1.5px solid rgba(255,255,255,.3)}

/* Золотые линии */
.line{position:absolute;left:${BL+20}px;right:${BL+20}px;height:2px;z-index:2;
  background:linear-gradient(90deg,transparent,${GOLD} 25%,${GOLD} 75%,transparent)}
.lt{top:${BL+16}px}.lb{bottom:${BL+16}px}

/* Текстовый блок */
.content{
  position:relative;z-index:3;
  height:100%;
  display:flex;flex-direction:column;justify-content:center;
  padding:${PAD+10}px ${PAD+14}px;
  width:68%;
}

.badge{
  display:inline-block;
  border:2px solid rgba(245,197,24,.6);background:rgba(245,197,24,.12);
  color:${GOLD};font-size:${MM(2.5)}px;font-weight:900;
  letter-spacing:3px;text-transform:uppercase;
  padding:5px 20px;border-radius:50px;margin-bottom:${MM(3)}px;
}

.name{
  color:#fff;font-size:${MM(8.5)}px;font-weight:900;
  line-height:.92;letter-spacing:-1px;
}
.name-gold{color:${GOLD};}

.sep{
  width:${MM(22)}px;height:2.5px;
  background:linear-gradient(90deg,${GOLD},rgba(245,197,24,.2));
  margin:${MM(2.5)}px 0;
}

.phone{
  color:${GOLD};
  font-size:${MM(5.2)}px;font-weight:900;letter-spacing:.5px;line-height:1.3;
}

.details{margin-top:${MM(2)}px;display:flex;flex-direction:column;gap:${MM(1)}px}
.det{color:rgba(255,255,255,.78);font-size:${MM(2.2)}px;line-height:1.4}
.det b{color:rgba(255,255,255,.96);font-weight:700}
</style></head><body>
<div class="card">
  <div class="photo-bg"><img src="${PHOTO}"/></div>
  <div class="m tl"></div><div class="m tr"></div>
  <div class="m bl"></div><div class="m br"></div>
  <div class="line lt"></div><div class="line lb"></div>

  <div class="content">
    <div class="badge">☪ ХАЛЯЛЬ</div>
    <div class="name">Живой скот<br><span class="name-gold">Халяль</span></div>
    <div class="sep"></div>
    <div class="phone">+7 (909) 164-34-87</div>
    <div class="phone">+7 (929) 553-87-00</div>
    <div class="details">
      <div class="det"><b>WhatsApp · Telegram</b> — +7 (929) 553-87-00</div>
      <div class="det">📍 Кубинка 10, дер. Акулово, Московская обл.</div>
      <div class="det">🕐 Ежедневно 7:00 — 21:00, без выходных</div>
    </div>
  </div>
</div>
</body></html>`;

// ─── ОБОРОТНАЯ ────────────────────────────────────────────────────────────────
const back = (qr) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}

.card{
  width:${W}px;height:${H}px;
  background:${CREAM};
  display:flex;
  font-family:'Segoe UI',Arial,sans-serif;
  position:relative;overflow:hidden;
}

/* Угловые метки реза */
.m{position:absolute;width:${BL}px;height:${BL}px;z-index:5}
.tl{top:0;left:0;border-top:1.5px solid rgba(0,0,0,.25);border-left:1.5px solid rgba(0,0,0,.25)}
.tr{top:0;right:0;border-top:1.5px solid rgba(0,0,0,.25);border-right:1.5px solid rgba(0,0,0,.25)}
.bl{bottom:0;left:0;border-bottom:1.5px solid rgba(0,0,0,.25);border-left:1.5px solid rgba(0,0,0,.25)}
.br{bottom:0;right:0;border-bottom:1.5px solid rgba(0,0,0,.25);border-right:1.5px solid rgba(0,0,0,.25)}

/* Фото — левая треть */
.photo{
  width:38%;flex-shrink:0;position:relative;overflow:hidden;
}
.photo img{
  width:100%;height:100%;object-fit:cover;object-position:center center;
  display:block;
}
/* Оверлей: тёмный сверху/снизу, прозрачный в середине */
.photo::before{
  content:'';position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg,
    rgba(10,30,15,.6) 0%,
    rgba(10,30,15,.05) 35%,
    rgba(10,30,15,.05) 65%,
    rgba(10,30,15,.55) 100%
  );
}
/* Надпись поверх фото */
.photo-label{
  position:absolute;bottom:${BL+14}px;left:0;right:0;z-index:2;
  text-align:center;color:#fff;
  font-size:${MM(2.2)}px;font-weight:900;
  text-transform:uppercase;letter-spacing:2.5px;
  text-shadow:0 1px 8px rgba(0,0,0,.9);
}
.photo-label span{color:${GOLD}}

/* Правый контент */
.right{
  flex:1;
  display:flex;flex-direction:column;
  padding:${PAD+4}px ${PAD+6}px ${PAD}px ${PAD+8}px;
}

.title{
  font-size:${MM(3.6)}px;font-weight:900;color:${GREEN};
  text-transform:uppercase;letter-spacing:1.5px;
  padding-bottom:${MM(1)}px;margin-bottom:${MM(1.5)}px;
  border-bottom:3px solid ${GOLD};display:inline-block;
}

/* 2 колонки продуктов */
.products{
  display:grid;grid-template-columns:1fr 1fr;
  gap:${MM(1.5)}px ${MM(2)}px;
  margin-bottom:${MM(1.5)}px;
}
.prod{display:flex;align-items:flex-start;gap:${MM(1)}px}
.icon{font-size:${MM(3.2)}px;line-height:1;flex-shrink:0;margin-top:2px}
.pname{font-size:${MM(2.8)}px;font-weight:800;color:${DARK};line-height:1.15}
.pnote{font-size:${MM(1.9)}px;color:#555;margin-top:3px;line-height:1.3}

.delivery{
  display:inline-flex;align-items:center;gap:${MM(1)}px;
  font-size:${MM(2)}px;font-weight:700;color:${GREEN};
  padding:${MM(.8)}px ${MM(2)}px;
  border:2px solid #2d7a4f;border-radius:50px;
  margin-bottom:${MM(1.5)}px;
}

/* QR строка */
.qr-row{
  display:flex;align-items:center;gap:${MM(2)}px;
  border-top:1.5px solid rgba(0,0,0,.1);
  padding-top:${MM(1.5)}px;
  margin-top:auto;
}
.qr-box{
  background:#fff;border:2.5px solid ${GREEN};border-radius:8px;
  padding:5px;box-shadow:0 2px 10px rgba(0,0,0,.07);flex-shrink:0;
}
.qr-box img{display:block;width:${MM(12)}px;height:${MM(12)}px}
.qr-caption{font-size:${MM(1.9)}px;color:#555;line-height:1.6}
.qr-site{font-size:${MM(2)}px;font-weight:900;color:${GREEN};margin-top:4px;line-height:1.3}
</style></head><body>
<div class="card">
  <div class="m tl"></div><div class="m tr"></div>
  <div class="m bl"></div><div class="m br"></div>

  <!-- Фото слева -->
  <div class="photo">
    <img src="${PHOTO}"/>
    <div class="photo-label">Бараны · <span>Халяль</span></div>
  </div>

  <!-- Контент справа -->
  <div class="right">
    <div class="title">Живой скот · Акулово</div>

    <div class="products">
      <div class="prod">
        <div class="icon">🐑</div>
        <div>
          <div class="pname">Бараны</div>
          <div class="pnote">Курбан-байрам 2026</div>
        </div>
      </div>
      <div class="prod">
        <div class="icon">🐂</div>
        <div>
          <div class="pname">Быки</div>
          <div class="pnote">Живой вес</div>
        </div>
      </div>
      <div class="prod">
        <div class="icon">🐐</div>
        <div>
          <div class="pname">Козы</div>
          <div class="pnote">Живой вес</div>
        </div>
      </div>
      <div class="prod">
        <div class="icon">🥛</div>
        <div>
          <div class="pname">Молоко</div>
          <div class="pnote">Домашнее, свежее</div>
        </div>
      </div>
    </div>

    <div class="delivery">🚚 Доставка по Москве и МО</div>

    <div class="qr-row">
      <div class="qr-box"><img src="${qr}" alt="QR"/></div>
      <div>
        <div class="qr-caption">Наведите камеру<br>для перехода на сайт</div>
        <div class="qr-site">88group.github.io/<br>akulovo-halal</div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

// ─── Запуск ───────────────────────────────────────────────────────────────────
(async () => {
  const outDir   = path.join(__dirname, '..', 'Shared');
  const frontOut = path.join(outDir, 'business-card-front.jpg');
  const backOut  = path.join(outDir, 'business-card-back.jpg');

  console.log('QR-код…');
  const qr = await QRCode.toDataURL('https://88group.github.io/akulovo-halal/', {
    width: MM(12), margin: 1,
    color: { dark: '#000', light: '#fff' },
    errorCorrectionLevel: 'M',
  });

  console.log('Браузер…');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

    console.log('Лицевая…');
    await page.setContent(front(), { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 350));
    await page.screenshot({ path: frontOut, type: 'jpeg', quality: 97,
      clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`✅ ${frontOut}`);

    console.log('Оборотная…');
    await page.setContent(back(qr), { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 350));
    await page.screenshot({ path: backOut, type: 'jpeg', quality: 97,
      clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`✅ ${backOut}`);

  } finally {
    await browser.close();
  }

  console.log('\n📐 96×56мм (90×50 + 3мм вылеты) · 300 DPI');
  console.log('🔗 QR → https://88group.github.io/akulovo-halal/');
  console.log('⚠️  RGB → попросите типографию конвертировать в CMYK');
})();
