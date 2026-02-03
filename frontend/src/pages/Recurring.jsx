const Recurring = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Recurring Transactions
        </h1>
        <p className="text-sm text-gray-500">
          Manage repeating income and expenses such as salary or subscriptions
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-medium mb-2">
          No recurring transactions
        </h3>
        <p className="text-sm text-gray-600">
          Recurring transactions allow automatic tracking of fixed payments
          like rent, subscriptions, or monthly income.
        </p>

        <div className="mt-4 text-sm text-gray-400 italic">
          Recurring transaction setup coming soon
        </div>
      </div>
    </div>
  );
};

export default Recurring;
