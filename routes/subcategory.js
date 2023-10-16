/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isStoreOwner } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	subcategoryById,
	read,
	update,
	list,
	remove,
} = require("../controllers/subcategory");

router.get("/subcategory/:subcategoryId", read);

router.post(
	"/subcategory/create/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	create
);

router.put(
	"/subcategory/:subcategoryId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	update
);

router.get("/subcategories/:userId", list);

router.delete(
	"/subcategory/:subcategoryId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	remove
);

router.param("userId", userById);
router.param("subcategoryId", subcategoryById);

module.exports = router;
