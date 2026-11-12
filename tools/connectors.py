"""Illustrative upper-floor corridor linking the teaching wing and west reading area."""

import math

from shapely.geometry import box
from shapely.geometry.polygon import orient


CROSSOVER_DOOR = (24.95, 26.45)
EAST_RETURN = box(24.1, 16.0, 27.4, 31.5)
CROSS_BRIDGE = box(-37.0, 28.0, 27.4, 31.5)
WEST_READING_AREA = box(-42.0, 27.25, -35.5, 34.5)
CONNECTOR_AREA = orient(EAST_RETURN.union(CROSS_BRIDGE).union(WEST_READING_AREA), sign=1)


def connector_wall(mesh, a, b, y, top):
    length = math.dist(a, b)
    dx, dz = (b[0] - a[0]) / length, (b[1] - a[1]) / length
    x = (a[0] + b[0]) / 2 - dz * 0.075
    z = (a[1] + b[1]) / 2 + dx * 0.075
    angle = math.atan2(dz, dx)
    mesh.box('teaching-dado', x, y, z, length, 0.76, 0.15, angle)
    mesh.box('teaching-wall', x, y + 0.76, z, length, top - y - 0.76, 0.15, angle)


def overhead_light(mesh, x, z, top, across=False):
    angle = math.pi / 2 if across else 0
    mesh.box('teaching-metal', x, top - 0.064, z, 1.36, 0.064, 0.23, angle)
    mesh.box('teaching-lamp', x, top - 0.074, z, 1.28, 0.024, 0.17, angle)


def reading_area(mesh, y):
    # Window-height book shelving and a bench keep the central turning space open.
    for z in (29.6, 32.0):
        mesh.box('teaching-wood-edge', -41.25, y, z, 0.10, 1.72, 2.25)
        for end in (z - 1.10, z + 1.10):
            mesh.box('teaching-wood-edge', -41.02, y, end, 0.44, 1.72, 0.052)
        for tier in range(4):
            shelf_y = y + 0.22 + tier * 0.40
            mesh.box('teaching-wood', -41.02, shelf_y, z, 0.44, 0.058, 2.25)
            for index, color in enumerate(('chalkboard', 'terra', 'teaching-wood', 'blue-cap')):
                mesh.box(color, -41.04, shelf_y + 0.058, z - 0.64 + index * 0.115,
                         0.23, 0.22 + (index % 2) * 0.06, 0.094)
    mesh.box('teaching-wood', -39.0, y + 0.36, 33.8, 3.2, 0.076, 0.60)
    for x in (-40.4, -37.6):
        mesh.box('teaching-metal', x, y, 33.8, 0.07, 0.36, 0.53)
    mesh.box('teaching-dado', -39.0, y + 0.436, 33.8, 3.05, 0.07, 0.49)


def build_connectors(mesh, floors, floor_height):
    boundary = list(CONNECTOR_AREA.exterior.coords)
    for level in range(1, floors):
        y = level * floor_height
        slab_depth = 0.55 if level == floors - 1 else 0.28
        top = y + floor_height - slab_depth
        for a, b in zip(boundary, boundary[1:]):
            if a[1] == b[1] == EAST_RETURN.bounds[1]:
                continue  # The existing wing supplies the open framed doorway.
            connector_wall(mesh, a, b, y, top)
        for z in (18.5, 23.5):
            overhead_light(mesh, 25.75, z, top, across=True)
        for x in (-32, -26, -20, -14, -8, -2, 4, 10, 16, 22):
            overhead_light(mesh, x, 29.75, top)
        for z in (29.2, 32.4):
            overhead_light(mesh, -39.6, z, top)
        for x in (-28, -12, 4, 20):
            mesh.box('teaching-wood-edge', x, y + 1.04, 31.29, 2.75, 0.99, 0.12)
            mesh.box('chalkboard', x, y + 1.11, 31.22, 2.60, 0.84, 0.025)
        reading_area(mesh, y)
