/** @format */

const User = require("../models/user");
const { ScheduleOrder } = require("../models/scheduleOrder");
const StoreManagement = require("../models/storeManagement");
const Services = require("../models/services");
const Employee = require("../models/employee");
const Gallary = require("../models/gallary");

exports.userById = (req, res, next, id) => {
	User.findById(id)
		.select(
			"_id name email phone role user points activePoints likesUser activeUser createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent agentPaid activeAgent agentOtherData agentPaidPro storeType"
		)
		// .populate(
		// 	"likesUser",
		// 	"_id employeeName description ratings views viewsCount",
		// )
		.exec((err, user) => {
			if (err || !user) {
				return res.status(400).json({
					error: "user not found yad",
				});
			}
			req.profile = user;
			next();
		});
};

exports.userByPhoneNumber = (req, res, next, phoneNumber) => {
	User.find({ email: phoneNumber })
		.select(
			"_id name email phone role user points activePoints likesUser activeUser createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent agentPaid activeAgent agentOtherData agentPaidPro storeType"
		)

		.exec((err, user) => {
			if (err || !user) {
				console.log(err, "err");
				return res.status(400).json({
					error: "user not found yad",
				});
			}
			req.profile = user;
			next();
		});
};

exports.updatedUserId = (req, res, next, id) => {
	User.findById(id)
		.select(
			"_id name email role user points activePoints likesUser activeUser createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent agentPaid activeAgent agentOtherData agentPaidPro storeType"
		)
		// .populate(
		// 	"likesUser",
		// 	"_id employeeName description rates views viewsCount",
		// )
		.exec((err, userNeedsUpdate) => {
			if (err || !userNeedsUpdate) {
				return res.status(400).json({
					error: "user not found yad",
				});
			}
			req.updatedUserByAdmin = userNeedsUpdate;
			next();
		});
};

exports.read = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json(req.profile);
};

exports.readByPhoneNumber = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json(req.profile);
};

exports.remove = (req, res) => {
	let user = req.user;
	user.remove((err, deletedUser) => {
		if (err) {
			return res.status(400).json({
				error: console.log(err, "err remove"),
			});
		}
		res.json({
			manage: "User was successfully deleted",
		});
	});
};
exports.allUsersList = (req, res) => {
	User.find()
		.select(
			"_id name email role user points activePoints likesUser activeUser history createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent agentPaid activeAgent agentOtherData agentPaidPro storeType"
		)
		// .populate(
		// 	"likesUser",
		// 	"_id employeeName description rates views viewsCount",
		// )
		.exec((err, users) => {
			if (err) {
				return res.status(400).json({
					error: "users not found",
				});
			}
			res.json(users);
		});
};

exports.update = (req, res) => {
	// console.log("UPDATE USER - req.user", req.user, "UPDATE DATA", req.body);

	const {
		name,
		password,
		email,
		phone,
		storeName,
		subscribed,
		platFormShare,
		smsPayAsYouGo,
		subscriptionToken,
		platFormShareToken,
		smsPayAsYouGoToken,
		paymentTo,
		subscriptionId,
	} = req.body;

	User.findOne({ _id: req.profile._id }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User not found",
			});
		}
		if (!name) {
			return res.status(400).json({
				error: "Name is required",
			});
		} else {
			user.name = name;
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({
					error: "Password should be min 6 characters long",
				});
			} else {
				user.password = password;
			}
		}

		if (storeName) {
			user.storeName = storeName;
		}

		if (!subscribed && paymentTo === "subscribed") {
			return res.status(400).json({
				error: "subscribed is required",
			});
		} else {
			user.subscribed = subscribed;
			user.subscriptionToken = subscriptionToken;
			user.subscriptionId = subscriptionId;
		}

		if (!smsPayAsYouGo && paymentTo === "smsPayAsYouGo") {
			return res.status(400).json({
				error: "smsPayAsYouGo is required",
			});
		} else {
			user.smsPayAsYouGo = smsPayAsYouGo;
			user.smsPayAsYouGoToken = smsPayAsYouGoToken;
		}

		if (!platFormShare && paymentTo === "platFormShare") {
			return res.status(400).json({
				error: "platFormShare is required",
			});
		} else {
			user.platFormShare = platFormShare;
			user.platFormShareToken = platFormShareToken;
		}

		if (email) {
			user.email = email;
			user.email = email;
		}

		if (phone) {
			user.phone = phone;
			user.phone = phone;
		}

		user.save((err, updatedUser) => {
			if (err) {
				console.log("USER UPDATE ERROR", err);
				return res.status(400).json({
					error: "User update failed",
				});
			}
			updatedUser.hashed_password = undefined;
			updatedUser.salt = undefined;
			res.json(updatedUser);
		});
	});
};

exports.addOrderToUserHistory = (req, res, next) => {
	let history = [];
	// console.log(req.profile, "this is the req.profile");
	req.body.order.employees.forEach((item) => {
		history.push({
			_id: item._id,
			name: item.employeeName,
			// transaction_id: req.body.order.transaction_id,
			amount: req.body.order.amount,
			scheduledDate: req.body.order.scheduledDate,
			scheduledTime: req.body.order.scheduledTime,
			personalPhotos: item.personalPhotos,
			workPhotos: item.workPhotos,
		});
	});

	User.findOneAndUpdate(
		{ _id: req.profile._id },
		{ $push: { history: history } },
		{ new: true },
		(error, data) => {
			if (error) {
				return res.status(400).json({
					error: "Could not update user purchase history",
				});
			}
			next();
		}
	);
};

exports.purchaseHistory = (req, res) => {
	ScheduleOrder.find({ user: req.profile._id })
		.populate("user", "_id name points activePoints likesUser")
		// .populate(
		// 	"likesUser",
		// 	"_id employeeName description rates views viewsCount",
		// )
		.sort("created")
		.exec((err, orders) => {
			if (err) {
				console.log(err);
				return res.status(400).json({
					error: console.log(err, "error getting purchase history"),
				});
			}
			res.json(orders);
		});
};

exports.increasePoints = (req, res, next) => {
	// console.log(req.body.order, "From inceasing points");
	let flag = Number(req.body.order.LoyaltyPoints);
	let flag2 = Number(req.body.order.LoyaltyPoints);

	if (
		req.profile.activePoints >= req.body.order.minLoyaltyPointsForAward &&
		req.body.order.applyPoints === true
	) {
		flag2 = -req.body.order.minLoyaltyPointsForAward;
	}

	User.findOneAndUpdate(
		{
			_id: req.profile._id,
		},
		{
			$inc: {
				points: flag,
				activePoints: flag2,
			},
		},

		{ new: true },
		function (err, response) {
			if (err) {
				console.log(err, "error from points update");
			}
			console.log(req.profile.points, req.profile.activePoints);
			next();
		}
	);
};

exports.like = (req, res) => {
	User.findByIdAndUpdate(
		req.body.userId,
		{ $push: { likesUser: req.body.employeeId } },
		{ new: true }
	)
		.populate("likesUser", "_id employeeName")

		.exec((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			} else {
				res.json(result);
			}
		});
};

exports.unlike = (req, res) => {
	User.findByIdAndUpdate(
		req.body.userId,
		{ $pull: { likesUser: req.body.employeeId } },
		{ new: true }
	).exec((err, result) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

exports.updateUserByAdminClients = (req, res) => {
	User.updateOne(
		{ _id: req.body.clientUserId },
		{
			$set: {
				activeUser: req.body.activeUser,
			},
		},
		(err, user) => {
			if (err) {
				return res.status(400).json({
					err: "Error to update user status",
				});
			}

			res.json(user);
		}
	);
};

exports.updateByAdminUpdated = (req, res) => {
	// console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
	const { name, password, email, activeUser } = req.body;

	// console.log(req.body, "req.body");
	// console.log(req.updatedUserByAdmin, "req.updatedUserByAdmin");

	User.findOne({ _id: req.updatedUserByAdmin._id }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User not found",
			});
		}
		if (!name) {
			return res.status(400).json({
				error: "Name is required",
			});
		} else {
			user.name = name;
		}

		if (!email) {
			return res.status(400).json({
				error: "email is required",
			});
		} else {
			user.email = email;
		}

		if (!activeUser) {
			return res.status(400).json({
				error: "activeUser is required",
			});
		} else {
			user.activeUser = activeUser;
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({
					error: "Password should be min 6 characters long",
				});
			} else {
				user.password = password;
			}
		}

		user.save((err, updatedUser) => {
			if (err) {
				console.log("USER UPDATE ERROR", err);
				return res.status(400).json({
					error: "User update failed",
				});
			}
			updatedUser.hashed_password = undefined;
			updatedUser.salt = undefined;
			res.json(updatedUser);
		});
	});
};

exports.allUsersListBoss = (req, res) => {
	User.find({ role: { $ne: 0 } })
		.select(
			"_id name email phone role user points activePoints likesUser activeUser history createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent agentPaid activeAgent agentOtherData agentPaidPro storeType"
		)
		// .populate(
		//  "likesUser",
		//  "_id employeeName description rates views viewsCount",
		// )
		.exec((err, users) => {
			if (err) {
				return res.status(400).json({
					error: "users not found",
				});
			}
			res.json(users);
		});
};

exports.updateByBoss = (req, res) => {
	// console.log("UPDATE USER - req.user", req.user, "UPDATE DATA", req.body);

	console.log(req.body, "updateByBoss");

	const {
		name,
		password,
		storeName,
		subscribed,
		platFormShare,
		smsPayAsYouGo,
		subscriptionToken,
		platFormShareToken,
		smsPayAsYouGoToken,
		paymentTo,
		subscriptionId,
		userId,
		agentPaid,
		agentPaidPro,
		agent,
	} = req.body;

	User.findOne({ _id: userId }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User not found",
			});
		}
		if (!name) {
			return res.status(400).json({
				error: "Name is required",
			});
		} else {
			user.name = name;
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({
					error: "Password should be min 6 characters long",
				});
			} else {
				user.password = password;
			}
		}

		if (!storeName) {
			return res.status(400).json({
				error: "storeName is required",
			});
		} else {
			user.storeName = storeName;
		}

		if (!subscribed && paymentTo === "subscribed") {
			return res.status(400).json({
				error: "subscribed is required",
			});
		} else {
			user.subscribed = subscribed;
			user.subscriptionToken = subscriptionToken;
			user.subscriptionId = subscriptionId;
		}

		if (!smsPayAsYouGo && paymentTo === "smsPayAsYouGo") {
			return res.status(400).json({
				error: "smsPayAsYouGo is required",
			});
		} else {
			user.smsPayAsYouGo = smsPayAsYouGo;
			user.smsPayAsYouGoToken = smsPayAsYouGoToken;
		}

		if (!platFormShare && paymentTo === "platFormShare") {
			return res.status(400).json({
				error: "platFormShare is required",
			});
		} else {
			user.platFormShare = platFormShare;
			user.platFormShareToken = platFormShareToken;
		}

		if (agentPaid) {
			user.agentPaid = agentPaid;
		}

		if (!agentPaid) {
			user.agentPaid = agentPaid;
		}

		if (agentPaidPro) {
			user.agentPaidPro = agentPaidPro;
		}

		if (!agentPaidPro) {
			user.agentPaidPro = agentPaidPro;
		}

		if (agent && agent.name) {
			user.agent = agent;
		}

		user.save((err, updatedUser) => {
			if (err) {
				console.log("USER UPDATE ERROR", err);
				return res.status(400).json({
					error: "User update failed",
				});
			}
			updatedUser.hashed_password = undefined;
			updatedUser.salt = undefined;
			res.json(updatedUser);
		});
	});
};

exports.allUsersListGeneral = (req, res) => {
	User.find({ role: 2000 })
		.select(
			"_id name email role user points activePoints likesUser activeUser history createdAt storeName storeGovernorate storeAddress storeDistrict subscribed platFormShare smsPayAsYouGo subscriptionId agent agentPaid activeAgent agentOtherData agentPaidPro storeType"
		)
		// .populate(
		// 	"likesUser",
		// 	"_id employeeName description rates views viewsCount",
		// )
		.exec((err, users) => {
			if (err) {
				return res.status(400).json({
					error: "users not found",
				});
			}
			res.json(users);
		});
};

exports.getDistinctValues = (req, res) => {
	User.aggregate([
		{
			$match: {
				storeCountry: { $ne: "no store" },
				storeGovernorate: { $ne: "no store" },
				storeDistrict: { $ne: "no store" },
				role: 1000,
			},
		},
		{
			$group: {
				_id: {
					storeCountry: "$storeCountry",
					storeGovernorate: "$storeGovernorate",
					storeDistrict: "$storeDistrict",
				},
				userId: { $first: "$_id" },
			},
		},
		{
			$project: {
				_id: 0,
				userId: "$userId",
				storeCountry: "$_id.storeCountry",
				storeGovernorate: "$_id.storeGovernorate",
				storeDistrict: "$_id.storeDistrict",
			},
		},
	]).exec((err, results) => {
		if (err) {
			return res.status(400).json({
				error: "Error retrieving unique combinations",
			});
		}
		res.json(results);
	});
};

exports.updateAgent = (req, res) => {
	const {
		name,
		password,
		email,
		phone,
		agentOtherData,
		activeAgent,
		agentPaid,
		agentPaidPro,
	} = req.body;

	User.findOne({ _id: req.params.agentId }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User not found",
			});
		}
		if (!name) {
			return res.status(400).json({
				error: "Name is required",
			});
		} else {
			user.name = name;
		}

		if (!email) {
			return res.status(400).json({
				error: "email is required",
			});
		} else {
			user.email = email;
		}
		if (!phone) {
			return res.status(400).json({
				error: "phone is required",
			});
		} else {
			user.phone = phone;
		}

		if (!agentOtherData.agentAddress) {
			return res.status(400).json({
				error: "agentOtherData is required",
			});
		} else {
			user.agentOtherData = agentOtherData;
		}
		if (!activeAgent) {
			return res.status(400).json({
				error: "activeAgent is required",
			});
		} else {
			user.activeAgent = activeAgent;
		}

		if (password) {
			if (password.length < 6) {
				return res.status(400).json({
					error: "Password should be min 6 characters long",
				});
			} else {
				user.password = password;
			}
		}

		user.agentPaid = agentPaid;
		user.agentPaidPro = agentPaidPro;

		user.save((err, updatedUser) => {
			if (err) {
				console.log("USER UPDATE ERROR", err);
				return res.status(400).json({
					error: "User update failed",
				});
			}
			updatedUser.hashed_password = undefined;
			updatedUser.salt = undefined;
			console.log(updatedUser, "updeteUser");
			res.json(updatedUser);
		});
	});
};

//Summary
exports.getOverallSalonOwnersData = async (req, res) => {
	try {
		const salonOwners = await User.find({ role: 1000 }).lean();

		const tempResult = {};

		// Unique salon owner ids that have had their settings added.
		const addedSettingsIds = new Set();
		// Unique salon owner ids with active stores.
		const activeSalonsIds = new Set();

		await Promise.all(
			salonOwners.map(async (salonOwner) => {
				const settings = await StoreManagement.find({
					belongsTo: salonOwner._id,
				}).sort("-createdAt"); // Sort by the addedAt field in descending order
				const services = await Services.find({ belongsTo: salonOwner._id });
				const employees = await Employee.find({ belongsTo: salonOwner._id });
				const appointmentsCount = await ScheduleOrder.countDocuments({
					belongsTo: salonOwner._id,
				});

				const agentName = salonOwner.agent.name;

				if (!tempResult[agentName]) {
					tempResult[agentName] = {
						agentName: agentName,
						RegisteredSalons: 0,
						activeSalons: 0,
						addedSettings: 0,
						addedEmployees: 0,
						addedServices: 0,
						proSubscription: 0,
						platFormShare: 0,
						appointmentsCount: 0,
					};
				}

				tempResult[agentName].RegisteredSalons += 1;

				// Consider the active status of the most recent settings added.
				if (settings[0]?.activeStore && !activeSalonsIds.has(salonOwner._id)) {
					tempResult[agentName].activeSalons += 1;
					activeSalonsIds.add(salonOwner._id);
				}

				if (settings.length > 0 && !addedSettingsIds.has(salonOwner._id)) {
					tempResult[agentName].addedSettings += 1;
					addedSettingsIds.add(salonOwner._id);
				}
				tempResult[agentName].addedEmployees += employees.length > 0 ? 1 : 0;
				tempResult[agentName].addedServices += services.length > 0 ? 1 : 0;
				tempResult[agentName].proSubscription += salonOwner.subscribed ? 1 : 0;
				tempResult[agentName].platFormShare += salonOwner.platFormShare ? 1 : 0;
				tempResult[agentName].appointmentsCount += appointmentsCount;

				// Check if everything is good
				tempResult[agentName].everythingIsGood =
					tempResult[agentName].RegisteredSalons ===
						tempResult[agentName].activeSalons &&
					tempResult[agentName].RegisteredSalons ===
						tempResult[agentName].addedSettings &&
					tempResult[agentName].RegisteredSalons ===
						tempResult[agentName].addedEmployees &&
					tempResult[agentName].RegisteredSalons ===
						tempResult[agentName].addedServices;
			})
		);

		// Convert the accumulated data into an array
		const result = Object.values(tempResult);

		res.json(result);
	} catch (error) {
		console.error(error);
		res.status(500).send("Server error");
	}
};

//Detailed Data
exports.getOverallSalonOwnersDataInDetails = async (req, res) => {
	try {
		const salonOwners = await User.find({ role: 1000 }).lean();

		const result = await Promise.all(
			salonOwners.map(async (salonOwner) => {
				const settings = await StoreManagement.find({
					belongsTo: salonOwner._id,
				}).lean();
				const services = await Services.find({
					belongsTo: salonOwner._id,
				}).lean();
				const employees = await Employee.find({
					belongsTo: salonOwner._id,
				}).lean();
				const appointmentsCount = await ScheduleOrder.countDocuments({
					belongsTo: salonOwner._id,
				});

				return {
					agentName: salonOwner.agent.name,
					RegisteredSalons: 1, // assuming one salon per owner
					activeSalons: settings.filter((setting) => setting.activeStore),
					addedSettings: settings,
					addedEmployees: employees,
					addedServices: services,
					proSubscription: salonOwner.subscribed ? 1 : 0,
					platFormShare: salonOwner.platFormShare ? 1 : 0,
					appointmentsCount: appointmentsCount,
				};
			})
		);

		res.json(result);
	} catch (error) {
		console.error(error);
		res.status(500).send("Server error");
	}
};

exports.listOfStores = async (req, res) => {
	const resultsPerPage = parseInt(req.params.pagination, 20);
	const page = parseInt(req.params.page, 20) || 1;
	const searchQuery =
		req.params.searchQuery && req.params.searchQuery !== "none"
			? req.params.searchQuery
			: null;

	const filter = { role: 1000 };
	if (searchQuery) {
		// Apply search filter for multiple fields
		filter.$or = [
			{ name: new RegExp(searchQuery, "i") },
			{ phone: new RegExp(searchQuery, "i") },
			{ storeGovernorate: new RegExp(searchQuery, "i") },
			{ storeDistrict: new RegExp(searchQuery, "i") },
			{ storeName: new RegExp(searchQuery, "i") },
			{ email: new RegExp(searchQuery, "i") },
			{ "agent.name": new RegExp(searchQuery, "i") }, // Add this line to search within the agent.name field
		];
	}

	try {
		const users = await User.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * resultsPerPage)
			.limit(resultsPerPage)
			.lean(); // .lean() returns plain JavaScript objects, not mongoose documents

		const userIds = users.map((user) => user._id);

		// Fetching associated store settings, services, employees, and galleries
		const settings = await StoreManagement.find({
			belongsTo: { $in: userIds },
		});
		const services = await Services.find({ belongsTo: { $in: userIds } });
		const employees = await Employee.find({ belongsTo: { $in: userIds } });
		const galleries = await Gallary.find({ belongsTo: { $in: userIds } });

		// Add these to the user objects
		users.forEach((user) => {
			user.settings =
				settings.filter(
					(setting) => setting.belongsTo.toString() === user._id.toString()
				) || [];
			user.services =
				services.filter(
					(service) => service.belongsTo.toString() === user._id.toString()
				) || [];
			user.employees =
				employees.filter(
					(employee) => employee.belongsTo.toString() === user._id.toString()
				) || [];
			user.galleries =
				galleries.filter(
					(gallary) => gallary.belongsTo.toString() === user._id.toString()
				) || [];
		});

		// Pagination logic
		let pagination = {};
		if (users.length === resultsPerPage) {
			// If we have enough results for another page
			pagination.next = {
				page: page + 1,
				limit: resultsPerPage,
			};
		}
		if (page > 1) {
			// If not on the first page
			pagination.prev = {
				page: page - 1,
				limit: resultsPerPage,
			};
		}

		res.json({ users, pagination });
	} catch (err) {
		console.log(err, "error occurred while fetching stores");
		res.status(400).json({ error: err.message });
	}
};

exports.reportSummary = async (req, res) => {
	try {
		const registeredStores = await User.countDocuments({ role: 1000 });

		const addedSettingsOwners = await StoreManagement.aggregate([
			{ $match: { settings: { $not: { $size: 0 } } } },
			{ $group: { _id: "$belongsTo" } },
		]);

		const addedServicesOwners = await Services.aggregate([
			{ $match: { services: { $not: { $size: 0 } } } },
			{ $group: { _id: "$belongsTo" } },
		]);

		const addedEmployeesOwners = await Employee.aggregate([
			{ $group: { _id: "$belongsTo" } },
		]);

		const addedGallaryOwners = await Gallary.aggregate([
			{ $match: { gallaryPhotos: { $not: { $size: 0 } } } },
			{ $group: { _id: "$belongsTo" } },
		]);

		// Get the most recent settings for each user and check if they're active
		const recentSettingsForOwners = await StoreManagement.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $group: { _id: "$belongsTo", recentSetting: { $first: "$$ROOT" } } },
		]);

		const activeStores = recentSettingsForOwners.filter(
			(setting) => setting.recentSetting.activeStore
		).length;
		const notActiveStores = registeredStores - activeStores;

		const result = {
			registeredStores,
			addedSettings: addedSettingsOwners.length,
			addedServices: addedServicesOwners.length,
			addedEmployees: addedEmployeesOwners.length,
			addedGallary: addedGallaryOwners.length,
			activeStores,
			notActiveStores,
		};

		res.json(result);
	} catch (err) {
		console.error("Error in reportSummary:", err);
		res.status(500).send("Internal Server Error");
	}
};

exports.listOfStoresAgent = async (req, res) => {
	const resultsPerPage = parseInt(req.params.pagination, 20);
	const page = parseInt(req.params.page, 20) || 1;
	const searchQuery =
		req.params.searchQuery && req.params.searchQuery !== "none"
			? req.params.searchQuery
			: null;
	const userId = req.params.userId;

	const filter = { role: 1000, "agent._id": userId };
	if (searchQuery) {
		// Apply search filter for multiple fields
		filter.$or = [
			{ name: new RegExp(searchQuery, "i") },
			{ phone: new RegExp(searchQuery, "i") },
			{ storeGovernorate: new RegExp(searchQuery, "i") },
			{ storeDistrict: new RegExp(searchQuery, "i") },
			{ storeName: new RegExp(searchQuery, "i") },
			{ email: new RegExp(searchQuery, "i") },
		];
	}

	try {
		const users = await User.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * resultsPerPage)
			.limit(resultsPerPage)
			.lean(); // .lean() returns plain JavaScript objects, not mongoose documents

		const userIds = users.map((user) => user._id);

		// Fetching associated store settings, services, employees, and galleries
		const settings = await StoreManagement.find({
			belongsTo: { $in: userIds },
		});
		const services = await Services.find({ belongsTo: { $in: userIds } });
		const employees = await Employee.find({ belongsTo: { $in: userIds } });
		const galleries = await Gallary.find({ belongsTo: { $in: userIds } });

		// Add these to the user objects
		users.forEach((user) => {
			user.settings =
				settings.filter(
					(setting) => setting.belongsTo.toString() === user._id.toString()
				) || [];
			user.services =
				services.filter(
					(service) => service.belongsTo.toString() === user._id.toString()
				) || [];
			user.employees =
				employees.filter(
					(employee) => employee.belongsTo.toString() === user._id.toString()
				) || [];
			user.galleries =
				galleries.filter(
					(gallary) => gallary.belongsTo.toString() === user._id.toString()
				) || [];
		});

		// Pagination logic
		let pagination = {};
		if (users.length === resultsPerPage) {
			// If we have enough results for another page
			pagination.next = {
				page: page + 1,
				limit: resultsPerPage,
			};
		}
		if (page > 1) {
			// If not on the first page
			pagination.prev = {
				page: page - 1,
				limit: resultsPerPage,
			};
		}

		res.json({ users, pagination });
	} catch (err) {
		console.log(err, "error occurred while fetching stores");
		res.status(400).json({ error: err.message });
	}
};

exports.reportSummaryAgent = async (req, res) => {
	try {
		const userId = req.params.userId;
		const filter = { role: 1000, "agent._id": userId };

		// First, get all the user IDs that match the filter
		const users = await User.find(filter, { _id: 1 });
		const userIds = users.map((user) => user._id);

		const registeredStores = userIds.length;

		const addedSettingsOwners = await StoreManagement.aggregate([
			{
				$match: {
					settings: { $not: { $size: 0 } },
					belongsTo: { $in: userIds },
				},
			},
			{ $group: { _id: "$belongsTo" } },
		]);

		const addedServicesOwners = await Services.aggregate([
			{
				$match: {
					services: { $not: { $size: 0 } },
					belongsTo: { $in: userIds },
				},
			},
			{ $group: { _id: "$belongsTo" } },
		]);

		const addedEmployeesOwners = await Employee.aggregate([
			{ $match: { belongsTo: { $in: userIds } } },
			{ $group: { _id: "$belongsTo" } },
		]);

		const addedGallaryOwners = await Gallary.aggregate([
			{
				$match: {
					gallaryPhotos: { $not: { $size: 0 } },
					belongsTo: { $in: userIds },
				},
			},
			{ $group: { _id: "$belongsTo" } },
		]);

		// Get the most recent settings for each user and check if they're active
		const recentSettingsForOwners = await StoreManagement.aggregate([
			{ $match: { belongsTo: { $in: userIds } } },
			{ $sort: { createdAt: -1 } },
			{ $group: { _id: "$belongsTo", recentSetting: { $first: "$$ROOT" } } },
		]);

		const activeStores = recentSettingsForOwners.filter(
			(setting) => setting.recentSetting.activeStore
		).length;
		const notActiveStores = registeredStores - activeStores;

		const result = {
			registeredStores,
			addedSettings: addedSettingsOwners.length,
			addedServices: addedServicesOwners.length,
			addedEmployees: addedEmployeesOwners.length,
			addedGallary: addedGallaryOwners.length,
			activeStores,
			notActiveStores,
		};

		res.json(result);
	} catch (err) {
		console.error("Error in reportSummaryAgent:", err);
		res.status(500).send("Internal Server Error");
	}
};

exports.findDuplicatedFields = async (req, res) => {
	const field = req.params.field;

	if (!["email", "phone"].includes(field)) {
		return res
			.status(400)
			.json({ error: "Invalid field. Use 'email' or 'phone'." });
	}

	try {
		const duplicates = await User.aggregate([
			{
				$group: {
					_id: `$${field}`,
					count: { $sum: 1 },
					ids: { $push: "$_id" },
				},
			},
			{
				$match: {
					count: { $gt: 1 },
				},
			},
		]);

		if (duplicates.length === 0) {
			return res
				.status(200)
				.json({ message: `No duplicated ${field}s found.` });
		}

		const response = duplicates.map((dup) => {
			return {
				[field]: dup._id,
				count: dup.count,
				ids: dup.ids,
			};
		});

		res.status(200).json(response);
	} catch (error) {
		console.error("Error finding duplicates:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.removeUser = (req, res) => {
	const hero = req.user;

	hero.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				err: "user while removing",
			});
		}
		res.json({ message: "user deleted" });
	});
};
