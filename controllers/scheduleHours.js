/** @format */

const Hours_Schedules = require("../models/scheduleHours");
const mongoose = require("mongoose");

exports.addHours = (req, res) => {
	// console.log(req.body);
	let Hours = [];
	Hours = new Hours_Schedules(req.body);
	Hours.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: console.log(err, "error while addinghours"),
			});
		}
		res.json({data});
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
