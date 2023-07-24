/** @format */

const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
	generateToken,
	processPayment,
	processSubscription,
	gettingBraintreeDataById,
	gettingBraintreeDataById_Admin,
	processPaymentAndStore,
	retriggerPayment,
	updateCard,
	updateSubscriptionCard,
	getStoredPaymentData,
	getSubscriptionData,
} = require("../controllers/braintree");

//(used)
router.get("/braintree/getToken/:userId", requireSignin, isAuth, generateToken);

router.post(
	"/braintree/payment/:userId",
	requireSignin,
	isAuth,
	processPayment
);

//(used)
router.post(
	"/braintree/payment-store/:userId",
	requireSignin,
	isAuth,
	processPaymentAndStore
);

//update stored card (used)
router.put("/braintree/update-card/:userId", requireSignin, isAuth, updateCard);

//update Subscription card (used)
router.put(
	"/braintree/update-subscription-card/:userId",
	requireSignin,
	isAuth,
	updateSubscriptionCard
);

//to get stored Payment data (used)
router.get(
	"/braintree/payment-data/:userId/:token",
	requireSignin,
	isAuth,
	getStoredPaymentData
);

//to get subscription Payment data (used)

router.get(
	"/braintree/subscription-data/:userId/:subscriptionId",
	requireSignin,
	isAuth,
	getSubscriptionData
);

router.post(
	"/braintree/retrigger-payment/:userId",
	requireSignin,
	isAuth,
	retriggerPayment
);

router.post(
	"/braintree/subscription/:userId",
	requireSignin,
	isAuth,
	processSubscription
);

router.get(
	"/braintree/gettingData/:userId/:planId",
	requireSignin,
	isAuth,
	isAdmin,
	gettingBraintreeDataById
);

router.get(
	"/admin/braintree/gettingData/:userId/:planId",
	requireSignin,
	isAuth,
	isAdmin,
	gettingBraintreeDataById_Admin
);

router.param("userId", userById);

module.exports = router;
