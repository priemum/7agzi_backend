/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { SendingEmailsToUsers } = require("../controllers/sendingEmails");
const { userById } = require("../controllers/user");

router.post(
	"/sending-emails/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	SendingEmailsToUsers,
);

router.param("userId", userById);

module.exports = router;
