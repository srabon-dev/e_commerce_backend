const User = require("../auth/auth.model");
const catchAsync = require("../../../share/catch.async");

const user = catchAsync(async (req, res) => {
  //Get USER ID from middleware added from respose header
  const userId = req.userId;

  //Checking User Id
  if (!userId) {
    throw new ApiError(400, "You are not valid user");
  }

  //Find User
  const user = await User.findById(userId).select(
    "name profileImage email role isActive address dateOfBirth createdAt updatedAt"
  );

  //Check Is Have User data or Not
  if (!user) {
    return res.status(404).json({ message: "User not exit" });
  }

  //Return Respose
  res.status(200).json({ message: "User Get successful", data: user });
});

// Update User
const update = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { name, address, dateOfBirth } = req.body;

  // Checking User Id
  if (!userId) {
    throw new ApiError(400, "You are not a valid user");
  }

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  let profileImageUrl = existingUser.profileImage;
    // If file is uploaded, handle the file
    if (req.files && req.files.profile_image) {
        const uploadedFile = req.files.profile_image[0]; // Access uploaded file
    
        // Store file locally in 'uploads/images/profile'
        profileImageUrl = `/uploads/images/profile/${uploadedFile.filename}`; // Path for the image
      }
    
      // Update user data in the database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name,
          address,
          dateOfBirth,
          profileImage: profileImageUrl, // Update with local file path
        },
        { new: true, runValidators: true }
      ).select(
        "name profileImage email role isActive address dateOfBirth createdAt updatedAt"
      );

  res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  //Get USER ID from middleware added from respose header
  const userId = req.userId;

  //Checking User Id
  if (!userId) {
    throw new ApiError(400, "You are not valid user");
  }

  const user = await User.findByIdAndDelete(userId).select(
    "name profileImage email role isActive address dateOfBirth createdAt updatedAt"
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User deleted successfully",
    data: user,
  });
});

const UserController = {
  user,
  update,
  deleteUser,
};

module.exports = { UserController };
