/** @format */

const HeroComponent = require("../models/heroComponent");
const mongoose = require("mongoose");

exports.heroById = (req, res, next, id) => {
	HeroComponent.findById(id).exec((err, hero) => {
		if (err || !hero) {
			return res.status(400).json({
				error: "hero was not found",
			});
		}
		req.hero = hero;
		next();
	});
};

exports.create = (req, res) => {
	const hero = new HeroComponent(req.body);
	hero.save((err, data) => {
		if (err) {
			console.log(err, "err");
			return res.status(400).json({
				error: "Cannot Create hero",
			});
		}
		res.json({data});
	});
};

exports.read = (req, res) => {
	return res.json(req.hero);
};

exports.update = (req, res) => {
	console.log(req.body);
	const hero = req.hero;
	hero.heroComponentStatus = req.body.heroComponentStatus;
	hero.thumbnail = req.body.thumbnail;
	hero.thumbnail2 = req.body.thumbnail2;
	hero.thumbnail3 = req.body.thumbnail3;
	hero.thumbnail_Phone = req.body.thumbnail_Phone;
	hero.thumbnail2_Phone = req.body.thumbnail2_Phone;
	hero.thumbnail3_Phone = req.body.thumbnail3_Phone;
	hero.hyper_link = req.body.hyper_link;
	hero.hyper_link2 = req.body.hyper_link2;
	hero.hyper_link3 = req.body.hyper_link3;

	hero.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

// exports.list = (req, res) => {
// 	HeroComponent.find().exec((err, data) => {
// 		if (err) {
// 			return res.status(400).json({
// 				error: err,
// 			});
// 		}
// 		res.json(data);
// 	});
// };

exports.list = (req, res) => {
	HeroComponent.find({belongsTo: mongoose.Types.ObjectId(req.params.ownerId)})
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

exports.remove = (req, res) => {
	const hero = req.hero;

	hero.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				err: "error while removing",
			});
		}
		res.json({message: "hero deleted"});
	});
};
