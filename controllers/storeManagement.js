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

const createFilter = (params) => {
	const filter = {};
	if (params.country !== "undefined") filter.storeCountry = params.country;
	if (params.governorate !== "undefined")
		filter.storeGovernorate = params.governorate;
	if (params.district !== "undefined") filter.storeDistrict = params.district;
	if (params.storeType !== "undefined") filter.storeType = params.storeType;
	if (params.service !== "undefined")
		filter.services = { $elemMatch: { name: params.service } };
	return filter;
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
				"_id name email phone user activeUser storeName storeCountry storeGovernorate storeAddress storeDistrict storeType subscribed platFormShare platFormShareToken",
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

		const filter = createFilter(req.params);

		stores = stores.filter((store) => {
			for (let key in filter) {
				if (
					key === "services" &&
					!store.services.some(
						(service) => service.name === filter[key].$elemMatch.name
					)
				) {
					return false;
				} else if (store.belongsTo[key] !== filter[key]) {
					return false;
				}
			}
			return true;
		});

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

const createAggregateFilter = (params) => {
	let filter = { activeStore: true }; // Default filter for active stores

	if (params.country && params.country !== "undefined")
		filter["user.storeCountry"] = params.country;
	if (params.governorate && params.governorate !== "undefined")
		filter["user.storeGovernorate"] = params.governorate;
	if (params.district && params.district !== "undefined")
		filter["user.storeDistrict"] = params.district;
	if (params.storeType && params.storeType !== "undefined")
		filter["user.storeType"] = params.storeType;

	return filter;
};

exports.countActiveStores = async (req, res) => {
	try {
		const filter = createAggregateFilter(req.params);

		const total = await StoreManagement.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "belongsTo",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{ $match: filter },
			{ $group: { _id: "$belongsTo" } },
			{ $count: "total" },
		]);

		// console.log(total, "Total");

		res.json({ total: total.length > 0 ? total[0].total : 0 });
	} catch (err) {
		res.status(400).json({ error: err });
	}
};

exports.migrateLocation = async (req, res) => {
	try {
		await StoreManagement.find()
			.cursor()
			.eachAsync(async (store) => {
				// Skip if the location object already exists and has coordinates
				if (
					store.location &&
					store.location.coordinates &&
					store.location.coordinates.length === 2
				) {
					return;
				}

				const longitude = parseFloat(store.longitude);
				const latitude = parseFloat(store.latitude);

				// Ensure that the longitude and latitude are valid numbers and within the correct ranges
				if (
					!isNaN(longitude) &&
					!isNaN(latitude) &&
					latitude >= -90 &&
					latitude <= 90 &&
					longitude >= -180 &&
					longitude <= 180
				) {
					store.location = {
						type: "Point",
						coordinates: [longitude, latitude],
					};

					await store.save();
				} else {
					console.warn(
						`Skipping store with invalid longitude/latitude: ${store._id}`
					);
				}
			});

		res.send("Migration completed successfully");
	} catch (err) {
		console.error(err);
		res.status(500).send("Migration failed");
	}
};

exports.listFrontendByLocation2 = async (req, res) => {
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
				"_id name email phone user activeUser storeName storeCountry storeGovernorate storeAddress storeDistrict storeType subscribed platFormShare platFormShareToken",
		});

		stores = await Promise.all(
			stores.map(async (store, index) => {
				try {
					const storeLocation = {
						latitude: parseFloat(store.latitude),
						longitude: parseFloat(store.longitude),
					};
					const distance = geolib.getDistance(userLocation, storeLocation);

					return {
						...store,
						distance,
					};
				} catch (error) {
					// console.log(`Error processing store at index ${index}: `, error);
					// console.log(`Store data: `, store);
				}
			})
		);

		stores = stores.filter((store) => store !== undefined);
		stores.sort((a, b) => a.distance - b.distance);

		const filter = createFilter(req.params);

		stores = stores.filter((store) => {
			for (let key in filter) {
				if (
					key === "services" &&
					!store.services.some(
						(service) => service.name === filter[key].$elemMatch.name
					)
				) {
					return false;
				} else if (store.belongsTo[key] !== filter[key]) {
					return false;
				}
			}
			return true;
		});

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
