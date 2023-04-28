const router = require("express").Router();
const AppsController = require("./AppsController");

const { sessionValidate } = require("../../../workers/session/SessionValidate");
// after login
router.get("/apps", sessionValidate, AppsController.renderPage);


module.exports = router;
