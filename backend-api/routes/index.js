
let router = require('express').Router(),
  config = require('config');

const user = require('../middleware/user.middleware');

const registerRoute = require('./register.route'),
  loginRoute = require('./login.route'),
  prrojectRoute = require('./project.route');
  

router.use('/register', registerRoute);

router.use('/login', loginRoute);

router.use('/project', (config.enableUserAuth) ? user.authenticate('jwt', {
  session: false
}) : (req, res, next) => { req.user ={}; req.user.id = 'f1b71070-1516-4e4e-9df4-02205cdca2e0'; next(); }, prrojectRoute);

module.exports = router;
