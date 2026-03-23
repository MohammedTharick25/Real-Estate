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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        /* Mobile responsive adjustments */
        @media only screen and (max-width: 600px) {
          .inner-table { width: 100% !important; }
          .hero-image { height: 250px !important; }
          .content-padding { padding: 30px 20px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <!-- Pre-header text (Hidden in email but shows in inbox preview) -->
      <div style="display: none; max-height: 0px; overflow: hidden;">
        A new architectural masterpiece has just arrived in ${property.location}. View the private listing details inside.
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
          <td align="center">
            <table class="inner-table" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
              
              <!-- Premium Header -->
              <tr>
                <td align="center" style="padding: 40px 0; background-color: #ffffff;">
                  <h1 style="color: #1e293b; margin: 0; font-size: 22px; letter-spacing: 4px; font-weight: 900;">ESTATERA</h1>
                  <p style="color: #64748b; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Luxury Living Redefined</p>
                </td>
              </tr>

              <!-- Hero Section with Just Listed Badge -->
              <tr>
                <td style="position: relative; background-color: #ffffff;">
                  <img src="${propertyImage.replace("http://", "https://")}" 
                       alt="${propertyTitle}" 
                       width="600" 
                       class="hero-image"
                       style="display: block; width: 600px; height: 380px; object-fit: cover; border: 0;" />
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td class="content-padding" style="padding: 50px 50px 40px 50px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <span style="background-color: #eff6ff; color: #2563eb; padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Exclusive New Entry</span>
                        <h2 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 20px 0 10px 0; line-height: 1.2;">${propertyTitle}</h2>
                        <p style="color: #64748b; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">Located in the prestigious neighborhood of <strong>${property.location}</strong>, this property offers unparalleled elegance and modern design.</p>
                      </td>
                    </tr>
                    
                    <!-- Specs Bar -->
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 16px; margin-bottom: 35px;">
                          <tr>
                            <td style="padding: 20px; text-align: center;">
                              <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: bold; text-transform: uppercase;">Market Value</p>
                              <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 800;">${propertyPrice}</p>
                            </td>
                            <td style="padding: 20px; text-align: center; border-left: 1px solid #e2e8f0;">
                              <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: bold; text-transform: uppercase;">Total Area</p>
                              <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 800;">${property.size}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                      <td align="center">
                        <a href="${frontendUrl}/property/${property._id}" 
                           style="background-color: #2563eb; color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 14px; font-weight: 800; display: inline-block; font-size: 16px; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);">
                           View Full Presentation
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 40px; background-color: #1e293b; text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.8;">
                    You are receiving this exclusive alert because you are a valued member of the Estatera Inner Circle.
                  </p>
                  <div style="margin-top: 20px;">
                    <a href="#" style="color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; margin: 0 10px;">Privacy Policy</a>
                    <a href="#" style="color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; margin: 0 10px;">Unsubscribe</a>
                  </div>
                  <p style="color: #475569; font-size: 10px; margin-top: 30px;">
                    © ${new Date().getFullYear()} Estatera Real Estate Group.<br>
                    Global Headquarters: Chennai, India.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
