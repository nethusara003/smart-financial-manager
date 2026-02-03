const Budgets = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Budgets
        </h1>
        <p className="text-sm text-gray-500">
          Set spending limits and track budget usage by category
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-medium mb-2">
          No budgets configured
        </h3>
        <p className="text-sm text-gray-600">
          Budgets help you control spending by setting limits for categories
          like food, transport, or entertainment.
        </p>

        <div className="mt-4 text-sm text-gray-400 italic">
          Budget creation coming soon
        </div>
      </div>
    </div>
  );
};

export default Budgets;
