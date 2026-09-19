import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.route.js';
import { DriverRoutes } from '../modules/driver/driver.route.js';
import { AmbulanceRoutes } from '../modules/ambulance/ambulance.route.js';
import { HospitalRoutes } from '../modules/hospital/hospital.route.js';

const router = Router();

const moduleRoutes = [
  { path: '/users', route: UserRoutes },
  { path: '/drivers', route: DriverRoutes },
  { path: '/ambulances', route: AmbulanceRoutes },
  { path: '/hospitals', route: HospitalRoutes },
];

for (const route of moduleRoutes) {
  router.use(route.path, route.route);
}

export default router;
