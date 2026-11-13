"""Exterior-only neighborhood shells on mapped footprints."""

import math
from io import BytesIO
from pathlib import Path

from PIL import Image
from shapely.geometry import LineString, Polygon, box
from shapely.geometry.polygon import orient

from architecture import slab
from mesh import rect
from neighborhood_park import add_culture_terraces, add_neighborhood_park


GROUND = -.27
SCANS = Path(__file__).with_name('material_scans')
PHOTOS = Path(__file__).with_name('facade_photos')
# Rectified street photographs from Shenzhen (see facade_photos/SOURCES.md).
# Each holds whole bays and floors: file, bays across, floors up, bay width in metres.
FACADES = {
    'silver': ('apartment-a.jpg', 5, 5, 3.15),
    'warm': ('apartment-b.jpg', 1, 3, 4.3),
    'glass': ('curtain-wall.jpg', 3, 5, 2.85),
    'podium': ('podium.jpg', 4, 1, 4.25),
}

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


def jpeg(image, quality=84):
    output = BytesIO()
    image.save(output, 'JPEG', quality=quality, optimize=True)
    return output.getvalue(), 'image/jpeg'


def register_materials(mesh):
    for name, (file, *_) in FACADES.items():
        mesh.material(f'context-{name}', (255, 255, 255), .9 if name != 'glass' else .35,
                      texture=(PHOTOS.joinpath(file).read_bytes(), 'image/jpeg'))
    with Image.open(SCANS / 'school-grass.jpg') as source:
        grass = jpeg(source.convert('RGB').resize((256, 256), Image.Resampling.LANCZOS))
    mesh.material('context-landscape', (184, 202, 165), .96, texture=grass)
    mesh.material('context-ground', (121, 130, 103), 1)
    mesh.material('context-roof', (158, 164, 159), .95)
    mesh.material('context-wall', (171, 171, 159), .94)
    mesh.material('context-paving', (152, 150, 137), .96)
    mesh.material('context-coping', (201, 199, 188), .96)
    return grass


def wall_band(mesh, a, b, bottom, top, family, floors, offset):
    _, columns, rows, bay = FACADES[family]
    span = math.dist(a, b)
    material = f'context-{family}' if span >= 1.7 else 'context-wall'
    u0 = offset % columns / columns
    u1 = u0 + max(1, round(span / bay)) / columns
    v = floors / rows
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
        offset = index + seed
        wall_band(mesh, a, b, GROUND, podium, 'podium', 1, offset)
        if floors > 1:
            wall_band(mesh, a, b, podium, roof, family, floors - 1, offset)
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


def culture_center(mesh, footprint):
    """The open terraces and pitched foyer frame shown in the park photos."""
    outline = orient(Polygon(footprint).simplify(.13, preserve_topology=True), sign=1)
    court_wing = outline.intersection(box(-100, 167.72, -74.5, 201))
    main = outline.difference(court_wing)
    for name, file, roughness, metallic in (
        ('culture-glazing', 'linghang-center-glazing.jpg', .45, .12),
        ('culture-foyer', 'linghang-center-entry.jpg', .43, .1),
        ('culture-sign', 'linghang-center-sign.png', .84, 0),
    ):
        mime = 'image/png' if file.endswith('.png') else 'image/jpeg'
        mesh.material(name, (255, 255, 255), roughness, metallic, texture=(PHOTOS.joinpath(file).read_bytes(), mime))
    stone = (SCANS.joinpath('plaster-color.jpg').read_bytes(), 'image/jpeg')
    mesh.material('culture-concrete', (233, 230, 212), .93, texture=stone)
    mesh.material('culture-soffit', (88, 90, 82), .90)
    mesh.material('culture-railing', (107, 118, 113), .54, .23)
    mesh.material('culture-paving', (255, 255, 255), .95,
                  texture=(PHOTOS.joinpath('park-paving.jpg').read_bytes(), 'image/jpeg'))
    slab(mesh, outline.buffer(1.5, join_style='mitre'), GROUND + .09, GROUND + .09, 'culture-paving')

    def glazed_wall(polygon, bottom, top, floor):
        ring = list(orient(polygon, sign=1).exterior.coords)
        for a, b in zip(ring, ring[1:]):
            edge = LineString((a, b))
            span = edge.length
            # Concrete cores interrupt the long runs of glass in the exterior photos.
            breaks = [(0, span, 'culture-glazing')]
            if span > 26:
                first = span * (.35 if floor == 1 else .61)
                last = first + min(6.2, span * .18)
                breaks = [(0, first, 'culture-glazing'), (first, last, 'culture-concrete'),
                          (last, span, 'culture-glazing')]
            for start, end, material in breaks:
                x, z = edge.interpolate(start).coords[0]
                xx, zz = edge.interpolate(end).coords[0]
                uv = None
                if material == 'culture-glazing':
                    repetitions = (end - start) / 6.8
                    phase = floor * .27
                    uv = [(phase, 1), (phase, 0), (phase + repetitions, 0), (phase + repetitions, 1)]
                mesh.face(material, [(x, bottom, z), (x, top, z), (xx, top, zz), (xx, bottom, zz)], uv=uv)

    def terrace(polygon, elevation, rail):
        y = GROUND + elevation
        slab(mesh, polygon, y - .86, y, 'culture-concrete')
        slab(mesh, polygon.buffer(-.22, join_style='mitre'), y - .89, y - .86, 'culture-soffit')
        if rail:
            ring = list(polygon.buffer(-.17, join_style='mitre').exterior.coords)
            for a, b in zip(ring, ring[1:]):
                mesh.strip('culture-railing', a, b, .047, y + 1.02, .045)
                posts = max(1, round(math.dist(a, b) / 1.6))
                for i in range(posts):
                    x = a[0] + (b[0] - a[0]) * i / posts
                    z = a[1] + (b[1] - a[1]) * i / posts
                    mesh.box('culture-railing', x, y, z, .035, 1.04, .035)

    for polygon, roof in ((main, 15.4), (court_wing, 12.1)):
        floor_levels = (0, 4.75, 9.75, roof)
        for floor, (bottom, top) in enumerate(zip(floor_levels, floor_levels[1:])):
            inset = (1.65, 2.38, 1.58)[floor]
            wall = polygon.buffer(-inset, join_style='mitre')
            glazed_wall(wall, GROUND + bottom, GROUND + top - .85, floor)
            terrace(polygon if top == roof else polygon.buffer(-.24, join_style='mitre'), top, top < roof or roof > 13)

    # The park-facing main entrance combines a two-storey glass opening and an inclined concrete frame.
    x = -41.03
    front = x + 1.25
    lobby_a, lobby_b = 164.4, 146.1
    mesh.face('culture-foyer', [(x, GROUND + .06, lobby_a + 1.3), (x, GROUND + .06, lobby_b),
                                (x, GROUND + 8.80, lobby_b), (x, GROUND + 8.80, lobby_a - 2.9)],
              uv=[(0, 1), (1, 1), (1, 0), (0, 0)])
    mesh.box('culture-concrete', front - .60, GROUND + 8.36, (lobby_a + lobby_b) / 2 + .54,
             1.24, .95, lobby_a - lobby_b + 3.1)
    for z, incline in ((lobby_a + 2.3, -4.15), (lobby_b - 2.05, 0)):
        outer = [(front, GROUND, z + .84), (front, GROUND, z - .84),
                 (front, GROUND + 8.40, z + incline - .64), (front, GROUND + 8.40, z + incline + .64)]
        inner = [(x - .19, y, pz) for _, y, pz in outer]
        mesh.face('culture-concrete', outer)
        for a, b in ((0, 1), (1, 2), (2, 3), (3, 0)):
            mesh.face('culture-concrete', [outer[a], inner[a], inner[b], outer[b]])

    # Wide stair flights and planters flank the glazed entrance, on the plaza side of the building.
    for i in range(22):
        step = (i + 1) * .205
        mesh.box('culture-concrete', -36.40 - i * .39, GROUND + .095, 175.4, .40, step, 13.0)
        if i % 5 == 0:
            mesh.box('culture-concrete', -37.18 - i * .39, GROUND + step, 180.55, 1.95, .46, 2.18,
                     top='context-landscape')

    y = GROUND + 14.54
    face_x = -40.885
    mesh.face('culture-sign', [(face_x, y + .01, 153.4), (face_x, y + .01, 140.8),
                               (face_x, y + 1.55, 140.8), (face_x, y + 1.55, 153.4)],
              uv=[(0, 1), (1, 1), (1, 0), (0, 0)])


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
    culture_center(mesh, cultural_center)
    paving = (SCANS.joinpath('floor-pavement-color.jpg').read_bytes(), 'image/jpeg')
    add_neighborhood_park(mesh, jpeg, grass, paving)
    add_culture_terraces(mesh, cultural_center, GROUND + 15.4)
