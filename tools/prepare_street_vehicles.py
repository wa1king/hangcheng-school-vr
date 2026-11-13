"""Prepare the OpenX 20261015 Corolla and Tucson GLBs for the browser."""

import argparse
import copy
import json
import struct
from pathlib import Path
from zipfile import ZipFile


MODELS = {
    'corolla': 'toyota_corolla_2014',
    'tucson': 'hyundai_tucson_2015',
}


def prepare(raw):
    size, = struct.unpack_from('<I', raw, 12)
    model = json.loads(raw[20:20 + size])
    materials = model['materials']
    brake = copy.deepcopy(next(material for material in materials if material['name'] == 'Lamp_Red'))
    brake.update(name='Street_Brake', emissiveFactor=[0.06, 0.001, 0.001])
    materials.append(brake)

    for node in model['nodes']:
        name = node.get('name', '')
        if 'children' in node:
            node['children'] = [i for i in node['children'] if model['nodes'][i].get('name') != 'Grp_Interior']
        if name.startswith('Light_Brake_'):
            for primitive in model['meshes'][node['mesh']]['primitives']:
                primitive['material'] = len(materials) - 1
        if name.startswith('License_Plate_'):
            primitives = model['meshes'][node['mesh']]['primitives']
            model['meshes'][node['mesh']]['primitives'] = [
                p for p in primitives if materials[p['material']]['name'] == 'License_Plate_White'
            ]
    # Only wheel pivots need their source names at runtime. Let gltfpack
    # consolidate body, lights and trim by material across all other nodes.
    for node in model['nodes']:
        if not node.get('name', '').startswith('Grp_Wheel_Steering_Rotating_'):
            node.pop('name', None)
    for scene in model['scenes']:
        scene.pop('extras', None)
    for material in materials:
        name = material['name']
        pbr = material['pbrMetallicRoughness']
        if name == 'Body':
            pbr.update(metallicFactor=.34, roughnessFactor=.26)
        elif name == 'Body_Glass':
            material.pop('alphaMode', None)
            pbr.update(baseColorFactor=[.031, .048, .064, 1.0], metallicFactor=.26, roughnessFactor=.17)
        elif name == 'Tire':
            pbr.update(baseColorFactor=[.026, .027, .026, 1.0], metallicFactor=0, roughnessFactor=.91)
        elif name == 'License_Plate_White':
            pbr['baseColorFactor'] = [.04, .19, .42, 1.0]

    payload = json.dumps(model, separators=(',', ':')).encode('utf-8')
    payload += b' ' * (-len(payload) % 4)
    binary = raw[20 + size:]
    header = struct.pack('<4sII I4s', b'glTF', 2, 20 + len(payload) + len(binary), len(payload), b'JSON')
    return header + payload + binary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path, help='Official OpenX release openx-assets-glb.zip')
    parser.add_argument('output', type=Path, help='Scratch output folder for unpacked GLBs')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    with ZipFile(args.archive) as archive:
        for key, model in MODELS.items():
            raw = archive.read(f'vehicles/{model}/{model}.glb')
            (args.output / f'{key}-prepared.glb').write_bytes(prepare(raw))


if __name__ == '__main__':
    main()
