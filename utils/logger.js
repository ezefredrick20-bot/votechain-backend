const chalk = require("chalk");
const util = require("util");

function line() {
    console.log(
        chalk.cyan(
            "════════════════════════════════════════════════════════════════════════════"
        )
    );
}

function title(text) {
    console.log();
    line();
    console.log(chalk.bold.greenBright(`   ${text}`));
    line();
}

function info(label, value) {
    console.log(
        chalk.cyan(label.padEnd(22, ".")) +
        " " +
        chalk.white(value)
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

function database(collection, document) {

    console.log();

    console.log(
        chalk.magenta.bold(
            `📦 MongoDB Collection : ${collection}`
        )
    );

    console.log(
        chalk.magenta(
            "────────────────────────────────────────────────────────────"
        )
    );

    console.log(
        util.inspect(
            document,
            {
                colors: true,
                depth: null,
                compact: false
            }
        )
    );

    console.log(
        chalk.magenta(
            "────────────────────────────────────────────────────────────"
        )
    );

    console.log();
}

module.exports = {

    title,

    info,

    success,

    warning,

    error,

    activity,

    blockchain,

    database,

    line

};