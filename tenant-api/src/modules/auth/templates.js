/**
 * Email templates for tenant authentication flows
 */

/**
 * Password reset request email template
 * @param {Object} params - Template parameters
 * @param {string} params.otp - 6-digit OTP code
 * @param {number} params.ttlMinutes - OTP expiry time in minutes
 * @returns {Object} Email content with text and html
 */
export function passwordResetEmail({ otp, ttlMinutes = 10 }) {
    return {
        subject: 'Freight CRM Password Reset',
        text: [
            'You recently requested to reset your Freight CRM account password.',
            '',
            `Your verification code: ${otp}`,
            `This code expires in ${ttlMinutes} minutes.`,
            '',
            'If you did not request this change, you can safely ignore this email.'
        ].join('\n'),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You recently requested to reset your Freight CRM account password.</p>
                <p><strong>Your verification code:</strong></p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This code expires in ${ttlMinutes} minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request this change, you can safely ignore this email.</p>
            </div>
        `
    };
}

/**
 * Password reset resend email template
 * @param {Object} params - Template parameters
 * @param {string} params.otp - 6-digit OTP code
 * @param {number} params.ttlMinutes - OTP expiry time in minutes
 * @returns {Object} Email content with text and html
 */
export function passwordResetResendEmail({ otp, ttlMinutes = 10 }) {
    return {
        subject: 'Freight CRM Password Reset Code',
        text: [
            'You requested a new verification code for your Freight CRM account.',
            '',
            `Your verification code: ${otp}`,
            `This code expires in ${ttlMinutes} minutes.`,
            '',
            'If you did not request this change, you can safely ignore this email.'
        ].join('\n'),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">New Verification Code</h2>
                <p>You requested a new verification code for your Freight CRM account.</p>
                <p><strong>Your verification code:</strong></p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This code expires in ${ttlMinutes} minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request this change, you can safely ignore this email.</p>
            </div>
        `
    };
}

/**
 * Email verification OTP template
 * @param {Object} params - Template parameters
 * @param {string} params.otp - 6-digit OTP code
 * @param {number} params.ttlMinutes - OTP expiry time in minutes
 * @param {string} params.email - Email address being verified
 * @returns {Object} Email content with text and html
 */
export function emailVerificationOtpEmail({ otp, ttlMinutes = 10, email }) {
    return {
        subject: 'Verify Your Email Address - Freight CRM',
        text: [
            'Please verify your email address to complete your Freight CRM account setup.',
            '',
            `Email to verify: ${email}`,
            '',
            `Your verification code: ${otp}`,
            `This code expires in ${ttlMinutes} minutes.`,
            '',
            'If you did not create an account, you can safely ignore this email.'
        ].join('\n'),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Verify Your Email Address</h2>
                <p>Please verify your email address to complete your Freight CRM account setup.</p>
                <p><strong>Email to verify:</strong> ${email}</p>
                <p><strong>Your verification code:</strong></p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This code expires in ${ttlMinutes} minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not create an account, you can safely ignore this email.</p>
            </div>
        `
    };
}

/**
 * Email verification resend OTP template
 * @param {Object} params - Template parameters
 * @param {string} params.otp - 6-digit OTP code
 * @param {number} params.ttlMinutes - OTP expiry time in minutes
 * @param {string} params.email - Email address being verified
 * @returns {Object} Email content with text and html
 */
export function emailVerificationResendOtpEmail({ otp, ttlMinutes = 10, email }) {
    return {
        subject: 'New Verification Code - Freight CRM',
        text: [
            'You requested a new verification code for your email address.',
            '',
            `Email to verify: ${email}`,
            '',
            `Your verification code: ${otp}`,
            `This code expires in ${ttlMinutes} minutes.`,
            '',
            'If you did not request this code, you can safely ignore this email.'
        ].join('\n'),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">New Verification Code</h2>
                <p>You requested a new verification code for your email address.</p>
                <p><strong>Email to verify:</strong> ${email}</p>
                <p><strong>Your verification code:</strong></p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This code expires in ${ttlMinutes} minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request this code, you can safely ignore this email.</p>
            </div>
        `
    };
}

