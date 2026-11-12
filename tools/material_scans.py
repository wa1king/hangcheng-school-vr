"""Adapt scanned material maps to the colors and joint spacing of the campus."""

from functools import cache
from pathlib import Path

import numpy as np
from PIL import Image

from surface_textures import maps, tinted


SCAN_DIR = Path(__file__).with_name('material_scans')


@cache
def scan(name, kind):
    return (SCAN_DIR.joinpath(f'{name}-{kind}.jpg').read_bytes(), 'image/jpeg')


def cladding(rgb, mortar, seed):
    """Glazed facade slips with real fine texture and 9.4 cm course height."""
    size = 512
    rng = np.random.default_rng(seed)
    y, x = np.indices((size, size), dtype=float)
    row = (y / 16).astype(int)
    u = (x + 16 * (row % 2)) / 32
    v = y / 16
    edge = np.minimum(np.minimum(u % 1, 1 - u % 1) * 32, np.minimum(v % 1, 1 - v % 1) * 16)
    surface = np.clip((edge - .55) / 1.15, 0, 1)
    tile = rng.normal(0, 5.0, (32, 16))[row, u.astype(int) % 16]
    with Image.open(SCAN_DIR / 'plaster-color.jpg') as image:
        plaster = np.asarray(image.convert('L'), dtype=float)
    grain = (plaster - np.median(plaster)) * .49
    chips = np.maximum(0, -grain - 6)
    color = tinted(rgb, grain + tile) * surface[..., None] + tinted(mortar, grain * .65) * (1 - surface[..., None])
    height = .76 * surface + .009 * grain - .018 * chips
    roughness = .64 + .26 * (1 - surface) + .009 * np.maximum(0, -grain) + tile * .004
    return maps(color, height, roughness, .93)


def apply_surface_materials(mesh):
    # Geometry already uses these material names. Each texture stays aligned
    # with its normal and roughness map through the glTF export.
    for name, source, rgb, double in (
        ('plaza', 'granite', (249, 248, 242), False),
        ('walk', 'granite', (238, 237, 231), False),
        ('courtyard-paving', 'granite', (231, 220, 211), False),
        ('road', 'asphalt', (247, 247, 248), False),
        ('entry-stone', 'terrazzo', (245, 243, 235), False),
        ('stair-stone', 'terrazzo', (228, 231, 228), False),
        ('teaching-floor', 'granite', (245, 250, 246), False),
        ('cream', 'plaster', (255, 251, 239), True),
        ('soffit', 'plaster', (235, 232, 221), False),
        ('teaching-wall', 'plaster', (255, 254, 249), False),
        ('teaching-ceiling', 'plaster', (253, 252, 245), False),
        ('reveal', 'plaster', (239, 236, 222), False),
    ):
        mesh.material(name, rgb, 1.0, texture=scan(source, 'color'), normal=scan(source, 'normal'),
                      roughness_map=scan(source, 'roughness'), double=double)
    for name, rgb, mortar, seed in (
        ('beige', (212, 205, 189), (181, 176, 163), 22),
        ('terra', (158, 102, 88), (135, 105, 95), 23),
    ):
        color, normal, roughness = cladding(rgb, mortar, seed)
        mesh.material(name, (255, 255, 255), 1.0, texture=color, normal=normal,
                      roughness_map=roughness, double=True)
