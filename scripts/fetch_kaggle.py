import kagglehub
import pandas as pd
import json
import os

def fetch_data():
    print("Fetching Kaggle dataset...")
    try:
        path = kagglehub.dataset_download("pondnaravitt/dataset-perguruan-tinggi-negri-di-indonesia")
        
        # Look for CSV files in the downloaded path
        csv_files = [f for f in os.listdir(path) if f.endswith('.csv')]
        if not csv_files:
            print("No CSV files found in dataset.")
            return

        file_path = os.path.join(path, csv_files[0])
        df = pd.read_csv(file_path, sep=';', on_bad_lines='skip')
        
        # Replace NaN with None so it's exported as null in JSON
        df = df.where(pd.notnull(df), None)
        
        data = df.to_dict(orient='records')
        
        output_path = "prisma/university_data.json"
        with open(output_path, 'w') as f:
            json.dump(data, f)
        
        print(f"Successfully saved {len(data)} records to {output_path}")

    except Exception as e:
        print(f"Error fetching Kaggle data: {e}")

if __name__ == "__main__":
    fetch_data()
