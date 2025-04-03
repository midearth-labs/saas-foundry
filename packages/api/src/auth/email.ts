import * as dotenv from 'dotenv';
import path from 'path';
import { Resend } from 'resend';
import { Email } from '../api/schema/common';


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fire the actual verification email legitimately (like for real).
 * @param email - The email address to send the verification email to.
 * @param token - The token to include in the verification email.
 * @param url - The URL to include in the verification email.
 * @param subject - The subject of the verification email.
 * @param text - Instructional message included in the verification email.
 */
export const fireActualVerificationEmail = async function({
    email,
    token,
    url,
    subject = 'Verify your email',
}: {
    email: string,
    token: string,
    url: string,
    subject?: string,
}) {
    return resend.emails.send({
        from: Email.parse(process.env.EMAIL_FROM),
        to: email,
        subject,
        html: `<p>${token}</p><p>Click the link below to verify your email:</p><a href="${url}">${url}</a>`,
    });
}

/**
 * Adapter function for sending verification emails.
 * @param email - The email address to send the verification email to.
 * @param token - The token to include in the verification email.
 * @param url - The URL to include in the verification email.
 * @param subject - The subject of the verification email.
 * @param text - Instructional message included in the verification email.
 * @param request - The request object.
 */
export const sendVerificationEmailAdapter = async function({
    email,
    token,
    url,
    subject = 'Verify your email',
    text,
    request
}: {
    email: string,
    token: string,
    url: string,
    subject?: string,
    text?: string,
    request?: Request,
}) {
    console.info(`Sending verification email to ${email} with \n\t token: ${token} \n\t url: ${url}`);
    // return await fireActualVerificationEmail({ email, token, url, subject });
}
