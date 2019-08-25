
let environment = process.env.NODE_ENV;

let isProd = (environment.includes('production'));

const express = require('express'),
  bodyParser = require('body-parser'),
  path = require('path'),
  passport = require('passport'),
  config = require('config'),
  cors = require('cors'),
  handlebars = require('handlebars'),
  cons = require('consolidate'),
  morgan = require('morgan'),
  helmet = require('helmet'),
  logger = require('tracer').colorConsole(),
  port = process.env.PORT || config.port;

const slack = require('./api/slack.api');
const github = require('./api/github.api');
const trello = require('./api/trello.api');

const {
  errors
} = require('celebrate');

cons.requires.handlebars = handlebars;

var app = express();

if (isProd) {
  Sentry.init({
    dsn: config.sentry_dsn
  });

  app.use(Sentry.Handlers.requestHandler());
}

if (environment !== "development") {
  app.use(helmet());

  const rateLimiterMiddleware = require('./utils/rateLimiter.util');
  app.use(rateLimiterMiddleware);
}

// assign the swig engine to .html files
app.engine('hbs', cons.handlebars);

// set .html as the default extension
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

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


app.use(bodyParser.json({
  limit: '20mb'
}));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

require('./utils/passport.util');

if (!isProd) {
  const swaggerUi = require('swagger-ui-express');

  const swaggerSpec = require('./config/swagger').spec();
  const swaggerOptions = {};

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
  });
}

app.use('/', require('./routes/index'));

app.get('/', (req, res) => {
  res.send(Date.now().toString());
});

if (isProd) {
  app.use(morgan('short', {
    skip: function(req, res) {
      return res.statusCode < 300
    },
    stream: {
      write: function(message, encoding) {
        logger.debug(message);
      }
    }
  }));
} else {
  app.use(morgan('dev', {
    stream: {
      write: function(message, encoding) {
        logger.debug(message);
      }
    }
  }));
}

process.on('uncaughtException', function(err) {
  logger.error(err);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at:' + p);
  logger.error(reason);
});

process.on('warning', (warning) => {
  logger.warn(warning.stack); // Print the stack trace
});

if (isProd) 
  app.use(Sentry.Handlers.errorHandler());

app.use(errors());

app.use((err, req, res, next) => {
  logger.warn(err);
  if (isProd) Sentry.captureException(err);
  return res.status(400).send(err);
})

app.listen(port, () => {
  logger.info(`Server listening on ${config.fqdn}. ${!isProd ? `Docs at ${config.fqdn}/docs` : ""}.`);
})

module.exports = app
