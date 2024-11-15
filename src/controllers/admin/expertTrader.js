const ExpertTrader = require("../../models/expertTraderModel");
const User = require("../../models/userModel");

// Create a new Expert Trader
const createExpertTrader = async (req, res) => {
  try {
    const {
      name,
      profilePicture,
      totalProfit,
      todaysProfit,
      profitShare,
      followersEquity,
      minimumCapital,
      rating,
      winRate,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        status: "fail",
        statusCode: 400,
        data: { message: "Name is required" },
      });
    }

    const newExpertTrader = await ExpertTrader.create({
      name,
      profilePicture:
        profilePicture ||
        "http://localhost:3000/public/profile-pictures/defaultpicture.jpg",
      totalProfit: totalProfit || 500,
      todaysProfit: todaysProfit || 7,
      profitShare: profitShare || 50,
      followersEquity: followersEquity || 25000000,
      minimumCapital: minimumCapital || 1000,
      rating: rating || 4,
      winRate: winRate || 81,
    });

    res.status(201).json({
      status: "success",
      statusCode: 201,
      data: { expertTrader: newExpertTrader },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: 500,
      data: { message: "Server error", error: error.message },
    });
  }
};

// Get all Expert Traders
const getAllExpertTraders = async (req, res) => {
  try {
    const expertTraders = await ExpertTrader.find().populate(
      "followers",
      "name email"
    );

    res.status(200).json({
      status: "success",
      statusCode: 200,
      data: { expertTraders },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: 500,
      data: { message: "Server error", error: error.message },
    });
  }
};

// Get a specific Expert Trader by ID
const getExpertTraderById = async (req, res) => {
  try {
    const { id } = req.params;
    const expertTrader = await ExpertTrader.findById(id).populate(
      "followers",
      "name email"
    );

    if (!expertTrader) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        data: { message: "Expert Trader not found" },
      });
    }

    res.status(200).json({
      status: "success",
      statusCode: 200,
      data: { expertTrader },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: 500,
      data: { message: "Server error", error: error.message },
    });
  }
};

// Update an Expert Trader
const updateExpertTrader = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedExpertTrader = await ExpertTrader.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedExpertTrader) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        data: { message: "Expert Trader not found" },
      });
    }

    res.status(200).json({
      status: "success",
      statusCode: 200,
      data: { expertTrader: updatedExpertTrader },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: 500,
      data: { message: "Server error", error: error.message },
    });
  }
};

// Delete an Expert Trader
const deleteExpertTrader = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExpertTrader = await ExpertTrader.findByIdAndDelete(id);

    if (!deletedExpertTrader) {
      return res.status(404).json({
        status: "fail",
        statusCode: 404,
        data: { message: "Expert Trader not found" },
      });
    }

    // Remove the expert trader from followers' lists
    await User.updateMany(
      { followedTraders: id },
      { $pull: { followedTraders: id } }
    );

    res.status(200).json({
      status: "success",
      statusCode: 200,
      data: { message: "Expert Trader deleted successfully" },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: 500,
      data: { message: "Server error", error: error.message },
    });
  }
};

module.exports = {
  createExpertTrader,
  getAllExpertTraders,
  getExpertTraderById,
  updateExpertTrader,
  deleteExpertTrader,
};
