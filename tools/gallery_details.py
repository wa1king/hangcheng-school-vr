"""Build the visible finishes and fittings of the teaching gallery."""

import math
import random

from mesh import rect
from surface_textures import terrazzo


def gallery_materials(mesh):
    stone, normal, roughness = terrazzo((120, 129, 119), 758)
    mesh.material('gallery-floor-border', (255, 255, 255), 1, texture=stone,
                  normal=normal, roughness_map=roughness, solid=False)
    mesh.material('gallery-base-stone', (255, 255, 255), 1, texture=stone,
                  normal=normal, roughness_map=roughness)
    for name, color, roughness, metalness in (
        ('gallery-pipe', (183, 184, 165), .69, 0),
        ('gallery-zinc', (120, 127, 122), .48, .45),
        ('gallery-fastener', (73, 81, 77), .42, .58),
        ('gallery-ivory', (214, 211, 194), .70, 0),
        ('gallery-service-red', (142, 60, 47), .64, 0),
        ('gallery-door-seal', (43, 51, 48), .78, 0),
        ('gallery-book-clay', (161, 107, 79), .86, 0),
        ('gallery-book-sage', (102, 134, 113), .86, 0),
        ('gallery-book-indigo', (79, 100, 124), .84, 0),
        ('gallery-book-paper', (212, 204, 176), .89, 0),
    ):
        mesh.material(name, color, roughness, metalness)
    mesh.material('gallery-grate-slot', (55, 63, 57), .82, solid=False)


def trim_intervals(mesh, wall_x, spans, y, has_windows):
    """Bring the floor and plaster finishes up to the door openings."""
    for lo, hi in spans:
        centre, length = (lo + hi) / 2, hi - lo
        mesh.box('gallery-base-stone', wall_x - .086, y, centre, .044, .108, length)
        mesh.box('gallery-floor-border', wall_x - .165, y + .003, centre, .143, .002, length)
        if has_windows:
            # A slim ceramic trim forms the top edge of the tile dado.
            mesh.box('cream', wall_x - .083, y + 1.096, centre, .043, .034, length)


def fit_doorway(mesh, wall_x, left, right, y, floor_y, open_leaf):
    centre, width = (left + right) / 2, right - left
    mesh.box('gallery-floor-border', wall_x, floor_y + .002, centre, .27, .002, width)
    for jamb in (left + .026, right - .026):
        mesh.box('teaching-metal', wall_x - .125, y, jamb, .022, 2.412, .082)
        mesh.box('gallery-door-seal', wall_x + .03, y, jamb, .016, 2.20, .066)
    mesh.box('teaching-metal', wall_x - .125, y + 2.37, centre, .022, .062, width + .033)
    if not open_leaf:
        return

    # Glass transom, leaf, hinge barrels and lever sit in the same opening.
    mesh.box('teaching-metal', wall_x, y + 2.24, centre, .086, .045, width)
    mesh.face('glass-clear', [(wall_x, y + 2.285, left + .045),
                             (wall_x, y + 2.285, right - .045),
                             (wall_x, y + 2.38, right - .045),
                             (wall_x, y + 2.38, left + .045)])
    length = (width - .105) / 2
    for z, inward in ((left + .079, 1), (right - .079, -1)):
        # Both leaves are secured open against the room-side return.
        free_edge = wall_x + .02 + length
        mesh.box('teaching-wood', free_edge - length / 2, y + .055, z, length, 2.17, .064)
        mesh.box('teaching-wood-edge', free_edge - .031, y + .055, z, .064, 2.17, .068)
        mesh.box('gallery-zinc', free_edge - length / 2, y + .067, z, length - .036, .11, .068)
        for hinge in (.29, 1.23, 1.98):
            mesh.cylinder('gallery-fastener', wall_x + .026, y + hinge,
                          z - inward * .034, .013, .091, 10)
        for side in (-1, 1):
            mesh.box('gallery-zinc', free_edge - .060, y + .925, z + side * .035, .063, .146, .018)
            mesh.box('gallery-zinc', free_edge - .060, y + .989, z + side * .052, .031, .029, .037)
            mesh.box('gallery-zinc', free_edge - .108, y + .989, z + side * .069, .127, .029, .026)


def gallery_pier_base(mesh, x, z, y, ground):
    # Separate wear-resistant plinth tiles from the column above.
    width, depth = (.515, .375) if ground else (.448, .367)
    mesh.box('gallery-base-stone', x, y, z, width, .184 if ground else .096, depth)


def gallery_rail_mount(mesh, x, z, y):
    mesh.box('gallery-zinc', x, y, z, .102, .019, .109)
    for offset in (-.034, .034):
        mesh.cylinder('gallery-fastener', x, y + .019, z + offset, .008, .006, 6)


def gallery_outlet(mesh, x, z, y):
    mesh.box('gallery-ivory', x, y, z, .036, .089, .088)
    mesh.box('gallery-zinc', x - .020, y + .018, z, .008, .056, .044)
    for offset in (-.014, .014):
        mesh.box('gallery-fastener', x - .025, y + .038, z + offset, .006, .016, .005)


def gallery_grate(mesh, x, z, y):
    """Place grate and slit finish flush in the walkway, away from the door threshold."""
    mesh.surface('gallery-floor-border', rect(x, z, .38, .51), y)
    mesh.surface('gallery-grate-slot', rect(x, z, .258, .385), y + .0015)
    for index in range(-5, 6):
        mesh.box('gallery-zinc', x, y, z + index * .032, .258, .003, .014)


def gallery_drain_stack(mesh, x, z, y, top, ground):
    """A downpipe follows the inside face of a column and meets the floor outlet."""
    length = top - y
    mesh.cylinder('gallery-pipe', x, y, z, .047, length, 12)
    for h in (.19, 1.27, min(2.78, length - .18)):
        mesh.cylinder('gallery-zinc', x, y + h, z, .052, .039, 12)
        mesh.box('gallery-zinc', x - .069, y + h, z, .125, .038, .047)
    if ground:
        gallery_grate(mesh, x + .243, z, y + .015)


def gallery_service_fittings(mesh, wall_x, y, top):
    """Keep electrical fittings on the wall side and above head height."""
    x = wall_x - .192
    mesh.strip('gallery-pipe', (x, -12.81), (x, 15.81), .019, top - .038, .022)
    for index, z in enumerate((-11.9, -8.1, -4.3, -.5, 3.3, 7.1, 10.9, 14.7)):
        mesh.box('gallery-ivory', x, top - .052, z, .094, .052, .11)
        if index in (0, 2, 5):
            mesh.strip('gallery-pipe', (25.48, z), (x, z), .019, top - .025, .02)
    gallery_outlet(mesh, wall_x - .088, 4.31, y + 1.22)

    # A shallow, wall-side cabinet stays outside the walking line to the stair.
    z = 7.61
    mesh.box('gallery-service-red', wall_x - .208, y + .17, z, .24, .648, .558)
    mesh.box('gallery-ivory', wall_x - .331, y + .207, z, .017, .574, .486)
    mesh.box('gallery-service-red', wall_x - .342, y + .646, z, .012, .093, .389)
    mesh.box('gallery-zinc', wall_x - .353, y + .465, z - .176, .022, .09, .027)
    for corner in (-.216, .216):
        mesh.box('gallery-zinc', wall_x - .350, y + .238, z + corner, .014, .025, .014)


def gallery_reading_alcove(mesh, x, z, floor, level):
    """Low open bookcase and pinned notices give the north end a use."""
    front = z + .38
    for side in (-.91, .91):
        mesh.box('teaching-metal', x + side, floor, z + .19, .061, .88, .38)
    mesh.box('teaching-wood-edge', x, floor + .09, z + .047, 1.83, .776, .06)
    for h in (.10, .445, .85):
        mesh.box('teaching-wood-edge', x, floor + h, z + .195, 1.84, .047, .376,
                 top='teaching-wood')
    rng = random.Random(767 + level)
    covers = ('gallery-book-clay', 'gallery-book-sage', 'gallery-book-indigo',
              'chalkboard', 'teaching-wood-edge')
    for shelf in (floor + .147, floor + .492):
        for start in (-.82, -.16, .40):
            cursor = x + start
            for _ in range(rng.randint(5, 8)):
                width = rng.uniform(.022, .053)
                height = rng.uniform(.134, .244)
                depth = height * .69
                edge = front - rng.uniform(.034, .058)
                cover = rng.choice(covers)
                mesh.box(cover, cursor + width / 2, shelf, edge - depth / 2, width, height, depth,
                         top='gallery-book-paper')
                mesh.box(cover, cursor + width / 2, shelf + height, edge - .007, width, .006, .014)
                mesh.box('gallery-book-paper', cursor + width / 2, shelf + height * .71, edge + .001,
                         width * .59, .013, .002)
                cursor += width + .007
    mesh.box('teaching-wood-edge', x, floor + 1.13, z + .030, 1.58, .84, .055)
    xa, xb, panel_z = x - .752, x + .752, z + .061
    mesh.face('teaching-notice', [(xa, floor + 1.161, panel_z), (xb, floor + 1.161, panel_z),
                                  (xb, floor + 1.938, panel_z), (xa, floor + 1.938, panel_z)],
              uv=[(0, 1), (1, 1), (1, 0), (0, 0)])
