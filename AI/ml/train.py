from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
dataset_path = BASE_DIR / "DataSet.csv"

df = pd.read_csv(dataset_path)

print("Original shape:", df.shape)

# Remove index column
df = df.drop(columns=["Unnamed: 0"])

# Separate target
X = df.drop(columns=["F3924"])
y = df["F3924"]

# Remove completely empty columns
X = X.dropna(axis=1, how="all")

print("Shape after removing empty columns:", X.shape)

print("\nTarget distribution:")
print(y.value_counts())

print("\nTarget percentage:")
print(y.value_counts(normalize=True) * 100)
