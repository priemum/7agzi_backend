/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const contactSchema = new mongoose.Schema(
	{
		business_hours: {
			type: String,
		},
		business_hours_OtherLanguage: {
			type: String,
		},

		address: {
			type: String,
		},
		address_OtherLanguage: {
			type: String,
		},
		phone: {
			type: String,
		},
		email: {
			type: String,
		},
		header_1: {
			type: String,
		},

		header_1_OtherLanguage: {
			type: String,
			default: "Not added",
		},

		description_1: {
			type: String,
			default: "No Description",
		},

		description_1_OtherLanguage: {
			type: String,
			default: "No Description",
		},

		categoryStatus: {
			type: Boolean,
			default: true,
		},

		thumbnail: {
			type: Array,
		},
		belongsTo: {type: ObjectId, ref: "User"},
	},
	{timestamps: true}
);

module.exports = mongoose.model("Contact", contactSchema);
