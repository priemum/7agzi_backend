/** @format */

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const gallarySchema = new mongoose.Schema(
	{
		photoDescription: {
			type: String,
			default: "",
		},

		gallaryPhotos: {
			type: Array,
			default: "",
		},
		belongsTo: { type: ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Gallary", gallarySchema);
