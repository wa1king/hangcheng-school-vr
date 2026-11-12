import { Mesh, MeshStandardMaterial, type Object3D } from 'three';

type Road = 'aviation' | 'xuezi';
type Lamp = 'red' | 'yellow' | 'green';

const lensMaterial = /^traffic-lens-(aviation|xuezi)-(red|yellow|green)$/;
const litColor: Record<Lamp, number> = { red: 0xf94135, yellow: 0xffba2f, green: 0x39d47a };
const phases: ReadonlyArray<{ untilMs: number; aviation: Lamp; xuezi: Lamp }> = [
  { untilMs: 12000, aviation: 'red', xuezi: 'green' },
  { untilMs: 15000, aviation: 'red', xuezi: 'yellow' },
  { untilMs: 16500, aviation: 'red', xuezi: 'red' },
  { untilMs: 36500, aviation: 'green', xuezi: 'red' },
  { untilMs: 39500, aviation: 'yellow', xuezi: 'red' },
  { untilMs: 41000, aviation: 'red', xuezi: 'red' },
];

export function createCampusTraffic(root: Object3D): ((timeMs: number) => void) | undefined {
  const lenses = new Map<MeshStandardMaterial, { road: Road; lamp: Lamp }>();
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue;
      const match = lensMaterial.exec(material.name);
      if (match) lenses.set(material, { road: match[1] as Road, lamp: match[2] as Lamp });
    }
  });
  if (!lenses.size) return undefined;

  let startedAt: number | undefined;
  let lastPhase: (typeof phases)[number] | undefined;
  const duration = phases[phases.length - 1].untilMs;
  return (timeMs) => {
    startedAt ??= timeMs;
    const elapsed = (timeMs - startedAt) % duration;
    const phase = phases.find(({ untilMs }) => elapsed < untilMs);
    if (!phase || phase === lastPhase) return;
    lastPhase = phase;
    for (const [material, { road, lamp }] of lenses) {
      material.emissive.setHex(phase[road] === lamp ? litColor[lamp] : 0);
    }
  };
}
