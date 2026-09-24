import { Role } from "@prisma/client";
import { prisma } from "../../utils/prisma.js";
import { AppError } from "../../errors/AppError.js";

const getMe = async (userId: string) => {
	const user = await prisma.user.findFirst({
		where: { id: userId, deletedAt: null },
		include: { driverProfile: true },
	});

	if (!user) {
		throw new AppError(404, "User profile not found");
	}

	return user;
};

const updateMe = async (
	userId: string,
	data: { name?: string; phone?: string },
) => {
	return await prisma.user.update({
		where: { id: userId },
		data,
		include: { driverProfile: true },
	});
};

export const UserService = {
	getMe,
	updateMe,
};
