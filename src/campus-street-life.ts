import { Group, type Object3D, type Vector3 } from 'three';
import { loadStreetPeople, type CampusPeopleRoute, type StreetPeopleRoute } from './campus-pedestrians.ts';
import { createCampusTraffic, streetTrafficPhase } from './campus-traffic.ts';
import { moveStreetVehicles, type StreetLane } from './street-vehicle-motion.ts';
import { loadStreetVehicleModels } from './street-vehicle-model.ts';

type StreetRoutes = {
  vehicles: StreetLane[];
  people: StreetPeopleRoute[];
  campusPeople?: CampusPeopleRoute[];
  motion?: string;
};

export function createStreetLife(context: Object3D, manifestURL: URL, routesPath: string | undefined,
  lightVehicles: (vehicles: Object3D) => void) {
  const setSignal = createCampusTraffic(context);
  let elapsed = 0;
  let updateVehicles: ReturnType<typeof moveStreetVehicles> | undefined;
  let updatePeople: Awaited<ReturnType<typeof loadStreetPeople>> | undefined;
  let ready = !routesPath;
  if (routesPath) {
    const vehicles = new Group();
    vehicles.name = 'street-vehicles';
    const people = new Group();
    people.name = 'street-pedestrians';
    const routesURL = new URL(routesPath, manifestURL);
    const loadRoutes = fetch(routesURL).then(async response => {
      if (!response.ok) throw new Error('道路路线载入失败');
      return await response.json() as StreetRoutes;
    });
    const loadVehicleModels = loadStreetVehicleModels(manifestURL);
    void Promise.allSettled([
      Promise.all([loadRoutes, loadVehicleModels]).then(([routes, instantiate]) => {
        updateVehicles = moveStreetVehicles(routes.vehicles, index => {
          const vehicle = instantiate(index);
          vehicles.add(vehicle.object);
          return vehicle;
        });
        lightVehicles(vehicles);
      }),
      loadRoutes.then(async routes => {
        updatePeople = await loadStreetPeople(people, manifestURL, routes.people, routes.campusPeople, routes.motion);
      }),
    ]).then(results => {
      if (updateVehicles) context.add(vehicles);
      if (updatePeople) context.add(people);
      for (const result of results) {
        if (result.status === 'rejected') console.warn('街景模型载入失败', result.reason);
      }
      ready = true;
    });
  }

  // Actors and lamps share simulation time, including on slow devices.
  return (dt: number, cameraPosition: Vector3) => {
    if (ready) elapsed += dt * 1000;
    const { phase, canCross } = streetTrafficPhase(elapsed);
    setSignal?.(phase);
    if (ready) {
      updateVehicles?.(dt, phase.aviation);
      updatePeople?.(dt, elapsed, canCross, cameraPosition);
    }
  };
}
