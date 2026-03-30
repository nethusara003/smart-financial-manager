import User from "../models/User.js";
import {
	extractBearerToken,
	verifyAccessToken,
	buildGuestUser,
} from "./requireAuth.js";

export const protect = async (req, res, next) => {
	const token = extractBearerToken(req);

	if (!token) {
		return res.status(401).json({ message: "Not authorized, no token" });
	}

	try {
		const decoded = verifyAccessToken(token);

		if (typeof decoded === "string") {
			return res.status(401).json({ message: "Invalid token format" });
		}

		if (decoded.role === "guest") {
			req.user = buildGuestUser(decoded);
			return next();
		}

		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		const normalizedUser = typeof user.toObject === "function" ? user.toObject() : user;

		req.user = {
			...normalizedUser,
			isGuest: false,
		};

		return next();
	} catch (error) {
		return res.status(401).json({ message: "Not authorized, token failed" });
	}
};

export default protect;
