import React, { useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last Updated: May 1, 2026</p>
        </div>

        {/* Quick Summary */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-400" size={28} />
            Quick Summary
          </h2>
          <p className="mb-4 leading-relaxed">
            These Terms of Service outline your rights and responsibilities as a user of Smart Financial Tracker. By creating an account or using our service as a guest, you agree to be bound by these terms. Please read them carefully.
          </p>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
              1. Acceptance of Terms
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                By accessing and using Smart Financial Tracker, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              2. Use License
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Smart Financial Tracker for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Engage in any data mining or scraping activities</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-cyan-500 rounded-full"></div>
              3. User Responsibilities
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-4">
                As a user of Smart Financial Tracker, you are responsible for:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>Accepting responsibility for all activities that occur under your account</li>
                <li>Ensuring that all information you provide is accurate and current</li>
                <li>Not using the service for any illegal or harmful purposes</li>
                <li>Not harassing, threatening, or intimidating other users</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-red-500 rounded-full"></div>
              4. Limitation of Liability
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                The materials on Smart Financial Tracker are provided on an 'as is' basis. Smart Financial Tracker makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-pink-400 to-red-500 rounded-full"></div>
              5. Accuracy of Materials
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                The materials appearing on Smart Financial Tracker could include technical, typographical, or photographic errors. Smart Financial Tracker does not warrant that any of the materials on its website are accurate, complete, or current. Smart Financial Tracker may make changes to the materials contained on its website at any time without notice.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-400 to-blue-500 rounded-full"></div>
              6. Links
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                Smart Financial Tracker has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Smart Financial Tracker of the site. Use of any such linked website is at the user's own risk.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
              7. Modifications
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                Smart Financial Tracker may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-green-500 rounded-full"></div>
              8. Governing Law
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Smart Financial Tracker operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-yellow-500 rounded-full"></div>
              9. Termination of Service
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-4">
                Smart Financial Tracker may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms of Service.
              </p>
              <p className="leading-relaxed">
                You may cancel your account at any time by contacting us at support@smartfinancialtracker.app.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              10. Data Protection & Financial Information
            </h2>
            <p className="leading-relaxed mb-4">
              We take your financial data seriously. All information you enter into Smart Financial Tracker is encrypted and protected. However:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-sm">
              <li>We are not liable for any data loss or unauthorized access beyond our reasonable control</li>
              <li>Financial forecasts are estimates and should not be treated as investment advice</li>
              <li>You should always independently verify financial recommendations</li>
              <li>We recommend using strong passwords and enabling multi-factor authentication</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-400 to-cyan-500 rounded-full"></div>
              11. Guest User Terms
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-4">
                If you use Smart Financial Tracker as a guest:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li>Your data is stored locally in your browser only</li>
                <li>We do not store your personal information on our servers</li>
                <li>Your session will expire when you close your browser</li>
                <li>We cannot recover your data if your browser cache is cleared</li>
                <li>All data loss is your responsibility as a guest user</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
              12. Contact Information
            </h2>
            <div className="bg-[#161b22]/50 p-6 rounded-lg border border-gray-700/50">
              <p className="leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><span className="text-blue-400 font-semibold">Email:</span> support@smartfinancialtracker.app</p>
                <p><span className="text-blue-400 font-semibold">Legal Inquiries:</span> legal@smartfinancialtracker.app</p>
              </div>
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
              onClick={() => navigate('/privacy')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Read Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
