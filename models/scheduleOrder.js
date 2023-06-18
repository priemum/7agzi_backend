/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {ObjectId} = mongoose.Schema;

const EmployeeItemSchema = new mongoose.Schema(
	{
		employee: {type: ObjectId, ref: "Employee"},
		employeeName: String,
		employeePhone: String,
		workingAtStoreName: String,
		workPhotos: Array,
		_id: String,
	},
	{timestamps: true}
);

const EmployeeItem = mongoose.model("EmployeeItem", EmployeeItemSchema);

const ScheduleOrderSchema = new mongoose.Schema(
	{
		employees: [EmployeeItemSchema],
		transaction_id: {},
		amount: {type: Number},
		PetName: String,
		PetBreed: String,
		reminderTextSend: {
			type: Boolean,
			trim: true,
			default: false,
		},
		phone: "",
		zipcode: "",
		scheduledByUserName: String,
		scheduledByUserEmail: String,
		commentsByStylist: String,
		BookedFrom: String,
		service: String,
		serviceDetails: {},
		serviceDuration: {},
		applyPoints: Boolean,
		scheduledTime: {},
		scheduledDate: {},
		scheduleStartsAt: Date,
		scheduleEndsAt: Date,
		paymentStatus: "",
		discountedAmount: Number,
		discountedPercentage: Number,
		appliedCoupon: String,
		totalwithNoDiscounts: Number,
		paidTaxes: Number,
		LoyaltyPoints: Number,
		minLoyaltyPointsForAward: Number,
		onlineServicesFees: Number,
		paidTip: Number,
		tipPercentage: Number,
		servicePrice: Number,
		firstPurchase: String,
		scheduleAppointmentPhoto: Array,
		appointmentComment: String,
		appliedCouponData: {},
		card_data: {},
		status: {
			type: String,
			default: "Not Paid",
			enum: [
				"Scheduled Online / Not Paid",
				"Scheduled Online / Paid in Store",
				"Scheduled From Store / Not Paid",
				"Scheduled From Store / Paid",
				"Cancelled",
			], // enum means string objects
		},

		user: {type: ObjectId, ref: "User"},
		updatedByUser: {type: ObjectId, ref: "User"},
		sharePaid: {
			type: Boolean,
			default: false,
		},

		belongsTo: {type: ObjectId, ref: "User"},
	},
	{timestamps: true}
);

const ScheduleOrder = mongoose.model("ScheduleOrder", ScheduleOrderSchema);

module.exports = {ScheduleOrder, EmployeeItem};
