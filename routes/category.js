/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isStoreOwner } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	categoryById,
	read,
	update,
	list,
	remove,
	getSubs,
} = require("../controllers/category");

router.get("/category/:categoryId", read);

router.post(
	"/category/create/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	create
);

router.put(
	"/category/:categoryId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	update
);

router.delete(
	"/category/:categoryId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	remove
);

router.get("/categories/:userId", list);
router.get("/category/subs/:_id", getSubs);

router.param("userId", userById);
router.param("categoryId", categoryById);

module.exports = router;
