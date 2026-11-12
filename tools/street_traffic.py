"""Markings and traffic furniture for the two mapped Aviation Road junctions."""

import math

from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import unary_union


AVIATION_HALF_WIDTH = 8.5
LINGXIANG_HALF_WIDTH = 7.5
XUEZI_HALF_WIDTH = 5.8
ROAD_LEVEL = -.129
MARKING_LEVEL = ROAD_LEVEL + .003


def street_axes(lines):
    aviation = LineString(lines[760669882] + lines[760669885][1:]).intersection(box(-218, -168, 208, 145))
    # OpenStreetMap ways 242945759 and 101317329, sampled in site metres.
    lingxiang = LineString([(105.86, -98.81), (106.78, -35.86), (108.77, 100.0), (110.67, 229.43)])
    xuezi = LineString([(-142.99, 100.13), (-141.27, 231.87)])
    return aviation, lingxiang, xuezi


def road_directions(axis, distance):
    before = axis.interpolate(max(0, distance - .5))
    after = axis.interpolate(min(axis.length, distance + .5))
    dx, dz = after.x - before.x, after.y - before.y
    length = math.hypot(dx, dz)
    return dx / length, dz / length


def crosswalks(aviation, lingxiang, xuezi):
    # OSM crossings, with south-side bands shifted just clear of the road union.
    for axis, half_width, locations in (
        (aviation, AVIATION_HALF_WIDTH, (-155.72, -132.07, 98.09, 126.60)),
        (lingxiang, LINGXIANG_HALF_WIDTH, (79.59, 112.15)),
        (xuezi, XUEZI_HALF_WIDTH, (111.1,)),
    ):
        for location in locations:
            target = Point(location, 100) if axis is aviation else Point(axis.centroid.x, location)
            distance = axis.project(target)
            yield axis.interpolate(distance), road_directions(axis, distance), half_width


def marking_band(center, direction, half_width, half_length):
    x, z = center.x, center.y
    dx, dz = direction
    return Polygon([(x + a * dx - b * dz, z + a * dz + b * dx)
                    for a, b in ((-half_length, -half_width), (half_length, -half_width),
                                 (half_length, half_width), (-half_length, half_width))])


def clear_marking_zone(aviation, lingxiang, xuezi):
    crossings = [marking_band(center, direction, width + .8, 2.0)
                 for center, direction, width in crosswalks(aviation, lingxiang, xuezi)]
    return unary_union([*crossings, lingxiang.buffer(LINGXIANG_HALF_WIDTH + .8),
                        xuezi.buffer(XUEZI_HALF_WIDTH + .8)])


def draw_crosswalk(mesh, center, direction, half_width):
    dx, dz = direction
    count = int(half_width / .38)
    for index in range(count):
        offset = (index - (count - 1) / 2) * .76
        stripe = Point(center.x - dz * offset, center.y + dx * offset)
        mesh.surface('traffic-stripe', marking_band(stripe, direction, .19, 1.7).exterior.coords, MARKING_LEVEL)


def lane_dashes(mesh, axis, offset, clear, material='traffic-stripe'):
    lane = axis.offset_curve(offset)
    for distance in range(3, int(lane.length) - 4, 9):
        mark = LineString([lane.interpolate(distance), lane.interpolate(distance + 3.5)])
        if not clear.intersects(mark):
            a, b = mark.coords
            mesh.strip(material, a, b, .105, MARKING_LEVEL)


def stop_bar(mesh, axis, at, half_width, forward):
    distance = axis.project(at)
    dx, dz = road_directions(axis, distance)
    point = axis.interpolate(distance - 3.35 * forward)
    # Keep the opposite carriageway clear.
    a = (point.x - dz * forward * .26, point.y + dx * forward * .26)
    b = (point.x - dz * forward * (half_width - .18), point.y + dx * forward * (half_width - .18))
    mesh.strip('traffic-stripe', a, b, .35, MARKING_LEVEL)


def signal_materials(mesh):
    mesh.material('traffic-stripe', (215, 213, 202), .92, solid=False)
    mesh.material('traffic-center', (224, 183, 79), .92, solid=False)
    mesh.material('traffic-post', (142, 153, 154), .75, .14)
    mesh.material('traffic-housing', (44, 49, 50), .84, double=True)
    mesh.material('traffic-bezel', (27, 33, 33), .76)
    mesh.material('traffic-sign', (35, 81, 136), .86)
    mesh.material('traffic-sign-white', (227, 227, 215), .86)
    for axis in ('aviation', 'xuezi'):
        for name, color in (('red', (78, 28, 25)), ('yellow', (81, 58, 29)), ('green', (24, 65, 44))):
            mesh.material(f'traffic-lens-{axis}-{name}', color, .57)


def signal_post(mesh, post, arm_tip):
    x, z = post
    mesh.cylinder('traffic-post', x, -.04, z, .22, .15, 10)
    mesh.cylinder('traffic-post', x, .11, z, .122, 5.55, 10)
    mesh.strip('traffic-post', post, arm_tip, .133, 5.46, .13)


def signal_head(mesh, axis, position, facing):
    x, z = position
    fx, fz = facing
    rx, rz = -fz, fx
    height = 5.24
    angle = math.atan2(rz, rx)
    mesh.box('traffic-housing', x, height - .24, z, 1.53, .48, .19, angle)
    mesh.box('traffic-post', x, height + .20, z, .15, .20, .17, angle)

    def lens(radius, depth, offset, theta):
        across = offset + radius * math.cos(theta)
        return x + rx * across + fx * depth, height + radius * math.sin(theta), z + rz * across + fz * depth

    for index, name in enumerate(('red', 'yellow', 'green')):
        offset = (index - 1) * .445
        for material, radius, depth in (('traffic-bezel', .182, .108), (f'traffic-lens-{axis}-{name}', .145, .120)):
            mesh.face(material, [lens(radius, depth, offset, -step * math.tau / 16) for step in range(16)])
        for step in range(10):
            a, b = (math.pi * t / 10 for t in (step, step + 1))
            lip_a, lip_b = (.19 + .12 * math.sin(t) for t in (a, b))
            mesh.face('traffic-housing', [lens(.178, .097, offset, a), lens(.178, lip_a, offset, a),
                                          lens(.178, lip_b, offset, b), lens(.178, .097, offset, b)])


def crossing_sign(mesh, x, z, facing):
    fx, fz = facing
    rx, rz = -fz, fx
    y = 2.62
    mesh.cylinder('traffic-post', x, -.045, z, .053, y + .3, 8)
    mesh.box('traffic-sign', x, y - .31, z, .62, .62, .049, math.atan2(rz, rx))

    def front(points, depth):
        return [(x + rx * u + fx * depth, y + v, z + rz * u + fz * depth) for u, v in reversed(points)]

    mesh.face('traffic-sign-white', front([(-.247, -.21), (.247, -.21), (0, .24)], .03))
    head = [(.023 + .032 * math.cos(i * math.tau / 10), .088 + .032 * math.sin(i * math.tau / 10))
            for i in range(10)]
    mesh.face('traffic-bezel', front(head, .034))
    for (u, v), (U, V) in (((.014, .034), (-.02, -.083)), ((.014, .025), (.079, -.037)),
                          ((.006, .022), (-.073, -.042)), ((-.020, -.077), (-.079, -.167)),
                          ((-.020, -.077), (.061, -.167))):
        length = math.hypot(U - u, V - v)
        nx, ny = -(V - v) * .015 / length, (U - u) * .015 / length
        mesh.face('traffic-bezel', front([(u - nx, v - ny), (U - nx, V - ny),
                                          (U + nx, V + ny), (u + nx, v + ny)], .034))


def add_traffic(mesh, lines):
    aviation, lingxiang, xuezi = street_axes(lines)
    signal_materials(mesh)
    clear = clear_marking_zone(aviation, lingxiang, xuezi)
    for center, direction, width in crosswalks(aviation, lingxiang, xuezi):
        draw_crosswalk(mesh, center, direction, width)

    # Lane separators on the four-lane avenue and stopping bars at the signalized T.
    for side in (-1, 1):
        lane_dashes(mesh, aviation, side * 3.75, clear)
    side_road_clear = unary_union([aviation.buffer(AVIATION_HALF_WIDTH + 1.2),
                                  *[marking_band(center, direction, width + .5, 2)
                                    for center, direction, width in crosswalks(aviation, lingxiang, xuezi)]])
    for axis in (lingxiang, xuezi):
        lane_dashes(mesh, axis, 0, side_road_clear, 'traffic-center')
    stop_bar(mesh, aviation, Point(-155.72, 100.13), AVIATION_HALF_WIDTH, 1)
    stop_bar(mesh, aviation, Point(-132.07, 100.12), AVIATION_HALF_WIDTH, -1)
    stop_bar(mesh, xuezi, Point(-142.83, 111.1), XUEZI_HALF_WIDTH, -1)

    # Shenzhen Traffic Police confirms signal enforcement at Aviation Road / Xuezi Road.
    for axis, base, tip, direction, heads in (
        ('aviation', (-150.85, 90.25), (-150.85, 97.3), (1, 0), ((-150.85, 93.1), (-150.85, 96.8))),
        ('aviation', (-134.7, 109.91), (-134.7, 102.95), (-1, 0), ((-134.7, 106.9), (-134.7, 103.2))),
        ('xuezi', (-136.0, 90.25), (-141.3, 90.25), (0, 1), ((-140.35, 90.25),)),
    ):
        signal_post(mesh, base, tip)
        for position in heads:
            signal_head(mesh, axis, position, direction)

    # Crossing signs on the unsignalized east approaches, mounted outside the carriageways.
    for x, z, direction in ((95.7, 110.3, (-1, 0)), (117.1, 75.8, (0, -1)),
                            (130.1, 91.8, (1, 0)), (117.4, 116.1, (0, 1))):
        crossing_sign(mesh, x, z, direction)
