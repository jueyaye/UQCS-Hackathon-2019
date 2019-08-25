const router = require("express").Router();

const login = require("../controllers/login.controller");

router.post("/", login.authenticate);

router.post("/refresh", login.refresh);

module.exports = router;
