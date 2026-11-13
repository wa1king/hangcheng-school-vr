"""Turn street photographs into tileable facade textures for the neighbourhood shells.

Each texture is a perspective-corrected crop that holds a whole number of floors
and bays, so it repeats cleanly up a tower. Sources and licences are listed in
facade_photos/SOURCES.md. Run with a folder for the downloaded originals:

    python tools/prepare_facade_photos.py <cache-folder>
"""

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

OUTPUT = Path(__file__).with_name('facade_photos')
AGENT = {'User-Agent': 'hangcheng-school-vr/0.1 (school campus model)'}
RESIDENTIAL, CURTAIN_WALL, SHOPFRONT = 150538821, 149484130, 159344490

# name: (Commons page id, corners clockwise from top-left in source pixels, output size, floors, bays)
CROPS = {
    'apartment-a': (RESIDENTIAL, (2200, 150, 3350, 150, 3350, 1225, 2200, 1225), (960, 900), 5, 5),
    'apartment-b': (RESIDENTIAL, (1162, 531, 1639, 531, 1639, 1511, 1162, 1511), (440, 900), 3, 1),
    'curtain-wall': (CURTAIN_WALL, (830, 1180, 1490, 1180, 1470, 2090, 640, 2090), (640, 800), 5, 3),
}
SHOPS = (('便利店', (38, 122, 84)), ('文具 · 图书', (36, 84, 150)), ('早餐 · 包点', (176, 44, 36)), ('鲜果店', (214, 120, 30)))


def original(cache, page_id):
    path = cache / f'{page_id}.jpg'
    if not path.exists():
        params = urllib.parse.urlencode({'action': 'query', 'pageids': page_id, 'prop': 'imageinfo',
                                         'iiprop': 'url', 'format': 'json'})
        request = urllib.request.Request(f'https://commons.wikimedia.org/w/api.php?{params}', headers=AGENT)
        page = json.load(urllib.request.urlopen(request, timeout=60))['query']['pages'][str(page_id)]
        url = page['imageinfo'][0]['url']
        path.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=AGENT), timeout=180).read())
    return Image.open(path).convert('RGB')


def rectify(image, corners, size):
    x0, y0, x1, y1, x2, y2, x3, y3 = corners
    # PIL reads the quad as top-left, bottom-left, bottom-right, top-right.
    return image.transform(size, Image.Transform.QUAD, (x0, y0, x3, y3, x2, y2, x1, y1), Image.Resampling.BICUBIC)


def blend_seam(image, width=18):
    """Cross-fade the left and right edges so the bays repeat without a hard line."""
    wrapped = image.copy()
    strip = image.crop((image.width - width, 0, image.width, image.height))
    mask = Image.linear_gradient('L').rotate(90).resize((width, image.height))
    wrapped.paste(strip, (0, 0), mask)
    return wrapped


def podium(cache):
    """Street-level shops: photographed brick, shutters and doors under generic signboards."""
    bay_width, height = 320, 384
    residential, shopfront = original(cache, RESIDENTIAL), original(cache, SHOPFRONT)
    brick = rectify(residential, (1620, 1795, 2480, 1795, 2480, 1905, 1620, 1905), (bay_width * 4, 132))
    shutter = rectify(shopfront, (545, 1235, 1155, 1215, 1150, 2255, 545, 2245), (bay_width - 44, 180))
    # The photographed door carries a real shop's name, so the glazed bays are drawn.
    door = Image.new('RGB', (bay_width - 44, 180))
    glass = ImageDraw.Draw(door)
    for y in range(180):
        glass.line((0, y, door.width, y), fill=(58 + y // 6, 84 + y // 5, 92 + y // 6))
    glass.rectangle((0, 0, door.width - 1, 179), outline=(196, 198, 194), width=5)
    glass.rectangle((0, 40, door.width, 44), fill=(196, 198, 194))
    for x in (door.width // 3, door.width * 2 // 3):
        glass.rectangle((x - 2, 44, x + 2, 180), fill=(196, 198, 194))
    for x in (door.width // 2 - 46, door.width // 2 + 40):
        glass.rectangle((x, 96, x + 5, 136), fill=(226, 226, 220))
    glass.polygon([(30, 50), (95, 50), (40, 178), (8, 178)], fill=(108, 140, 150))
    wall = rectify(shopfront, (3240, 600, 3640, 600, 3640, 1500, 3240, 1500), (22, 252))
    image = Image.new('RGB', (bay_width * 4, height))
    image.paste(brick, (0, 0))
    draw = ImageDraw.Draw(image)
    fonts = Path('C:/Windows/Fonts')
    font = ImageFont.truetype(next(p for p in (fonts / 'msyhbd.ttc', fonts / 'msyh.ttc', fonts / 'simhei.ttf') if p.exists()), 40)
    for bay, (name, colour) in enumerate(SHOPS):
        x = bay * bay_width
        image.paste(wall, (x, 132))
        image.paste(wall.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (x + bay_width - 22, 132))
        image.paste(door if bay % 2 == 0 else shutter, (x + 22, 204))
        draw.rectangle((x + 8, 132, x + bay_width - 8, 203), fill=colour)
        draw.rectangle((x + 8, 132, x + bay_width - 8, 137), fill=tuple(min(255, c + 60) for c in colour))
        draw.rectangle((x + 8, 198, x + bay_width - 8, 203), fill=tuple(c * 2 // 3 for c in colour))
        draw.text((x + bay_width / 2, 167), name, font=font, anchor='mm', fill=(250, 248, 240))
    return image


def main(cache):
    cache.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(exist_ok=True)
    for name, (page_id, corners, size, floors, bays) in CROPS.items():
        image = blend_seam(rectify(original(cache, page_id), corners, size))
        if name == 'apartment-b':
            # The second block is graded warmer so neighbouring estates do not look cloned.
            image = ImageEnhance.Color(image).enhance(1.08)
            image = Image.merge('RGB', [band.point(lambda v, k=k: min(255, int(v * k)))
                                        for band, k in zip(image.split(), (1.04, 1.0, .93))])
        image.save(OUTPUT / f'{name}.jpg', quality=84, optimize=True)
        print(name, image.size, f'{floors} floors x {bays} bays')
    shops = podium(cache)
    shops.save(OUTPUT / 'podium.jpg', quality=85, optimize=True)
    print('podium', shops.size)


if __name__ == '__main__':
    main(Path(sys.argv[1]))
