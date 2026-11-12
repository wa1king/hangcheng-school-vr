"""Leaf clusters for trees near the approach and the first courtyard."""

import math
import random

import numpy as np
from PIL import Image, ImageDraw

from architecture import branch, png


def spray_texture():
    size = 576
    image = Image.new('RGBA', (size, size), (47, 76, 31, 0))
    draw = ImageDraw.Draw(image)
    rng = random.Random(671)
    for side in (-1, 1):
        for i in range(1, 10):
            start = (289 + 1.3 * i, 560 - 49 * i)
            finish = (start[0] + side * (64 + 141 * math.sin(i * math.pi / 10)), start[1] - 95)
            draw.line((start, finish), fill=(86, 91, 46, 255), width=4)
            for j in range(1, 7):
                f = (j + rng.random() * .45) / 7
                x, y = (a + (b - a) * f for a, b in zip(start, finish))
                length = rng.uniform(24, 53) * (1 - f * .34)
                theta = side * (0.91 if j % 2 else -0.25) + rng.uniform(-.32, .32)
                forward = (math.sin(theta), -math.cos(theta))
                across = (-forward[1], forward[0])

                def point(along, width):
                    return (x + length * (along * forward[0] + width * across[0]),
                            y + length * (along * forward[1] + width * across[1]))

                tint = rng.randrange(-20, 24)
                light = (85 + tint, 118 + tint, 49 + tint // 2, 255)
                shade = (63 + tint, 95 + tint, 39 + tint // 2, 255)
                draw.polygon([point(0, 0), point(.28, -.19), point(.62, -.21), point(1, 0),
                              point(.64, .21), point(.29, .18)], fill=shade)
                draw.polygon([point(0, 0), point(.28, -.19), point(.62, -.21), point(1, 0)], fill=light)
                draw.line((point(.16, 0), point(.84, 0)), fill=(103 + tint, 128 + tint, 62 + tint // 2, 255), width=1)
    draw.line(((289, 557), (305, 91)), fill=(93, 98, 53, 255), width=5)
    return png(image.resize((512, 512), Image.Resampling.LANCZOS))


def register_greenery(mesh):
    texture = spray_texture()
    for i, color in enumerate(((193, 204, 184), (229, 235, 214), (255, 255, 246))):
        mesh.material(f'leaf-spray-{i}', color, .84, texture=texture, double=True, solid=False)


def detailed_tree(mesh, x, z, height, seed, y, spread=.31):
    rng = random.Random(seed)
    origin = np.array((x, y, z))
    top = origin + (height * rng.uniform(-.04, .04), height * .93, height * rng.uniform(-.04, .04))
    branch(mesh, origin, top, height * .024, height * .003, sides=8)
    crown = height * spread
    for i in range(19):
        angle = i * 2.39996 + rng.uniform(-.15, .15)
        elevation = i / 19
        radius = crown * (1.0 - .58 * elevation) * rng.uniform(.80, 1.12)
        outward = np.array((math.cos(angle), 0, math.sin(angle)))
        attach = origin + (0, height * (.37 + .47 * elevation), 0)
        tip = attach + outward * radius + (0, height * rng.uniform(.09, .18), 0)
        branch(mesh, attach, tip, height * .008 * (1.0 - elevation * .54), height * .002, sides=5)
        for j in range(15):
            distance = rng.uniform(.23, 1.01)
            side = np.array((-outward[2], 0, outward[0]))
            center = attach + (tip - attach) * distance + side * rng.uniform(-.34, .34) * radius
            yaw = angle + rng.uniform(-1.8, 1.8)
            across = np.array((-math.sin(yaw), rng.uniform(-.40, .40), math.cos(yaw)))
            along = np.array((math.cos(yaw) * .61, rng.uniform(.49, .95), math.sin(yaw) * .61))
            half = height * rng.uniform(.084, .14) * (1 - .33 * elevation)
            corners = [center + half * (a * across + b * along) for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
            variant = rng.choices((0, 1, 2), weights=(5 - 3 * elevation, 4, 2 + 4 * elevation))[0]
            mesh.face(f'leaf-spray-{variant}', corners, uv=[(0, 1), (1, 1), (1, 0), (0, 0)])
