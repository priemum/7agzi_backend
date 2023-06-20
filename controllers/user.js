/** @format */

const User = require("../models/user");
const {ScheduleOrder} = require("../models/scheduleOrder");

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
	User.find({email: phoneNumber})
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

	User.findOne({_id: req.profile._id}, (err, user) => {
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
		{_id: req.profile._id},
		{$push: {history: history}},
		{new: true},
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
	ScheduleOrder.find({user: req.profile._id})
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

		{new: true},
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
		{$push: {likesUser: req.body.employeeId}},
		{new: true}
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
		{$pull: {likesUser: req.body.employeeId}},
		{new: true}
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
		{_id: req.body.clientUserId},
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
	const {name, password, email, activeUser} = req.body;

	// console.log(req.body, "req.body");
	// console.log(req.updatedUserByAdmin, "req.updatedUserByAdmin");

	User.findOne({_id: req.updatedUserByAdmin._id}, (err, user) => {
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
	User.find({role: {$ne: 0}})
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
	} = req.body;

	User.findOne({_id: userId}, (err, user) => {
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
	User.find({role: 2000})
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
				storeCountry: {$ne: "no store"},
				storeGovernorate: {$ne: "no store"},
				storeDistrict: {$ne: "no store"},
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
				userId: {$first: "$_id"},
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

	User.findOne({_id: req.params.agentId}, (err, user) => {
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
