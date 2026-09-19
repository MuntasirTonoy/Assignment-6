import { Router } from 'express';
import { Role } from '@prisma/client';
import { AmbulanceController } from './ambulance.controller.js';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { createAmbulanceSchema, updateAmbulanceStatusSchema } from './ambulance.validation.js';

const router = Router();

router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(createAmbulanceSchema),
  AmbulanceController.createAmbulance
);
router.get('/', auth(Role.ADMIN, Role.DRIVER), AmbulanceController.getAmbulances);
router.patch(
  '/:id/status',
  auth(Role.ADMIN),
  validateRequest(updateAmbulanceStatusSchema),
  AmbulanceController.updateStatus
);
router.delete('/:id', auth(Role.ADMIN), AmbulanceController.deleteAmbulance);

export const AmbulanceRoutes = router;
