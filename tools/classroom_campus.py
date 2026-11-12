"""Secondary structures visible in the campus reference rendering."""

import math

from shapely.geometry import Polygon, box
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

from architecture import line_rect, slab
from mesh import rounded


ROOF_CORES = {
    19808442: (
        (-77.6, 67.0, 5.0, 4.6), (-22.1, 67.1, 4.7, 4.4), (-44.8, 30.6, 4.9, 5.2),
        (-16.7, -33.5, 5.0, 5.0), (69.3, -24.0, 4.9, 4.6), (70.0, 10.5, 5.0, 5.0),
    ),
    1448555203: ((65.8, -82.6, 4.6, 4.0),),
    1448555206: ((49.5, 67.0, 5.0, 4.5),),
}


def draw_roof_cores(mesh, roof, ident, y):
    """Fit closed service volumes without obstructing the existing roof stairs."""
    footprints = []
    for x, z, width, depth in ROOF_CORES.get(ident, ()):
        coping = Polygon(rounded(x, z, width + .4, depth + .4, .38))
        if not roof.buffer(-.48).covers(coping):
            continue
        body = Polygon(rounded(x, z, width, depth, .32))
        slab(mesh, body, y, y + 2.6, 'ref-plaster')
        slab(mesh, coping, y + 2.6, y + 2.76, 'ref-plaster')
        for slot in range(6):
            mesh.box('ref-metal', x + width * .24, y + 1.44 + slot * .091,
                     z + depth / 2 + .024, width * .28, .038, .058)
        footprints.append(coping.buffer(.3))
    return unary_union(footprints)


def register_materials(mesh):
    mesh.material('ref-plaster', (219, 216, 199), .88)
    mesh.material('ref-metal', (70, 88, 86), .54, metallic=.22)
    mesh.material('ref-green-canopy', (131, 174, 140), .42, double=True, opacity=.75)
    mesh.material('ref-tower-glass', (102, 150, 180), .27, metallic=.12, double=True, opacity=.80)


def gatehouse(mesh, campus, occupied, x, z, width, depth, yaw=0):
    cosine, sine = math.cos(yaw), math.sin(yaw)

    def outline(w, d, r):
        return orient(Polygon([(x + u * cosine - v * sine, z + u * sine + v * cosine)
                               for u, v in rounded(0, 0, w, d, r, 5)]), sign=1)

    roof = outline(width, depth, min(width, depth) * .30)
    if not campus.buffer(-.25).covers(roof) or occupied.intersects(roof):
        raise ValueError(f'Reference gatehouse outside a clear entry bay at {(x, z)}')
    walls = outline(width - .54, depth - .50, min(width, depth) * .23)
    slab(mesh, walls, -.035, .34, 'curb')
    slab(mesh, roof, 2.77, 3.03, 'ref-plaster')
    ring = list(walls.exterior.coords)
    for index, (a, b) in enumerate(zip(ring, ring[1:])):
        span = math.dist(a, b)
        glass = 'glass-light' if index % 4 else 'glass-dusk'
        line_rect(mesh, glass, a, b, .34, 2.43)
        mesh.strip('ref-metal', a, b, .048, 1.04, .046)
        for division in range(max(1, math.ceil(span / .98))):
            fraction = division / max(1, math.ceil(span / .98))
            px = a[0] + (b[0] - a[0]) * fraction
            pz = a[1] + (b[1] - a[1]) * fraction
            mesh.box('ref-metal', px, .32, pz, .047, 2.46, .047)
    # An interior mass behind the window reflects the service desk and blind wall.
    mesh.box('ref-plaster', x, .34, z, (width - .54) * .55, 1.08, (depth - .50) * .42, yaw)


def entrance_pylon(mesh):
    # The glazed marker is at the west end of the main entry court in the reference.
    x, z = -.55, 64.2
    mesh.box('curb', x, -.03, z, 2.16, .27, 2.34)
    for offset in (-.86, .86):
        mesh.box('ref-plaster', x + offset, .24, z, .38, 10.4, 1.93)
        for dz in (-.94, .94):
            mesh.box('ref-metal', x + offset, 10.64, z + dz, .12, 3.14, .12)
    mesh.box('glass-deep', x, .24, z, 1.34, 10.4, 1.56)
    mesh.box('ref-tower-glass', x, 10.64, z, 1.86, 3.08, 2.02)
    for y in (10.64, 11.65, 12.68, 13.66):
        mesh.box('blue-rail', x, y, z, 2.04, .065, 2.19)
    mesh.box('ref-metal', x, 13.78, z, 2.12, .16, 2.24)


def gallery_canopy(mesh):
    # An open covered walk in front of the long southwest teaching wing.
    left, right = -79.8, -12.0
    inner, outer = 73.48, 77.08
    for z in (inner, outer):
        mesh.strip('ref-metal', (left, z), (right, z), .115, 3.16, .13)
    bays = 20
    for index in range(bays + 1):
        x = left + (right - left) * index / bays
        mesh.strip('ref-metal', (x, inner), (x, outer), .082, 3.18, .104)
        if index % 2 == 0:
            mesh.cylinder('ref-metal', x, -.035, outer - .24, .073, 3.24, 8)
            mesh.cylinder('curb', x, -.035, outer - .24, .136, .24, 8)
    slab(mesh, box(left + .07, inner + .06, right - .07, outer - .06),
         3.275, 3.30, 'ref-green-canopy', bottom='ref-green-canopy')


def add_reference_structures(mesh, polygons):
    """Complete the gate approaches shown in the supplied bird's-eye view."""
    register_materials(mesh)
    campus = Polygon(polygons[1084438083][0])
    occupied = unary_union([Polygon(polygons[ident][0], polygons[ident][1:])
                            for ident in (19808442, 1448555207, 1448555203, 1448555206)])
    for spec in ((-1.6, 76.0, 6.6, 4.25, 0), (24.0, 76.0, 6.9, 4.1, 0),
                 (93.4, 14.1, 6.4, 3.5, math.pi / 2), (93.0, -39.4, 6.9, 3.5, math.pi / 2)):
        gatehouse(mesh, campus, occupied, *spec)
    entrance_pylon(mesh)
    gallery_canopy(mesh)
