import { AmbulanceStatus } from '@prisma/client';
import { z } from 'zod';

export const createAmbulanceSchema = z.object({
  body: z.object({
    vehicleNumber: z.string().min(3, 'Vehicle number must be at least 3 characters'),
    baseFee: z.number().positive('Base fee must be positive'),
    perKmRate: z.number().positive('Per km rate must be positive'),
  }),
});

export const updateAmbulanceStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(AmbulanceStatus),
  }),
});
