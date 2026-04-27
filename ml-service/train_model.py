import os
from datetime import datetime

import joblib
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

load_dotenv()

MODEL_EXPENSE_PATH = os.path.join(os.path.dirname(__file__), "model_expense.pkl")
MODEL_INCOME_PATH = os.path.join(os.path.dirname(__file__), "model_income.pkl")


def resolve_db_name(mongo_uri: str) -> str:
    configured = os.getenv("MONGO_DB_NAME", "").strip()
    if configured:
        return configured

    if "/" not in mongo_uri:
        return "smart_financial_manager"

    tail = mongo_uri.rsplit("/", 1)[-1]
    if not tail:
        return "smart_financial_manager"

    return tail.split("?")[0] or "smart_financial_manager"


def load_transactions() -> pd.DataFrame:
    mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://127.0.0.1:27017/smart_financial_manager"
    client = MongoClient(mongo_uri)

    db_name = resolve_db_name(mongo_uri)
    database = client[db_name]
    collection = database["transactions"]

    records = list(
        collection.find(
            {},
            {
                "_id": 0,
                "user": 1,
                "amount": 1,
                "category": 1,
                "type": 1,
                "date": 1,
            },
        )
    )

    if not records:
        return pd.DataFrame(columns=["user", "amount", "category", "type", "date"])

    frame = pd.DataFrame(records)
    frame["amount"] = pd.to_numeric(frame["amount"], errors="coerce").fillna(0)
    frame["category"] = frame["category"].astype(str).fillna("unknown")
    frame["type"] = frame["type"].astype(str).fillna("unknown")
    frame["user"] = frame["user"].astype(str)
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame = frame.dropna(subset=["date"])

    return frame


def build_training_dataset(frame: pd.DataFrame, transaction_type: str) -> pd.DataFrame:
    subset = frame[frame["type"] == transaction_type].copy()
    if subset.empty:
        return pd.DataFrame()

    subset["year"] = subset["date"].dt.year
    subset["month"] = subset["date"].dt.month

    monthly = (
        subset.groupby(["user", "category", "year", "month"], as_index=False)["amount"]
        .sum()
        .rename(columns={"user": "userId", "amount": "target"})
    )

    monthly = monthly.sort_values(["userId", "category", "year", "month"])
    monthly["previous_value"] = monthly.groupby(["userId", "category"])["target"].shift(1)
    monthly["previous_value"] = monthly["previous_value"].fillna(0)

    return monthly


def train_model_for_type(frame: pd.DataFrame, transaction_type: str) -> Pipeline:
    dataset = build_training_dataset(frame, transaction_type)
    if dataset.empty:
        raise ValueError(f"No training data for transaction type: {transaction_type}")

    feature_columns = ["month", "year", "category", "userId", "previous_value"]
    target_column = "target"

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["category", "userId"]),
            ("num", "passthrough", ["month", "year", "previous_value"]),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=220,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    x_train = dataset[feature_columns]
    y_train = dataset[target_column]
    pipeline.fit(x_train, y_train)

    return pipeline


def save_bundle(model: Pipeline, output_path: str, transaction_type: str, frame: pd.DataFrame) -> None:
    metadata = {
        "transactionType": transaction_type,
        "trainedAt": datetime.utcnow().isoformat(),
        "rows": int(frame.shape[0]),
    }

    bundle = {
        "pipeline": model,
        "metadata": metadata,
    }

    joblib.dump(bundle, output_path)


def main() -> None:
    frame = load_transactions()

    if frame.empty:
        raise SystemExit("No transaction data found. Add transactions before training models.")

    expense_model = train_model_for_type(frame, "expense")
    income_model = train_model_for_type(frame, "income")

    save_bundle(expense_model, MODEL_EXPENSE_PATH, "expense", frame[frame["type"] == "expense"])
    save_bundle(income_model, MODEL_INCOME_PATH, "income", frame[frame["type"] == "income"])

    print(f"Saved expense model to {MODEL_EXPENSE_PATH}")
    print(f"Saved income model to {MODEL_INCOME_PATH}")


if __name__ == "__main__":
    main()
