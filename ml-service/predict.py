import os
from collections import defaultdict
from datetime import datetime
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MODEL_EXPENSE_PATH = os.path.join(os.path.dirname(__file__), "model_expense.pkl")
MODEL_INCOME_PATH = os.path.join(os.path.dirname(__file__), "model_income.pkl")


def resolve_db_name(mongo_uri: str) -> str:
    configured = os.getenv("MONGO_DB_NAME", "").strip()
    if configured:
        return configured

    tail = mongo_uri.rsplit("/", 1)[-1] if "/" in mongo_uri else ""
    return (tail.split("?")[0] if tail else "") or "smart_financial_manager"


def connect_transactions_collection():
    mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://127.0.0.1:27017/smart_financial_manager"
    client = MongoClient(mongo_uri)
    db_name = resolve_db_name(mongo_uri)
    return client[db_name]["transactions"]


def load_model(path: str):
    if not os.path.exists(path):
        return None

    bundle = joblib.load(path)
    return bundle.get("pipeline") if isinstance(bundle, dict) else bundle


def fetch_user_monthly_category_totals(user_id: str, transaction_type: str) -> pd.DataFrame:
    collection = connect_transactions_collection()

    query = {
        "user": user_id,
        "type": transaction_type,
    }

    records = list(
        collection.find(
            query,
            {
                "_id": 0,
                "amount": 1,
                "category": 1,
                "date": 1,
            },
        )
    )

    if not records:
        return pd.DataFrame(columns=["category", "year", "month", "amount"])

    frame = pd.DataFrame(records)
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame = frame.dropna(subset=["date"])
    frame["amount"] = pd.to_numeric(frame["amount"], errors="coerce").fillna(0)
    frame["category"] = frame["category"].astype(str).fillna("unknown")
    frame["year"] = frame["date"].dt.year
    frame["month"] = frame["date"].dt.month

    monthly = (
        frame.groupby(["category", "year", "month"], as_index=False)["amount"]
        .sum()
        .sort_values(["category", "year", "month"])
    )

    return monthly


def compute_recent_monthly_totals(monthly_category_totals: pd.DataFrame) -> List[float]:
    if monthly_category_totals.empty:
        return []

    monthly_totals = (
        monthly_category_totals.groupby(["year", "month"], as_index=False)["amount"]
        .sum()
        .sort_values(["year", "month"])
    )

    return monthly_totals["amount"].tolist()


def naive_forecast(history: List[float], months_ahead: int) -> List[float]:
    if months_ahead <= 0:
        return []

    if not history:
        return [0.0 for _ in range(months_ahead)]

    tail = history[-6:]
    baseline = float(np.mean(tail))

    if len(tail) > 1:
        x = np.arange(len(tail))
        y = np.array(tail)
        slope = float(np.polyfit(x, y, 1)[0])
    else:
        slope = 0.0

    predictions = []
    for index in range(months_ahead):
        value = max(0.0, baseline + slope * (index + 1))
        predictions.append(round(value, 2))

    return predictions


def forecast_with_model(
    user_id: str,
    monthly_category_totals: pd.DataFrame,
    months_ahead: int,
    model,
) -> List[float]:
    if months_ahead <= 0:
        return []

    if model is None or monthly_category_totals.empty:
        return naive_forecast(compute_recent_monthly_totals(monthly_category_totals), months_ahead)

    by_category = defaultdict(list)

    for _, row in monthly_category_totals.iterrows():
        by_category[row["category"]].append(float(row["amount"]))

    if not by_category:
        return [0.0 for _ in range(months_ahead)]

    rolling_previous = {
        category: values[-1] if values else 0.0 for category, values in by_category.items()
    }

    predictions = []
    now = datetime.utcnow()

    for month_index in range(1, months_ahead + 1):
        future_date = datetime(now.year + (now.month + month_index - 1) // 12, ((now.month + month_index - 1) % 12) + 1, 1)
        rows = []

        for category in by_category.keys():
            rows.append(
                {
                    "month": future_date.month,
                    "year": future_date.year,
                    "category": category,
                    "userId": user_id,
                    "previous_value": rolling_previous.get(category, 0.0),
                }
            )

        feature_frame = pd.DataFrame(rows)
        category_predictions = model.predict(feature_frame)

        total = 0.0
        for idx, category in enumerate(by_category.keys()):
            value = max(0.0, float(category_predictions[idx]))
            rolling_previous[category] = value
            total += value

        predictions.append(round(total, 2))

    return predictions


def predict_future(user_id: str, months_ahead: int) -> Dict[str, List[float]]:
    safe_months = max(1, int(months_ahead))

    expense_model = load_model(MODEL_EXPENSE_PATH)
    income_model = load_model(MODEL_INCOME_PATH)

    monthly_expenses = fetch_user_monthly_category_totals(user_id, "expense")
    monthly_income = fetch_user_monthly_category_totals(user_id, "income")

    predicted_expenses = forecast_with_model(user_id, monthly_expenses, safe_months, expense_model)
    predicted_income = forecast_with_model(user_id, monthly_income, safe_months, income_model)

    if len(predicted_expenses) != safe_months:
        predicted_expenses = naive_forecast(compute_recent_monthly_totals(monthly_expenses), safe_months)

    if len(predicted_income) != safe_months:
        predicted_income = naive_forecast(compute_recent_monthly_totals(monthly_income), safe_months)

    return {
        "predictedExpenses": predicted_expenses,
        "predictedIncome": predicted_income,
    }


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Predict user income and expenses")
    parser.add_argument("user_id", type=str)
    parser.add_argument("months_ahead", type=int)
    args = parser.parse_args()

    result = predict_future(args.user_id, args.months_ahead)
    print(json.dumps(result, indent=2))
