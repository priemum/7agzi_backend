/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const CartItemSchema = new mongoose.Schema(
	{
		product: { type: ObjectId, ref: "Product" },
		name: String,
		id: String,
		price: Number,
		amount: Number,
		supplier: String,
		SKU: String,
		weight: String,
		image: String,
		slug: String,
		category: String,
		categorySlug: String,
		categoryName: String,
	},
	{ timestamps: true }
);

const CartItem = mongoose.model("CartItem", CartItemSchema);

const OrderSchema = new mongoose.Schema(
	{
		products: [CartItemSchema],
		transaction_id: {},
		amount: { type: Number },
		country: String,
		city: String,
		address: String,
		zipcode: String,
		state: String,
		phone: String,
		deliveryComments: String,
		discountedAmount: Number,
		appliedCoupon: String,
		totalwithNoDiscounts: Number,
		paidTaxes: Number,
		shippingFees: Number,
		TaxPercentageSet: Number,
		firstPurchase: String,
		appliedCouponData: {},
		applyPoints: {
			type: Boolean,
			default: false,
		},
		customerName: {
			type: String,
			default: "Not Added",
		},
		LoyaltyPoints: Number,
		minLoyaltyPointsForAward: {
			type: Number,
			default: 40,
		},
		chosenShippingOption: {},
		email: String,
		processorResponseType: String,
		applePayCard: {},
		androidPayCard: {},
		card_data: {},

		pickupInStore: {
			type: Boolean,
			default: false,
		},
		payOnDelivery: {
			type: Boolean,
			default: false,
		},
		payNow: {
			type: Boolean,
			default: false,
		},

		status: {
			type: String,
			default: "Not processed",
			enum: [
				"Not processed",
				"Processing",
				"Shipped",
				"Delivered",
				"Cancelled",
			], // enum means string objects
		},

		user: { type: ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order, CartItem };
