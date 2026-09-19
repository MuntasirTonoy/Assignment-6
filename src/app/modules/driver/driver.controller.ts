import type { Request, Response } from 'express';
import { DriverService } from './driver.service.js';
import { sendResponse } from '../../utils/sendResponse.js';

const updateStatus = async (req: Request, res: Response): Promise<void> => {
  // biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
  const userId = req.user!.id;
  const result = await DriverService.updateStatusAndLocation(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Driver status and location updated successfully',
    data: result,
  });
};

export const DriverController = {
  updateStatus,
};
