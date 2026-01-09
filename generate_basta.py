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
                output_path = f"generated_photos/basta_{scenario_name}.png"
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

basta_data = {
    "name": "Basta",
    "age": 29,
    "hairColor": "Daugiaspalviai",
    "eyeColor": "Rudos",
    "bodyType": "Stambesnis",
    "height": "172",
    "gender": "Moteris"
}

BASE_SEED = 15000

# Detalus tatuiruotės aprašymas, kad būtų tos pačios visose nuotraukose
TATTOO_DESCRIPTION = "tattoo on left arm: geometric mandala pattern, tattoo on right arm: rose with thorns, tattoo on neck: small anchor, tattoo on left shoulder: music note, tattoo on right shoulder: small star"

negative_prompt = "(Negative Realistic 3:1.0), hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, nude, topless, exposed breasts"

scenarios = [
    {
        "name": "winter_concert",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing punk winter outfit with leather jacket, at underground concert during deep Lithuanian winter, dark atmosphere, stage lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 1
    },
    {
        "name": "spring_art",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing artistic spring outfit, in art studio during Lithuanian spring, art supplies visible, warm spring light, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy multi-colored hair, slightly disheveled clothes, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 2
    },
    {
        "name": "summer_festival",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing festival outfit, at music festival during Lithuanian summer, sunny day, crowd in background, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 3
    },
    {
        "name": "autumn_studio",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing casual autumn outfit, in artist studio during Lithuanian autumn, rainy day outside, warm indoor lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy multi-colored hair, slightly wrinkled clothes, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 4
    },
    {
        "name": "winter_indoor",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing cozy winter punk outfit, indoors during deep Lithuanian winter, alternative interior, winter evening lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 5
    },
    {
        "name": "spring_outdoor",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing spring punk fashion, outdoor during Lithuanian spring, urban setting, afternoon sunlight, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy multi-colored hair, slightly disheveled clothes, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 6
    }
]

if __name__ == "__main__":
    if not check_api_available():
        print("Error: Stable Diffusion API is not available")
        sys.exit(1)
    
    print("Generating images for Basta...")
    
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

