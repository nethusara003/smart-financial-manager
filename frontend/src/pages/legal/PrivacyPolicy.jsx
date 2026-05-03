import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Database, UserX, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] text-gray-300 p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last Updated: May 1, 2026</p>
        </div>

        {/* Highlight Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#161b22] p-6 rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-colors">
            <ShieldCheck className="text-blue-400 mb-3" size={32} />
            <h3 className="text-white font-semibold mb-2">Data Protection</h3>
            <p className="text-sm leading-relaxed">We use AES-256 encryption to ensure your financial transactions remain private and secure at all times.</p>
          </div>
          <div className="bg-[#161b22] p-6 rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-colors">
            <UserX className="text-purple-400 mb-3" size={32} />
            <h3 className="text-white font-semibold mb-2">Guest Privacy</h3>
            <p className="text-sm leading-relaxed">Guest sessions are temporary. We do not store or track PII (Personally Identifiable Information) for guest accounts.</p>
          </div>
          <div className="bg-[#161b22] p-6 rounded-xl border border-green-500/20 hover:border-green-400/40 transition-colors">
            <Lock className="text-green-400 mb-3" size={32} />
            <h3 className="text-white font-semibold mb-2">End-to-End Security</h3>
            <p className="text-sm leading-relaxed">All data transmitted between your device and our servers is encrypted with industry-standard protocols.</p>
          </div>
          <div className="bg-[#161b22] p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
            <Database className="text-cyan-400 mb-3" size={32} />
            <h3 className="text-white font-semibold mb-2">Minimal Data Collection</h3>
            <p className="text-sm leading-relaxed">We only collect data necessary to provide our services. No unnecessary tracking or analytics.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
              1. Information We Collect
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-4">
                To provide smart financial insights, we collect the following information:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>Transaction data (amounts, dates, categories)</li>
                <li>Expense categories and budget goals</li>
                <li>Account information (name, email)</li>
                <li>Financial health metrics you choose to track</li>
                <li>If you link a bank account, we use read-only access via secure API providers</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              2. How We Use Your Data
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <ul className="list-disc ml-6 space-y-3 text-sm">
                <li><span className="font-semibold">Financial Forecasting:</span> To generate AI-driven expense forecasts and financial projections</li>
                <li><span className="font-semibold">Health Score Calculation:</span> To calculate your Financial Health Score based on spending patterns</li>
                <li><span className="font-semibold">Debt Strategies:</span> To provide personalized debt reduction strategies</li>
                <li><span className="font-semibold">Recommendations:</span> To offer tailored financial recommendations and insights</li>
                <li><span className="font-semibold">Service Improvement:</span> To improve our platform and user experience</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              3. Zero Data Selling Policy
            </h2>
            <p className="leading-relaxed">
              We believe your financial life is your business. We <span className="font-bold text-blue-300">never sell</span> your data to third-party advertisers, insurance companies, or any external entities. Your privacy is paramount.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-cyan-500 rounded-full"></div>
              4. Guest Sessions
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-3">
                If you use Smart Financial Tracker as a guest:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>No personal data is stored on our servers</li>
                <li>All your data is stored locally in your browser</li>
                <li>Your session automatically expires when you close the browser</li>
                <li>We do not track or profile guest users</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-red-500 rounded-full"></div>
              5. Data Retention
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                We retain your data for as long as your account is active. You can request deletion of your account and all associated data at any time through your account settings or by contacting us directly. Upon deletion, your data will be permanently removed from our servers.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-pink-500 rounded-full"></div>
              6. GDPR & CCPA Compliance
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-4">
                We comply with international data protection regulations including GDPR and CCPA. You have the right to:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of certain data collection practices</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-400 to-blue-500 rounded-full"></div>
              7. Contact Us
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                If you have any questions about our Privacy Policy or how we handle your data, please don't hesitate to reach out to us at:
              </p>
              <p className="mt-4 text-blue-400 font-semibold">
                privacy@smartfinancialtracker.app
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/terms')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Read Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
