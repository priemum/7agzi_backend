/** @format */

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
	{
		productName: {
			type: String,
			trim: true,
			required: true,
			maxlength: 200,
			text: true,
			lowercase: true,
		},
		productName_Arabic: {
			type: String,
			trim: true,
			required: true,
			maxlength: 200,
			text: true,
			lowercase: true,
		},
		productSKU: {
			type: String,
			trim: true,
			required: true,
			maxlength: 100,
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
		slug_Arabic: {
			type: String,
			unique: true,
			lowercase: true,
			index: true,
			required: true,
		},
		description1: {
			type: String,
			required: true,
			maxlength: 2000,
			text: true,
		},
		description1_Arabic: {
			type: String,
			required: true,
			maxlength: 2000,
			text: true,
		},
		price: {
			type: Number,
			required: true,
			trim: true,
			maxlength: 32,
		},
		priceAfterDiscount: {
			type: Number,
			required: true,
			trim: true,
			maxlength: 32,
		},
		price_unit: {
			type: String,
			required: true,
			trim: true,
			maxlength: 32,
		},
		loyaltyPoints: {
			type: Number,
			trim: true,
			maxlength: 32,
			default: 10,
		},
		category: {
			type: ObjectId,
			ref: "Category",
			required: true,
		},
		subcategory: [
			{
				type: ObjectId,
				ref: "Subcategory",
			},
		],
		quantity: Number,

		sold: {
			type: Number,
			default: 0,
		},

		gender: {
			type: String,
			default: "all",
		},

		images: {
			type: Array,
		},

		relatedProducts: [
			{
				type: ObjectId,
				ref: "Product",
			},
		],

		image: {
			type: String,
		},

		shipping: {
			type: Boolean,
			default: true,
		},

		color: {
			type: String,
		},

		size: {
			type: String,
			default: "no size",
		},

		activeProduct: {
			type: Boolean,
			default: true,
		},
		featuredProduct: {
			type: Boolean,
			default: false,
		},

		likes: [{ type: ObjectId, ref: "User" }],
		views: [],
		viewsCount: {
			type: Number,
			default: 0,
		},

		comments: [
			{
				text: String,
				commentsPhotos: {
					type: Array,
				},
				created: { type: Date, default: Date.now },
				postedBy: { type: ObjectId, ref: "User" },
			},
		],
		ratings: [
			{
				star: Number,
				ratedOn: { type: Date, default: Date.now },
				ratedBy: { type: ObjectId, ref: "User" },
			},
		],
		belongsTo: { type: ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
