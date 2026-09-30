from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, confusion_matrix, average_precision_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder

# 1. Load dataset

BASE_DIR = Path(__file__).resolve().parents[1]
dataset_path = BASE_DIR / "DataSet.csv"

df = pd.read_csv(dataset_path)

print("Original shape:", df.shape)

# Remove index column
df = df.drop(columns=["Unnamed: 0"])

# Target
X = df.drop(columns=["F3924"])
y = df["F3924"]

# Remove completely empty columns
X = X.dropna(axis=1, how="all")

# Remove constant columns
X = X.loc[:, X.nunique(dropna=False) > 1]

print("Final feature shape:", X.shape)

# 2. Identify column types

numeric_features = X.select_dtypes(include=["number"]).columns
categorical_features = X.select_dtypes(exclude=["number"]).columns

print("Numeric features:", len(numeric_features))
print("Categorical features:", len(categorical_features))


# 3. Preprocessing

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median"))
])

categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OrdinalEncoder(
        handle_unknown="use_encoded_value",
        unknown_value=-1
    ))
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_pipeline, numeric_features),
    ("categorical", categorical_pipeline, categorical_features)
])



# 4. Train/test split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# 5. Build model

model = Pipeline([
    ("preprocessor", preprocessor),

    ("classifier", RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    ))
])

# 6. Train

print("\nTraining model...")

model.fit(X_train, y_train)

print("Training complete!")

# 7. Evaluate

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]

print("\nClassification Report:")
print(classification_report(
    y_test,
    predictions,
    zero_division=0
))

print("Confusion Matrix:")
print(confusion_matrix(y_test, predictions))

print(
    "Average Precision (PR-AUC):",
    average_precision_score(y_test, probabilities)
)

# 8. Save model

model_path = Path(__file__).resolve().parent / "model.pkl"

joblib.dump(model, model_path)

print("\nModel saved to:", model_path)