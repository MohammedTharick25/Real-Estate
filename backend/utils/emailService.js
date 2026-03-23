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
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 30px; background-color: #2563eb;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">ESTATERA</h1>
              </td>
            </tr>
            <!-- Image -->
            <tr>
              <td>
                <img src="${propertyImage.replace("http://", "https://")}" 
                     alt="${propertyTitle}" 
                     width="600" 
                     style="display: block; width: 600px; height: 350px; object-fit: cover; border: 0;" />
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="color: #1e293b; font-size: 22px; margin: 0 0 10px 0;">${propertyTitle}</h2>
                <p style="color: #2563eb; font-size: 26px; font-weight: bold; margin: 0;">${propertyPrice}</p>
                <p style="color: #64748b; font-size: 16px; margin: 10px 0 30px 0;">📍 ${property.location}</p>
                
                <div style="text-align: center;">
                  <a href="${frontendUrl}/property/${property._id}" 
                     style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                     View Full Details
                  </a>
                </div>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 20px; background-color: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9;">
                © ${new Date().getFullYear()} Estatera Real Estate. All rights reserved.<br>
                Chennai, India.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
