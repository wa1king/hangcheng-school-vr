"""Build material-batched GLB geometry in the campus coordinate system."""

import json
import math
import struct
from array import array
from collections import defaultdict


def cross(a, b, c):
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def signed_area(points):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:] + points[:1])) / 2


def triangulate(points):
    active = list(range(len(points)))
    if signed_area(points) < 0:
        active.reverse()
    result = []
    while len(active) > 3:
        for i, current in enumerate(active):
            prev, following = active[i - 1], active[(i + 1) % len(active)]
            a, b, c = points[prev], points[current], points[following]
            turn = cross(a, b, c)
            if abs(turn) < 1e-8:
                active.pop(i)
                break
            if turn < 0:
                continue
            if any(
                min(cross(a, b, points[j]), cross(b, c, points[j]), cross(c, a, points[j])) >= -1e-8
                for j in active if j not in (prev, current, following)
            ):
                continue
            result.append((prev, current, following))
            active.pop(i)
            break
        else:
            raise ValueError(f'Cannot triangulate polygon {points}')
    result.append(tuple(active))
    return result


def srgb(value):
    v = value / 255
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


class Mesh:
    def __init__(self, transform=lambda x, y, z: (x, y, z)):
        self.batches = defaultdict(lambda: (array('f'), array('f'), array('f'), array('I')))
        self.materials = {}
        self.transform = transform

    def material(self, name, rgb, roughness=0.85, metallic=0.0, texture=None, double=False, normal=None):
        self.materials[name] = (rgb, roughness, metallic, texture, double, normal)

    def face(self, mat, vertices, triangles=None, uv=None):
        points = [self.transform(*p) for p in vertices]
        p, q, r = points[:3]
        a = [q[i] - p[i] for i in range(3)]
        b = [r[i] - p[i] for i in range(3)]
        n = (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
        length = math.sqrt(sum(d * d for d in n))
        if length < 1e-9:
            return
        n = tuple(d / length for d in n)
        pos, normal, coords, indices = self.batches[mat]
        start = len(pos) // 3
        for point in points:
            pos.extend(point)
            normal.extend(n)
        if uv is None:
            major = max(range(3), key=lambda i: abs(n[i]))
            u, v = ((2, 1), (0, 2), (0, 1))[major]
            uv = [(point[u] / 3, point[v] / 3) for point in vertices]
        for point in uv:
            coords.extend(point)
        if triangles is None:
            triangles = [(0, i, i + 1) for i in range(1, len(points) - 1)]
        indices.extend(start + i for triangle in triangles for i in triangle)

    def surface(self, mat, points, y):
        points = list(points)
        if points[0] == points[-1]:
            points.pop()
        for i, j, k in triangulate(points):
            self.face(mat, [(points[n][0], y, points[n][1]) for n in (i, k, j)])

    def prism(self, mat, points, low, high, top=None, bottom=True):
        points = list(points)
        if points[0] == points[-1]:
            points.pop()
        if signed_area(points) < 0:
            points.reverse()
        self.surface(top or mat, points, high)
        if bottom:
            for i, j, k in triangulate(points):
                self.face(mat, [(points[n][0], low, points[n][1]) for n in (i, j, k)])
        for (x, z), (X, Z) in zip(points, points[1:] + points[:1]):
            self.face(mat, [(x, low, z), (x, high, z), (X, high, Z), (X, low, Z)])

    def box(self, mat, x, y, z, w, h, d, angle=0, top=None):
        c, s = math.cos(angle), math.sin(angle)
        points = [(x + dx * c - dz * s, z + dx * s + dz * c) for dx, dz in rect(0, 0, w, d)]
        self.prism(mat, points, y, y + h, top=top)

    def strip(self, mat, a, b, width, y, height=0):
        x, z = a
        X, Z = b
        length = math.hypot(X - x, Z - z)
        if length < 1e-6:
            return
        angle = math.atan2(Z - z, X - x)
        if height:
            self.box(mat, (x + X) / 2, y, (z + Z) / 2, length, height, width, angle)
        else:
            nx, nz = -math.sin(angle) * width / 2, math.cos(angle) * width / 2
            self.surface(mat, [(x - nx, z - nz), (X - nx, Z - nz), (X + nx, Z + nz), (x + nx, z + nz)], y)

    def cylinder(self, mat, x, y, z, r, h, segments=12):
        points = [(x + r * math.cos(i * math.tau / segments), z + r * math.sin(i * math.tau / segments)) for i in range(segments)]
        self.prism(mat, points, y, y + h)

    def export(self, path):
        binary = bytearray()
        gltf = {
            'asset': {'version': '2.0', 'generator': 'Hangcheng School VR campus builder'},
            'scenes': [{'nodes': [0]}], 'scene': 0,
            'nodes': [{'name': path.stem, 'mesh': 0}], 'meshes': [{'primitives': []}],
            'materials': [], 'buffers': [], 'bufferViews': [], 'accessors': [],
            'images': [], 'textures': [], 'samplers': [{'wrapS': 10497, 'wrapT': 10497}],
        }

        def view(data, target=None):
            binary.extend(bytes((-len(binary)) % 4))
            definition = {'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data)}
            if target:
                definition['target'] = target
            binary.extend(data)
            gltf['bufferViews'].append(definition)
            return len(gltf['bufferViews']) - 1

        def accessor(values, size, is_index=False, bounds=False):
            definition = {
                'bufferView': view(values.tobytes(), 34963 if is_index else 34962),
                'componentType': 5125 if is_index else 5126,
                'count': len(values) // size,
                'type': 'SCALAR' if size == 1 else f'VEC{size}',
            }
            if bounds:
                definition['min'] = [min(values[i::size]) for i in range(size)]
                definition['max'] = [max(values[i::size]) for i in range(size)]
            gltf['accessors'].append(definition)
            return len(gltf['accessors']) - 1

        texture_indices = {}

        def add_texture(texture):
            if texture not in texture_indices:
                gltf['images'].append({'bufferView': view(texture[0]), 'mimeType': texture[1]})
                gltf['textures'].append({'source': len(gltf['images']) - 1, 'sampler': 0})
                texture_indices[texture] = len(gltf['textures']) - 1
            return texture_indices[texture]

        for name, (pos, norms, uv, inds) in self.batches.items():
            if not inds:
                continue
            rgb, rough, metal, texture, double, normal = self.materials[name]
            pbr = {'baseColorFactor': [*(srgb(v) for v in rgb), 1], 'roughnessFactor': rough, 'metallicFactor': metal}
            material = {'name': name, 'doubleSided': double, 'pbrMetallicRoughness': pbr}
            if texture:
                pbr['baseColorTexture'] = {'index': add_texture(texture)}
                if texture[1] == 'image/png':
                    material['alphaMode'] = 'MASK'
                    material['alphaCutoff'] = 0.35
            if normal:
                material['normalTexture'] = {'index': add_texture(normal), 'scale': 0.55}
            gltf['materials'].append(material)
            gltf['meshes'][0]['primitives'].append({
                'attributes': {'POSITION': accessor(pos, 3, bounds=True), 'NORMAL': accessor(norms, 3), 'TEXCOORD_0': accessor(uv, 2)},
                'indices': accessor(inds, 1, is_index=True), 'material': len(gltf['materials']) - 1,
            })
        binary.extend(bytes((-len(binary)) % 4))
        gltf['buffers'].append({'byteLength': len(binary)})
        body = json.dumps(gltf, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
        body += b' ' * ((-len(body)) % 4)
        with path.open('wb') as out:
            out.write(struct.pack('<4sII', b'glTF', 2, 28 + len(body) + len(binary)))
            out.write(struct.pack('<I4s', len(body), b'JSON'))
            out.write(body)
            out.write(struct.pack('<I4s', len(binary), b'BIN\0'))
            out.write(binary)
        return sum(len(batch[-1]) // 3 for batch in self.batches.values())


def rect(x, z, w, d):
    return [(x - w / 2, z - d / 2), (x + w / 2, z - d / 2), (x + w / 2, z + d / 2), (x - w / 2, z + d / 2)]


def rounded(x, z, w, d, radius, steps=6):
    points = []
    for sx, sz, start in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        cx, cz = x + sx * (w / 2 - radius), z + sz * (d / 2 - radius)
        for step in range(steps + 1):
            angle = math.radians(start + 90 * step / steps)
            points.append((cx + radius * math.cos(angle), cz + radius * math.sin(angle)))
    return points
