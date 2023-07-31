/** @format */

const braintree = require("braintree");

require("dotenv").config();

const getBraintreeGateway = (country) => {
	const merchantId =
		country === "egypt"
			? process.env.BRAINTREE_MERCHANT_ID_EGP
			: process.env.BRAINTREE_MERCHANT_ID;

	const publicKey =
		country === "egypt"
			? process.env.BRAINTREE_PUBLIC_KEY_EGP
			: process.env.BRAINTREE_PUBLIC_KEY;

	return new braintree.BraintreeGateway({
		environment: braintree.Environment.Production, // Production Sandbox
		merchantId: merchantId,
		publicKey: publicKey,
		privateKey: process.env.BRAINTREE_PRIVATE_KEY,
	});
};

exports.generateToken = (req, res) => {
	let countryFromClient = req.params.country.toLowerCase(); // You may need to adjust how you get the country depending on your implementation
	let gateway = getBraintreeGateway(countryFromClient);

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
	let gateway = getBraintreeGateway("US");

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

	console.log(countryFromClient, "countryFromClient");
	let gateway = getBraintreeGateway(countryFromClient);

	// charge
	gateway.transaction.sale(
		{
			amount: amountFromTheClient,
			paymentMethodNonce: nonceFromTheClient,
			options: {
				storeInVaultOnSuccess: true,
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

exports.retriggerPayment = (req, res) => {
	let amountFromTheClient = req.body.amount; // this will be the amount you calculate
	let paymentMethodToken = req.body.paymentMethodToken; // replace this with the token you stored
	let countryFromClient = req.body.country;

	let gateway = getBraintreeGateway(countryFromClient);

	console.log(req.body, "Retrigger");

	// charge
	gateway.transaction.sale(
		{
			amount: amountFromTheClient,
			paymentMethodToken: paymentMethodToken,
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

exports.processSubscription = (req, res) => {
	let nonceFromTheClient = req.body.paymentMethodNonce;
	let amountFromTheClient = req.body.amount;
	let countryFromClient = req.body.country;

	let gateway = getBraintreeGateway(countryFromClient);

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
							res.status(201).json({
								result: "success",
								subscription: result.subscription,
							});
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
	let countryFromClient = req.body.country;

	let gateway = getBraintreeGateway(countryFromClient);

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
	let countryFromClient = req.body.country;

	let gateway = getBraintreeGateway(countryFromClient);

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
	let countryFromClient = req.body.country; // You may need to adjust how you get the country depending on your implementation

	let gateway = getBraintreeGateway(countryFromClient);

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
	let countryFromClient = req.body.country; // You may need to adjust how you get the country depending on your implementation

	let gateway = getBraintreeGateway(countryFromClient);

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
