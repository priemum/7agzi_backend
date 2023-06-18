/** @format */

const StoreManagement = require("../models/storeManagement");
const mongoose = require("mongoose");

exports.StoreManagementById = (req, res, next, id) => {
	StoreManagement.findById(id).exec((err, store_management) => {
		if (err || !store_management) {
			return res.status(400).json({
				error: "store_management was not found",
			});
		}
		req.store_management = StoreManagement;
		next();
	});
};

exports.create = (req, res) => {
	const store_management = new StoreManagement(req.body);
	store_management.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({data});
	});
};

exports.read = (req, res) => {
	return res.json(req.store_management);
};

exports.listFrontend = (req, res) => {
	StoreManagement.find()
		.populate(
			"belongsTo",
			"_id name email phone role user points activePoints likesUser activeUser history createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent platFormShareToken"
		)
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.list = (req, res) => {
	StoreManagement.find({belongsTo: mongoose.Types.ObjectId(req.params.ownerId)})
		.populate(
			"belongsTo",
			"_id name email phone role user points activePoints likesUser activeUser history createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent platFormShareToken"
		)
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.listFrontendBossAdmin = (req, res) => {
	StoreManagement.find({
		addStoreName: req.params.storeName,
		storePhone: req.params.phone,
	})
		.populate(
			"belongsTo",
			"_id name email phone role user points activePoints likesUser activeUser history createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent platFormShareToken"
		)
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(data);
		});
};

exports.updatingStoreStatus = (req, res, next) => {
	console.log(req.body.storeId, "req.body.storeId");
	StoreManagement.findOneAndUpdate(
		{_id: req.body.storeId},
		{
			$set: {
				activeStore: req.body.status,
			},
		},
		{new: true},
		async (err, store) => {
			if (err) {
				console.error("Error to update store status", err, req.body);
				return res.status(500).json({
					error: "Error to update store status",
					details: err,
				});
			}
			if (!store) {
				console.error("store not found", req.body.storeId);
				return res.status(404).json({
					error: "store not found",
					storeId: req.body.storeId,
				});
			}

			// Send a response when the update was successful
			res.json({success: true, message: "Store status updated", store});
		}
	);
};
