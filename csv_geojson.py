import csv
import json

def csv_to_geojson(csv_file, geojson_file, lat_col='Y', lon_col='X'):
    features = []

    with open(csv_file, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            properties = {k: v for k, v in row.items() if k not in [lat_col, lon_col]}
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row[lon_col]), float(row[lat_col])]
                },
                "properties": properties
            }
            features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(geojson_file, 'w',encoding='utf-8') as f:
        json.dump(geojson, f, indent=4)

# Example usage
csv_file = 'BMA-OCP_Data_Projects_Budgets_cleaned_02 - Combined_Projects.csv'
geojson_file = 'data-budget.geojson'
csv_to_geojson(csv_file, geojson_file)
