/** @format */

const express = require("express");
const router = express.Router();
const {
	requireSignin,
	isAuth,
	isAdmin,
	isEmployee,
} = require("../controllers/auth");
const {userById} = require("../controllers/user");

const {
	create,
	list,
	employeeById,
	update,
	listBySearch,
	like,
	unlike,
	comment,
	uncomment,
	viewsByUser,
	viewsCounter,
	read,
	employeeStar,
	updateByStylist,
	listForEmployee,
	employeeByPhone,
} = require("../controllers/employee");

router.post("/employee/create/:userId", requireSignin, isAuth, isAdmin, create);
router.put(
	"/employee/:employeeId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	update
);

router.put(
	"/employee/stylist/:employeeId/:userId",
	requireSignin,
	isAuth,
	isEmployee,
	updateByStylist
);

router.get("/employees/:ownerId", list);
router.get("/employees-employee/:ownerId", listForEmployee);
router.post("/employees/by/search", listBySearch);
router.get("/employee/:employeeId", read);
router.get("/employee/byphone/:phoneNumber", read);
// like unlike
router.put("/post/like", requireSignin, like);
router.put("/post/unlike", requireSignin, unlike);

// comment uncomment
router.put("/post/comment", requireSignin, comment);
router.put("/post/uncomment", requireSignin, uncomment);

//views
router.put("/views", viewsByUser);

//viewsCounter
router.put("/viewscounter", viewsCounter);

// rating
router.put("/employee/star/:employeeId/:userId", requireSignin, employeeStar);

router.param("userId", userById);
router.param("employeeId", employeeById);
router.param("phoneNumber", employeeByPhone);

module.exports = router;
