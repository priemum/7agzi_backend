/** @format */

const express = require("express");
const router = express.Router();

const {
	requireSignin,
	isAuth,
	isAdmin,
	isEmployee,
	isInStore,
	isBoss,
} = require("../controllers/auth");
const {
	userById,
	addOrderToUserHistory,
	increasePoints,
} = require("../controllers/user");
const {
	create,
	scheduleOrderById,
	listScheduledOrdersGeneral,
	getStatusValues,
	read,
	updateOrderStatus,
	listScheduledOrders,
	listScheduledOrders2,
	listScheduledOrders3,
	listScheduledOrdersStore,
	updateAppointment,
	getStatusValuesEmployee,
	updateOrderStatusEmployee,
	updateAppointmentEmployee,
	read2,
	getStatusValuesUser,
	updateOrderStatusUser,
	updateAppointmentUser,
	read3,
	addingStylistComment,
	listBossAdmin,
	listBossAdminNotPaid,
	schedulesNotPaidForSpecificStore,
	updateSharePaidStatus,
	firstAvailableTimeAndEmployee,
	findFirstAvailableAppointment,
	employeeFreeSlots,
	listOfBookingUser,
} = require("../controllers/scheduleOrder");
// const { decreaseQuantity } = require("../controllers/employee");

router.post(
	"/scheduled-order/create/:userId",
	// requireSignin,
	// isAuth,
	// addOrderToUserHistory,
	// decreaseQuantity,
	create
);

router.get(
	"/schedule-order/list/:ownerId/:userId",
	requireSignin,
	isAuth,
	listScheduledOrders
);

router.get("/schedule-order/list/:ownerId", listScheduledOrdersGeneral);

router.get(
	"/schedule-order2/list/:ownerId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	listScheduledOrders2
);

router.get(
	"/schedule-order-store/list/:ownerId/:userId",
	requireSignin,
	isAuth,
	isInStore,
	listScheduledOrdersStore
);

router.get(
	"/schedule-order/status-values/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	getStatusValues
);

router.get(
	"/schedule-order-store/status-values-store/:userId",
	requireSignin,
	isAuth,
	isInStore,
	getStatusValues
);

router.put(
	"/schedule-order/:scheduleorderId/status/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	updateOrderStatus
);

router.put(
	"/schedule-order-store/:scheduleorderId/status-store/:userId",
	requireSignin,
	isAuth,
	isInStore,
	updateOrderStatus
);

router.put(
	"/appointment/:scheduleorderId/:userId",
	requireSignin,
	isAuth,
	updateAppointment
);

router.get(
	"/schedule-order/:scheduleorderId/:userId",
	requireSignin,
	isAuth,
	read
);

//For Employee
router.get(
	"/schedule-order3/list/:ownerId/:userId",
	requireSignin,
	isAuth,
	isEmployee,
	listScheduledOrders3
);

router.get(
	"/schedule-order-employee/status-values/:userId",
	requireSignin,
	isAuth,
	isEmployee,
	getStatusValuesEmployee
);

router.put(
	"/schedule-order-employee-order-status/:scheduleorderId/status-update/:userId",
	requireSignin,
	isAuth,
	isEmployee,
	updateOrderStatusEmployee
);

router.put(
	"/appointment-employee/:scheduleorderId/:userId",
	requireSignin,
	isAuth,
	isEmployee,
	updateAppointmentEmployee
);

router.get(
	"/schedule-order-employee/:scheduleorderId/:userId",
	requireSignin,
	isAuth,
	read2
);

router.put(
	"/schedule-order/:scheduleorderId/appoint-comment/:userId",
	requireSignin,
	isAuth,
	addingStylistComment
);

//For User
router.get(
	"/schedule-order-user/status-values/:userId",
	requireSignin,
	isAuth,
	getStatusValuesUser
);

router.put(
	"/schedule-order-user/:scheduleorderId/status/:userId",
	requireSignin,
	isAuth,
	updateOrderStatusUser
);

router.put(
	"/appointment-user/:scheduleorderId/:userId",
	requireSignin,
	isAuth,
	updateAppointmentUser
);

router.get(
	"/schedule-order-user/:scheduleorderId/:userId",
	requireSignin,
	isAuth,
	read3
);

router.get(
	"/all-appointments-for-the-boss/list/:userId",
	requireSignin,
	isAuth,
	isBoss,
	listBossAdmin
);

router.get(
	"/not-paid-appointments-for-the-boss/list/:userId",
	requireSignin,
	isAuth,
	isBoss,
	listBossAdminNotPaid
);

router.get(
	"/appointments-not-paid/list/:userId/:ownerId",
	requireSignin,
	isAuth,
	isBoss,
	schedulesNotPaidForSpecificStore
);

router.put(
	"/appointments-update-share-paid/:userId",
	requireSignin,
	isAuth,
	isBoss,
	updateSharePaidStatus
);

router.get(
	"/first-available-appointment-time/:ownerId",
	firstAvailableTimeAndEmployee
);

router.get(
	"/findFirstAvailableAppointment/:serviceName/:customerType/:date/:country/:ownerId",
	findFirstAvailableAppointment
);

router.get(
	"/employee-schedule/:employeeId/:customerType/:services/:date/:ownerId",
	employeeFreeSlots
);

router.get(
	"/user/booking/:phone/:userId",
	requireSignin,
	isAuth,
	listOfBookingUser
);

router.param("userId", userById);
router.param("scheduleorderId", scheduleOrderById);

module.exports = router;
