import nodemailer from 'nodemailer'

// Dynamic mail transporter builder
const getTransporter = async () => {
    // Check if SMTP environment variables are defined
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log("Using production SMTP transporter...")
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    // Dynamic test SMTP server fallback for warning-free local executions
    console.log("No SMTP credentials. Building Ethereal Test Mail account...")
    try {
        const testAccount = await nodemailer.createTestAccount()
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        })
    } catch (err) {
        console.warn("Failed to create test SMTP account, falling back to mock logger:", err.message)
        return {
            sendMail: async (mailOptions) => {
                console.log("=== MOCK EMAIL SENT ===")
                console.log("To:", mailOptions.to)
                console.log("Subject:", mailOptions.subject)
                console.log("Body Snippet:", mailOptions.html.slice(0, 100))
                console.log("=======================")
                return { messageId: 'mock-id-' + Date.now() }
            }
        }
    }
}

export const sendNewsletterEmail = async (recipientEmail) => {
    try {
        const transporter = await getTransporter()
        
        const mailOptions = {
            from: '"TeesX" <teesx.shop@gmail.com>',
            to: recipientEmail,
            subject: 'WELCOME TO THE CORE LIST | TEESX OPERATIONS',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>WELCOME TO THE CORE</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #02060d; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #02060d; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #050b14; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                    <!-- Header -->
                                    <tr>
                                        <td align="center" style="padding: 40px 40px 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                            <div style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #ffffff; font-style: italic;">
                                                TEES<span style="color: #22c55e;">X</span>
                                            </div>
                                            <span style="font-size: 8px; color: #22c55e; font-weight: bold; tracking-widest: 2px; text-transform: uppercase; display: block; margin-top: 4px;">Official Operations Center</span>
                                        </td>
                                    </tr>
                                    
                                    <!-- Body -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <h1 style="color: #22c55e; font-size: 20px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: 1.5px; margin: 0 0 20px 0;">
                                                Welcome to the Core List
                                            </h1>
                                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
                                                Your connection is established. You have successfully subscribed to the secure list to receive early access codes, exclusive variant leaks, and flash collection updates before the public drop.
                                            </p>
                                            
                                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 30px 0;">
                                                Connect with other champions and witness the premium design leaks directly on our official Instagram page.
                                            </p>
                                            
                                            <!-- Button Link -->
                                            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 10px auto;">
                                                <tr>
                                                    <td align="center" bgcolor="#22c55e" style="border-radius: 12px;">
                                                        <a href="https://www.instagram.com/teesx.shop/" target="_blank" style="padding: 14px 28px; display: inline-block; font-size: 11px; font-weight: 900; color: #000000; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                                                            Follow TeesX on Instagram ➔
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td align="center" style="padding: 30px; background-color: #02060d; border-top: 1px solid rgba(255,255,255,0.05);">
                                            <p style="margin: 0; color: #6b7280; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                                                © 2026 TEESX OPERATIONS. All cybernetic assets protected.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        }

        const info = await transporter.sendMail(mailOptions)
        console.log(`Newsletter Welcome Email successfully dispatched to ${recipientEmail}! Message ID: ${info.messageId}`)
        
        // If Ethereal test account is being used, log the preview URL for testing!
        if (nodemailer.getTestMessageUrl) {
            const previewUrl = nodemailer.getTestMessageUrl(info)
            console.log(`Preview Test Email URL: ${previewUrl}`)
        }
        
        return { success: true, messageId: info.messageId }
    } catch (err) {
        console.error("Failed to send newsletter welcome email:", err.message)
        throw err
    }
}
