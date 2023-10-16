/** @format */

const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isStoreOwner } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
	create,
	listProductsNoFilter,
	productById,
	update,
	like,
	unlike,
	comment,
	uncomment,
	viewsByUser,
	viewsCounter,
	read,
	productStar,
	listBySearch,
	listSearch,
} = require("../controllers/product");

router.post(
	"/product/create/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	create
);
router.put(
	"/product/:productId/:userId",
	requireSignin,
	isAuth,
	isStoreOwner,
	update
);

router.post("/products/by/search", listBySearch);
router.get("/products/search", listSearch);

router.get("/products/:userId", listProductsNoFilter);
router.get("/product/:productId", read);
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
router.put("/product/star/:productId/:userId", requireSignin, productStar);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
