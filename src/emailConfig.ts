/**
 * EmailJS configuration for sending real email notifications.
 *
 * SETUP (one-time, ~5 minutes):
 * 1. Sign up free at https://www.emailjs.com/ (200 emails/month free)
 * 2. Add an Email Service (e.g. connect your Gmail) -> copy the Service ID
 * 3. Create an Email Template with these variables:
 *      {{to_email}}, {{applicant_name}}, {{applicant_email}},
 *      {{loan_purpose}}, {{loan_amount}}, {{repayment_period}},
 *      {{existing_lender}}, {{submitted_at}}
 *    -> copy the Template ID
 * 4. Go to Account -> API Keys -> copy the Public Key
 * 5. Paste the three values below and redeploy.
 */
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'YOUR_SERVICE_ID',
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID',
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY',
};

/** True once real EmailJS credentials have been filled in above. */
export const isEmailConfigured = () =>
  !EMAILJS_CONFIG.SERVICE_ID.startsWith('YOUR_') &&
  !EMAILJS_CONFIG.TEMPLATE_ID.startsWith('YOUR_') &&
  !EMAILJS_CONFIG.PUBLIC_KEY.startsWith('YOUR_');
