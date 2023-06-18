/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const aboutSchema = new mongoose.Schema(
	{
		header_1: {
			type: String,
		},
		header_1_OtherLanguage: {
			type: String,
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

module.exports = mongoose.model("About", aboutSchema);
