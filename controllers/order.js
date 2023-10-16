/** @format */

const { Order } = require("../models/order");
// const fs = require("fs");
const _ = require("lodash");
// sendgrid for email npm i @sendgrid/mail
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// pathToAttachment = `${__dirname}/Logo.jpg`;
// attachment = fs.readFileSync(pathToAttachment).toString("base64");

// var imaage = `${__dirname}/Logo.jpg`;
// var bitmap = fs.readFileSync(imaage);
// data_base64 = new Buffer.from(bitmap).toString("base64");

// const ahmed1 = "ahmed.abdelrazak@puristiclyf.com";
const ahmed2 = "ahmedabdelrazzak1001010@gmail.com";

const BusinessName = "Bukisha Mobile Store";
const BusinessWebsite = "https://bukisha.infinite-apps.com/";
const fromEmail = "noreply@infinite-apps.com";
const defaultEmail = "Bukisha.Store@gmail.com";
// const phoneNumber1 = "+13372881836";
const phoneNumber2 = "60654676";
const phoneNumber3 = "65533836";
const shopAddress = "123 main street, LA, CA";
const shopLogo =
	"https://res.cloudinary.com/infiniteapps/image/upload/v1640714861/KuwaitDemo/1640714860747.jpg";

exports.orderById = (req, res, next, id) => {
	Order.findById(id)
		.populate(
			"products.product",
			"productName price priceAfterDiscount productSKU description1"
		)
		.populate("user", "_id name email")
		.exec((err, order) => {
			if (err || !order) {
				return res.status(400).json({
					error: console.log("Error Getting OrderbyId"),
				});
			}
			req.order = order;
			next();
		});
};

exports.create = (req, res) => {
	// console.log("CREATE ORDER: ", req.body);
	req.body.order.user = req.profile;
	const order = new Order(req.body.order);
	order.save((error, data) => {
		if (error) {
			return res.status(400).json({
				error: "Error Creating AN Order",
			});
		}

		res.json(data);

		const FormSubmittionEmail = {
			to: order.email,
			from: fromEmail,
			subject: `${BusinessName} - Order Confirmation`,
			html: `
      <html>
      <head>
        <title></title>
            
      </head>
      <body style=margin-left:20px;margin-right:20px;margin-top:50px;background:#f2f2f2;border-radius:20px;padding:50px;>
       <div >
          Hi ,
          <br />
          <br />
            <div>Thank you for choosing <a href=${BusinessWebsite}> ${BusinessName}</a>.</div>
            <h4> Here is a summary of your order: </h4>
			<h5>Address: ${order.address}</h5>
			<h5>Phone: ${order.phone}</h5>
			<h5>Products Count: ${order.products.length}</h5>
			<br />
			<br />
             For urgent issues please check our <a href=${BusinessWebsite}> Contacting Details Here</a>.
			 <br />
			 <br />
             Kind and Best Regards,  <br />
						 ${BusinessName} support team <br />
						 Contact Email: ${defaultEmail} <br />
						 Phone#: ${phoneNumber3} <br />
						 Landline#: ${phoneNumber2} <br />
						 Address:  ${shopAddress}  <br />
						 <br />
						 &nbsp;&nbsp; <img src=${shopLogo} alt=${BusinessName} style="height:100px;width:200px;object-fit:cover;border-radius:15px"  />
						 <br />
						 <p>
						 <strong>${BusinessName}</strong>
						  </p>
						  </div>
    </body>
  </html>
        `,
		};
		sgMail.send(FormSubmittionEmail);
	});
};

exports.createGuest = (req, res) => {
	// console.log("CREATE ORDER: ", req.body);
	req.body.order.user = req.profile;
	const order = new Order(req.body.order);
	order.save((error, data) => {
		if (error) {
			return res.status(400).json({
				error: "Error Creating AN Order",
			});
		}

		res.json(data);
	});
};

exports.listOrders = (req, res) => {
	Order.find()
		.populate("user", "_id name email address supplier SKU")
		.sort("-created")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: "Error Listing all Orders",
				});
			}
			res.json(orders);
		});
};

exports.listOrders = (req, res) => {
	Order.find()
		.populate("user", "_id name email address supplier SKU")
		.sort("-created")
		.exec((err, orders) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(error),
				});
			}
			res.json(orders);
		});
};

exports.getStatusValues = (req, res) => {
	res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
	Order.update(
		{ _id: req.body.orderId },
		{ $set: { status: req.body.status } },
		(err, order) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err),
				});
			}

			const emailData3 = {
				to: req.order.user.email,
				from: "noreply@onlinestore.com",
				subject: `Your order status`,
				html: `<div>Hi ${req.order.user.name}, </div>
        <br />
        <p>There is an update to your order.</p>
        <br />
              <h4>Order status: ${req.body.status}</h4>

              Once we have another update, we will let you know.

              <h4> <div>Thank you for shopping with <a href="www.onlinestore.com/all-products"> Online Store</a>.</div><h4/>

              Kind and Best Regards,  <br />
              Online Store support team <br />
              Contact Email: info@onlinestore.com <br />
              Phone#: (951) 222-3322 <br />
              Landline#: (951) 999-3311 <br />
              Address:  123 main street, LA, CA.  <br />
             &nbsp;&nbsp;<img src="https://onlinestore.com/api/product/photo5/5efff6005275b89938abe066" alt="OnlineStore" style=width:50px; height:50px />
              <p>
              <strong>Online Store LLC.</strong>  
              </p>

        `,
			};

			sgMail.send(emailData3);
			res.json(order);

			const emailData4 = {
				to: "Rudy.Hernandez@onlinestore.com",
				cc: ahmed1,
				bcc: [marlene],
				from: "noreply@onlinestore.com",
				subject: `Order Status Changed`,
				html: `<h5>Hello Sales Team - </h5> 
                A status for order ${req.body.orderId} was changed.
              <h4> Current Order Status: ${req.body.status}</h4> 

              <div>
              Please if you didn't do those changes, contact the user with the info below and explain the inconvenience:
              <li>User Name: ${req.order.user.name}</li>
              <li>User Email: ${req.order.user.email}</li><br />

               or login into your dashbord and change the status.
              <br />
              If the changes were correct, please don't forget to send an email to the user, to let him/her know of the changes.
              </div>
              <br />
              Kind and Best Regards,  <br />
              Online Store support team <br />
              Contact Email: info@onlinestore.com <br />
              Phone#: (951) 222-3322 <br />
              Landline#: (951) 999-3311 <br />
              Address:  123 main street, LA, CA.  <br />
             &nbsp;&nbsp;<img src="https://onlinestore.com/api/product/photo5/5efff6005275b89938abe066" alt="OnlineStore" style=width:50px; height:50px />
              <p>
              <strong>Online Store LLC.</strong>  
              </p>
        
        
        `,
			};

			sgMail.send(emailData4);
		}
	);
};

exports.read = (req, res) => {
	return res.json(req.order);
};
