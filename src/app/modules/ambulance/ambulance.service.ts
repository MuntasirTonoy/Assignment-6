import { AmbulanceStatus, type Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../errors/AppError.js';

const createAmbulance = async (payload: {
  vehicleNumber: string;
  baseFee: number;
  perKmRate: number;
}) => {
  const existing = await prisma.ambulance.findFirst({
    where: { vehicleNumber: payload.vehicleNumber, deletedAt: null },
  });

  if (existing) {
    throw new AppError(409, 'Ambulance with this vehicle number already exists');
  }

  return await prisma.ambulance.create({
    data: {
      vehicleNumber: payload.vehicleNumber,
      baseFee: payload.baseFee,
      perKmRate: payload.perKmRate,
      status: AmbulanceStatus.AVAILABLE,
    },
  });
};

const getAmbulances = async (filters: { status?: AmbulanceStatus; page?: number; limit?: number }) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.AmbulanceWhereInput = {
    deletedAt: null,
    ...(filters.status && { status: filters.status }),
  };

  const [data, total] = await Promise.all([
    prisma.ambulance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ambulance.count({ where }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
};

const updateStatus = async (id: string, status: AmbulanceStatus) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, deletedAt: null },
  });

  if (!ambulance) {
    throw new AppError(404, 'Ambulance not found');
  }

  return await prisma.ambulance.update({
    where: { id },
    data: { status },
  });
};

const softDeleteAmbulance = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, deletedAt: null },
  });

  if (!ambulance) {
    throw new AppError(404, 'Ambulance not found');
  }

  return await prisma.ambulance.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const AmbulanceService = {
  createAmbulance,
  getAmbulances,
  updateStatus,
  softDeleteAmbulance,
};
