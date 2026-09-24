import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { prisma } from "../app/utils/prisma.js";
import { env } from "./index.js";

// Local Strategy for Email/Password
passport.use(
	new LocalStrategy(
		{ usernameField: "email" },
		async (email, password, done) => {
			try {
				const user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user || !user.passwordHash || user.deletedAt) {
					return done(null, false, { message: "Invalid email or password" });
				}

				const isMatch = await bcrypt.compare(password, user.passwordHash);
				if (!isMatch) {
					return done(null, false, { message: "Invalid email or password" });
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

// JWT Strategy for API protection
passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: env.JWT_SECRET,
		},
		async (jwtPayload, done) => {
			try {
				const user = await prisma.user.findUnique({
					where: { id: jwtPayload.id },
				});

				if (!user || user.deletedAt) {
					return done(null, false);
				}

				return done(null, user);
			} catch (error) {
				return done(error, false);
			}
		},
	),
);

// Google OAuth Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				callbackURL: "/api/v1/auth/google/callback",
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const email = profile.emails?.[0].value;
					if (!email) {
						return done(new Error("No email found from Google profile"));
					}

					let user = await prisma.user.findUnique({
						where: { email },
					});

					if (!user) {
						// Create new user
						user = await prisma.user.create({
							data: {
								email,
								name: profile.displayName || "Unknown User",
								googleId: profile.id,
								role: "PATIENT", // default role
							},
						});
					} else if (!user.googleId) {
						// Link Google ID to existing email
						user = await prisma.user.update({
							where: { email },
							data: { googleId: profile.id },
						});
					}

					return done(null, user);
				} catch (error) {
					return done(error);
				}
			},
		),
	);
}

// Session Serialization for Google OAuth
passport.serializeUser((user: any, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

export default passport;
