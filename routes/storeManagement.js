/** @format */

const express = require("express");
const router = express.Router();
const {
	requireSignin,
	isAuth,
	isAdmin,
	isBoss,
} = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	StoreManagementById,
	list,
	listFrontend,
	listFrontendBossAdmin,
	updatingStoreStatus,
	listFrontend2,
	listFrontendByLocation,
	countActiveStores,
	migrateLocation,
	listFrontendByLocation2,
	searchStore,
	listOfStoresGradeA,
} = require("../controllers/storeManagement");

router.post(
	"/store-management/create/:userId",
	requireSignin,
	isAuth,
	isAdmin,
	create
);

router.get("/store-management/:ownerId", list);

router.get("/store-management-frontend", listFrontend);

router.get("/store-management/boss/:storeName/:phone", listFrontendBossAdmin);

router.put(
	"/store-status/activation/:storeId/:userId",
	requireSignin,
	isAuth,
	isBoss,
	updatingStoreStatus
);

router.get("/store-management-frontend-updated", listFrontend2);
router.get(
	"/active-stores-count/:country/:governorate/:district/:storeType/:service",
	countActiveStores
);
router.get(
	"/store-management/pagination/:lat/:lon/:country/:governorate/:district/:storeType/:service/:pagination/:page",
	listFrontendByLocation
);

router.get(
	"/store-management2/pagination2/:lat/:lon/:country/:governorate/:district/:storeType/:service/:pagination/:page",
	listFrontendByLocation2
);

router.get(
	"/store-management-a-b/pagination2/:lat/:lon/:country/:governorate/:district/:storeType/:service/:pagination/:page",
	listOfStoresGradeA
);

router.get("/migrateLocation", migrateLocation);

router.get("/store-search/:keyword", searchStore);

router.param("userId", userById);
router.param("serviceId", StoreManagementById);

module.exports = router;
