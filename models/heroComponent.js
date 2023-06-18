/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const heroComponentSchema = new mongoose.Schema(
	{
		heroComponentStatus: {
			type: Boolean,
			default: true,
		},
		thumbnail: {
			type: Array,
		},
		thumbnail2: {
			type: Array,
		},
		thumbnail3: {
			type: Array,
		},
		thumbnail_Phone: {
			type: Array,
		},
		thumbnail2_Phone: {
			type: Array,
		},
		thumbnail3_Phone: {
			type: Array,
		},
		hyper_link: {
			type: String,
		},
		hyper_link2: {
			type: String,
		},
		hyper_link3: {
			type: String,
		},
		belongsTo: {type: ObjectId, ref: "User"},
	},
	{timestamps: true}
);

module.exports = mongoose.model("HeroComponent", heroComponentSchema);
