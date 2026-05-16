import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle

# Sample dataset
data = {
    'rooms': [1, 2, 3, 4, 5],
    'area': [500, 700, 1000, 1200, 1500],
    'location_score': [1, 2, 3, 4, 5],  # e.g. locality rating
    'price': [100000, 150000, 200000, 250000, 300000]
}
df = pd.DataFrame(data)

X = df[['rooms', 'area', 'location_score']]
y = df['price']

model = LinearRegression()
model.fit(X, y)

with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Model trained and saved as model.pkl")
