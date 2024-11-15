const User = require("../../models/userModel");
const ExpertTrader = require("../../models/expertTraderModel");
const sendEmail = require("../../utils/sendEmail");

// Controller to follow a copy trader (create and open a copy trading portfolio)
const followCopyTrader = async (req, res) => {
  const { userId, traderId, amount } = req.body;
  console.log(userId, traderId);
  try {
    // Find the user and expert trader by their IDs
    const user = await User.findById(userId);
    const trader = await ExpertTrader.findById(traderId);
    if (!user || !trader)
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "User or trader not found",
      };

    // Check if the user has enough balance to allocate the amount
    if (amount > user.totalBalance) {
      throw {
        status: "error",
        code: 400,
        data: null,
        message: "Insufficient balance",
      };
    }

    // Check if the user is already following this trader with an active portfolio
    const existingPortfolio = user.copyTradingPortfolio.find(
      (portfolio) =>
        portfolio.trader.equals(traderId) && portfolio.status === "active"
    );

    if (existingPortfolio) {
      throw {
        status: "error",
        code: 400,
        data: null,
        message:
          "You are already following this trader with an active portfolio. Please close your current portfolio before following again.",
      };
    }

    // subtract the trade balance back to the user's total balance
    user.totalBalance -= amount;

    // Create a new copy trading portfolio
    const portfolio = {
      trader: traderId,
      allocatedAmount: amount,
      initialEquity: amount,
      commission: 0.0,
      status: "active",
    };

    // Add the portfolio to the user's copy trading portfolios
    user.copyTradingPortfolio.push(portfolio);

    // Add the trader ID to the user's followedTraders array
    if (!user.followedTraders.includes(traderId)) {
      user.followedTraders.push(traderId);
    }

    // Add the user ID to the trader's followers array
    if (!trader.followers.includes(userId)) {
      trader.followers.push(userId);
    }

    // Save changes to the user and trader
    await user.save();
    await trader.save();

    // Send email notification to the user
    await sendEmail(
      user.email,
      "Copy Trader Followed",
      `You have successfully followed ${trader.name}`
    );

    res.status(200).json({
      status: "success",
      code: 200,
      data: portfolio,
      message: "Copy trader followed successfully",
    });
  } catch (error) {
    res.status(error.code || 400).json({
      status: error.status || "error",
      code: error.code || 400,
      data: null,
      message: error.message,
    });
  }
};

// Controller to stop following a copy trader (close a copy trading portfolio)
const stopFollowCopyTrader = async (req, res) => {
  const { userId, portfolioId } = req.body;
  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user)
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "User not found",
      };

    // Find the copy trading portfolio to be closed
    const portfolioIndex = user.copyTradingPortfolio.findIndex((portfolio) =>
      portfolio._id.equals(portfolioId)
    );
    if (portfolioIndex === -1)
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "Portfolio not found",
      };

    // Check if the portfolio is already closed
    if (user.copyTradingPortfolio[portfolioIndex].status === "closed") {
      throw {
        status: "error",
        code: 400,
        data: null,
        message: "Portfolio is already closed",
      };
    }

    // Get the trader ID from the portfolio
    const traderId = user.copyTradingPortfolio[portfolioIndex].trader;

    // Set the closing date of the portfolio to the current date
    user.copyTradingPortfolio[portfolioIndex].closingDate = new Date();

    // Update the status of the portfolio to 'closed'
    user.copyTradingPortfolio[portfolioIndex].status = "closed";

    // Generate a random multiplier between 1.5 and 3
    const randomMultiplier = 1.5 + Math.random() * 1.5;
    // Set the settledEquity
    user.copyTradingPortfolio[portfolioIndex].settledEquity =
      user.copyTradingPortfolio[portfolioIndex].initialEquity *
      randomMultiplier;

    // Remove the trader ID from the user's followedTraders array
    user.followedTraders.pull(traderId);

    // Find the trader and remove the user ID from the trader's followers array
    const trader = await ExpertTrader.findById(traderId);
    if (trader) {
      trader.followers.pull(userId);
      await trader.save();
    }

    // Add the trade balance back to the user's total balance
    user.totalBalance +=
      user.copyTradingPortfolio[portfolioIndex].settledEquity;

    // Save changes to the user
    await user.save();

    // Send email notification to the user
    await sendEmail(
      user.email,
      "Copy Trader Unfollowed",
      `You have successfully stopped following the copy trader`
    );

    res.status(200).json({
      status: "success",
      code: 200,
      data: user.copyTradingPortfolio[portfolioIndex],
      message: "Copy trader unfollowed successfully",
    });
  } catch (error) {
    res.status(error.code || 400).json({
      status: error.status || "error",
      code: error.code || 400,
      data: null,
      message: error.message,
    });
  }
};

module.exports = { followCopyTrader, stopFollowCopyTrader };
