"""Visible grounds of Linghang Park, opposite Hangcheng School."""

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import unary_union

from architecture import png, slab
from mesh import rect, rounded
from street_trees import register_street_trees, street_tree


PARK_LEVEL = -.226
PHOTO_TILES = Path(__file__).with_name('facade_photos')
# Calibrated to Aviation Road and the culture centre's mapped footprint.
# The court canopy extents follow the 2026 satellite and the library terrace photograph.
PARK_EDGE = (
    (-40, 118), (-34, 111.7), (82.5, 111.5), (91, 114.3), (96.3, 122.8),
    (98.6, 208.6), (95.4, 218), (85.7, 222), (-31.1, 224), (-39, 216.8),
)
CANOPY = (6.5, 114.8, 62.7, 137.8)
ROOF_COURT = (-84, 183.4, 15, 24.2)


def oval(x, z, width, depth, samples=64):
    return [(x + width / 2 * math.cos(step * math.tau / samples),
             z + depth / 2 * math.sin(step * math.tau / samples)) for step in range(samples)]


def route(points, closed=False):
    for _ in range(3):
        if closed:
            pairs = zip(points, points[1:] + points[:1])
            ends = [], []
        else:
            pairs = zip(points, points[1:])
            ends = [points[0]], [points[-1]]
        points = [*ends[0], *(point for a, b in pairs for point in (
            ((3 * a[0] + b[0]) / 4, (3 * a[1] + b[1]) / 4),
            ((a[0] + 3 * b[0]) / 4, (a[1] + 3 * b[1]) / 4),
        )), *ends[1]]
    return LineString(points + [points[0]] if closed else points)


def band(mesh, material, points, width, height, thickness=0):
    for a, b in zip(points, points[1:]):
        mesh.strip(material, a, b, width, height, thickness)


def track_markings(mesh, track, surface):
    y = PARK_LEVEL + .040
    for offset in (-1.36, 1.36):
        edge = track.offset_curve(offset).intersection(surface)
        for line in getattr(edge, 'geoms', (edge,)):
            if isinstance(line, LineString):
                band(mesh, 'park-paint', list(line.coords), .075, y)
    for distance in range(0, int(track.length) - 1, 3):
        a = track.interpolate(distance)
        b = track.interpolate(distance + 1.08)
        if surface.covers(a) and surface.covers(b):
            mesh.strip('park-paint', a.coords[0], b.coords[0], .084, y)


def hoop(mesh, x, z, y, direction):
    pole = z + direction * .30
    board = z - direction * 1.1
    mesh.cylinder('park-metal', x, y, pole, .072, 3.55, 8)
    mesh.strip('park-metal', (x, pole), (x, board), .09, y + 3.30, .10)
    mesh.box('park-paint', x, y + 2.99, board, 1.65, .80, .065)
    rim = oval(x, board - direction * .24, .45, .45, 12)
    band(mesh, 'park-rim', rim + rim[:1], .022, y + 3.04, .023)


def roof_basketball(mesh, x, z, y, width, depth):
    mesh.surface('park-blue', rect(x, z, width + 2.7, depth + 2.6), y)
    mesh.surface('park-cyan', rect(x, z, width, depth), y + .005)
    mid = oval(x, z, 3.0, 3.0, 32)
    mesh.surface('park-blue', mid, y + .011)
    band(mesh, 'park-paint', mid + mid[:1], .055, y + .015)
    court = rect(x, z, width, depth)
    band(mesh, 'park-paint', court + court[:1], .055, y + .015)
    mesh.strip('park-paint', (x - width / 2, z), (x + width / 2, z), .055, y + .015)
    for end in (-1, 1):
        baseline = z + end * depth / 2
        arc = [(x + 6.15 * math.cos(i * math.pi / 28),
                baseline - end * 6.15 * math.sin(i * math.pi / 28)) for i in range(29)]
        mesh.surface('park-blue', arc, y + .011)
        band(mesh, 'park-paint', arc, .055, y + .015)
        key = rect(x, baseline - end * 2.20, 4.6, 4.4)
        band(mesh, 'park-paint', key + key[:1], .055, y + .015)
        hoop(mesh, x, baseline, y, end)


def screen(mesh, a, b, low, high):
    length = math.dist(a, b)
    if length < .1:
        return
    # Fine mesh is a repeated alpha texture. Posts and rails stay in geometry.
    repeat = length / .52
    vertical = (high - low) / .52
    mesh.face('park-screen', [(a[0], low, a[1]), (a[0], high, a[1]),
              (b[0], high, b[1]), (b[0], low, b[1])], uv=[(0, vertical), (0, 0), (repeat, 0), (repeat, vertical)])
    for y in (low, high):
        mesh.strip('park-metal', a, b, .052, y, .058)
    posts = max(1, math.ceil(length / 2.95))
    for i in range(posts):
        t = i / posts
        mesh.box('park-metal', a[0] * (1 - t) + b[0] * t, low, a[1] * (1 - t) + b[1] * t,
                 .069, high - low + .06, .069)


def add_park_sign(mesh, jpeg):
    # The entrance photo shows a low, tapered white wall with a perforated band.
    image = Image.new('RGB', (1024, 248), (218, 222, 218))
    draw = ImageDraw.Draw(image)
    rng = random.Random(241)
    for _ in range(1950):
        x = rng.randrange(1024)
        y = rng.randrange(52, 248)
        if rng.random() < .18 + .80 * (y / 247) ** 1.8:
            width = rng.randint(2, 7)
            gray = rng.randrange(75, 152)
            draw.ellipse((x, y, x + width, y + width * .57), fill=(gray, gray + 7, gray + 8))
    fonts = Path('C:/Windows/Fonts')
    font = next(p for p in (fonts / 'msyhbd.ttc', fonts / 'msyh.ttc', fonts / 'simhei.ttf') if p.exists())
    draw.text((514, 109), '领航公园', anchor='mm', fill='#394545',
              font=ImageFont.truetype(font, 125), stroke_width=3, stroke_fill='#e2e6e3')
    mesh.material('park-entry-lettering', (255, 255, 255), .9, texture=jpeg(image, 92))
    x, z = 83.1, 125.0
    angle = -.39

    def at(u, y, v):
        return (x + u * math.cos(angle) - v * math.sin(angle), PARK_LEVEL + y,
                z + u * math.sin(angle) + v * math.cos(angle))

    sides = ((-5.7, .08), (-3.7, 1.55), (3.7, 1.55), (5.7, .08))
    for (a, h), (b, k) in zip(sides, sides[1:]):
        face_material = 'park-entry-lettering' if h == k else 'park-entry-wall'
        mesh.face(face_material, [at(a, .02, -.34), at(a, h, -.20),
                                  at(b, k, -.20), at(b, .02, -.34)],
                  uv=[(1, 1), (1, 0), (0, 0), (0, 1)])
        mesh.face('park-entry-wall', [at(b, .02, .34), at(b, k, .20), at(a, h, .20), at(a, .02, .34)])
        mesh.face('park-entry-wall', [at(a, h, -.20), at(a, h, .20), at(b, k, .20), at(b, k, -.20)])


def add_canopy(mesh):
    x0, z0, x1, z1 = CANOPY
    y = PARK_LEVEL + .035
    z = (z0 + z1) * .5
    mesh.surface('park-covered-floor', rect((x0 + x1) * .5, z, x1 - x0, z1 - z0), y)
    # The open ground court is now under the long green shelter. Retain its
    # multipurpose playing area under the roof rather than two loose courts.
    for x in (14.5, 28, 41.5, 55):
        court = rect(x, z, 6.1, 13.4)
        band(mesh, 'park-paint', court + court[:1], .058, y + .005)
        for end in (-1, 1):
            line_z = z + 2.13 * end
            mesh.strip('park-paint', (x - 3.05, line_z), (x + 3.05, line_z), .058, y + .005)
            mesh.strip('park-paint', (x, line_z), (x, z + end * 6.7), .058, y + .005)
        for end in (-1, 1):
            mesh.cylinder('park-metal', x + end * 3.2, y, z, .048, .89, 8)
        mesh.strip('park-metal', (x - 3.2, z), (x + 3.2, z), .036, y + .855, .027)

    eave, ridge = y + 5.35, y + 6.10
    for near, far, height_a, height_b in ((z0, z, eave, ridge), (z, z1, ridge, eave)):
        mesh.face('park-canopy', [(x0 - .44, height_a, near), (x0 - .44, height_b, far),
                                 (x1 + .44, height_b, far), (x1 + .44, height_a, near)],
                  uv=[(0, near / 14), (0, far / 14), (8, far / 14), (8, near / 14)])
    for i in range(1, 28):
        x = x0 + i * (x1 - x0) / 28
        for edge in (z0 - .02, z1 + .02):
            mesh.face('park-roof-seam', [(x - .018, eave + .012, edge), (x - .018, ridge + .012, z),
                                       (x + .018, ridge + .012, z), (x + .018, eave + .012, edge)])
    for edge in (z0, z1):
        mesh.strip('park-canopy-edge', (x0 - .44, edge), (x1 + .44, edge), .17, eave - .17, .20)
        for x in (x0, x0 + 8, x0 + 16, x0 + 24, x0 + 32, x0 + 40, x0 + 48, x1):
            mesh.box('park-metal', x, y, edge, .15, eave - y, .15)
        screen(mesh, (x0, edge), (x1, edge), y, y + 4.15)
    for x in (x0, x1):
        screen(mesh, (x, z0), (x, z1), y, y + 4.15)
        for a, b in ((z0, z), (z, z1)):
            ah, bh = (eave, ridge) if a == z0 else (ridge, eave)
            mesh.face('park-canopy-edge', [(x, eave - .14, a), (x, ah + .03, a),
                                         (x, bh + .03, b), (x, eave - .14, b)])


def add_play_mound(mesh):
    # The terrace photo shows one low ochre climbing mound in this play area.
    y = PARK_LEVEL + .024
    center = (55.1, 180.7)
    tip = (center[0] + .5, y + 1.26, center[1] - .35)
    base = oval(*center, 10, 6.4, 24)
    ridge = oval(center[0] + .35, center[1] - .25, 5.6, 3.7, 24)
    for i, (x, z) in enumerate(base):
        j = (i + 1) % len(base)
        inside = (ridge[i][0], y + .81, ridge[i][1])
        next_inside = (ridge[j][0], y + .81, ridge[j][1])
        mesh.face('park-mound', [(x, y, z), inside, next_inside, (base[j][0], y, base[j][1])])
        mesh.face('park-mound', [inside, tip, next_inside])
    for point, level in (((56.4, 183.3), .36), ((56.1, 182.55), .56), ((55.85, 181.85), .78)):
        mesh.box('park-metal', point[0], y + level, point[1], .42, .086, .20, -.24)
    rail = oval(60, 182.8, 3.2, 2.1, 16)
    band(mesh, 'park-play-rail', rail[:9], .05, y + .48, .05)
    for x, z in rail[:9:2]:
        mesh.cylinder('park-play-rail', x, y, z, .027, .51, 6)


def add_neighborhood_park(mesh, jpeg, grass, paving):
    stone = (PHOTO_TILES.joinpath('park-paving.jpg').read_bytes(), 'image/jpeg')
    rubber = (PHOTO_TILES.joinpath('park-track.jpg').read_bytes(), 'image/jpeg')
    mesh.material('park-lawn', (162, 186, 125), .97, texture=grass)
    mesh.material('park-planting', (133, 155, 98), .98, texture=grass)
    mesh.material('park-path', (255, 255, 255), .93, texture=stone)
    mesh.material('park-track', (255, 255, 255), .97, texture=rubber)
    mesh.material('park-play', (182, 140, 76), .97, texture=paving)
    mesh.material('park-mound', (166, 117, 60), .95, texture=paving)
    mesh.material('park-play-rail', (223, 185, 62), .72)
    mesh.material('park-stone', (200, 201, 190), .93)
    mesh.material('park-entry-wall', (218, 222, 218), .95)
    mesh.material('park-metal', (47, 62, 59), .73)
    mesh.material('park-paint', (232, 233, 219), .91)
    mesh.material('park-rim', (176, 70, 42), .76)
    mesh.material('park-blue', (30, 81, 166), .93)
    mesh.material('park-cyan', (42, 166, 197), .93)
    mesh.material('park-covered-floor', (29, 62, 102), .96)
    mesh.material('park-canopy', (69, 105, 96), .84, texture=paving, double=True)
    mesh.material('park-canopy-edge', (51, 76, 70), .86, double=True)
    mesh.material('park-roof-seam', (70, 98, 89), .85, double=True)
    net = Image.new('RGBA', (32, 32))
    draw = ImageDraw.Draw(net)
    for line in (0, 8, 16, 24):
        draw.line((line, 0, line, 31), fill=(64, 78, 72, 255))
        draw.line((0, line, 31, line), fill=(64, 78, 72, 255))
    mesh.material('park-screen', (255, 255, 255), .91, texture=png(net), double=True)
    register_street_trees(mesh)

    park = Polygon(PARK_EDGE)
    lawn = Polygon(oval(5.3, 178.6, 65.7, 43.4))
    track = route([(94, 117.9), (88, 129), (79, 144), (64, 152), (42, 155.8), (16, 153.6),
                   (-11, 151.7), (-27, 149), (-33, 138), (-31.8, 125), (-31, 112)])
    loop = route([(-27.5, 177), (-20.7, 160), (4, 154), (29, 157.8), (42, 174.5),
                  (37, 194.5), (15, 204.7), (-7, 204), (-23, 193)], closed=True)
    entry = Polygon([(76, 112), (94, 117.3), (96, 132), (93, 141), (84, 144),
                     (77, 138), (79, 129), (84, 121), (75, 118)])
    plaza = Polygon([(-43, 140.5), (-31, 140.5), (-23, 151), (-27, 163.2), (-28.9, 185.8),
                     (-23.7, 202), (-18, 210), (-18, 216), (-32.9, 219.7), (-44.5, 205)])
    playground = Polygon(rounded(55.9, 181.0, 22, 15.5, 4))
    path_areas = [
        loop.buffer(1.40), track.buffer(3.26), entry, plaza,
        route([(49, 157), (52, 167), (51, 176), (62, 190), (76, 192), (90, 216)]).buffer(1.67),
        route([(-24, 201), (0, 208), (27, 207), (48, 203), (67, 199), (83, 207), (91, 217)]).buffer(1.57),
        route([(75, 146), (75, 156), (83, 168), (92, 178), (96, 189)]).buffer(1.5),
        route([(-23.5, 152), (-12, 162), (2, 170), (19, 173), (38, 164)]).buffer(1.04),
    ]
    walkway = unary_union(path_areas).intersection(park)
    track_surface = track.buffer(1.46, cap_style='flat').intersection(park)
    canopy = box(*CANOPY)
    ground = park.difference(walkway.union(playground).union(canopy))
    slab(mesh, ground.intersection(lawn), PARK_LEVEL, PARK_LEVEL, 'park-lawn')
    slab(mesh, ground.difference(lawn), PARK_LEVEL, PARK_LEVEL, 'park-planting')
    slab(mesh, walkway.difference(track_surface.union(playground).union(canopy)),
         PARK_LEVEL, PARK_LEVEL + .023, 'park-path')
    slab(mesh, track_surface, PARK_LEVEL, PARK_LEVEL + .030, 'park-track')
    slab(mesh, playground, PARK_LEVEL, PARK_LEVEL + .023, 'park-play')
    slab(mesh, box(-133.5, 109.1, 96.2, 111.3), PARK_LEVEL, PARK_LEVEL + .060, 'park-path')
    slab(mesh, box(-40.5, 111.3, -35.2, 218.4).union(plaza).difference(park),
         PARK_LEVEL, PARK_LEVEL + .023, 'park-path')
    track_markings(mesh, track, track_surface)
    add_canopy(mesh)
    add_park_sign(mesh, jpeg)
    add_play_mound(mesh)

    # Three curved seating strips on the far side of the open oval lawn.
    for index in range(3):
        radius = 17 + index * 2.1
        arc = [(9 + radius * math.cos(math.radians(angle)),
                176.7 + radius * .81 * math.sin(math.radians(angle))) for angle in range(-58, 29, 4)]
        slab(mesh, LineString(arc).buffer(.32, cap_style='flat'), PARK_LEVEL,
             PARK_LEVEL + .17 + index * .05, 'park-stone')

    rng = random.Random(924)
    tree_spots = (
        (-32, 120), (-28, 128), (-24, 142), (-31, 162), (-26, 182), (-32, 191),
        (-21, 198), (-16, 217), (-2, 214), (15, 217), (37, 215), (54, 214),
        (67, 209), (78, 215), (91, 203), (94, 187), (88, 174), (87, 164),
        (84, 151), (74, 158), (64, 167), (54, 170), (44, 157), (34, 146),
        (17, 144), (1, 146), (-12, 141), (-10, 164), (1, 158), (20, 159),
        (-1, 196), (15, 198), (29, 188), (33, 178), (68, 121), (70, 135),
    )
    obstructed = walkway.union(playground).union(canopy).buffer(.30)
    for index, (x, z) in enumerate(tree_spots):
        point = Point(x, z)
        if park.covers(point) and not obstructed.covers(point):
            street_tree(mesh, x, z, rng.uniform(4.9, 8.7), 1400 + index, PARK_LEVEL, distant=True)
    for index, (x, z, height) in enumerate((
        (-20, 119, 7.7), (-13, 123, 7.1), (0.5, 120.0, 7.3), (65.0, 116.1, 6.6),
        (72.6, 125.1, 7.3), (-15, 154.7, 8.2), (45.6, 148.5, 7.9), (62.5, 145.2, 8.2),
    )):
        street_tree(mesh, x, z, height, 1710 + index, PARK_LEVEL)
    # The built park is framed by a continuous belt of taller trees, visible
    # behind the open lawn and between the street and the covered courts.
    for index, (x, z, height) in enumerate((
        (-27, 116.7, 8.6), (-16.5, 116.6, 7.2), (-7.8, 116.2, 7.8),
        (1, 111.9, 7.3), (35, 112.5, 7.9), (50, 112.5, 7.7), (67, 113.1, 9.1),
        (-25, 211, 8.7), (-13.2, 218.5, 8.8), (-3.6, 220, 9.0), (7, 219, 9.8),
        (20, 220, 9.4), (30, 217.2, 9.5), (44, 219, 8.6), (56, 217, 9.0), (66, 215, 9.6),
        (78, 217, 8.9), (87, 211, 9.3), (92.5, 205, 8.2), (93.3, 196, 8.7),
        (95, 182, 8.1), (93, 164, 9.2), (91.3, 150, 7.3),
    )):
        if not obstructed.covers(Point(x, z)):
            street_tree(mesh, x, z, height, 1880 + index, PARK_LEVEL, distant=True)
    for x, z in ((-22, 143), (74, 154), (84, 180), (-19, 199), (39, 201)):
        mesh.cylinder('park-metal', x, PARK_LEVEL, z, .054, 3.45, 8)
        mesh.cylinder('park-paint', x, PARK_LEVEL + 3.34, z, .17, .09, 12)


def add_culture_terraces(mesh, footprint, roof):
    outline = Polygon(footprint)
    x, z, width, depth = ROOF_COURT
    court_deck = box(-92.6, 168, -74.5, 197.1).intersection(outline)
    court_level = roof - 3.30
    slab(mesh, court_deck, court_level + .012, court_level + .012, 'park-path')
    roof_basketball(mesh, x, z, court_level + .03, width, depth)
    fence = rect(x, z, width + 2.7, depth + 2.6)
    for a, b in zip(fence, fence[1:] + fence[:1]):
        screen(mesh, a, b, court_level, court_level + 3.50)

    # Rectilinear planters alternate with pale roof paving in the aerial photo.
    upper = outline.buffer(-.64, join_style='mitre').difference(court_deck)
    beds = unary_union([box(*bounds) for bounds in (
        (-67, 130.2, -45, 141.6), (-65, 144.2, -50.5, 155.1),
        (-69, 164.6, -54.5, 176), (-72.7, 177.8, -60, 184.6), (-59.1, 181, -50.1, 191.6),
    )]).intersection(upper)
    slab(mesh, upper.difference(beds), roof, roof + .018, 'park-path')
    slab(mesh, beds, roof + .018, roof + .20, 'park-stone', 'park-lawn')
    for x, z, w, d, h in ((-65.1, 129.9, 6.5, 4.7, 2.3), (-55.2, 158, 7.6, 5.6, 2.4),
                          (-69.4, 168.9, 4.6, 3.4, 1.6)):
        mesh.box('park-entry-wall', x, roof, z, w, h, d, top='park-stone')
