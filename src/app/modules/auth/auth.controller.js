const User = require("./auth.model");
const catchAsync = require("../../../share/catch.async");
const cron = require("node-cron");

const {signUpAccount, verifyAccount, loginAccount, resendOTP, forgetOTPVerify, resetOldPassword} = require('./auth.service');


//###################################################################### Sign Up START #############################################################################################
const signUp = catchAsync(async (req, res) => {

  const email = await signUpAccount(req.body);

  res.status(200).json({
    status: true,
    message: `Please check your email we send a verification code in your email ${email}`,
  });
});

//###################################################################### Active Account START #############################################################################################
const activeAccount = catchAsync(async (req, res) => {

  const token = await verifyAccount(req.body, res);

  res.status(200).json({
    status: true,
    message: "Account activated successfully.",
    accessToken: token,
  });
});

//###################################################################### RESEND Active OTP START #############################################################################################
const resendActiveAccount = catchAsync(async (req, res)=>{

  const data = await resendOTP(req.body);

  res.status(200).json({
    status: data,
    message: "OTP Resend successful"
  });
});

//###################################################################### Cron Check And Delete Unverified User START #############################################################################################
// Run Cron and if user account not active then remove user from database
cron.schedule("*/5 * * * *", async () => {

  // 20 minutes ago
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
  console.log("Call Gron Job", twentyMinutesAgo);
  try {

    // Find unverified users who were created more than 20 minutes ago
    const result = await User.deleteMany({
      isActive: false,
      role: "USER",
      createdAt: { $lt: twentyMinutesAgo },
    });

    const updatedResult = await User.updateMany(
      {
        role: "USER",
        updatedAt: { $lt: twentyMinutesAgo }, // Check last update was within 20 minutes
        activationCode: { $exists: true, $ne: null }, // Ensure activationCode exists
      },
      { $set: { activationCode: null } }
    );

    console.log(`Cron Job: Deleted ${result.deletedCount} unverified users. and update activition code null ${updatedResult.matchedCount}`);

  } catch (error) {
    console.error("Error during cleanup:", error.message);
  }
});

const login = catchAsync(async (req, res) => {
  const token = await loginAccount(req.body);

  res.status(200).json({
    status: true,
    message: "Login successful",
    accessToken: token,
  });
});

//###################################################################### FORGET PASSWORD START #############################################################################################
const forgetPassword = catchAsync(async (req, res)=>{

  const data = await resendOTP(req.body);

  res.status(200).json({
    status: data,
    message: `Please check your mail we send a verification code in your email ${req.body.email}`
  });
});

//###################################################################### FORGET PASSWORD START #############################################################################################
const forgetPasswordOTP = catchAsync(async (req, res)=>{

  const data = await forgetOTPVerify(req.body, res);

  res.status(200).json({
    status: data,
    message: `OTP verification successful!`
  });
});

//###################################################################### RESET PASSWORD START #############################################################################################
const resetPassword = catchAsync(async (req, res)=>{

  const data = await resetOldPassword(req.body);

  res.status(200).json({
    status: data,
    message: "Password has been reset successfully"
  });
});

const AuthController = {
  signUp,
  activeAccount,
  resendActiveAccount,
  login,
  forgetPassword,
  forgetPasswordOTP,
  resetPassword
};

module.exports = { AuthController };
