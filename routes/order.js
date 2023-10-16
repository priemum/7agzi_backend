/** @format */

const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isStoreOwner } = require("../controllers/auth");
const {
	userById,
	addOrderToUserHistory,
	increasePoints,
} = require("../controllers/user");
const {
	create,
	listOrders,
	getStatusValues,
	orderById,
	updateOrderStatus,
	read,
	createGuest,
} = require("../controllers/order");
const { decreaseQuantity } = require("../controllers/product");

router.post(
	"/order/create/:userId",
	requireSignin,
	isAuth,
	addOrderToUserHistory,
	decreaseQuantity,
	increasePoints,
	create
);

router.post("/order/create/guest-user/:userId", decreaseQuantity, create);

router.get(
	"/order/list/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	listOrders
);
router.get(
	"/order/status-values/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	getStatusValues
);
router.put(
	"/order/:orderId/status/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	updateOrderStatus
);

router.get(
	"/order/:orderId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	read
);

router.param("userId", userById);
router.param("orderId", orderById);

module.exports = router;
