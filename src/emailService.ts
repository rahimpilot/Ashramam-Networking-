/**
 * Email Notification Service
 * This file handles sending email notifications for loan applications
 * For now, it uses a simple backend service. Later this can be upgraded to Firebase Cloud Functions
 */

interface LoanApplicationData {
  fullName: string;
  purposeOfLoan: string;
  repaymentPeriod: string;
  amount: string;
  existingLender: string;
  applicantEmail: string;
  submittedAt: string;
}

const ADMIN_EMAIL = 'mshanir@gmail.com';

/**
 * Send email notification for loan application
 * Currently logs to console - will be replaced with actual email service
 * TODO: Integrate with Firebase Cloud Functions or Nodemailer
 */
export const sendLoanApplicationEmail = async (applicationData: LoanApplicationData): Promise<void> => {
  try {
    console.log('Attempting to send email notification...');
    console.log('Application Data:', applicationData);

    // For MVP, we'll log to console
    // This can later be replaced with:
    // 1. Firebase Cloud Functions
    // 2. SendGrid API
    // 3. Nodemailer backend service
    // 4. AWS SES
    // 5. Any other email service

    console.log(`📧 Email would be sent to: ${ADMIN_EMAIL}`);
    console.log(`From applicant: ${applicationData.applicantEmail}`);

    // TODO: Implement actual email sending
    // const response = await fetch('/api/send-loan-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(applicationData)
    // });
    // if (!response.ok) throw new Error('Failed to send email');

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
