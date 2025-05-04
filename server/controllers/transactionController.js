// controllers/transactionController.js
const Transaction = require("../models/transaction");
const Notification = require("../models/notification");
const { getAsync, setAsync } = require("../config/redis"); // Corrected import

const CACHE_EXPIRATION = 60; // Cache duration in seconds

// Controller to get recent transactions of the logged-in user with Caching
exports.getRecentTransactions = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `recent_transactions:${userId}`;

  try {
    const cachedTransactions = await getAsync(cacheKey);
    if (cachedTransactions) {
      console.log(`Cache hit for ${cacheKey}`);
      const recentTransactions = JSON.parse(cachedTransactions);
      return res.status(200).json({ recentTransactions });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const recentTransactions = await Transaction.find({ user: userId })
      .populate("job")
      .sort({ createdAt: -1 })
      .limit(10);

    // Caching empty array result
    // if (!recentTransactions.length) { ... }

    try {
      await setAsync(
        cacheKey,
        JSON.stringify(recentTransactions),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ recentTransactions });
  } catch (error) {
    console.error(
      `Error retrieving recent transactions for user ${userId}:`,
      error
    );
    res.status(500).json({
      message: "Error retrieving recent transactions",
      error: error.message,
    });
  }
};

// Controller to get all transactions for the logged-in user with Caching
exports.getAllTransactions = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `all_transactions:${userId}`;

  try {
    const cachedTransactions = await getAsync(cacheKey);
    if (cachedTransactions) {
      console.log(`Cache hit for ${cacheKey}`);
      const transactions = JSON.parse(cachedTransactions);
      return res.status(200).json({ transactions });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const transactions = await Transaction.find({ user: userId })
      .populate("job")
      .sort({ createdAt: -1 });

    // Caching empty array result
    // if (!transactions.length) { ... }

    try {
      await setAsync(
        cacheKey,
        JSON.stringify(transactions),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(
      `Error retrieving all transactions for user ${userId}:`,
      error
    );
    res.status(500).json({
      message: "Error retrieving transactions",
      error: error.message,
    });
  }
};

// Get transaction details by ID with Caching
exports.getTransactionDetails = async (req, res) => {
  const { transactionId } = req.params;
  const cacheKey = `transaction:${transactionId}`;

  try {
    const cachedTransaction = await getAsync(cacheKey);
    if (cachedTransaction) {
      console.log(`Cache hit for ${cacheKey}`);
      const transaction = JSON.parse(cachedTransaction);
      if (transaction === null) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      return res.status(200).json({ transaction });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const transaction = await Transaction.findById(transactionId).populate(
      "job"
    );

    if (!transaction) {
      try {
        await setAsync(cacheKey, JSON.stringify(null), "EX", CACHE_EXPIRATION);
        console.log(`Stored null for ${cacheKey} in cache`);
      } catch (redisSetError) {
        console.error("Redis set error:", redisSetError);
      }
      return res.status(404).json({ message: "Transaction not found" });
    }

    try {
      await setAsync(
        cacheKey,
        JSON.stringify(transaction),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error(`Error retrieving transaction ${transactionId}:`, error);
    res.status(500).json({
      message: "Error retrieving transaction details",
      error: error.message,
    });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { amount, transactionType, job, commission } = req.body;
    const userId = req.user.id;

    const newTransaction = new Transaction({
      user: userId,
      amount,
      transactionType,
      job,
      commission,
      status: "pending",
    });

    await newTransaction.save();

    // Create notification for transaction creation
    const notification = new Notification({
      recipient: userId,
      type: "transaction",
      title: "New Transaction Created",
      message: `A new ${transactionType} transaction for $${amount} has been created`,
      relatedId: newTransaction._id,
      onModel: "Transaction",
    });
    await notification.save();

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    transaction.status = status;
    await transaction.save();

    // Create notification for status update
    const notification = new Notification({
      recipient: transaction.user,
      type: "transaction",
      title: "Transaction Status Updated",
      message: `Your transaction has been ${status}`,
      relatedId: transaction._id,
      onModel: "Transaction",
    });
    await notification.save();

    res.status(200).json({
      message: "Transaction status updated successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating transaction status",
      error: error.message,
    });
  }
};

// Fetch recent transactions for earnings summary with Caching
exports.getEarningsSummary = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `earnings_summary:${userId}`;

  try {
    const cachedSummary = await getAsync(cacheKey);
    if (cachedSummary) {
      console.log(`Cache hit for ${cacheKey}`);
      const recentTransactions = JSON.parse(cachedSummary);
      return res.status(200).json({ recentTransactions });
    }

    console.log(`Cache miss for ${cacheKey}, fetching from DB`);
    const recentTransactions = await Transaction.find({ user: userId })
      .populate({
        path: "job",
        select: "title description budget",
      })
      .sort({ createdAt: -1 })
      .limit(5);

    try {
      await setAsync(
        cacheKey,
        JSON.stringify(recentTransactions),
        "EX",
        CACHE_EXPIRATION
      );
      console.log(`Stored ${cacheKey} in cache`);
    } catch (redisSetError) {
      console.error("Redis set error:", redisSetError);
    }

    res.status(200).json({ recentTransactions });
  } catch (error) {
    console.error("Error in getEarningsSummary:", error.message);
    res.status(500).json({
      message: "Error fetching earnings summary",
      error: error.message,
    });
  }
};
