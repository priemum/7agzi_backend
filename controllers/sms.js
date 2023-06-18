/** @format */

const SMS = require("../models/sms");

require("dotenv").config();
const sendingSMS = require("twilio")(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN,
);

exports.smsById = (req, res, next, id) => {
	SMS.findById(id)
		.populate("user", "_id name email")
		.exec((err, sms) => {
			if (err || !sms) {
				return res.status(400).json({
					error: console.log(err, "error while getting smsbyid"),
				});
			}
			req.sms = sms;
			next();
		});
};

exports.createe = (req, res) => {
	req.body.user = req.profile;
	const sms = new SMS(req.body);
	sms.save((err, data) => {
		if (err) {
			return res.status(400).json({
				err: "Error in sms creation",
			});
		}
		sendingSMS.messages
			.create({
				body: req.body.text,
				from: "+12565489250",
				to: req.body.phone,
			})
			.then((message) =>
				console.log(`Your message was successfully sent to ${req.body.phone}`),
			)
			.catch((err) => console.log(err));
		res.json({ data: data });
	});
};

exports.list = async (req, res) => {
	try {
		res.json(await SMS.find({}).sort({ createdAt: -1 }).exec());
	} catch (err) {
		console.log(err);
	}
};
