/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const storeManagement = new mongoose.Schema(
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
		addStoreLogo: {
			type: Array,
		},
		storeThumbnail: {
			type: Array,
		},
		addStoreName: String,
		storePhone: String,
		daysStoreClosed: {
			type: Array,
			trim: true,
		},

		datesStoreClosed: {
			type: Array,
			trim: true,
		},
		activeOnlineBooking: {
			type: Boolean,
			default: true,
		},

		activeStore: {
			type: Boolean,
			default: false,
		},

		belongsTo: {type: ObjectId, ref: "User"},
	},
	{timestamps: true}
);

module.exports = mongoose.model("StoreManagement", storeManagement);
