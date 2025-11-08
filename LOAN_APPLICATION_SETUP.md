# Loan Application Email Notification Setup Guide

## Current Implementation (MVP)

The loan application form is now fully functional and saves applications to Firestore. The email notification system has a placeholder implementation in `emailService.ts` that logs to the console.

### Files Created/Modified:
- **`src/LoanApplicationForm.tsx`** - Complete form component with modal UI
- **`src/emailService.ts`** - Email service with template generator
- **`src/RoyalBank.tsx`** - Updated with form integration and Apply button handler

---

## How to Upgrade Email Notifications

Choose one of the following methods based on your infrastructure:

### Option 1: Firebase Cloud Functions (Recommended)

1. **Install Firebase Functions CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

2. **Create Cloud Function (`functions/src/index.ts`):**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Configure your email service
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendLoanApplicationEmail = functions.firestore
  .document('loanApplications/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'mshanir@gmail.com',
      subject: `New Loan Application from ${data.fullName}`,
      html: generateEmailHTML(data)
    };
    
    return transporter.sendMail(mailOptions)
      .then(() => console.log('Email sent'))
      .catch((error) => console.log('Email failed:', error));
  });

function generateEmailHTML(data: any): string {
  // Use the template from emailService.ts
  return `...`;
}
```

3. **Deploy:**
```bash
firebase deploy --only functions
```

4. **Update `emailService.ts`:**
Remove the placeholder and add actual API call if needed.

---

### Option 2: SendGrid API

1. **Install SendGrid:**
```bash
npm install @sendgrid/mail
```

2. **Update `emailService.ts`:**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY || '');

export const sendLoanApplicationEmail = async (data: LoanApplicationData) => {
  try {
    const msg = {
      to: 'mshanir@gmail.com',
      from: 'noreply@ashramamvibes.com',
      subject: `New Loan Application from ${data.fullName}`,
      html: generateLoanEmailHTML(data)
    };

    await sgMail.send(msg);
    console.log('Email sent via SendGrid');
  } catch (error) {
    console.error('SendGrid error:', error);
  }
};
```

3. **Add to `.env.local`:**
```
REACT_APP_SENDGRID_API_KEY=your_api_key_here
```

---

### Option 3: Backend API Endpoint

1. **Create Node.js/Express backend endpoint:**
```javascript
app.post('/api/send-loan-email', async (req, res) => {
  const { fullName, purposeOfLoan, amount, applicantEmail } = req.body;
  
  // Use Nodemailer, SendGrid, or other service
  // Send to mshanir@gmail.com
  
  res.json({ success: true });
});
```

2. **Update `emailService.ts`:**
```typescript
export const sendLoanApplicationEmail = async (data: LoanApplicationData) => {
  const response = await fetch('/api/send-loan-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to send email');
};
```

---

### Option 4: Nodemailer with Gmail

1. **Install Nodemailer:**
```bash
npm install nodemailer
```

2. **For backend implementation in a Node.js server:**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use App-Specific Password
  }
});

// Send email when form is submitted
transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'mshanir@gmail.com',
  subject: `New Loan Application from ${data.fullName}`,
  html: generateLoanEmailHTML(data)
});
```

---

## Current Firestore Structure

Loan applications are saved in Firestore collection `loanApplications`:

```
Collection: loanApplications
├── Document: auto-generated ID
│   ├── fullName: string
│   ├── purposeOfLoan: string
│   ├── repaymentPeriod: string
│   ├── amount: string
│   ├── existingLender: string
│   ├── applicantEmail: string
│   ├── submittedAt: Timestamp
│   └── status: "pending" | "approved" | "rejected"
```

---

## Testing the Form Locally

1. Start development server:
```bash
npm start
```

2. Navigate to: `http://localhost:3000/royal-bank`

3. Click "Apply Now" button to open the form

4. Fill in the form and submit

5. Check browser console for logs showing successful Firestore save

---

## Next Steps for Enhancement

- [ ] Add admin dashboard to view and manage loan applications
- [ ] Add status updates (pending → approved/rejected)
- [ ] Send confirmation email to applicant
- [ ] Add SMS notifications
- [ ] Add application approval/rejection workflow
- [ ] Store email logs for audit trail
- [ ] Add application status tracking for user view

---

## Environment Variables Needed (when upgrading)

Add to your `.env.local` or hosting environment:

```
REACT_APP_SENDGRID_API_KEY=your_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
DATABASE_URL=your_backend_url
```

---

## Support

For questions or issues with the loan application form, refer to the implementation in:
- Form UI: `src/LoanApplicationForm.tsx`
- Email templates: `src/emailService.ts`
- Integration point: `src/RoyalBank.tsx` (lines 340-390)
