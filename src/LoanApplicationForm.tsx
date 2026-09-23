import React, { useState } from 'react';
import { auth, db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { sendLoanApplicationEmail } from './emailService';

interface LoanApplication {
  fullName: string;
  purposeOfLoan: string;
  repaymentPeriod: string;
  amount: string;
  existingLender: string;
}

interface LoanApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<LoanApplication>({
    fullName: '',
    purposeOfLoan: '',
    repaymentPeriod: '',
    amount: '',
    existingLender: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [userEmail, setUserEmail] = useState<string>('');

  // Get current user email
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email || '');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate form
      if (!formData.fullName.trim()) {
        throw new Error('Full Name is required');
      }
      if (!formData.purposeOfLoan.trim()) {
        throw new Error('Purpose of Loan is required');
      }
      if (!formData.repaymentPeriod) {
        throw new Error('Repayment Period is required');
      }
      if (!formData.amount.trim()) {
        throw new Error('Amount is required');
      }

      // Save to Firestore
      const loanApplicationsRef = collection(db, 'loanApplications');
      const docRef = await addDoc(loanApplicationsRef, {
        fullName: formData.fullName,
        purposeOfLoan: formData.purposeOfLoan,
        repaymentPeriod: formData.repaymentPeriod,
        amount: formData.amount,
        existingLender: formData.existingLender,
        applicantEmail: userEmail,
        submittedAt: Timestamp.now(),
        status: 'pending'
      });

      console.log('Loan application saved:', docRef.id);

      // Send email notification
      await sendLoanApplicationEmail({
        fullName: formData.fullName,
        purposeOfLoan: formData.purposeOfLoan,
        repaymentPeriod: formData.repaymentPeriod,
        amount: formData.amount,
        existingLender: formData.existingLender,
        applicantEmail: userEmail,
        submittedAt: new Date().toISOString()
      });

      console.log('Email notification sent/queued to raimu456@gmail.com');

      setMessage('✅ Loan application submitted successfully! We will review and contact you soon.');
      setMessageType('success');

      // Reset form
      setFormData({
        fullName: '',
        purposeOfLoan: '',
        repaymentPeriod: '',
        amount: '',
        existingLender: ''
      });

      // Close form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to submit application'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#fffdf8',
        borderRadius: '12px',
        padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e7ddcc',
          paddingBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: 0,
            color: '#16a34a'
          }}>
            💳 Loan Application
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#7a7264'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2a241c'
            }}>
              📝 Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #d8c9ae',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#d8c9ae'}
            />
          </div>

          {/* Purpose of Loan */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2a241c'
            }}>
              🎯 Purpose of Loan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              name="purposeOfLoan"
              value={formData.purposeOfLoan}
              onChange={handleInputChange}
              placeholder="Describe why you need this loan (e.g., Travel, Medical, Education)"
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #d8c9ae',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                minHeight: '80px',
                resize: 'vertical',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#d8c9ae'}
            />
          </div>

          {/* Repayment Period */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2a241c'
            }}>
              ⏰ Repayment Period <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="repaymentPeriod"
              value={formData.repaymentPeriod}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #d8c9ae',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#d8c9ae'}
            >
              <option value="">Select repayment period...</option>
              <option value="3_months">3 Months</option>
              <option value="6_months">6 Months</option>
              <option value="1_year">1 Year</option>
              <option value="2_years">2 Years</option>
              <option value="3_years">3 Years</option>
              <option value="5_years">5 Years</option>
              <option value="custom">Custom Period</option>
            </select>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2a241c'
            }}>
              💰 Amount Looking For <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount (e.g., 50000 INR)"
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #d8c9ae',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#d8c9ae'}
            />
          </div>

          {/* Existing Lender */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2a241c'
            }}>
              🏦 Existing Lender (Optional)
            </label>
            <input
              type="text"
              name="existingLender"
              value={formData.existingLender}
              onChange={handleInputChange}
              placeholder="If you have existing loans, mention the lender name"
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #d8c9ae',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#d8c9ae'}
            />
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
              color: messageType === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading ? '#a89a80' : '#16a34a',
              color: '#fffdf8',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#15803d';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#16a34a';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? '⏳ Submitting...' : '✅ Submit Application'}
          </button>
        </form>

        {/* Footer Note */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e7ddcc',
          fontSize: '0.85rem',
          color: '#7a7264',
          textAlign: 'center'
        }}>
          We'll review your application and contact you within 2-3 business days.
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationForm;
