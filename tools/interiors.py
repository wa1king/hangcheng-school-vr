"""A playable teaching wing with an illustrative interior layout."""

import math
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import box

from connectors import CROSSOVER_DOOR
from mesh import signed_area, triangulate


WING_NORTH = -13.1
WING_SOUTH = 16.25
WING_EAST = 33.64
CORRIDOR_WALL = 27.40
PORTAL_Z = 13.50
PORTAL_WIDTH = 2.5
STAIR_X = (28.93, 31.23)
STAIR_START = 4.45
STAIR_TREAD = 0.29
STAIR_STEPS = 12
STAIR_END = STAIR_START + STAIR_TREAD * STAIR_STEPS
STAIR_LANDING_END = 10.0
STAIR_HALF_WIDTH = 0.91
WING_AREA = box(23.2, WING_NORTH, WING_EAST, WING_SOUTH)
STAIR_VOID = box(STAIR_X[0] - STAIR_HALF_WIDTH, STAIR_START,
                 STAIR_X[1] + STAIR_HALF_WIDTH, STAIR_LANDING_END)


def courtyard_edge(a, b):
    """Select the courtyard wall which runs along the wing."""
    return min(a[0], b[0]) > 20 and min(a[1], b[1]) < WING_NORTH < WING_SOUTH < max(a[1], b[1])


def facade_spans(a, b):
    def at(z):
        return a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]), z

    cuts = sorted((at(WING_NORTH), at(WING_SOUTH)), key=lambda p: abs(p[1] - a[1]))
    return [(a, cuts[0], False), (cuts[0], cuts[1], True), (cuts[1], b, False)]


def sign_texture(title, accent):
    image = Image.new('RGB', (512, 128), '#344f50')
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 16, 127), fill=accent)
    draw.rounded_rectangle((24, 10, 501, 117), radius=5, outline='#78938e', width=2)
    font = ImageFont.truetype(str(Path('C:/Windows/Fonts/msyh.ttc')), 50)
    draw.text((266, 62), title, fill='#f4f3e8', anchor='mm', font=font)
    data = BytesIO()
    image.save(data, 'JPEG', quality=91, optimize=True)
    return data.getvalue(), 'image/jpeg'


def interior_materials(mesh, tile, floors):
    mesh.material('teaching-floor', (255, 255, 255), 0.76,
                  texture=tile((188, 190, 180), 621, (157, 162, 154), 'paving'))
    stair_texture = tile((156, 159, 153), 622)
    mesh.material('stair-stone', (255, 255, 255), 0.86, texture=stair_texture)
    for name, rgb, roughness in (
        ('teaching-wall', (228, 225, 210), 0.92),
        ('teaching-dado', (166, 188, 175), 0.82),
        ('teaching-ceiling', (213, 216, 207), 0.90),
        ('teaching-metal', (68, 84, 80), 0.58),
        ('teaching-glazing', (126, 151, 149), 0.36),
        ('teaching-lamp', (246, 245, 226), 0.61),
        ('teaching-wood', (188, 156, 110), 0.80),
        ('teaching-wood-edge', (140, 109, 76), 0.85),
        ('teaching-chair', (77, 88, 82), 0.83),
        ('chalkboard', (51, 78, 65), 0.95),
        ('classroom-display', (49, 59, 61), 0.39),
    ):
        mesh.material(name, rgb, roughness)
    mesh.material('teaching-paper', (218, 216, 190), 0.95, solid=False)
    mesh.material('stair-nosing', (68, 84, 80), 0.58, solid=False)
    mesh.material('teaching-threshold', (255, 255, 255), 0.86, texture=stair_texture, solid=False)
    for name, title, accent in (
        ('teaching-sign-entry', '教学楼室内示意', '#ba9e6d'),
        ('teaching-sign-room-a', '示意教室 A', '#afbe95'),
        ('teaching-sign-room-b', '示意教室 B', '#b7aa8d'),
        ('teaching-sign-stair', '楼梯', '#9fbbc2'),
        ('teaching-sign-roof', '楼顶 · 示意', '#9fbbc2'),
        *((f'teaching-sign-level-{level}', f'{level} 层 · 示意', '#9fbbc2')
          for level in range(1, floors + 1)),
    ):
        mesh.material(name, (255, 255, 255), 0.88, texture=sign_texture(title, accent), solid=False)


def segment(mesh, material, a, b, y, height, thickness):
    mesh.box(material, (a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2,
             math.dist(a, b), height, thickness, math.atan2(b[1] - a[1], b[0] - a[0]))


def wall_along_z(mesh, x_at, start, end, low, high, thickness=0.16, wall='teaching-wall'):
    a, b = (x_at(start), start), (x_at(end), end)
    segment(mesh, wall, a, b, low, high - low, thickness)


def label(mesh, material, x, z, y, width, height=0.24):
    """A sign mounted on a wall looking toward negative site X."""
    a, b = z - width / 2, z + width / 2
    mesh.face(material, [(x, y, a), (x, y, b), (x, y + height, b), (x, y + height, a)],
              uv=[(0, 1), (1, 1), (1, 0), (0, 0)])


def courtyard_wall(mesh, edge, y, top, level):
    a, b = edge

    def x_at(z):
        return a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + 0.085

    ground = level == 0
    portal_start = PORTAL_Z - PORTAL_WIDTH / 2
    portal_end = PORTAL_Z + PORTAL_WIDTH / 2
    beam_bottom = 2.98 if ground else 3.10
    # Broad arcade bays use one structural pier at each joint.
    if ground:
        sections = (WING_NORTH, -9.05, -4.95, -0.85, 3.25, 7.35, portal_start, portal_end, WING_SOUTH)
    else:
        sections = tuple(WING_NORTH + (WING_SOUTH - WING_NORTH) * bay / 7 for bay in range(8))
    wall_along_z(mesh, x_at, WING_NORTH, WING_SOUTH, y + beam_bottom, top, 0.30, 'beige')
    for z in sections:
        z = min(WING_SOUTH - 0.17, max(WING_NORTH + 0.17, z))
        mesh.box('terra' if ground else 'cream', x_at(z) + 0.025, y, z,
                 0.48 if ground else 0.42, beam_bottom, 0.34)

    if ground:
        # A low terrace edge between the pillars leaves the covered walk open above it.
        for start, end in ((WING_NORTH, portal_start), (portal_end, WING_SOUTH)):
            wall_along_z(mesh, x_at, start, end, y, y + 0.48, 0.21, 'terra')
            segment(mesh, 'cream', (x_at(start), start), (x_at(end), end), y + 0.48, 0.045, 0.24)
        mesh.strip('teaching-threshold', (x_at(portal_start), portal_start),
                   (x_at(portal_end), portal_end), 0.54, y + 0.026)
        label(mesh, 'teaching-sign-entry', x_at(PORTAL_Z) - 0.157, PORTAL_Z, y + 3.09, 1.85, 0.39)
        return

    # Waist-height guard behind the slab edge keeps the courtyard view open.
    wall_along_z(mesh, x_at, WING_NORTH, WING_SOUTH, y, y + 0.29, 0.24, 'beige')
    segment(mesh, 'cream', (x_at(WING_NORTH), WING_NORTH), (x_at(WING_SOUTH), WING_SOUTH), y + 0.29, 0.045, 0.30)
    for start, end in zip(sections, sections[1:]):
        rail_start, rail_end = start + 0.13, end - 0.13
        rail_a, rail_b = (x_at(rail_start) + 0.055, rail_start), (x_at(rail_end) + 0.055, rail_end)
        segment(mesh, 'blue-cap', rail_a, rail_b, y + 1.015, 0.045, 0.05)
        bars = math.ceil((rail_end - rail_start) / 0.17)
        for bar in range(1, bars):
            z = rail_start + (rail_end - rail_start) * bar / bars
            mesh.box('blue-rail', x_at(z) + 0.055, y + 0.335, z, 0.028, 0.68, 0.027)


def corridor_partition(mesh, north, south, door_z, y, top, sign, with_window=True):
    def x_at(z):
        return CORRIDOR_WALL

    a, b = door_z - 0.73, door_z + 0.73
    window_side = -1 if a - north > south - b else 1
    window_a, window_b = (north + 0.38, a - 0.40) if window_side < 0 else (b + 0.40, south - 0.38)
    intervals = [(north, a), (b, south)]
    for start, end in intervals:
        wall_along_z(mesh, x_at, start, end, y, y + 1.12, wall='teaching-dado')
        wall_along_z(mesh, x_at, start, end, y + 2.45, top)
        if with_window and start <= window_a < window_b <= end and window_b - window_a > 1.0:
            for lo, hi in ((start, window_a), (window_b, end)):
                wall_along_z(mesh, x_at, lo, hi, y + 1.12, y + 2.45)
            wall_along_z(mesh, x_at, window_a, window_b, y + 1.12, y + 2.45, 0.06, 'teaching-glazing')
            for z in (window_a, (window_a + window_b) / 2, window_b):
                mesh.box('teaching-metal', CORRIDOR_WALL, y + 1.12, z, 0.18, 1.33, 0.038)
            for elevation in (1.12, 2.05, 2.41):
                mesh.box('teaching-metal', CORRIDOR_WALL, y + elevation, (window_a + window_b) / 2,
                         0.18, 0.04, window_b - window_a)
        else:
            wall_along_z(mesh, x_at, start, end, y + 1.12, y + 2.45)
    wall_along_z(mesh, x_at, a, b, y + 2.42, top)
    for z in (a + 0.026, b - 0.026):
        mesh.box('teaching-metal', CORRIDOR_WALL, y, z, 0.25, 2.42, 0.052)
    mesh.box('teaching-metal', CORRIDOR_WALL, y + 2.38, door_z, 0.25, 0.045, b - a)
    if with_window:
        # An open classroom door rests against the inside return wall.
        mesh.box('teaching-wood', CORRIDOR_WALL + 0.48, y + 0.055, b - 0.09, 0.94, 2.17, 0.065)
        mesh.box('teaching-metal', CORRIDOR_WALL + 0.87, y + 0.99, b - 0.135, 0.11, 0.035, 0.060)
    label(mesh, sign, CORRIDOR_WALL - 0.085, door_z, y + 2.67, 1.18, 0.29)


def classroom(mesh, y, top, north, south, door_z, index):
    centre_z = (north + south) / 2
    for x in (29.20, 30.18, 31.16, 32.14):
        for offset in (-2.25, -1.35, 0.75, 1.65, 2.50):
            z = door_z + offset
            mesh.box('teaching-wood-edge', x, y + 0.696, z, 0.50, 0.022, 0.62)
            mesh.box('teaching-wood', x, y + 0.718, z, 0.51, 0.027, 0.63)
            mesh.box('teaching-wood', x + 0.174, y + 0.54, z, 0.027, 0.16, 0.54)
            for dx in (-0.187, 0.187):
                for dz in (-0.25, 0.25):
                    mesh.box('teaching-metal', x + dx, y, z + dz, 0.03, 0.70, 0.029)
            chair_x = x - 0.47
            mesh.box('teaching-chair', chair_x, y + 0.401, z, 0.35, 0.055, 0.35)
            mesh.box('teaching-chair', chair_x - 0.158, y + 0.54, z, 0.045, 0.25, 0.34)
            for dx in (-0.13, 0.13):
                for dz in (-0.13, 0.13):
                    mesh.box('teaching-metal', chair_x + dx, y, z + dz, 0.021, 0.405, 0.021)
                mesh.box('teaching-metal', chair_x - 0.15, y + 0.40, z + dx, 0.019, 0.22, 0.019)
            if offset == (-1.35 if index % 2 == 0 else 1.65):
                mesh.box('teaching-paper', x - 0.025, y + 0.745, z, 0.19, 0.007, 0.25, index * 0.14)

    # Chalkboards flank an interactive display on the teaching wall.
    for dz in (-1.90, 1.90):
        mesh.box('teaching-metal', 33.53, y + 1.08, centre_z + dz, 0.075, 1.37, 1.86)
        mesh.box('chalkboard', 33.489, y + 1.13, centre_z + dz, 0.021, 1.26, 1.75)
        mesh.box('teaching-metal', 33.475, y + 1.08, centre_z + dz, 0.10, 0.035, 1.77)
    mesh.box('teaching-metal', 33.51, y + 1.15, centre_z, 0.13, 1.31, 1.89)
    mesh.box('classroom-display', 33.44, y + 1.20, centre_z, 0.022, 1.21, 1.78)
    mesh.box('teaching-wood-edge', 32.88, y, south - 0.67, 0.60, 0.90, 1.05)
    mesh.box('teaching-wood', 32.88, y + 0.90, south - 0.67, 0.66, 0.038, 1.10)
    mesh.box('teaching-wood-edge', 28.30, y, north + 0.34, 1.26, 0.86, 0.43)
    mesh.box('teaching-wood', 28.30, y + 0.86, north + 0.34, 1.31, 0.035, 0.46)
    for x in (27.99, 28.52):
        mesh.box('teaching-metal', x, y + 0.46, north + 0.565, 0.15, 0.022, 0.025)
    for x in (28.75, 30.52, 32.28):
        for z in (centre_z - 1.78, centre_z + 1.78):
            mesh.box('teaching-metal', x, top - 0.055, z, 0.24, 0.055, 1.28)
            mesh.box('teaching-lamp', x, top - 0.065, z, 0.20, 0.025, 1.21)
    mesh.box('cream', 30.54, top - 0.070, centre_z, 0.80, 0.070, 0.82)
    for z in (centre_z - 0.23, centre_z + 0.23):
        mesh.box('teaching-metal', 30.54, top - 0.074, z, 0.53, 0.014, 0.025)


def stair_flight(mesh, left, right, start, direction, low, rise):
    """Extrude the tread profile once, without hidden faces between risers."""
    upper = []
    for step in range(STAIR_STEPS):
        d = STAIR_TREAD * step
        y = low + (step + 1) * rise
        upper.extend(((d, y), (STAIR_TREAD * (step + 1), y)))
    thickness = rise + 0.19
    profile = upper + [(d, y - thickness) for d, y in reversed(upper)]
    if signed_area(profile) < 0:
        profile.reverse()

    def vertex(x, point):
        d, y = point
        return x, y, start + direction * d

    faces = triangulate(profile)
    for x, reverse in ((left, direction < 0), (right, direction > 0)):
        for triangle in faces:
            indexes = triangle[::-1] if reverse else triangle
            mesh.face('stair-stone', [vertex(x, profile[i]) for i in indexes])
    for a, b in zip(profile, profile[1:] + profile[:1]):
        face = [vertex(left, a), vertex(right, a), vertex(right, b), vertex(left, b)]
        mesh.face('stair-stone', face if direction > 0 else face[::-1])


def stairs(mesh, base, height, roof):
    rise = height / (2 * STAIR_STEPS)
    for flight, x in enumerate(STAIR_X):
        low = base + flight * height / 2
        start, end = (STAIR_START, STAIR_END) if flight == 0 else (STAIR_END, STAIR_START)
        direction = 1 if flight == 0 else -1
        left, right = x - STAIR_HALF_WIDTH, x + STAIR_HALF_WIDTH
        stair_flight(mesh, left, right, start, direction, low, rise)
        for step in range(STAIR_STEPS):
            z = start + direction * STAIR_TREAD * (step + 0.5)
            y = low + (step + 1) * rise
            mesh.strip('stair-nosing', (left + 0.033, z - direction * 0.11),
                       (right - 0.033, z - direction * 0.11), 0.039, y + 0.002)
        for edge_x in (left + 0.035, right - 0.035):
            handrail = [(edge_x - 0.025, low + 1.03, start), (edge_x - 0.025, low + height / 2 + 1.03, end),
                        (edge_x + 0.025, low + height / 2 + 1.03, end), (edge_x + 0.025, low + 1.03, start)]
            for drop in (0, 0.046):
                top = [(X, Y - drop, Z) for X, Y, Z in handrail]
                mesh.face('blue-cap', top if (direction > 0) == (drop == 0) else list(reversed(top)))
            for a, b in zip(handrail, handrail[1:] + handrail[:1]):
                mesh.face('blue-cap', [a, (a[0], a[1] - 0.046, a[2]), (b[0], b[1] - 0.046, b[2]), b])
            for post in range(0, 19):
                ratio = post / 18
                mesh.box('blue-rail', edge_x, low + ratio * height / 2, start + (end - start) * ratio,
                         0.034, 0.99, 0.035)
    a, b = STAIR_VOID.bounds[0], STAIR_VOID.bounds[2]
    landing_width = b - a
    landing_depth = STAIR_LANDING_END - STAIR_END
    mid_level = base + height / 2
    upper_level = base + height
    mesh.box('stair-stone', (a + b) / 2, mid_level - 0.23, (STAIR_END + STAIR_LANDING_END) / 2,
             landing_width, 0.23, landing_depth)
    # Between floors both flights stay open. Only the final left opening is unused.
    guard_left = a if roof else STAIR_X[0] + STAIR_HALF_WIDTH
    guard_right = STAIR_X[1] - STAIR_HALF_WIDTH
    for y, guards in (
        (mid_level, (((a, STAIR_END), (a, STAIR_LANDING_END)),
                      ((b, STAIR_END), (b, STAIR_LANDING_END)),
                      ((a, STAIR_LANDING_END), (b, STAIR_LANDING_END)))),
        (upper_level, (((guard_left, STAIR_START), (guard_right, STAIR_START)),
                  ((a, STAIR_START), (a, STAIR_LANDING_END)),
                  ((b, STAIR_START), (b, STAIR_LANDING_END)),
                  ((a, STAIR_LANDING_END), (b, STAIR_LANDING_END)))),
    ):
        for p, q in guards:
            segment(mesh, 'blue-cap', p, q, y + 1.01, 0.052, 0.058)
            posts = math.ceil(math.dist(p, q) / 0.18)
            for index in range(posts + 1):
                t = index / posts
                mesh.box('blue-rail', p[0] + (q[0] - p[0]) * t, y, p[1] + (q[1] - p[1]) * t,
                         0.036, 1.01, 0.036)


def rooftop_stairhouse(mesh, y):
    west, east, north, south = 27.62, 32.64, 2.15, 10.43
    door_x, door_width, door_height = STAIR_X[1], 1.40, 2.20
    wall_height, wall_width = 2.70, 0.18
    door_left, door_right = door_x - door_width / 2, door_x + door_width / 2
    for x in (west, east):
        mesh.box('beige', x, y, (north + south) / 2, wall_width, wall_height, south - north + wall_width)
    mesh.box('beige', (west + east) / 2, y, south, east - west, wall_height, wall_width)
    for left, right in ((west, door_left), (door_right, east)):
        mesh.box('beige', (left + right) / 2, y, north, right - left, wall_height, wall_width)
    mesh.box('beige', door_x, y + door_height, north, door_width, wall_height - door_height, wall_width)
    for x in (door_left, door_right):
        mesh.box('teaching-metal', x, y, north, 0.055, door_height, wall_width + 0.045)
    mesh.box('teaching-metal', door_x, y + door_height - 0.035, north,
             door_width, 0.035, wall_width + 0.045)
    mesh.box('roof', (west + east) / 2, y + wall_height, (north + south) / 2,
             east - west + 0.52, 0.22, south - north + 0.52)
    label(mesh, 'teaching-sign-roof', east - wall_width / 2 - 0.005, 3.30, y + 1.65, 1.0, 0.26)


def add_teaching_wing(mesh, edge, floor_height, floors):
    for level in range(floors):
        y = level * floor_height
        top = y + floor_height - (0.55 if level == floors - 1 else 0.28)
        courtyard_wall(mesh, edge, y, top, level)
        for z in (WING_NORTH + 0.045, -4.55, 2.48, WING_SOUTH - 0.045):
            start = 23.51 if z < -13 or z > 16 else CORRIDOR_WALL
            if level and z > 16:
                left, right = CROSSOVER_DOOR
                for a, b in ((start, left), (right, WING_EAST)):
                    mesh.box('teaching-wall', (a + b) / 2, y, z, b - a, top - y, 0.17)
                opening_top = y + 2.40
                mesh.box('teaching-wall', (left + right) / 2, opening_top, z, right - left,
                         top - opening_top, 0.17)
                for x in (left, right):
                    mesh.box('teaching-metal', x, y, z, 0.052, 2.40, 0.21)
                mesh.box('teaching-metal', (left + right) / 2, opening_top - 0.045, z,
                         right - left, 0.045, 0.21)
            else:
                mesh.box('teaching-wall', (start + WING_EAST) / 2, y, z, WING_EAST - start, top - y, 0.17)
        mesh.box('teaching-wall', WING_EAST - 0.067, y, (WING_NORTH + WING_SOUTH) / 2,
                 0.17, top - y, WING_SOUTH - WING_NORTH)
        for index, (north, south, door_z) in enumerate(((WING_NORTH, -4.55, -9.25), (-4.55, 2.48, -1.30))):
            sign = 'teaching-sign-room-a' if index == 0 else 'teaching-sign-room-b'
            corridor_partition(mesh, north, south, door_z, y, top, sign)
            classroom(mesh, y, top, north, south, door_z, index + level * 2)
        corridor_partition(mesh, 2.48, WING_SOUTH, 3.36, y, top, 'teaching-sign-stair', with_window=False)
        for z in (-11.9, -8.1, -4.3, -0.5, 3.3, 7.1, 10.9, 14.7):
            mesh.box('teaching-metal', 25.48, top - 0.06, z, 0.21, 0.06, 1.55)
            mesh.box('teaching-lamp', 25.48, top - 0.070, z, 0.17, 0.028, 1.47)
        label(mesh, f'teaching-sign-level-{level + 1}', CORRIDOR_WALL - 0.085, 6.15, y + 1.72, 1.0, 0.26)
        stairs(mesh, y, floor_height, roof=(level == floors - 1))
    rooftop_stairhouse(mesh, floor_height * floors + 0.05)
