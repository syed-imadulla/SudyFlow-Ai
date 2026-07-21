import crypto from 'crypto';
import { User } from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

/**
 * Helper to securely hash refresh tokens with SHA-256 before database storage or lookup
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export class AuthService {
  /**
   * Register a new user account
   */
  static async register({ name, email, password }) {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('An account with this email address already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const tokenVer = user.tokenVersion || 0;
    const accessToken = generateAccessToken(user._id, user.role, tokenVer);
    const refreshToken = generateRefreshToken(user._id, tokenVer);

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Login user with email and password
   */
  static async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const tokenVer = user.tokenVersion || 0;
    const accessToken = generateAccessToken(user._id, user.role, tokenVer);
    const refreshToken = generateRefreshToken(user._id, tokenVer);

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Logout user by clearing stored refresh token
   */
  static async logout(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  /**
   * Rotate access and refresh tokens using a valid refresh token
   */
  static async refresh({ refreshToken }) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const hashedIncoming = hashToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== hashedIncoming || (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion)) {
      throw new AppError('Invalid or expired refresh token session', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const tokenVer = user.tokenVersion || 0;
    const newAccessToken = generateAccessToken(user._id, user.role, tokenVer);
    const newRefreshToken = generateRefreshToken(user._id, tokenVer);

    user.refreshToken = hashToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Fetch user profile
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User account not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return user;
  }

  /**
   * Update user profile fields (name, avatar)
   */
  static async updateProfile(userId, patchData) {
    const allowedUpdates = {};
    if (patchData.name) allowedUpdates.name = patchData.name;
    if (patchData.avatar) allowedUpdates.avatar = patchData.avatar;

    const updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      throw new AppError('User account not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    return updatedUser;
  }
}
