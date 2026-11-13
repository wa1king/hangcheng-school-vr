"""Export actor paths in metres from the same survey axes as the street mesh."""

from shapely.geometry import LineString, Point
from shapely.ops import substring

from campus_people import build_campus_people
from street_traffic import ROAD_LEVEL, street_axes


def build_street_routes(lines, world):
    aviation, _, _ = street_axes(lines)
    vehicles = []
    for direction, crossing, starts in (
        (1, -155.72, ((31, 153), (47, 220))),
        (-1, -132.07, ((48, 303), (116, 270))),
    ):
        for lane, offset in enumerate((2.05, 5.95)):
            axis = aviation.offset_curve(direction * offset)
            if direction < 0:
                axis = LineString(list(axis.coords)[::-1])
            axis = substring(axis, 3, axis.length - 3)
            stop = axis.project(Point(crossing, 100)) - 3.35
            vehicles.append({
                'points': [world(x, ROAD_LEVEL, z) for x, z in axis.coords],
                'stop': round(stop, 3),
                'start': [distance - 3 for distance in starts[lane]],
                'speed': 7.6 if lane == 0 else 8.3,
            })

    # These paths stay on the existing footway, outer shoulder and mapped zebra.
    # The road plane is lower than the shoulder on either side of the crossing.
    footway = -.009
    shoulder = -.041
    paths = [
        ([(-19, footway, 85.54), (35, footway, 85.38), (55, footway, 85.22)], None, None),
        ([(64, footway, 86.08), (35, footway, 86.26), (-23, footway, 86.66)], None, None),
        ([(-108, footway, 86.4), (-129, footway, 86.8)], None, None),
        ([(-113, shoulder, 110.8), (-130, shoulder, 110.86), (-134, shoulder, 110.8)], None, None),
        ([(-122, footway, 86.4), (-132.71, footway, 88.1), (-132.71, shoulder, 91.55),
          (-132.71, ROAD_LEVEL, 91.66), (-132.71, ROAD_LEVEL, 108.58),
          (-132.71, shoulder, 108.70), (-123, shoulder, 109.55)], 2, 5),
        ([(-122, shoulder, 109.78), (-131.36, shoulder, 109.24), (-131.36, shoulder, 108.70),
          (-131.36, ROAD_LEVEL, 108.58), (-131.36, ROAD_LEVEL, 91.66),
          (-131.36, shoulder, 91.55), (-131.36, footway, 88.1), (-123, footway, 86.95)], 2, 5),
    ]
    people = []
    for path, wait, end in paths:
        route = {'points': [world(*point) for point in path]}
        if wait is not None:
            route.update(waitAt=wait, crossingEnd=end)
        people.append(route)
    return {'vehicles': vehicles, 'people': people, 'campusPeople': build_campus_people(world)}
