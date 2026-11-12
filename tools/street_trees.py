"""Street trees built from curved limbs and scanned leaf sprays."""

import math
import random

import numpy as np

from material_scans import SCAN_DIR


def register_street_trees(mesh):
    # Color/alpha and branch bark derive from Poly Haven Island Tree 03 (CC0).
    leaves = (SCAN_DIR.joinpath('school-foliage.png').read_bytes(), 'image/png')
    bark = (SCAN_DIR.joinpath('school-bark.jpg').read_bytes(), 'image/jpeg')
    mesh.material('street-tree-bark', (224, 215, 202), .91, texture=bark)
    mesh.material('street-tree-twig', (189, 177, 153), .91, texture=bark, solid=False)
    for index, tint in enumerate(((198, 208, 180), (235, 245, 212), (255, 255, 235))):
        mesh.material(f'street-leaf-{index}', tint, .74, texture=leaves, double=True, solid=False)


def unit(vector):
    return vector / np.linalg.norm(vector)


def wood(mesh, points, radii, material, sides):
    """An unbroken tapered limb with smooth radial normals and bark UVs in metres."""
    lengths = [0.0]
    for a, b in zip(points, points[1:]):
        lengths.append(lengths[-1] + math.dist(a, b))
    initial = unit(points[1] - points[0])
    cross_axis = np.array((1., 0., 0.)) if abs(initial[0]) < .78 else np.array((0., 0., 1.))
    rings = []
    normals = []
    for index, point in enumerate(points):
        axis = unit(points[min(index + 1, len(points) - 1)] - points[max(index - 1, 0)])
        tangent = unit(np.cross(axis, cross_axis))
        bitangent = np.cross(axis, tangent)
        radial = [tangent * math.cos(i * math.tau / sides) + bitangent * math.sin(i * math.tau / sides)
                  for i in range(sides)]
        normals.append(radial)
        rings.append([point + vector * radii[index] for vector in radial])
    bark_width = math.tau * max(radii[0], .025) / .65
    for index, (lower, upper) in enumerate(zip(rings, rings[1:])):
        v0, v1 = lengths[index] / -.65, lengths[index + 1] / -.65
        low_normal, high_normal = normals[index:index + 2]
        for i in range(sides):
            j = (i + 1) % sides
            u0, u1 = i / sides * bark_width, (i + 1) / sides * bark_width
            mesh.face(material, (lower[i], lower[j], upper[j], upper[i]),
                      uv=((u0, v0), (u1, v0), (u1, v1), (u0, v1)),
                      normals=(low_normal[i], low_normal[j], high_normal[j], high_normal[i]))
    mesh.face(material, rings[-1])
    mesh.face(material, rings[0][::-1])


def leaf_spray(mesh, start, heading, reach, twist, panel, shade):
    """A gently bowed leaf cluster following a twig in full 3D."""
    direction = unit(heading)
    across = unit(np.cross(direction, (0., 1., 0.)))
    plane_normal = np.cross(across, direction)
    across = across * math.cos(twist) + plane_normal * math.sin(twist)
    plane_normal = np.cross(across, direction)
    tip = start + direction * reach
    width = reach * .49
    # The scan's stems meet the middle of the lower edge. The canopy surface
    # bends across that stem, giving each spray more than one optical plane.
    points = (start - across * width, start + across * width, tip + across * width,
              tip - across * width, start, tip + plane_normal * reach * .14)
    left = unit(np.cross(points[4] - points[0], points[5] - points[0]))
    right = unit(np.cross(points[1] - points[4], points[2] - points[4]))
    middle = unit(left + right)
    u0, u1 = panel / 2 + .002, (panel + 1) / 2 - .002
    center = (u0 + u1) / 2
    mesh.face(f'street-leaf-{shade}', points,
              triangles=((0, 4, 5), (0, 5, 3), (4, 1, 2), (4, 2, 5)),
              uv=((u0, 1), (u1, 1), (u1, 0), (u0, 0), (center, 1), (center, 0)),
              normals=(left, right, right, left, middle, middle))


def street_tree(mesh, x, z, height, seed, y=0, distant=False):
    rng = random.Random(seed)
    origin = np.array((x, y, z))
    lean = np.array((rng.uniform(-.072, .072), 0., rng.uniform(-.072, .072))) * height
    first = max(.34, min(.5, 1.93 / height)) if height >= 3.5 else .25
    trunk_levels = (0., .045, .18, first, .62, .79, .94)
    stem = [origin + lean * level ** 1.52 + (0., height * level, 0.) for level in trunk_levels]
    base = height * rng.uniform(.021, .027)
    radii = [base * taper for taper in (1.34, 1., .91, .76, .51, .31, .08)]
    bark = 'street-tree-bark'
    twigs = 'street-tree-twig'
    wood(mesh, stem, radii, bark, 7 if distant else 10)

    branches = 5 if distant else 9
    laterals = 4 if distant else 6
    leaves = 3 if distant else 5
    yaw = rng.uniform(-math.pi, math.pi)
    asymmetry = rng.uniform(.76, 1.19)
    spread = rng.uniform(.94, 1.12)
    for i in range(branches):
        fraction = i / (branches - 1)
        level = first + (.77 - first) * fraction
        angle = yaw + i * 2.399963 + rng.uniform(-.28, .28)
        outward = np.array((math.cos(angle) * asymmetry, 0., math.sin(angle) / asymmetry))
        side = np.array((-math.sin(angle), 0., math.cos(angle)))
        attach = origin + lean * level ** 1.52 + (0., height * level, 0.)
        reach = height * (.35 - .15 * fraction) * spread * rng.uniform(.85, 1.15)
        lift = height * rng.uniform(.14, .23) * (1 - .48 * fraction)
        elbow = attach + outward * reach * .51 + side * rng.uniform(-.09, .15) * reach + (0., lift * .35, 0.)
        tip = attach + outward * reach + side * rng.uniform(-.21, .23) * reach + (0., lift, 0.)
        radius = base * (.57 - .31 * fraction) * rng.uniform(.87, 1.16)
        wood(mesh, (attach, elbow, tip), (radius, radius * .58, radius * .12), bark, 5 if distant else 7)

        for j in range(laterals):
            t = .19 + .80 * (j + rng.uniform(.13, .81)) / laterals
            branch_pos = (attach + (elbow - attach) * t / .51) if t <= .51 else (
                elbow + (tip - elbow) * (t - .51) / .49)
            sign = -1 if j % 2 else 1
            fork_angle = angle + sign * rng.uniform(.68, 1.36)
            fork = np.array((math.cos(fork_angle), rng.uniform(.18, .72), math.sin(fork_angle)))
            twig_length = height * rng.uniform(.088, .169) * (1 - .27 * fraction)
            fork_tip = branch_pos + fork * twig_length
            if not distant:
                wood(mesh, (branch_pos, fork_tip), (radius * .24, radius * .042), twigs, 4)
            for k in range(leaves):
                # Splay the leaves on both sides of each twig, with an upward terminal shoot.
                leaf_angle = fork_angle + (-1 if k % 2 else 1) * rng.uniform(.18, 1.20)
                direction = np.array((math.cos(leaf_angle), rng.uniform(-.29, 1.02), math.sin(leaf_angle)))
                start = branch_pos + (fork_tip - branch_pos) * (k + rng.uniform(.15, .9)) / leaves
                length = height * rng.uniform(.114, .192) * (1 - .16 * fraction)
                shade = rng.choices((0, 1, 2), weights=(4 - 3 * fraction, 5, 1 + 4 * fraction))[0]
                leaf_spray(mesh, start, direction, length, rng.uniform(-1.12, 1.12), rng.randrange(2), shade)

    # The terminal shoots cover the leader without sealing the crown into a solid shape.
    for i in range(3 if distant else 5):
        angle = yaw + i * 2.399963
        level = .75 + i * .024
        start = origin + lean * level ** 1.52 + (0., height * level, 0.)
        heading = np.array((math.cos(angle), rng.uniform(.55, 1.2), math.sin(angle)))
        tip = start + unit(heading) * height * rng.uniform(.10, .16)
        if not distant:
            wood(mesh, (start, tip), (base * .15, base * .045), twigs, 4)
        for j in range(2 if distant else 4):
            leaf_angle = angle + rng.uniform(-1.1, 1.1)
            direction = np.array((math.cos(leaf_angle), rng.uniform(.02, 1.5), math.sin(leaf_angle)))
            leaf_spray(mesh, start + (tip - start) * (j + .6) / 4, direction,
                       height * rng.uniform(.09, .14), rng.uniform(-1.2, 1.2), rng.randrange(2), rng.randrange(1, 3))
