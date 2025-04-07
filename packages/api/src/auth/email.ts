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
 * Fire the actual organization invitation email legitimately (like for real).
 * @param email - The email address to send the organization invitation email to.
 * @param url - The URL to include in the organization invitation email.
 * @param inviterName - The name of the inviter.
 * @param inviterEmail - The email address of the inviter.
 * @param orgName - The name of the organization.
 */
export const fireActualOrganizationInvitationEmail = async function({
    email,
    url,
    inviterName,
    inviterEmail,
    orgName,
}: {
    email: string,
    url: string,
    inviterName: string,
    inviterEmail: string,
    orgName: string,
}) {
    return resend.emails.send({
        from: Email.parse(process.env.EMAIL_FROM), // In prod, MUST BE Email.parse(inviterEmail)
        to: email,
        subject: `You've been invited to join ${orgName}`,
        html: `<p>${inviterName} has invited you to join ${orgName}.</p><p>Click the link below to verify your email:</p><a href="${url}">${url}</a>`,
    });
}

/**
 * Adapter function for sending verification emails.
 * @param email - The email address to send the verification email to.
 * @param token - The token to include in the verification email.
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

/**
 * Adapter function for sending organization invitation emails.
 * @param email - The email address to send the organization invitation email to.
 * @param token - The token to include in the organization invitation email.
 * @param url - The URL to include in the organization invitation email.
 */
export const sendOrganizationInvitationEmailAdapter = async function({
    email,
    url,
    inviterName,
    inviterEmail,
    orgName,
}: {
    email: string,
    url: string,
    inviterName: string,
    inviterEmail: string,
    orgName: string,
}) {
    console.info(
        `\nSending organization invitation email to`,
        `\n\t email: ${email}`,
        `\n\t inviterName: ${inviterName}`,
        `\n\t inviterEmail: ${inviterEmail}`,
        `\n\t orgName: ${orgName}`,
        `\n\t url: ${url}`
    );
    // return await fireActualOrganizationInvitationEmail({ email, url, inviterName, inviterEmail, orgName });
}
