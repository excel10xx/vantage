const User = require("../../models/userModel");

// Get KYC details
const getKYC = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return { status: "success", code: 200, data: user.kyc };
  } catch (error) {
    return { status: "error", code: 404, message: error.message };
  }
};

// Update KYC details
const updateKYC = async (userId, kycData) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Check if kycData is not null or undefined
    if (!kycData || typeof kycData !== "object") {
      throw new Error("Invalid KYC data provided");
    }

    // Initialize the KYC field if it doesn't exist
    if (!user.kyc) {
      user.kyc = {};
    }

    // Update KYC details
    Object.assign(user.kyc, kycData);
    user.profilePicture = kycData.selfieUpload;
    await user.save();

    return {
      status: "success",
      code: 200,
      data: user.kyc,
      message: "KYC details updated successfully",
    };
  } catch (error) {
    return { status: "error", code: 500, message: error.message };
  }
};

module.exports = {
  getKYC,
  updateKYC,
};
