/** @format */

const Employee = require("../models/employee");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.employeeById = (req, res, next, id) => {
	Employee.findById(id)
		.populate("ratings.ratedBy", "_id name email")
		.populate("belongsTo", "name email phone storeName _id")
		.populate("comments.postedBy", "_id name email")
		.populate(
			"services",
			"_id serviceName servicePrice customerType servicePriceDiscount"
		)
		.exec((err, employee) => {
			if (err || !employee) {
				return res.status(400).json({
					error: "Employee not found",
				});
			}
			req.employee = employee;
			next();
		});
};

exports.employeeByPhone = (req, res, next, phone) => {
	Employee.find({employeePhone: phone})
		.populate("ratings.ratedBy", "_id name email")
		.populate("belongsTo", "name email phone storeName _id")
		.populate("comments.postedBy", "_id name email")

		.exec((err, employee) => {
			if (err || !employee) {
				return res.status(400).json({
					error: "Employee not found",
				});
			}
			req.employee = employee[0];
			next();
		});
};

exports.read = (req, res) => {
	return res.json(req.employee);
};

exports.create = async (req, res) => {
	try {
		const newEmployee = await new Employee(req.body).save();
		res.json(newEmployee);
	} catch (err) {
		console.log(err, "Error while creating an employee");
		res.status(400).send("Employee error during creation");
	}
};

exports.list = (req, res) => {
	Employee.find({belongsTo: mongoose.Types.ObjectId(req.params.ownerId)})
		.populate("belongsTo", "name email phone storeName _id")
		.populate(
			"services",
			"_id serviceName servicePrice serviceTime serviceLoyaltyPoints servicePrice customerType servicePriceDiscount"
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

// exports.listForEmployee = (req, res) => {
// 	Employee.find().exec((err, data) => {
// 		if (err) {
// 			console.log(err);
// 			return res.status(400).json({
// 				error: err,
// 			});
// 		}
// 		res.json(data);
// 	});
// };

exports.listForEmployee = (req, res) => {
	Employee.find({belongsTo: mongoose.Types.ObjectId(req.params.ownerId)})
		.populate("belongsTo", "name email phone storeName _id")
		.populate(
			"services",
			"_id serviceName servicePrice serviceTime serviceLoyaltyPoints servicePrice customerType servicePriceDiscount"
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

exports.update = (req, res) => {
	const employee = req.employee;
	employee.employeeName = req.body.employee.employeeName;
	employee.workingDays = req.body.employee.workingDays;
	employee.services = req.body.employee.services;
	employee.servicesForGender = req.body.employee.servicesForGender;
	employee.personalPhotos = req.body.employee.personalPhotos;
	employee.workPhotos = req.body.employee.workPhotos;
	employee.employeeAddress = req.body.employee.employeeAddress;
	employee.employeePhone = req.body.employee.employeePhone;
	employee.employeeWorkingAt = req.body.employee.employeeWorkingAt;
	employee.description = req.body.employee.description;
	employee.description1 = req.body.employee.description1;
	employee.description2 = req.body.employee.description2;
	employee.activeEmployee = req.body.employee.activeEmployee;
	employee.workingHours = req.body.employee.workingHours;
	employee.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.updateByStylist = (req, res) => {
	const employee = req.employee;
	employee.employeeName = req.body.employee.employeeName;
	employee.workingDays = req.body.employee.workingDays;
	employee.services = req.body.employee.services;
	employee.servicesForGender = req.body.employee.servicesForGender;
	employee.personalPhotos = req.body.employee.personalPhotos;
	employee.workPhotos = req.body.employee.workPhotos;
	employee.employeeAddress = req.body.employee.employeeAddress;
	employee.employeePhone = req.body.employee.employeePhone;
	employee.employeeWorkingAt = req.body.employee.employeeWorkingAt;
	employee.description = req.body.employee.description;
	employee.description1 = req.body.employee.description1;
	employee.description2 = req.body.employee.description2;
	employee.activeEmployee = req.body.employee.activeEmployee;
	employee.workingHours = req.body.employee.workingHours;
	employee.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json(data);
	});
};

exports.listBySearch = (req, res) => {
	let order = req.body.order ? req.body.order : "desc";
	let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
	let limit = req.body.limit ? parseInt(req.body.limit) : 100;
	let skip = parseInt(req.body.skip);
	let findArgs = {};

	// console.log(order, sortBy, limit, skip, req.body.filters);
	// console.log("findArgs", findArgs);

	for (let key in req.body.filters) {
		if (req.body.filters[key].length > 0) {
			if (key === "price") {
				// gte -  greater than price [0-10]
				// lte - less than
				findArgs[key] = {
					$gte: req.body.filters[key][0],
					$lte: req.body.filters[key][1],
				};
			} else {
				findArgs[key] = req.body.filters[key];
			}
		}
	}

	Employee.find(findArgs)
		.populate(
			"services",
			"_id serviceName servicePrice serviceTime serviceLoyaltyPoints servicePrice customerType servicePriceDiscount"
		)
		.sort([[sortBy, order]])
		.skip(skip)
		.limit(limit)
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: "Employees not found",
				});
			}
			res.json({
				size: data.length,
				data,
			});
		});
};

exports.like = (req, res) => {
	Employee.findByIdAndUpdate(
		req.body.employeeId,
		{$push: {likes: req.body.userId}},
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

exports.unlike = (req, res) => {
	Employee.findByIdAndUpdate(
		req.body.employeeId,
		{$pull: {likes: req.body.userId}},
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

exports.viewsCounter = (req, res) => {
	let counter = req.body.counter;
	Employee.findByIdAndUpdate(req.body.employeeId, {viewsCount: counter}).exec(
		(err, result) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			} else {
				res.json(result);
			}
		}
	);
};

exports.viewsByUser = (req, res) => {
	var currentdate = new Date();
	var datetime =
		currentdate.getDate() +
		"/" +
		(currentdate.getMonth() + 1) +
		"/" +
		currentdate.getFullYear() +
		" " +
		currentdate.getHours() +
		":" +
		currentdate.getMinutes() +
		":" +
		currentdate.getSeconds();

	Employee.findByIdAndUpdate(
		req.body.employeeId,
		{$push: {views: datetime}},
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

exports.comment = (req, res) => {
	console.log(req.body, "comment");
	let comment = req.body.comment;
	comment.postedBy = req.body.userId;
	// console.log(req.body, "comments");
	Employee.findByIdAndUpdate(
		req.body.employeeId,
		{$push: {comments: comment}},
		{new: true}
	)
		.populate("comments.postedBy", "_id name email")
		// .populate("postedBy", "_id name email")
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

exports.uncomment = (req, res) => {
	let comment = req.body.comment;

	console.log(req.body);
	console.log(req.body.comment);

	Employee.findByIdAndUpdate(
		req.body.employeeId,
		{$pull: {comments: {_id: comment._id}}},
		{new: true}
	)
		.populate("comments.postedBy", "_id name email")
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

exports.employeeStar = async (req, res) => {
	const employee = await Employee.findById(req.params.employeeId).exec();
	const user = await User.findById(req.body.userId).exec();
	const {star} = req.body;

	// who is updating?
	// check if currently logged in user have already added rating to this employee?
	let existingRatingObject = employee.ratings.find(
		(ele) => ele.ratedBy.toString() === user._id.toString()
	);

	// if user haven't left rating yet, push it
	if (existingRatingObject === undefined) {
		let ratingAdded = await Employee.findByIdAndUpdate(
			employee._id,
			{
				$push: {ratings: {star, ratedBy: user._id}},
			},
			{new: true}
		).exec();
		// console.log("ratingAdded", ratingAdded);
		res.json(ratingAdded);
	} else {
		// if user have already left rating, update it
		const ratingUpdated = await Employee.updateOne(
			{
				ratings: {$elemMatch: existingRatingObject},
			},
			{$set: {"ratings.$.star": star}},
			{new: true}
		).exec();
		// console.log("ratingUpdated", ratingUpdated);
		res.json(ratingUpdated);
	}
};

exports.remove = (req, res) => {
	let employee = req.employee;
	employee.remove((err, deletedEmployee) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err),
			});
		}
		res.json({
			manage: "employee was successfully deleted",
		});
	});
};
