/** @format */

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
const cron = require("node-cron");
const { scheduler } = require("./SMSReminder");
const { generateSitemap } = require("./routes/sitemap");

require("dotenv").config();
// app
const app = express();

//db
mongoose.set("strictQuery", false);
mongoose
	.connect(process.env.DATABASE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongodAtlas is connected"));

// mongoose.connect(process.env.DATABASE,
// 	err => {
// 		if(err) throw err;
// 		console.log("MongodAtlas is connected")
// 	});

// middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb" }));
// app.use(express.json());

//routes middlewares
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

const port = process.env.PORT || 8050;

cron.schedule("0 */15 * * * *", scheduler);

// Schedule the sitemap generation every 7 days
cron.schedule("0 0 0 */7 * *", () => {
	generateSitemap(null, null);
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
