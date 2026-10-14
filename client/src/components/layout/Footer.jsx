import React from 'react';
import { Link } from 'react-router-dom';
import { Download, ShieldCheck, RefreshCw, Sparkles, Heart } from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';

export function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border-subtle mt-16 pb-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Logo size="sm" variant="simple" />
            <p className="text-xs text-text-muted leading-relaxed">
              Buy smarter. Sell easier. Waste less. ReLoop is a peer-to-peer secondhand marketplace designed for practical circular commerce.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-brand-green font-bold">
              <RefreshCw className="w-4 h-4" />
              <span>Extend the lifecycle of products</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link to="/browse?category=mobiles" className="hover:text-brand-green">
                  Mobiles & Smartphones
                </Link>
              </li>
              <li>
                <Link to="/browse?category=laptops" className="hover:text-brand-green">
                  Laptops & Computers
                </Link>
              </li>
              <li>
                <Link to="/browse?category=electronics" className="hover:text-brand-green">
                  Audio & Headphones
                </Link>
              </li>
              <li>
                <Link to="/browse?category=furniture" className="hover:text-brand-green">
                  Study Desks & Chairs
                </Link>
              </li>
              <li>
                <Link to="/browse?category=gaming" className="hover:text-brand-green">
                  Gaming Consoles & Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Guidelines */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Trust & Community
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link to="/safety" className="hover:text-brand-green flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                  Secondhand Safety Guide
                </Link>
              </li>
              <li>
                <Link to="/prohibited" className="hover:text-brand-green">
                  Prohibited Items Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-green">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-green">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-green">
                  About ReLoop
                </Link>
              </li>
            </ul>
          </div>

          {/* Features & PWA */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Key Features
            </h4>
            <ul className="space-y-2 text-xs text-text-muted mb-4">
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                Hosted AI Listing Creator
              </li>
              <li>Built-in Offers & Counteroffers</li>
              <li>Saved Searches & Price-Drop Alerts</li>
              <li>Installable Progressive Web App (PWA)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} ReLoop Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/safety" className="hover:text-text-primary">Safety Tips</Link>
            <Link to="/privacy" className="hover:text-text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-text-primary">Terms</Link>
            <Link to="/prohibited" className="hover:text-text-primary">Prohibited Items</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
