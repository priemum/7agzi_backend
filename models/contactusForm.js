/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const contactUs = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
		},
		email: {
			type: String,
			trim: true,
			required: true,
		},
		subject: {
			type: String,
			trim: true,
		},
		text: {
			type: String,
			trim: true,
			required: true,
		},
		belongsTo: {type: ObjectId, ref: "User"},
	},
	{timestamps: true}
);

module.exports = mongoose.model("ContactUs", contactUs);
