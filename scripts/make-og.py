"""Generate the 1200x630 Open Graph share images: public/site/og.jpg (Chinese page) and
public/site/og-en.jpg (English page).

Run after changing the tagline or the product list:
    python scripts/make-og.py          # both
    python scripts/make-og.py en       # one language
Needs Pillow and the Microsoft YaHei / Segoe UI fonts that ship with Windows.
"""
import os
import random
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "public", "site")
W, H = 1200, 630

COPY = {
    "zh": {
        "out": "og.jpg",
        "title": ["创意技术", "三维可视化"], "title_size": 78,
        "sub": ["用 Blender、Three.js 与自写着色器，", "把地质、解剖与自然的数据做成可以亲手转动的世界。"],
        "pills": ["地球纪元", "人体 · 一日", "溪畔秋日", "Three.js · GLSL"], "pill_size": 20,
    },
    # Latin lines are longer than the Chinese ones; sizes are chosen so nothing runs into the Earth
    # at x = 700
    "en": {
        "out": "og-en.jpg",
        "title": ["Creative technology", "& 3D visualization"], "title_size": 62,
        "sub": ["Blender, Three.js and hand-written shaders,", "turning data into worlds you can turn by hand."],
        "pills": ["Earth Chronicle", "A Day in the Body", "Autumn by the Creek"], "pill_size": 17,
    },
}

FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
FONT_REG = r"C:\Windows\Fonts\msyh.ttc"
FONT_EN = r"C:\Windows\Fonts\segoeuib.ttf"

def render(lang):
    c = COPY[lang]
    # ---- background: deep navy, a soft blue glow, a scatter of stars
    bg = Image.new("RGB", (W, H), (4, 7, 15))
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(glow).ellipse((520, -260, 1500, 620), fill=(22, 44, 96))
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    bg = ImageChops.add(bg, glow.point(lambda v: int(v * 0.9)))

    random.seed(7)
    sd = ImageDraw.Draw(bg)
    for _ in range(260):
        x, y = random.random() * W, random.random() * H
        r = random.random() * 1.3 + 0.3
        a = random.randint(120, 255)
        star = random.choice([(235, 240, 255), (190, 215, 255), (255, 214, 170)])
        sd.ellipse((x - r, y - r, x + r, y + r), fill=tuple(int(v * a / 255) for v in star))

    # ---- the Earth, masked to a circle with an outer halo
    src = Image.open(os.path.join(SITE, "earth_preview_1200.webp")).convert("RGBA")
    gray = src.convert("L")
    bbox = gray.point(lambda v: 255 if v > 28 else 0).getbbox()
    cx, cy = (bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2
    rad = max(bbox[2] - bbox[0], bbox[3] - bbox[1]) // 2
    crop = src.crop((cx - rad, cy - rad, cx + rad, cy + rad))

    D, EX, EY = 640, 700, 60
    crop = crop.resize((D, D), Image.LANCZOS)
    mask = Image.new("L", (D, D), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, D - 1, D - 1), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))

    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse((EX - 30, EY - 30, EX + D + 30, EY + D + 30), fill=(90, 150, 255, 120))
    halo = halo.filter(ImageFilter.GaussianBlur(45))

    bg = bg.convert("RGBA")
    bg.alpha_composite(halo)
    earth = Image.new("RGBA", (D, D), (0, 0, 0, 0))
    earth.paste(crop, (0, 0), mask)
    bg.alpha_composite(earth, (EX, EY))

    # ---- text
    d = ImageDraw.Draw(bg)
    d.text((80, 96), "RORY.STUDIO", font=ImageFont.truetype(FONT_EN, 22), fill=(108, 180, 255))
    latin = lang == "en"
    title = ImageFont.truetype(FONT_EN if latin else FONT_BOLD, c["title_size"])
    for i, line in enumerate(c["title"]):
        d.text((80, (158 + i * 82) if latin else (150 + i * 100)), line, font=title, fill=(255, 255, 255))

    sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf" if latin else FONT_REG, 26)
    for i, line in enumerate(c["sub"]):
        d.text((82, 372 + i * 42), line, font=sub, fill=(201, 212, 232))

    pf = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf" if latin else FONT_REG, c["pill_size"])
    x = 82
    for label in c["pills"]:
        w = d.textlength(label, font=pf)
        d.rounded_rectangle((x, 486, x + w + 34, 526), radius=20, fill=(12, 20, 40), outline=(60, 85, 130), width=1)
        d.text((x + 17, 494), label, font=pf, fill=(223, 231, 245))
        x += w + 46

    d.text((82, 566), "rory-sun.github.io", font=ImageFont.truetype(FONT_EN, 22), fill=(144, 161, 192))

    out = os.path.join(SITE, c["out"])
    bg.convert("RGB").save(out, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{out}  {os.path.getsize(out) // 1024} KB")


for lang in (sys.argv[1:] or ["zh", "en"]):
    render(lang)
