/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isStoreOwner } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	colorsById,
	read,
	update,
	list,
	remove,
} = require("../controllers/colors");

router.get("/color/:colorId", read);

router.post(
	"/color/create/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	create
);

router.put(
	"/color/:colorId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	update
);

router.delete(
	"/color/:colorId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	remove
);

router.get("/colors", list);

router.param("userId", userById);
router.param("colorId", colorsById);

module.exports = router;
