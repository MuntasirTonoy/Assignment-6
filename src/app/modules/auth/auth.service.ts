import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../utils/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { env } from "../../../config/index.js";
import type { Role } from "@prisma/client";

const registerUser = async (payload: any) => {
	const { email, password, name, phone, role } = payload;

	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		throw new AppError(409, "User already exists with this email");
	}

	const passwordHash = await bcrypt.hash(password, 12);

	const newUser = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				email,
				passwordHash,
				name,
				phone,
				role: role || "PATIENT",
			},
		});

		if (user.role === "DRIVER" && payload.licenseNumber) {
			await tx.driverProfile.create({
				data: {
					userId: user.id,
					licenseNumber: payload.licenseNumber,
					isAvailable: true,
				},
			});
		}

		return user;
	});

	// @ts-expect-error
	delete newUser.passwordHash;

	return newUser;
};

const generateToken = (user: any) => {
	const payload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};
	return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });
};

export const AuthService = {
	registerUser,
	generateToken,
};
