"""Make the main entrance materials from small patches of campus photographs.

Run with the 2018 gate and 2025 park-side photographs from school_photos/SOURCES.md.
"""

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from surface_textures import maps


OUTPUT = Path(__file__).with_name('school_photos')


def rectify(image, corners, size):
    (a, b, c, d) = corners
    # Solve for the mapping from a rectangular destination to the photo plane.
    width, height = size
    rows, values = [], []
    for (x, y), (u, v) in zip(((0, 0), (width, 0), (width, height), (0, height)), (a, b, c, d)):
        rows.extend(((x, y, 1, 0, 0, 0, -u * x, -u * y), (0, 0, 0, x, y, 1, -v * x, -v * y)))
        values.extend((u, v))
    return image.transform(size, Image.Transform.PERSPECTIVE, np.linalg.solve(rows, values), Image.Resampling.BICUBIC)


def even_light(image, radius, strength):
    pixels = np.asarray(image, dtype=float)
    low = np.asarray(image.filter(ImageFilter.GaussianBlur(radius)), dtype=float)
    return pixels - strength * (low - np.median(low, axis=(0, 1)))


def join_edges(pixels, width):
    """Fade each edge to its opposite edge without leaving a double grout seam."""
    result = pixels.copy()
    for axis in (0, 1):
        surface = result.swapaxes(0, axis)
        for i, weight in enumerate(np.linspace(.5, 0, width, endpoint=False)):
            delta = (surface[-i - 1] - surface[i]) * weight
            surface[i] += delta
            surface[-i - 1] -= delta
    return result


def save_material(name, color, height, roughness, relief):
    for suffix, (encoded, _) in zip(('color', 'normal', 'roughness'), maps(color, height, roughness, relief)):
        (OUTPUT / f'{name}-{suffix}.jpg').write_bytes(encoded)


def walls(gate):
    # The balcony fascia has a clear run of brick slips and aligned courses.
    patch = rectify(gate, ((23, 562), (146, 562), (149, 594.5), (26, 594.5)), (384, 128))
    beige = join_edges(even_light(patch, 17, .83), 6)
    # Crop covers ten courses. Continue those courses with whole-brick offsets.
    beige = np.concatenate((beige, np.roll(beige, 82, axis=1), np.roll(beige, 192, axis=1)), axis=0)
    beige = join_edges(beige, 5)
    beige += np.array((11, 12, 13))
    grout = np.clip((202 - beige.mean(axis=2)) / 43, 0, 1)
    save_material('balcony-brick', beige, -grout * .24, .75 + .18 * grout, .66)

    # Two patches of the clock shaft preserve its real, faded red-brown mottling.
    top = rectify(gate, ((983, 229), (1033, 227), (1037, 333), (987, 335)), (192, 384))
    bottom = rectify(gate, ((988, 343), (1038, 341), (1042, 447), (992, 449)), (192, 384))
    upper, lower = even_light(top, 21, .80), even_light(bottom, 21, .80)
    lower -= np.median(lower, axis=(0, 1)) - np.median(upper, axis=(0, 1))
    red = np.concatenate((upper, lower), axis=1)
    red = join_edges(red, 11)
    red[:, 185:199] = np.linspace(red[:, 184], red[:, 199], 14, axis=1)
    red -= np.array((13, 7, 4))
    weathering = np.clip((red.mean(axis=2) - 132) / 25, -1, 1)
    save_material('clock-cladding', red, weathering * .10, .84 - .04 * weathering, .58)


def gold_letters(image, corners, size, start, stop):
    patch = rectify(image, corners, size)
    pixels = np.asarray(patch, dtype=float)
    # Gold projects much farther along the red-blue axis than the wall behind it.
    alpha = np.clip((pixels[..., 0] - pixels[..., 2] - start) / (stop - start), 0, 1)
    patch.putalpha(Image.fromarray(np.uint8(alpha * 255)))
    return patch


def entrance_sign(gate):
    sign = Image.new('RGBA', (512, 120))
    for index, (left, right) in enumerate(((558, 587), (598, 626), (635, 661), (666, 698))):
        letter = gold_letters(gate, ((left, 232), (right, 232), (right, 271), (left, 271)),
                              (59, 79), 30, 59)
        sign.alpha_composite(letter, (75 + index * 100, 4))
    latin = gold_letters(gate, ((570, 277), (690, 276), (690, 295), (570, 295)), (251, 37), 52, 85)
    sign.alpha_composite(latin, ((sign.width - latin.width) // 2, 81))
    sign.save(OUTPUT / 'gate-letters.png', optimize=True)


def clock_face(overview):
    size = 512
    face = rectify(overview, ((1387, 1354.4), (1415.8, 1356.2), (1416, 1386.3), (1387, 1384.3)), (size, size))
    # Recover the plate's white field from the photograph, suppressing the old
    # dark glyphs and rims before redrawing them from the clearer 2018 detail.
    plate = face.convert('L').resize((30, 30)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(2.8))
    level = np.asarray(plate.resize((size, size), Image.Resampling.BICUBIC), dtype=float)
    plate = Image.fromarray(np.uint8(np.clip(level * .91 + 7, 0, 255))).convert('RGB')
    draw = ImageDraw.Draw(plate)
    center = size / 2
    ink = (39, 42, 40)
    rim = (71, 75, 71)
    draw.rectangle((2, 2, size - 3, size - 3), outline=rim, width=8)
    for radius, width in ((226, 7), (126, 7), (105, 6)):
        draw.ellipse((center - radius, center - radius, center + radius, center + radius), outline=ink, width=width)

    def polar(angle, radius, sideways=0):
        return (center + radius * math.sin(angle) + sideways * math.cos(angle),
                center - radius * math.cos(angle) + sideways * math.sin(angle))

    # The numerals are long radial Roman strokes between the two rings.
    for hour, numeral in enumerate(('XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI')):
        angle = hour * math.tau / 12
        for column, letter in enumerate(numeral):
            side = 10 * (column - (len(numeral) - 1) * .5)
            if letter == 'I':
                draw.line((polar(angle, 130, side), polar(angle, 222, side)), fill=ink, width=6)
            elif letter == 'V':
                draw.line((polar(angle, 222, side - 5), polar(angle, 130, side), polar(angle, 222, side + 5)),
                          fill=ink, width=5)
            else:
                for direction in (-1, 1):
                    draw.line((polar(angle, 222, side + direction * 6), polar(angle, 130, side - direction * 6)),
                              fill=ink, width=5)

    # Both archive gate views show tapered, dark hands against the white plate.
    for angle, length, width in ((math.radians(326), 91, 12), (math.radians(51), 159, 8)):
        draw.polygon((polar(angle, -20, -width * .32), polar(angle, 29, -width), polar(angle, length),
                      polar(angle, 29, width), polar(angle, -20, width * .32)), fill=ink)
    draw.ellipse((center - 9, center - 9, center + 9, center + 9), fill=ink)
    plate.resize((256, 256), Image.Resampling.LANCZOS).save(OUTPUT / 'clock-dial.jpg', quality=92, optimize=True)


def main(gate_path, overview_path):
    gate = Image.open(gate_path).convert('RGB')
    overview = Image.open(overview_path).convert('RGB')
    OUTPUT.mkdir(exist_ok=True)
    walls(gate)
    entrance_sign(gate)
    clock_face(overview)


if __name__ == '__main__':
    main(*sys.argv[1:])
