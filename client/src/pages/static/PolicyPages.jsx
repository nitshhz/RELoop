import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertOctagon, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-text-primary">About ReLoop</h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Tagline: <strong>Buy smarter. Sell easier. Waste less.</strong>
        </p>
      </div>

      <div className="clay-card p-6 sm:p-8 bg-white space-y-4 text-xs sm:text-sm text-text-primary leading-relaxed">
        <h2 className="text-lg font-bold text-brand-green">Our Mission</h2>
        <p>
          ReLoop is a general-purpose peer-to-peer secondhand marketplace built to make buying and selling pre-owned goods as frictionless, transparent, and rewarding as possible. Every year, millions of functional smartphones, laptops, study desks, and audio gear end up idle in drawers or prematurely discarded.
        </p>
        <p>
          By pairing modern web design with practical tools like hosted AI listing assistance, built-in offers and counteroffers, price-drop alerts, and real-time messaging, ReLoop bridges the gap between buyers looking for authentic bargains and sellers seeking straightforward decluttering.
        </p>

        <h2 className="text-lg font-bold text-brand-green pt-4">Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-background-secondary space-y-1">
            <h4 className="font-bold text-text-primary">1. Honest Disclosure</h4>
            <p className="text-xs text-text-muted">
              We require clear photos and accurate wear reporting so buyers know exactly what to expect.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-background-secondary space-y-1">
            <h4 className="font-bold text-text-primary">2. Structured Deals</h4>
            <p className="text-xs text-text-muted">
              Built-in counteroffers eliminate endless back-and-forth haggling.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-background-secondary space-y-1">
            <h4 className="font-bold text-text-primary">3. Zero Waste</h4>
            <p className="text-xs text-text-muted">
              Extending the lifespan of everyday goods lowers environmental footprints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-brand-green text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Trust & Safety Center</span>
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary">
          Safe Secondhand Buying & Selling Guide
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Follow these practical tips to ensure safe and pleasant marketplace transactions.
        </p>
      </div>

      <div className="clay-card p-6 sm:p-8 bg-white space-y-6 text-xs sm:text-sm text-text-primary leading-relaxed">
        <div className="space-y-2">
          <h3 className="font-bold text-base text-brand-green">For Buyers</h3>
          <ul className="space-y-2 list-disc list-inside text-text-muted">
            <li>Always inspect the physical condition of the item and verify basic functions (cameras, ports, display, zippers) before concluding your handover.</li>
            <li>Use ReLoop's built-in chat and offer tools so all price agreements are recorded and transparent.</li>
            <li>Be cautious of deals that seem unrealistically cheap compared to our Price Insights benchmark.</li>
            <li>Report suspicious sellers or counterfeit products using the "Report Listing" action.</li>
          </ul>
        </div>

        <div className="space-y-2 pt-4 border-t border-border-subtle">
          <h3 className="font-bold text-base text-brand-green">For Sellers</h3>
          <ul className="space-y-2 list-disc list-inside text-text-muted">
            <li>Take clear, original photos in good natural lighting showing both strengths and any blemishes or scratches.</li>
            <li>List included accessories like chargers, cables, bills, or warranty documents.</li>
            <li>Never share private personal banking passwords or OTPs with any buyer.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProhibitedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          <AlertOctagon className="w-4 h-4" />
          <span>Community Standards</span>
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary">
          Prohibited & Restricted Items Policy
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          To maintain a safe, lawful, and clean secondhand marketplace, the following items are strictly prohibited on ReLoop.
        </p>
      </div>

      <div className="clay-card p-6 sm:p-8 bg-white space-y-4 text-xs sm:text-sm text-text-primary">
        <p className="text-text-muted">
          Our automated systems and human moderation team remove listings and suspend accounts offering any of the following:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            'Weapons, ammunition, knives, and explosives',
            'Prescription drugs, medications, and medical devices',
            'Alcohol, tobacco, e-cigarettes, and controlled substances',
            'Counterfeit goods, unauthorized replicas, and fake designer copies',
            'Stolen property or items with serial numbers scratched off',
            'Pirated software, jailbroken streaming devices, and illegal licenses',
            'Animals, wildlife products, and endangered species parts',
            'Hazardous chemicals, fireworks, and flammable solvents',
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-red-900 font-medium flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold text-text-primary">Terms of Service</h1>
      <div className="clay-card p-6 sm:p-8 bg-white space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed">
        <p>Last updated: October 2026</p>
        <h3 className="font-bold text-sm text-text-primary">1. Acceptance of Terms</h3>
        <p>By creating an account or using ReLoop, you agree to comply with our community guidelines, acceptable use policies, and terms of service.</p>
        <h3 className="font-bold text-sm text-text-primary">2. Marketplace Role</h3>
        <p>ReLoop provides an online platform connecting peer-to-peer buyers and sellers. ReLoop is not a party to individual physical exchanges or private transactions.</p>
        <h3 className="font-bold text-sm text-text-primary">3. Moderation & Termination</h3>
        <p>ReLoop administrators reserve the right to approve, reject, remove listings, or suspend accounts that violate safety guidelines or community standards.</p>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold text-text-primary">Privacy Policy</h1>
      <div className="clay-card p-6 sm:p-8 bg-white space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed">
        <p>Last updated: October 2026</p>
        <h3 className="font-bold text-sm text-text-primary">1. Data We Collect</h3>
        <p>We collect information you voluntarily provide, such as your name, email, listing descriptions, uploaded photos, and messages. We never expose your private email address on public profile pages.</p>
        <h3 className="font-bold text-sm text-text-primary">2. Hosted AI Privacy</h3>
        <p>When you use the AI Listing Creator, only the product notes you explicitly enter are sent to our hosted AI provider (Google Gemini API). We never send passwords, authentication tokens, or personal identity documents to AI providers.</p>
        <h3 className="font-bold text-sm text-text-primary">3. Data Security</h3>
        <p>Passwords are securely hashed using industry-standard bcrypt. Session tokens use secure HTTP-only cookies and cryptographic signatures.</p>
      </div>
    </div>
  );
}
