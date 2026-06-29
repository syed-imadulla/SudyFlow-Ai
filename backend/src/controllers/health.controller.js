import { catchAsync } from '../utils/asyncWrapper.js';
import { config } from '../config/index.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Format system uptime in human readable seconds format
 */
const formatUptime = (seconds) => {
  return `${seconds.toFixed(2)}s`;
};

/**
 * @desc    Check system operational health & uptime
 * @route   GET /api/v1/health
 * @access  Public
 */
export const checkHealth = catchAsync(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    version: '1.0.0',
    uptime: formatUptime(process.uptime()),
    environment: config.env
  });
});
