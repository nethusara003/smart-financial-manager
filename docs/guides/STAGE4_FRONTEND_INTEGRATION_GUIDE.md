# Stage 4 Features - Frontend Integration Guide

## 🎨 Quick Start for Frontend Developers

This guide helps you integrate the new Stage 4 intelligent financial features into the frontend.

---

## 📋 Overview of New Features

1. **Budget Recommendations** - AI-powered budget suggestions based on spending patterns
2. **Financial Health Score** - Comprehensive financial wellness scoring (0-100)
3. **Expense Forecasting** - Predictive analytics for future expenses

---

## 🔌 API Endpoints Reference

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 1️⃣ Budget Recommendations

### Endpoint
```
GET /recommendations/budget
```

### React Implementation Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const BudgetRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/recommendations/budget',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setRecommendations(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch recommendations');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!recommendations?.success) return <div>{recommendations?.message}</div>;

  return (
    <div className="budget-recommendations">
      {/* Summary Section */}
      <div className="summary-card">
        <h2>Financial Overview</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <label>Monthly Income</label>
            <span>${recommendations.summary.monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <label>Current Spending</label>
            <span>${recommendations.summary.currentTotalSpending.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <label>Current Savings</label>
            <span>${recommendations.summary.currentSavings.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <label>Savings Rate</label>
            <span>{recommendations.summary.currentSavingsRate}</span>
          </div>
        </div>
      </div>

      {/* 50/30/20 Allocation */}
      <div className="allocation-card">
        <h3>Recommended Allocation (50/30/20 Rule)</h3>
        <div className="allocation-bars">
          <div className="bar needs">
            <label>Needs (50%)</label>
            <span>${recommendations.summary.recommendedAllocation.needs}</span>
          </div>
          <div className="bar wants">
            <label>Wants (30%)</label>
            <span>${recommendations.summary.recommendedAllocation.wants}</span>
          </div>
          <div className="bar savings">
            <label>Savings (20%)</label>
            <span>${recommendations.summary.recommendedAllocation.savings}</span>
          </div>
        </div>
      </div>

      {/* Category Recommendations */}
      <div className="recommendations-list">
        <h3>Category-wise Recommendations</h3>
        {recommendations.recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-card status-${rec.status}`}>
            <div className="category-header">
              <h4>{rec.category}</h4>
              <span className={`badge ${rec.categoryType}`}>{rec.categoryType}</span>
              <span className={`badge ${rec.status}`}>{rec.status.replace('_', ' ')}</span>
            </div>
            <div className="recommendation-details">
              <div className="spending-info">
                <span>Current: ${rec.currentSpending}</span>
                <span>Recommended: ${rec.recommendedBudget}</span>
                <span>{rec.percentageOfIncome}% of income</span>
              </div>
              <p className="suggestion">{rec.suggestion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>Personalized Insights</h3>
        {recommendations.insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type} priority-${insight.priority}`}>
            <span className="insight-icon">{getInsightIcon(insight.type)}</span>
            <div>
              <strong>{insight.category}</strong>
              <p>{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getInsightIcon = (type) => {
  const icons = {
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
    critical: '🚨'
  };
  return icons[type] || 'ℹ️';
};

export default BudgetRecommendations;
```

---

## 2️⃣ Financial Health Score

### Endpoints
```
GET /financial-health/score        # Current score
GET /financial-health/history      # Historical scores (6 months)
```

### React Implementation Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialHealthScore = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/financial-health/score',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setHealthData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching health score:', err);
        setLoading(false);
      }
    };

    fetchHealthScore();
  }, []);

  if (loading) return <div>Calculating your financial health...</div>;
  if (!healthData?.success) return <div>Unable to calculate score</div>;

  return (
    <div className="financial-health-dashboard">
      {/* Overall Score Display */}
      <div className="score-card" style={{ borderColor: healthData.color }}>
        <div className="score-circle">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={healthData.color}
              strokeWidth="8"
              strokeDasharray={`${healthData.score * 2.51} 251`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="score-number">
            <h1>{healthData.score}</h1>
            <p>{healthData.category}</p>
          </div>
        </div>
        <p className="score-status">{healthData.status}</p>
      </div>

      {/* Component Breakdown */}
      <div className="components-grid">
        {/* Savings Ratio */}
        <div className="component-card">
          <h3>Savings Ratio</h3>
          <div className="component-score">
            <span className="score">{healthData.components.savingsRatio.score}</span>
            <span className="weight">Weight: {healthData.components.savingsRatio.weight}%</span>
          </div>
          <div className="component-details">
            <p>Rate: {healthData.components.savingsRatio.ratio}%</p>
            <p>Category: {healthData.components.savingsRatio.category}</p>
            <p>Trend: {healthData.components.savingsRatio.details.trend}</p>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${healthData.components.savingsRatio.score}%` }}
            />
          </div>
        </div>

        {/* Expense-to-Income Ratio */}
        <div className="component-card">
          <h3>Expense Efficiency</h3>
          <div className="component-score">
            <span className="score">{healthData.components.expenseToIncomeRatio.score}</span>
            <span className="weight">Weight: {healthData.components.expenseToIncomeRatio.weight}%</span>
          </div>
          <div className="component-details">
            <p>Spending: {healthData.components.expenseToIncomeRatio.ratio}%</p>
            <p>Category: {healthData.components.expenseToIncomeRatio.category}</p>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${healthData.components.expenseToIncomeRatio.score}%` }}
            />
          </div>
        </div>

        {/* Debt Ratio */}
        <div className="component-card">
          <h3>Debt Management</h3>
          <div className="component-score">
            <span className="score">{healthData.components.debtRatio.score}</span>
            <span className="weight">Weight: {healthData.components.debtRatio.weight}%</span>
          </div>
          <div className="component-details">
            <p>Debt Payments: {healthData.components.debtRatio.ratio}%</p>
            <p>Category: {healthData.components.debtRatio.category}</p>
            <p>Debts: {healthData.components.debtRatio.details.numberOfDebts}</p>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${healthData.components.debtRatio.score}%` }}
            />
          </div>
        </div>

        {/* Budget Adherence */}
        <div className="component-card">
          <h3>Budget Adherence</h3>
          <div className="component-score">
            <span className="score">{healthData.components.budgetAdherence.score}</span>
            <span className="weight">Weight: {healthData.components.budgetAdherence.weight}%</span>
          </div>
          <div className="component-details">
            <p>Compliance: {healthData.components.budgetAdherence.adherence}%</p>
            <p>Category: {healthData.components.budgetAdherence.category}</p>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${healthData.components.budgetAdherence.score}%` }}
            />
          </div>
        </div>

        {/* Goal Progress */}
        <div className="component-card">
          <h3>Goal Achievement</h3>
          <div className="component-score">
            <span className="score">{healthData.components.goalProgress.score}</span>
            <span className="weight">Weight: {healthData.components.goalProgress.weight}%</span>
          </div>
          <div className="component-details">
            <p>Progress: {healthData.components.goalProgress.progress}%</p>
            <p>Category: {healthData.components.goalProgress.category}</p>
            <p>On Track: {healthData.components.goalProgress.details.goalsOnTrack}/{healthData.components.goalProgress.details.activeGoals}</p>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${healthData.components.goalProgress.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>Recommendations for Improvement</h2>
        {healthData.recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-card priority-${rec.priority}`}>
            <div className="rec-header">
              <h3>{rec.title}</h3>
              <span className={`priority-badge ${rec.priority}`}>{rec.priority} priority</span>
            </div>
            <p className="rec-description">{rec.description}</p>
            <ul className="action-items">
              {rec.actionItems.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialHealthScore;
```

---

## 3️⃣ Expense Forecasting

### Endpoints
```
GET /forecasting/expenses?months=3           # Overall forecast
GET /forecasting/category/:category?months=6 # Category-specific
```

### React Implementation Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ExpenseForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/forecasting/expenses?months=${months}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setForecast(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching forecast:', err);
        setLoading(false);
      }
    };

    fetchForecast();
  }, [months]);

  if (loading) return <div>Generating forecast...</div>;
  if (!forecast?.success) return <div>{forecast?.message}</div>;

  // Prepare chart data
  const chartData = forecast.summary.overallForecast.map(f => ({
    month: f.month,
    predicted: f.totalPredicted,
    min: f.minEstimate,
    max: f.maxEstimate
  }));

  return (
    <div className="expense-forecast">
      {/* Controls */}
      <div className="forecast-controls">
        <label>Forecast Period:</label>
        <select value={months} onChange={(e) => setMonths(e.target.value)}>
          <option value="1">1 Month</option>
          <option value="3">3 Months</option>
          <option value="6">6 Months</option>
        </select>
      </div>

      {/* Data Quality Indicator */}
      <div className="data-quality-card">
        <h3>Forecast Reliability</h3>
        <div className="quality-metrics">
          <span>Months Analyzed: {forecast.dataQuality.monthsAnalyzed}</span>
          <span>Transactions: {forecast.dataQuality.transactionsAnalyzed}</span>
          <span>Categories: {forecast.dataQuality.categoriesTracked}</span>
          <span className={`reliability ${forecast.dataQuality.reliability.toLowerCase()}`}>
            {forecast.dataQuality.reliability} Reliability
          </span>
        </div>
      </div>

      {/* Overall Forecast Chart */}
      <div className="forecast-chart-container">
        <h3>Expense Forecast Trend</h3>
        <LineChart width={800} height={400} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="predicted" stroke="#8884d8" name="Predicted" />
          <Line type="monotone" dataKey="min" stroke="#82ca9d" name="Min Estimate" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="max" stroke="#ffc658" name="Max Estimate" strokeDasharray="5 5" />
        </LineChart>
      </div>

      {/* Monthly Breakdown */}
      <div className="monthly-forecast-cards">
        {forecast.summary.overallForecast.map((month, index) => (
          <div key={index} className="month-forecast-card">
            <h4>{month.month}</h4>
            <div className="forecast-amount">
              <span className="main-amount">${month.totalPredicted.toLocaleString()}</span>
              <span className="range">
                ${month.minEstimate.toLocaleString()} - ${month.maxEstimate.toLocaleString()}
              </span>
            </div>
            <span className={`confidence badge-${month.confidence.toLowerCase()}`}>
              {month.confidence} Confidence
            </span>
          </div>
        ))}
      </div>

      {/* Category Forecasts */}
      <div className="category-forecasts">
        <h3>Category-wise Predictions</h3>
        {forecast.categoryForecasts.map((cat, index) => (
          <div key={index} className="category-forecast-card">
            <div className="category-header">
              <h4>{cat.category}</h4>
              <span className={`trend-badge ${cat.historical.trend}`}>
                {cat.historical.trend} {cat.historical.percentChange}
              </span>
            </div>
            
            <div className="category-metrics">
              <div className="metric">
                <label>Historical Average</label>
                <span>${cat.historical.average.toLocaleString()}</span>
              </div>
              <div className="metric">
                <label>Next Month Forecast</label>
                <span>${cat.forecast[0].predicted.toLocaleString()}</span>
              </div>
              <div className="metric">
                <label>Trend Confidence</label>
                <span>{cat.historical.trendConfidence}</span>
              </div>
            </div>

            {cat.insights.seasonalPattern === "Detected" && (
              <span className="seasonal-badge">📊 Seasonal Pattern Detected</span>
            )}
            
            {cat.insights.anomalies > 0 && (
              <span className="anomaly-badge">⚠️ {cat.insights.anomalies} Anomalies Found</span>
            )}
          </div>
        ))}
      </div>

      {/* Insights & Warnings */}
      <div className="insights-section">
        <h3>Forecast Insights</h3>
        {forecast.insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type} priority-${insight.priority}`}>
            <div className="insight-content">
              <strong>{insight.category}</strong>
              <p>{insight.message}</p>
              <p className="recommendation">{insight.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseForecast;
```

---

## 🎨 Suggested CSS Styles

```css
/* Budget Recommendations */
.budget-recommendations {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.summary-card,
.allocation-card,
.recommendations-list,
.insights-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item label {
  font-size: 14px;
  color: #666;
}

.summary-item span {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.recommendation-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.recommendation-card.status-overspending {
  border-left: 4px solid #f44336;
}

.recommendation-card.status-on_track {
  border-left: 4px solid #4caf50;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
}

.badge.essential {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.discretionary {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* Financial Health Score */
.score-circle {
  width: 200px;
  height: 200px;
  position: relative;
  margin: 0 auto;
}

.score-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number h1 {
  font-size: 48px;
  margin: 0;
  font-weight: bold;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.component-card {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

/* Expense Forecast */
.forecast-chart-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.monthly-forecast-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.month-forecast-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.forecast-amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.main-amount {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.range {
  font-size: 14px;
  color: #666;
}

.trend-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.trend-badge.increasing {
  background: #ffebee;
  color: #c62828;
}

.trend-badge.decreasing {
  background: #e8f5e9;
  color: #2e7d32;
}

.trend-badge.stable {
  background: #e3f2fd;
  color: #1976d2;
}
```

---

## 🧪 Testing Tips

### 1. Test with Different Data Sets
```javascript
// User with sufficient data
// User with insufficient data (< 3 months)
// User with no transactions
// User with only income, no expenses
// User with many categories vs few categories
```

### 2. Handle Loading & Error States
```javascript
// Always show loading indicators
// Handle API errors gracefully
// Show informative messages for insufficient data
```

### 3. Responsive Design
```javascript
// Test on mobile, tablet, desktop
// Use responsive grid layouts
// Make charts responsive
```

---

## 📱 Navigation Integration

### Add to Main Menu

```javascript
// Add to your navigation component
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home' },
  { path: '/transactions', label: 'Transactions', icon: 'list' },
  { path: '/budgets', label: 'Budgets', icon: 'wallet' },
  { path: '/goals', label: 'Goals', icon: 'target' },
  // NEW FEATURES
  { path: '/recommendations', label: 'Recommendations', icon: 'lightbulb' },
  { path: '/health-score', label: 'Financial Health', icon: 'heart' },
  { path: '/forecast', label: 'Forecast', icon: 'trendingUp' },
];
```

---

## 🔔 Recommended Features

### 1. Refresh Button
Add ability to manually refresh data

### 2. Export Functionality
Allow users to export reports as PDF

### 3. Share Feature
Let users share their progress (anonymously)

### 4. Notifications
Alert users when their score changes significantly

### 5. Tooltips
Add help tooltips to explain scoring metrics

---

## ⚠️ Important Notes

1. **Data Requirements**: All features require at least 3 months of transaction history
2. **Performance**: Large datasets may take 2-3 seconds to process
3. **Caching**: Consider caching results for 24 hours to reduce API calls
4. **Error Handling**: Always handle cases where users don't have enough data
5. **Real-time Updates**: Scores update when new transactions are added

---

## 🎯 Next Steps

1. Create the UI components
2. Add routing for new pages
3. Integrate with existing navigation
4. Add error handling
5. Implement loading states
6. Add success/error notifications
7. Test with real user data

---

**Need Help?**
- Check the [API Documentation](./STAGE4_IMPLEMENTATION_SUMMARY.md)
- Review example responses in the summary document
- Test endpoints with Postman before integration

**Happy Coding! 🚀**
