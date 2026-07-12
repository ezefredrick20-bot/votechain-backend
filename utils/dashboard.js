const User = require("../models/User");
const Vote = require("../models/Vote");
const Transaction = require("../models/Transaction");
const ElectionStatus = require("../models/ElectionStatus");

const logger = require("./logger");

async function displayDashboard() {

    const users = await User.countDocuments();

    const votes = await Vote.countDocuments();

    const transactions = await Transaction.countDocuments();

    const wallets = await User.countDocuments({
        wallet: { $ne: null }
    });

    const election = await ElectionStatus.findOne();

    const lastTransaction =
        await Transaction.findOne().sort({
            timestamp: -1
        });

    console.log("\n");

    logger.title("VOTECHAIN LIVE BLOCKCHAIN DASHBOARD");

    logger.info("Server", "ONLINE");

    logger.info("MongoDB", "CONNECTED");

    logger.info("Blockchain", "Ethereum Sepolia");

    logger.info("Wallet Provider", "MetaMask");

    logger.line();

    logger.info("Registered Users", users);

    logger.info("Wallet Connected", wallets);

    logger.info("Votes Cast", votes);

    logger.info("Transactions", transactions);

    logger.info(
        "Election",
        election?.isOpen
            ? "OPEN"
            : "CLOSED"
    );

    logger.line();

    if (lastTransaction) {

        logger.blockchain("LATEST BLOCK");

        logger.info(
            "Candidate",
            lastTransaction.candidate
        );

        logger.info(
            "NIN",
            lastTransaction.nin
        );

        logger.info(
            "Hash",
            lastTransaction.hash
        );

        logger.info(
            "Status",
            lastTransaction.status
        );

        logger.info(
            "Time",
            new Date(
                lastTransaction.timestamp
            ).toLocaleString()
        );

    }

    logger.line();

}

module.exports = displayDashboard;