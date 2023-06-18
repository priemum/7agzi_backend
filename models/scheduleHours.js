/** @format */

const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const scheduleHours = new mongoose.Schema(
	{
		hoursCanBeScheduled: {
			type: Array,
		},
		belongsTo: {type: ObjectId, ref: "User"},
	},
	{timestamps: true}
);

module.exports = mongoose.model("Hours_Schedules", scheduleHours);
