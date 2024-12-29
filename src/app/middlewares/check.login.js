const ApiError = require('../../error/api.error');
const jwt = require('jsonwebtoken');

const checkLogin = async (req, res, next)=>{
    try{
        const tokenWithBearer = req.headers.authorization;
        console.log(`Auth ${tokenWithBearer}`);
    if (!tokenWithBearer) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized for this role"
        );
      }else{
        if (tokenWithBearer.startsWith("Bearer")) {
            const token = tokenWithBearer.split(" ")[1]; 
           // Verify token 
            const verifyUser = jwt.verify(token, process.env.SECRET); 
            const {id} = verifyUser;
            // Set user to headers
            req.userId = id; 
            next();
          }else{
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                "You are not authorized for this role"
              );
          }
      }
    }catch(error){
        next(error);
    }
}

module.exports = checkLogin;