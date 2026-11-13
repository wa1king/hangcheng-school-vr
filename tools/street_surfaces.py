"""Build the mapped school approach with separate road, footway and planting surfaces."""

from shapely.geometry import LineString, box
from shapely.ops import unary_union

from architecture import slab
from street_traffic import (AVIATION_HALF_WIDTH, LINGXIANG_HALF_WIDTH, ROAD_LEVEL, XUEZI_HALF_WIDTH,
                            clear_marking_zone, street_axes)


ROADSIDE_TREE_X = (-127, -106, -90, -75, -61, -49, -34, -22, 34, 46, 60, 72, 84, 95)
ROADSIDE_TREE_Z = 83.4
CURB_LEVEL = -.041
FOOTWAY_LEVEL = -.009
FORECOURT_LEVEL = .007


def build_street(mesh, campus, lines):
    center, east, west = street_axes(lines)
    road_axes = ((center, AVIATION_HALF_WIDTH), (east, LINGXIANG_HALF_WIDTH), (west, XUEZI_HALF_WIDTH))
    roadway = center.buffer(AVIATION_HALF_WIDTH, cap_style='flat')
    traffic = unary_union([axis.buffer(width, cap_style='flat') for axis, width in road_axes])
    shoulder = unary_union([axis.buffer(width + extra, cap_style='flat')
                           for (axis, width), extra in zip(road_axes, (2.6, 1.65, 1.65))])
    shoulder = shoulder.difference(traffic.union(campus))
    curb = unary_union([axis.buffer(width + .18, cap_style='flat') for axis, width in road_axes])
    curb = curb.difference(traffic.union(campus))
    footway = LineString(lines[1454566188]).buffer(1.8, cap_style='flat', join_style='mitre')
    # Join the mapped footway to the east zebra at the Xuezi Road junction.
    footway = footway.union(box(-133.9, 86.3, -130.22, 91.31))
    forecourt = box(-2.1, 55, 33, 90.4).difference(roadway)

    # Keep the entrance and mapped footpath continuous with the school surface.
    path = footway.difference(campus.union(forecourt))
    wells = unary_union([box(x - .70, ROADSIDE_TREE_Z - .83, x + .70, ROADSIDE_TREE_Z + .83)
                         for x in ROADSIDE_TREE_X])
    paved = unary_union([campus, forecourt, footway, shoulder, traffic])
    verge = box(-137, 78.7, 96.8, 89.2).difference(paved.union(wells))
    slab(mesh, traffic, ROAD_LEVEL, ROAD_LEVEL, 'road')
    slab(mesh, shoulder.difference(curb.union(forecourt).union(path)),
         -.184, CURB_LEVEL, 'street-curb', 'street-paving')
    slab(mesh, curb.difference(forecourt.union(path)), ROAD_LEVEL, CURB_LEVEL, 'street-curb')
    slab(mesh, path.difference(wells), FOOTWAY_LEVEL, FOOTWAY_LEVEL, 'street-paving')
    slab(mesh, verge, -.27, 0, 'street-soil', 'street-verge')
    slab(mesh, wells, 0, 0, 'street-soil')

    # The colored bands are flush inlays in the entrance paving.
    inlay = unary_union([box(x - .0395, 55, x + .0395, 90.1) for x in range(-2, 34, 3)]
                       + [box(-2, z - .0395, 33, z + .0395) for z in range(55, 90, 3)])
    slab(mesh, forecourt.difference(inlay), FORECOURT_LEVEL, FORECOURT_LEVEL, 'walk')
    slab(mesh, forecourt.intersection(inlay), FORECOURT_LEVEL, FORECOURT_LEVEL, 'plaza-inlay')

    # Markings and curb joints are thin material details on the underlying solid surfaces.
    clear = clear_marking_zone(center, east, west)
    for offset in (-.14, .14):
        stripes = center.offset_curve(offset).buffer(.053, cap_style='flat').intersection(roadway)
        slab(mesh, stripes.difference(clear), ROAD_LEVEL + .003, ROAD_LEVEL + .003, 'paint-yellow')
    for offset in (-7.95, 7.95):
        stripe = center.offset_curve(offset).buffer(.044, cap_style='flat').intersection(roadway)
        slab(mesh, stripe.difference(clear), ROAD_LEVEL + .003, ROAD_LEVEL + .003, 'paint-white')

    for side in (-1, 1):
        curb_center = center.offset_curve(side * 8.59)
        for index in range(1, int(curb_center.length / .98)):
            distance = index * .98
            a, b = (curb_center.interpolate(distance + delta) for delta in (-.018, .018))
            x, z = curb_center.interpolate(distance).coords[0]
            dx, dz = b.x - a.x, b.y - a.y
            scale = .091 / (dx * dx + dz * dz) ** .5
            if not curb.covers(a) or forecourt.covers(a) or path.covers(a):
                continue
            mesh.strip('curb-joint', (x - dz * scale, z + dx * scale),
                       (x + dz * scale, z - dx * scale), .008, CURB_LEVEL + .002)
