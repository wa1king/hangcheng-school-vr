"""Photo-referenced campus exteriors. Floor heights and openings are estimates."""

import math
import random
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import LineString, Point, Polygon, box
from shapely.geometry.polygon import orient

from mesh import rect, rounded


def tile(color, seed, grout=None, pattern='grain'):
    rng = np.random.default_rng(seed)
    large = Image.fromarray(rng.integers(95, 161, (16, 16), dtype=np.uint8)).resize((256, 256), Image.Resampling.BICUBIC)
    cloud = (np.asarray(large, dtype=float) - 128)[:, :, None]
    variation = 0.17 if pattern == 'paving' else 0.30
    pixels = np.array(color) + cloud * variation + rng.normal(0, 2.8, (256, 256, 1))
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
            reflected_sky = 0.78 + 0.37 * (1 - y / 127)
            glint = max(0, 1 - abs(x / 96 + y / 210 - 0.49) * 9) * 0.085
            pixels[x, y] = tuple(round(min(255, channel * (reflected_sky + glint))) for channel in color)
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
    }
    for name, texture in textures.items():
        mesh.material(name, (255, 255, 255), texture=texture)
    for name, rgb, roughness in (
        ('cream', (210, 199, 175), 0.84), ('soffit', (166, 156, 135), 0.9),
        ('blue-rail', (75, 102, 119), 0.56), ('blue-cap', (110, 134, 147), 0.54),
        ('door', (122, 129, 120), 0.63),
        ('frame', (103, 110, 108), 0.6), ('brickline', (152, 110, 98), 0.88),
        ('curb', (176, 173, 162), 0.83), ('paint-yellow', (207, 163, 82), 0.79),
        ('trunk', (99, 82, 65), 0.93), ('leaf0', (56, 88, 48), 0.87),
        ('leaf1', (70, 106, 56), 0.87), ('leaf2', (91, 125, 58), 0.87),
        ('leaf3', (103, 135, 68), 0.87), ('hedge', (113, 138, 59), 0.9),
    ):
        mesh.material(name, rgb, roughness)
    for name, color in (('glass-dusk', (57, 79, 92)), ('glass-light', (87, 110, 124)),
                        ('glass-deep', (41, 57, 66)), ('glass-ribbon', (130, 148, 157))):
        mesh.material(name, (255, 255, 255), 0.25, texture=window_reflection(color))
    mesh.material('clock-face', (255, 255, 255), 0.71, texture=clock_texture())
    mesh.material('school-name', (255, 255, 255), 0.63, texture=school_sign())


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


def panels(mesh, a, b, floor, count, inset, mode, seed):
    rng = random.Random(seed)
    end = math.dist(a, b)
    for bay in range(count):
        start = bay / count
        stop = (bay + 1) / count
        margin = 0.21 / end if mode == 'fins' else 0.5 / end
        left, right = position(a, b, start + margin, inset - 0.045), position(a, b, stop - margin, inset - 0.045)
        glazing = rng.choice(('glass-dusk', 'glass-dusk', 'glass-light', 'glass-deep'))
        if mode == 'fins':
            line_rect(mesh, 'frame', left, right, floor + 0.34, 2.68)
            line_rect(mesh, glazing, position(left, right, 0.07), position(left, right, 0.93), floor + 0.43, 2.49, -0.025, OUTWARD_UV)
            line_rect(mesh, 'frame', left, right, floor + 2.24, 0.035, -0.04)
        else:
            line_rect(mesh, 'frame', left, right, floor + 0.92, 1.79)
            inner_left, inner_right = position(left, right, 0.04), position(left, right, 0.96)
            line_rect(mesh, glazing, inner_left, inner_right, floor + 1, 1.62, -0.026, OUTWARD_UV)
            line_rect(mesh, 'frame', left, right, floor + 2.25, 0.041, -0.04)
            if mode == 'terracotta':
                p = position(a, b, start + 0.02 / end)
                q = position(a, b, start + 0.48 / end)
                line_rect(mesh, 'terra', p, q, floor - 0.20, 3.87, -0.035)
                line_rect(mesh, 'terra', left, right, floor - 0.10, 0.66, -0.035)
            for divider in (0.34, 0.67):
                p, q = position(left, right, divider - 0.01), position(left, right, divider + 0.01)
                line_rect(mesh, 'frame', p, q, floor + 0.92, 1.77, -0.042)
            if mode == 'corridor' and bay % 3 == 1:
                d0, d1 = position(a, b, start + 0.09 / count, inset - 0.07), position(a, b, start + 0.29 / count, inset - 0.07)
                line_rect(mesh, 'door', d0, d1, floor + 0.03, 2.19, -0.021)


def ribbon_windows(mesh, a, b, floor, index):
    length = math.dist(a, b)
    frame_a = position(a, b, min(0.10 / length, 0.15), 0.095)
    frame_b = position(a, b, max(1 - 0.10 / length, 0.85), 0.095)
    line_rect(mesh, 'frame', frame_a, frame_b, floor + 0.78, 1.88)
    glass_a = position(a, b, min(0.16 / length, 0.21), 0.068)
    glass_b = position(a, b, max(1 - 0.16 / length, 0.79), 0.068)
    line_rect(mesh, 'glass-ribbon', glass_a, glass_b, floor + 0.84, 1.74, uv=OUTWARD_UV)
    if length > 1.1:
        line_rect(mesh, 'frame', glass_a, glass_b, floor + 2.19, 0.040, -0.019)
        count = round(length / 0.65)
        for bay in range(1, count):
            t = bay / count
            left = position(a, b, t - 0.018 / length, 0.041)
            right = position(a, b, t + 0.018 / length, 0.041)
            line_rect(mesh, 'frame', left, right, floor + 0.78, 1.88)
            if (bay + index) % 7 == 0:
                left = position(a, b, t - 0.085 / length, 0.028)
                right = position(a, b, t + 0.085 / length, 0.028)
                line_rect(mesh, 'beige', left, right, floor + 0.75, 1.95)


def foliage(mesh, x, z, height, seed, y=0):
    rng = random.Random(seed)
    crown = height * rng.uniform(0.39, 0.53)
    mesh.cylinder('trunk', x, y, z, height * 0.025, height * 0.76, 7)
    for cluster in range(8):
        angle = cluster * math.tau / 7 + rng.uniform(-0.15, 0.15)
        offset = 0 if cluster == 7 else crown * rng.uniform(0.36, 0.72)
        cx, cz = x + offset * math.cos(angle), z + offset * math.sin(angle)
        cy = y + height * (0.71 if cluster == 7 else rng.uniform(0.52, 0.72))
        radius = crown * rng.uniform(0.42, 0.77)
        levels = []
        for h, scale in ((-0.53, 0.36), (-0.22, 0.8), (0.13, 1.0), (0.51, 0.69), (0.82, 0.17)):
            levels.append([(cx + radius * scale * rng.uniform(0.82, 1.14) * math.cos(i * math.tau / 8), cy + radius * h,
                            cz + radius * scale * rng.uniform(0.82, 1.14) * math.sin(i * math.tau / 8)) for i in range(8)])
        for level, (lower, upper) in enumerate(zip(levels, levels[1:])):
            for i in range(8):
                j = (i + 1) % 8
                mesh.face(f'leaf{rng.choices(range(4), weights=(4-level, 4, 2+level, level+1))[0]}', (lower[i], upper[i], upper[j], lower[j]))
        mesh.face('leaf3', list(reversed(levels[-1])))


def roof_terraces(mesh, polygon, ident, height):
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
                foliage(mesh, x, z, rng.uniform(0.8, 1.92), rng.randrange(100000), y + 0.114)


def northern_hall(mesh, collision, polygon, lower_roof, roof_top):
    # A separate higher volume is supported by the northern shadow observations.
    slab(mesh, polygon, lower_roof, roof_top, 'beige', 'roof-weathered')
    slab(collision, polygon, lower_roof, roof_top, 'collider')
    parts = [polygon] if polygon.geom_type == 'Polygon' else polygon.geoms
    for part in parts:
        corners = list(orient(part, sign=1).exterior.coords)
        for edge, (a, b) in enumerate(zip(corners, corners[1:])):
            length = math.dist(a, b)
            line_rect(mesh, 'beige', a, b, roof_top - 0.06, 0.51)
            line_rect(mesh, 'cream', a, b, roof_top + 0.40, 0.11, -0.016)
            if length >= 5.5:
                line_rect(mesh, 'cream', a, b, lower_roof + 0.24, 0.27, -0.016)
                panels(mesh, a, b, lower_roof + 1.55, max(2, round(length / 2.75)), -0.016, 'windows', 713 + edge)


def building(mesh, collision, footprint, ident, floors, floor_height):
    poly = orient(Polygon(footprint[0], footprint[1:]).buffer(0), sign=1)
    core = poly.buffer(-1.30, join_style='mitre')
    total = floors * floor_height
    cores = [core] if core.geom_type == 'Polygon' else list(core.geoms)
    entry_opening = box(-0.45, 25.2, 22.05, 37.8) if ident == 19808442 else None
    for piece in cores:
        if entry_opening is None:
            slab(mesh, piece, 0, total, 'beige')
            slab(collision, piece, 0, total, 'collider')
        else:
            slab(mesh, piece, 4.8, total, 'beige')
            slab(collision, piece, 4.8, total, 'collider')
            lower = piece.difference(entry_opening)
            for section in [lower] if lower.geom_type == 'Polygon' else lower.geoms:
                slab(mesh, section, 0, 4.8, 'beige')
                slab(collision, section, 0, 4.8, 'collider')
    for floor in range(1, floors):
        slab(mesh, poly, floor * floor_height - 0.28, floor * floor_height, 'beige', 'roof', 'soffit')
    slab(mesh, poly, total - 0.55, total + 0.05, 'beige', 'roof', 'soffit')

    if ident == 19808442:
        upper = poly.intersection(box(-30, -43, 79, -17.9))
        north_roof = 22.0
        northern_hall(mesh, collision, upper, total + 0.045, north_roof)
        roof_terraces(mesh, upper, ident, north_roof - 0.054)
        roof_terraces(mesh, poly.difference(upper), ident, total)
    else:
        roof_terraces(mesh, poly, ident, total)

    for ring_no, ring in enumerate([poly.exterior, *poly.interiors]):
        points = list(ring.coords)
        for k, (a, b) in enumerate(zip(points, points[1:])):
            length = math.dist(a, b)
            middle_x, middle_z = position(a, b, 0.5)
            line_rect(mesh, 'beige', a, b, total - 0.08, 0.89)
            line_rect(mesh, 'cream', a, b, total + 0.72, 0.12, -0.014)
            if ident == 1448555206 and (middle_z > 65.5 or middle_x > 88.2):
                line_rect(mesh, 'beige', a, b, 0, total - 0.07, 0.12)
                for floor in range(1, floors):
                    ribbon_windows(mesh, a, b, floor * floor_height, k)
                continue
            if length < 1.35:
                for floor in range(1, floors):
                    y = floor * floor_height
                    line_rect(mesh, 'beige', a, b, y - 0.25, 0.63)
                    line_rect(mesh, 'blue-rail', a, b, y + 0.38, 0.62, 0.018)
                continue
            mode = 'corridor'
            if ident == 1448555203 or (ident == 19808442 and middle_z < -34):
                mode = 'terracotta'
            elif ident == 1448555207 or (ident == 19808442 and (ring_no or (abs(a[0]-b[0]) < 2.5 and 33 < middle_z < 61))):
                mode = 'fins'
            count = max(1, round(length / (1.25 if mode == 'fins' else 3.45)))
            over_entry = entry_opening is not None and -2.6 < middle_x < 25.6 and 25.1 < middle_z < 36.8 and length > 18
            if mode != 'corridor':
                base = 4.8 if over_entry else 0
                line_rect(mesh, 'beige', a, b, base, total - 0.07 - base, 0.12)
            for floor in range(floors):
                y = floor * floor_height
                if length > 2.2 and (not over_entry or floor > 0):
                    panels(mesh, a, b, y, count, 1.30 if mode == 'corridor' else 0.12, mode, ident + k * 117 + floor)
                if mode == 'corridor' and floor > 0:
                    line_rect(mesh, 'beige', a, b, y - 0.19, 0.55, 0.014)
                    line_rect(mesh, 'blue-cap', a, b, y + 0.98, 0.052, 0.015)
                    for j in range(1, max(1, int(length / 0.19))):
                        fraction = j / max(1, int(length / 0.19))
                        left = position(a, b, fraction - 0.021 / length, 0.022)
                        right = position(a, b, fraction + 0.021 / length, 0.022)
                        line_rect(mesh, 'blue-rail', left, right, y + 0.34, 0.66)
            if mode == 'corridor' and length > 2.8:
                for bay in range(count):
                    cx, cz = position(a, b, (bay + 0.20) / count, 0.42)
                    if not over_entry:
                        mesh.box('terra' if ident == 19808442 else 'beige', cx, 0, cz, 0.47, floor_height - 0.18, 0.58)
                    for floor in range(1, floors):
                        mesh.box('beige', cx, floor * floor_height, cz, 0.36, floor_height - 0.21, 0.42)


def clock_tower(mesh, collision, x, z):
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
    collision.box('collider', x, 0, z, 3.45, 24, 2.85)
    line_rect(mesh, 'clock-face', (x + 1.05, z + 1.45), (x - 1.05, z + 1.45), 20.57, 2.10, uv=OUTWARD_UV)
    line_rect(mesh, 'clock-face', (x - 1.73, z + 1.03), (x - 1.73, z - 1.03), 20.57, 2.10, uv=OUTWARD_UV)
    line_rect(mesh, 'glass-deep', (x + 0.56, z + 1.439), (x + 0.20, z + 1.439), 2.1, 15.9, uv=OUTWARD_UV)
    for h in range(4, 19, 3):
        line_rect(mesh, 'frame', (x + 0.56, z + 1.446), (x + 0.20, z + 1.446), h, 0.08)


def entrance(mesh, collision):
    # Placement is inferred from the 2018 gate photograph and 2023 design image.
    clock_tower(mesh, collision, 31.2, 57.9)

    # Raised entry and a recessed glazed passage based on the photographed facade.
    facade_x, facade_z = 10.8, 37.0
    mesh.box('beige', facade_x, 4.80, facade_z, 21.3, 13.80, 0.60)
    for i in range(14):
        left = 1.35 + i * 1.40
        outer_a, outer_b = (left + 0.62, 37.31), (left, 37.31)
        line_rect(mesh, 'frame', outer_a, outer_b, 5.41, 9.50)
        glass = 'glass-light' if i % 4 == 1 else 'glass-deep'
        line_rect(mesh, glass, (left + 0.55, 37.333), (left + 0.07, 37.333), 5.53, 9.27, uv=OUTWARD_UV)
        for elevation in (7.2, 9.53, 12.83):
            line_rect(mesh, 'frame', (left + 0.57, 37.35), (left + 0.05, 37.35), elevation, 0.052)
    mesh.box('beige', facade_x, 17.35, facade_z + 0.24, 9.0, 2.15, 0.62)
    line_rect(mesh, 'school-name', (15.15, 37.56), (6.45, 37.56), 17.37, 2.02, uv=OUTWARD_UV)
    for cx in (1.1, 6.2, 15.35, 20.5):
        mesh.box('cream', cx, 0, 37.8, 0.77, 4.84, 0.78)
        collision.box('collider', cx, 0, 37.8, 0.77, 4.84, 0.78)
    for step in range(8):
        start_z, finish_z = 53.6 - step * 0.42, 40.3
        top = (step + 1) * 0.145
        mesh.box('plaza', 10.75, 0, (start_z + finish_z) / 2, 17.1, top, start_z - finish_z)
        collision.box('collider', 10.75, 0, (start_z + finish_z) / 2, 17.1, top, start_z - finish_z)
        mesh.strip('brickline', (2.24, start_z - 0.035), (19.26, start_z - 0.035), 0.055, top + 0.002)
    for target, mat in ((mesh, 'plaza'), (collision, 'collider')):
        target.box(mat, 10.75, 0, 35.9, 17.1, 1.16, 8.8)
        target.face(mat, [(2.2, 0, 24.2), (2.2, 1.16, 31.5), (19.3, 1.16, 31.5), (19.3, 0, 24.2)])
