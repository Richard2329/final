import os
import time
import requests
import hashlib
from serpapi import GoogleSearch

API_KEY = "647987a6252d84f1473aa821e85738106070c72d7b725d553c68cc5b570a65e1"
QUERIES = [
    "rabbit wildlife photography",
    "wild rabbit animal",
    "rabbit in nature",
    "rabbit eating grass",
    "rabbit forest animal"
]

TOTAL_IMAGENES = 520
CARPETA = "dataset_conejos"

os.makedirs(CARPETA, exist_ok=True)

hashes = set()
contador = 0

print("Iniciando descarga con multiples busquedas...")

for query in QUERIES:
    pagina = 0
    print(f"\nBuscando: {query}")

    while contador < TOTAL_IMAGENES:
        params = {
            "engine": "google_images",
            "q": query,
            "api_key": API_KEY,
            "ijn": pagina
        }

        search = GoogleSearch(params)
        resultados = search.get_dict()

        if "error" in resultados:
            print("Error SerpAPI:", resultados["error"])
            break

        imagenes = resultados.get("images_results", [])
        if not imagenes:
            break

        for img in imagenes:
            if contador >= TOTAL_IMAGENES:
                break

            try:
                url = img.get("original")
                if not url:
                    continue

                r = requests.get(url, timeout=10)
                if r.status_code != 200:
                    continue

                data = r.content
                h = hashlib.md5(data).hexdigest()
                if h in hashes:
                    continue

                nombre = f"conejo_{contador+1}.jpg"
                with open(os.path.join(CARPETA, nombre), "wb") as f:
                    f.write(data)

                hashes.add(h)
                contador += 1
                print(f"Descargada {contador}/{TOTAL_IMAGENES}")

                time.sleep(0.2)

            except:
                continue

        pagina += 1

    if contador >= TOTAL_IMAGENES:
        break

print("\nDESCARGA COMPLETADA")
print(f"Total final: {contador}")
input("Presiona ENTER para salir...")