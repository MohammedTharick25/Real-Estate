const axios = require("axios");

const sendPropertyAlert = async (users, property) => {
  if (!users || users.length === 0) return;

  const propertyImage =
    property.images?.[0] || "https://estatera.onrender.com/og-image.png";
  const propertyTitle = property.title || "Exclusive Listing";
  const propertyPrice = property.price
    ? `₹${property.price.toLocaleString()}`
    : "Price on Request";
  const frontendUrl =
    process.env.FRONTEND_URL || "https://estatera.onrender.com";

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background: #2563eb; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0;">ESTATERA</h1>
      </div>
      <img src="${propertyImage}" width="600" style="width: 100%; display: block;" />
      <div style="padding: 30px;">
        <h2>${propertyTitle}</h2>
        <p style="color: #2563eb; font-size: 24px; font-weight: bold;">${propertyPrice}</p>
        <p>📍 ${property.location}</p>
        <a href="${frontendUrl}/property/${property._id}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; display: inline-block; margin-top: 20px; font-weight: bold;">View Details</a>
      </div>
    </div>
  `;

  const emailPromises = users.map((user) => {
    return axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Estatera Luxury", email: "estatera.team@gmail.com" }, // 🛡️ MUST BE VERIFIED IN BREVO
        to: [{ email: user.email, name: user.name || "Valued Member" }],
        subject: `✨ New Luxury Property: ${propertyTitle}`,
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
  });

  const results = await Promise.allSettled(emailPromises);

  // 🕵️ SUPER DEBUGGER: This will tell us EXACTLY why it says 0/3
  results.forEach((res, i) => {
    if (res.status === "fulfilled") {
      console.log(`✅ Success: Email sent to ${users[i].email}`);
    } else {
      console.error(`❌ REJECTED for ${users[i].email}:`);
      // Logs the specific error from Brevo (e.g., 'unauthorized', 'quota_exceeded', etc.)
      console.error("Reason:", res.reason.response?.data || res.reason.message);
    }
  });

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  console.log(
    `📊 Final Result: ${successCount}/${users.length} emails delivered.`,
  );
};

module.exports = { sendPropertyAlert };
