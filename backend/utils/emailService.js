const Brevo = require("@getbrevo/brevo");

// 🚀 WORLD CLASS BREVO CONFIGURATION
const apiInstance = new Brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_API_KEY;

console.log("⚡ Brevo API Service initialized.");

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0)
    return console.log("⚠️ No users to notify.");

  const propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  const propertyTitle = property.title || "Exclusive New Listing";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";

  const emailPromises = users.map((user) => {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = `✨ New Luxury Property: ${propertyTitle}`;
    sendSmtpEmail.htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
        <div style="background: #2563eb; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ESTATERA</h1>
        </div>
        <img src="${propertyImage}" style="width: 100%; height: 300px; object-fit: cover;" />
        <div style="padding: 40px;">
          <h2 style="color: #1e293b;">${propertyTitle}</h2>
          <p style="color: #2563eb; font-size: 22px; font-weight: 800;">${propertyPrice}</p>
          <p style="color: #64748b;">📍 ${property.location}</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/property/${property._id}" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold;">
               View Full Details
            </a>
          </div>
        </div>
      </div>`;

    // 🛡️ SENDER: Use your verified Brevo email here
    sendSmtpEmail.sender = {
      name: "Estatera Luxury",
      email: "estatera.team@gmail.com",
    };
    sendSmtpEmail.to = [{ email: user.email, name: user.name }];

    return apiInstance.sendTransacEmail(sendSmtpEmail);
  });

  return Promise.allSettled(emailPromises);
};

module.exports = { sendPropertyAlert };
