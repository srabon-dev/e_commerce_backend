const User = require("./auth.model");
const catchAsync = require("../../../share/catch.async");
const cron = require("node-cron");

const {signUpAccount, verifyAccount, loginAccount, resendOTP} = require('./auth.service');

const signUp = catchAsync(async (req, res) => {

  const email = await signUpAccount(req.body);

  res.status(200).json({
    status: true,
    message: `Please check your mail we send a verification code in your email ${email}`,
  });
});

const activeAccount = catchAsync(async (req, res) => {

  const token = await verifyAccount(req.body, res);

  res.status(200).json({
    status: true,
    message: "Account activated successfully.",
    accessToken: token,
  });
});

const resendActiveAccount = catchAsync(async (req, res)=>{

  const data = await resendOTP(req.body);

  res.status(200).json({
    status: data,
    message: "OTP Resend successful"
  });
});

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

    console.log(`Cron Job: Deleted ${result.deletedCount} unverified users.`);

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

const user = catchAsync(async (req, res) => {

  //Get USER ID from middleware added from respose header
  const userId = req.userId;

  //Checking User Id
  if(!userId){
    throw new ApiError(400, "You are not valid user");
  }

  //Find User
  const user = await User.findById(userId).select("name profileImage email role isActive address dateOfBirth createdAt updatedAt");

  //Check Is Have User data or Not
  if (!user) {
    return res.status(404).json({ message: "User not exit" });
  }

  //Return Respose
  res.status(200).json({ message: "User Get successful", data: user });
});

const update = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { name, address, dateOfBirth } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, address, dateOfBirth },
    { new: true, runValidators: true }
  ).select("name email role address dateOfBirth");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User updated successfully",
    data: user,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const userId = req.userId;

  const user = await User.findByIdAndDelete(userId).select(
    "name email role address dateOfBirth"
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User deleted successfully",
    data: user,
  });
});

const AuthController = {
  signUp,
  activeAccount,
  resendActiveAccount,
  login,
  user,
  update,
  deleteUser,
};

module.exports = { AuthController };
