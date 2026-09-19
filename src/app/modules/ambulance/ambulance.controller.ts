import type { Request, Response } from 'express';
import { AmbulanceService } from './ambulance.service.js';
import { sendResponse } from '../../utils/sendResponse.js';

const createAmbulance = async (req: Request, res: Response): Promise<void> => {
  const result = await AmbulanceService.createAmbulance(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Ambulance created successfully',
    data: result,
  });
};

const getAmbulances = async (req: Request, res: Response): Promise<void> => {
  // biome-ignore lint/suspicious/noExplicitAny: Temporary bypass for query typings
  const result = await AmbulanceService.getAmbulances(req.query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ambulances retrieved successfully',
    data: result,
  });
};

const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const result = await AmbulanceService.updateStatus(req.params.id as string, req.body.status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ambulance status updated successfully',
    data: result,
  });
};

const deleteAmbulance = async (req: Request, res: Response): Promise<void> => {
  await AmbulanceService.softDeleteAmbulance(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ambulance deleted successfully',
  });
};

export const AmbulanceController = {
  createAmbulance,
  getAmbulances,
  updateStatus,
  deleteAmbulance,
};
