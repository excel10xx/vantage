const User = require("../../../models/userModel");
const Asset = require("../../../models/assetsModel");

const getCurrentAssetPrice = async (symbol) => {
  const asset = await Asset.findOne({ symbol });
  if (!asset) throw new Error(`Asset with symbol ${symbol} not found`);
  return asset.price;
};

const getUserTransactions = async (req, res) => {
  const { userId, type } = req.query; // Fetch userId and type from query

  try {
    let transactions = [];

    if (userId) {
      // Fetch the user's transactions if userId is provided
      const user = await User.findById(userId).select("transactions name email");
      if (!user) {
        return res.status(404).json({
          status: "error",
          code: 404,
          data: null,
          message: "User not found",
        });
      }

      transactions = user.transactions.map((transaction) => ({
        ...transaction.toObject(),
        user: { id: user._id, name: user.name, email: user.email },
      }));
    } else {
      // Fetch all users' transactions if userId is not provided
      const allUsers = await User.find({}, "transactions name email"); // Only fetch necessary fields
      allUsers.forEach((user) => {
        user.transactions.forEach((transaction) => {
          transactions.push({
            ...transaction.toObject(),
            user: { id: user._id, name: user.name, email: user.email },
          });
        });
      });
    }

    // Filter transactions by type if provided
    if (type) {
      transactions = transactions.filter((transaction) => transaction.type === type);
    }

    // Return the transactions with user details
    res.status(200).json({
      status: "success",
      code: 200,
      data: transactions,
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(error.code || 500).json({
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message || "An error occurred while fetching transactions",
    });
  }
};

const getUserTradeHistory = async (req, res) => {
  const { userId } = req.params
  const { status } = req.query; // Optional query parameter to filter by trade status

  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: null,
        message: "User not found",
      });
    }

    // Get all trades or filter by status if provided
    let tradeHistory = user.trades;
    if (status) {
      tradeHistory = tradeHistory.filter((trade) => trade.status === status);
    }

    // Return the trade history
    res.status(200).json({
      status: "success",
      code: 200,
      data: tradeHistory,
      message: "Trade history retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user trade history:", error);
    res.status(error.code || 500).json({
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message || "An error occurred while fetching trade history",
    });
  }
};

const createTrade = async (req, res) => {
  const { userId } = req.params
  const { asset, quantity, side } = req.body; // Trade details from request body

  try {
    // Validate input
    if (!asset || !quantity || !side) {
      return res.status(400).json({
        status: "error",
        code: 400,
        data: null,
        message: "Asset, quantity, and side are required.",
      });
    }

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: null,
        message: "User not found",
      });
    }

    // Fetch the asset details
    const asset = await Asset.find({ symbol: asset });
    if (!asset) {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: null,
        message: "Asset not found",
      });
    }

    const currentPrice = await getCurrentAssetPrice(asset.symbol);
    if (!currentPrice) {
      return res.status(500).json({
        status: "error",
        code: 500,
        data: null,
        message: "Failed to fetch current asset price",
      });
    }

    // Check if the user has sufficient balance
    const totalCost = quantity * currentPrice;
    if (user.totalBalance < totalCost) {
      return res.status(400).json({
        status: "error",
        code: 400,
        data: null,
        message: "Insufficient balance for this trade.",
      });
    }

    // Deduct the cost of the trade from the user's balance
    user.totalBalance -= totalCost;

    // Create a new trade record
    const newTrade = {
      asset: assetId,
      quantity,
      side, // e.g., "buy" or "sell"
      purchasePrice: currentPrice,
      status: "opened",
      purchaseDate: new Date(),
    };

    // Add the new trade to the user's trade history
    user.trades.push(newTrade);

    // Save the updated user document
    await user.save();

    // Return success response
    res.status(201).json({
      status: "success",
      code: 201,
      data: newTrade,
      message: "Trade created successfully",
    });
  } catch (error) {
    console.error("Error creating trade:", error);
    res.status(error.code || 500).json({
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message || "An error occurred while creating the trade",
    });
  }
};

const deleteAllUserTrades = async (req, res) => {
  const { userId } = req.params

  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: null,
        message: "User not found",
      });
    }

    // Delete all trades from the user's trade history
    user.trades = [];

    // Save the updated user document
    await user.save();

    // Return success response
    res.status(200).json({
      status: "success",
      code: 200,
      data: null,
      message: "All trades deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user trades:", error);
    res.status(error.code || 500).json({
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message || "An error occurred while deleting trades",
    });
  }
};


// Update User Balance
const updateUserBalance = async (req, res) => {
  const { userId } = req.params;
  const body = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }
    user[Object.keys(body)[0]] = Number(Object.values(body)[0]);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "User balance updated successfully",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

// Update Deposit Transaction
const updateDepositTransaction = async (req, res) => {
  const { userId, depositId } = req.params;
  const { amount, status, currency, chain } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const deposit = user.deposits.id(depositId);

    if (!deposit) {
      return res
        .status(404)
        .json({ status: "fail", message: "Deposit transaction not found" });
    }

    // Get the current status of the deposit before any updates
    const currentStatus = deposit.status;

    // Update deposit fields with provided data
    if (amount) deposit.amount = amount;
    if (status) deposit.status = status;
    if (currency) deposit.currency = currency;
    if (chain) deposit.chain = chain;

    // Handle balance updates based on the change in status
    if (currentStatus === "pending" && status === "completed") {
      // When status changes from 'pending' to 'completed', add the deposit amount to the user's balances
      user.depositBalance += deposit.amount;
      user.totalBalance += deposit.amount;
    } else if (currentStatus === "completed" && status === "failed") {
      // When status changes from 'completed' to 'failed', remove the deposit amount from the user's balances
      user.depositBalance -= deposit.amount;
      user.totalBalance -= deposit.amount;
    }

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Deposit transaction updated successfully",
      data: deposit,
    });
  } catch (error) {
    console.error("Error updating deposit transaction:", error);
    res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

// Update Withdrawal Transaction
const updateWithdrawalTransaction = async (req, res) => {
  const { userId, transactionId } = req.params;
  const { amount, status } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const transaction = user.transactions.id(transactionId);

    if (!transaction || transaction.type !== "withdraw") {
      return res
        .status(404)
        .json({ status: "fail", message: "Withdrawal transaction not found" });
    }

    if (amount) transaction.amount = amount;
    if (status) transaction.status = status;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Withdrawal transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

// Update Trade History
const updateTradeHistory = async (req, res) => {
  const { userId, tradeId } = req.params;
  const { status, closeDate, stopLoss, takeProfit } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const trade = user.trades.id(tradeId);

    if (!trade) {
      return res
        .status(404)
        .json({ status: "fail", message: "Trade not found" });
    }

    if (status) trade.status = status;
    if (closeDate) trade.closeDate = closeDate;
    if (stopLoss !== undefined) trade.stopLoss = stopLoss;
    if (takeProfit !== undefined) trade.takeProfit = takeProfit;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Trade history updated successfully",
      data: trade,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

// Update Copy Trading Portfolio
const updateCopyTradingPortfolio = async (req, res) => {
  const { userId, portfolioId } = req.params;
  const { allocatedAmount, status, closingDate, settledEquity } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const portfolio = user.copyTradingPortfolio.id(portfolioId);

    if (!portfolio) {
      return res
        .status(404)
        .json({ status: "fail", message: "Copy trading portfolio not found" });
    }

    if (allocatedAmount) portfolio.allocatedAmount = allocatedAmount;
    if (status) portfolio.status = status;
    if (closingDate) portfolio.closingDate = closingDate;
    if (settledEquity !== undefined) portfolio.settledEquity = settledEquity;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Copy trading portfolio updated successfully",
      data: portfolio,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

module.exports = {
  deleteAllUserTrades,
  createTrade,
  getUserTradeHistory,
  getUserTransactions,
  updateUserBalance,
  updateDepositTransaction,
  updateWithdrawalTransaction,
  updateTradeHistory,
  updateCopyTradingPortfolio,
};
