/** @format */

const StoreSettings = require("../models/storeSettings");
const User = require("../models/user");
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

exports.listOfStores = async (req, res) => {
	try {
		// First, fetch the distinct belongsTo values
		const belongsToIds = await mongoose
			.model("StoreSettings")
			.find()
			.distinct("belongsTo");

		const stores = await User.aggregate([
			{
				$match: {
					$or: [
						{ role: 5000 }, // Include users with role 5000
						{ _id: { $in: belongsToIds } }, // Include users whose id's exist in the storeSettings (belongsTo)
					],
				},
			},
			{
				$lookup: {
					from: "storesettings",
					localField: "_id",
					foreignField: "belongsTo",
					as: "storeSettings",
				},
			},
			{
				$unwind: {
					path: "$storeSettings",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$sort: { "storeSettings.createdAt": -1 }, // Sort by the storeSettings createdAt in descending order.
			},
			{
				$group: {
					_id: "$_id",
					root: { $first: "$$ROOT" }, // Using $first ensures you keep the record with the latest date after sorting.
				},
			},
			{
				$replaceRoot: { newRoot: "$root" },
			},
			{
				$project: {
					hashed_password: 0,
					salt: 0,
					"root._id": 0,
					// Exclude any other fields you want here.
				},
			},
		]);

		res.json(stores);
	} catch (err) {
		return res.status(500).json({ error: err });
	}
};
