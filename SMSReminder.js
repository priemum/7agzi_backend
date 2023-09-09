/** @format */

const { ScheduleOrder } = require("./models/scheduleOrder");
require("dotenv").config();
const moment = require("moment-timezone");
const orderStatusSMS = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);
const SMS = require("./models/sms");

const BarbershopName = "XLOOK";
const BarbershopWebsite = "https://xlookpro.com";
const userDashboardLink = "https://xlookpro.com/dashboard";
const contactusPageLink = "https://xlookpro.com/contact";

exports.scheduler = (req, res) => {
	ScheduleOrder.find()
		.populate("user", "_id name email service scheduledTime")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error to retrieve all orders",
				});
			}

			var currentMoment = moment().tz("Africa/Cairo");
			var minutesNow = currentMoment.minutes();
			var hoursNow = currentMoment.hours();

			var ordersModified = orders.filter((i) => {
				// convert the date string to ISO format
				const scheduledDate = moment(i.scheduledDate, "MM/DD/YYYY").tz(
					"Africa/Cairo"
				);
				const scheduledTime = moment(i.scheduledTime, "HH:mm").tz(
					"Africa/Cairo"
				);

				// Calculate the time difference in minutes
				const duration = moment
					.duration(scheduledTime.diff(currentMoment))
					.asMinutes();

				return (
					scheduledDate.isSame(currentMoment, "day") &&
					!i.reminderTextSend &&
					duration <= 60 &&
					duration >= 30
				);
			});

			if (ordersModified.length > 0) {
				console.log(
					ordersModified.length,
					` ${ordersModified.length} SMS was/were sent`
				);
				ordersModified.map((i) => {
					ScheduleOrder.updateOne(
						{ _id: i._id },
						{
							$set: {
								reminderTextSend: true,
							},
						},
						(err, order) => {
							if (err) {
								return res.status(400).json({
									error: "Error to update order status",
								});
							}
							const smsData = {
								user: i.user._id,
								phone: `+2${i.phone}`,
								text: `Hi ${i.scheduledByUserName} - \n This is a friendly reminder... \n Your appointment with ${i.employees[0].employeeName} is today at ${i.scheduledTime}, Please check your dashboard ${userDashboardLink} in case you would like to make any changes. \n Thank you for choosing ${BarbershopName}.`,
								belongsTo: i.belongsTo,
							};
							const sms = new SMS(smsData);

							sms.save((err, data) => {
								if (err) {
									return res.status(400).json({
										err: "Error in SMS creation",
									});
								}
							});

							var fullNameArray = i.scheduledByUserName.split(" ");
							var firstName = fullNameArray[0].trim();
							orderStatusSMS.messages
								.create({
									from: "whatsapp:+201097542859",
									body: `Hi ${firstName} - 
                                            This is a friendly reminder... 
                                            Your appointment with ${i.employees[0].employeeName} is today at ${i.scheduledTime}. 
                                            Please check your dashboard ${userDashboardLink} in case you would like to make any changes. 
                                            Thank you for choosing ${BarbershopName}.`,
									to: `whatsapp:${smsData.phone}`,
								})
								.then((message) =>
									console.log(
										`Your message was successfully sent to ${i.phone}`
									)
								)
								.catch((err) => console.log(err));
						}
					);
				});
			} else {
				return console.log(ordersModified.length, "everything was sent");
			}
		});
};
