/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isStoreOwner } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	StoreManagementById,
	list,
} = require("../controllers/storeSettings");

router.post(
	"/store-settings/create/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	create
);

router.get("/store-settings/:userId", list);

router.param("userId", userById);
router.param("serviceId", StoreManagementById);

module.exports = router;
