import { catchAsync } from '../utils/asyncWrapper.js';
import { AuthService } from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { config } from '../config/index.js';

/**
 * Helper to attach HttpOnly secure authentication cookies
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = config.env === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Helper to clear authentication cookies on logout
 */
const clearTokenCookies = (res) => {
  const isProd = config.env === 'production';
  res.clearCookie('accessToken', { httpOnly: true, secure: isProd, sameSite: 'strict' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: isProd, sameSite: 'strict' });
};

export class AuthController {
  /**
   * @route   POST /api/v1/auth/register
   * @desc    Register new user account
   * @access  Public
   */
  static register = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } = await AuthService.register(req.body);
    setTokenCookies(res, accessToken, refreshToken);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      statusCode: HTTP_STATUS.CREATED,
      message: 'Account registered successfully',
      data: {
        user,
        accessToken,
        tokens: {
          access: accessToken
        }
      }
    });
  });

  /**
   * @route   POST /api/v1/auth/login
   * @desc    Login user & issue tokens
   * @access  Public
   */
  static login = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } = await AuthService.login(req.body);
    setTokenCookies(res, accessToken, refreshToken);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      message: 'Logged in successfully',
      data: {
        user,
        accessToken,
        tokens: {
          access: accessToken
        }
      }
    });
  });

  /**
   * @route   POST /api/v1/auth/logout
   * @desc    Logout user session by invalidating refresh token
   * @access  Protected
   */
  static logout = catchAsync(async (req, res) => {
    await AuthService.logout(req.user._id);
    clearTokenCookies(res);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      message: 'Logged out successfully'
    });
  });

  /**
   * @route   POST /api/v1/auth/refresh
   * @desc    Issue new access & refresh tokens
   * @access  Public
   */
  static refresh = catchAsync(async (req, res) => {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    const tokens = await AuthService.refresh({ refreshToken });
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        tokens: {
          access: tokens.accessToken
        }
      }
    });
  });

  /**
   * @route   GET /api/v1/auth/status
   * @desc    Get current authentication status
   * @access  Public (Optional Auth)
   */
  static getStatus = catchAsync(async (req, res) => {
    const isAuthenticated = !!req.user;
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      authenticated: isAuthenticated,
      user: req.user || null,
      data: {
        authenticated: isAuthenticated,
        user: req.user || null
      }
    });
  });

  /**
   * @route   GET /api/v1/auth/me
   * @desc    Get currently logged in user profile
   * @access  Protected
   */
  static getMe = catchAsync(async (req, res) => {
    const user = await AuthService.getProfile(req.user._id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: {
        user
      }
    });
  });

  /**
   * @route   PATCH /api/v1/auth/profile
   * @desc    Update profile info (name, avatar)
   * @access  Protected
   */
  static updateProfile = catchAsync(async (req, res) => {
    const updatedUser = await AuthService.updateProfile(req.user._id, req.body);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  });
}
