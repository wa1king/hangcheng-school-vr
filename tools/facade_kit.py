"""Dress facades from structured samples so ordinary walls keep a steady level of detail.

`facade_panels.json` records each facade type's bay rhythm, opening proportions and
the fittings that belong together. Insets are measured into the building from the
footprint edge, so negative values project toward the outside.
"""

import json
import math
import random
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FACADES = json.loads(Path(__file__).with_name('facade_panels.json').read_text(encoding='utf-8'))['types']
ROOM_GLASS = 6
OUTWARD_UV = [(1, 1), (1, 0), (0, 0), (0, 1)]
GROUND = -0.03  # Top of the campus paving slab.


def offset(a, b, fraction, inset=0.0):
    dx, dz = b[0] - a[0], b[1] - a[1]
    length = math.hypot(dx, dz)
    return a[0] + dx * fraction - dz / length * inset, a[1] + dz * fraction + dx / length * inset


def along(a, b, metres, inset=0.0):
    return offset(a, b, metres / math.dist(a, b), inset)


def band(mesh, material, a, b, outer, inner, y, height):
    """A box along a-b whose faces sit at the given insets."""
    centre = (outer + inner) / 2
    mesh.strip(material, offset(a, b, 0, centre), offset(a, b, 1, centre), inner - outer, y, height)


def jpeg(image, quality=86):
    stream = BytesIO()
    image.save(stream, 'JPEG', quality=quality, optimize=True)
    return stream.getvalue(), 'image/jpeg'


def room_glass(seed):
    """A classroom seen through daylight glass: dim room, tube lights, curtains."""
    width, height = 256, 192
    rng = np.random.default_rng(seed)
    v = np.linspace(0, 1, height)[:, None]
    u = np.linspace(0, 1, width)[None, :]
    room = np.array([34, 43, 50]) + np.array([34, 36, 34]) * np.clip((v - .30) / .7, 0, 1)[..., None]
    pixels = np.broadcast_to(room, (height, width, 3)).copy()
    # The rear wall catches light from the opposite windows.
    wall = np.clip(1 - np.abs(v - .52) / .30, 0, 1) * (.55 + .45 * np.cos((u - rng.uniform(.3, .7)) * 3.2))
    pixels += wall[..., None] * np.array([34, 37, 35])
    image = Image.fromarray(np.uint8(np.clip(pixels, 0, 255)))
    draw = ImageDraw.Draw(image)
    lit = rng.random() < .55
    for row, y in enumerate((.10, .19)):
        for column in range(3):
            x = (.16 + column * .30 + row * .04) * width
            length = (30 - row * 8)
            draw.rectangle((x, y * height, x + length, y * height + 2),
                           fill=(226, 236, 228) if lit else (112, 122, 122))
    for column in range(5):
        x = (.08 + column * .19 + rng.uniform(-.02, .02)) * width
        draw.rectangle((x, .80 * height, x + 26, height), fill=(41, 44, 43))
        draw.rectangle((x - 2, .78 * height, x + 28, .80 * height), fill=(118, 104, 82))
    image = image.filter(ImageFilter.GaussianBlur(1.1))
    pixels = np.asarray(image, dtype=float)
    # Light blue classroom curtains are gathered to one or both sides.
    cloth = np.array([112, 132, 148]) + rng.normal(0, 4, 3)
    style = seed % ROOM_GLASS
    sides = ((), (0,), (1,), (0, 1), (1,), (0,))[style]
    for side in sides:
        reach = rng.uniform(.10, .24)
        position = u if side == 0 else 1 - u
        hem = reach * (1 + .035 * np.sin(v * 7 + seed))
        mask = np.clip((hem - position) * width / 2.5, 0, 1) * .93
        folds = .88 + .12 * np.sin(position * 170 + .8 * np.sin(v * 3 + side))
        pixels = pixels * (1 - mask[..., None]) + cloth * (folds * (.86 - .22 * v))[..., None] * mask[..., None]
    # A soft sky reflection keeps the pane reading as glass from the ground.
    sky = np.clip(1 - v / .62, 0, 1) ** 1.6
    glint = np.clip(1 - np.abs(u + v * .45 - .62) * 6, 0, 1) * .10
    pixels += (sky * .34 + glint)[..., None] * np.array([116, 142, 164])
    pixels += rng.normal(0, 1.2, (height, width, 1))
    return jpeg(Image.fromarray(np.uint8(np.clip(pixels, 0, 255))), 88)


def fan_grille():
    image = Image.new('RGB', (128, 96), (226, 226, 219))
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 127, 95), outline=(176, 177, 170), width=2)
    draw.ellipse((10, 8, 90, 88), fill=(52, 56, 58), outline=(150, 152, 148), width=2)
    for index in range(12):
        angle = index * math.tau / 12
        draw.line((50, 48, 50 + 39 * math.cos(angle), 48 + 39 * math.sin(angle)), fill=(120, 124, 122), width=1)
    for radius in (12, 24, 34):
        draw.ellipse((50 - radius, 48 - radius, 50 + radius, 48 + radius), outline=(128, 132, 130))
    draw.ellipse((43, 41, 57, 55), fill=(172, 174, 170))
    for y in range(14, 86, 7):
        draw.line((100, y, 120, y), fill=(160, 161, 155), width=2)
    return jpeg(image.filter(ImageFilter.GaussianBlur(.5)), 88)


def gully_grate():
    image = Image.new('RGB', (96, 76), (78, 80, 79))
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 95, 75), outline=(118, 119, 114), width=4)
    for x in range(10, 88, 9):
        draw.rectangle((x, 9, x + 4, 66), fill=(22, 24, 25))
    draw.rectangle((6, 35, 89, 40), fill=(84, 86, 84))
    return jpeg(image.filter(ImageFilter.GaussianBlur(.6)), 88)


def register_facade_materials(mesh):
    mesh.material('apron', (181, 178, 169), 0.86)
    mesh.material('gully-grate', (255, 255, 255), 0.55, metallic=.35, texture=gully_grate(), solid=False)
    for index in range(ROOM_GLASS):
        mesh.material(f'glass-room-{index}', (255, 255, 255), 0.22, texture=room_glass(600 + index), double=True)
    mesh.material('ac-body', (228, 228, 221), 0.52)
    mesh.material('ac-grille', (255, 255, 255), 0.6, texture=fan_grille(), double=True)
    mesh.material('downpipe', (214, 213, 204), 0.58)
    mesh.material('plinth', (146, 143, 136), 0.78)


def glazing(spec, rng):
    return rng.choice(spec['glazing'])


def window_trim(mesh, spec, left, right, bottom, top):
    """Projecting sill and sun-shading head for one opening on the wall face."""
    trim = spec.get('trim') or {}
    width = math.dist(left, right)
    sill = trim.get('sill')
    if sill:
        over = sill['overhang']
        mesh.strip('sill', along(left, right, -over, -sill['projection'] / 2),
                   along(left, right, width + over, -sill['projection'] / 2),
                   sill['projection'], bottom - sill['thickness'], sill['thickness'])
    brow = trim.get('eyebrow')
    if brow:
        over = brow['overhang']
        mesh.strip('cream', along(left, right, -over, -brow['projection'] / 2),
                   along(left, right, width + over, -brow['projection'] / 2),
                   brow['projection'], top + .015, brow['thickness'])


def condenser(mesh, left, right, sill_y, rng):
    """Split-system outdoor unit on brackets below the sill, with its line set."""
    width, height, depth = .82, .56, .31
    span = math.dist(left, right)
    if span < width + .5:
        return
    start = rng.choice((.22, span - width - .22))
    y = sill_y - .12 - height
    a, b = along(left, right, start, -.03 - depth / 2), along(left, right, start + width, -.03 - depth / 2)
    mesh.strip('ac-body', a, b, depth, y, height)
    face_a, face_b = along(left, right, start, -.036 - depth), along(left, right, start + width, -.036 - depth)
    mesh.face('ac-grille', [(face_a[0], y + .03, face_a[1]), (face_a[0], y + height - .03, face_a[1]),
                            (face_b[0], y + height - .03, face_b[1]), (face_b[0], y + .03, face_b[1])], uv=OUTWARD_UV)
    for metres in (start + .12, start + width - .12):
        mesh.strip('outdoor-steel', along(left, right, metres - .02, -.19), along(left, right, metres + .02, -.19),
                   .38, y - .04, .04)
    pipe = start - .07 if start < span / 2 else start + width + .07
    mesh.strip('downpipe', along(left, right, pipe - .022, -.03), along(left, right, pipe + .022, -.03),
               .045, y + .12, sill_y - y - .12)


def downpipe(mesh, a, b, metres, face, radius, top, floors, floor_height):
    x, z = along(a, b, metres, face - radius - .035)
    mesh.cylinder('downpipe', x, .16, z, radius, top - .16, 6)
    mesh.cylinder('downpipe', x, .0, z, radius * 1.5, .16, 6)
    mesh.cylinder('downpipe', x, top - .34, z, radius * 1.7, .26, 6)
    angle = math.atan2(b[1] - a[1], b[0] - a[0])
    for floor in range(floors):
        bx, bz = along(a, b, metres, face - radius * .5 - .03)
        mesh.box('outdoor-steel', bx, floor * floor_height + 1.9, bz, radius * 2 + .05, .035, radius + .07, angle)


def dress_span(mesh, mode, a, b, count, floors, floor_height, seed, ground_open=False):
    """Fittings that run across a whole wall span: piers, floor bands, plinth, pipes."""
    spec = FACADES[mode]
    trim = spec.get('trim')
    if not trim:
        return
    face = spec.get('front', 0.0)
    length = math.dist(a, b)
    total = floors * floor_height
    base = floor_height if ground_open else 0
    rng = random.Random(seed)
    pier = trim.get('pilaster')
    if pier:
        half = pier['width'] / 2
        for index in range(count + 1):
            metres = min(max(index * length / count, half), length - half)
            depth = pier['projection'] + .02
            mesh.strip(pier['material'], along(a, b, metres - half, face + .02 - depth / 2),
                       along(a, b, metres + half, face + .02 - depth / 2), depth, base, total + .05 - base)
    line = trim.get('band')
    if line:
        for floor in range(1, floors + 1):
            # The top band doubles as the cornice under the parapet.
            y = floor * floor_height - line['height'] + (.05 if floor == floors else 0)
            band(mesh, line['material'], a, b, min(face, 0) - line['projection'], face + .02, y, line['height'])
    plinth = trim.get('plinth')
    if plinth and not ground_open:
        band(mesh, 'plinth', a, b, face - plinth['projection'], face + .02, -.03, plinth['height'] + .03)
        band(mesh, 'sill', a, b, face - plinth['projection'] - .012, face + .02, plinth['height'], .035)
    apron = trim.get('apron') if not ground_open else None
    if apron:
        # The paved apron sheds water away from the wall foot, with a saw-cut joint each bay.
        outer = face - apron['width']
        band(mesh, 'apron', a, b, outer, face, GROUND, apron['rise'])
        for index in range(1, count):
            metres = index * length / count
            mesh.strip('curb-joint', along(a, b, metres, outer), along(a, b, metres, face - .04), .012,
                       GROUND + apron['rise'] + .002)
    pipe = trim.get('downpipe')
    if pipe and count >= 2:
        first = rng.randrange(1, min(pipe['every_bays'], count - 1) + 1)
        for index in range(first, count, pipe['every_bays']):
            metres = index * length / count + ((pier['width'] / 2 + pipe['radius'] + .05) if pier else 0)
            downpipe(mesh, a, b, metres, face, pipe['radius'], total - .5, floors, floor_height)
            if apron:
                # Each rainwater pipe discharges toward a gully just beyond the apron.
                x, z = along(a, b, metres, face - apron['width'] - .30)
                angle = math.atan2(b[1] - a[1], b[0] - a[0])
                corners = [(x + u * math.cos(angle) - w * math.sin(angle), z + u * math.sin(angle) + w * math.cos(angle))
                           for u, w in ((-.24, -.19), (.24, -.19), (.24, .19), (-.24, .19))]
                mesh.face('gully-grate', [(px, GROUND + .006, pz) for px, pz in corners[::-1]],
                          uv=[(0, 0), (1, 0), (1, 1), (0, 1)])
