"""A playable teaching wing with an illustrative interior layout."""

import math
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from shapely.geometry import box

from connectors import CROSSOVER_DOOR, overhead_light
from mesh import signed_area, triangulate
from surface_textures import birch_laminate, chalkboard, notice_board, porcelain_tiles, terrazzo, weathered_plaster


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
CLASSROOM_EXTERIOR_AREA = box(WING_EAST - 0.05, WING_NORTH, 35.80, 2.48)
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


def interior_materials(mesh, floors):
    for name, (color, normal, roughness) in (
        ('teaching-floor', porcelain_tiles((180, 186, 180), (133, 140, 132), 621)),
        ('stair-stone', terrazzo((150, 156, 151), 622)),
        ('teaching-wall', weathered_plaster((227, 224, 211), 627)),
        ('teaching-dado', porcelain_tiles((158, 178, 168), (132, 152, 141), 632, 10, 8, 288)),
        ('teaching-wood', birch_laminate((186, 155, 112), 635)),
        ('teaching-ceiling', weathered_plaster((220, 220, 207), 637, 192)),
    ):
        mesh.material(name, (255, 255, 255), 1.0, texture=color, normal=normal, roughness_map=roughness)
    for name, rgb, roughness in (
        ('teaching-metal', (68, 84, 80), 0.58),
        ('teaching-light-shell', (207, 211, 203), 0.57),
        ('teaching-lamp', (246, 245, 226), 0.61),
        ('teaching-wood-edge', (144, 116, 84), 0.72),
        ('teaching-chair', (77, 88, 82), 0.83),
        ('chalkboard', (51, 78, 65), 0.95),
        ('classroom-display', (49, 59, 61), 0.39),
    ):
        mesh.material(name, rgb, roughness)
    mesh.material('teaching-notice', (255, 255, 255), 0.83, texture=notice_board(), solid=False)
    mesh.material('teaching-chalk-a', (255, 255, 255), 0.88,
                  texture=chalkboard(641, ('48 ÷ 6 = 8', '6 × 8 = 48')), solid=False)
    mesh.material('teaching-chalk-b', (255, 255, 255), 0.88,
                  texture=chalkboard(642, ('36 + 28 = 64', '64 − 28 = 36')), solid=False)
    mesh.material('teaching-paper', (218, 216, 190), 0.95, solid=False)
    mesh.material('stair-nosing', (68, 84, 80), 0.58, solid=False)
    mesh.material('teaching-threshold', (154, 160, 155), 0.86, solid=False)
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
    wall_print(mesh, material, (x, a), (x, b), y, height)


def wall_print(mesh, material, a, b, y, height):
    mesh.face(material, [(a[0], y, a[1]), (b[0], y, b[1]),
                         (b[0], y + height, b[1]), (a[0], y + height, a[1])],
              uv=[(0, 1), (1, 1), (1, 0), (0, 0)])


def glazed_facade(mesh, point, start, end, y, height, openings):
    """Build a single solid wall with true openings and one pane per window."""
    def wall(a, b, low, high):
        if b - a < 0.001 or high - low < 0.001:
            return
        segment(mesh, 'beige', point(a, .127), point(b, .127), y + low, high - low, .25)
        segment(mesh, 'teaching-wall', point(a, .256), point(b, .256), y + low, high - low, .016)

    cursor = start
    for a, b, sill, head, has_pane in openings:
        wall(cursor, a, 0, height)
        wall(a, b, 0, sill)
        wall(a, b, head, height)
        frame_a, frame_b = point(a, .142), point(b, .142)
        segment(mesh, 'teaching-metal', frame_a, frame_b, y + head - .039, .039, .076)
        for at in (a + .019, b - .019):
            x, z = point(at, .142)
            mesh.box('teaching-metal', x, y + sill, z, .051, head - sill, .051)
        if has_pane:
            wall_print(mesh, 'glass-clear', point(a, .146), point(b, .146), y + sill, head - sill)
            segment(mesh, 'cream', point(a, .129), point(b, .129), y + sill - .012, .033, .27)
            for at in range(1, max(2, round((b - a) / .78))):
                t = a + (b - a) * at / max(2, round((b - a) / .78))
                x, z = point(t, .142)
                mesh.box('teaching-metal', x, y + sill, z, .042, head - sill, .042)
            segment(mesh, 'teaching-metal', frame_a, frame_b, y + head - .32, .038, .055)
        cursor = b
    wall(cursor, end, 0, height)


def classroom_wall_x(edge, z):
    a, b = edge
    return a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1])


def draw_classroom_exterior(mesh, a, b, floors, floor_height):
    def point(z, inset):
        return classroom_wall_x((a, b), z) - inset, z

    openings = []
    for north, south in ((WING_NORTH, -4.55), (-4.55, 2.48)):
        centre = (north + south) / 2
        openings.extend(((north + .38, centre - 1.58, .90, 2.79, True),
                         (centre + 1.58, south - .38, .90, 2.79, True)))
    for level in range(floors):
        glazed_facade(mesh, point, WING_NORTH, 2.48, level * floor_height, floor_height, openings)


def desk_top(mesh, x, y, z, width, depth):
    a, b, c, d = x - width / 2, z - depth / 2, x + width / 2, z + depth / 2
    corner = .018
    points = [(a + corner, b), (c - corner, b), (c, b + corner), (c, d - corner),
              (c - corner, d), (a + corner, d), (a, d - corner), (a, b + corner)]
    mesh.prism('teaching-wood-edge', points, y, y + .048, 'teaching-wood')


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
            label(mesh, 'glass-clear', CORRIDOR_WALL, (window_a + window_b) / 2,
                  y + 1.12, window_b - window_a, 1.33)
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
        start, end = intervals[0 if window_side > 0 else 1]
        if end - start > 1.36:
            center = (start + end) / 2
            mesh.box('teaching-wood-edge', CORRIDOR_WALL - .097, y + 1.31, center, .037, .62, 1.06)
            label(mesh, 'teaching-notice', CORRIDOR_WALL - .117, center, y + 1.34, 1.00, .56)
    label(mesh, sign, CORRIDOR_WALL - 0.085, door_z, y + 2.67, 1.18, 0.29)


def classroom(mesh, y, top, north, south, door_z, index, exterior_edge):
    centre_z = (north + south) / 2
    for x in (29.20, 30.18, 31.16, 32.14):
        for offset in (-2.25, -1.35, 0.75, 1.65, 2.50):
            z = door_z + offset
            desk_top(mesh, x, y + .697, z, .51, .63)
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

    # The boards occupy the real wall between the two exterior windows.
    def board_point(z, inset):
        return classroom_wall_x(exterior_edge, z) - inset, z

    for dz in (-.96, .96):
        a, b = centre_z + dz - .44, centre_z + dz + .44
        segment(mesh, 'teaching-metal', board_point(a, .288), board_point(b, .288), y + 1.10, 1.08, .053)
        segment(mesh, 'chalkboard', board_point(a + .026, .319), board_point(b - .026, .319), y + 1.135, 1.01, .018)
        segment(mesh, 'teaching-metal', board_point(a, .344), board_point(b, .344), y + 1.09, .034, .085)
        if dz < 0:
            wall_print(mesh, 'teaching-chalk-a' if index % 2 == 0 else 'teaching-chalk-b',
                       board_point(a + .028, .331), board_point(b - .028, .331), y + 1.138, 1.003)
    a, b = centre_z - .48, centre_z + .48
    segment(mesh, 'teaching-metal', board_point(a, .299), board_point(b, .299), y + 1.22, .93, .092)
    segment(mesh, 'classroom-display', board_point(a + .027, .349), board_point(b - .027, .349),
            y + 1.248, .87, .018)
    segment(mesh, 'teaching-metal', board_point(a + .02, .319), board_point(b - .02, .319),
            y + 1.13, .035, .045)
    mesh.box('teaching-wood-edge', 32.88, y, south - 0.67, 0.60, 0.90, 1.05)
    desk_top(mesh, 32.88, y + .90, south - .67, .66, 1.10)
    mesh.box('teaching-wood-edge', 28.30, y, north + 0.34, 1.26, 0.86, 0.43)
    desk_top(mesh, 28.30, y + .86, north + .34, 1.31, .46)
    for x in (27.99, 28.52):
        mesh.box('teaching-metal', x, y + 0.46, north + 0.565, 0.15, 0.022, 0.025)
    for x in (28.75, 30.52, 32.28):
        for z in (centre_z - 1.78, centre_z + 1.78):
            overhead_light(mesh, x, z, top, across=True)
    mesh.box('cream', 30.54, top - 0.070, centre_z, 0.80, 0.070, 0.82)
    for index in range(-4, 5):
        mesh.box('teaching-metal', 30.54, top - 0.081, centre_z + index * .043, .53, .016, .014)


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


def add_teaching_wing(mesh, edge, floor_height, floors, classroom_edge):
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
                end = classroom_wall_x(classroom_edge, z) - .13 if z <= 2.48 else WING_EAST
                mesh.box('teaching-wall', (start + end) / 2, y, z, end - start, top - y, 0.17)
        mesh.box('teaching-wall', WING_EAST - 0.067, y, (2.48 + WING_SOUTH) / 2,
                 0.17, top - y, WING_SOUTH - 2.48)
        for index, (north, south, door_z) in enumerate(((WING_NORTH, -4.55, -9.25), (-4.55, 2.48, -1.30))):
            sign = 'teaching-sign-room-a' if index == 0 else 'teaching-sign-room-b'
            corridor_partition(mesh, north, south, door_z, y, top, sign)
            classroom(mesh, y, top, north, south, door_z, index + level * 2, classroom_edge)
        corridor_partition(mesh, 2.48, WING_SOUTH, 3.36, y, top, 'teaching-sign-stair', with_window=False)
        for z in (-11.9, -8.1, -4.3, -0.5, 3.3, 7.1, 10.9, 14.7):
            overhead_light(mesh, 25.48, z, top, across=True)
        label(mesh, f'teaching-sign-level-{level + 1}', CORRIDOR_WALL - 0.085, 6.15, y + 1.72, 1.0, 0.26)
        stairs(mesh, y, floor_height, roof=(level == floors - 1))
    rooftop_stairhouse(mesh, floor_height * floors + 0.05)
