import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Copy, Check, Share2 } from 'lucide-react';

export function ShareModal({ isOpen, onClose, title, url }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check out this item on ReLoop',
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Listing">
      <div className="space-y-4">
        <p className="text-xs text-text-muted">
          Share this secondhand listing with friends or social networks:
        </p>

        <div className="flex items-center gap-2 p-2 bg-background-secondary rounded-xl border border-border-subtle">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs text-text-primary w-full outline-none select-all truncate"
          />
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-brand-green" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>

        {navigator.share && (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleNativeShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share via Apps
          </Button>
        )}
      </div>
    </Modal>
  );
}
