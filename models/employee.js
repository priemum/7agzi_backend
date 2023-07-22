/** @format */

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const employeeSchema = new mongoose.Schema(
	{
		employeeName: {
			type: String,
			trim: true,
			lowercase: true,
		},

		employeeNameOtherLanguage: {
			type: String,
			trim: true,
		},

		employeeAddress: {
			type: String,
			trim: true,
			lowercase: true,
		},

		workingAtStoreName: {
			type: String,
			trim: true,
			lowercase: true,
		},
		employeePhone: {
			type: String,
			trim: true,
			maxlength: 100,
			unique: true,
		},
		employeeWorkingAt: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},

		workingDays: [],
		workingHours: {
			type: Array,
		},
		bookings: {
			type: Number,
			default: 0,
		},
		services: [{ type: ObjectId, ref: "Services" }],

		servicesForGender: {
			type: Array,
		},

		personalPhotos: {
			type: Array,
		},
		workPhotos: {
			type: Array,
		},

		activeEmployee: {
			type: Boolean,
		},

		employeeGender: {
			type: String,
			default: "No Gender",
		},

		likes: [{ type: ObjectId, ref: "User" }],
		views: [],
		viewsCount: {
			type: Number,
			default: 0,
		},

		comments: [
			{
				text: String,
				commentsPhotos: {
					type: Array,
				},
				created: { type: Date, default: Date.now },
				postedBy: { type: ObjectId, ref: "User" },
			},
		],
		ratings: [
			{
				star: Number,
				ratedOn: { type: Date, default: Date.now },
				ratedBy: { type: ObjectId, ref: "User" },
			},
		],
		belongsTo: { type: ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
