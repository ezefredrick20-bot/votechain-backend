const chalk = require("chalk");
const util = require("util");

/* ====================================================== */
/*                     BASIC HELPERS                       */
/* ====================================================== */

function line() {
    console.log(
        chalk.cyan(
            "══════════════════════════════════════════════════════════════════════"
        )
    );
}

function title(text) {
    console.log("\n");
    line();
    console.log(chalk.bold.greenBright(`   ${text}`));
    line();
}

function info(label, value) {
    console.log(
        chalk.cyan(label.padEnd(22, ".")) +
        " " +
        chalk.white(String(value))
    );
}

function success(message) {
    console.log(chalk.green("✔ " + message));
}

function warning(message) {
    console.log(chalk.yellow("⚠ " + message));
}

function error(message) {
    console.log(chalk.red("✖ " + message));
}

function activity(message) {
    console.log(chalk.blueBright("➜ " + message));
}

function blockchain(message) {
    console.log(chalk.hex("#f7931a")("⛓ " + message));
}

/* ====================================================== */
/*                  DATABASE LOGGER                        */
/* ====================================================== */

function database(collection, document) {

    console.log();

    console.log(
        chalk.magenta.bold(
            `📦 MongoDB Collection : ${collection}`
        )
    );

    console.log(
        util.inspect(document, {
            colors: true,
            depth: null,
            compact: false
        })
    );

    console.log();

}

/* ====================================================== */
/*              PROFESSIONAL EVENT LOGGERS                 */
/* ====================================================== */

function register(user) {

    title("NEW USER REGISTERED");

    info("Name", `${user.firstName} ${user.lastName}`);
    info("NIN", user.nin);
    info("Phone", user.phone);

    success("Registration Successful");

    database("Users", user);

}

function login(user) {

    title("USER LOGIN");

    info("Name", `${user.firstName} ${user.lastName}`);
    info("NIN", user.nin);
    info("Wallet", user.wallet || "Not Connected");

    success("Authentication Successful");

    database("User", user);

}

function wallet(user) {

    title("WALLET CONNECTED");

    info("User", `${user.firstName} ${user.lastName}`);
    info("Wallet", user.wallet);

    success("Wallet Connected Successfully");

    database("User", user);

}

function vote(user, transaction, candidate) {

    title("NEW BLOCKCHAIN VOTE");

    info("Candidate", candidate);
    info("Voter", `${user.firstName} ${user.lastName}`);
    info("Wallet", user.wallet);
    info("Hash", transaction.hash);
    info("Status", transaction.status);

    success("Vote Successfully Recorded");

    database("Transaction", transaction);

}

function admin(action) {

    title("ADMIN ACTION");

    info("Action", action);

    success("Completed");

}

/* ====================================================== */
/*                    EXPORTS                              */
/* ====================================================== */

module.exports = {

    title,

    info,

    success,

    warning,

    error,

    activity,

    blockchain,

    database,

    line,

    register,

    login,

    wallet,

    vote,

    admin

};