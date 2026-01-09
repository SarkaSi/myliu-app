import requests
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

def check_api_available():
    try:
        # Try main page first
        response = requests.get(f"{API_URL}/", timeout=5)
        if response.status_code == 200:
            # Try API endpoint
            try:
                api_response = requests.get(f"{API_URL}/sdapi/v1/options", timeout=5)
                return api_response.status_code == 200
            except:
                # If API endpoint doesn't work, but main page does, assume API is starting
                return True
        return False
    except:
        return False

def generate_image(prompt, negative_prompt, seed, scenario_name, checkpoint=None):
    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 35,
        "cfg_scale": 7,
        "width": 512,
        "height": 768,
        "sampler_name": "DPM++ 2M Karras",
        "adetailer_args": {
            "ad_model": "face_yolov8n.pt",
            "ad_denoising_strength": 0.4,
            "ad_confidence": 0.3
        }
    }
    
    if checkpoint:
        payload["override_settings"] = {"sd_model_checkpoint": checkpoint}
    
    try:
        response = requests.post(f"{API_URL}/sdapi/v1/txt2img", json=payload, timeout=300)
        if response.status_code == 200:
            result = response.json()
            if result.get("images"):
                import base64
                image_data = base64.b64decode(result["images"][0])
                output_path = f"generated_photos/aurelija_{scenario_name}.png"
                os.makedirs("generated_photos", exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(image_data)
                print(f"Generated: {output_path}")
                return True
        print(f"Error: {response.status_code}")
        return False
    except Exception as e:
        print(f"Error generating image: {e}")
        return False

aurelija_data = {
    "name": "Aurelija",
    "age": 45,
    "hairColor": "Sviesus",
    "eyeColor": "Melynos",
    "bodyType": "Vidutinis",
    "height": "170",
    "gender": "Moteris"
}

BASE_SEED = 16000

negative_prompt = "(Negative Realistic 3:1.0), hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, nude, topless, exposed breasts"

scenarios = [
    {
        "name": "winter_elegant",
        "prompt": "45 year old elegant businesswoman with light hair styled professionally and blue eyes, average body type, wearing elegant winter business outfit with fur coat, during deep Lithuanian winter, sophisticated urban setting, winter afternoon light, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 1
    },
    {
        "name": "spring_business",
        "prompt": "45 year old elegant businesswoman with light hair and blue eyes, average body type, wearing elegant spring business suit, at business meeting during Lithuanian spring, modern office setting, warm spring light, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, slightly messy professional hair, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 2
    },
    {
        "name": "summer_resort",
        "prompt": "45 year old elegant businesswoman with light hair and blue eyes, average body type, wearing elegant summer resort outfit, at luxury resort during Lithuanian summer, sunny day, sophisticated atmosphere, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 3
    },
    {
        "name": "autumn_gala",
        "prompt": "45 year old elegant businesswoman with light hair and blue eyes, average body type, wearing elegant evening gown, at gala event during Lithuanian autumn, sophisticated venue, warm evening lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, professional elegant styling, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 4
    },
    {
        "name": "winter_restaurant",
        "prompt": "45 year old elegant businesswoman with light hair and blue eyes, average body type, wearing elegant winter evening outfit, at upscale restaurant during deep Lithuanian winter, sophisticated interior, warm restaurant lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 5
    },
    {
        "name": "spring_garden",
        "prompt": "45 year old elegant businesswoman with light hair and blue eyes, average body type, wearing elegant spring outfit, in garden during Lithuanian spring, flowering garden, afternoon sunlight, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, slightly messy professional hair, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 6
    }
]

if __name__ == "__main__":
    if not check_api_available():
        print("Error: Stable Diffusion API is not available")
        sys.exit(1)
    
    print("Generating images for Aurelija...")
    
    # Get available checkpoints
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models")
        checkpoints = response.json()
        checkpoint_name = None
        for cp in checkpoints:
            if "realistic" in cp["model_name"].lower() or "photorealistic" in cp["model_name"].lower():
                checkpoint_name = cp["model_name"]
                break
        if not checkpoint_name and checkpoints:
            checkpoint_name = checkpoints[0]["model_name"]
        print(f"Using checkpoint: {checkpoint_name}")
    except:
        checkpoint_name = None
        print("Could not fetch checkpoints, using default")
    
    for i, scenario in enumerate(scenarios):
        print(f"Generating {i+1}/6: {scenario['name']}")
        generate_image(
            scenario["prompt"],
            negative_prompt,
            scenario["seed"],
            scenario["name"],
            checkpoint_name
        )
    
    print("Done!")

