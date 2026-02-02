import requests
import time

API_URL = "http://127.0.0.1:7860"

print("Tikrinu API...")
for i in range(12):
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models", timeout=5)
        if response.status_code == 200:
            print(f"вњ… API veikia! ({i+1} bandymas)")
            models = response.json()
            print(f"Rasti modeliai: {len(models)}")
            if models:
                print(f"Pirmas modelis: {models[0].get('title', 'N/A')}")
            break
    except Exception as e:
        print(f"Bandymas {i+1}/12: API dar nepasiruoЕЎД™s...")
        time.sleep(5)
else:
    print("вќЊ API nepasiruoЕЎД— per 60 sekundЕѕiЕі")
