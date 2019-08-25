const express = require("express");
const boom = require("express-boom");
const bodyParser = require("body-parser");
const passport = require("passport");
const config = require("config");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("tracer").colorConsole();

const port = process.env.PORT || config.port;

const { errors } = require("celebrate");
const slack = require("./api/slack.api");
const github = require("./api/github.api");
const trello = require("./api/trello.api");

const app = express();

app.use(boom());

/**
 * Start slack interactions, because all slack events are all passed through the
 * the one slack app, they only require one endpoint.
 */

slack.initActions(app);
slack.initCommands(app);

/**
 * Start github webhook listener.
 */
github.initEvents(app);

/**
 * Start trello webhook listener.
 */
trello.initEvents(app);

app.use(
  bodyParser.json({
    limit: "20mb"
  })
);
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

require("./utils/passport.util");

app.use("/", require("./routes/index"));

app.get("/", (req, res) => {
  res.send(Date.now().toString());
});

app.use(
  morgan("dev", {
    stream: {
      write(message) {
        logger.debug(message);
      }
    }
  })
);

process.on("uncaughtException", function(err) {
  logger.error(err);
});

process.on("unhandledRejection", (reason, p) => {
  logger.error(`Unhandled Rejection at:${p}`);
  logger.error(reason);
});

process.on("warning", warning => {
  logger.warn(warning.stack); // Print the stack trace
});

app.use(errors());

app.use((err, req, res, next) => {
  logger.warn(err);
  return res.status(400).send(err);
});

app.listen(port, () => {
  logger.info(`Server listening on ${config.fqdn}.`);
});

module.exports = app;
