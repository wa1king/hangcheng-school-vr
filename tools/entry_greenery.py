"""Photo-derived cutouts for the planted trees near the entrance and courtyard."""

import math
import random

import numpy as np

from architecture import branch
from material_scans import SCAN_DIR


def register_greenery(mesh):
    # Poly Haven Island Tree 03 (CC0). Two arrangements of its scanned leaf
    # color and alpha are packed side by side in one shared texture.
    leaves = (SCAN_DIR.joinpath('school-foliage.png').read_bytes(), 'image/png')
    bark = (SCAN_DIR.joinpath('school-bark.jpg').read_bytes(), 'image/jpeg')
    grass = (SCAN_DIR.joinpath('school-grass.jpg').read_bytes(), 'image/jpeg')
    mesh.material('school-tree-bark', (245, 239, 232), .91, texture=bark)
    # Poly Haven Leafy Grass (CC0), graded to the planted beds' maintained green.
    mesh.material('planter', (238, 250, 238), .95, texture=grass)
    for i, color in enumerate(((196, 218, 202), (230, 242, 219), (255, 255, 244))):
        mesh.material(f'leaf-spray-{i}', color, .78, texture=leaves, double=True, solid=False)


def detailed_tree(mesh, x, z, height, seed, y, spread=.31):
    rng = random.Random(seed)
    origin = np.array((x, y, z))
    top = origin + (height * rng.uniform(-.04, .04), height * .93, height * rng.uniform(-.04, .04))
    bark = 'school-tree-bark'
    branch(mesh, origin, top, height * .024, height * .003, bark, sides=8, texture_period=.56)
    crown = height * spread
    trimmed = spread < .28
    for i in range(19):
        angle = i * 2.39996 + rng.uniform(-.15, .15)
        elevation = i / 19
        radius = crown * (1.0 - .58 * elevation) * rng.uniform(.80, 1.12)
        outward = np.array((math.cos(angle), 0, math.sin(angle)))
        side = np.array((-outward[2], 0, outward[0]))
        attach = origin + (0, height * (.37 + .47 * elevation), 0)
        tip = attach + outward * radius + (0, height * rng.uniform(.09, .18), 0)
        branch(mesh, attach, tip, height * .008 * (1.0 - elevation * .54), height * .002,
               bark, sides=5, texture_period=.56)
        for j in range(15):
            distance = rng.uniform(.23, 1.01)
            center = attach + (tip - attach) * distance + side * rng.uniform(-.34, .34) * radius
            yaw = angle + rng.uniform(-1.8, 1.8)
            across = np.array((-math.sin(yaw), rng.uniform(-.40, .40), math.cos(yaw)))
            along = np.array((math.cos(yaw) * .61, rng.uniform(.49, .95), math.sin(yaw) * .61))
            half = height * rng.uniform(.084, .14) * (1 - .33 * elevation)
            if trimmed:
                # The photographed stair flanks have dense, tiered, tapered foliage.
                # These cards stay in the planter envelope and add no collision.
                center[1] -= height * (.065 - .03 * elevation)
                across *= 1.32
                along[1] *= .84
            corners = [center + half * (a * across + b * along) for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
            shade = rng.choices((0, 1, 2), weights=(5 - 3 * elevation, 4, 2 + 4 * elevation))[0]
            panel = 0 if trimmed else (i + j) % 2
            u0, u1 = panel / 2 + .002, (panel + 1) / 2 - .002
            if j % 2:
                u0, u1 = u1, u0
            mesh.face(f'leaf-spray-{shade}', corners, uv=[(u0, 1), (u1, 1), (u1, 0), (u0, 0)])
