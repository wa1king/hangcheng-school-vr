"""Build the Hangcheng School exterior from licensed open footprints and photo references."""

import json
import math
import random
import sys
from hashlib import file_digest
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
EXTRA = Path(__file__).resolve().parent / '.deps'
if EXTRA.is_dir():
    sys.path.insert(0, str(EXTRA))

from shapely.geometry import Polygon, box
from shapely.geometry.polygon import orient

from access import building_access
from architecture import building, entrance, materials, slab
from campus_perimeter import add_perimeter
from classroom_campus import add_reference_structures
from entry_details import STAIR_CENTER, add_entry_details, entry_drain_opening
from entry_greenery import detailed_tree, register_greenery
from street_trees import register_street_trees, street_tree
from interiors import PORTAL_Z
from material_scans import apply_surface_materials
from mesh import Mesh, rect, rounded
from sports import add_sports
from street_surfaces import build_street, ROADSIDE_TREE_X, ROADSIDE_TREE_Z
from street_traffic import add_traffic
from surroundings import add_surroundings


ANGLE = math.radians(-24)
COS, SIN = math.cos(ANGLE), math.sin(ANGLE)
WGS84_RADIUS = 6378137
WGS84_E2 = 0.00669437999014
TEACHING_FLOOR_HEIGHT = 4.02


def site_to_world(x, y, z):
    return x * COS - z * SIN, y, x * SIN + z * COS


def read_data(path=BASE / 'evidence' / 'campus-osm.geojson'):
    with path.open(encoding='utf-8-sig') as file:
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


def landscape(visual, polygons, lines):
    campus = Polygon(polygons[1084438083][0])
    visual.surface('ground', rect(-15, -10, 455, 390), -0.27)
    slab(visual, campus.difference(entry_drain_opening()), -0.03, -0.03, 'plaza')
    slab(visual, box(.8, -14.4, 22.0, 24.4).intersection(campus), -.021, -.021, 'courtyard-paving')
    for x, z in ((10.6, -1.62), (10.6, 8.70)):
        garden_bench(visual, x, z)

    build_street(visual, campus, lines)

    # Low planting and broad canopy positions are inferred from the exterior references.
    bed_positions = [(-59, 48, 26, 8), (-29, 48, 14, 6), (-68, 57, 23, 4),
                     (37, 70.2, 7.7, 4.8),
                     (10.5, 3.5, 14, 9.1), (56, -2.6, 22, 5.5), (57, 23, 15, 5.2),
                     (-3.5, -52.3, 12, 4.4), (39, -56.8, 28, 3.7), (65, -51, 14, 4.6)]
    rng = random.Random(18)
    for i, (x, z, w, d) in enumerate(bed_positions):
        visual.prism('curb', rounded(x, z, w, d, min(w, d) * 0.26), -0.02, 0.21, 'planter')
        for u in range(max(1, round(w / 7))):
            position = x + w * ((u + 0.5) / max(1, round(w / 7)) - 0.5)
            tree_z = z + rng.uniform(-0.9, 0.9)
            height = rng.uniform(3.5, 6.1)
            street_tree(visual, position, tree_z, height, 100 * i + u, 0.21)

    # Evergreen shrubs in the photographs flank the steps, outside the clear opening.
    for x, z, seed in ((.55, 51.68, 661), (20.94, 51.44, 662)):
        visual.prism('curb', rounded(x, z, 1.72, 2.21, .18), -.03, .24, 'planter')
        detailed_tree(visual, x, z, 2.85, seed, .24, .25)

    for i, x in enumerate(ROADSIDE_TREE_X):
        street_tree(visual, x, ROADSIDE_TREE_Z + rng.uniform(-0.6, 0.6), rng.uniform(4.3, 7.0), 421 + i)
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
        street_tree(visual, x, z, rng.uniform(4.6, 8.5), 50 + i, slope(x, z), distant=True)
    for i in range(16):
        x = rng.uniform(-157, -126)
        z = rng.uniform(-86, 46)
        street_tree(visual, x, z, rng.uniform(4.8, 7.6), 183 + i, -0.25, distant=True)

    add_perimeter(visual, campus, STAIR_CENTER)


def garden_bench(mesh, x, z):
    for dx in (-.69, .69):
        for dz in (-.16, .16):
            mesh.box('outdoor-steel', x+dx, -.021, z+dz, .061, .43, .063)
        mesh.box('outdoor-steel', x+dx, .35, z+.184, .055, .40, .045)
        mesh.box('outdoor-steel', x+dx, .348, z, .055, .063, .38)
    for dz in (-.173, -.058, .058, .173):
        mesh.box('outdoor-wood', x, .408, z+dz, 1.83, .046, .105)
    for y in (.59, .70):
        mesh.box('outdoor-wood', x, y, z+.195, 1.83, .091, .046)


def manifest(dest, polygons):
    def world(x, y, z):
        return [round(value, 3) for value in site_to_world(x, y, z)]

    def location(ident, label, x, z, direction=0, pitch=0, y=0):
        return {'id': ident, 'label': label, 'position': world(x, y, z), 'yaw': round(direction - ANGLE, 5), 'pitch': pitch}

    def resource(name):
        with (dest / name).open('rb') as file:
            revision = file_digest(file, 'sha256').hexdigest()[:12]
        return f'./{name}?v={revision}'

    places = [location('gate', '学校正门', STAIR_CENTER, 76.6, pitch=0.22),
              location('park-view', '南望航城文体公园', STAIR_CENTER, 76.6, math.pi, pitch=-.015),
              location('rear', '教学楼后方', 58.5, -44.0, pitch=.13),
              location('west-street-view', '校内西侧望路口', -137, 74.5, math.pi, pitch=-.025),
              location('track', '田径场', -72.6, -22.1, -0.95),
              location('stands', '西侧看台', -92.0, -52.0, 0.97),
              location('courtyard', '教学楼中庭', 11.7, 10.7, math.pi),
              location('teaching-entrance', '教学楼室内示意入口', 20.2, PORTAL_Z, -math.pi / 2),
              location('teaching-upper', '二层示意走廊', 25.55, 3.30, y=TEACHING_FLOOR_HEIGHT),
              location('east', '东侧教学楼', 41, 62.5, -1.34),
              location('basketball', '北侧球场', 27.0, -62.7),
              location('main-roof', '主楼屋顶示意', 31.3, 0.55, 0, y=TEACHING_FLOOR_HEIGHT * 4 + .05)]
    for ident, place_id in ((1448555207, 'activity-entry'), (1448555203, 'north-entry'),
                            (1448555206, 'southeast-entry')):
        edge = list(orient(Polygon(polygons[ident][0]), sign=1).exterior.coords)
        access = building_access(ident, zip(edge, edge[1:]))
        x, z = access.point(0, -2.40)
        heading = math.atan2(access.dz, -access.dx)
        places.append(location(place_id, f'{access.label}入口', x, z, heading))
    campus = Polygon(polygons[1084438083][0])
    tour_boundary = campus.buffer(-.27, join_style='mitre')
    data = {
        'title': '深圳市宝安区航城学校',
        'status': '画校园路线图 · 二年级数学',
        'description': '站在学校正门，向北进校，向南隔着航空路能看到航城文体公园。进校后，从教学楼东侧绕行，往北走，再往西到教学楼后方，可以看到后排教学楼和球场。游览范围为校内，楼内布局为游览示意。',
        'northYaw': round(-ANGLE, 8),
        'models': [{'url': resource('campus.glb')}, {'url': resource('surroundings.glb'), 'surroundings': True}],
        'collisionFromModels': True,
        'tourBoundary': [[x, z] for x, _, z in (world(a, 0, b) for a, b in list(tour_boundary.exterior.coords)[:-1])],
        'evidenceUrl': './sources.html',
        'spawn': {key: places[0][key] for key in ('position', 'yaw', 'pitch')},
        'overview': {'target': world(-20, 2, -14), 'position': world(-20, 208, 14)},
        'locations': places,
    }
    (dest / 'scene.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main(target=BASE / 'public' / 'scene'):
    polygons, lines = read_data()
    visual = Mesh(site_to_world)
    materials(visual)
    register_greenery(visual)
    register_street_trees(visual)
    landscape(visual, polygons, lines)
    for ident, floors, height in ((19808442, 4, TEACHING_FLOOR_HEIGHT), (1448555207, 1, 4.6),
                                   (1448555203, 5, 3.61), (1448555206, 8, 3.46)):
        building(visual, polygons[ident], ident, floors, height)
    entrance(visual)
    add_entry_details(visual)
    add_sports(visual, polygons)
    add_reference_structures(visual, polygons)
    apply_surface_materials(visual)
    target.mkdir(parents=True, exist_ok=True)
    count = visual.export(target / 'campus.glb')
    context = Mesh(site_to_world)
    nearby, _ = read_data(BASE / 'evidence' / 'neighborhood-osm.geojson')
    add_surroundings(context, nearby)
    add_traffic(context, lines)
    context.export(target / 'surroundings.glb')
    manifest(target, polygons)
    print(f'Campus GLB: {count:,} triangles')


if __name__ == '__main__':
    main()
