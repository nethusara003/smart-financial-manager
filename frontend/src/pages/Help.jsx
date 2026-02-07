import { HelpCircle, Book, MessageSquare, Mail, ExternalLink } from 'lucide-react';

const Help = () => {
  const helpSections = [
    {
      icon: Book,
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      color: "blue",
      items: [
        "Getting Started Guide",
        "User Manual",
        "API Documentation",
        "Best Practices"
      ]
    },
    {
      icon: MessageSquare,
      title: "Community Support",
      description: "Connect with other SFT users",
      color: "green", 
      items: [
        "Community Forum",
        "User Groups",
        "Feature Requests",
        "Bug Reports"
      ]
    },
    {
      icon: Mail,
      title: "Contact Support",
      description: "Get direct help from our team",
      color: "purple",
      items: [
        "Email Support",
        "Live Chat",
        "Phone Support",
        "Priority Support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help & Support Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get the help you need to make the most of Smart Financial Tracker. 
            Find answers, connect with our community, or reach out to our support team.
          </p>
        </div>

        {/* Help Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {helpSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className={`p-6 bg-gradient-to-r from-${section.color}-50 dark:from-${section.color}-900/20 to-${section.color}-100 dark:to-${section.color}-800/20 border-b border-gray-200 dark:border-gray-700`}>
                  <div className={`w-12 h-12 bg-${section.color}-100 dark:bg-${section.color}-900/40 rounded-xl flex items-center justify-center mb-4`}>
                    <IconComponent className={`w-6 h-6 text-${section.color}-600 dark:text-${section.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {section.description}
                  </p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <button className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                          <span>{item}</span>
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all group">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">View Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete user guides and tutorials</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 ml-auto transition-colors" />
            </button>
            
            <button className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all group">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Contact Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get help from our support team</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 ml-auto transition-colors" />
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still need help? Our support team is here for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="mailto:support@sft.com" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Live Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;