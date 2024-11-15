const User = require("../../models/userModel");
const Asset = require("../../models/assetsModel");
const Admin = require("../../models/adminModel");
const sendEmail = require("../../utils/sendEmail");
const { v4: uuidv4 } = require("uuid");

// Utility function to get the current price of a cryptocurrency
const getCryptoPrice = async (symbol) => {
  const asset = await Asset.findOne({ symbol, type: "cryptocurrency" });
  if (!asset) throw new Error(`Asset with symbol ${symbol} not found`);
  return asset.price;
};

const getCurrentAssetPrice = async (symbol) => {
  const asset = await Asset.findOne({ symbol });
  if (!asset) throw new Error(`Asset with symbol ${symbol} not found`);
  return asset.price;
};

const withdrawFromWallet = async (
  userId,
  currency,
  chain,
  amountInUSD,
  amount,
  method
) => {
  try {
    currency = currency.toUpperCase();
    // console.log(userId, currency, chain, amountInUSD, amount, method);

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "User not found",
      };
    }

    if (chain) {
      chain = chain.toUpperCase();

      // Find the admin wallet with the specified currency and chain
      const admin = await Admin.findOne({
        "wallets.coin": currency,
        "wallets.chainType": chain,
      });
      if (!admin) {
        console.log(
          "Admin wallet reference not found for the specified currency and chain"
        );
        throw {
          status: "error",
          code: 404,
          data: null,
          message: "Admin reference wallet not found",
        };
      }

      const adminWallet = admin.wallets.find(
        (wallet) =>
          wallet.coin.toUpperCase() === currency &&
          wallet.chainType.toUpperCase() === chain
      );

      if (!adminWallet) {
        console.log(
          "Admin wallet not found for the specified currency and chain"
        );
        throw {
          status: "error",
          code: 404,
          data: null,
          message: "Admin wallet not found",
        };
      }

      // Find the user's wallet that references the admin wallet
      const userWallet = user.wallets.find(
        (wallet) => wallet.adminWallet.toString() === adminWallet._id.toString()
      );

      if (!userWallet) {
        console.log("User wallet not found for the specified admin wallet");
        throw {
          status: "error",
          code: 404,
          data: null,
          message: "User wallet not found",
        };
      }

      // Get the current price of the cryptocurrency
      const cryptoPrice = await getCryptoPrice(currency);

      // Convert USD amount to cryptocurrency amount
      const amount = amountInUSD / cryptoPrice;

      // Check if the user has sufficient balance
      if (userWallet.balance < amount) {
        console.log("Insufficient balance");
        throw {
          status: "error",
          code: 400,
          data: null,
          message: "Insufficient balance",
        };
      }

      // Update wallet balance
      userWallet.balance -= amount;
    }

    // Prepare the withdrawal transaction
    const withdrawal = {
      type: "withdraw",
      method: method,
      currency,
      amount,
      amountInUSD,
      date: new Date(),
    };

    // Create transaction record
    user.transactions.push(withdrawal);

    // Save changes
    await user.save();

    // Send email notification
    await sendEmail(
      user.email,
      "Withdrawal Confirmation",
      `You have successfully withdrawn ${amount.toFixed(
        2
      )} ${currency} (worth $${amountInUSD})`
    );

    return {
      status: "success",
      code: 200,
      data: withdrawal,
      message: "Withdrawal successful",
    };
  } catch (error) {
    console.error("Error during withdrawal process:", error);
    return {
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message,
    };
  }
};

const exchangeCurrency = async (userId, fromCurrency, toCurrency, amount) => {
  try {
    // Convert currencies to uppercase for consistency
    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "User not found",
      };
    }

    // Find the admin wallets for the specified currencies
    const fromAdmin = await Admin.findOne({ "wallets.coin": fromCurrency });
    const toAdmin = await Admin.findOne({ "wallets.coin": toCurrency });

    if (!fromAdmin || !toAdmin) {
      console.log("Admin wallets not found for the specified currencies");
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "Admin wallets not found",
      };
    }

    // Find a wallet with enough balance for the source currency
    const fromWallet = user.wallets.find(
      (wallet) =>
        wallet.coin.toUpperCase() === fromCurrency &&
        wallet.balance >= amount
    );

    if (!fromWallet) {
      console.log("No wallet with sufficient balance for the source currency");
      throw {
        status: "error",
        code: 400,
        data: null,
        message: "Insufficient balance in any wallet for the source currency",
      };
    }

    // Find the corresponding admin wallet for the selected user wallet
    const fromAdminWallet = fromAdmin.wallets.find(
      (wallet) => wallet._id.toString() === fromWallet.adminWallet.toString()
    );

    if (!fromAdminWallet) {
      console.log("Admin wallet not found for the source currency");
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "Admin wallet not found for the source currency",
      };
    }

    // Find the target user wallet for the destination currency
    const toWallet = user.wallets.find(
      (wallet) => wallet.coin.toUpperCase() === toCurrency
    );

    if (!toWallet) {
      console.log("User wallet not found for the target currency");
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "User wallet not found for the target currency",
      };
    }

    // Find the corresponding admin wallet for the target user wallet
    const toAdminWallet = toAdmin.wallets.find(
      (wallet) => wallet._id.toString() === toWallet.adminWallet.toString()
    );

    if (!toAdminWallet) {
      console.log("Admin wallet not found for the target currency");
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "Admin wallet not found for the target currency",
      };
    }

    // Get the current price of the source cryptocurrency
    const fromCryptoPrice = await getCryptoPrice(fromCurrency, fromAdminWallet.chainType);

    // Get the current price of the target cryptocurrency
    const toCryptoPrice = await getCryptoPrice(toCurrency, toAdminWallet.chainType);

    // Convert source cryptocurrency amount to target cryptocurrency amount
    const toAmount = (amount * fromCryptoPrice) / toCryptoPrice;

    // Perform the exchange
    fromWallet.balance -= amount;
    toWallet.balance += toAmount;

    // Prepare the exchange transaction record
    const exchangeTransaction = {
      type: "exchange",
      fromCurrency,
      fromChain: fromAdminWallet.chainType,
      toCurrency,
      toChain: toAdminWallet.chainType,
      amount: toAmount,
      amountInUSD: amount * fromCryptoPrice,
      date: new Date(),
    };

    // Add the exchange transaction to user's transaction history
    user.transactions.push(exchangeTransaction);

    // Save changes to user document
    await user.save();

    // Send email notification to user
    await sendEmail(
      user.email,
      "Exchange Confirmation",
      `You have successfully exchanged ${amount} ${fromCurrency} on ${fromAdminWallet.chainType} (worth $${(
        amount * fromCryptoPrice
      ).toFixed(2)}) to ${toAmount.toFixed(2)} ${toCurrency} on ${toAdminWallet.chainType}`
    );

    return {
      status: "success",
      code: 200,
      data: exchangeTransaction,
      message: "Currency exchanged successfully",
    };
  } catch (error) {
    console.error("Error during currency exchange process:", error);
    return {
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message,
    };
  }
};

const transfer = async (req, res) => {
  const userId = req.user.id; // Get user ID from auth middleware
  const { assetId, quantity, transferTo } = req.body;

  try {
    // Validate transferTo parameter
    if (!["global-market", "crypto-futures"].includes(transferTo)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        data: null,
        message: "Invalid transfer destination. Must be 'global-market' or 'crypto-futures'.",
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
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: null,
        message: "Asset not found",
      });
    }

    // Assuming getCurrentAssetPrice is a function that fetches the live market price of the asset
    const currentPrice = await getCurrentAssetPrice(asset.symbol);
    if (!currentPrice) {
      return res.status(500).json({
        status: "error",
        code: 500,
        data: null,
        message: "Failed to fetch current asset price",
      });
    }

    // Calculate the total cost of the transfer
    const totalCost = quantity * currentPrice;

    // Check if the user has sufficient balance
    if (totalCost > user.totalBalance) {
      return res.status(400).json({
        status: "error",
        code: 400,
        data: null,
        message: "Insufficient balance in your account.",
      });
    }

    // Deduct the total cost from the user's balance
    user.totalBalance -= totalCost;

    // Store the transfer record
    const transferRecord = {
      asset: assetId,
      quantity,
      transferTo,
      amountDeducted: totalCost,
      transferDate: new Date(),
    };

    user.transfers = user.transfers || [];
    user.transfers.push(transferRecord);

    // Save changes to the user
    await user.save();

    // Send email notification to the user (optional)
    await sendEmail(
      user.email,
      "Transfer Notification",
      `You have successfully transferred ${quantity} ${asset.symbol} (worth ${totalCost.toFixed(
        2
      )}) to ${transferTo}.`
    );

    // Return success response
    res.status(200).json({
      status: "success",
      code: 200,
      data: transferRecord,
      message: "Amount deducted and transfer record stored successfully",
    });
  } catch (error) {
    console.error("Error processing transfer:", error);
    res.status(error.code || 500).json({
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message,
    });
  }
};

// Deposit into wallet controller
const depositIntoWallet = async (userId, amountInUSD, currency, chain) => {
  try {
    const user = await User.findById(userId);
    if (!user)
      throw {
        status: "error",
        code: 404,
        data: null,
        message: "User not found",
      };

    const cryptoPrice = await getCryptoPrice(currency);
    const amount = amountInUSD / cryptoPrice;

    const depositId = uuidv4();
    const deposit = {
      depositId,
      amount,
      currency,
      chain,
      status: "pending",
      createdAt: new Date(),
    };

    // Fetch the admin from the database (assuming there's only one admin)
    const admin = await Admin.findOne();

    if (!admin) {
      throw new Error("Admin not found");
    }

    // Find the matching wallet for the specified currency and chain type
    const wallet = admin.wallets.find(
      (wallet) =>
        wallet.coin.toLowerCase() === currency.toLowerCase() &&
        wallet.chainType.toLowerCase() === chain.toLowerCase()
    );

    if (!wallet) {
      throw new Error(`No wallet found for ${currency} on ${chain} chain`);
    }

    user.deposits.push(deposit);
    await user.save();

    await sendEmail(
      user.email,
      "Deposit Request Created",
      `You have requested a deposit of ${amountInUSD} USD worth of ${currency} on ${chain} chain. Please send ${amount} ${currency} to the following address: ${wallet.walletAddress}. Optionally use ${depositId} as the memo/tag/reference.`
    );

    return {
      status: "success",
      code: 200,
      data: {
        depositId,
        address: wallet.walletAddress,
        memo: depositId, // Use depositId as memo/tag for tracking
      },
      message: "Deposit request created successfully",
    };
  } catch (error) {
    return {
      status: "error",
      code: error.code || 500,
      data: null,
      message: error.message,
    };
  }
};

module.exports = {
  withdrawFromWallet,
  exchangeCurrency,
  transfer,
  depositIntoWallet,
};
