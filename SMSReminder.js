/** @format */

const { ScheduleOrder } = require("./models/scheduleOrder");
require("dotenv").config();
const orderStatusSMS = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);
const SMS = require("./models/sms");

const BarbershopName = "Our Store";
const BarbershopWebsite = "https://barbershopdemo.infinite-apps.com";
const userDashboardLink = "https://barbershopdemo.infinite-apps.com/dashboard";
const contactusPageLink = "https://barbershopdemo.infinite-apps.com/contact";
const supportEmail = "info@barbershop.com";
const fromEmail = "noreply@infinite-apps.com";
const defualtEmail = "ahmed.abdelrazak@infinite-apps.com";
const phoneNumber1 = "(999) 222-1111";
const phoneNumber2 = "(999) 222-3322";
const shopAddress = "123 main street, LA, CA";
const shopLogo =
	"https://res.cloudinary.com/infiniteapps/image/upload/v1633579688/Test/1633579689202.jpg";

exports.scheduler = (req, res) => {
	ScheduleOrder.find()
		.populate("user", "_id name email service scheduledTime")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error to retrieve all orders",
				});
			}

			var d = new Date();
			var hoursNow = d.getHours();
			// var todaysDay = d.getDate();
			// var todaysMonth = d.getMonth() + 1;
			// var todaysMinutes = d.getMinutes();

			var ordersModified = orders.filter(
				(i) =>
					new Date(i.scheduledDate).setHours(0, 0, 0, 0) ===
						new Date().setHours(0, 0, 0, 0) &&
					i.reminderTextSend === false &&
					new Date(i.scheduleStartsAt).getHours() - 1 === hoursNow
			);
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
										err: "Error in sms creation",
									});
								}
							});

							//
							//
							//Whats App Message
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
									to: `whatsapp:+2${smsData.phone}`,
								})
								.then((message) =>
									console.log(
										`Your message was successfully sent to ${user.phone}`
									)
								)
								.catch((err) => console.log(err));
							//End of Whats App Message
							//
							//
						}
					);
				});
			} else {
				return console.log(ordersModified.length, "everything was sent");
			}
		});
};
