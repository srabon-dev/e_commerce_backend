const ApiError = require('../../error/api.error');
const jwt = require('jsonwebtoken');
const {HTTP_STATUS} = require('../../utils/enum');

const checkLogin = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "You are not authorized for this role");
      }

      if (tokenWithBearer.startsWith("Bearer")) {
        const token = tokenWithBearer.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET);

        if (!decoded || !decoded.id || !decoded.role) {
          throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid token");
        }

        // Check if the user's role is in the allowed roles
        if (!allowedRoles.includes(decoded.role)) {
          throw new ApiError(HTTP_STATUS.FORBIDDEN, "You do not have permission to access this resource");
        }

        // Attach user info to the request object
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
      } else {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "You are not authorized for this role");
      }
    } catch (error) {
      console.log(`Auth Checking Catch Error ${error}`);
      next(error);
    }
  };
};

module.exports = checkLogin;