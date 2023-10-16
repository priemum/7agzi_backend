/** @format */

const Colors = require("../models/colors");

exports.colorsById = (req, res, next, id) => {
	Colors.findById(id).exec((err, color) => {
		if (err || !color) {
			return res.status(400).json({
				error: "color was not found",
			});
		}
		req.color = color;
		next();
	});
};

exports.create = (req, res) => {
	const color = new Colors(req.body);
	color.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: "Cannot Create color",
			});
		}
		res.json({ data });
	});
};

exports.read = (req, res) => {
	return res.json(req.color);
};

exports.update = (req, res) => {
	console.log(req.body);
	const color = req.color;
	color.color = req.body.color;
	color.hexa = req.body.hexa;
	color.belongsTo = req.body.belongsTo;

	color.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.list = (req, res) => {
	Colors.find().exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.remove = (req, res) => {
	const color = req.color;

	color.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				err: "error while removing",
			});
		}
		res.json({ message: "color deleted" });
	});
};
