const axios = require("axios");

console.log("⚡ Brevo API Service (Direct) initialized.");

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0)
    return console.log("⚠️ No users to notify.");

  // Data preparation
  const propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  const propertyTitle = property.title || "Exclusive New Listing";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";
  const frontendUrl =
    process.env.FRONTEND_URL || "https://estatera.onrender.com";

  // World-Class Email Template
  const htmlTemplate = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
      <div style="background: #2563eb; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 3px; font-weight: 900;">ESTATERA</h1>
        <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Luxury Living Redefined</p>
      </div>
      <div style="width: 100%; height: 320px; overflow: hidden;">
        <img src="${propertyImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="Property Image" />
      </div>
      <div style="padding: 40px;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase;">New Listing</span>
        </div>
        <h2 style="color: #1e293b; font-size: 26px; font-weight: 800; margin: 0 0 10px 0; line-height: 1.2;">${propertyTitle}</h2>
        <p style="color: #2563eb; font-size: 28px; font-weight: 900; margin: 0 0 10px 0;">${propertyPrice}</p>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 30px; display: flex; align-items: center;">📍 ${property.location}</p>
        
        <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
          <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;">${property.description?.substring(0, 160)}...</p>
        </div>

        <div style="text-align: center;">
          <a href="${frontendUrl}/property/${property._id}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 18px 40px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
             Explore This Property
          </a>
        </div>
      </div>
      <div style="background: #f1f5f9; padding: 25px; text-align: center; color: #94a3b8; font-size: 11px;">
        <p style="margin: 0 0 10px 0;">You are receiving this because you subscribed to Estatera Property Alerts.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Estatera Real Estate Group. All rights reserved.</p>
      </div>
    </div>
  `;

  // We send individual emails to ensure personalized "To" fields
  const emailPromises = users.map((user) => {
    return axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Estatera Luxury", email: "estatera.team@gmail.com" },
        to: [{ email: user.email, name: user.name }],
        subject: `✨ Exclusive New Property: ${propertyTitle}`,
        htmlContent: htmlTemplate,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
  });

  try {
    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    console.log(
      `✅ ${successCount}/${users.length} Emails successfully dispatched via Brevo API.`,
    );
  } catch (error) {
    console.error(
      "❌ Critical Mailer API Error:",
      error.response?.data || error.message,
    );
  }
};

module.exports = { sendPropertyAlert };
