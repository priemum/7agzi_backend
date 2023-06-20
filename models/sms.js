/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const smsSchema = new mongoose.Schema(
	{
		phone: {
			type: String,
			require: true,
		},
		text: {
			type: String,
			default: "You can come now, we are free",
		},
		user: {type: ObjectId, ref: "User"},

		belongsTo: {
			type: ObjectId,
			ref: "User",
			default: "6488b37f8aeb64826f01317a",
		},
		smsPaid: {type: Boolean, default: false},
	},
	{timestamps: true}
);

module.exports = mongoose.model("SMS", smsSchema);
