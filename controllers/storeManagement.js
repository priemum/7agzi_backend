/** @format */

const StoreManagement = require("../models/storeManagement");
const User = require("../models/user");
const Services = require("../models/services");
const mongoose = require("mongoose");
const geolib = require("geolib");
const fetch = require("node-fetch");
require("dotenv").config();

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
		res.json({ data });
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
	StoreManagement.find({
		belongsTo: mongoose.Types.ObjectId(req.params.ownerId),
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
	StoreManagement.findOneAndUpdate(
		{ _id: req.body.storeId },
		{
			$set: {
				activeStore: req.body.status,
			},
		},
		{ new: true },
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
			res.json({ success: true, message: "Store status updated", store });
		}
	);
};

exports.listFrontend2 = async (req, res) => {
	try {
		// Get all user ids with role 1000
		const usersWithRole1000 = await User.find({ role: 1000 }, "_id");
		const userIds = usersWithRole1000.map((user) => user._id);

		// Find the last StoreManagement record for each user with role 1000
		const storeManagementRecords = await StoreManagement.aggregate([
			{
				$match: { belongsTo: { $in: userIds } },
			},
			{
				$sort: { createdAt: -1 },
			},
			{
				$group: {
					_id: "$belongsTo",
					doc: { $first: "$$ROOT" },
				},
			},
			{
				$replaceRoot: { newRoot: "$doc" },
			},
		]);

		// only perform services aggregation if there are store management records
		if (storeManagementRecords.length > 0) {
			// Find the last unique Services record for each user with role 1000
			const servicesRecords = await Services.aggregate([
				{
					$match: { belongsTo: { $in: userIds } },
				},
				{
					$sort: { createdAt: -1 },
				},
				{
					$group: {
						_id: {
							belongsTo: "$belongsTo",
							serviceName: "$serviceName",
							customerType: "$customerType",
						},
						doc: { $first: "$$ROOT" },
					},
				},
				{
					$replaceRoot: { newRoot: "$doc" },
				},
			]).catch((err) => {
				console.error("Error with Services aggregation: ", err);
			});

			// Map services records to their respective users
			const servicesByUser = servicesRecords.reduce((acc, record) => {
				const userId = record.belongsTo.toString();
				if (!acc[userId]) {
					acc[userId] = [];
				}
				acc[userId].push(record);
				return acc;
			}, {});

			// Add the services to the StoreManagement records and populate user data
			for (let i = 0; i < storeManagementRecords.length; i++) {
				const storeManagementRecord = storeManagementRecords[i];
				const userId = storeManagementRecord.belongsTo.toString();
				storeManagementRecord.services = servicesByUser[userId] || [];

				// Replace belongsTo field with populated user data
				storeManagementRecord.belongsTo = await User.findById(userId).select(
					"_id name email phone role user points storeType createdAt storeName storeGovernorate storeAddress storeDistrict"
				);
			}
		}

		// Send the response
		res.json(storeManagementRecords);
	} catch (err) {
		console.log(err, "err");
		return res.status(400).json({
			error: err,
		});
	}
};

const getETA = async (origin, destination, mode) => {
	const url = new URL(
		"https://maps.googleapis.com/maps/api/distancematrix/json"
	);
	const params = {
		origins: `${origin.latitude},${origin.longitude}`,
		destinations: `${destination.latitude},${destination.longitude}`,
		mode: mode,
		key: process.env.GOOGLE_MAPS_API_KEY,
	};
	url.search = new URLSearchParams(params).toString();

	const res = await fetch(url);
	const data = await res.json();
	return data;
};

const calculateTravelTimes = async (userLocation, storeLocation) => {
	const travelModes = ["driving", "walking"];
	const eta = {};

	for (let mode of travelModes) {
		try {
			const response = await getETA(userLocation, storeLocation, mode);

			if (
				response &&
				response.rows &&
				response.rows[0] &&
				response.rows[0].elements &&
				response.rows[0].elements[0]
			) {
				const element = response.rows[0].elements[0];
				if (element.status === "OK") {
					eta[mode] = element.duration.text; // use .text to get human-readable time
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	return eta;
};

exports.listFrontendByLocation = async (req, res) => {
	const userLocation = {
		latitude: parseFloat(req.params.lat),
		longitude: parseFloat(req.params.lon),
	};
	const resultsPerPage = parseInt(req.params.pagination, 10);
	const page = parseInt(req.params.page, 10) || 1;

	try {
		let stores = await StoreManagement.aggregate([
			{ $match: { activeStore: true } },
			{ $sort: { belongsTo: 1, createdAt: -1 } },
			{
				$group: {
					_id: "$belongsTo",
					doc: { $first: "$$ROOT" },
				},
			},
			{ $replaceRoot: { newRoot: "$doc" } },
		]);

		stores = await StoreManagement.populate(stores, {
			path: "belongsTo",
			select:
				"_id name email phone user activeUser storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare platFormShareToken",
		});

		stores = await Promise.all(
			stores.map(async (store, index) => {
				try {
					const storeLocation = {
						latitude: parseFloat(store.latitude),
						longitude: parseFloat(store.longitude),
					};
					const distance = geolib.getDistance(userLocation, storeLocation);

					const { driving, walking } = await calculateTravelTimes(
						userLocation,
						storeLocation
					);

					return {
						...store,
						distance,
						walkingTime: walking,
						drivingTime: driving,
					};
				} catch (error) {
					// console.log(`Error processing store at index ${index}: `, error);
					// console.log(`Store data: `, store);
				}
			})
		);

		stores = stores.filter((store) => store !== undefined);

		stores.sort((a, b) => a.distance - b.distance);

		const startIndex = (page - 1) * resultsPerPage;
		const endIndex = page * resultsPerPage;
		const total = stores.length;
		stores = stores.slice(startIndex, endIndex);

		for (let i = 0; i < stores.length; i++) {
			if (stores[i].belongsTo && stores[i].belongsTo._id) {
				stores[i].services = await Services.find({
					belongsTo: mongoose.Types.ObjectId(stores[i].belongsTo._id),
					activeService: true,
				});
			} else {
				// console.log(
				// 	"Store with index " +
				// 		i +
				// 		" does not have a belongsTo property or _id is undefined"
				// );
			}
		}

		let pagination = {};
		if (endIndex < total) {
			pagination.next = {
				page: page + 1,
				limit: resultsPerPage,
			};
		}

		if (startIndex > 0) {
			pagination.prev = {
				page: page - 1,
				limit: resultsPerPage,
			};
		}

		res.json({ stores, pagination });
	} catch (err) {
		console.log(err, "err");
		res.status(400).json({ error: err });
	}
};

exports.countActiveStores = async (req, res) => {
	try {
		const total = await StoreManagement.aggregate([
			{ $match: { activeStore: true } },
			{ $group: { _id: "$belongsTo" } },
			{ $count: "total" },
		]);

		res.json({ total: total.length > 0 ? total[0].total : 0 });
	} catch (err) {
		res.status(400).json({ error: err });
	}
};
