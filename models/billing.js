/** @format */

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const Billing = new mongoose.Schema(
	{
		belongsTo: { type: ObjectId, ref: "User" },
		schedules: [{ type: ObjectId, ref: "ScheduleOrder" }],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Billing", Billing);
