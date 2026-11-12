"""Build the Hangcheng School exterior from licensed open footprints and photo references."""

import json
import math
import random
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
EXTRA = Path(__file__).resolve().parent / '.deps'
if EXTRA.is_dir():
    sys.path.insert(0, str(EXTRA))

from shapely.geometry import LineString, Point, Polygon, box

from architecture import building, entrance, foliage, materials, slab
from mesh import Mesh, rect, rounded
from sports import add_sports


ANGLE = math.radians(-24)
COS, SIN = math.cos(ANGLE), math.sin(ANGLE)
WGS84_RADIUS = 6378137
WGS84_E2 = 0.00669437999014


def site_to_world(x, y, z):
    return x * COS - z * SIN, y, x * SIN + z * COS


def read_data():
    with (BASE / 'evidence' / 'campus-osm.geojson').open(encoding='utf-8-sig') as file:
        data = json.load(file)
    lon, lat = data['campus_origin']
    latitude = math.radians(lat)
    eccentricity = 1 - WGS84_E2 * math.sin(latitude) ** 2
    east_scale = WGS84_RADIUS * math.cos(latitude) / math.sqrt(eccentricity)
    north_scale = WGS84_RADIUS * (1 - WGS84_E2) / (eccentricity ** 1.5)

    def site(lng, latitude):
        east = math.radians(lng - lon) * east_scale
        south = math.radians(lat - latitude) * north_scale
        return east * COS + south * SIN, -east * SIN + south * COS

    polygons, lines = {}, {}
    for feature in data['features']:
        prop, geom = feature['properties'], feature['geometry']
        ident = prop['osm_id']
        if geom['type'] == 'Polygon':
            polygons[ident] = [[site(*xy) for xy in ring] for ring in geom['coordinates']]
        elif geom['type'] == 'LineString':
            lines[ident] = [site(*xy) for xy in geom['coordinates']]
    return polygons, lines


def landscape(visual, collision, polygons, lines):
    campus = Polygon(polygons[1084438083][0])
    visual.surface('ground', rect(-15, -10, 455, 390), -0.27)
    collision.surface('walkable', rect(-15, -10, 440, 375), 0)
    slab(visual, campus, -0.03, -0.03, 'plaza')

    # Approach road and sidewalk use the mapped centreline. Surface widths are estimated.
    extent = box(-218, -168, 170, 145)
    road = LineString(lines[760669882] + lines[760669885][1:]).intersection(extent)
    roadway = road.buffer(8.5, cap_style='flat')
    sidewalk = road.buffer(11.1, cap_style='flat').difference(roadway)
    slab(visual, roadway, -0.129, -0.129, 'road')
    for part in sidewalk.geoms if sidewalk.geom_type == 'MultiPolygon' else [sidewalk]:
        slab(visual, part, -0.184, -0.041, 'curb', 'walk')
    for index in range(int(road.length / 8)):
        a = road.interpolate(index * 8 + 0.4)
        b = road.interpolate(index * 8 + 4)
        visual.strip('paint-yellow', a.coords[0], b.coords[0], 0.105, -0.102)
    side = LineString(lines[1454566188]).buffer(1.8, cap_style='flat', join_style='mitre')
    slab(visual, side.difference(campus), -0.009, -0.009, 'walk')
    east_road = LineString([(110, -110), (109, 73), (116, 96)])
    # Short context edge is inferred from the 2026 aerial view, outside the modeled campus.
    slab(visual, east_road.buffer(7.5, cap_style='flat').difference(roadway), -0.129, -0.129, 'road')

    foreground = box(-2.1, 55, 33, 90.4).difference(roadway)
    slab(visual, foreground, 0.007, 0.007, 'walk')
    for x in range(-2, 34, 3):
        visual.strip('brickline', (x, 55), (x, 90.1), 0.079, 0.030)
    for z in range(55, 90, 3):
        visual.strip('brickline', (-2, z), (33, z), 0.079, 0.032)

    # Low planting and broad canopy positions are inferred from the exterior references.
    bed_positions = [(-59, 48, 26, 8), (-29, 48, 14, 6), (-68, 57, 23, 4),
                     (-9, 44, 5.7, 5.4), (28, 45.5, 5.4, 6.2), (37, 70.2, 7.7, 4.8),
                     (10.5, 3.5, 14, 9.1), (56, -2.6, 22, 5.5), (57, 23, 15, 5.2),
                     (-3.5, -52.3, 12, 4.4), (39, -56.8, 28, 3.7), (65, -51, 14, 4.6)]
    rng = random.Random(18)
    for i, (x, z, w, d) in enumerate(bed_positions):
        visual.prism('curb', rounded(x, z, w, d, min(w, d) * 0.26), -0.02, 0.21, 'planter')
        for u in range(max(1, round(w / 7))):
            position = x + w * ((u + 0.5) / max(1, round(w / 7)) - 0.5)
            foliage(visual, position, z + rng.uniform(-0.9, 0.9), rng.uniform(3.5, 6.1), 100 * i + u, 0.21)

    for i, x in enumerate((-127, -106, -90, -75, -61, -49, -34, -22, 34, 46, 60, 72, 84, 95)):
        foliage(visual, x, 83.4 + rng.uniform(-0.6, 0.6), rng.uniform(4.3, 7.0), 421 + i)
    def slope(x, z):
        fade = max(0, min(1, (-102 - z) / 36))
        return -0.23 + 13 * fade * math.exp(-((x + 52) / 75) ** 2 - ((z + 166) / 41) ** 2)

    for x in range(-230, 170, 8):
        for z in range(-202, -102, 5):
            corners = [(x, z), (x, z + 5), (x + 8, z + 5), (x + 8, z)]
            visual.face('ground', [(u, slope(u, v), v) for u, v in corners])
    for i in range(46):
        x = rng.uniform(-171, 95)
        z = rng.uniform(-166, -104)
        foliage(visual, x, z, rng.uniform(4.6, 8.5), 50 + i, slope(x, z))
    for i in range(16):
        x = rng.uniform(-157, -126)
        z = rng.uniform(-86, 46)
        foliage(visual, x, z, rng.uniform(4.8, 7.6), 183 + i, -0.25)

    # The courtyard and open entrance can be explored continuously from the road.
    for x in (-83.4, -64.1, -45.7, -27.6, 48, 69, 87):
        visual.box('terra', x, 0, 79.3, 0.42, 1.72, 0.42)
        visual.box('cream', x, 1.72, 79.3, 0.46, 0.12, 0.46)
    for a, b in ((-83, -28), (48, 87)):
        visual.strip('curb', (a, 79.3), (b, 79.3), 0.22, 0, 0.28)
        visual.strip('blue-rail', (a, 79.3), (b, 79.3), 0.05, 1.62, 0.05)
        for i in range(round((b - a) / 0.19)):
            x = a + i * 0.19
            visual.box('blue-rail', x, 0.25, 79.3, 0.037, 1.36, 0.037)
        collision.strip('collider', (a, 79.3), (b, 79.3), 0.20, 0, 1.66)


def manifest(dest, campus_outline):
    def world(x, y, z):
        return [round(value, 3) for value in site_to_world(x, y, z)]

    def location(ident, label, x, z, direction=0, pitch=0):
        return {'id': ident, 'label': label, 'position': world(x, 0, z), 'yaw': round(direction - ANGLE, 5), 'pitch': pitch}

    places = [location('gate', '校门广场', 11, 86.4, -0.13, 0.22),
              location('track', '田径场', -72.6, -22.1, -0.95),
              location('stands', '西侧看台', -92.0, -52.0, 0.97),
              location('courtyard', '教学楼中庭', 11.7, 10.7, math.pi),
              location('east', '东侧教学楼', 41, 62.5, -1.34),
              location('basketball', '北侧球场', 27.0, -62.7)]
    data = {
        'title': '深圳市宝安区航城学校',
        'status': '实景参考重建 · 尺寸待实测',
        'description': '航空路 10 号本部。平面和屋顶分区参照开放地图与近期影像，北侧主楼体量有影长估计，建筑尺寸仍待实测。',
        'models': [{'url': './campus.glb'}],
        'collisionUrl': './collision.glb',
        'evidenceUrl': './sources.html',
        'spawn': {key: places[0][key] for key in ('position', 'yaw', 'pitch')},
        'landingBoundary': [[wx, wz] for wx, _, wz in (world(x, 0, z) for x, z in campus_outline[:-1])],
        'overview': {'target': world(-20, 2, -14), 'position': world(111, 150, 174)},
        'locations': places,
    }
    (dest / 'scene.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    polygons, lines = read_data()
    visual, collision = Mesh(site_to_world), Mesh(site_to_world)
    materials(visual)
    collision.material('collider', (128, 128, 128), double=True)
    collision.material('walkable', (128, 128, 128), double=True)
    landscape(visual, collision, polygons, lines)
    for ident, floors, height in ((19808442, 4, 4.02), (1448555207, 1, 4.6),
                                   (1448555203, 5, 3.61), (1448555206, 8, 3.46)):
        building(visual, collision, polygons[ident], ident, floors, height)
    entrance(visual, collision)
    add_sports(visual, collision, polygons)
    target = BASE / 'public' / 'scene'
    target.mkdir(parents=True, exist_ok=True)
    count = visual.export(target / 'campus.glb')
    colliders = collision.export(target / 'collision.glb')
    manifest(target, polygons[1084438083][0])
    print(f'Campus GLB: {count:,} triangles · collision: {colliders:,} triangles')


if __name__ == '__main__':
    main()
