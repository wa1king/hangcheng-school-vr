"""Place the visible campus fence and closed gate on the mapped boundary."""

import math


def add_perimeter(mesh, campus, gate_center):
    def fence_run(a, b, front=False):
        length = math.dist(a, b)
        bays = max(1, round(length / 2.85))
        for bay in range(bays):
            start, end = bay / bays, (bay + 1) / bays
            x, z = along(a, b, start)
            if front:
                mesh.box('terra', x, -.28, z, .34, 1.94, .34)
                mesh.box('cream', x, 1.65, z, .39, .08, .39)
            else:
                mesh.box('blue-rail', x, .13, z, .095, 1.42, .095)
            bars = max(2, round(length / bays / .245))
            for index in range(1, bars):
                x, z = along(a, b, start + (end - start) * index / bars)
                mesh.box('blue-rail', x, .22, z, .031, 1.28, .031)
        mesh.strip('curb', a, b, .18, -.28, .51)
        mesh.strip('blue-rail', a, b, .052, 1.48, .056)

    def along(a, b, t):
        return tuple(start + (end - start) * t for start, end in zip(a, b))

    def gate(a, b):
        # Twin metal leaves with a narrow center joint and a clear view over the top.
        for start, end in ((0., .497), (.503, 1.)):
            left, right = along(a, b, start), along(a, b, end)
            for y in (.135, .78, 1.39):
                mesh.strip('blue-rail', left, right, .064, y, .058)
            count = round(math.dist(left, right) / .165)
            for index in range(count + 1):
                x, z = along(left, right, index / count)
                thickness = .07 if index in (0, count) else .028
                mesh.box('blue-rail', x, .12, z, thickness, 1.33, thickness)

    ring = list(campus.exterior.coords)
    for a, b in zip(ring, ring[1:]):
        front = min(a[1], b[1]) > 75
        if front and min(a[0], b[0]) < gate_center < max(a[0], b[0]):
            if a[0] > b[0]:
                a, b = b, a
            left, right = (along(a, b, (gate_center + offset - a[0]) / (b[0] - a[0]))
                           for offset in (-4.35, 4.35))
            fence_run(a, left, front=True)
            fence_run(right, b, front=True)
            x, z = left
            mesh.box('terra', x, -.28, z, .34, 1.94, .34)
            mesh.box('cream', x, 1.65, z, .39, .08, .39)
            gate(left, right)
        else:
            fence_run(a, b, front)
