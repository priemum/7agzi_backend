/** @format */

const { ScheduleOrder } = require("../models/scheduleOrder");
const User = require("../models/user");
const Employee = require("../models/employee");
const StoreManagement = require("../models/storeManagement");
const Services = require("../models/services");
const mongoose = require("mongoose");
const fs = require("fs");
const _ = require("lodash");
// const moment = require("moment");
const moment = require("moment-timezone");
// sendgrid for email npm i @sendgrid/mail
const sgMail = require("@sendgrid/mail");
const SMS = require("../models/sms");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
require("dotenv").config();
const orderStatusSMS = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const BarbershopName = "XLOOK";
const BarbershopWebsite = "http://xlookpro.com/";
const userDashboardLink = "http://xlookpro.com/dashboard";
const contactusPageLink = "http://xlookpro.com/contact";
const supportEmail = "info@xlookpro.com";
const fromEmail = "noreply@infinite-apps.com";
const defaultEmail = "ahmed.abdelrazak@infinite-apps.com";
const phoneNumber1 = "01097542859";
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
			console.log(error, "error");
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
				from: "whatsapp:+201097542859",
				body: `Hi ${firstName} - Your appointment was scheduled at (${
					order.scheduledTime
				}) on ${new Date(
					order.scheduledDate
				).toLocaleDateString()}. Please check your dashboard or call us at +201097542859 in case you would like to make any changes. Thank you for choosing ${BarbershopName}.`,
				template: "appointment_confirmation",
				appointment_confirmation: {
					1: order.firstName,
					2: order.scheduledTime,
					3: new Date(order.scheduledDate).toLocaleDateString(),
					4: "+201097542859",
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
		createdAt: { $gte: sixtyDaysAgo },
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
	Hours_Schedules.find({
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	})
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
		createdAt: { $gte: sixtyDaysAgo },
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
		{ _id: req.body.scheduleorderId },
		{
			$set: {
				status: req.body.status,
				updatedByUser: req.body.updatedByUser,
			},
		},
		{ new: true },
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
						{ new: true }
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
		createdAt: { $gte: sixtyDaysAgo },
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
		createdAt: { $gte: sixtyDaysAgo },
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
		createdAt: { $gte: sixtyDaysAgo },
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
		{ _id: req.body.orderId },
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
	// console.log(req.body.scheduledTime, "req.body.scheduledTime");
	// console.log(order.scheduledTime, "             order.scheduledTime");

	order.employees = req.body.employees;
	order.scheduledByUserEmail = req.body.scheduledByUserEmail;
	order.scheduledByUserName = req.body.scheduledByUserName;
	order.amount = req.body.amount;
	order.paidTip = req.body.paidTip;
	order.tipPercentage = req.body.tipPercentage;
	order.servicePrice = req.body.servicePrice;
	order.serviceDuration = req.body.serviceDuration;
	order.scheduleEndsAt = req.body.scheduleEndsAt;
	order.scheduledDate = req.body.scheduledDate;
	order.scheduledTime = req.body.scheduledTime;
	order.service = req.body.service;
	order.serviceDetails = req.body.serviceDetails;
	order.serviceDetailsArray = req.body.serviceDetailsArray;
	order.employeeAvailability = req.body.employeeAvailability;
	order.scheduleStartsAt = req.body.scheduleStartsAt;
	order.minLoyaltyPointsForAward = req.body.minLoyaltyPointsForAward;
	order.onlineServicesFees = req.body.onlineServicesFees;
	order.phone = req.body.phone;
	order.scheduleAppointmentPhoto = req.body.scheduleAppointmentPhoto;
	order.discountedAmount = req.body.discountedAmount;
	order.discountedPercentage = req.body.discountedPercentage;
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
					from: "whatsapp:+201097542859",
					body: `Hi ${firstName} - 
				Your appointment with ${order.employees[0].employeeName} was updated. 
				Please check your dashboard ${userDashboardLink} or call us 201097542859. 
				Thank you for choosing ${BarbershopName}.`,
					template: "appointment_confirmation",
					appointment_confirmation: {
						1: order.firstName,
						2: order.scheduledTime,
						3: new Date(order.scheduledDate).toLocaleDateString(),
						4: "+201097542859",
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
		{ _id: req.body.scheduleorderId },
		{
			$set: {
				status: req.body.status,
				updatedByUser: req.body.updatedByUser,
			},
		},
		{ new: true },
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
						{ new: true }
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
	order.scheduledByUserName = req.body.scheduledByUserName;
	order.amount = req.body.amount;
	order.paidTip = req.body.paidTip;
	order.tipPercentage = req.body.tipPercentage;
	order.servicePrice = req.body.servicePrice;
	order.serviceDuration = req.body.serviceDuration;
	order.scheduleEndsAt = req.body.scheduleEndsAt;
	order.scheduledDate = req.body.scheduledDate;
	order.service = req.body.service;
	order.serviceDetails = req.body.serviceDetails;
	order.serviceDetailsArray = req.body.serviceDetailsArray;
	order.employeeAvailability = req.body.employeeAvailability;
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
					from: "whatsapp:+201097542859",
					body: `Hi ${firstName} - 
				Your appointment with ${order.employees[0].employeeName} was updated. 
				Please check your dashboard ${userDashboardLink} or call us 201097542859. 
				Thank you for choosing ${BarbershopName}.`,
					template: "appointment_confirmation",
					appointment_confirmation: {
						1: order.firstName,
						2: order.employees[0].employeeName,
						3: userDashboardLink,
						4: "+201097542859",
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
		{ _id: req.body.scheduleorderId },
		{
			$set: {
				status: req.body.status,
				updatedByUser: req.body.updatedByUser,
			},
		},
		{ new: true },
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
						{ new: true }
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
	order.serviceDetailsArray = req.body.serviceDetailsArray;
	order.employeeAvailability = req.body.employeeAvailability;
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
				from: "whatsapp:+201097542859",
				body: `Hi ${firstName} - 
				Your appointment with ${order.employees[0].employeeName} was updated. 
				Please check your dashboard ${userDashboardLink} or call us 201097542859. 
				Thank you for choosing ${BarbershopName}.`,
				template: "appointment_confirmation",
				appointment_confirmation: {
					1: order.firstName,
					2: order.employees[0].employeeName,
					3: userDashboardLink,
					4: "+201097542859",
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
		{ _id: req.body.scheduleorderId },
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
				totalAppointments: { $sum: 1 },
				totalAmount: { $sum: "$amount" },
				totalOnlineServicesFees: { $sum: "$onlineServicesFees" },
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
				totalAppointments: { $sum: 1 },
				totalAmount: { $sum: "$amount" },
				totalOnlineServicesFees: { $sum: "$onlineServicesFees" },
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
	const { idsToUpdate } = req.body; // this should be an array of _id values
	ScheduleOrder.updateMany(
		{
			_id: { $in: idsToUpdate },
		},
		{
			$set: { sharePaid: true },
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

exports.firstAvailableTimeAndEmployee = async (req, res) => {
	console.log(req.params.ownerId);

	// Fetch the latest store settings
	const storeSettings = await StoreManagement.findOne({
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	}).sort({ createdAt: "desc" }); // Fetch the latest document by sorting in descending order on createdAt field

	if (!storeSettings) {
		return res.status(400).json({
			error: "Store settings not found",
		});
	}

	// Fetch all the employees working in the store/belongsTo
	const employees = await Employee.find({
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
	});

	// Initialize minAvailableTime and selectedEmployee
	let minAvailableTime = moment.tz("Africa/Cairo").add(1, "years");
	let selectedEmployee = null;

	for (const employee of employees) {
		let date = moment.tz("Africa/Cairo").startOf("day");

		for (let day = 0; day < 4; day++, date.add(1, "days")) {
			const dayName = date.format("dddd");

			// Check if the store or the employee is closed on this day
			if (
				storeSettings.daysStoreClosed.includes(dayName) ||
				!employee.workingDays.includes(dayName)
			) {
				continue;
			}

			// Find all orders for the employee scheduled for the current date
			const orders = await ScheduleOrder.find({
				employees: { $elemMatch: { _id: employee._id } },
				scheduledDate: { $eq: date.toDate() },
				sharePaid: false,
				belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
			}).sort("scheduledTime");

			// First available time for the employee is the start of their working hours
			let availableFrom = moment
				.tz(date, "Africa/Cairo")
				.add(employee.workingHours[0], "minutes");

			if (day === 0 && availableFrom.isBefore(moment.tz("Africa/Cairo"))) {
				availableFrom = moment.tz("Africa/Cairo");
			}

			for (const order of orders) {
				const orderStart = moment
					.tz(date, "Africa/Cairo")
					.add(order.scheduledTime.start, "minutes");
				const orderEnd = orderStart
					.clone()
					.add(order.serviceDetails.serviceTime, "minutes");

				if (orderStart.isSameOrAfter(availableFrom)) {
					break;
				} else {
					availableFrom = orderEnd;
				}
			}

			// Check if this employee is available earlier than the previously selected one
			if (availableFrom.isBefore(minAvailableTime)) {
				// Check if the available time is within the employee's working hours
				const workEnd = moment
					.tz(date, "Africa/Cairo")
					.add(employee.workingHours[1], "minutes");
				if (availableFrom.isBefore(workEnd)) {
					minAvailableTime = availableFrom;
					selectedEmployee = employee;
					break;
				}
			}
		}
	}

	if (!selectedEmployee) {
		return res.status(400).json({
			error: "No employees are available",
		});
	}

	const minutes = minAvailableTime.minutes();
	const remainder = 15 - (minutes % 15);
	const roundedTime = minAvailableTime.add(remainder, "minutes");

	res.json({
		employee: selectedEmployee,
		availableTime: minAvailableTime.format(),
		EgyptDate: roundedTime.format("YYYY-MM-DD"),
		EgyptTime: roundedTime.format("HH:mm"),
	});
};

//
//
//
// Our main function to find the first available appointment
exports.findFirstAvailableAppointment = async (req, res) => {
	try {
		// Parse all necessary parameters from the request
		const ownerId = mongoose.Types.ObjectId(req.params.ownerId);
		const customerType = req.params.customerType;
		const requestedServices = decodeURIComponent(req.params.serviceName).split(
			","
		);
		const date = req.params.date;
		const country = req.params.country;

		// Get the list of services requested
		const services = await Services.find({
			serviceName: { $in: requestedServices },
			belongsTo: ownerId,
			customerType: customerType,
		});

		// Calculate total service time by summing up the service times of all requested services
		const totalServiceTime = services.reduce(
			(acc, curr) => acc + curr.serviceTime,
			0
		);

		// Get all employees
		const employees = await Employee.find({ belongsTo: ownerId });
		let earliestAvailableTime;
		let earliestAvailableEmployee;

		// Get the current time in the country of the request
		const currentTimeInCountry = moment()
			.tz(getTimezoneForCountry(country))
			.format("HH:mm");

		const currentDateInCountry = moment()
			.tz(getTimezoneForCountry(country))
			.format("MM-DD-YYYY");

		const dateParts = date.split("-");

		// Pad the month, day, and year with leading zeros if necessary
		const paddedMonth = dateParts[0].padStart(2, "0");
		const paddedDay = dateParts[1].padStart(2, "0");
		const paddedYear = dateParts[2].padStart(4, "0");

		const paddedDate = `${paddedMonth}-${paddedDay}-${paddedYear}`;

		// Iterate over all employees to find the earliest available time
		for (const employee of employees) {
			// Get a list of available time slots for the given employee
			const availableTimes = await getAvailableTimes(
				employee,
				date,
				totalServiceTime,
				ownerId
			);

			// Filter the available times for times that are not in the past
			const futureAvailableTimes = availableTimes.hoursAvailable.filter(
				(time) => time >= currentTimeInCountry
			);

			// If the requested date is the same as the current date in the country
			if (paddedDate === currentDateInCountry) {
				// If the employee has at least one available time slot in the future
				if (futureAvailableTimes.length > 0) {
					// Take the first available time slot
					const firstAvailableTime = futureAvailableTimes[0];
					// If it is earlier than the currently earliest available time (or if it is the first available time found)
					if (
						!earliestAvailableTime ||
						firstAvailableTime < earliestAvailableTime
					) {
						// Update the earliest available time and the corresponding employee
						earliestAvailableTime = firstAvailableTime;
						earliestAvailableEmployee = employee;
					}
				}
			} else {
				// If the requested date is not today, use the first available time slot without checking if it's in the future or not
				earliestAvailableTime = availableTimes.hoursAvailable[0];
				earliestAvailableEmployee = employee;
			}
		}

		// If no available time slots were found
		if (!earliestAvailableTime) {
			return res.json({ message: "No available appointments." });
		}

		// Send a response with the earliest available time and the corresponding employee
		res.json({
			firstAvailableTime: moment(earliestAvailableTime, "HH:mm").format(
				"HH:mm"
			),
			Employee: earliestAvailableEmployee,
		});
	} catch (err) {
		console.error(err);
		// If an error occurred, send a response with a status code of 500 and an error message
		res.status(500).json({
			error:
				"An error occurred while trying to get the first available appointment.",
		});
	}
};

// A helper function to get the time zone for a given country
function getTimezoneForCountry(country) {
	// The time zones are hardcoded for Egypt and United States (PST Time)
	switch (country) {
		case "Egypt":
			return "Africa/Cairo";
		case "United States":
			return "America/Los_Angeles";
		default:
			throw new Error(`Unsupported country: ${country}`);
	}
}

// A helper function to get a list of available time slots for a given employee
async function getAvailableTimes(employee2, date2, totalServiceTime, ownerId2) {
	try {
		const ownerId = mongoose.Types.ObjectId(ownerId2);
		const employeeId = employee2._id;
		const date = new Date(date2);

		const dayOfWeek = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		][date.getDay()];

		// Get the employee
		const employee = await Employee.findOne({
			_id: employeeId,
			belongsTo: ownerId,
		});

		// Check if the employee is working on the given date
		if (!employee.workingDays.includes(dayOfWeek)) {
			return { availability: "Unavailable" };
		}

		// Get all working hours of the employee
		const workingHours = employee.workingHours.map((hour) => {
			const [h, m] = hour.split(":");
			return h * 60 + +m;
		});

		// Load all appointments of the employee
		const allAppointments = await ScheduleOrder.find({
			"employees._id": employeeId,
			belongsTo: ownerId,
		});

		// Parse the target date
		const targetDate = date;

		// Filter the appointments to get those that match the target date
		const appointments = allAppointments.filter((appointment) => {
			const appointmentDate = new Date(appointment.scheduledDate);
			return (
				appointmentDate.getUTCFullYear() === targetDate.getUTCFullYear() &&
				appointmentDate.getUTCMonth() === targetDate.getUTCMonth() &&
				appointmentDate.getUTCDate() === targetDate.getUTCDate()
			);
		});

		// Calculate occupied time slots
		let occupiedTimeSlots = [];
		let services = []; // initialize services to an empty array
		for (let appointment of appointments) {
			const startTime = new Date(
				appointment.scheduledDate + " " + appointment.scheduledTime
			);
			services = await Services.find({
				_id: { $in: appointment.serviceDetailsArray },
			});
			const serviceTime = services.reduce(
				(acc, curr) => acc + curr.serviceTime,
				0
			); // sum of service times
			const endTime = new Date(startTime.getTime() + serviceTime * 60 * 1000);
			for (let i = startTime; i < endTime; i.setMinutes(i.getMinutes() + 15)) {
				occupiedTimeSlots.push(i.getHours() * 60 + i.getMinutes());
			}
		}

		// Get available time slots
		let hoursAvailable = workingHours
			.filter((hour) => {
				if (occupiedTimeSlots.includes(hour)) return false;
				// Check for availability for the entire duration of the service
				for (let i = 1; i <= totalServiceTime / 15; i++) {
					if (occupiedTimeSlots.includes(hour + i * 15)) return false;
				}
				return true;
			})
			.map(
				(hour) =>
					`${Math.floor(hour / 60)
						.toString()
						.padStart(2, "0")}:${(hour % 60).toString().padStart(2, "0")}`
			);

		// Sort hoursAvailable in ascending order
		hoursAvailable.sort((a, b) => {
			const [aHours, aMinutes] = a.split(":").map(Number);
			const [bHours, bMinutes] = b.split(":").map(Number);
			return aHours - bHours || aMinutes - bMinutes;
		});

		// Prepare the response
		const availability =
			hoursAvailable.length > 0 ? "Available" : "Unavailable";

		return {
			employee: employee,
			hoursAvailable: hoursAvailable,
			totalServiceTime: totalServiceTime,
			servicesPicked: services,
			availability: availability,
		};
	} catch (err) {
		console.error(err);
		return {
			error: "An error occurred while trying to get the available slots.",
		};
	}
}

exports.employeeFreeSlots = async (req, res) => {
	try {
		const ownerId = mongoose.Types.ObjectId(req.params.ownerId);
		const employeeId = req.params.employeeId;
		const date = new Date(req.params.date);

		console.log(req.params.date, "req.params.date");

		const dayOfWeek = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		][date.getDay()];

		// Get the employee
		const employee = await Employee.findOne({
			_id: employeeId,
			belongsTo: ownerId,
		});

		// Check if the employee is working on the given date
		if (!employee.workingDays.includes(dayOfWeek)) {
			return res.json({ availability: "Unavailable" });
		}

		// Get all working hours of the employee
		const workingHours = employee.workingHours.map((hour) => {
			const [h, m] = hour.split(":");
			return h * 60 + +m;
		});

		// Load all appointments of the employee
		const allAppointments = await ScheduleOrder.find({
			"employees._id": employeeId,
			belongsTo: ownerId,
		});

		// Parse the target date
		const targetDate = new Date(req.params.date);

		// Filter the appointments to get those that match the target date
		const appointments = allAppointments.filter((appointment) => {
			const appointmentDate = new Date(appointment.scheduledDate);
			return (
				appointmentDate.getUTCFullYear() === targetDate.getUTCFullYear() &&
				appointmentDate.getUTCMonth() === targetDate.getUTCMonth() &&
				appointmentDate.getUTCDate() === targetDate.getUTCDate()
			);
		});

		// console.log(appointments, "appointments");
		// console.log("Employee Id         ", employeeId);
		// console.log("targetDate           ", targetDate);

		// Calculate occupied time slots
		let occupiedTimeSlots = [];
		for (let appointment of appointments) {
			const startTime = new Date(
				appointment.scheduledDate + " " + appointment.scheduledTime
			);
			const services = await Services.find({
				_id: { $in: appointment.serviceDetailsArray },
			});
			const serviceTime = services.reduce(
				(acc, curr) => acc + curr.serviceTime,
				0
			); // sum of service times
			const endTime = new Date(startTime.getTime() + serviceTime * 60 * 1000);
			for (let i = startTime; i < endTime; i.setMinutes(i.getMinutes() + 15)) {
				occupiedTimeSlots.push(i.getHours() * 60 + i.getMinutes());
			}
		}

		// Calculate total service time for the requested services
		const requestedServices = decodeURIComponent(req.params.services).split(
			","
		);
		const services = await Services.find({
			serviceName: { $in: requestedServices },
			belongsTo: ownerId,
			customerType: req.params.customerType,
		});
		const totalServiceTime = services.reduce(
			(acc, curr) => acc + curr.serviceTime,
			0
		); // sum of service times

		// Get available time slots
		let hoursAvailable = workingHours
			.filter((hour) => {
				if (occupiedTimeSlots.includes(hour)) return false;
				// Check for availability for the entire duration of the service
				for (let i = 1; i <= totalServiceTime / 15; i++) {
					if (occupiedTimeSlots.includes(hour + i * 15)) return false;
				}
				return true;
			})
			.map(
				(hour) =>
					`${Math.floor(hour / 60)
						.toString()
						.padStart(2, "0")}:${(hour % 60).toString().padStart(2, "0")}`
			);

		// Sort hoursAvailable in ascending order
		hoursAvailable.sort((a, b) => {
			const [aHours, aMinutes] = a.split(":").map(Number);
			const [bHours, bMinutes] = b.split(":").map(Number);
			return aHours - bHours || aMinutes - bMinutes;
		});

		// Prepare the response
		const availability =
			hoursAvailable.length > 0 ? "Available" : "Unavailable";
		res.json({
			employee: employee,
			hoursAvailable: hoursAvailable,
			totalServiceTime: totalServiceTime,
			servicesPicked: services,
			availability: availability,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: "An error occurred while trying to get the available slots.",
		});
	}
};

exports.listOfBookingUser = (req, res) => {
	ScheduleOrder.find({
		phone: req.params.phone,
	})
		.populate("user", "_id name email service scheduledTime")
		.populate(
			"belongsTo",
			"_id name email storeName storeType storeGovernorate phone storeDistrict createdAt"
		)
		.sort("-createdAt")
		.exec(async (err, orders) => {
			// Making this an async function
			if (err) {
				return res.status(400).json({
					error: "Error to retrieve all orders",
				});
			}

			// An async function to fetch the latest StoreManagement record for a user
			const getLatestStoreManagement = async (userId) => {
				return await mongoose
					.model("StoreManagement")
					.findOne({ belongsTo: userId })
					.sort("-createdAt")
					.lean() // To convert the result into a plain object
					.exec();
			};

			// Fetch the StoreManagement for each order
			const ordersWithSettings = await Promise.all(
				orders.map(async (order) => {
					const settings = await getLatestStoreManagement(order.belongsTo._id);
					return {
						...order.toObject(), // Convert order document to object
						settings,
					};
				})
			);

			res.json(ordersWithSettings);
		});
};

exports.governorateStats = async (req, res) => {
	try {
		// 1. Get statistics related to stores from StoreManagement schema
		const storeStats = await StoreManagement.aggregate([
			{
				$sort: { createdAt: -1 },
			},
			{
				$group: {
					_id: "$belongsTo",
					activeStore: { $first: "$activeStore" },
				},
			},
			{
				$group: {
					_id: "$activeStore",
					stores: { $push: "$_id" },
				},
			},
			{
				$lookup: {
					from: User.collection.name,
					localField: "stores",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$unwind: "$user",
			},
			{
				$match: {
					"user.role": 1000,
				},
			},
			{
				$group: {
					_id: "$user.storeGovernorate",
					StoreCount: { $sum: 1 },
					activeStores: {
						$sum: {
							$cond: [{ $eq: ["$_id", true] }, 1, 0],
						},
					},
					inactiveStores: {
						$sum: {
							$cond: [{ $eq: ["$_id", false] }, 1, 0],
						},
					},
				},
			},
		]);

		// 2. Get statistics related to bookings from ScheduleOrder schema
		const orderStats = await ScheduleOrder.aggregate([
			{
				$lookup: {
					from: User.collection.name,
					localField: "belongsTo",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$match: {
					"user.role": 1000,
				},
			},
			{
				$group: {
					_id: { $arrayElemAt: ["$user.storeGovernorate", 0] },
					BookingCount: { $sum: 1 },
					OnlineBooking: {
						$sum: {
							$cond: [{ $eq: ["$BookedFrom", "Online"] }, 1, 0],
						},
					},
					StoreBooking: {
						$sum: {
							$cond: [{ $eq: ["$BookedFrom", "Store"] }, 1, 0],
						},
					},
					CancelledBooking: {
						$sum: {
							$cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0],
						},
					},
					PaidBooking: {
						$sum: {
							$cond: [{ $eq: ["$status", "Paid"] }, 1, 0],
						},
					},
					NotPaidBooking: {
						$sum: {
							$cond: [{ $eq: ["$status", "Not Paid"] }, 1, 0],
						},
					},
				},
			},
		]);

		// Merge storeStats and orderStats into an array of objects
		const tempResult = {};

		storeStats.forEach((stat) => {
			tempResult[stat._id] = {
				governorate: stat._id,
				StoreCount: stat.StoreCount,
				activeStores: stat.activeStores,
				inactiveStores: stat.inactiveStores,
			};
		});

		orderStats.forEach((stat) => {
			if (!tempResult[stat._id]) {
				tempResult[stat._id] = { governorate: stat._id };
			}

			Object.assign(tempResult[stat._id], {
				BookingCount: stat.BookingCount,
				OnlineBooking: stat.OnlineBooking,
				StoreBooking: stat.StoreBooking,
				CancelledBooking: stat.CancelledBooking,
				PaidBooking: stat.PaidBooking,
				NotPaidBooking: stat.NotPaidBooking,
			});
		});

		// Convert the temporary result object to the desired array format
		const resultArray = Object.values(tempResult);

		// Sort the resultArray based on the StoreCount property in descending order
		resultArray.sort((a, b) => b.StoreCount - a.StoreCount);

		res.json(resultArray);
	} catch (error) {
		res.status(500).json({ error: "Error retrieving governorate stats" });
	}
};

exports.storeNameStats = async (req, res) => {
	try {
		// 1. Get statistics related to stores from StoreManagement schema
		const storeStats = await StoreManagement.aggregate([
			{
				$sort: { createdAt: -1 },
			},
			{
				$group: {
					_id: "$belongsTo",
					activeStore: { $first: "$activeStore" },
				},
			},
			{
				$group: {
					_id: "$activeStore",
					stores: { $push: "$_id" },
				},
			},
			{
				$lookup: {
					from: User.collection.name,
					localField: "stores",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$unwind: "$user",
			},
			{
				$match: {
					"user.role": 1000,
				},
			},
			{
				$group: {
					_id: "$user.storeName",
					StoreCount: { $sum: 1 },
					activeStores: {
						$sum: {
							$cond: [{ $eq: ["$_id", true] }, 1, 0],
						},
					},
					inactiveStores: {
						$sum: {
							$cond: [{ $eq: ["$_id", false] }, 1, 0],
						},
					},
				},
			},
		]);

		// 2. Get statistics related to bookings from ScheduleOrder schema
		const orderStats = await ScheduleOrder.aggregate([
			{
				$lookup: {
					from: User.collection.name,
					localField: "belongsTo",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$match: {
					"user.role": 1000,
				},
			},
			{
				$group: {
					_id: { $arrayElemAt: ["$user.storeName", 0] },
					BookingCount: { $sum: 1 },
					OnlineBooking: {
						$sum: {
							$cond: [{ $eq: ["$BookedFrom", "Online"] }, 1, 0],
						},
					},
					StoreBooking: {
						$sum: {
							$cond: [{ $eq: ["$BookedFrom", "Store"] }, 1, 0],
						},
					},
					CancelledBooking: {
						$sum: {
							$cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0],
						},
					},
					PaidBooking: {
						$sum: {
							$cond: [{ $eq: ["$status", "Paid"] }, 1, 0],
						},
					},
					NotPaidBooking: {
						$sum: {
							$cond: [{ $eq: ["$status", "Not Paid"] }, 1, 0],
						},
					},
				},
			},
		]);

		// Merge storeStats and orderStats into an array of objects
		const tempResult = {};

		storeStats.forEach((stat) => {
			tempResult[stat._id] = {
				storeName: stat._id,
				StoreCount: stat.StoreCount,
				activeStores: stat.activeStores,
				inactiveStores: stat.inactiveStores,
			};
		});

		orderStats.forEach((stat) => {
			if (!tempResult[stat._id]) {
				tempResult[stat._id] = { storeName: stat._id };
			}

			Object.assign(tempResult[stat._id], {
				BookingCount: stat.BookingCount,
				OnlineBooking: stat.OnlineBooking,
				StoreBooking: stat.StoreBooking,
				CancelledBooking: stat.CancelledBooking,
				PaidBooking: stat.PaidBooking,
				NotPaidBooking: stat.NotPaidBooking,
			});
		});

		// Convert the temporary result object to the desired array format
		const resultArray = Object.values(tempResult);

		// Sort the resultArray based on the StoreBooking property in descending order
		resultArray.sort((a, b) => b.StoreBooking - a.StoreBooking);

		res.json(resultArray);
	} catch (error) {
		res.status(500).json({ error: "Error retrieving store name stats" });
	}
};
