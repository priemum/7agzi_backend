/** @format */

const mongoose = require("mongoose");

const affiliateSchema = new mongoose.Schema(
	{
		productName: {
			type: String,
			trim: true,
			required: true,
			text: true,
			lowercase: true,
		},

		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true,
			required: true,
		},

		description1: {
			type: String,
			required: true,
			text: true,
		},

		price: {
			type: Number,
			trim: true,
			maxlength: 32,
		},

		currency: {
			type: String,
			trim: true,
			maxlength: 32,
			default: "USD",
		},

		category: {
			type: String,
			trim: true,
		},

		gender: {
			type: String,
			default: "all",
		},

		country: {
			type: String,
			default: "USA",
		},

		images: {
			type: Array,
		},

		shipping: {
			type: Boolean,
			default: true,
		},

		activeProduct: {
			type: Boolean,
			default: true,
		},
		featuredProduct: {
			type: Boolean,
			default: false,
		},

		affiliateLink: {
			type: String,
			trim: true,
			default: "",
		},

		source: {
			type: String,
			trim: true,
			default: "amazon",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Affiliate", affiliateSchema);
