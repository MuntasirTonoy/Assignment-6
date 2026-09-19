import { Role } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../errors/AppError.js';

const syncClerkUser = async (
  clerkId: string,
  payload: { email: string; name: string; phone?: string; role: Role; licenseNumber?: string }
) => {
  return await prisma.$transaction(async (tx) => {
    let user = await tx.user.findFirst({
      where: {
        OR: [{ clerkId }, { email: payload.email }],
        deletedAt: null,
      },
    });

    if (user) {
      user = await tx.user.update({
        where: { id: user.id },
        data: {
          clerkId,
          name: payload.name,
          phone: payload.phone ?? user.phone,
        },
      });
    } else {
      user = await tx.user.create({
        data: {
          clerkId,
          email: payload.email,
          name: payload.name,
          phone: payload.phone,
          role: payload.role,
        },
      });
    }

    if (payload.role === Role.DRIVER && payload.licenseNumber) {
      await tx.driverProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          licenseNumber: payload.licenseNumber,
          isAvailable: true,
        },
        update: {
          licenseNumber: payload.licenseNumber,
        },
      });
    }

    return tx.user.findUnique({
      where: { id: user.id },
      include: { driverProfile: true },
    });
  });
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { driverProfile: true },
  });

  if (!user) {
    throw new AppError(404, 'User profile not found');
  }

  return user;
};

const updateMe = async (userId: string, data: { name?: string; phone?: string }) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
    include: { driverProfile: true },
  });
};

export const UserService = {
  syncClerkUser,
  getMe,
  updateMe,
};
