import React, { useState } from 'react';
import { ArrowLeft, Mail, ExternalLink, Send, CheckCircle2 } from 'lucide-react';

const EmailSupportPage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'account', label: 'Account Management' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'bug', label: 'Bug Report' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate email submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl p-8 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong text-center">
              <div className="bg-gradient-to-br from-success-500 to-success-600 p-4 rounded-2xl w-fit mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Message Sent Successfully!
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Thank you for contacting us. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-gold-500 dark:hover:bg-gold-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-purple-200 dark:shadow-glow-gold hover:shadow-xl"
              >
                Return to Help
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Help
          </button>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 dark:from-gold-500/90 dark:to-gold-600 rounded-2xl p-8 mb-8 shadow-2xl dark:shadow-glow-gold">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Email Support</h1>
                  <p className="text-white/90 text-lg">Get help from our support team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl p-8 shadow-premium dark:shadow-premium-dark border border-light-border-default dark:border-dark-border-strong">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:ring-2 focus:ring-purple-500 dark:focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:ring-2 focus:ring-purple-500 dark:focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:ring-2 focus:ring-purple-500 dark:focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:ring-2 focus:ring-purple-500 dark:focus:ring-gold-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Please describe your issue or question in detail. Include any error messages or steps to reproduce the problem."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-500 hover:bg-purple-600 dark:bg-gold-500 dark:hover:bg-gold-600 disabled:bg-purple-400 dark:disabled:bg-gold-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-purple-200 dark:shadow-glow-gold hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-light-border-default dark:border-dark-border-default">
              <div className="bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-xl p-4">
                <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Response Time
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
                  We typically respond within 24 hours during business days. For urgent issues, please include "URGENT" in your subject line.
                </p>
                <div className="flex items-center gap-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                  <Mail className="w-4 h-4" />
                  <span>support@smartfinance.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSupportPage;