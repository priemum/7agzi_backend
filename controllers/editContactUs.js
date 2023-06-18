/** @format */

const Contact = require("../models/editContactUs");
const mongoose = require("mongoose");

exports.contactById = (req, res, next, id) => {
	Contact.findById(id).exec((err, contact) => {
		if (err || !contact) {
			return res.status(400).json({
				error: "contact was not found",
			});
		}
		req.contact = contact;
		next();
	});
};

exports.create = (req, res) => {
	const contact = new Contact(req.body);
	contact.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({data});
	});
};

exports.read = (req, res) => {
	return res.json(req.contact);
};

exports.update = (req, res) => {
	console.log(req.body);
	const contact = req.contact;
	contact.header_1 = req.body.header_1;
	contact.description_1 = req.body.description_1;
	contact.thumbnail = req.body.thumbnail;
	contact.categoryStatus = req.body.categoryStatus;

	contact.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

// exports.list = (req, res) => {
// 	Contact.find().exec((err, data) => {
// 		if (err) {
// 			return res.status(400).json({
// 				error: err,
// 			});
// 		}
// 		res.json(data);
// 	});
// };

exports.list = (req, res) => {
	Contact.find({belongsTo: mongoose.Types.ObjectId(req.params.ownerId)})
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
