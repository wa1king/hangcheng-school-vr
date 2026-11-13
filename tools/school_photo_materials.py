"""Photographic finishes for the main campus geometry."""

from pathlib import Path


PHOTO_DIR = Path(__file__).with_name('school_photos')


def apply_school_photo_materials(mesh):
    def texture(filename):
        data = (PHOTO_DIR / filename).read_bytes()
        return data, 'image/png' if filename.endswith('.png') else 'image/jpeg'

    for material, photo in (('beige', 'balcony-brick'), ('terra', 'clock-cladding')):
        mesh.material(material, (255, 255, 255), 1.0, texture=texture(f'{photo}-color.jpg'), double=True,
                      normal=texture(f'{photo}-normal.jpg'), roughness_map=texture(f'{photo}-roughness.jpg'))

    mesh.material('school-name', (255, 255, 255), .74, texture=texture('gate-letters.png'), solid=False)
    mesh.material('clock-face', (255, 255, 255), .78, texture=texture('clock-dial.jpg'), solid=False)
