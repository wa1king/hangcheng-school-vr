"""Photo-referenced campus exteriors. Floor heights and openings are estimates."""

import math
import random
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import LineString, Point, Polygon, box
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

from facade_kit import FACADES, condenser, dress_span, window_trim
from mesh import rect, rounded
from street_trees import street_tree


def tile(color, seed, grout=None, pattern='grain'):
    rng = np.random.default_rng(seed)
    large = Image.fromarray(rng.integers(95, 161, (16, 16), dtype=np.uint8)).resize((256, 256), Image.Resampling.BICUBIC)
    cloud = (np.asarray(large, dtype=float) - 128)[:, :, None]
    variation = {'paving': 0.16, 'brick': 0.15}.get(pattern, 0.24)
    pixels = np.array(color) + cloud * variation + rng.normal(0, 1.8, (256, 256, 1))
    if pattern == 'brick':
        for y in range(0, 256, 8):
            for x in range(-8 if y // 8 % 2 else 0, 256, 16):
                columns = np.arange(x + 1, x + 16) % 256
                pixels[y + 1:y + 8, columns] += rng.normal(0, 3.1) * np.array([1, .87, .72])
    if pattern == 'paving':
        for y in range(0, 256, 64):
            for x in range(0, 256, 64):
                pixels[y:y+64, x:x+64] += rng.normal(0, 2.9)
    image = Image.fromarray(np.uint8(np.clip(pixels, 0, 255)))
    draw = ImageDraw.Draw(image)
    if pattern == 'brick':
        for y in range(0, 256, 8):
            draw.line((0, y, 255, y), fill=grout)
            for x in range((y // 8 % 2) * 8, 256, 16):
                draw.line((x, y, x, y + 7), fill=grout)
    if pattern == 'paving':
        for i in range(0, 256, 64):
            draw.line((i, 0, i, 255), fill=grout, width=2)
            draw.line((0, i, 255, i), fill=grout, width=2)
    stream = BytesIO()
    image.save(stream, 'JPEG', quality=88, optimize=True)
    return stream.getvalue(), 'image/jpeg'


def png(image):
    stream = BytesIO()
    image.save(stream, 'PNG', optimize=True)
    return stream.getvalue(), 'image/png'


def surface_maps(pattern, seed):
    row, column = np.indices((256, 256))
    rng = np.random.default_rng(seed)
    grain = rng.normal(0, .06, row.shape)
    if pattern == 'brick':
        joint = (row % 8 == 0) | ((column - (row // 8 % 2) * 8) % 16 == 0)
    elif pattern == 'paving':
        joint = (row % 64 <= 1) | (column % 64 <= 1)
    else:
        joint = np.zeros(row.shape, dtype=bool)
    relief = np.where(joint, -.80, 0.0) + grain
    dx = (np.roll(relief, 1, axis=1) - np.roll(relief, -1, axis=1)) * .58
    dy = (np.roll(relief, -1, axis=0) - np.roll(relief, 1, axis=0)) * .58
    vectors = np.stack((dx, dy, np.ones_like(dx)), axis=-1)
    vectors /= np.linalg.norm(vectors, axis=-1, keepdims=True)
    normal = np.round((vectors * .5 + .5) * 255).astype(np.uint8)
    roughness = np.ones((*row.shape, 3), dtype=np.uint8) * 255
    roughness[..., 1] = np.clip(215 + 86 * grain + 23 * joint, 190, 250).astype(np.uint8)

    def encode(pixels):
        stream = BytesIO()
        Image.fromarray(pixels).save(stream, 'JPEG', quality=87, subsampling=0, optimize=True)
        return stream.getvalue(), 'image/jpeg'

    return encode(normal), encode(roughness)


def clock_texture():
    image = Image.new('RGBA', (256, 256))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((3, 3, 253, 253), 3, fill='#eeeae0', outline='#72807f', width=6)
    draw.ellipse((21, 21, 235, 235), outline='#2f3a40', width=4)
    for tick in range(60):
        angle = tick * math.tau / 60
        inner = 86 if tick % 5 == 0 else 97
        points = [(128 + radius * math.sin(angle), 128 - radius * math.cos(angle)) for radius in (inner, 102)]
        draw.line(points, fill='#303b40', width=4 if tick % 5 == 0 else 2)
    draw.line((128, 128, 83, 77), fill='#303b40', width=8)
    draw.line((128, 128, 200, 94), fill='#303b40', width=5)
    draw.ellipse((122, 122, 134, 134), fill='#a35746')
    return png(image)


def school_sign():
    image = Image.new('RGBA', (1024, 312))
    draw = ImageDraw.Draw(image)
    fonts = Path('C:/Windows/Fonts')
    font_path = next((p for p in (fonts / 'simkai.ttf', fonts / 'msyh.ttc') if p.exists()))
    font = ImageFont.truetype(font_path, 196)
    latin = ImageFont.truetype(fonts / 'arialbd.ttf', 55)
    draw.text((512, 4), '航 城 学 校', font=font, anchor='mt', fill='#d9ab4f', stroke_width=2, stroke_fill='#ac7b25')
    draw.text((512, 236), 'HangCheng School', font=latin, anchor='mt', fill='#dfb24e')
    return png(image)


def window_reflection(color):
    image = Image.new('RGB', (96, 128))
    pixels = image.load()
    for y in range(128):
        for x in range(96):
            height = y / 127
            sky = 1.25 - .55 * height + .09 * math.exp(-((height - .68) / .12) ** 2)
            glint = max(0, 1 - abs(x / 96 + y / 220 - .56) * 7) * .062
            pixels[x, y] = tuple(round(min(255, channel * (sky + glint))) for channel in color)
    stream = BytesIO()
    image.save(stream, 'JPEG', quality=91, optimize=True)
    return stream.getvalue(), 'image/jpeg'


OUTWARD_UV = [(1, 1), (1, 0), (0, 0), (0, 1)]


def materials(mesh):
    textures = {
        'beige': tile((202, 190, 164), 11, (192, 181, 157), 'brick'),
        'terra': tile((173, 107, 89), 9, (165, 105, 90), 'brick'),
        'roof': tile((164, 163, 148), 7, (156, 155, 140), 'paving'),
        'roof-weathered': tile((121, 118, 104), 27),
        'roof-planting': tile((106, 113, 69), 14),
        'roof-path': tile((172, 153, 122), 20, (164, 145, 118), 'paving'),
        'plaza': tile((186, 179, 161), 12, (166, 159, 145), 'paving'),
        'ground': tile((112, 131, 85), 16),
        'road': tile((83, 89, 94), 2),
        'walk': tile((168, 159, 148), 11, (158, 149, 139), 'paving'),
        'planter': tile((110, 133, 68), 3),
        'courtyard-paving': tile((166, 148, 134), 41, (152, 139, 126), 'paving'),
        'outdoor-wood': tile((144, 110, 77), 51),
        'bark': tile((113, 92, 73), 42),
    }
    brick_maps = surface_maps('brick', 17)
    paving_maps = surface_maps('paving', 25)
    grain_maps = surface_maps('grain', 32)
    for name, texture in textures.items():
        maps = brick_maps if name in ('beige', 'terra') else (
            paving_maps if name in ('roof', 'roof-path', 'plaza', 'walk', 'courtyard-paving') else grain_maps)
        mesh.material(name, (255, 255, 255), texture=texture, normal=maps[0], roughness_map=maps[1],
                      double=name in ('beige', 'terra'))
    for name, rgb, roughness in (
        ('cream', (210, 199, 175), 0.84), ('soffit', (166, 156, 135), 0.9),
        ('reveal', (177, 167, 149), 0.86), ('sill', (203, 198, 184), 0.74),
        ('blue-rail', (75, 102, 119), 0.56), ('blue-cap', (110, 134, 147), 0.54),
        ('door', (122, 129, 120), 0.63),
        ('frame', (103, 110, 108), 0.6), ('brickline', (152, 110, 98), 0.88),
        ('curb', (176, 173, 162), 0.83), ('paint-yellow', (207, 163, 82), 0.79),
        ('hedge', (113, 138, 59), 0.9), ('outdoor-steel', (71, 77, 75), 0.62),
        ('stainless', (154, 161, 159), 0.39),
    ):
        mesh.material(name, rgb, roughness, double=name in ('blue-rail', 'cream', 'frame', 'door'),
                      solid=name not in ('brickline', 'paint-yellow'))
    for name, color in (('glass-dusk', (57, 79, 92)), ('glass-light', (87, 110, 124)),
                        ('glass-deep', (41, 57, 66)), ('glass-ribbon', (130, 148, 157))):
        mesh.material(name, (255, 255, 255), 0.25, texture=window_reflection(color), double=True)
    mesh.material('glass-clear', (133, 164, 171), 0.17, metallic=0.16, double=True, opacity=.33)
    mesh.material('clock-face', (255, 255, 255), 0.71, texture=clock_texture(), solid=False)
    mesh.material('school-name', (255, 255, 255), 0.63, texture=school_sign(), solid=False)


def slab(mesh, polygon, low, high, side, top=None, bottom=None):
    """Triangulate a horizontal polygon with interior courtyards."""
    import mapbox_earcut

    if polygon.is_empty or polygon.area < 1e-8:
        return
    if polygon.geom_type != 'Polygon':
        for piece in polygon.geoms:
            slab(mesh, piece, low, high, side, top, bottom)
        return
    polygon = orient(polygon, sign=1)
    rings = [list(ring.coords)[:-1] for ring in [polygon.exterior, *polygon.interiors]]
    points = np.array([p for ring in rings for p in ring], dtype=np.float64)
    ends = np.cumsum([len(ring) for ring in rings], dtype=np.uint32)
    triangles = mapbox_earcut.triangulate_float64(points, ends).reshape(-1, 3)
    for a, b, c in triangles:
        mesh.face(top or side, [(points[n, 0], high, points[n, 1]) for n in (a, c, b)])
        if high > low:
            mesh.face(bottom or side, [(points[n, 0], low, points[n, 1]) for n in (a, b, c)])
    if high > low:
        for ring in rings:
            for (x, z), (X, Z) in zip(ring, ring[1:] + ring[:1]):
                mesh.face(side, [(x, low, z), (x, high, z), (X, high, Z), (X, low, Z)])


def line_rect(mesh, mat, a, b, y, height, inset=0, uv=None):
    x, z = a
    X, Z = b
    length = math.hypot(X - x, Z - z)
    nx, nz = -(Z - z) / length * inset, (X - x) / length * inset
    mesh.face(mat, [(x + nx, y, z + nz), (x + nx, y + height, z + nz),
                    (X + nx, y + height, Z + nz), (X + nx, y, Z + nz)], uv=uv)


def position(a, b, fraction, inset=0):
    dx, dz = b[0] - a[0], b[1] - a[1]
    length = math.hypot(dx, dz)
    return a[0] + dx * fraction - dz / length * inset, a[1] + dz * fraction + dx / length * inset


def window_opening(mesh, a, b, bottom, top, depth, glazing, divisions, solid_frame=False):
    """Cut a visible recess between the outer wall and the window assembly.

    A list of glazing materials splits the pane into equal lengths, one room each.
    """
    back_a, back_b = position(a, b, 0, depth), position(a, b, 1, depth)

    def vertex(p, y):
        return p[0], y, p[1]

    for y, reverse, material in ((bottom, False, 'sill'), (top, True, 'soffit')):
        face = [vertex(p, y) for p in (a, back_a, back_b, b)]
        mesh.face(material, face[::-1] if reverse else face)
    mesh.face('reveal', [vertex(a, bottom), vertex(a, top), vertex(back_a, top), vertex(back_a, bottom)])
    mesh.face('reveal', [vertex(b, top), vertex(b, bottom), vertex(back_b, bottom), vertex(back_b, top)])
    height = top - bottom
    panes = [glazing] if isinstance(glazing, str) else glazing
    for index, pane in enumerate(panes):
        line_rect(mesh, pane, position(back_a, back_b, index / len(panes)),
                  position(back_a, back_b, (index + 1) / len(panes)), bottom, height, uv=OUTWARD_UV)
    rail_a, rail_b = position(a, b, 0, depth - 0.023), position(a, b, 1, depth - 0.023)
    def frame(left, right, y, h):
        if solid_frame:
            mesh.strip('frame', left, right, 0.044, y, h)
        else:
            line_rect(mesh, 'frame', left, right, y, h)

    for y in (bottom, bottom + height * 0.72, top - 0.034):
        frame(rail_a, rail_b, y, 0.034)
    margin = min(0.020 / math.dist(a, b), 0.1 / divisions)
    for index in range(divisions + 1):
        t = index / divisions
        left = position(rail_a, rail_b, max(0, t - margin))
        right = position(rail_a, rail_b, min(1, t + margin))
        frame(left, right, bottom, height)


def panels(mesh, a, b, floor, count, inset, mode, seed, floor_height=4.02):
    rng = random.Random(seed)
    length = math.dist(a, b)
    height = min(3.95, floor_height)
    # Proportions come from the facade samples. The upper hall is a solid
    # volume, so its frames sit in front of the wall.
    spec = FACADES[mode]
    front = spec['front'] if 'front' in spec else inset - spec['front_behind_gallery']
    depth, low, divisions = spec['recess'], spec['sill_height'], spec['divisions']
    high = min(spec['head_height'], height - 0.2)
    ac = (spec.get('trim') or {}).get('ac')
    for bay in range(count):
        bay_a, bay_b = position(a, b, bay / count, front), position(a, b, (bay + 1) / count, front)
        if mode == 'corridor' and bay % 3 == 1:
            door_a = position(bay_a, bay_b, 0.19)
            door_b = position(bay_a, bay_b, min(0.19 + 0.96 * count / length, 0.68))
            line_rect(mesh, 'beige', bay_a, door_a, floor, floor_height)
            line_rect(mesh, 'beige', door_b, bay_b, floor, floor_height)
            line_rect(mesh, 'beige', door_a, door_b, floor + 2.24, floor_height - 2.24)
            window_opening(mesh, door_a, door_b, floor, floor + 2.24, depth, 'door', 1)
            continue
        edge = min((0.18 if mode == 'fins' else 0.42) * count / length, 0.24)
        # The entrance fins occur in groups separated by wider masonry piers.
        group_gap = 0.11 if mode == 'fins' else 0
        left = position(bay_a, bay_b, edge + (group_gap if bay % 5 == 0 else 0))
        right = position(bay_a, bay_b, 1 - edge - (group_gap if (bay + 1) % 5 == 0 else 0))
        glazing = rng.choice(spec['glazing'])
        material = spec.get('pier_material', 'beige')
        if mode != 'windows':
            line_rect(mesh, material, bay_a, bay_b, floor, low)
            line_rect(mesh, 'beige', bay_a, bay_b, floor + high, floor_height - high)
            line_rect(mesh, material, bay_a, left, floor + low, high - low)
            line_rect(mesh, 'beige', right, bay_b, floor + low, high - low)
        window_opening(mesh, left, right, floor + low, floor + high, depth, glazing, divisions)
        window_trim(mesh, spec, left, right, floor + low, floor + high)
        if ac and floor >= ac['from_floor'] * floor_height - .01 and rng.random() < ac['rate']:
            condenser(mesh, left, right, floor + low, rng)
        if mode == 'fins':
            mesh.strip('cream', bay_a, left, 0.20, floor + 0.18, height - 0.36)


def ribbon_windows(mesh, a, b, floor, floor_height=3.46, seed=0):
    spec = FACADES['ribbon']
    front = spec['front']
    length = math.dist(a, b)
    gap = min(0.085 / length, 0.18)
    left, right = position(a, b, gap, front), position(a, b, 1 - gap, front)
    low, high = spec['sill_height'], spec['head_height']
    line_rect(mesh, 'beige', a, b, floor, low, front)
    line_rect(mesh, 'beige', a, b, floor + high, floor_height - high, front)
    line_rect(mesh, 'beige', position(a, b, 0, front), left, floor + low, high - low)
    line_rect(mesh, 'beige', right, position(a, b, 1, front), floor + low, high - low)
    rng = random.Random(seed)
    rooms = [rng.choice(spec['glazing']) for _ in range(max(1, round(length / spec['bay_width'])))]
    window_opening(mesh, left, right, floor + low, floor + high, spec['recess'], rooms, max(1, round(length / 0.72)))
    window_trim(mesh, spec, left, right, floor + low, floor + high)


def corridor_rail(mesh, a, b, y):
    outside_a, outside_b = position(a, b, 0, 0.065), position(a, b, 1, 0.065)
    mesh.strip('beige', outside_a, outside_b, 0.14, y - 0.25, 0.51)
    mesh.strip('sill', outside_a, outside_b, 0.18, y + 0.26, 0.046)
    rail_a, rail_b = position(a, b, 0, 0.16), position(a, b, 1, 0.16)
    mesh.strip('blue-cap', rail_a, rail_b, 0.052, y + 0.994, 0.046)
    length = math.dist(a, b)
    spacing = max(1, round(length / 0.17))
    for index in range(1, spacing):
        t = index / spacing
        if index % 6 == 0:
            x, z = position(rail_a, rail_b, t)
            mesh.box('blue-rail', x, y + 0.30, z, 0.038, 0.70, 0.038)
        else:
            margin = 0.010 / length
            left = position(rail_a, rail_b, t - margin)
            right = position(rail_a, rail_b, t + margin)
            line_rect(mesh, 'blue-rail', left, right, y + 0.30, 0.70)


def entrance_wing(a, b):
    x, z = position(a, b, 0.5)
    return abs(a[0] - b[0]) < 1.5 and 36 < z < 64 and (-3.5 < x < -1.0 or 23.5 < x < 26.0)


def facade_type(ident, courtyard, a, b):
    x, z = position(a, b, 0.5)
    if ident == 1448555206:
        return 'corridor' if 57.5 < x < 81 and 40 < z < 61 else 'ribbon'
    if ident == 1448555203:
        return 'terracotta'
    if ident == 1448555207:
        return 'classroom'
    if courtyard or entrance_wing(a, b):
        return 'fins'
    # The older photos show the open arcade around the curved entrance ends,
    # along the road frontage and on the long elevations seen from the field.
    road_gallery = z > 64 and x < -2
    tower_gallery = 27 < x < 37 and 54 < z < 59
    field_gallery = -15 < x < -11 and -15 < z < 63
    if road_gallery or tower_gallery or field_gallery:
        return 'corridor'
    if z < -34 or (x < -20 and z < -15):
        return 'terracotta'
    return 'classroom'


def facade_recess(edges, depth):
    return unary_union([
        LineString((a, b)).buffer(depth, single_sided=True, join_style='mitre')
        for a, b in edges
    ])


def gallery_columns(mesh, a, b, y, floor_height, back_depth, arcade=False):
    length = math.dist(a, b)
    x_mid, z_mid = position(a, b, 0.5)
    curved_pier = (-5.8 < x_mid < -4.7 and 69 < z_mid < 71) or (28.6 < x_mid < 29.1 and 57 < z_mid < 59)
    if length < 2.7 and not curved_pier:
        return
    count = max(1, round(length / (4.6 if arcade else 5.5)))
    width, depth = (0.66, 0.72) if arcade else (0.48, 0.57)
    inset = 0.47 if arcade else 0.33
    angle = math.atan2(b[1] - a[1], b[0] - a[0])
    for bay in range(count):
        t = 0.5 if curved_pier else (bay + 0.16) / count
        x, z = position(a, b, t, inset)
        height = floor_height - 0.27
        mesh.box('terra' if arcade else 'beige', x, y, z, width, height, depth, angle)
        # Short cross-beams reveal the depth of the covered walk behind the pier.
        mesh.strip('soffit', (x, z), position(a, b, t, back_depth), 0.39, y + height - 0.20, 0.20)


def ground_arcade(mesh, a, b, floor_height):
    beam_a, beam_b = position(a, b, 0, 0.32), position(a, b, 1, 0.32)
    mesh.strip('beige', beam_a, beam_b, 0.63, floor_height - 0.50, 0.25)
    gallery_columns(mesh, a, b, 0, floor_height, 3.24, arcade=True)


def branch(mesh, a, b, radius_a, radius_b, material='bark', sides=7, texture_period=None):
    axis = np.array(b) - a
    length = np.linalg.norm(axis)
    axis = axis / length
    tangent = np.cross(axis, (0, 0, 1) if abs(axis[2]) < .85 else (1, 0, 0))
    tangent = tangent / np.linalg.norm(tangent)
    bitangent = np.cross(axis, tangent)
    rings = []
    for center, radius in ((a, radius_a), (b, radius_b)):
        rings.append([tuple(center + radius*(tangent*math.cos(i*math.tau/sides) +
                                              bitangent*math.sin(i*math.tau/sides)))
                      for i in range(sides)])
    lower, upper = rings
    for i in range(sides):
        j = (i + 1) % sides
        uv = None
        if texture_period is not None:
            width = math.tau * (radius_a + radius_b) / (2 * sides * texture_period)
            height = length / texture_period
            uv = [(i * width, height), ((i + 1) * width, height), ((i + 1) * width, 0), (i * width, 0)]
        mesh.face(material, (lower[i], lower[j], upper[j], upper[i]), uv=uv)
    mesh.face(material, upper)
    mesh.face(material, lower[::-1])


def roof_terraces(mesh, polygon, ident, height, clear=None):
    # The newer overhead image shows paved terraces between the planting beds.
    # These approximate planting locations sit inside the mapped roof outlines.
    y = height + 0.054
    if ident == 19808442:
        hardscape = [(-24, -40, 32, -14), (-50, 25, -32, 38), (18, 36, 36, 60)]
        beds = [
            ([(-78, 66.8), (-72, 66.4), (-64, 68.5), (-54, 66.5)], 1.78),
            ([(-50, 67.1), (-41, 68.4), (-30, 66.8), (-19, 67.4)], 1.77),
            ([(-15, 67), (-10.3, 66.8), (-8.2, 61.6), (-9.0, 52), (-8.4, 40.8)], 1.93),
            ([(-39, 30.4), (-31, 32.1), (-20, 30.0), (-10, 30.9)], 2.18),
            ([(-2.3, 29.6), (5, 30.9), (13, 30.4), (21, 29.1)], 1.75),
            ([(-7.4, 22.4), (-7.5, 11.5), (-8.3, 2.1), (-7.5, -10.1)], 1.83),
            ([(29.6, -16.3), (29.1, -9.2), (29.4, -0.1), (29.4, 12.4)], 1.65),
            ([(39.1, -25.0), (47.0, -24.9), (53.6, -22.9), (61, -25.5), (71.4, -24.4)], 2.20),
            ([(39.0, 9.3), (47.0, 10.8), (56.0, 9.4), (63.5, 11.1), (72.6, 9.8)], 1.87),
            ([(27.6, 41.3), (29.3, 44.6), (30.1, 51.8)], 1.53),
        ]
    elif ident == 1448555206:
        hardscape = [(75, 23, 93, 51), (44, 37, 61, 63), (79, 47, 92, 74)]
        beds = [
            ([(48, 66.6), (58, 65.0), (70, 67), (81.9, 66.0)], 2.4),
            ([(50.1, 43.2), (50.8, 50.5), (49.3, 57.5)], 1.7),
            ([(84.8, 62.9), (86.1, 56.6), (85.4, 48.9), (85.8, 42)], 1.32),
        ]
    elif ident == 1448555203:
        hardscape = [(79, -89, 88, -59)]
        beds = [
            ([(63.8, -83.6), (69.6, -83.2), (77.2, -83.1)], 1.3),
            ([(83.1, -79.2), (82.1, -72), (81.5, -66.7)], 1.15),
            ([(62.6, -64.5), (69.5, -64.2), (76.5, -64.2)], 1.35),
        ]
    else:
        hardscape = [(-51, 7, -13, 26)]
        beds = [([(-42, 14), (-35, 14.4), (-30, 13.7), (-23, 15)], 2.0)]

    setback = polygon.buffer(-0.72, join_style='mitre')
    if clear is not None:
        setback = setback.difference(clear)
    for bounds in hardscape:
        slab(mesh, setback.intersection(box(*bounds)), y + 0.021, y + 0.021, 'roof-weathered')

    rng = random.Random(ident)
    for points, width in beds:
        path = LineString(points)
        bed = setback.intersection(path.buffer(width, quad_segs=7, join_style='round'))
        edging = setback.intersection(path.buffer(width + 0.26, quad_segs=7, join_style='round'))
        slab(mesh, edging, y + 0.035, y + 0.079, 'curb', 'roof-path')
        slab(mesh, bed, y + 0.08, y + 0.115, 'curb', 'roof-planting')
        plantable = bed.buffer(-0.32)
        plant_count = max(1, int(path.length / 5.6))
        for index in range(plant_count):
            centre = path.interpolate((index + rng.uniform(0.27, 0.73)) / plant_count, normalized=True)
            x, z = centre.x + rng.uniform(-0.49, 0.49), centre.y + rng.uniform(-0.45, 0.45)
            if plantable.covers(Point(x, z)):
                street_tree(mesh, x, z, rng.uniform(0.8, 1.92), rng.randrange(100000), y + 0.114, distant=True)


def northern_hall(mesh, polygon, lower_roof, roof_top):
    # A separate higher volume is supported by the northern shadow observations.
    slab(mesh, polygon, lower_roof, roof_top, 'beige', 'roof-weathered')
    parapet = polygon.difference(polygon.buffer(-0.16, join_style='mitre'))
    parapet = parapet.difference(box(29.34, -18.25, 31.60, -17.70))
    slab(mesh, parapet, roof_top, roof_top + .52, 'beige', 'cream')
    parts = [polygon] if polygon.geom_type == 'Polygon' else polygon.geoms
    for part in parts:
        corners = list(orient(part, sign=1).exterior.coords)
        for edge, (a, b) in enumerate(zip(corners, corners[1:])):
            length = math.dist(a, b)
            if length >= 5.5:
                line_rect(mesh, 'cream', a, b, lower_roof + 0.24, 0.27, -0.016)
                panels(mesh, a, b, lower_roof + 1.55, max(2, round(length / 2.75)), -0.016, 'windows', 713 + edge)


def building(mesh, footprint, ident, floors, floor_height):
    from access import HALF_WIDTH, build_access, build_upper_roof_stair, building_access
    from classroom_campus import draw_roof_cores
    from connectors import CONNECTOR_AREA, build_connectors
    from interiors import (CLASSROOM_EXTERIOR_AREA, STAIR_VOID, WING_AREA, WING_NORTH, add_teaching_wing,
                           courtyard_edge, draw_classroom_exterior, facade_spans, interior_materials)

    poly = orient(Polygon(footprint[0], footprint[1:]).buffer(0), sign=1)
    core = poly.buffer(-1.30, join_style='mitre')
    total = floors * floor_height
    main_building = ident == 19808442
    facades = []
    for ring_no, ring in enumerate([poly.exterior, *poly.interiors]):
        points = list(ring.coords)
        for a, b in zip(points, points[1:]):
            mode = facade_type(ident, ring_no > 0, a, b)
            arcade = main_building and not ring_no and (mode == 'corridor' or entrance_wing(a, b))
            facades.append((ring_no, a, b, mode, arcade))

    access = building_access(ident, [(a, b) for _, a, b, _, _ in facades])
    classroom_edge = None
    classroom_span = None
    if main_building:
        classroom_edge = next((a, b) for ring, a, b, _, _ in facades
                              if not ring and min(a[0], b[0]) > 34 and max(a[0], b[0]) < 36
                              and min(a[1], b[1]) < WING_NORTH and max(a[1], b[1]) > 2.48)
        a, b = classroom_edge
        cuts = sorted((WING_NORTH, 2.48), key=lambda z: (z-a[1])/(b[1]-a[1]))
        classroom_span = tuple(position(a, b, (z-a[1])/(b[1]-a[1])) for z in cuts)
        draw_classroom_exterior(mesh, *classroom_span, floors, floor_height)
    interior = WING_AREA.union(CLASSROOM_EXTERIOR_AREA) if main_building else access.area
    upper_interior = interior.union(CONNECTOR_AREA) if main_building else interior
    stair_void = STAIR_VOID if main_building else access.stair_void
    indoor_floor = poly.intersection(interior)
    if not poly.buffer(.20).covers(stair_void):
        raise ValueError(f'Stairwell outside the footprint for {ident}')
    core = core.difference(interior)
    gallery_depth = 3.02 if main_building else 2.43
    gallery_recess = facade_recess([(a, b) for _, a, b, mode, _ in facades if mode == 'corridor'], gallery_depth)
    upper_core = core.difference(gallery_recess.union(upper_interior))
    if main_building:
        interior_materials(mesh, floors)
        entry_opening = box(-0.45, 25.2, 22.05, 37.8)
        arcade_recess = facade_recess([(a, b) for _, a, b, _, arcade in facades if arcade], 3.24)
        core_sections = (
            (core.difference(entry_opening.union(arcade_recess)), 0, floor_height),
            (upper_core.difference(entry_opening), floor_height, 4.8),
            (upper_core, 4.8, total),
        )
    elif not gallery_recess.is_empty:
        core_sections = ((core, 0, floor_height), (upper_core, floor_height, total))
    else:
        core_sections = ((core, 0, total),)
    for section, low, high in core_sections:
        slab(mesh, section, low, high, 'beige')
    slab(mesh, indoor_floor, 0.012, 0.012, 'teaching-floor')
    for floor in range(1, floors):
        y = floor * floor_height
        slab(mesh, poly.difference(upper_interior), y - 0.28, y, 'beige', 'roof', 'soffit')
        slab(mesh, poly.intersection(upper_interior).difference(stair_void),
             y - 0.28, y, 'beige', 'teaching-floor', 'teaching-ceiling')
    roof = poly.difference(stair_void)
    slab(mesh, roof, total - 0.55, total + 0.05, 'beige', 'roof', 'soffit')
    parapet = poly.difference(poly.buffer(-0.18, join_style='mitre'))
    slab(mesh, parapet, total + 0.05, total + 0.84, 'beige', 'cream')
    # A coping with a small overhang throws a shadow line along every roof edge.
    coping = poly.buffer(0.045, join_style='mitre').difference(poly.buffer(-0.225, join_style='mitre'))
    slab(mesh, coping, total + 0.84, total + 0.895, 'cream')

    if main_building:
        upper = poly.intersection(box(-30, -43, 79, -17.9))
        north_roof = 22.0
        northern_hall(mesh, upper, total + 0.045, north_roof)
        upper_cores = draw_roof_cores(mesh, upper, ident, north_roof)
        roof_terraces(mesh, upper, ident, north_roof - 0.054, upper_cores)
        lower_roof = poly.difference(upper)
        lower_cores = draw_roof_cores(mesh, lower_roof, ident, total + .05)
        clear = unary_union([stair_void.buffer(1.5), box(27.0, -19.0, 32.8, 3.2), lower_cores])
        roof_terraces(mesh, lower_roof, ident, total, clear)
        build_upper_roof_stair(mesh, total + .05, north_roof)
        build_connectors(mesh, floors, floor_height)
    else:
        roof_cores = draw_roof_cores(mesh, poly, ident, total + .05)
        clear = unary_union([stair_void.buffer(1.65), access.polygon(2.35, .50, 4.75, 3.6), roof_cores])
        roof_terraces(mesh, poly, ident, total, clear)
        build_access(mesh, access, floors, floor_height)

    for k, (ring_no, a, b, mode, arcade) in enumerate(facades):
        length = math.dist(a, b)
        middle_x, middle_z = position(a, b, 0.5)
        over_entry = main_building and -2.6 < middle_x < 25.6 and 25.1 < middle_z < 36.8 and length > 18
        opens_to_wing = main_building and ring_no and courtyard_edge(a, b)
        if opens_to_wing:
            add_teaching_wing(mesh, (a, b), floor_height, floors, classroom_span)
            spans = facade_spans(a, b)
        elif classroom_edge == (a, b):
            left, right = classroom_span
            spans = [(a, left, False), (right, b, False)]
        elif access is not None and access.edge == (a, b):
            left, right = access.point(-HALF_WIDTH, 0), access.point(HALF_WIDTH, 0)
            spans = [(a, left, False), (right, b, False)]
        else:
            spans = [(a, b, False)]
        for start, stop, indoor in spans:
            span = math.dist(start, stop)
            if indoor or span < .02:
                continue
            seed = ident + k * 117
            if mode == 'ribbon':
                line_rect(mesh, 'beige', start, stop, 0, floor_height, 0.12)
                for floor in range(1, floors):
                    ribbon_windows(mesh, start, stop, floor * floor_height, floor_height, seed + floor)
                if span > 2.2:
                    dress_span(mesh, mode, start, stop, max(1, round(span / FACADES[mode]['bay_width'])),
                               floors, floor_height, seed)
                continue
            if span > 2.2:
                # Piers, bands and pipes follow the bay rhythm of the upper floors.
                dress_span(mesh, mode, start, stop, max(1, round(span / FACADES[mode]['bay_width'])),
                           floors, floor_height, seed, ground_open=arcade or over_entry)
            for floor in range(floors):
                if floor == 0 and arcade:
                    ground_arcade(mesh, start, stop, floor_height)
                    continue
                if floor == 0 and over_entry:
                    continue
                y = floor * floor_height
                visible_mode = 'classroom' if floor == 0 and mode in ('fins', 'corridor') else mode
                inset = gallery_depth if visible_mode == 'corridor' else 0.12
                if span > 2.2:
                    count = max(1, round(span / FACADES[visible_mode]['bay_width']))
                    panels(mesh, start, stop, y, count, inset, visible_mode, ident + k * 117 + floor, floor_height)
                elif visible_mode == 'corridor':
                    line_rect(mesh, 'beige', start, stop, y, floor_height - 0.04, inset - 0.20)
                else:
                    line_rect(mesh, 'beige', start, stop, y, floor_height - 0.04, 0.12)
                if visible_mode == 'corridor':
                    corridor_rail(mesh, start, stop, y)
                    gallery_columns(mesh, start, stop, y, floor_height, gallery_depth)


def clock_tower(mesh, x, z):
    # Rounded cap, twin dials and open band below the clock are visible in the photos.
    mesh.prism('terra', rounded(x, z, 3.4, 2.85, 0.20), 0, 18.85)
    for offset in (-1.16, 1.16):
        mesh.box('terra', x, 18.85, z + offset, 3.4, 1.42, 0.53)
    mesh.prism('terra', rounded(x, z, 3.4, 2.85, 0.18), 20.27, 22.91)
    curve = [(x + 1.70 * math.cos(theta), 22.91 + 1.43 * math.sin(theta))
             for theta in (index * math.pi / 20 for index in range(21))]
    for a, b in zip(curve, curve[1:]):
        mesh.face('terra', [(x, 22.91, z + 1.42), (a[0], a[1], z + 1.42), (b[0], b[1], z + 1.42)])
        mesh.face('terra', [(x, 22.91, z - 1.42), (b[0], b[1], z - 1.42), (a[0], a[1], z - 1.42)])
        mesh.face('terra', [(a[0], a[1], z + 1.42), (a[0], a[1], z - 1.42),
                            (b[0], b[1], z - 1.42), (b[0], b[1], z + 1.42)])
    line_rect(mesh, 'clock-face', (x + 1.05, z + 1.45), (x - 1.05, z + 1.45), 20.57, 2.10, uv=OUTWARD_UV)
    line_rect(mesh, 'clock-face', (x - 1.73, z + 1.03), (x - 1.73, z - 1.03), 20.57, 2.10, uv=OUTWARD_UV)
    line_rect(mesh, 'glass-deep', (x + 0.56, z + 1.439), (x + 0.20, z + 1.439), 2.1, 15.9, uv=OUTWARD_UV)
    for h in range(4, 19, 3):
        line_rect(mesh, 'frame', (x + 0.56, z + 1.446), (x + 0.20, z + 1.446), h, 0.08)


def entrance(mesh):
    from entry_details import draw_entry_piers, draw_entry_steps, draw_entry_window

    # Placement is inferred from the 2018 gate photograph and 2023 design image.
    clock_tower(mesh, 31.2, 57.9)

    # Raised entry and a recessed glazed passage based on the photographed facade.
    facade_x, facade_z = 10.8, 37.0
    front = facade_z + 0.30
    outer_left, outer_right = facade_x - 10.65, facade_x + 10.65
    mesh.box('beige', facade_x, 4.80, facade_z - 0.62, 21.3, 13.80, 0.20)
    for x in (outer_left + 0.07, outer_right - 0.07):
        mesh.box('beige', x, 4.80, facade_z - 0.16, 0.14, 13.80, 0.92)
    mesh.box('cream', facade_x, 18.60, facade_z - 0.20, 21.41, 0.08, 1.12)
    for y, height in ((4.8, 0.66), (14.89, 3.71)):
        line_rect(mesh, 'beige', (outer_right, front), (outer_left, front), y, height)
    next_wall = outer_left
    for i in range(14):
        left = 1.35 + i * 1.40
        right = left + 0.66
        line_rect(mesh, 'beige', (left, front), (next_wall, front), 5.46, 9.43)
        draw_entry_window(mesh, left, right, front, i)
        next_wall = right
    line_rect(mesh, 'beige', (outer_right, front), (next_wall, front), 5.46, 9.43)
    mesh.box('beige', facade_x, 17.35, facade_z + 0.24, 9.0, 2.15, 0.62)
    line_rect(mesh, 'school-name', (15.15, 37.56), (6.45, 37.56), 17.37, 2.02, uv=OUTWARD_UV)
    draw_entry_piers(mesh, facade_x, front, (1.1, 6.2, 15.35, 20.5))
    draw_entry_steps(mesh)

    for x in (2.38, 19.12):
        start_z, stop_z = 53.45, 50.45
        branch(mesh, (x, 1.02, start_z), (x, 2.09, stop_z), .024, .024, 'stainless')
        branch(mesh, (x, 2.09, stop_z), (x, 2.09, 49.71), .024, .024, 'stainless')
        branch(mesh, (x, .23, start_z), (x, 1.30, stop_z), .017, .017, 'stainless')
        branch(mesh, (x, 1.30, stop_z), (x, 1.30, 49.71), .017, .017, 'stainless')
        for index in range(1, 23):
            z = start_z - index * .16
            top = min(2.09, 1.02 + (start_z - z) * (2.09 - 1.02) / (start_z - stop_z))
            mesh.box('stainless', x, top - .79, z, .017, .79, .017)
        for z in (start_z, 52.5, 51.5, stop_z, 49.71):
            step = min(8, int((53.6-z)/.42) + 1)
            ground = step*.145
            top = min(2.09, 1.02 + (start_z-z)*(2.09-1.02)/(start_z-stop_z))
            mesh.cylinder('stainless', x, ground, z, .021, top-ground, 7)
            mesh.cylinder('stainless', x, ground, z, .047, .019, 8)
    mesh.box('plaza', 10.75, 0, 35.9, 17.1, 1.16, 8.8)
    mesh.face('plaza', [(2.2, -0.03, 24.2), (2.2, 1.16, 31.5), (19.3, 1.16, 31.5), (19.3, -0.03, 24.2)])
