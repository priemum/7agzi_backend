/** @format */

const ContactUs = require("../models/contactusForm");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const BarbershopName = "Hair Salon";
const BarbershopWebsite = "http://hairsalondemo.infinite-apps.com/";
const userDashboardLink = "http://hairsalondemo.infinite-apps.com/dashboard";
const contactusPageLink = "http://hairsalondemo.infinite-apps.com/contact";
const supportEmail = "info@hair-salon.com";
const fromEmail = "noreply@infinite-apps.com";
const defaultEmail = "ahmed.abdelrazak@infinite-apps.com";
const phoneNumber1 = "(999) 222-1111";
const phoneNumber2 = "(999) 222-3322";
const shopAddress = "123 main street, LA, CA";
const shopLogo =
	"https://res.cloudinary.com/infiniteapps/image/upload/v1634425351/Hairsalon/logo_p62voj.png";

exports.contactForm = (req, res) => {
	const Form = new ContactUs(req.body);
	console.log(req.body);
	Form.save((err, form) => {
		if (err) {
			return res.status(400).json({
				// error: errorHandler(err)
				error: "Not Complete Form, Please fill in empty fields",
			});
		}
		res.json({
			form,
		});

		const FormSubmittionEmail = {
			to: form.email,
			from: fromEmail,
			subject: `${BarbershopName}- Confirmation`,
			html: `
      <html>
      <head>
        <title></title>
            
      </head>
      <body style=margin-left:20px;margin-right:20px;margin-top:50px;background:#f2f2f2;border-radius:20px;padding:50px;>
       <div >
          Hi ${form.name},
          <br />
          <br />
            <div>Thank you for contacting <a href=${BarbershopWebsite}> ${BarbershopName}</a>.</div>
            <h4> Our support team will respond within the next 24 hours.
            </h4>
             For urgent issues please check our <a href="${contactusPageLink}> Contacting Details Here</a>.
             <br />
             <br />
             Kind and Best Regards,  <br />
						 ${BarbershopName} support team <br />
						 Contact Email: ${supportEmail} <br />
						 Phone#: ${phoneNumber1} <br />
						 Landline#: ${phoneNumber2} <br />
						 Address:  ${shopAddress}  <br />
						 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
						 <br />
						 <p>
						 <strong>${BarbershopName}</strong>
						  </p>
						  </div>
    </body>
  </html>
        `,
		};
		sgMail.send(FormSubmittionEmail);

		const InquiryFromCustomer = {
			to: defaultEmail,
			from: fromEmail,
			subject: `${BarbershopName} - Inquiry From a customer - (Name: ${form.name})`,
			html: `
      <html>
      <head>
        <title></title>
            
      </head>
      <body style=margin-left:20px;margin-right:20px;margin-top:50px;background:#f2f2f2;border-radius:20px;padding:50px;>
       <div >
          Hi Team,
          <br />
          <br />
            <div>You have just received an inquiry from a customer who used  <a href=${contactusPageLink}> this link</a>, please make sure that you respond ASAP! </div>
            <p>
                <h3>Here is the inquiry details: </h3>
                &nbsp;&nbsp; <strong>Name </strong>:${form.name}<br />
                &nbsp;&nbsp; <strong>Email </strong>:${form.email}<br />
                &nbsp;&nbsp; <strong>Subject </strong>:${form.subject}<br />
                &nbsp;&nbsp; <strong>Inquiry/Message </strong>:${form.text}<br />
            </p>
             <br />
             <br />
             Kind and Best Regards,  <br />
						 ${BarbershopName} support team <br />
						 Contact Email: ${supportEmail} <br />
						 Phone#: ${phoneNumber1} <br />
						 Landline#: ${phoneNumber2} <br />
						 Address:  ${shopAddress}  <br />
						 &nbsp;&nbsp; <img src=${shopLogo} alt=${BarbershopName} style="height:100px;width:100px;"  />
						 <br />
						 <p>
						 <strong>${BarbershopName}</strong>
						  </p>
						  </div>
    </body>
  </html>
              

        `,
		};
		sgMail.send(InquiryFromCustomer);
	});
};
