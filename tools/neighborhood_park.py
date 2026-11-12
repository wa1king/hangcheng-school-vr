"""School-opposite park from the published parcel plan and site photography."""

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import unary_union

from architecture import slab
from mesh import rect, rounded
from street_trees import register_street_trees, street_tree


PARK_LEVEL = -.226
PARK_SIGN = (10.75, 116.8)
PARK_EDGE = (
    (-39, 118), (-34, 114.2), (84, 113.8), (92, 117.5), (97.5, 124.5),
    (98.6, 210), (95.5, 218), (87.0, 222), (-32.7, 222.5), (-38.5, 217),
)
PARK_COURTS = ((7, 132.3), (39, 132.3))


def oval(x, z, width, depth, samples=64):
    return [(x + width / 2 * math.cos(step * math.tau / samples),
             z + depth / 2 * math.sin(step * math.tau / samples)) for step in range(samples)]


def walking_route(points, width):
    for _ in range(3):
        points = [points[0], *(point for a, b in zip(points, points[1:]) for point in (
            ((3 * a[0] + b[0]) / 4, (3 * a[1] + b[1]) / 4),
            ((a[0] + 3 * b[0]) / 4, (a[1] + 3 * b[1]) / 4),
        )), points[-1]]
    return LineString(points).buffer(width / 2, cap_style='round')


def draw_court(mesh, x, z, y, width=27, depth=15, fixtures=True):
    mesh.surface('park-court', rect(x, z, width, depth), y)
    paint_y = y + .005
    center = oval(x, z, 3.0, 3.0, 24)
    boundary = rect(x, z, width - .9, depth - .9)
    for points in (boundary, center):
        for a, b in zip(points, points[1:] + points[:1]):
            mesh.strip('park-court-mark', a, b, .055, paint_y)
    mesh.strip('park-court-mark', (x, z - depth / 2 + .45), (x, z + depth / 2 - .45), .055, paint_y)
    for end in (-1, 1):
        limit = x + end * (width / 2 - .45)
        key = rect(limit - end * 2.20, z, 4.4, 4.6)
        for a, b in zip(key, key[1:] + key[:1]):
            mesh.strip('park-court-mark', a, b, .055, paint_y)
        if fixtures:
            pole = x + end * (width / 2 + .24)
            board = limit - end * .9
            mesh.cylinder('park-metal', pole, y - .05, z, .06, 3.32, 8)
            mesh.strip('park-metal', (pole, z), (board, z), .095, y + 3.20, .095)
            mesh.box('park-court-mark', board, y + 2.99, z, .07, .87, 1.72)
            rim = oval(board - end * .24, z, .45, .45, 12)
            for a, b in zip(rim, rim[1:] + rim[:1]):
                mesh.strip('park-court-rim', a, b, .023, y + 3.04, .024)


def add_park_sign(mesh, jpg):
    image = Image.new('RGB', (1024, 192), (31, 73, 64))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((11, 10, 1012, 181), 18, outline='#80a093', width=3)
    fonts = Path('C:/Windows/Fonts')
    font_path = next(p for p in (fonts / 'msyhbd.ttc', fonts / 'msyh.ttc', fonts / 'simhei.ttf') if p.exists())
    draw.text((512, 96), '航城文体公园', anchor='mm', fill='#fff3cf', font=ImageFont.truetype(font_path, 122))
    mesh.material('park-name', (255, 255, 255), .85, texture=jpg(image, 93))

    x, z = PARK_SIGN
    mesh.box('park-stone', x, PARK_LEVEL - .07, z, 7.12, .20, .78)
    for offset in (-2.75, 2.75):
        mesh.box('park-metal', x + offset, PARK_LEVEL + .07, z, .15, 2.6, .16)
    mesh.box('park-metal', x, 1.24, z, 7.0, 1.37, .19)
    face = z - .099
    mesh.face('park-name', [(x - 3.46, 1.27, face), (x - 3.46, 2.58, face),
                            (x + 3.46, 2.58, face), (x + 3.46, 1.27, face)],
              uv=[(1, 1), (1, 0), (0, 0), (0, 1)])


def add_neighborhood_park(mesh, jpeg, grass, paving):
    mesh.material('park-lawn', (164, 192, 134), .97, texture=grass)
    mesh.material('park-planting', (135, 162, 104), .98, texture=grass)
    mesh.material('park-path', (220, 217, 201), .93, texture=paving)
    mesh.material('park-stone', (174, 177, 166), .93)
    mesh.material('park-metal', (52, 79, 73), .72)
    mesh.material('park-court', (57, 111, 141), .95)
    mesh.material('park-court-mark', (237, 235, 219), .95)
    mesh.material('park-court-rim', (168, 72, 44), .82)
    register_street_trees(mesh)

    park = Polygon(PARK_EDGE)
    # A loop around the central lawn connects the north courts and eastern entrances.
    loop = LineString(oval(7, 179.7, 72, 49) + [(43, 179.7)]).buffer(1.5)
    walkways = unary_union([
        loop,
        walking_route([(-40, 152), (-19, 153.2), (19, 152.5), (57, 147.3), (78, 133.4), (92, 118)], 3.3),
        walking_route([(93, 118), (86, 139), (65, 160), (58, 179), (71, 195), (93, 215)], 3.5),
        walking_route([(-37, 211), (-9, 204), (26, 203), (54, 211), (75, 218), (94, 216)], 2.65),
        walking_route([(44, 174), (55, 170), (63, 167), (70, 163)], 2.25),
        box(-9, 117.9, 55, 145.2),
        Polygon(rounded(88, 124, 17, 13, 4)),
        Polygon(rounded(90, 212, 16, 12, 4.5)),
    ]).intersection(park)
    beds = unary_union([
        Polygon(oval(-27, 166, 14, 12)),
        Polygon(oval(64, 152, 18, 9)),
        Polygon(oval(77, 175, 22, 14)),
        Polygon(oval(58, 195, 14, 12)),
        Polygon(oval(-24, 211, 18, 8)),
    ]).intersection(park).difference(walkways)
    slab(mesh, park.difference(walkways.union(beds)), PARK_LEVEL, PARK_LEVEL, 'park-lawn')
    slab(mesh, beds, PARK_LEVEL, PARK_LEVEL, 'park-planting')
    slab(mesh, walkways, PARK_LEVEL, PARK_LEVEL + .028, 'park-path')
    slab(mesh, box(-133.5, 111.25, 97, 116.2), PARK_LEVEL, PARK_LEVEL + .065, 'park-path')
    for x, z in PARK_COURTS:
        draw_court(mesh, x, z, PARK_LEVEL + .044)
    add_park_sign(mesh, jpeg)

    rng = random.Random(924)
    tree_spots = (
        (-32, 126), (-24, 141), (-29, 158), (-32, 177), (-33, 190),
        (-22, 197), (-18, 216), (-2, 212), (15, 215), (39, 215), (55, 216),
        (67, 207), (79, 207), (93, 198), (92, 182), (91, 169), (78, 177),
        (69, 182), (57, 188), (61, 153), (70, 143), (67, 123), (76, 118.3),
        (94, 145), (-27, 117.1),
    )
    for index, (x, z) in enumerate(tree_spots):
        if park.covers(Point(x, z)) and not walkways.buffer(.45).covers(Point(x, z)):
            street_tree(mesh, x, z, rng.uniform(5.3, 9.8), 1400 + index, PARK_LEVEL, distant=True)

    # The mature trees framing the street view screen the towers behind the park.
    for index, (x, z, height) in enumerate((
        (-22, 122, 9.4), (-12, 118.4, 7.7), (60, 121, 10.5), (71, 126, 8.9),
        (-9.5, 146.4, 10.7), (11, 147.9, 10.2), (33.7, 147.2, 9.8), (50, 146.5, 11.5),
    )):
        street_tree(mesh, x, z, height, 1710 + index, PARK_LEVEL)

    for x, z in ((-24, 153), (65, 151), (89, 189), (67, 210), (6, 206)):
        for leg in (-.68, .68):
            mesh.box('park-metal', x + leg, PARK_LEVEL, z, .07, .46, .4)
        mesh.box('park-stone', x, PARK_LEVEL + .45, z, 1.78, .12, .42)


def add_culture_terraces(mesh, footprint, roof):
    outline = Polygon(footprint)
    # Deep pale horizontal slabs and planted terraces are visible in the park report.
    for y, width in ((3.72, 1.8), (7.54, 1.28), (11.25, .95)):
        for a, b in zip(footprint, footprint[1:]):
            mesh.strip('context-coping', a, b, width, y, .44)
    slab(mesh, outline.buffer(-1.35, join_style='mitre'), roof + .012, roof + .012, 'park-lawn')
    slab(mesh, walking_route([(-85, 194), (-58, 194), (-47, 165), (-54, 132)], 1.48).intersection(outline),
         roof + .035, roof + .035, 'park-path')
    draw_court(mesh, -70.3, 183.7, roof + .055, width=25.7, depth=13.9)
    for x, z, width, depth in ((-58.2, 134.1, 9.4, 5.2), (-54.2, 162, 6.5, 4.8), (-84.5, 174.0, 4.6, 3.5)):
        mesh.box('context-coping', x, roof, z, width, 2.48, depth)
