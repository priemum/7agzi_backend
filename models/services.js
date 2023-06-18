/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const servicesSchema = new mongoose.Schema(
	{
		serviceName: {
			type: String,
			trim: true,
			lowercase: true,
		},

		serviceDescription: {
			type: Array,
			trim: true,
			lowercase: true,
		},
		serviceType: {
			type: String,
			trim: true,
			lowercase: true,
			default: "Package Service",
		},

		customerType: {
			type: String,
			trim: true,
			maxlength: 32,
			lowercase: true,
		},

		servicePrice: {
			type: Number,
			trim: true,
		},
		servicePriceDiscount: {
			type: Number,
			trim: true,
		},

		serviceTime: {
			type: Number,
			trim: true,
		},
		serviceLoyaltyPoints: {
			type: Number,
			trim: true,
		},

		activeService: {
			type: Boolean,
			trim: true,
			default: true,
		},

		belongsTo: {type: ObjectId, ref: "User"},
	},
	{timestamps: true}
);

module.exports = mongoose.model("Services", servicesSchema);
