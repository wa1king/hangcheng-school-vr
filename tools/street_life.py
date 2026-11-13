"""Street furniture and gathering places around the school approach.

Everything here goes into the view-only surroundings model, so visitors walk
past it without collision. Layout follows one set of rules tied to the road
axis and the school forecourt: rails stop at the gate and the bus bay, lamps
keep a fixed rhythm, bikes fill the paving beside the forecourt. The kit is
modelled on common Shenzhen street items seen in the reference photographs
listed in facade_photos/SOURCES.md. Positions are scene design, not survey.
"""

import math
import random
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import Point

from architecture import branch
from street_traffic import AVIATION_HALF_WIDTH, ROAD_LEVEL, street_axes

WALK = -.041       # Top of the footway beside the road.
FORECOURT = .007
GATE = (-2.1, 33.0)   # Forecourt opening along the road, site x.
BUS_BAY = (48.5, 60.5)
FONTS = Path('C:/Windows/Fonts')


def font(size, bold=True):
    names = ('msyhbd.ttc', 'msyh.ttc', 'simhei.ttf') if bold else ('msyh.ttc', 'simhei.ttf')
    return ImageFont.truetype(next(FONTS / name for name in names if (FONTS / name).exists()), size)


def png(image):
    output = BytesIO()
    image.save(output, 'PNG', optimize=True)
    return output.getvalue(), 'image/png'


def sign_textures():
    children = Image.new('RGBA', (128, 128))
    draw = ImageDraw.Draw(children)
    draw.polygon([(64, 6), (124, 118), (4, 118)], fill=(247, 204, 38), outline=(24, 24, 24), width=7)
    draw.ellipse((44, 52, 56, 64), fill=(24, 24, 24))
    draw.line((50, 64, 48, 88), fill=(24, 24, 24), width=7)
    draw.line((48, 88, 40, 108), fill=(24, 24, 24), width=5)
    draw.line((48, 88, 58, 108), fill=(24, 24, 24), width=5)
    draw.ellipse((70, 62, 80, 72), fill=(24, 24, 24))
    draw.line((75, 72, 76, 92), fill=(24, 24, 24), width=6)
    draw.line((76, 92, 70, 108), fill=(24, 24, 24), width=4)
    draw.line((76, 92, 84, 108), fill=(24, 24, 24), width=4)
    draw.line((52, 74, 72, 78), fill=(24, 24, 24), width=4)

    limit = Image.new('RGBA', (128, 128))
    draw = ImageDraw.Draw(limit)
    draw.ellipse((4, 4, 124, 124), fill=(244, 244, 238), outline=(204, 34, 30), width=14)
    draw.text((64, 62), '30', font=font(62), anchor='mm', fill=(24, 24, 24))

    name = Image.new('RGB', (256, 80), (30, 84, 160))
    draw = ImageDraw.Draw(name)
    draw.rectangle((3, 3, 252, 76), outline=(240, 240, 236), width=3)
    draw.text((128, 30), '航空路', font=font(38), anchor='mm', fill=(244, 244, 238))
    draw.text((128, 62), 'HANGKONG RD', font=font(15), anchor='mm', fill=(244, 244, 238))

    stop = Image.new('RGB', (128, 256), (238, 240, 236))
    draw = ImageDraw.Draw(stop)
    draw.rectangle((0, 0, 127, 62), fill=(22, 128, 86))
    draw.text((64, 22), '航城学校', font=font(26), anchor='mm', fill=(248, 248, 244))
    draw.text((64, 48), 'Hangcheng School', font=font(11, False), anchor='mm', fill=(248, 248, 244))
    for row, route in enumerate(('B888', 'M558')):
        y = 84 + row * 54
        draw.rounded_rectangle((12, y, 116, y + 40), 8, fill=(30, 84, 160))
        draw.text((64, y + 20), route, font=font(26), anchor='mm', fill=(248, 248, 244))
    draw.text((64, 226), '宝安公交', font=font(15, False), anchor='mm', fill=(70, 80, 78))

    zone = Image.new('RGB', (256, 96), (247, 204, 38))
    draw = ImageDraw.Draw(zone)
    draw.rectangle((3, 3, 252, 92), outline=(24, 24, 24), width=4)
    draw.text((128, 32), '前方学校', font=font(34), anchor='mm', fill=(24, 24, 24))
    draw.text((128, 70), '减速慢行', font=font(30), anchor='mm', fill=(24, 24, 24))

    wheel = Image.new('RGBA', (128, 128))
    draw = ImageDraw.Draw(wheel)
    draw.ellipse((3, 3, 124, 124), outline=(28, 29, 30), width=9)
    draw.ellipse((13, 13, 114, 114), outline=(176, 180, 182), width=3)
    for index in range(14):
        angle = index * math.tau / 14
        draw.line((64, 64, 64 + 50 * math.cos(angle), 64 + 50 * math.sin(angle)), fill=(170, 174, 176), width=1)
    draw.ellipse((57, 57, 71, 71), fill=(60, 62, 64))
    return {'bike-wheel': png(wheel), 'sign-children': png(children), 'sign-limit': png(limit), 'sign-road-name': png(name),
            'sign-bus-stop': png(stop), 'sign-school-zone': png(zone)}


def register_materials(mesh):
    for name, texture in sign_textures().items():
        mesh.material(name, (255, 255, 255), .7, texture=texture, double=True)
    for name, rgb, roughness, metallic in (
        ('rail-yellow', (232, 186, 44), .6, .1), ('rail-white', (226, 228, 224), .6, .1),
        ('rail-green', (38, 124, 86), .6, .1), ('pole-grey', (138, 146, 148), .55, .3),
        ('lamp-head', (222, 224, 218), .4, 0), ('barrier-red', (204, 44, 36), .55, 0),
        ('barrier-white', (236, 236, 230), .55, 0), ('cone-orange', (232, 104, 36), .6, 0),
        ('bin-green', (40, 118, 76), .6, 0), ('bin-grey', (92, 98, 98), .6, 0),
        ('shelter-frame', (70, 78, 82), .5, .3), ('shelter-roof', (176, 196, 204), .3, 0),
        ('bench-wood', (150, 112, 76), .7, 0), ('tyre', (30, 31, 32), .85, 0),
        ('bike-yellow', (240, 196, 30), .5, .1), ('bike-blue', (40, 132, 214), .5, .1),
        ('bike-green', (60, 178, 110), .5, .1), ('car-glass', (40, 54, 62), .2, .2),
    ):
        mesh.material(name, rgb, roughness, metallic, double=True)


class Road:
    """Positions measured along the avenue, with distance toward the school positive."""

    def __init__(self, lines):
        self.axis = street_axes(lines)[0]

    def frame(self, x):
        distance = self.axis.project(Point(x, 99))
        here = self.axis.interpolate(distance)
        ahead = self.axis.interpolate(min(self.axis.length, distance + 1))
        dx, dz = ahead.x - here.x, ahead.y - here.y
        length = math.hypot(dx, dz) or 1
        dx, dz = dx / length, dz / length
        if dx < 0:
            dx, dz = -dx, -dz
        # The school lies toward negative site z.
        return (here.x, here.y), (dx, dz), (dz, -dx)

    def at(self, x, toward_school):
        (px, pz), _, (nx, nz) = self.frame(x)
        return px + nx * toward_school, pz + nz * toward_school

    def heading(self, x):
        _, (dx, dz), _ = self.frame(x)
        return math.atan2(dz, dx)


def place(x, z, heading, forward, right):
    c, s = math.cos(heading), math.sin(heading)
    return x + forward * c - right * s, z + forward * s + right * c


def disc(mesh, material, x, y, z, heading, radius, sides=10):
    c, s = math.cos(heading), math.sin(heading)
    mesh.face(material, [(x + radius * math.cos(i * math.tau / sides) * c, y + radius * math.sin(i * math.tau / sides),
                          z + radius * math.cos(i * math.tau / sides) * s) for i in range(sides)])


def extrude(mesh, material, profile, x, z, heading, half_width):
    """Sweep a convex side profile (distance along, height) across the width."""
    sides = [[(*place(x, z, heading, u, w), y) for u, y in profile] for w in (-half_width, half_width)]
    left, right = ([(px, y, pz) for px, pz, y in side] for side in sides)
    mesh.face(material, left)
    mesh.face(material, right[::-1])
    for i in range(len(profile)):
        j = (i + 1) % len(profile)
        mesh.face(material, [left[j], left[i], right[i], right[j]])


def rail_run(mesh, road, start, stop, toward_school, base, style):
    """Guardrail panels between two points along the road."""
    panel = 2.0 if style == 'footway' else 3.0
    count = max(1, round((stop - start) / panel))
    post, bar, top = (('rail-yellow',) * 3 if style == 'footway' else ('rail-white', 'rail-white', 'rail-green'))
    height = 1.05 if style == 'footway' else .92
    for index in range(count + 1):
        x = start + (stop - start) * index / count
        px, pz = road.at(x, toward_school)
        mesh.box(post, px, base, pz, .07, height + .06, .07, road.heading(x))
        if index == count:
            break
        a = road.at(x, toward_school)
        b = road.at(start + (stop - start) * (index + 1) / count, toward_school)
        mesh.strip(top, a, b, .05, base + height - .05, .06)
        mesh.strip(bar, a, b, .04, base + .16, .05)
        for step in range(1, 5):
            t = step / 5
            mesh.box(bar, a[0] + (b[0] - a[0]) * t, base + .2, a[1] + (b[1] - a[1]) * t, .028,
                     height - .25, .028, road.heading(x))


def street_lamp(mesh, road, x, toward_school, base):
    px, pz = road.at(x, toward_school)
    reach = -1.9 if toward_school > 0 else 1.9
    tip = road.at(x, toward_school + reach)
    mesh.cylinder('pole-grey', px, base, pz, .12, .5, 8)
    mesh.cylinder('pole-grey', px, base + .5, pz, .075, 8.2, 8)
    mesh.strip('pole-grey', (px, pz), tip, .08, base + 8.55, .08)
    mesh.strip('lamp-head', road.at(x, toward_school + reach * .62), tip, .3, base + 8.44, .1)


def post_sign(mesh, road, x, toward_school, base, material, width, height, top, faces_east):
    px, pz = road.at(x, toward_school)
    mesh.cylinder('pole-grey', px, base, pz, .045, top + .05, 8)
    dx, dz = road.frame(x)[1]
    nx, nz = road.frame(x)[2]
    offset = .06 if faces_east else -.06
    fx, fz = px + dx * offset, pz + dz * offset
    a = (fx - nx * width / 2, fz - nz * width / 2)
    b = (fx + nx * width / 2, fz + nz * width / 2)
    if not faces_east:
        a, b = b, a
    mesh.face(material, [(a[0], base + top - height, a[1]), (a[0], base + top, a[1]),
                         (b[0], base + top, b[1]), (b[0], base + top - height, b[1])],
              uv=[(0, 1), (0, 0), (1, 0), (1, 1)])


def water_barrier(mesh, x, z, heading, base, material):
    extrude(mesh, material, [(-.2, 0), (-.2, .18), (-.09, .34), (-.09, .78), (.09, .78), (.09, .34), (.2, .18), (.2, 0)],
            x, z, heading + math.pi / 2, .72)


def cone(mesh, x, z, base):
    mesh.box('cone-orange', x, base, z, .32, .03, .32)
    branch(mesh, (x, base + .03, z), (x, base + .68, z), .12, .025, 'cone-orange', 8)
    branch(mesh, (x, base + .33, z), (x, base + .45, z), .078, .06, 'barrier-white', 8)


def recycling_bins(mesh, x, z, heading, base):
    for offset, material in ((-.33, 'bin-green'), (.33, 'bin-grey')):
        bx, bz = place(x, z, heading, offset, 0)
        mesh.box(material, bx, base + .06, bz, .56, .86, .46, heading)
        mesh.box('pole-grey', bx, base + .92, bz, .6, .05, .5, heading)
    mesh.box('pole-grey', x, base, z, 1.28, .06, .5, heading)


def bus_shelter(mesh, road, x, base):
    heading = road.heading(x)
    cx, cz = road.at(x, AVIATION_HALF_WIDTH + 1.75)
    for along in (-3.4, 0, 3.4):
        px, pz = place(cx, cz, heading, along, -.55)
        mesh.box('shelter-frame', px, base, pz, .1, 2.55, .1, heading)
    rx, rz = place(cx, cz, heading, 0, .05)
    mesh.box('shelter-roof', rx, base + 2.55, rz, 7.4, .07, 1.7, heading)
    mesh.box('shelter-frame', rx, base + 2.48, rz, 7.5, .07, .1, heading)
    bx, bz = place(cx, cz, heading, 0, -.5)
    mesh.box('shelter-roof', bx, base + .5, bz, 6.6, 1.5, .03, heading)
    for along in (-1.7, 1.7):
        sx, sz = place(cx, cz, heading, along, -.2)
        mesh.box('bench-wood', sx, base + .42, sz, 2.4, .05, .36, heading)
        for leg in (-1.0, 1.0):
            lx, lz = place(sx, sz, heading, leg, 0)
            mesh.box('shelter-frame', lx, base, lz, .05, .42, .3, heading)
    post_sign(mesh, road, x + 4.6, AVIATION_HALF_WIDTH + .75, base, 'sign-bus-stop', .62, 1.24, 2.5, False)


def bicycle(mesh, x, z, heading, base, colour):
    wheel = .31
    for along in (-.52, .52):
        a, b = place(x, z, heading, along - wheel, 0), place(x, z, heading, along + wheel, 0)
        mesh.face('bike-wheel', [(a[0], base, a[1]), (a[0], base + 2 * wheel, a[1]),
                                 (b[0], base + 2 * wheel, b[1]), (b[0], base, b[1])],
                  uv=[(0, 1), (0, 0), (1, 0), (1, 1)])

    def point(along, height):
        px, pz = place(x, z, heading, along, 0)
        return px, base + height, pz
    for a, b in (((-.52, wheel), (-.18, .78)), ((-.18, .78), (.36, .8)), ((.36, .8), (.52, wheel)),
                 ((-.18, .78), (.02, .34)), ((.02, .34), (.36, .8)), ((-.52, wheel), (.02, .34)),
                 ((.36, .8), (.3, .98))):
        branch(mesh, point(*a), point(*b), .022, .022, colour, 4)
    sx, sz = place(x, z, heading, -.2, 0)
    mesh.box('tyre', sx, base + .82, sz, .24, .05, .13, heading)
    hx, hz = place(x, z, heading, .3, 0)
    mesh.box('tyre', hx, base + .97, hz, .04, .04, .5, heading)
    kx, kz = place(x, z, heading, .56, 0)
    mesh.box(colour, kx, base + .72, kz, .26, .2, .3, heading)


def add_street_life(mesh, lines):
    register_materials(mesh)
    rng = random.Random(2026)
    road = Road(lines)
    edge = AVIATION_HALF_WIDTH

    # Rails follow the kerb and open at the gate, the bus bay and the junctions.
    for start, stop in ((-124, GATE[0] - .6), (GATE[1] + .6, BUS_BAY[0]), (BUS_BAY[1], 90)):
        rail_run(mesh, road, start, stop, edge + .42, WALK, 'footway')
    rail_run(mesh, road, -124, 90, -edge - .42, WALK, 'footway')
    rail_run(mesh, road, -122, 88, 0, ROAD_LEVEL, 'median')

    for x in range(-118, 92, 30):
        # Lamps on the school side step aside from the gate opening and the bus bay.
        school_side = x if not (GATE[0] - 2 < x < GATE[1] + 2 or BUS_BAY[0] - 1 < x < BUS_BAY[1] + 1) else GATE[0] - 5
        street_lamp(mesh, road, school_side, edge + .95, WALK)
        street_lamp(mesh, road, x + 15, -edge - .95, WALK)

    # Drivers meet the warnings before the gate from either direction.
    for x, east in ((-34, True), (84, False)):
        post_sign(mesh, road, x, (edge + .8) * (1 if not east else -1), WALK, 'sign-children', .9, .9, 3.0, east)
        post_sign(mesh, road, x + (4 if east else -4), (edge + .8) * (1 if not east else -1), WALK,
                  'sign-limit', .7, .7, 2.9, east)
        post_sign(mesh, road, x + (8 if east else -8), (edge + .8) * (1 if not east else -1), WALK,
                  'sign-school-zone', 1.5, .56, 2.7, east)
    for x in (-112, 86):
        post_sign(mesh, road, x, edge + 1.1, WALK, 'sign-road-name', 1.3, .4, 3.1, x < 0)

    # Water barriers and cones keep cars off the forecourt and leave a walking gap.
    for index, x in enumerate([GATE[0] + .9 + 1.55 * i for i in range(6)] + [GATE[1] - .9 - 1.55 * i for i in range(6)]):
        bx, bz = road.at(x, edge + .55)
        water_barrier(mesh, bx, bz, road.heading(x), FORECOURT, 'barrier-red' if index % 2 == 0 else 'barrier-white')
    for x in (9.2, 11.0, 12.8, 14.6, 16.4, 18.2, 20.0, 21.8):
        cone(mesh, *road.at(x, edge + .5), FORECOURT)

    bus_shelter(mesh, road, 54.5, WALK)
    recycling_bins(mesh, *road.at(61.5, edge + 1.9), road.heading(61.5), WALK)
    recycling_bins(mesh, *road.at(-6, edge + 1.9), road.heading(-6), WALK)
    recycling_bins(mesh, *road.at(36.5, edge + 1.9), road.heading(36.5), WALK)

    # Shared bikes pile up beside the forecourt, as they do outside any school gate.
    for start, count in ((-17.5, 12), (37.6, 9), (-40, 6)):
        for index in range(count):
            x = start + index * .62
            lean = rng.uniform(-.12, .12)
            bicycle(mesh, *road.at(x, edge + 1.55 + rng.uniform(-.05, .05)),
                    road.heading(x) + math.pi / 2 + lean, WALK, rng.choice(('bike-yellow', 'bike-yellow', 'bike-blue', 'bike-green')))
