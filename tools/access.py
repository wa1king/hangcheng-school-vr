"""Illustrative floor plans for the three smaller building footprints."""

import math
from contextlib import contextmanager

from shapely.geometry import Polygon

from connectors import overhead_light
from mesh import rect


HALF_WIDTH = 6.20
DEPTH = 10.25
STAIR_START, STAIR_BACK = 3.55, 9.65
STAIR_LEFT, STAIR_RIGHT = 0.28, 4.58
FLIGHTS = ((0.36, 2.24), (2.58, 4.50))


class BuildingAccess:
    def __init__(self, edge, label):
        a, b = edge
        self.edge = edge
        self.label = label
        self.length = math.dist(a, b)
        self.x, self.z = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        self.dx, self.dz = (b[0] - a[0]) / self.length, (b[1] - a[1]) / self.length
        self.area = self.polygon(-HALF_WIDTH, -0.18, HALF_WIDTH, DEPTH)
        self.stair_void = self.polygon(STAIR_LEFT, STAIR_START, STAIR_RIGHT, STAIR_BACK)

    def point(self, u, v):
        return self.x + u * self.dx - v * self.dz, self.z + u * self.dz + v * self.dx

    def polygon(self, a, b, c, d):
        return Polygon([self.point(u, v) for u, v in rect((a+c)/2, (b+d)/2, c-a, d-b)])

    @contextmanager
    def draw(self, mesh):
        previous = mesh.transform

        def transform(u, y, v):
            x, z = self.point(u, v)
            return previous(x, y, z)

        mesh.transform = transform
        try:
            yield
        finally:
            mesh.transform = previous


def building_access(ident, edges):
    labels = {1448555207: '西侧活动楼', 1448555203: '北侧教学楼', 1448555206: '东南综合楼'}
    if ident not in labels:
        return None
    for a, b in edges:
        x, z = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        if ((ident == 1448555207 and -32 < x < -26 and 6 < z < 8) or
                (ident == 1448555203 and x > 85 and -78 < z < -70) or
                (ident == 1448555206 and x > 90 and 39 < z < 48)):
            return BuildingAccess((a, b), labels[ident])
    raise ValueError(f'Entrance edge missing for {ident}')


def wall_x(mesh, a, b, v, y, height, material='teaching-wall'):
    if b > a:
        mesh.box(material, (a+b)/2, y, v, b-a, height, .16)


def opening(mesh, a, b, door, width, v, y, height, material='teaching-wall'):
    left, right = door - width / 2, door + width / 2
    wall_x(mesh, a, left, v, y, height, material)
    wall_x(mesh, right, b, v, y, height, material)
    wall_x(mesh, left, right, v, y + 2.55, height - 2.55, material)
    for u in (left, right):
        mesh.box('teaching-metal', u, y, v, .052, 2.55, .22)
    wall_x(mesh, left, right, v, y + 2.51, .045, 'teaching-metal')


def guard(mesh, a, b, y):
    length = math.dist(a, b)
    mesh.strip('blue-cap', a, b, .055, y + 1.012, .048)
    count = max(1, math.ceil(length / .17))
    for i in range(count + 1):
        t = i / count
        x, z = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
        mesh.box('blue-rail', x, y, z, .031, 1.035, .031)


def switchback(mesh, base, rise):
    count = math.ceil(rise / .36)
    step_height = rise / (2 * count)
    tread = .273
    end = STAIR_START + count * tread
    for flight, (left, right) in enumerate(FLIGHTS):
        direction = 1 if flight == 0 else -1
        start = STAIR_START if flight == 0 else end
        bottom = base + flight * rise / 2
        for step in range(count):
            v = start + direction * (step + .5) * tread
            y = bottom + step * step_height
            mesh.box('stair-stone', (left+right)/2, y - .20, v, right-left, step_height + .20, tread)
            mesh.strip('stair-nosing', (left + .025, v - direction * .111),
                       (right - .025, v - direction * .111), .033, y + step_height + .002)
        for u in (left + .038, right - .038):
            rail_top = [(u-.026, bottom+1.055, start), (u-.026, bottom+rise/2+1.055, start+direction*count*tread),
                        (u+.026, bottom+rise/2+1.055, start+direction*count*tread), (u+.026, bottom+1.055, start)]
            top = rail_top if direction > 0 else rail_top[::-1]
            underside = [(x, y-.049, z) for x, y, z in top]
            mesh.face('blue-cap', top)
            mesh.face('blue-cap', underside[::-1])
            for i in range(4):
                j = (i + 1) % 4
                mesh.face('blue-cap', [top[j], top[i], underside[i], underside[j]])
            posts = math.ceil(count * tread / .17)
            for index in range(posts + 1):
                t = index / posts
                y = bottom + min(count, math.floor(count * t) + 1) * step_height
                v = start + direction * count * tread * t
                rail_y = bottom + rise / 2 * t + 1.025
                mesh.box('blue-rail', u, y, v, .031, rail_y - y, .031)
    middle = base + rise / 2
    mesh.box('stair-stone', (STAIR_LEFT+STAIR_RIGHT)/2, middle - .23, (end+STAIR_BACK)/2,
             STAIR_RIGHT-STAIR_LEFT, .23, STAIR_BACK-end)
    for u in (STAIR_LEFT, STAIR_RIGHT):
        guard(mesh, (u, end), (u, STAIR_BACK), middle)
    guard(mesh, (STAIR_LEFT, STAIR_BACK), (STAIR_RIGHT, STAIR_BACK), middle)


def furniture(mesh, y):
    from interiors import desk_top, wall_print

    mesh.box('chalkboard', -3.20, y + .95, 9.93, 3.30, 1.12, .07)
    wall_print(mesh, 'teaching-chalk-b', (-3.99, 9.892), (-4.76, 9.892), y + 1.01, .98)
    mesh.box('teaching-wood-edge', -3.35, y, 8.82, 1.04, .77, .54)
    desk_top(mesh, -3.35, y + .77, 8.82, 1.10, .60)
    for u in (-4.66, -2.07):
        for v in (4.87, 6.00, 7.18):
            desk_top(mesh, u, y + .69, v, .96, .53)
            for du in (-.39, .39):
                for dv in (-.18, .18):
                    mesh.box('teaching-metal', u + du, y, v + dv, .038, .69, .038)
            mesh.box('teaching-chair', u, y + .41, v-.44, .36, .043, .32)
            mesh.box('teaching-chair', u, y + .43, v-.57, .36, .29, .045)
            for du in (-.13, .13):
                for dv in (-.11, .11):
                    mesh.box('teaching-metal', u + du, y, v-.44 + dv, .031, .43, .031)
    # Wall-side storage and a ledge keep the teaching aisle open.
    for v in (8.2, 9.28):
        mesh.box('teaching-wood-edge', -5.84, y, v, .43, 1.24, 1.03)
        mesh.box('teaching-wood', -5.61, y + .045, v, .034, 1.14, .98)
        mesh.box('teaching-metal', -5.583, y + .72, v, .030, .04, .22)
    mesh.box('teaching-wood', -5.84, y + 1.24, 8.73, .47, .036, 2.16)
    mesh.box('classroom-display', -3.20, y + 1.09, 9.86, 1.55, .84, .082)


def plaque(mesh, name, u, y, v, width):
    a, b = u - width / 2, u + width / 2
    mesh.face(name, [(a, y, v), (a, y + .26, v), (b, y + .26, v), (b, y, v)],
              uv=[(0, 1), (0, 0), (1, 0), (1, 1)])


def build_access(mesh, access, floors, height):
    from interiors import glazed_facade, sign_texture, wall_print

    room = 'access-room-' + access.label
    room_title = {'西侧活动楼': '活动室 · 示意', '北侧教学楼': '教室 · 示意', '东南综合楼': '研习室 · 示意'}[access.label]
    mesh.material(room, (255, 255, 255), .84, texture=sign_texture(room_title, '#b7af88'), solid=False)
    with access.draw(mesh):
        for level in range(floors):
            y = level * height
            headroom = height - (.55 if level == floors - 1 else .28)
            for u in (-HALF_WIDTH + .08, HALF_WIDTH - .08):
                mesh.box('teaching-wall', u, y, DEPTH / 2, .16, headroom, DEPTH)
                mesh.box('teaching-dado', u, y, DEPTH / 2, .175, .95, DEPTH)
            wall_x(mesh, -HALF_WIDTH, HALF_WIDTH, DEPTH-.08, y, headroom)
            panes = [(-5.83, -2.06, .91, 2.69, True), (2.06, 5.83, .91, 2.69, True)]
            panes.insert(1, (-1.22, 1.22, .91, 2.69, True) if level else (-1.22, 1.22, 0, 2.64, False))
            glazed_facade(mesh, lambda u, inset: (u, inset), -HALF_WIDTH, HALF_WIDTH, y, height, panes)
            opening(mesh, -HALF_WIDTH, -.65, -3.22, 1.28, STAIR_START, y, headroom)
            plaque(mesh, room, -3.22, y + 2.65, STAIR_START - .087, 1.64)
            mesh.box('teaching-wood-edge', -5.05, y + 1.30, STAIR_START - .096, 1.05, .64, .038)
            wall_print(mesh, 'teaching-notice', (-4.56, STAIR_START - .117),
                       (-5.54, STAIR_START - .117), y + 1.33, .58)
            mesh.box('teaching-wall', -.65, y, (STAIR_START+DEPTH)/2, .16, headroom, DEPTH-STAIR_START)
            furniture(mesh, y)
            for u in (-3.9, -.8, 2.1, 4.9):
                overhead_light(mesh, u, 1.68, y + headroom)
            for v in (5.42, 7.45):
                overhead_light(mesh, -3.43, v, y + headroom, across=True)
            if level:
                for u in (STAIR_LEFT, STAIR_RIGHT):
                    guard(mesh, (u, STAIR_START), (u, STAIR_BACK), y)
                guard(mesh, (STAIR_LEFT, STAIR_BACK), (STAIR_RIGHT, STAIR_BACK), y)
            switchback(mesh, y, height + (.05 if level == floors - 1 else 0))

        roof = floors * height + .05
        for u in (STAIR_LEFT-.11, STAIR_RIGHT+.11):
            mesh.box('beige', u, roof, (2.06+STAIR_BACK)/2, .20, 2.79, STAIR_BACK-2.06+.16)
        wall_x(mesh, STAIR_LEFT-.21, STAIR_RIGHT+.21, STAIR_BACK+.08, roof, 2.79, 'beige')
        opening(mesh, STAIR_LEFT-.21, STAIR_RIGHT+.21, 3.54, 1.41, 2.06, roof, 2.79, 'beige')
        plaque(mesh, 'teaching-sign-roof', 1.37, roof + 1.67, 1.969, 1.35)
        mesh.box('roof', (STAIR_LEFT+STAIR_RIGHT)/2, roof + 2.79, (2.06+STAIR_BACK)/2,
                 STAIR_RIGHT-STAIR_LEFT+.61, .19, STAIR_BACK-2.06+.36)


def build_upper_roof_stair(mesh, base, top):
    # Open roof stair and a bridge at the northern hall's edge.
    frame = BuildingAccess(((21.4, -18.02), (32.4, -18.02)), '北侧屋顶')
    with frame.draw(mesh):
        switchback(mesh, base, top-base)
        mesh.box('stair-stone', (FLIGHTS[1][0]+FLIGHTS[1][1])/2, top-.24, 1.31,
                 FLIGHTS[1][1]-FLIGHTS[1][0], .24, 4.48)
        for u in FLIGHTS[1]:
            guard(mesh, (u, -.82), (u, STAIR_START), top)
