/** @format */

const Gallary = require("../models/gallary");
const mongoose = require("mongoose");

exports.gallaryById = (req, res, next, id) => {
	Gallary.findById(id).exec((err, gallary) => {
		if (err || !gallary) {
			return res.status(400).json({
				error: "gallary was not found",
			});
		}
		req.gallary = gallary;
		next();
	});
};

exports.create = (req, res) => {
	const gallary = new Gallary(req.body);
	gallary.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: console.log(err, "error while creating gallary"),
			});
		}
		res.json({ data });
	});
};

exports.read = (req, res) => {
	return res.json(req.gallary);
};

exports.update = (req, res) => {
	console.log(req.body);
	const gallary = req.gallary;
	gallary.photoDescription = req.body.photoDescription;
	gallary.gallaryPhotos = req.body.gallaryPhotos;
	gallary.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.remove = (req, res) => {
	const gallary = req.gallary;

	gallary.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({ message: "gallary deleted" });
	});
};

exports.list = (req, res) => {
	console.log(req.params.ownerId, "req.params.ownerId");
	Gallary.find({ belongsTo: mongoose.Types.ObjectId(req.params.ownerId) })
		.populate("belongsTo", "_id name email phone storeName")
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.listCobmined = (req, res) => {
	Gallary.find()
		.populate("belongsTo", "_id name email phone storeName")
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};
