const nodemailer = require("nodemailer");

exports.sendOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Clevora" <${process.env.EMAIL_USER || 'noreply@clevora.com'}>`,
      to: email,
      subject: "Kode OTP Verifikasi Clevora Anda",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #3C3489; text-align: center;">Verifikasi Akun Clevora</h2>
          <p>Terima kasih telah mendaftar di Clevora. Gunakan kode OTP di bawah ini untuk memverifikasi dan mengaktifkan akun Anda:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #3C3489;">
            ${otp}
          </div>
          <p>Kode ini berlaku selama 10 menit. Jangan sebarkan kode ini kepada siapa pun.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee;" />
          <p style="font-size: 12px; color: #888888; text-align: center;">Pesan otomatis dari Clevora. Harap jangan membalas email ini.</p>
        </div>
      `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`[OTP] Sent email to ${email}`);
    } else {
      console.log(`\n==========================================\n[OTP EMAIL LOG] (SMTP not configured)\nTo: ${email}\nCode: ${otp}\n==========================================\n`);
    }
    return true;
  } catch (error) {
    console.error(`[OTP Error] Failed to send to ${email}:`, error.message);
    console.log(`\n==========================================\n[OTP FALLBACK LOG]\nTo: ${email}\nCode: ${otp}\n==========================================\n`);
    return false;
  }
};
