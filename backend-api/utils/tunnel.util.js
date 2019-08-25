const ngrok = require("ngrok");
const config = require("config");
const logger = require("tracer").colorConsole();

function exitHandler(options, exitCode) {
  ngrok.kill();

  if (options.cleanup) logger.info("clean");
  if (exitCode || exitCode === 0) logger.info(exitCode);
  if (options.exit) process.exit();
}

process.on("exit", exitHandler.bind(null, { cleanup: true }));
process.on("SIGINT", exitHandler.bind(null, { exit: true }));

process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

process.on("uncaughtException", exitHandler.bind(null, { exit: true }));

let url;
(async function() {
  if (config.allowTunnel) {
    url = await ngrok.connect({
      addr: 8000
    });
    logger.info("ngrok runnimg on:", url);
  }
})();

function getUrl() {
  return url;
}

module.exports = {
  getUrl
};
