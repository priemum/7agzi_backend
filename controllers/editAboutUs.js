/** @format */

const About = require("../models/editAboutUs");
const mongoose = require("mongoose");

exports.aboutById = (req, res, next, id) => {
	About.findById(id).exec((err, about) => {
		if (err || !about) {
			return res.status(400).json({
				error: "about was not found",
			});
		}
		req.about = about;
		next();
	});
};

exports.create = (req, res) => {
	const about = new About(req.body);
	about.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({data});
	});
};

exports.read = (req, res) => {
	return res.json(req.about);
};

exports.update = (req, res) => {
	console.log(req.body);
	const about = req.about;
	about.header_1 = req.body.header_1;
	about.description_1 = req.body.description_1;
	about.thumbnail = req.body.thumbnail;
	about.categoryStatus = req.body.categoryStatus;

	about.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

// exports.list = (req, res) => {
// 	About.find().exec((err, data) => {
// 		if (err) {
// 			return res.status(400).json({
// 				error: err,
// 			});
// 		}
// 		res.json(data);
// 	});
// };

exports.list = (req, res) => {
	About.find({belongsTo: mongoose.Types.ObjectId(req.params.ownerId)})
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
