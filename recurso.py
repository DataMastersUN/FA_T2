import json
from pathlib import Path
import pandas as pd
import re
from shapely.wkt import loads

THIS_FOLDER = Path(__file__).parent.resolve()

df = pd.read_csv(THIS_FOLDER/"src/Barrios-cluster.csv")
barrios_c = df[['Barrio','Cluster']]
json_data = barrios_c.to_json(orient='records')
json_file = '/static/assets/js/barrios-cluster.json'
with open('barrios-cluster.json', 'w') as f:
    f.write(json_data)

print(f'Archivo JSON guardado en {json_file}')

# # Leer el archivo CSV como un GeoDataFrame
# df = pd.read_csv("src/barrios_med.csv")
# data = {}

# data = {}

# # Iterar a través del DataFrame
# for index, row in df.iterrows():
#     barrio = row['NOMBRE']
#     geometry = row['geometry']

#     if "MULTIPOLYGON" in geometry:
#         # Si es un multipolígono
#         # Eliminar el encabezado "MULTIPOLYGON (((" y el paréntesis final ")))"
#         coordinates_text = geometry.replace("MULTIPOLYGON (((", "").replace(")))", "")
#     elif "POLYGON" in geometry:
#         # Si es un polígono simple (no multipolígono)
#         # Eliminar el encabezado "POLYGON ((" y el paréntesis final "))"
#         coordinates_text = geometry.replace("POLYGON ((", "").replace("))", "")

#     coordinates_text = coordinates_text.replace('((', '')
#     coordinates_text = coordinates_text.replace('(((', '')
#     coordinates_text = coordinates_text.replace('))', '')
#     coordinates_text = coordinates_text.replace(')))', '')
    
#     # Dividir las coordenadas en pares de longitud y latitud
#     coordinates_pairs = coordinates_text.split(", ")
#     coordinates = [pair.split(" ") for pair in coordinates_pairs]

#     # Formatear las coordenadas en la estructura deseada
#     formatted_coordinates = [{'lat': float(lat), 'lng': float(lon)} for lon, lat in coordinates]

#     data[barrio] = {'zonaBarrio': formatted_coordinates}

# # Guardar el diccionario como un archivo JSON
# with open('barrios.json', 'w') as json_file:
#     json.dump(data, json_file, indent=4)

# print("Archivo JSON generado con éxito.")
