"""Build the campus's mapped outdoor sports surfaces and equipment."""

import math
import random
import struct
import zlib
from io import BytesIO

import numpy as np
from PIL import Image
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import unary_union

from architecture import foliage, slab, tile
from mesh import rounded, signed_area


TRACK_ID = 19808443
FOOTBALL_ID = 1448555210
BASKETBALL_IDS = (1448555211, 1448555212, 1448555213, 1454566186, 1454566187)
BLUE_COURTS = frozenset(BASKETBALL_IDS[:3])
SURFACE_Y = 0.032
MARKING_Y = 0.083


def loop_edges(ring):
    return zip(ring, ring[1:] + ring[:1])


def open_ring(ring):
    return list(ring[:-1] if ring[0] == ring[-1] else ring)


def add_track(mesh, rings, football):
    outer, inner = (Polygon(ring) for ring in rings)
    track = outer.difference(inner)
    slab(mesh, track, SURFACE_Y, SURFACE_Y, 'sports_track')
    infield = inner.difference(Polygon(football))
    slab(mesh, infield, SURFACE_Y, SURFACE_Y, 'sports_infield')
    # Six parallel lanes follow the mapped inner perimeter. Line widths and offsets
    # are estimated, and paint is clipped to the mapped rubber surface.
    inside_rubber = outer.buffer(-0.13)
    for lane in range(7):
        edge = inner.buffer(0.19 + lane * 1.20).intersection(inside_rubber).boundary
        paint = edge.buffer(0.027).intersection(track)
        slab(mesh, paint, MARKING_Y, MARKING_Y, 'sports_paint')


def court_frame(ring):
    corners = open_ring(ring)
    start, end = max(loop_edges(corners), key=lambda pair: math.dist(*pair))
    length = math.dist(start, end)
    ux, uz = ((end[axis] - start[axis]) / length for axis in range(2))
    vx, vz = -uz, ux
    cx, cz = (sum(point[axis] for point in corners) / len(corners) for axis in range(2))
    widths = [(x - cx) * vx + (z - cz) * vz for x, z in corners]

    def to_world(u, v):
        return cx + u * ux + v * vx, cz + u * uz + v * vz

    return to_world, length, max(widths) - min(widths), math.atan2(uz, ux)


def draw_path(mesh, to_world, points, width=0.065, closed=False):
    pairs = loop_edges(points) if closed else zip(points, points[1:])
    for a, b in pairs:
        mesh.strip('sports_paint', to_world(*a), to_world(*b), width, MARKING_Y)


def arc_points(u, v, radius, first=0, last=math.tau, steps=32):
    return [(u + radius * math.cos(first + (last - first) * i / steps),
             v + radius * math.sin(first + (last - first) * i / steps)) for i in range(steps + 1)]


def add_goal(mesh, to_world, angle, u, sign, width):
    height, depth = width * 0.38, width * 0.28
    back = u + sign * depth
    for v in (-width / 2, width / 2):
        x, z = to_world(u, v)
        mesh.cylinder('sports_posts', x, SURFACE_Y, z, 0.048, height, 8)
        mesh.strip('sports_posts', to_world(u, v), to_world(back, v), 0.065, SURFACE_Y, height=0.06)
    x, z = to_world(u, 0)
    mesh.box('sports_posts', x, SURFACE_Y + height, z, 0.1, 0.085, width, angle)

    def net_segment(a, b):
        # Thin two-sided ribbons give the net a visible silhouette without a solid wall.
        ua, ya, va = a
        ub, yb, vb = b
        xa, za = to_world(ua, va)
        xb, zb = to_world(ub, vb)
        if ya == yb:
            mesh.face('sports_net', [(xa, ya - 0.009, za), (xa, ya + 0.009, za),
                                     (xb, yb + 0.009, zb), (xb, yb - 0.009, zb)])
            return
        mesh.face('sports_net', [(xa - 0.009, ya, za), (xa + 0.009, ya, za),
                                 (xb + 0.009, yb, zb), (xb - 0.009, yb, zb)])

    for i in range(21):
        v = width * (i / 20 - 0.5)
        net_segment((u, SURFACE_Y + height, v), (back, SURFACE_Y + 0.06, v))
    for i in range(1, 11):
        f = i / 10
        top = SURFACE_Y + height * (1 - f)
        ub = u + sign * depth * f
        net_segment((ub, top, -width / 2), (ub, top, width / 2))
        for v in (-width / 2, width / 2):
            net_segment((u, top, v), (ub, top, v))


def add_football(mesh, ring):
    corners = open_ring(ring)
    if signed_area(corners) > 0:
        corners.reverse()
    xs = [x for x, _ in corners]
    zs = [z for _, z in corners]
    texture_uv = [((x - min(xs)) / (max(xs) - min(xs)), (z - min(zs)) / (max(zs) - min(zs))) for x, z in corners]
    mesh.face('sports_grass', [(x, SURFACE_Y, z) for x, z in corners], uv=texture_uv)
    to_world, length, width, angle = court_frame(ring)
    half_length, half_width = length / 2 - 0.55, width / 2 - 0.55
    draw_path(mesh, to_world, [(-half_length, -half_width), (half_length, -half_width),
                               (half_length, half_width), (-half_length, half_width)], width=0.09, closed=True)
    draw_path(mesh, to_world, [(0, -half_width), (0, half_width)], width=0.085)
    center_radius = min(7.1, width * 0.15)
    draw_path(mesh, to_world, arc_points(0, 0, center_radius), width=0.085)
    center_x, center_z = to_world(0, 0)
    mesh.cylinder('sports_paint', center_x, MARKING_Y, center_z, 0.09, 0.004, 12)
    goal_width = min(6.0, width * 0.15)
    for sign in (-1, 1):
        baseline = sign * half_length
        for depth, box_half_width in ((length * 0.16, width * 0.30), (length * 0.055, width * 0.13)):
            front = baseline - sign * depth
            draw_path(mesh, to_world, [(baseline, -box_half_width), (front, -box_half_width),
                                       (front, box_half_width), (baseline, box_half_width)], width=0.085)
        spot_x, spot_z = to_world(baseline - sign * length * 0.10, 0)
        mesh.cylinder('sports_paint', spot_x, MARKING_Y, spot_z, 0.09, 0.004, 12)
        add_goal(mesh, to_world, angle, baseline, sign, goal_width)


def add_hoop(mesh, to_world, angle, baseline, sign):
    stand = baseline + sign * 0.30
    board = baseline - sign * 0.50
    hoop = board - sign * 0.27
    x, z = to_world(stand, 0)
    mesh.cylinder('sports_hoop_support', x, SURFACE_Y, z, 0.075, 3.25, 10)
    mesh.strip('sports_hoop_support', (x, z), to_world(board, 0), 0.095, 3.15, height=0.11)
    x, z = to_world(board, 0)
    mesh.box('sports_board', x, 2.85, z, 0.075, 1.04, 1.70, angle)
    x, z = to_world(board - sign * 0.044, 0)
    mesh.box('sports_hoop_support', x, 3.06, z, 0.018, 0.035, 0.55, angle)
    mesh.box('sports_hoop_support', x, 3.44, z, 0.018, 0.035, 0.55, angle)
    for v in (-0.275, 0.275):
        x, z = to_world(board - sign * 0.044, v)
        mesh.box('sports_hoop_support', x, 3.06, z, 0.018, 0.38, 0.03, angle)
    rim = arc_points(hoop, 0, 0.23, steps=16)
    for a, b in zip(rim, rim[1:]):
        mesh.strip('sports_rim', to_world(*a), to_world(*b), 0.024, 3.07, height=0.023)


def add_basketball(mesh, ring, blue):
    mesh.surface('sports_court_blue' if blue else 'sports_court_green', ring, SURFACE_Y)
    to_world, length, width, angle = court_frame(ring)
    half_length, half_width = length / 2 - 0.34, width / 2 - 0.34
    draw_path(mesh, to_world, [(-half_length, -half_width), (half_length, -half_width),
                               (half_length, half_width), (-half_length, half_width)], closed=True)
    draw_path(mesh, to_world, [(0, -half_width), (0, half_width)])
    key_half_width = width * 0.15
    circle_radius = min(1.8, width * 0.12)
    if blue:
        mesh.surface('sports_court_key', [to_world(*p) for p in arc_points(0, 0, circle_radius)], MARKING_Y - 0.023)
    draw_path(mesh, to_world, arc_points(0, 0, circle_radius))
    for sign in (-1, 1):
        baseline = sign * half_length
        key = baseline - sign * length * 0.19
        if blue:
            mesh.surface('sports_court_key', [to_world(u, v) for u, v in (
                (baseline, -key_half_width), (key, -key_half_width), (key, key_half_width), (baseline, key_half_width),
            )], MARKING_Y - 0.023)
        draw_path(mesh, to_world, [(baseline, -key_half_width), (key, -key_half_width),
                                   (key, key_half_width), (baseline, key_half_width)])
        draw_path(mesh, to_world, arc_points(key, 0, circle_radius))
        radius = min(6.75, half_width * 0.90, length * 0.24)
        start, end = (math.pi / 2, 3 * math.pi / 2) if sign > 0 else (-math.pi / 2, math.pi / 2)
        center = baseline - sign * length * 0.055
        arc = arc_points(center, 0, radius, start, end)
        draw_path(mesh, to_world, [(baseline, arc[0][1]), *arc, (baseline, arc[-1][1])])
        add_hoop(mesh, to_world, angle, baseline, sign)


def grain_texture(seed, contrast):
    """Return an original repeatable neutral surface texture as an in-memory PNG."""
    random_values = random.Random(seed)
    size = 64
    data = b''.join(b'\0' + bytes(random_values.randint(241 - contrast, 241 + contrast) for _ in range(size))
                    for _ in range(size))

    def chunk(tag, contents):
        return struct.pack('!I', len(contents)) + tag + contents + struct.pack('!I', zlib.crc32(tag + contents))

    header = struct.pack('!2I5B', size, size, 8, 0, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', zlib.compress(data)) + chunk(b'IEND', b''), 'image/png'


def winter_turf():
    """Original turf material with broad dry patches observed in the January image."""
    size = 512
    rng = np.random.default_rng(20260125)
    z, x = np.indices((size, size), dtype=float) / (size - 1)
    cloud = Image.fromarray(rng.integers(82, 163, (31, 31), dtype=np.uint8)).resize((size, size), Image.Resampling.BICUBIC)
    variation = (np.asarray(cloud, dtype=float) - 127) / 58
    dry = np.zeros((size, size))
    for cx, cz, wx, wz, strength in (
        (0.55, 0.29, 0.10, 0.12, 0.87), (0.41, 0.49, 0.077, 0.16, 0.68),
        (0.25, 0.62, 0.12, 0.09, 0.55), (0.58, 0.66, 0.12, 0.075, 0.48),
        (0.64, 0.79, 0.08, 0.105, 0.52), (0.46, 0.87, 0.13, 0.06, 0.32),
    ):
        dry += strength * np.exp(-((x - cx) / wx) ** 2 - ((z - cz) / wz) ** 2)
    dry = np.clip(dry * (0.94 + 0.28 * variation), 0, 1)
    base, soil = np.array([154, 148, 109]), np.array([118, 99, 72])
    colors = base + dry[:, :, None] * (soil - base)
    colors += variation[:, :, None] * 11 + rng.normal(0, 4, (size, size, 1))
    image = Image.fromarray(np.uint8(np.clip(colors, 0, 255)))
    buffer = BytesIO()
    image.save(buffer, 'JPEG', quality=89, optimize=True)
    return buffer.getvalue(), 'image/jpeg'


def west_stands(mesh, collision, campus):
    # The 2018 photograph shows the tiers and canopy. The long roof and the
    # exposed platforms at both ends are also visible in the 2026 aerial view.
    north, south = (-88.8, -75.4), (-113.6, -39.2)
    span = math.dist(north, south)
    dx, dz = (south[0] - north[0]) / span, (south[1] - north[1]) / span
    center_x, center_z = (north[0] + south[0]) / 2, (north[1] + south[1]) / 2
    angle = math.atan2(dz, dx)

    def at(u, v):
        return center_x + u * dx + v * dz, center_z + u * dz - v * dx

    def block(material, u, v, y, length, height, depth, solid=False):
        x, z = at(u, v)
        mesh.box(material, x, y, z, length, height, depth, angle)
        if solid:
            collision.box('collider', x, y, z, length, height, depth, angle)

    deck = Polygon([at(-span / 2, -2.20), at(-span / 2, 3.00),
                    at(span / 2, 3.00), at(span / 2, -2.20)]).intersection(campus)
    slab(mesh, deck, -0.03, 0.12, 'stand_paving')
    slab(collision, deck, -0.03, 0.12, 'collider')
    for row in range(4):
        height = 0.28 + row * 0.29
        front = 1.51 - row * 0.78
        rear = -2.18
        block('stand_concrete', 0, (front + rear) / 2, 0.12, 32.5, height, front - rear, solid=True)
        block('stand_edge', 0, front - 0.02, height + 0.089, 32.5, 0.047, 0.053)
    for sign in (-1, 1):
        for index in range(7):
            height = (index + 1) * 0.165
            u = sign * (18.85 - index * 0.36)
            block('stand_concrete', u, -0.87, 0.12, 0.36, height, 2.4, solid=True)
        for u in (sign * 16.2, sign * 19.1):
            block('stand_steel', u, -2.12, 0.22, 0.067, 1.38, 0.067)
        start, end = at(sign * 16.2, -2.12), at(sign * 19.1, -2.12)
        mesh.strip('stand_steel', start, end, 0.057, 1.59, 0.061)

    # Thin, shallow-sloped roof on light columns. The front faces the track.
    for u in (-10.2, -6.1, -2.0, 2.1, 6.2, 10.3):
        for v in (-1.92, 1.35):
            block('stand_steel', u, v, 0.13 if v > 0 else 1.26, 0.10, 3.58 if v > 0 else 2.68, 0.10, solid=True)
        a, b = at(u, -2.39), at(u, 2.76)
        mesh.strip('stand_steel', a, b, 0.087, 3.67, 0.105)
    roof_a, roof_b = at(-11.95, -2.64), at(-11.95, 2.71)
    roof_c, roof_d = at(11.95, 2.71), at(11.95, -2.64)
    roof = [(x, y, z) for (x, z), y in zip((roof_d, roof_c, roof_b, roof_a), (4.03, 3.79, 3.79, 4.03))]
    mesh.face('stand_roof', roof)
    mesh.face('stand_steel', [(x, y - 0.087, z) for x, y, z in reversed(roof)])
    for (x, y, z), (xx, yy, zz) in loop_edges(roof):
        mesh.face('stand_edge', [(x, y - 0.087, z), (xx, yy - 0.087, zz), (xx, yy, zz), (x, y, z)])
    collision.face('collider', roof)
    for u in range(-11, 12):
        a, b = at(u, -2.62), at(u, 2.69)
        mesh.face('stand_edge', [(a[0], 4.043, a[1]), (a[0] + dx * 0.038, 4.043, a[1] + dz * 0.038),
                                 (b[0] + dx * 0.038, 3.803, b[1] + dz * 0.038), (b[0], 3.803, b[1])])


def trackside(mesh, collision, features):
    for name, color, grout, seed in (
        ('stand_paving', (181, 174, 153), (166, 159, 141), 34),
        ('stand_concrete', (189, 185, 169), (174, 169, 153), 17),
    ):
        mesh.material(name, (255, 255, 255), texture=tile(color, seed, grout, 'paving'))
    for name, color in (
        ('stand_roof', (130, 143, 136)), ('stand_edge', (114, 123, 113)), ('stand_steel', (171, 179, 166)),
        ('court_apron', (134, 110, 100)), ('apron_grass', (118, 127, 80)), ('sports_border', (142, 142, 128)),
        ('sports_lamp', (82, 88, 86)),
    ):
        mesh.material(name, color)
    campus = Polygon(features[1084438083][0])
    west_stands(mesh, collision, campus)
    track = Polygon(features[TRACK_ID][0])
    courts = unary_union([Polygon(features[ident][0]) for ident in BASKETBALL_IDS[-2:]])
    apron = courts.buffer(1.62, join_style='mitre').difference(courts).intersection(campus)
    slab(mesh, apron, 0.024, 0.024, 'court_apron')
    green = Polygon([(-135, 32), (-126, 18), (-116, 25), (-100, 29), (-83, 26), (-83, 42), (-122, 44)])
    green = green.intersection(campus).difference(track.union(courts.buffer(1.63)))
    slab(mesh, green, -0.012, -0.012, 'apron_grass')
    walkway = LineString([(-125, 39.6), (-119, 35.0), (-109, 34.5), (-104, 36.5), (-93, 36.2), (-81, 35.1)])
    paving = walkway.buffer(1.67).intersection(campus).difference(track)
    slab(mesh, paving, 0.017, 0.017, 'stand_paving')
    lane = LineString([(-131.4, 15.0), (-133.2, 23.5), (-136.0, 36.6)])
    slab(mesh, lane.buffer(1.07).intersection(campus).difference(track), 0.018, 0.018, 'sports_infield')
    for i, (x, z, width, depth) in enumerate(((-122, 29, 6.0, 4.0), (-111.1, 39.4, 9.0, 4.7))):
        bed = Polygon(rounded(x, z, width, depth, depth * 0.43)).intersection(campus).difference(track)
        slab(mesh, bed, 0.02, 0.21, 'curb', 'planter')
        for offset in (-width * 0.23, 0, width * 0.23):
            if bed.covers(Point(x + offset, z)):
                foliage(mesh, x + offset, z, 0.61 if offset else 0.92, 704 + i, 0.21)

    # Low straight edge separating the running surface from the paved forecourt.
    # Heights here are inferred from the photo, with the campus grade left unchanged.
    a, b = (-61.1, 15.7), (-31.7, -32.6)
    edge = LineString([a, b]).buffer(0.14, cap_style='flat').intersection(campus).difference(track)
    slab(mesh, edge, -0.01, 0.19, 'sports_border')
    slab(collision, edge, 0.0, 0.19, 'collider')
    for x, z in ((-124.7, 36.9), (-83.2, 32.6), (-43.5, -42.0), (58.7, -64.2)):
        if not campus.covers(Point(x, z)) or track.covers(Point(x, z)):
            continue
        mesh.cylinder('stand_steel', x, 0, z, 0.076, 6.15, 8)
        mesh.box('stand_steel', x, 5.96, z, 0.83, 0.08, 0.09)
        for offset in (-0.29, 0.29):
            mesh.box('sports_lamp', x + offset, 6.01, z, 0.32, 0.22, 0.21)


def add_sports(visual, collision, features):
    """Append sports meshes using OSM-id-keyed polygon rings in campus (x,z) meters."""
    rubber = grain_texture(20260125, 9)
    for name, color, texture in (
        ('sports_track', (162, 82, 68), rubber),
        ('sports_infield', (167, 87, 72), rubber), ('sports_grass', (255, 255, 255), winter_turf()),
        ('sports_court_blue', (65, 90, 143), rubber), ('sports_court_key', (65, 112, 103), rubber),
        ('sports_court_green', (106, 133, 113), rubber),
    ):
        visual.material(name, color, texture=texture)
    for name, color in (
        ('sports_paint', (225, 219, 195)),
        ('sports_posts', (213, 218, 204)), ('sports_hoop_support', (47, 113, 92)),
        ('sports_board', (214, 217, 195)), ('sports_rim', (160, 68, 45)),
    ):
        visual.material(name, color)
    visual.material('sports_net', (203, 205, 187), double=True)
    add_track(visual, features[TRACK_ID], features[FOOTBALL_ID][0])
    add_football(visual, features[FOOTBALL_ID][0])
    for feature_id in BASKETBALL_IDS:
        add_basketball(visual, features[feature_id][0], feature_id in BLUE_COURTS)
    trackside(visual, collision, features)
