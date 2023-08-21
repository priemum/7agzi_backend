const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	aboutById,
	read,
	update,
	list,
} = require("../controllers/billing");

router.post("/billing/create/:userId", requireSignin, isAuth, create);

router.param("userId", userById);

module.exports = router;
