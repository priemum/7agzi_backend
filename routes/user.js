/** @format */

const express = require("express");
const router = express.Router();
const {
	requireSignin,
	isAuth,
	isAdmin,
	isBoss,
	isAgent,
} = require("../controllers/auth");

const {
	userById,
	read,
	update,
	purchaseHistory,
	like,
	unlike,
	allUsersList,
	updatedUserId,
	updateUserByAdminClients,
	userByPhoneNumber,
	readByPhoneNumber,
	updateByAdminUpdated,
	allUsersListBoss,
	updateByBoss,
	allUsersListGeneral,
	getDistinctValues,
	updateAgent,
	getOverallSalonOwnersData,
	listOfStores,
	reportSummary,
	listOfStoresAgent,
	reportSummaryAgent,
	findDuplicatedFields,
	removeUser,
	likeProduct,
	unlikeProduct,
	userByCreatedAtDate,
	userBookings,
} = require("../controllers/user");

router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
	res.json({
		user: req.profile,
	});
});

// like unlike
router.put("/user/like", requireSignin, like);
router.put("/user/unlike", requireSignin, unlike);

router.put("/product/user/like", requireSignin, likeProduct);
router.put("/product/user/unlike", requireSignin, unlikeProduct);

router.get("/user/:userId", requireSignin, read);
router.get("/user/phone/:phoneNumber", readByPhoneNumber);
router.put("/user/:userId", requireSignin, isAuth, update);
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory);
router.get("/allUsers/:userId", requireSignin, isAuth, isAdmin, allUsersList);
router.get(
	"/allUsers/boss/:userId",
	requireSignin,
	isAuth,
	isBoss,
	allUsersListBoss
);

router.get("/allUsers/agents/general", allUsersListGeneral);
router.get("/duplicates/:field", findDuplicatedFields);

router.put(
	"/user/:updatedUserId/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	updateByAdminUpdated
);

router.put(
	"/client-update/:updatedUserId/activation/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	updateUserByAdminClients
);

router.put("/user/update/byboss/:userId", isBoss, updateByBoss);

router.get("/distinct-values", getDistinctValues);
router.put("/agent/update/:agentId/:userId", isBoss, updateAgent);
router.get("/boss/salon-owners/:userId", isBoss, getOverallSalonOwnersData);

router.get(
	"/agent/stores/:userId",
	requireSignin,
	isAuth,
	isAgent,
	allUsersListBoss
);

router.get(
	"/list-of-stores-xlook-admin/:pagination/:page/:searchQuery/:userId",
	requireSignin,
	isAuth,
	isBoss,
	listOfStores
);

router.get(
	"/stores-report-summary/:userId",
	requireSignin,
	isAuth,
	isBoss,
	reportSummary
);

router.get(
	"/list-of-stores-xlook-agent/:pagination/:page/:searchQuery/:userId",
	requireSignin,
	isAuth,
	isAgent,
	listOfStoresAgent
);

router.get(
	"/stores-report-summary-agent/:userId",
	requireSignin,
	isAuth,
	isAgent,
	reportSummaryAgent
);

router.get("/boss/get-all-users/:userId", isBoss, userByCreatedAtDate);
router.get(
	"/boss/get-all-users-bookings/:userId/:pagination/:page",
	isBoss,
	userBookings
);

router.delete("/delete-user/:userId", requireSignin, isAuth, removeUser);

router.param("userId", userById);
router.param("phoneNumber", userByPhoneNumber);
router.param("updatedUserId", updatedUserId);

module.exports = router;
