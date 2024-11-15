const User = require("../../../models/userModel");

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
  updateUserBalance,
  updateDepositTransaction,
  updateWithdrawalTransaction,
  updateTradeHistory,
  updateCopyTradingPortfolio,
};
