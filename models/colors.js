/** @format */

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const colorsSchema = new mongoose.Schema(
	{
		color: {
			type: String,
			trim: true,
			required: "Name is required",
			minlength: [2, "Too short"],
			maxlength: [32, "Too long"],
			lowercase: true,
		},
		hexa: {
			type: String,
			trim: true,
			required: "Name is required",
			minlength: [2, "Too short"],
			maxlength: [32, "Too long"],
			lowercase: true,
		},
		belongsTo: { type: ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Colors", colorsSchema);
