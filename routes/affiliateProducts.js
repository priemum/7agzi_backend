/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	affiliateById,
	read,
	update,
	list,
	remove,
} = require("../controllers/affiliateProducts");

router.get("/affiliate/:affiliateId", read);

router.post(
	"/affiliate/create/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	create
);

router.put(
	"/affiliate/:affiliateId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	update
);

router.delete(
	"/affiliate/:affiliateId",
	requireSignin,
	isAuth,
	isAdmin,
	remove
);

router.get("/affiliates", list);

router.param("userId", userById);
router.param("affiliateId", affiliateById);

module.exports = router;
