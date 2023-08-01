/** @format */

const braintree = require("braintree");

require("dotenv").config();

var gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Production, // Production Sandbox
	merchantId: process.env.BRAINTREE_MERCHANT_ID,
	publicKey: process.env.BRAINTREE_PUBLIC_KEY,
	privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

exports.generateToken = (req, res) => {
	gateway.clientToken.generate({}, function (err, response) {
		if (err) {
			console.log(err, "err from braintree");
			res.status(500).send(err);
		} else {
			res.send(response);
		}
	});
};

exports.processPayment = (req, res) => {
	let nonceFromTheClient = req.body.paymentMethodNonce;
	let amountFromTheClient = req.body.amount;
	// charge
	let newTransaction = gateway.transaction.sale(
		{
			amount: amountFromTheClient,
			paymentMethodNonce: nonceFromTheClient,
			options: {
				submitForSettlement: true,
			},
		},
		(error, result) => {
			if (error) {
				res.status(500).json(error);
			} else {
				res.json(result);
			}
		}
	);
};

exports.processPaymentAndStore = (req, res) => {
	let nonceFromTheClient = req.body.paymentMethodNonce;
	let amountFromTheClient = req.body.amount;
	let countryFromClient = req.body.country;

	// Define the Merchant Account Id based on the country
	let merchantAccountId = process.env.BRAINTREE_MERCHANT_ACCOUNT_US; // Default to USD merchant account ID

	// Check if the country is Egypt and set the merchant account to EGP
	if (countryFromClient.toLowerCase() === "egypt") {
		merchantAccountId = process.env.BRAINTREE_MERCHANT_ACCOUNT_EGY; // As per the information you provided
	}

	// charge
	gateway.transaction.sale(
		{
			amount: amountFromTheClient,
			paymentMethodNonce: nonceFromTheClient,
			options: {
				storeInVaultOnSuccess: true,
				submitForSettlement: true,
			},
			merchantAccountId: merchantAccountId, // added this
		},
		(error, result) => {
			if (error) {
				res.status(500).json(error);
			} else {
				// console.log(result, "Pay and Store Token");
				res.json(result);
			}
		}
	);
};

exports.retriggerPayment = (req, res) => {
	let amountFromTheClient = req.body.amount; // this will be the amount you calculate
	let paymentMethodToken = req.body.paymentMethodToken; // replace this with the token you stored
	let countryFromClient = req.body.country; // replace this with the country you stored

	// Define the Merchant Account Id based on the country
	let merchantAccountId = process.env.BRAINTREE_MERCHANT_ACCOUNT_US; // Default to USD merchant account ID

	// Check if the country is Egypt and set the merchant account to EGP
	if (countryFromClient.toLowerCase() === "egypt") {
		merchantAccountId = process.env.BRAINTREE_MERCHANT_ACCOUNT_EGY; // As per the information you provided
	}

	// charge
	gateway.transaction.sale(
		{
			amount: amountFromTheClient,
			paymentMethodToken: paymentMethodToken,
			options: {
				submitForSettlement: true,
			},
			merchantAccountId: merchantAccountId,
		},
		(error, result) => {
			if (error) {
				res.status(500).json(error);
			} else {
				res.json(result);
			}
		}
	);
};

exports.processSubscription = (req, res) => {
	// console.log(
	// 	req.body,
	// 	"this is req.body for subscription from braintreeController"
	// );

	let nonceFromTheClient = req.body.paymentMethodNonce;
	let amountFromTheClient = req.body.amount;

	// charge
	gateway.customer.create(
		{
			id: req.body.customerId,
			email: req.body.email,
		},
		(err) => {
			if (err) return res.status(500).send(error);
			gateway.paymentMethod.create(
				{
					customerId: req.body.customerId,
					paymentMethodNonce: nonceFromTheClient,
				},
				(err, result) => {
					if (err) return res.status(500).send(error);
					gateway.subscription.create(
						{
							paymentMethodToken: result.paymentMethod.token,
							planId: req.body.planId,
							price: amountFromTheClient,
							trialDuration: req.body.trialDuration,
							trialDurationUnit: req.body.trialDurationUnit,
						},
						(err, result) => {
							console.log(err, "from processing the subscription");
							if (err) return res.status(500).send(error);
							//////
							// console.log(result, "result Only From Subscription");

							//////

							res.status(201).json({
								result: "success",
								subscription: result.subscription,
							});
							/////
						}
					);
				}
			);
		}
	);
};

exports.updateCard = (req, res) => {
	let paymentMethodNonce = req.body.paymentMethodNonce;
	let paymentMethodToken = req.body.paymentMethodToken;

	gateway.paymentMethod.update(
		paymentMethodToken,
		{
			paymentMethodNonce: paymentMethodNonce,
			options: {
				makeDefault: true,
			},
		},
		function (err, result) {
			if (err) {
				console.log(err);
				res.status(500).json(err);
			} else {
				res.json(result);
			}
		}
	);
};

exports.updateSubscriptionCard = (req, res) => {
	let paymentMethodToken = req.body.paymentMethodToken;
	let subscriptionId = req.body.subscriptionId;
	gateway.paymentMethod.update(
		paymentMethodToken,
		{
			paymentMethodNonce: req.body.paymentMethodNonce,
		},
		function (err, result) {
			if (err) {
				res.status(500).json(err);
			} else {
				gateway.subscription.update(
					subscriptionId,
					{
						paymentMethodToken: result.paymentMethod.token,
					},
					function (err, result) {
						if (err) {
							res.status(500).json(err);
						} else {
							res.json(result);
						}
					}
				);
			}
		}
	);
};

exports.getStoredPaymentData = (req, res) => {
	let paymentMethodToken = req.params.token;

	gateway.paymentMethod.find(paymentMethodToken, function (err, paymentMethod) {
		if (err) {
			console.log(err, "error retrieving payment method");
			res.status(500).json(err);
		} else {
			res.json({
				last4: paymentMethod.last4,
				cardType: paymentMethod.cardType,
				expirationDate: paymentMethod.expirationDate,
			});
		}
	});
};

exports.getSubscriptionData = (req, res) => {
	const { subscriptionId } = req.params;

	gateway.subscription.find(subscriptionId, (err, subscription) => {
		if (err) {
			console.error("error retrieving subscription", err);
			res.status(500).send(err);
		} else {
			res.send(subscription);
		}
	});
};

exports.gettingBraintreeDataById = (req, res) => {
	// console.log(req.body, "from getting data in braintree");
	gateway.subscription.find(req.params.planId, (err, result) => {
		if (err) return res.status(500).send(error);
		res.status(201).json({
			result: "success",
			result: result,
		});
	});
};

exports.processSubscriptionUpdate = (req, res) => {
	// console.log(
	// 	req.body,
	// 	req.params.subId,
	// 	"this is req.body for subscription update braintree",
	// );

	let nonceFromTheClient = req.body.paymentMethodNonce;
	let amountFromTheClient = req.body.amount;
	// charge
	gateway.paymentMethod.create(
		{
			customerId: req.body.customerId,
			paymentMethodNonce: nonceFromTheClient,
		},
		(err, result) => {
			if (err) return res.status(500).send(error);
			gateway.subscription.update(
				req.params.subId,
				{
					paymentMethodToken: result.paymentMethod.token,
					planId: req.body.planId,
					// planId: "quarterly_plan",
					price: amountFromTheClient,
					// price: "180.00",
				},
				(err, result) => {
					if (err) return res.status(500).send(error);
					console.log(result.subscription, "result.subscription");
					res.status(201).json({
						result: "success",
						subscription: result.subscription,
					});
					console.log("result Only", result, "result Only");
				}
			);
		}
	);
};

exports.gettingBraintreeDataById_Admin = (req, res) => {
	// console.log(req.body, "from getting data in braintree");

	gateway.subscription.find(req.params.planId, (err, result) => {
		if (err) return res.status(500).send(error);
		res.status(201).json({
			result: "success",
			result: result,
		});
	});
};
