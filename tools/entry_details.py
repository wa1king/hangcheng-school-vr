"""Walkable finishes and construction details for the main entrance."""

from shapely.geometry import box

from mesh import rect


STAIR_LEFT = 2.20
STAIR_RIGHT = 19.30
STAIR_CENTER = (STAIR_LEFT + STAIR_RIGHT) / 2
STAIR_WIDTH = STAIR_RIGHT - STAIR_LEFT
DRAIN_NEAR = 54.18
DRAIN_FAR = 54.43
DRAIN_LEVEL = -0.03


def entry_drain_opening():
    return box(STAIR_LEFT, DRAIN_NEAR, STAIR_RIGHT, DRAIN_FAR)


def draw_entry_window(mesh, left, right, front, bay):
    sill, head, back = 5.46, 14.89, front - .40
    mesh.face('sill', ((right, sill, front), (right, sill, back),
                       (left, sill, back), (left, sill, front)))
    mesh.face('soffit', ((left, head, front), (left, head, back),
                         (right, head, back), (right, head, front)))
    mesh.face('reveal', ((left, sill, front), (left, sill, back),
                          (left, head, back), (left, head, front)))
    mesh.face('reveal', ((right, sill, back), (right, sill, front),
                          (right, head, front), (right, head, back)))

    # Short spandrel bands hide the slab edges behind the full-height vertical slots.
    levels = (sill, 6.55, 7.55, 8.17, 9.88, 11.55, 12.19, 13.55, head)
    for index, (low, high) in enumerate(zip(levels, levels[1:])):
        glass = 'glass-deep' if high - low < .65 else ('glass-light' if (bay + index) % 5 == 2 else 'glass-dusk')
        mesh.face(glass, ((right, low, back), (right, high, back),
                          (left, high, back), (left, low, back)),
                  uv=((1, 1), (1, 0), (0, 0), (0, 1)))

    rail_z = back + .034
    for x in (left + .032, right - .032):
        mesh.box('entry-aluminum', x, sill, rail_z, .064, head - sill, .068)
    for level in (*levels[:-1], head - .057):
        mesh.box('entry-aluminum', (left + right) / 2, level, rail_z, right - left - .128, .057, .068)
    mesh.box('sill', (left + right) / 2, sill - .016, (front + back) / 2,
             right - left, .029, front - back + .052)


def draw_entry_steps(mesh):
    for step in range(8):
        front = 53.6 - step * .42
        rear = front - .42 if step < 7 else 40.3
        top = (step + 1) * .145
        coping = .036
        overhang = .015
        mesh.box('plaza', STAIR_CENTER, 0, (front + rear) / 2,
                 STAIR_WIDTH, top - coping, front - rear)
        rim = rect(STAIR_CENTER, (front + overhang + rear) / 2, STAIR_WIDTH, front + overhang - rear)
        mesh.face('entry-nosing', [(x, top - coping, z) for x, z in rim])
        for a, b in zip(rim, rim[1:] + rim[:1]):
            mesh.face('entry-nosing', ((a[0], top - coping, a[1]), (a[0], top, a[1]),
                                        (b[0], top, b[1]), (b[0], top - coping, b[1])))
        # The slip-resistant insert is part of the tread, with no coplanar overlay.
        for material, start, end in (('entry-stone', rear, front - .057),
                                     ('entry-traction', front - .057, front - .017),
                                     ('entry-nosing', front - .017, front + overhang)):
            mesh.surface(material, rect(STAIR_CENTER, (start + end) / 2, STAIR_WIDTH, end - start), top)


def draw_entry_piers(mesh, center, front, pier_centers):
    mesh.box('soffit', center, 4.48, front - .35, 21.30, .32, 3.24)
    mesh.box('cream', center, 4.44, front + 1.256, 21.30, .08, .085)
    for index, x in enumerate(pier_centers):
        foot = 1.16 if 0 < index < len(pier_centers) - 1 else -.03
        mesh.box('entry-plinth', x, foot, 37.8, .89, .16, .90)
        mesh.box('cream', x, foot + .16, 37.8, .77, 4.33 - foot - .16, .78)
        mesh.box('soffit', x, 4.33, 37.65, .89, .15, 1.22)
    for x in (3.7, 10.77, 17.98):
        for y, z in ((4.48, 37.12), (3.74, 33.55), (3.74, 29.70)):
            mesh.box('entry-aluminum', x, y - .075, z, 1.18, .078, .16)
            mesh.box('teaching-lamp', x, y - .097, z, 1.095, .023, .108)
    for z in (35.85, 31.24, 27.0):
        mesh.box('soffit', center, 3.51, z, 22.2, .235, .35)


def add_entry_details(mesh):
    mesh.material('entry-plinth', (132, 131, 124), .91)
    mesh.material('entry-aluminum', (51, 61, 62), .40, metallic=.35)
    mesh.material('entry-nosing', (149, 147, 138), .87)
    mesh.material('entry-traction', (122, 121, 113), .96)
    mesh.material('entry-drain-channel', (78, 77, 70), .95)
    mesh.material('entry-drain-frame', (82, 85, 81), .61, metallic=.22)
    mesh.material('entry-drain-grate', (122, 126, 120), .55, metallic=.28)

    depth = DRAIN_FAR - DRAIN_NEAR
    center_z = (DRAIN_FAR + DRAIN_NEAR) / 2
    mesh.surface('entry-drain-channel', rect(STAIR_CENTER, center_z, STAIR_WIDTH, depth), -.187)
    for z in (DRAIN_NEAR + .014, DRAIN_FAR - .014):
        mesh.box('entry-drain-channel', STAIR_CENTER, -.187, z, STAIR_WIDTH, .126, .028)
        mesh.box('entry-drain-frame', STAIR_CENTER, -.062, z, STAIR_WIDTH, .032, .028)
    for x in (STAIR_LEFT + .015, STAIR_RIGHT - .015):
        mesh.box('entry-drain-frame', x, -.187, center_z, .030, .157, depth - .056)

    # The grate bars and channel are structural geometry and share the walk surface level.
    panels = 12
    panel_width = (STAIR_WIDTH - .06) / panels
    for panel in range(panels):
        start = STAIR_LEFT + .03 + panel * panel_width
        for bar in range(20):
            x = start + (bar + .5) * (panel_width / 20)
            mesh.box('entry-drain-grate', x, -.049, center_z, .038, .019, depth - .052)
        if panel:
            mesh.box('entry-drain-frame', start, -.063, center_z, .018, .033, depth - .052)
