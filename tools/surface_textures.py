"""Small, periodic PBR maps for campus surfaces at the mesh's 3 m UV scale."""

import math
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def jpeg(pixels, quality=86):
    image = pixels if isinstance(pixels, Image.Image) else Image.fromarray(np.uint8(np.clip(pixels, 0, 255)))
    stream = BytesIO()
    image.save(stream, 'JPEG', quality=quality, subsampling=0, optimize=True)
    return stream.getvalue(), 'image/jpeg'


def noise(rng, size, cells):
    """Interpolate a repeatable noise field without a seam at either edge."""
    grid = rng.normal(0, 1, (cells, cells))
    coords = np.arange(size) * cells / size
    lower = np.floor(coords).astype(int)
    upper = (lower + 1) % cells
    weight = coords - lower
    weight = weight * weight * (3 - 2 * weight)
    horizontal = grid[:, lower] * (1 - weight) + grid[:, upper] * weight
    return horizontal[lower, :] * (1 - weight[:, None]) + horizontal[upper, :] * weight[:, None]


def maps(color, height, roughness, relief):
    dx = (np.roll(height, 1, axis=1) - np.roll(height, -1, axis=1)) * relief
    dy = (np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)) * relief
    length = np.sqrt(dx * dx + dy * dy + 1)
    normals = np.stack((dx / length, dy / length, 1 / length), axis=-1)
    rough = np.full_like(color, 255)
    rough[..., 1] = 255 * np.clip(roughness, 0.08, 1)
    return jpeg(color), jpeg(127.5 + 127.5 * normals, 90), jpeg(rough, 85)


def tinted(rgb, variation):
    return np.array(rgb) + variation[..., None] * np.array((1.0, 0.93, 0.82))


def porcelain_tiles(rgb, grout, seed, columns=4, rows=4, size=384):
    rng = np.random.default_rng(seed)
    y, x = np.indices((size, size), dtype=float)
    col, row = (x + 0.5) * columns / size, (y + 0.5) * rows / size
    u, v = col % 1, row % 1
    edge = np.minimum(np.minimum(u, 1 - u) * size / columns, np.minimum(v, 1 - v) * size / rows)
    glaze = np.clip((edge - 0.67) / 1.45, 0, 1)
    tile_tones = rng.normal(0, 4, (rows, columns))[row.astype(int), col.astype(int)]
    cloud = noise(rng, size, 11)
    fine = noise(rng, size, 61)
    color = tinted(rgb, tile_tones + 2.5 * cloud + 0.8 * fine)
    color = color * glaze[..., None] + tinted(grout, 3.5 * fine) * (1 - glaze[..., None])
    height = glaze * 0.62 + fine * 0.039 + cloud * 0.034
    rough = 0.48 + 0.32 * (1 - glaze) + 0.066 * cloud + 0.025 * fine
    return maps(color, height, rough, 0.85)


def weathered_plaster(rgb, seed, size=256):
    rng = np.random.default_rng(seed)
    broad = noise(rng, size, 5)
    pitting = noise(rng, size, 53)
    chips = np.maximum(0, pitting - 1.16) ** 2
    color = tinted(rgb, 2.35 * broad + 1.2 * pitting - 1.65 * chips)
    return maps(color, 0.055 * broad + 0.071 * pitting - 0.08 * chips,
                0.82 + 0.044 * broad + 0.06 * chips, 0.55)


def terrazzo(rgb, seed, size=384):
    rng = np.random.default_rng(seed)
    broad = noise(rng, size, 12)
    grains = noise(rng, size, 151)
    aggregate = np.where(grains > 0.67, 8.0 + 3.4 * grains,
                         np.where(grains < -0.59, -10.0 + 6.0 * grains, 1.8 * grains))
    color = tinted(rgb, 2.2 * broad + aggregate)
    return maps(color, 0.043 * broad + 0.082 * grains, 0.67 + 0.05 * broad - 0.041 * grains, 0.63)


def birch_laminate(rgb, seed, size=384):
    rng = np.random.default_rng(seed)
    _, x = np.indices((size, size), dtype=float)
    warp = x / size + 0.016 * noise(rng, size, 7)
    grain = np.sin(warp * math.tau * 38) + 0.54 * np.sin(warp * math.tau * 77 + 0.9)
    pores = np.maximum(0, np.cos(warp * math.tau * 93) - 0.61)
    color = tinted(rgb, 2.9 * grain - 7.0 * pores + 2.2 * noise(rng, size, 8))
    return maps(color, 0.043 * grain - 0.056 * pores, 0.53 - 0.068 * grain, 0.58)


def chalkboard(seed, equation=None):
    rng = np.random.default_rng(seed)
    grain = noise(rng, 256, 53)
    erased = noise(rng, 256, 9)
    pixels = tinted((49, 69, 58), 2.6 * grain + 4.5 * np.maximum(0, erased))
    image = Image.fromarray(np.uint8(np.clip(pixels, 0, 255))).resize((384, 256), Image.Resampling.BILINEAR)
    if equation:
        draw = ImageDraw.Draw(image)
        font_dir = Path('C:/Windows/Fonts')
        font = ImageFont.truetype(str(font_dir / 'simkai.ttf' if (font_dir / 'simkai.ttf').exists()
                                       else font_dir / 'msyh.ttc'), 34)
        for index, line in enumerate(equation):
            draw.text((30, 32 + 42 * index), line, fill=(179, 185, 153), font=font)
        draw.line((31, 165, 219, 166, 263, 163), fill=(151, 162, 137), width=2)
    return jpeg(image, 91)


def notice_board():
    image = Image.new('RGB', (384, 256), (130, 108, 85))
    draw = ImageDraw.Draw(image)
    draw.rectangle((4, 4, 379, 251), fill=(151, 125, 95))
    for index, (x, y, w, h, color) in enumerate((
        (24, 28, 102, 172, (231, 222, 191)), (147, 37, 97, 157, (226, 218, 195)),
        (265, 22, 98, 179, (194, 216, 216)),
    )):
        draw.rectangle((x + 2, y + 3, x + w + 2, y + h + 3), fill=(112, 91, 71))
        draw.rectangle((x, y, x + w, y + h), fill=color)
        accent = ((109, 149, 131), (168, 115, 95), (83, 130, 157))[index]
        draw.rectangle((x + 9, y + 13, x + w - 9, y + 25), fill=accent)
        draw.ellipse((x + w // 2 - 2, y + 2, x + w // 2 + 2, y + 6), fill=(109, 106, 92))
        for j in range(5):
            yy = y + 39 + 11 * j
            draw.line((x + 9, yy, x + w - 12 - (j % 3) * 9, yy), fill=(151, 150, 133), width=2)
        if index == 2:
            draw.line((x + 15, y + 151, x + 28, y + 123, x + 45, y + 136, x + 72, y + 108),
                      fill=accent, width=4)
        else:
            for j in range(3):
                yy = y + 113 + 13 * j
                draw.rectangle((x + 10, yy, x + w - 14, yy + 8), outline=(154, 152, 135))
    return jpeg(image, 90)
