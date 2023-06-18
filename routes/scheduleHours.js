/** @format */

const express = require("express");
const router = express.Router();
const {requireSignin, isAuth, isAdmin} = require("../controllers/auth");
const {userById} = require("../controllers/user");

const {addHours, list} = require("../controllers/scheduleHours");

router.post("/add-hours/:userId", requireSignin, isAuth, isAdmin, addHours);
router.get("/alladdedhours/:ownerId", list);
// router.get("/alladdedhours", list);

router.param("userId", userById);

module.exports = router;
