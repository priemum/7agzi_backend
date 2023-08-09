/** @format */

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

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

		ownerIdPhoto: {
			type: Array,
		},

		addStoreName: {
			type: String,
			default: "",
		},

		addStoreNameArabic: {
			type: String,
			default: "",
		},

		storePhone: String,

		longitude: String,
		latitude: String,

		location: {
			type: { type: String, default: "Point" },
			coordinates: { type: [Number], index: "2dsphere" },
		},

		salonGrade: {
			type: String,
			trim: true,
			lowercase: true,
			default: "c",
		},

		workersGender: {
			type: String,
			trim: true,
			lowercase: true,
			default: "male",
		},

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

		activateWhatsAppNotification: {
			type: Boolean,
			default: true,
		},

		activeStore: {
			type: Boolean,
			default: false,
		},

		activeWhatsAppNotification: {
			type: Boolean,
			default: true,
		},

		branchesCount: {
			type: Number,
			trim: true,
			maxlength: 32,
		},

		stylistsCount: {
			type: Number,
			trim: true,
			maxlength: 32,
		},

		chairsCount: {
			type: Number,
			trim: true,
			maxlength: 32,
		},
		cashPayment: {
			type: Boolean,
			default: true,
		},

		visaPayment: {
			type: Boolean,
			default: false,
		},

		airConditioned: {
			type: Boolean,
			default: false,
		},

		parking: {
			type: Boolean,
			default: false,
		},

		belongsTo: { type: ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("StoreManagement", storeManagement);
