"""Exterior-only neighborhood shells on mapped footprints."""

import math
import random
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw
from shapely.geometry import Polygon
from shapely.geometry.polygon import orient

from mesh import rect
from neighborhood_park import add_culture_terraces, add_neighborhood_park


GROUND = -.27
ATLAS_COLUMNS, ATLAS_ROWS = 4, 6
BAY_WIDTH, BAY_HEIGHT = 104, 76
SCANS = Path(__file__).with_name('material_scans')

# Floor counts marked by OSM for Shenghe Tianchen and the cultural center design
# are kept. The remaining counts reproduce the relative heights in aerial views.
BUILDINGS = {
    'silver': {
        1436064174: 28, 1436064175: 28, 1436064176: 28,
        1436064170: 28, 1436064173: 28, 1436064172: 28, 1436064171: 28,
        1436064177: 26, 1436064178: 26, 1436064179: 26,
        1436064161: 27, 1436064162: 28,
        1436064163: 31, 1436064166: 31, 1436064167: 31, 1436064164: 32,
    },
    'warm': {
        1436051946: 30, 1436051947: 25, 1436051948: 29,
        1436051950: 19, 1436051951: 27, 1436051954: 24,
        1436051966: 30, 1436051967: 31, 1436051968: 30,
    },
    'glass': {
        1436064420: 28, 1436064421: 28, 1436064422: 28, 1436064423: 28,
        1454566183: 9, 1454566184: 7, 1454566185: 5,
    },
}
PARCELS = (570036545, 570036585, 1436064159, 1436064160, 1436064424, 1464072198)


def shift(rgb, amount):
    return tuple(min(255, max(0, value + amount)) for value in rgb)


def jpeg(image, quality=84):
    output = BytesIO()
    image.save(output, 'JPEG', quality=quality, optimize=True)
    return output.getvalue(), 'image/jpeg'


def facade_texture(seed, cladding, window, style):
    rng = random.Random(seed)
    width = ATLAS_COLUMNS * BAY_WIDTH
    height = ATLAS_ROWS * BAY_HEIGHT
    with Image.open(SCANS / 'plaster-color.jpg') as scan:
        grain = scan.convert('L').resize((width, height), Image.Resampling.LANCZOS)
    image = Image.merge('RGB', tuple(grain.point(lambda pixel: channel + (pixel - 135) * .22)
                                     for channel in cladding))
    draw = ImageDraw.Draw(image)

    for floor in range(ATLAS_ROWS):
        for bay in range(ATLAS_COLUMNS):
            x, y = bay * BAY_WIDTH, floor * BAY_HEIGHT
            frame = shift(cladding, rng.randint(-22, -12))
            glass = shift(window, rng.randint(-15, 15))
            if style == 'apartment' and bay == 2:
                # A continuous service bay breaks up long residential elevations.
                draw.rectangle((x + 16, y, x + 90, y + 75), fill=shift(cladding, -28))
                draw.rectangle((x + 30, y + 8, x + 72, y + 62), fill=shift(frame, -31))
                draw.rectangle((x + 35, y + 12, x + 67, y + 59), fill=shift(glass, -7))
                for rail in (x + 35, x + 51, x + 67):
                    draw.line((rail, y + 12, rail, y + 59), fill=shift(frame, -22), width=2)
                draw.rectangle((x + 16, y + 62, x + 90, y + 66), fill=shift(cladding, -8))
                continue
            # Dark reveals and thin slab edges read from the campus without modeled window units.
            inset = (11, 16, 18, 14)[bay] if style != 'podium' else 8
            sill = 60 if style != 'podium' else 72
            draw.rectangle((x + inset - 4, y + 7, x + 102 - inset, y + sill),
                           fill=shift(frame, -15))
            draw.rectangle((x + inset, y + 11, x + 98 - inset, y + sill - 2), fill=shift(glass, -26))

            for line in range(13, sill - 4):
                sky = round(20 * (sill - line) / sill)
                draw.line((x + inset + 1, y + line, x + 97 - inset, y + line),
                          fill=shift(glass, sky))
            mullion = x + (42, 50, 62, 53)[bay]
            draw.line((mullion, y + 11, mullion, y + sill - 3), fill=shift(frame, -33), width=3)
            draw.line((x + inset, y + 17, x + 98 - inset, y + 17), fill=shift(frame, -22), width=2)

            if style == 'apartment':
                # Interior blinds and parapets are baked into the facade atlas.
                if rng.random() < .42:
                    left = x + inset + 2 if bay % 2 else mullion + 2
                    right = mullion - 2 if bay % 2 else x + 95 - inset
                    if left < right:
                        draw.rectangle((left, y + 19, right, y + 46), fill=shift(glass, rng.randint(23, 47)))
                        for crease in range(left + 4, right, 6):
                            draw.line((crease, y + 19, crease, y + 46), fill=shift(glass, 18))
                draw.rectangle((x + inset - 5, y + 47, x + 103 - inset, y + 56), fill=shift(glass, 21))
                for rail in range(x + inset - 4, x + 103 - inset, 11):
                    draw.line((rail, y + 47, rail, y + 55), fill=shift(frame, -26))
                draw.line((x + inset - 5, y + 46, x + 103 - inset, y + 46), fill=shift(frame, 5), width=2)
                draw.rectangle((x + inset - 6, y + 57, x + 104 - inset, y + 62), fill=shift(cladding, 5))
                draw.line((x + inset - 6, y + 63, x + 104 - inset, y + 63), fill=shift(frame, -18), width=2)
                if (floor + bay) % 3 == 1:
                    draw.rectangle((x + 3, y + 50, x + inset - 6, y + 59), fill=shift(frame, 9))
            elif style == 'podium':
                draw.rectangle((x + 5, y + 2, x + 99, y + 10), fill=shift(frame, -31))
                draw.line((x + inset, y + 31, x + 98 - inset, y + 31), fill=shift(frame, -26), width=2)
            else:
                draw.line((x + inset - 2, y + 45, x + 100 - inset, y + 45),
                          fill=shift(frame, -10), width=2)

            draw.line((x, y + 1, x + 103, y + 1), fill=shift(cladding, 12), width=2)
            draw.line((x, y + 68, x + 103, y + 68), fill=shift(frame, 2), width=2)
            draw.line((x + 2, y + 3, x + 2, y + 67), fill=shift(cladding, -8))
    return jpeg(image)


def register_materials(mesh):
    for name, seed, wall, glass, style in (
        ('silver', 303, (189, 190, 184), (56, 76, 90), 'apartment'),
        ('warm', 111, (185, 168, 151), (64, 75, 81), 'apartment'),
        ('glass', 65, (174, 181, 181), (58, 80, 96), 'office'),
        ('podium', 97, (158, 157, 147), (52, 69, 76), 'podium'),
    ):
        mesh.material(f'context-{name}', (255, 255, 255), .94,
                      texture=facade_texture(seed, wall, glass, style))
    with Image.open(SCANS / 'school-grass.jpg') as source:
        grass = jpeg(source.convert('RGB').resize((256, 256), Image.Resampling.LANCZOS))
    mesh.material('context-landscape', (184, 202, 165), .96, texture=grass)
    mesh.material('context-ground', (121, 130, 103), 1)
    mesh.material('context-roof', (158, 164, 159), .95)
    mesh.material('context-wall', (171, 171, 159), .94)
    mesh.material('context-paving', (152, 150, 137), .96)
    mesh.material('context-coping', (201, 199, 188), .96)
    return grass


def wall_band(mesh, a, b, bottom, top, material, bays, floors, offset):
    if math.dist(a, b) < 1.7:
        material = 'context-wall'
    u0 = offset / ATLAS_COLUMNS
    u1 = u0 + bays / ATLAS_COLUMNS
    v = floors / ATLAS_ROWS
    mesh.face(material, [(a[0], bottom, a[1]), (a[0], top, a[1]),
                         (b[0], top, b[1]), (b[0], bottom, b[1])],
              uv=[(u0, v), (u0, 0), (u1, 0), (u1, v)])


def shell(mesh, outline, height, floors, family, seed, equipment=True):
    polygon = orient(Polygon(outline).simplify(.13, preserve_topology=True), sign=1)
    ring = list(polygon.exterior.coords)
    roof = GROUND + height
    podium = GROUND + min(height / floors, 4.5) if floors > 1 else roof
    mesh.surface('context-roof', ring, roof)
    mesh.surface('context-paving', polygon.buffer(1.3, join_style='mitre').exterior.coords, GROUND + .10)
    for index, (a, b) in enumerate(zip(ring, ring[1:])):
        span = math.dist(a, b)
        offset = (index + seed) % ATLAS_COLUMNS
        wall_band(mesh, a, b, GROUND, podium, 'context-podium',
                  max(1, round(span / 4.25)), 1, offset)
        if floors > 1:
            wall_band(mesh, a, b, podium, roof, f'context-{family}',
                      max(1, round(span / (3.15 if family != 'glass' else 2.85))), floors - 1, offset)
        mesh.strip('context-coping', a, b, .25, roof, .82)
        if span > 9 and floors > 10:
            # Tall service-wall accents are real profile breaks, roof gear stays low-poly.
            tx, tz = (b[0] - a[0]) / span, (b[1] - a[1]) / span
            for t in (.14, .86):
                x, z = a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])
                mesh.box('context-coping', x + tz * .10, podium, z - tx * .10,
                         .38, roof - podium, .40, math.atan2(tz, tx))

    if floors < 2 or not equipment:
        return
    interior = polygon.buffer(-1.65)
    if interior.is_empty:
        return
    core = interior.representative_point()
    x, z = core.coords[0]
    rectangle = list(polygon.minimum_rotated_rectangle.exterior.coords)
    a, b = max(zip(rectangle, rectangle[1:]), key=lambda edge: math.dist(*edge))
    angle = math.atan2(b[1] - a[1], b[0] - a[0])
    room_width, room_depth = (5.7, 4.1) if floors >= 15 else (4.5, 2.8)
    clearance = interior.boundary.distance(core) * .9
    size = min(1, clearance / math.hypot(room_width / 2, room_depth / 2))
    mesh.box('context-wall', x, roof, z, room_width * size, 2.4 if floors >= 15 else 1.6,
             room_depth * size, angle, top='context-coping')


def add_surroundings(mesh, polygons):
    grass = register_materials(mesh)
    # The outer ground continues below the existing school and road surfaces.
    mesh.surface('context-ground', rect(-9, 44, 1050, 770), GROUND - .07)
    for ident in PARCELS:
        mesh.surface('context-landscape', polygons[ident][0], GROUND + .016)
    for family, buildings in BUILDINGS.items():
        for ident, floors in buildings.items():
            storey = 3.12 if floors >= 15 else 3.55
            shell(mesh, polygons[ident][0], floors * storey + .95, floors, family, ident)
    # The design review for the cultural center specifies three floors and 15.40 m.
    cultural_center = polygons[1436051956][0]
    shell(mesh, cultural_center, 15.4, 3, 'glass', 1436051956, equipment=False)
    paving = (SCANS.joinpath('floor-pavement-color.jpg').read_bytes(), 'image/jpeg')
    add_neighborhood_park(mesh, jpeg, grass, paving)
    add_culture_terraces(mesh, cultural_center, GROUND + 15.4)
