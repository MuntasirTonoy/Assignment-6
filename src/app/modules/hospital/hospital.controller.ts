import type { Request, Response } from 'express';
import { HospitalService } from './hospital.service.js';
import { sendResponse } from '../../utils/sendResponse.js';

const createHospital = async (req: Request, res: Response): Promise<void> => {
  const result = await HospitalService.createHospital(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hospital created successfully',
    data: result,
  });
};

const getHospitals = async (_req: Request, res: Response): Promise<void> => {
  const result = await HospitalService.getHospitals();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hospitals retrieved successfully',
    data: result,
  });
};

const updateBeds = async (req: Request, res: Response): Promise<void> => {
  const result = await HospitalService.updateBeds(req.params.id as string, req.body.availableBeds);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hospital beds updated successfully',
    data: result,
  });
};

const deleteHospital = async (req: Request, res: Response): Promise<void> => {
  await HospitalService.softDeleteHospital(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hospital deleted successfully',
  });
};

export const HospitalController = {
  createHospital,
  getHospitals,
  updateBeds,
  deleteHospital,
};
