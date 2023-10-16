/** @format */

const StoreSettings = require("../models/storeSettings");
const mongoose = require("mongoose");

exports.StoreManagementById = (req, res, next, id) => {
	StoreSettings.findById(id).exec((err, storeSettings) => {
		if (err || !storeSettings) {
			return res.status(400).json({
				error: "store settings was not found",
			});
		}
		req.store_settings = StoreSettings;
		next();
	});
};

exports.create = (req, res) => {
	const store_settings = new StoreSettings(req.body);
	store_settings.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({ data });
	});
};

exports.read = (req, res) => {
	return res.json(req.store_settings);
};

exports.list = (req, res) => {
	const userId = mongoose.Types.ObjectId(req.params.userId);

	StoreSettings.find({ belongsTo: userId }).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};
