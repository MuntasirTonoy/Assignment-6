import { Router } from 'express';
import { DriverController } from './driver.controller.js';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { updateDriverStatusSchema } from './driver.validation.js';
import { Role } from '@prisma/client';

const router = Router();

router.patch(
  '/status',
  auth(Role.DRIVER),
  validateRequest(updateDriverStatusSchema),
  DriverController.updateStatus
);

export const DriverRoutes = router;
