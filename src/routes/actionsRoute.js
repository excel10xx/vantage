const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  withdrawFromWallet,
  exchangeCurrency,
  transfer,
  depositIntoWallet,
} = require("../controllers/actions/walletActionsController");
const {
  followCopyTrader,
  stopFollowCopyTrader,
} = require("../controllers/actions/copyTraderActionsController");
const {
  openTrade,
  closeTrade,
} = require("../controllers/actions/tradeActionsController");
const {
  convertAsset,
} = require("../controllers/actions/assetsActionsController");

// Route for withdrawing from wallet
router.post("/wallet/withdraw", authenticate, async (req, res) => {
  const { currency, chain, amountInUSD, method, amount } = req.body;
  const userId = req.user._id;
  try {
    const result = await withdrawFromWallet(
      userId,
      currency,
      chain,
      amountInUSD,
      amount,
      method
    );
    res.status(result.code).json(result);
  } catch (error) {
    console.error("Route handler error:", error);
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

// Route for exchanging currency
router.post("/wallet/exchange", authenticate, async (req, res) => {
  const { fromCurrency, toCurrency, amount } = req.body;
  const userId = req.user._id;
  try {
    const result = await exchangeCurrency(
      userId,
      fromCurrency,
      toCurrency,
      amount
    );
    res.status(result.code).json(result);
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

// Route for placing a trade
router.post("/wallet/transfer", authenticate, async (req, res) => {
  try {
    await transfer(req, res);
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

module.exports = router;

// Route for depositing into wallet
router.post("/wallet/deposit", authenticate, async (req, res) => {
  const { currency, chain, amountInUSD } = req.body;
  const userId = req.user._id;
  try {
    const result = await depositIntoWallet(
      userId,
      amountInUSD,
      currency,
      chain
    );
    res.status(result.code).json(result);
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

// Route to follow a copy trader
router.post("/copytrader/follow", authenticate, async (req, res) => {
  const userId = req.user._id;
  req.body.userId = userId;
  try {
    await followCopyTrader(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Route to stop following a copy trader
router.post("/copytrader/unfollow", authenticate, async (req, res) => {
  const userId = req.user._id;
  req.body.userId = userId;
  try {
    await stopFollowCopyTrader(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Route to open a trade
router.post("/open", authenticate, async (req, res) => {
  const userId = req.user._id;
  req.body.userId = userId;
  try {
    await openTrade(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Route to close a trade
router.post("/close", authenticate, async (req, res) => {
  const userId = req.user._id;
  req.body.userId = userId;
  try {
    await closeTrade(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Route to get the current price of an asset
router.get("/convert", authenticate, convertAsset);

module.exports = router;
