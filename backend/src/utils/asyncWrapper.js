/**
 * Async request handler wrapper to catch unhandled Promise rejections
 * and automatically forward them to express error middleware.
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
