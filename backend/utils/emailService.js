const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPropertyAlert = async (users, property) => {
  const emailPromises = users.map((user) => {
    return transporter.sendMail({
      from: `"Estatera Luxury" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✨ New Exclusive Property: ${property.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 2px;">ESTATERA</h1>
            <p style="color: #bfdbfe; margin-top: 5px; font-size: 12px; text-transform: uppercase; font-weight: bold;">Luxury Living Redefined</p>
          </div>

          <!-- Hero Image -->
          <div style="width: 100%; height: 300px; background-image: url('${property.images[0]}'); background-size: cover; background-position: center;"></div>

          <!-- Content -->
          <div style="padding: 40px; background-color: white;">
            <span style="background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Just Listed</span>
            <h2 style="color: #1e293b; font-size: 24px; margin: 15px 0 5px 0;">${property.title}</h2>
            <p style="color: #64748b; font-size: 16px; margin: 0 0 20px 0;">${property.location}</p>
            
            <div style="display: flex; gap: 20px; margin-bottom: 25px; padding: 15px; background-color: #f8fafc; border-radius: 12px;">
              <div style="flex: 1;">
                <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Price</p>
                <p style="margin: 0; color: #2563eb; font-weight: bold; font-size: 18px;">₹${property.price.toLocaleString()}</p>
              </div>
              <div style="flex: 1;">
                <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase;">Size</p>
                <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 18px;">${property.size}</p>
              </div>
            </div>

            <p style="color: #475569; line-height: 1.6; font-size: 15px;">${property.description.substring(0, 150)}...</p>
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="${process.env.FRONTEND_URL}/property/${property._id}" 
                 style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                View Full Listing Details
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 30px; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              You are receiving this because you're a valued member of Estatera.<br>
              © ${new Date().getFullYear()} Estatera Real Estate Group.
            </p>
          </div>
        </div>
      `,
    });
  });

  return Promise.allSettled(emailPromises);
};

module.exports = { sendPropertyAlert };
