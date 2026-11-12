"""Lightweight neighborhood massing based on public aerial and campus views."""

import math
import random
from io import BytesIO

from PIL import Image, ImageDraw

from mesh import rect


def facade_texture(seed, wall, window):
    rng = random.Random(seed)
    width, height = 256, 320
    image = Image.new('RGB', (width, height), wall)
    draw = ImageDraw.Draw(image)
    for row in range(5):
        for column in range(4):
            x, y = column * 64, row * 64
            shade = rng.randrange(-14, 13)
            glass = tuple(channel + shade for channel in window)
            draw.rectangle((x + 9, y + 10, x + 57, y + 56), fill=(41, 51, 60))
            draw.rectangle((x + 11, y + 11, x + 55, y + 54), fill=glass)
            draw.rectangle((x + 13, y + 17, x + 26, y + 50),
                           fill=tuple(min(255, channel + rng.randrange(5, 26)) for channel in glass))
            draw.line((x + 32, y + 10, x + 32, y + 52), fill=(113, 122, 127), width=2)
            draw.rectangle((x + 8, y + 46, x + 58, y + 54), fill=(63, 75, 84))
            for rail in range(x + 10, x + 58, 6):
                draw.line((rail, y + 46, rail, y + 53), fill=(118, 128, 135))
            draw.line((x, y + 58, x + 63, y + 58), fill=(142, 142, 139), width=2)
            draw.line((x, y + 3, x + 63, y + 3), fill=(212, 207, 194), width=2)
    stream = BytesIO()
    image.save(stream, 'JPEG', quality=89, optimize=True)
    return stream.getvalue(), 'image/jpeg'


def tower(mesh, x, z, width, depth, height, material):
    base = -0.27
    footprint = rect(x, z, width, depth)
    mesh.box('context-base', x, base, z, width + 4.2, 3.85, depth + 3.1)
    mesh.surface('context-roof', footprint, height)
    for a, b in zip(footprint, footprint[1:] + footprint[:1]):
        repeat = math.dist(a, b) / 14
        floors = max(1, round((height - 3.55) / 15.3))
        mesh.face(material, [(a[0], 3.55, a[1]), (a[0], height, a[1]),
                             (b[0], height, b[1]), (b[0], 3.55, b[1])],
                  uv=[(0, floors), (0, 0), (repeat, 0), (repeat, floors)])
        mesh.strip('context-roof', a, b, .29, height, .96)
    for corner_x, corner_z in footprint:
        mesh.box('context-rib', corner_x, 3.55, corner_z, .74, height - 3.55, .74)
    mesh.box('context-roof', x + width * .1, height, z - depth * .11,
             width * .38, 2.8, depth * .35)


def add_surroundings(mesh):
    mesh.material('context-wall', (255, 255, 255), .87,
                  texture=facade_texture(11, (178, 177, 168), (58, 79, 93)))
    mesh.material('context-wall-light', (255, 255, 255), .87,
                  texture=facade_texture(8, (195, 192, 178), (69, 88, 100)))
    mesh.material('context-roof', (162, 166, 162), .94)
    mesh.material('context-rib', (190, 186, 173), .84)
    mesh.material('context-base', (130, 136, 128), .93)
    mesh.material('context-landscape', (100, 114, 88), .93)
    mesh.material('context-metal-roof', (101, 122, 110), .73)

    # The tallest massing sits beyond the street on the east side.
    mesh.surface('context-landscape', rect(209, -32, 148, 256), -.105)
    for index, (x, z, w, d, h) in enumerate((
        (182, -128, 21, 17, 68), (191, -71, 23, 18, 77), (183, -14, 23, 18, 69),
        (202, 42, 23, 18, 80), (192, 79, 20, 17, 61),
        (242, -103, 20, 19, 87), (229, -48, 21, 16, 77), (254, 13, 23, 17, 84),
        (241, 68, 23, 17, 88),
    )):
        tower(mesh, x, z, w, d, h, 'context-wall-light' if index % 3 == 1 else 'context-wall')

    # The low green-roofed volumes across the south road keep the gate view legible.
    for x, z, w, d, h in ((37, 126, 32, 14, 6.4), (-22, 132, 31, 15, 9.2), (-65, 129, 22, 19, 11.5)):
        mesh.box('context-rib', x, -.27, z, w, h, d, top='context-metal-roof')
        mesh.box('context-metal-roof', x, h-.27, z, w+.55, .42, d+.55)
