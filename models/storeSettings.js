/** @format */

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const storeSettings = new mongoose.Schema(
	{
		loyaltyPointsAward: {
			type: Number,
			trim: true,
			maxlength: 32,
		},
		discountPercentage: {
			type: Number,
			trim: true,
		},
		onlineServicesFees: {
			type: Number,
			trim: true,
		},
		transactionFeePercentage: {
			type: Number,
			trim: true,
		},
		purchaseTaxes: {
			type: Number,
			trim: true,
		},
		freeShippingLimit: {
			type: Number,
			trim: true,
		},
		discountOnFirstPurchase: {
			type: Number,
			trim: true,
		},
		shippingFees: {
			type: Number,
			trim: true,
			default: 0,
		},
		addStoreLogo: {
			type: Array,
		},
		addStoreName: String,
		daysStoreClosed: {
			type: Array,
			trim: true,
		},
		activatePayOnDelivery: {
			type: Boolean,
			default: false,
		},

		activatePickupInStore: {
			type: Boolean,
			default: false,
		},
		activatePayOnline: {
			type: Boolean,
			default: false,
		},
		belongsTo: { type: ObjectId, ref: "User" },

		activeEcomStore: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("StoreSettings", storeSettings);
