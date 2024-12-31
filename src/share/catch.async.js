const catchAsync = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        console.log(`catchAsync Catch Error : ${error}`);
        next(error);
      }
    };
  };
  
  module.exports = catchAsync;