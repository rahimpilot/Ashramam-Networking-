/**
 * Email Notification Service
 * Sends real emails via EmailJS (free tier: 200 emails/month).
 * Configure credentials in src/emailConfig.ts — until then, falls back
 * to console logging so loan applications still succeed.
 */

import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, isEmailConfigured } from './emailConfig';

interface LoanApplicationData {
  fullName: string;
  purposeOfLoan: string;
  repaymentPeriod: string;
  amount: string;
  existingLender: string;
  applicantEmail: string;
  submittedAt: string;
}

const ADMIN_EMAIL = 'raimu456@gmail.com';

/**
 * Send email notification for a new loan application.
 * Uses EmailJS when configured; otherwise logs to console.
 */
export const sendLoanApplicationEmail = async (applicationData: LoanApplicationData): Promise<void> => {
  try {
    if (!isEmailConfigured()) {
      console.log('EmailJS not configured — logging loan application instead.');
      console.log('Application Data:', applicationData);
      console.log(`📧 Email would be sent to: ${ADMIN_EMAIL}`);
      console.log(`From applicant: ${applicationData.applicantEmail}`);
      return;
    }

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email: ADMIN_EMAIL,
        applicant_name: applicationData.fullName,
        applicant_email: applicationData.applicantEmail,
        loan_purpose: applicationData.purposeOfLoan,
        loan_amount: applicationData.amount,
        repayment_period: applicationData.repaymentPeriod,
        existing_lender: applicationData.existingLender,
        submitted_at: applicationData.submittedAt,
      },
      { publicKey: EMAILJS_CONFIG.PUBLIC_KEY }
    );

    console.log(`📧 Loan application email sent to ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - let the application submission succeed even if email fails
  }
};

/**
 * Generate HTML email template for loan application
 * Can be customized with branding, logo, etc.
 */
export const generateLoanEmailHTML = (data: LoanApplicationData): string => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f5f5f5; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; margin-top: 5px; }
          .footer { background-color: #e5e7eb; padding: 10px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 New Loan Application Received</h1>
            <p>A new loan application has been submitted through the Ashramam Royal Bank portal.</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">📝 Full Name:</div>
              <div class="value">${data.fullName}</div>
            </div>
            
            <div class="field">
              <div class="label">🎯 Purpose of Loan:</div>
              <div class="value">${data.purposeOfLoan}</div>
            </div>
            
            <div class="field">
              <div class="label">⏰ Repayment Period:</div>
              <div class="value">${data.repaymentPeriod}</div>
            </div>
            
            <div class="field">
              <div class="label">💰 Amount Requested:</div>
              <div class="value">${data.amount}</div>
            </div>
            
            <div class="field">
              <div class="label">🏦 Existing Lender:</div>
              <div class="value">${data.existingLender || 'Not specified'}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Applicant Email:</div>
              <div class="value">${data.applicantEmail}</div>
            </div>
            
            <div class="field">
              <div class="label">📅 Submission Date:</div>
              <div class="value">${new Date(data.submittedAt).toLocaleString()}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from Ashramam Royal Bank Portal</p>
            <p>Please do not reply to this email. Contact the applicant directly at ${data.applicantEmail}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
