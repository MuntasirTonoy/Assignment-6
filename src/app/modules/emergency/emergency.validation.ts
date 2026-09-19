import { PriorityLevel, RequestStatus } from '@prisma/client';
import { z } from 'zod';

export const createEmergencySchema = z.object({
  body: z.object({
    pickupAddress: z.string().min(5, 'Pickup address is required'),
    pickupLat: z.number().min(-90).max(90, 'Invalid latitude'),
    pickupLng: z.number().min(-180).max(180, 'Invalid longitude'),
    patientCondition: z.string().min(3, 'Patient condition description is required'),
    priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
  }),
});

export const dispatchEmergencySchema = z.object({
  body: z.object({
    ambulanceId: z.string().uuid('Valid ambulance UUID is required'),
    driverId: z.string().uuid('Valid driver UUID is required'),
  }),
});

export const emergencyFilterSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.nativeEnum(RequestStatus).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
  }),
});
