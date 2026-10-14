import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Textarea } from '../ui/Input.jsx';
import { apiRequest } from '../../lib/api.js';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function ReportModal({ isOpen, onClose, targetType = 'LISTING', targetId, targetTitle = '' }) {
  const [reason, setReason] = useState('SPAM_SCAM');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    { value: 'SPAM_SCAM', label: 'Suspected scam or fake seller' },
    { value: 'PROHIBITED', label: 'Prohibited or illegal item' },
    { value: 'MISLEADING', label: 'Misleading description or condition' },
    { value: 'DUPLICATE', label: 'Duplicate spam listing' },
    { value: 'HARASSMENT', label: 'Inappropriate or abusive behavior' },
    { value: 'OTHER', label: 'Other policy violation' },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiRequest('/reports', {
        method: 'POST',
        data: {
          targetType,
          targetId,
          reason,
          details: details.trim() || null,
        },
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetType === 'LISTING' ? 'Listing' : 'User'}`}>
      {success ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-brand-green mx-auto" />
          <h4 className="font-bold text-base text-text-primary">Report Submitted</h4>
          <p className="text-xs text-text-muted">
            Thank you for helping keep ReLoop safe. Our moderation team will investigate.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {targetTitle && (
            <p className="text-xs text-text-muted truncate">
              Reporting: <strong className="text-text-primary">{targetTitle}</strong>
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Reason for Report
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full clay-input p-2.5 text-xs bg-white"
            >
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Additional Details (Optional)"
            placeholder="Explain why this listing violates community standards..."
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="terracotta" className="flex-1" isLoading={loading}>
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
