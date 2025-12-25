import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

class JwtService {
  generateAccessToken(userId) {
    return jwt.sign({ userId, type: "access" }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRATION,
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ userId, type: "refresh" }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRATION,
    });
  }

  generatePasswordResetToken(userId) {
    return jwt.sign({ userId, type: "reset" }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_RESET_PASSWORD_EXPIRATION,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, ENV.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

export const jwtService = new JwtService();
export default jwtService;
