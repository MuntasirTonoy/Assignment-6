import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { UserRoutes } from "../modules/user/user.route.js";
import { DriverRoutes } from "../modules/driver/driver.route.js";
import { AmbulanceRoutes } from "../modules/ambulance/ambulance.route.js";
import { HospitalRoutes } from "../modules/hospital/hospital.route.js";
import { EmergencyRoutes } from "../modules/emergency/emergency.route.js";
import { AuditRoutes } from "../modules/audit/audit.route.js";
import { TripRoutes } from "../modules/trip/trip.route.js";
import { PaymentRoutes } from "../modules/payment/payment.route.js";

const router = Router();

const moduleRoutes = [
	{ path: "/auth", route: AuthRoutes },
	{ path: "/users", route: UserRoutes },
	{ path: "/drivers", route: DriverRoutes },
	{ path: "/ambulances", route: AmbulanceRoutes },
	{ path: "/hospitals", route: HospitalRoutes },
	{ path: "/emergencies", route: EmergencyRoutes },
	{ path: "/audit-logs", route: AuditRoutes },
	{ path: "/trips", route: TripRoutes },
	{ path: "/payments", route: PaymentRoutes },
];

for (const route of moduleRoutes) {
	router.use(route.path, route.route);
}

export default router;
