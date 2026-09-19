import { z } from 'zod';

export const updateDriverStatusSchema = z.object({
  body: z.object({
    isAvailable: z.boolean().optional(),
    currentLat: z.number().min(-90).max(90).optional(),
    currentLng: z.number().min(-180).max(180).optional(),
  }),
});
