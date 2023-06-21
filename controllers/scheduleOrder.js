/** @format */

const {ScheduleOrder, EmployeeItem} = require("../models/scheduleOrder");
const User = require("../models/user");
const mongoose = require("mongoose");
const fs = require("fs");
const _ = require("lodash");
// sendgrid for email npm i @sendgrid/mail
const sgMail = require("@sendgrid/mail");
const SMS = require("../models/sms");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
require("dotenv").config();
const orderStatusSMS = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const BarbershopName = "7agziiii";
const BarbershopWebsite = "http://hairsalondemo.infinite-apps.com/";
const userDashboardLink = "http://hairsalondemo.infinite-apps.com/dashboard";
const contactusPageLink = "http://hairsalondemo.infinite-apps.com/contact";
const supportEmail = "info@hair-salon.com";
const fromEmail = "noreply@infinite-apps.com";
const defaultEmail = "ahmed.abdelrazak@infinite-apps.com";
const phoneNumber1 = "(999) 222-1111";
const phoneNumber2 = "(999) 222-3322";
const shopAddress = "123 main street, LA, CA";
const shopLogo =
	"https://res.cloudinary.com/infiniteapps/image/upload/v1634425351/Hairsalon/logo_p62voj.png";

exports.scheduleOrderById = (req, res, next, id) => {
	ScheduleOrder.findById(id)
		.populate("employees.employee", "employeeName _id phone")
		.populate("user", "_id name email points activePoints")
		.exec((err, order) => {
			if (err || !order) {
				return res.status(400).json({
					error: "Error retriving order by Id",
				});
			}
			req.order = order;
			next();
		});
};

exports.create = (req, res) => {
	console.log("CREATE ORDER: ", req.body.order);
	req.body.order.user = req.profile;
	const order = new ScheduleOrder(req.body.order);
	const smsData = {
		user: order.user._id,
		phone: `+2${order.phone}`,
		text: `Hi ${
			order.scheduledByUserName
		} - \nYour appointment was scheduled at (${
			order.scheduledTime
		}) on ${new Date(
			order.scheduledDate
		).toLocaleDateString()}. Please check your dashboard ${userDashboardLink} or call us 9099914386 in case you would like to make any changes. Thank you for choosing ${BarbershopName}`,
		belongsTo: order.belongsTo,
	};
	order.save((error, data) => {
		if (error) {
			return res.status(400).json({
				error: "Error Creating an order",
			});
		}

		const sms = new SMS(smsData);
		sms.save((err, data) => {
			if (err) {
				return res.status(400).json({
					err: "Error in sms creation",
				});
			}
			// console.log(data, "sms saved in the data base");
		});

		//Sending Message
		// orderStatusSMS.messages
		// 	.create({
		// 		body: smsData.text,
		// 		from: "+18038100432",
		// 		to: smsData.phone,
		// 	})
		// 	.then((message) =>
		// 		console.log(`Your message was successfully sent to ${smsData.phone}`)
		// 	)
		// 	.catch((err) => console.log(err));
		//End of Sendting Message

		//
		//
		//Whats App Message
		var fullNameArray = order.scheduledByUserName.split(" ");
		var firstName = fullNameArray[0].trim();
		orderStatusSMS.messages
			.create({
				from: "whatsapp:+19512591528",
				body: `Hi ${firstName} - Your appointment was scheduled at (${
					order.scheduledTime
				}) on ${new Date(
					order.scheduledDate
				).toLocaleDateString()}. Please check your dashboard or call us at +19512591528 in case you would like to make any changes. Thank you for choosing ${BarbershopName}.`,
				template: "appointment_confirmation",
				appointment_confirmation: {
					1: order.firstName,
					2: order.scheduledTime,
					3: new Date(order.scheduledDate).toLocaleDateString(),
					4: "+19512591528",
					5: BarbershopName,
				},
				to: `whatsapp:${smsData.phone}`,
			})
			.then((message) =>
				console.log(`Your message was successfully sent to ${order.phone}`)
			)
			.catch((err) => console.log(err));

		//End of Whats App Message
		//
		//

		// send email alert to admin
		// order.address
		// order.products.length
		// order.amount
		// console.log(order.user.email, "User Email");
		// console.log(order.user.email.includes("@"), "Ahowan");

		res.json(data);
	});
};

exports.listScheduledOrders = (req, res) => {
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 90);

	ScheduleOrder.find({
		createdAt: {$gte: sixtyDaysAgo},
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	})
		.populate("user", "_id name email service scheduledTime")
		.populate("belongsTo", "_id name email storeName createdAt")
		.sort("-createdAt")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error to retrieve all orders",
				});
			}
			var ordersModified = orders.filter(
				(i) =>
					new Date(i.scheduledDate).setHours(0, 0, 0, 0) >=
					new Date().setHours(0, 0, 0, 0)
			);
			res.json(
				ordersModified.map((i) => {
					return {
						employeeId: i.employees[0]._id,
						employeeName: i.employees[0].employeeName,
						scheduledTime: i.scheduledTime,
						scheduledDate: i.scheduledDate,
						scheduledByUserName: i.scheduledByUserName,
						serviceDuration: i.serviceDuration,
						status: i.status,
						createdAt: i.createdAt,
						belongsTo: i.belongsTo,
					};
				})
			);
		});
};

exports.list = (req, res) => {
	Hours_Schedules.find({belongsTo: mongoose.Types.ObjectId(req.params.ownerId)})
		.populate("belongsTo", "name email phone storeName")
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.listScheduledOrdersGeneral = (req, res) => {
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 90);

	ScheduleOrder.find({
		createdAt: {$gte: sixtyDaysAgo},
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	})
		.populate("user", "_id name email service scheduledTime")
		.populate("belongsTo", "_id name email storeName createdAt")
		.sort("-created")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error to retrieve all orders",
				});
			}
			var ordersModified = orders.filter(
				(i) =>
					new Date(i.scheduledDate).setHours(0, 0, 0, 0) >=
					new Date().setHours(0, 0, 0, 0)
			);

			// console.log(ordersModified.length, "ordersModified");
			// console.log(orders.length, "ordersModified");
			res.json(
				ordersModified.map((i) => {
					return {
						employeeId: i.employees[0]._id,
						employeeName: i.employees[0].employeeName,
						scheduledTime: i.scheduledTime,
						scheduledDate: i.scheduledDate,
						scheduledByUserName: i.scheduledByUserName,
						serviceDuration: i.serviceDuration,
						status: i.status,
						createdAt: i.createdAt,
						belongsTo: i.belongsTo,
					};
				})
			);
		});
};

exports.getStatusValues = (req, res) => {
	res.json(ScheduleOrder.schema.path("status").enumValues);
};
exports.updateOrderStatus = (req, res, next) => {
	const returningSmsData = () => {
		if (
			req.body.status === "Scheduled From Store / Paid" ||
			req.body.status === "Scheduled Online / Paid in Store"
		) {
			const smsData = {
				user: req.order.user._id,
				phone: `+2${req.order.phone}`,
				text: `Hi ${req.order.scheduledByUserName} - \nThank you for choosing ${BarbershopName}, Your payment was successfully received.\nWe are looking forward to seeing you again\n ${BarbershopName}`,
				belongsTo: req.order.belongsTo,
			};
			return smsData;
		} else {
			const smsData = {
				user: req.order.user._id,
				phone: `+2${req.order.phone}`,
				text: `Hi ${req.order.scheduledByUserName} - \nYour Appointment Status was changed, Please contact us or call in case you don't know about those changes. \n Thank you for choosing ${BarbershopName}`,
				belongsTo: req.order.belongsTo,
			};
			return smsData;
		}
	};

	ScheduleOrder.findOneAndUpdate(
		{_id: req.body.scheduleorderId},
		{
			$set: {
				status: req.body.status,
				updatedByUser: req.body.updatedByUser,
			},
		},
		{new: true},
		async (err, order) => {
			if (err) {
				console.error("Error to update order status", err, req.body);
				return res.status(500).json({
					error: "Error to update order status",
					details: err,
				});
			}
			if (!order) {
				console.error("Order not found", req.body.scheduleorderId);
				return res.status(404).json({
					error: "Order not found",
					scheduleorderId: req.body.scheduleorderId,
				});
			}
			try {
				const sms = new SMS(returningSmsData());
				await sms.save();
				console.log("SMS saved in the database", sms);
			} catch (err) {
				console.error("Error in SMS creation", err, req.body);
				return res.status(500).json({
					error: "Error in SMS creation",
					details: err,
				});
			}

			// Check if order status is "Cancelled"
			if (req.body.status === "Cancelled") {
				try {
					const user = await User.findOneAndUpdate(
						{
							_id: req.order.user._id,
						},
						{
							$inc: {
								points: req.order.LoyaltyPoints * -1,
								activePoints: req.order.LoyaltyPoints * -1,
							},
						},
						{new: true}
					);

					console.log(user, "response to update status");

					// If everything is successful, return the updated order.
					return res.json(order);
				} catch (err) {
					console.log(err, "error from points update");

					// In case of error, return the error message.
					return res.status(500).json({
						error: "Error updating user points",
						details: err,
					});
				}
			} else {
				// If the status is not "Cancelled", just return the updated order.
				return res.json(order);
			}
		}
	);
};

exports.listScheduledOrders2 = (req, res) => {
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 90);

	ScheduleOrder.find({
		createdAt: {$gte: sixtyDaysAgo},
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	})
		.populate("user", "_id name email role activeUser")
		.sort("-createdAt")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error retrieving orders",
				});
			}
			res.json(orders);
		});
};

exports.listScheduledOrdersStore = (req, res) => {
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 90);

	ScheduleOrder.find({
		createdAt: {$gte: sixtyDaysAgo},
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	})
		.populate("user", "_id name email role activeUser")
		.sort("-createdAt")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error retrieving orders",
				});
			}
			res.json(orders);
		});
};

exports.listScheduledOrders3 = (req, res) => {
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 90);

	ScheduleOrder.find({
		createdAt: {$gte: sixtyDaysAgo},
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	})
		.populate("user", "_id name email service scheduledTime")
		.sort("-createdAt")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error to retrieve all orders",
				});
			}
			res.json(
				orders.filter(
					(i) =>
						i.employees && i.employees[0].employeePhone === req.profile.email
				)
			);
		});
};

exports.updateChosenEmployeeForAnOrder = (req, res) => {
	// console.log(req.body, "this is the new employee update for el zeft");
	ScheduleOrder.updateOne(
		{_id: req.body.orderId},
		{
			$set: {
				employees: [
					{
						_id: req.body.employeeId,
						employeeName: req.body.employeeName,
						createdAt: req.body.createdAt,
						updatedAt: req.body.updatedAt,
					},
				],
			},
		},
		(err, order) => {
			if (err) {
				return res.status(400).json({
					error: "Error to update the chosen stylist",
				});
			}
			res.json(order);
		}
	);
};

exports.read = (req, res) => {
	return res.json(req.order);
};

exports.updateAppointment = (req, res) => {
	const order = req.order;
	const orderDetails = req.body.orderDetails;
	// console.log(req.body.orderDetails);
	order.employees = req.body.employees;
	order.scheduledByUserEmail = req.body.scheduledByUserEmail;
	order.amount = req.body.amount;
	order.paidTip = req.body.paidTip;
	order.tipPercentage = req.body.tipPercentage;
	order.servicePrice = req.body.servicePrice;
	order.serviceDuration = req.body.serviceDuration;
	order.scheduleEndsAt = req.body.scheduleEndsAt;
	order.scheduledDate = req.body.scheduledDate;
	order.service = req.body.service;
	order.serviceDetails = req.body.serviceDetails;
	order.scheduleStartsAt = req.body.scheduleStartsAt;
	order.minLoyaltyPointsForAward = req.body.minLoyaltyPointsForAward;
	order.onlineServicesFees = req.body.onlineServicesFees;
	order.phone = req.body.phone;
	order.scheduleAppointmentPhoto = req.body.scheduleAppointmentPhoto;
	order.discountedAmount = req.body.discountedAmount;
	order.discountedPercentage = req.body.discountedPercentage;
	order.scheduledTime = req.body.scheduledTime;
	order.sharePaid = req.body.sharePaid;
	order.updatedByUser = req.body.updatedByUser;

	order.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
		if (req.body.sendOrNot === true) {
			const smsData = {
				user: orderDetails.user._id,
				phone: `+2${orderDetails.phone}`,
				text: `Hi ${orderDetails.scheduledByUserName} - \nYour appointment with ${orderDetails.employees[0].employeeName} was updated, Please check your dashboard ${process.env.CLIENT_URL}/dasboard or call us ${process.env.CLIENT_URL}/contact. \nThank you for choosing ${BarbershopName}.`,
				belongsTo: orderDetails.belongsTo,
			};
			const sms = new SMS(smsData);
			sms.save((err, data) => {
				if (err) {
					return res.status(400).json({
						err: "Error in sms creation",
					});
				}
				console.log(data, "sms saved in the data base");
			});

			//
			//
			//Whats App Message
			var fullNameArray = order.scheduledByUserName.split(" ");
			var firstName = fullNameArray[0].trim();
			orderStatusSMS.messages
				.create({
					from: "whatsapp:+19512591528",
					body: `Hi ${firstName} - 
				Your appointment with ${order.employees[0].employeeName} was updated. 
				Please check your dashboard ${userDashboardLink} or call us 9099914386. 
				Thank you for choosing ${BarbershopName}.`,
					template: "appointment_confirmation",
					appointment_confirmation: {
						1: order.firstName,
						2: order.scheduledTime,
						3: new Date(order.scheduledDate).toLocaleDateString(),
						4: "+19512591528",
						5: BarbershopName,
					},
					to: `whatsapp:${smsData.phone}`,
				})
				.then((message) =>
					console.log(`Your message was successfully sent to ${order.phone}`)
				)
				.catch((err) => console.log(err));

			//End of Whats App Message
			//
			//
		}
	});
};

// for Employee

exports.getStatusValuesEmployee = (req, res) => {
	res.json(ScheduleOrder.schema.path("status").enumValues);
};

exports.updateOrderStatusEmployee = (req, res, next) => {
	console.log(req.body, "req.body");

	const returningSmsData = () => {
		if (
			req.body.status === "Scheduled From Store / Paid" ||
			req.body.status === "Scheduled Online / Paid in Store"
		) {
			const smsData = {
				user: req.order.user._id,
				phone: `+1${req.order.phone}`,
				text: `Hi ${req.order.scheduledByUserName} - \nThank you for choosing ${BarbershopName}, Your payment was successfully received.\nWe are looking forward to seeing you again\n ${BarbershopName}`,
				belongsTo: req.order.belongsTo,
			};
			return smsData;
		} else {
			const smsData = {
				user: req.order.user._id,
				phone: `+1${req.order.phone}`,
				text: `Hi ${req.order.scheduledByUserName} - \nYour Appointment Status was changed, Please contact us or call in case you don't know about those changes. \n Thank you for choosing ${BarbershopName}`,
				belongsTo: req.order.belongsTo,
			};
			return smsData;
		}
	};

	ScheduleOrder.findOneAndUpdate(
		{_id: req.body.scheduleorderId},
		{
			$set: {
				status: req.body.status,
				updatedByUser: req.body.updatedByUser,
			},
		},
		{new: true},
		async (err, order) => {
			if (err) {
				console.error("Error to update order status", err, req.body);
				return res.status(500).json({
					error: "Error to update order status",
					details: err,
				});
			}
			if (!order) {
				console.error("Order not found", req.body.scheduleorderId);
				return res.status(404).json({
					error: "Order not found",
					scheduleorderId: req.body.scheduleorderId,
				});
			}
			try {
				const sms = new SMS(returningSmsData());
				await sms.save();
				console.log("SMS saved in the database", sms);
			} catch (err) {
				console.error("Error in SMS creation", err, req.body);
				return res.status(500).json({
					error: "Error in SMS creation",
					details: err,
				});
			}

			// Check if order status is "Cancelled"
			if (req.body.status === "Cancelled") {
				try {
					const user = await User.findOneAndUpdate(
						{
							_id: req.order.user._id,
						},
						{
							$inc: {
								points: req.order.LoyaltyPoints * -1,
								activePoints: req.order.LoyaltyPoints * -1,
							},
						},
						{new: true}
					);

					console.log(user, "response to update status");

					// If everything is successful, return the updated order.
					return res.json(order);
				} catch (err) {
					console.log(err, "error from points update");

					// In case of error, return the error message.
					return res.status(500).json({
						error: "Error updating user points",
						details: err,
					});
				}
			} else {
				// If the status is not "Cancelled", just return the updated order.
				return res.json(order);
			}
		}
	);
};

exports.updateAppointmentEmployee = (req, res) => {
	const order = req.order;
	const orderDetails = req.body.orderDetails;
	order.employees = req.body.employees;
	order.scheduledByUserEmail = req.body.scheduledByUserEmail;
	order.amount = req.body.amount;
	order.paidTip = req.body.paidTip;
	order.tipPercentage = req.body.tipPercentage;
	order.servicePrice = req.body.servicePrice;
	order.serviceDuration = req.body.serviceDuration;
	order.scheduleEndsAt = req.body.scheduleEndsAt;
	order.scheduledDate = req.body.scheduledDate;
	order.service = req.body.service;
	order.serviceDetails = req.body.serviceDetails;
	order.scheduleStartsAt = req.body.scheduleStartsAt;
	order.minLoyaltyPointsForAward = req.body.minLoyaltyPointsForAward;
	order.onlineServicesFees = req.body.onlineServicesFees;
	order.phone = req.body.phone;
	order.scheduleAppointmentPhoto = req.body.scheduleAppointmentPhoto;
	order.discountedAmount = req.body.discountedAmount;
	order.discountedPercentage = req.body.discountedPercentage;
	order.scheduledTime = req.body.scheduledTime;
	order.sharePaid = req.body.sharePaid;
	order.updatedByUser = req.body.updatedByUser;

	order.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
		if (req.body.sendOrNot === true) {
			const smsData = {
				user: orderDetails.user._id,
				phone: `+2${orderDetails.phone}`,
				text: `Hi ${orderDetails.scheduledByUserName} - \nYour appointment with ${orderDetails.employees[0].employeeName} was updated, Please check your dashboard ${process.env.CLIENT_URL}/dasboard or call us ${process.env.CLIENT_URL}/contact. \nThank you for choosing ${BarbershopName}.`,
				belongsTo: orderDetails.belongsTo,
			};
			const sms = new SMS(smsData);
			sms.save((err, data) => {
				if (err) {
					return res.status(400).json({
						err: "Error in sms creation",
					});
				}
				console.log(data, "sms saved in the data base");
			});

			//
			//
			//Whats App Message
			var fullNameArray = order.scheduledByUserName.split(" ");
			var firstName = fullNameArray[0].trim();
			orderStatusSMS.messages
				.create({
					from: "whatsapp:+19512591528",
					body: `Hi ${firstName} - 
				Your appointment with ${order.employees[0].employeeName} was updated. 
				Please check your dashboard ${userDashboardLink} or call us 9099914386. 
				Thank you for choosing ${BarbershopName}.`,
					template: "appointment_confirmation",
					appointment_confirmation: {
						1: order.firstName,
						2: order.employees[0].employeeName,
						3: userDashboardLink,
						4: "+19099914386",
						5: BarbershopName,
					},
					to: `whatsapp:${smsData.phone}`,
				})
				.then((message) =>
					console.log(`Your message was successfully sent to ${order.phone}`)
				)
				.catch((err) => console.log(err));

			//End of Whats App Message
			//
			//
		}
	});
};

exports.read2 = (req, res) => {
	return res.json(req.order);
};

/// For The Regular User
// for Employee

exports.getStatusValuesUser = (req, res) => {
	res.json(ScheduleOrder.schema.path("status").enumValues);
};

exports.updateOrderStatusUser = (req, res, next) => {
	const returningSmsData = () => {
		if (
			req.body.status === "Scheduled From Store / Paid" ||
			req.body.status === "Scheduled Online / Paid in Store"
		) {
			const smsData = {
				user: req.order.user._id,
				phone: `+1${req.order.phone}`,
				text: `Hi ${req.order.scheduledByUserName} - \nThank you for choosing ${BarbershopName}, Your payment was successfully received.\nWe are looking forward to seeing you again\n ${BarbershopName}`,
				belongsTo: req.order.belongsTo,
			};
			return smsData;
		} else {
			const smsData = {
				user: req.order.user._id,
				phone: `+1${req.order.phone}`,
				text: `Hi ${req.order.scheduledByUserName} - \nYour Appointment Status was changed, Please contact us or call in case you don't know about those changes. \n Thank you for choosing ${BarbershopName}`,
				belongsTo: req.order.belongsTo,
			};
			return smsData;
		}
	};

	ScheduleOrder.findOneAndUpdate(
		{_id: req.body.scheduleorderId},
		{
			$set: {
				status: req.body.status,
				updatedByUser: req.body.updatedByUser,
			},
		},
		{new: true},
		async (err, order) => {
			if (err) {
				console.error("Error to update order status", err, req.body);
				return res.status(500).json({
					error: "Error to update order status",
					details: err,
				});
			}
			if (!order) {
				console.error("Order not found", req.body.scheduleorderId);
				return res.status(404).json({
					error: "Order not found",
					scheduleorderId: req.body.scheduleorderId,
				});
			}
			try {
				const sms = new SMS(returningSmsData());
				await sms.save();
				console.log("SMS saved in the database", sms);
			} catch (err) {
				console.error("Error in SMS creation", err, req.body);
				return res.status(500).json({
					error: "Error in SMS creation",
					details: err,
				});
			}

			// Check if order status is "Cancelled"
			if (req.body.status === "Cancelled") {
				try {
					const user = await User.findOneAndUpdate(
						{
							_id: req.order.user._id,
						},
						{
							$inc: {
								points: req.order.LoyaltyPoints * -1,
								activePoints: req.order.LoyaltyPoints * -1,
							},
						},
						{new: true}
					);

					console.log(user, "response to update status");

					// If everything is successful, return the updated order.
					return res.json(order);
				} catch (err) {
					console.log(err, "error from points update");

					// In case of error, return the error message.
					return res.status(500).json({
						error: "Error updating user points",
						details: err,
					});
				}
			} else {
				// If the status is not "Cancelled", just return the updated order.
				return res.json(order);
			}
		}
	);
};

exports.updateAppointmentUser = (req, res) => {
	const order = req.order;
	const orderDetails = req.body.orderDetails;
	// console.log(req.body.orderDetails);
	order.employees = req.body.employees;
	order.scheduledByUserEmail = req.body.scheduledByUserEmail;
	order.amount = req.body.amount;
	order.paidTip = req.body.paidTip;
	order.tipPercentage = req.body.tipPercentage;
	order.servicePrice = req.body.servicePrice;
	order.serviceDuration = req.body.serviceDuration;
	order.scheduleEndsAt = req.body.scheduleEndsAt;
	order.scheduledDate = req.body.scheduledDate;
	order.service = req.body.service;
	order.serviceDetails = req.body.serviceDetails;
	order.scheduleStartsAt = req.body.scheduleStartsAt;
	order.minLoyaltyPointsForAward = req.body.minLoyaltyPointsForAward;
	order.onlineServicesFees = req.body.onlineServicesFees;
	order.phone = req.body.phone;
	order.scheduleAppointmentPhoto = req.body.scheduleAppointmentPhoto;
	order.discountedAmount = req.body.discountedAmount;
	order.discountedPercentage = req.body.discountedPercentage;
	order.scheduledTime = req.body.scheduledTime;
	order.sharePaid = req.body.sharePaid;
	order.updatedByUser = req.body.updatedByUser;

	order.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
		const smsData = {
			user: orderDetails.user._id,
			phone: `+2${orderDetails.phone}`,
			text: `Hi ${orderDetails.scheduledByUserName} - \nYour appointment with ${orderDetails.employees[0].employeeName} was updated, Please check your dashboard ${process.env.CLIENT_URL}/dasboard or call us ${process.env.CLIENT_URL}/contact. \nThank you for choosing ${BarbershopName}.`,
			belongsTo: orderDetails.belongsTo,
		};
		const sms = new SMS(smsData);
		sms.save((err, data) => {
			if (err) {
				return res.status(400).json({
					err: "Error in sms creation",
				});
			}
			console.log(data, "sms saved in the data base");
		});

		//
		//
		//Whats App Message
		var fullNameArray = order.scheduledByUserName.split(" ");
		var firstName = fullNameArray[0].trim();
		orderStatusSMS.messages
			.create({
				from: "whatsapp:+19512591528",
				body: `Hi ${firstName} - 
				Your appointment with ${order.employees[0].employeeName} was updated. 
				Please check your dashboard ${userDashboardLink} or call us 9099914386. 
				Thank you for choosing ${BarbershopName}.`,
				template: "appointment_confirmation",
				appointment_confirmation: {
					1: order.firstName,
					2: order.employees[0].employeeName,
					3: userDashboardLink,
					4: "+19099914386",
					5: BarbershopName,
				},
				to: `whatsapp:${smsData.phone}`,
			})
			.then((message) =>
				console.log(`Your message was successfully sent to ${order.phone}`)
			)
			.catch((err) => console.log(err));

		//End of Whats App Message
		//
		//
	});
};

exports.read3 = (req, res) => {
	return res.json(req.order);
};

exports.addingStylistComment = (req, res) => {
	console.log(req.body, "From Stylist Comment");
	ScheduleOrder.updateOne(
		{_id: req.body.scheduleorderId},
		{
			$set: {
				commentsByStylist: req.body.commentsByStylist,
			},
		},
		(err, order) => {
			if (err) {
				return res.status(400).json({
					error: "Error to update scheduled date",
				});
			}
			res.json(order);
		}
	);
};

exports.listBossAdmin = (req, res) => {
	ScheduleOrder.aggregate([
		{
			$group: {
				_id: "$belongsTo",
				totalAppointments: {$sum: 1},
				totalAmount: {$sum: "$amount"},
				totalOnlineServicesFees: {$sum: "$onlineServicesFees"},
			},
		},
	]).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: "Error retrieving orders",
			});
		}
		res.json(data);
	});
};

exports.listBossAdminNotPaid = (req, res) => {
	ScheduleOrder.aggregate([
		{
			$match: {
				sharePaid: false,
			},
		},
		{
			$group: {
				_id: "$belongsTo",
				totalAppointments: {$sum: 1},
				totalAmount: {$sum: "$amount"},
				totalOnlineServicesFees: {$sum: "$onlineServicesFees"},
			},
		},
	]).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: "Error retrieving orders",
			});
		}
		res.json(data);
	});
};

exports.schedulesNotPaidForSpecificStore = (req, res) => {
	console.log(req.params.ownerId);

	ScheduleOrder.find({
		sharePaid: false,
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	})
		// .populate("user", "_id name email service scheduledTime")
		.sort("-createdAt")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error to retrieve all orders",
				});
			}
			res.json(orders);
		});
};

exports.updateSharePaidStatus = (req, res) => {
	const {idsToUpdate} = req.body; // this should be an array of _id values
	ScheduleOrder.updateMany(
		{
			_id: {$in: idsToUpdate},
		},
		{
			$set: {sharePaid: true},
		}
	)
		.then((result) => {
			res.json({
				message: `Successfully updated ${result.nModified} documents`,
			});
		})
		.catch((err) => {
			return res.status(400).json({
				error: "Error updating documents",
				details: err,
			});
		});
};
