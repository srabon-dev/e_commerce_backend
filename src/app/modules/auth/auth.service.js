const User = require("./auth.model");
const catchAsync = require("../../../share/catch.async");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createActivationToken = require("../../../utils/token.create");
const { sendEmail } = require("../../../utils/send.mail");
const { registrationSuccessEmailBody } = require("../../../mails/email.signup");
const { USER_ROLE, HTTP_STATUS } = require("../../../utils/enum");
const ApiError = require("../../../error/api.error");
const cron = require("node-cron");

//###################################################################### SIGN UP START #############################################################################################
const signUpAccount = async (payload) => {
  // req All Body Receive
  const { name, email, role, password, confirmPassword } = payload;

  //Validation Role
  if (!role || !Object.values(USER_ROLE).includes(role)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Valid Role is required!");
  }

  // Validation Password and email
  if (!password || !confirmPassword || !email) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Email, Password, and Confirm Password are required!"
    );
  }

  // Validation Password and confirm password
  if (password !== confirmPassword) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Password and Confirm Password didn't match"
    );
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });

  // Check email is Already USE or Not
  if (existingUser) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email already in use!");
  }

  // hashedPassword
  const hashedPassword = await bcrypt.hash(password, 10);
  payload.password = hashedPassword;

  //OTP Create
  const { activationCode } = createActivationToken();
  payload.activationCode = activationCode;

  //checking is USER or ADMIN if is USER then send mail
  if (role === "USER") {
    sendEmail({
      email: email,
      subject: "Activate Your Account",
      html: registrationSuccessEmailBody({
        user: { name: name },
        activationCode,
      }),
    }).catch((error) => console.log("Failed to send email:", error.message));
  }

  //Remove Confirm Password from req.body
  const { confirmPassword: confPass, ...other } = payload;

  //Save All Data and In MongoDB Database
  await User.create(other);
  return email;
};

//###################################################################### Verify START #############################################################################################

const verifyAccount = async (payload, res) => {
  //Req All Body Receive
  const { email, otp } = payload;

  // Validation Password and email
  if (!email || !otp) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "OTP are required!");
  }

  //Get User data from Database
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  // Check if the account is already active or Not
  if (user.isActive) {
    return res
      .status(200)
      .json({ message: "Account already activated!", status: true });
  }

  // Check if the account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000); // in minutes
    throw new ApiError(
      403,
      `Account locked. Try again in ${remainingTime} minute(s).`
    );
  }

  //checking OTP
  if (user.activationCode !== otp) {
    user.loginAttempts += 1;

    // Lock account if attempts exceed 5
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 20 * 60000);
      user.loginAttempts = 0; // Reset attempts after locking
    }

    await user.save();
    return res.status(400).json({ message: "Invalid activation code." });
  }

  user.isActive = true;
  user.activationCode = null;
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.SECRET
  );
  await user.save();
  return token;
};

const resendOTP = async (plyload) => {
  const { email } = plyload;

    // Validation Password and email
    if ( !email) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Email are required!"
        );
      }

  // Check if email already exists
  const existingUser = await User.findOne({ email });

  //OTP Create
  const { activationCode } = createActivationToken();
  existingUser.activationCode = activationCode;

  //checking is USER or ADMIN if is USER then send mail
  sendEmail({
    email: email,
    subject: "Resend OTP successful!",
    html: registrationSuccessEmailBody({
      user: { name: existingUser.name },
      activationCode,
    }),
  }).catch((error) => console.log("Failed to send email:", error.message));

  await existingUser.save();
  return true;
};

//###################################################################### LOGIN START #############################################################################################

const loginAccount = async (payload) => {
  const { email, password } = payload;

  // Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required!");
  }

  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(400, "Account is not activated. please sign up again");
  }

  // Check if the account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000); // in minutes
    throw new ApiError(
      403,
      `Account locked. Try again in ${remainingTime} minute(s).`
    );
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Increment login attempts
    user.loginAttempts += 1;

    // Lock account if attempts exceed 5
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 20 * 60000);
      user.loginAttempts = 0; // Reset attempts after locking
    }

    await user.save();

    throw new ApiError(401, "Invalid email or password.");
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  console.log("Working");
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.SECRET
  );

  return token;
};

module.exports = {
  signUpAccount,
  verifyAccount,
  resendOTP,
  loginAccount,
};
