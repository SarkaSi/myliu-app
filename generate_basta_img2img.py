import requests
import sys
import os
import base64

sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

def check_api_available():
    try:
        response = requests.get(f"{API_URL}/", timeout=5)
        if response.status_code == 200:
            try:
                api_response = requests.get(f"{API_URL}/sdapi/v1/options", timeout=5)
                return api_response.status_code == 200
            except:
                return True
        return False
    except:
        return False

def load_base_image(image_path):
    """Load base image and convert to base64"""
    if os.path.exists(image_path):
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode('utf-8')
    return None

def generate_base_image(prompt, negative_prompt, seed, checkpoint=None):
    """Generate base image with tattoos"""
    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 40,
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
                image_data = base64.b64decode(result["images"][0])
                output_path = "generated_photos/basta_base_reference.png"
                os.makedirs("generated_photos", exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(image_data)
                print(f"Base image generated: {output_path}")
                return output_path
        return None
    except Exception as e:
        print(f"Error generating base image: {e}")
        return None

def generate_image_img2img(base_image_path, prompt, negative_prompt, seed, scenario_name, denoising_strength=0.5, checkpoint=None):
    """Generate image using img2img with base image as reference"""
    base_image_b64 = load_base_image(base_image_path)
    if not base_image_b64:
        print(f"Error: Could not load base image {base_image_path}")
        return False
    
    payload = {
        "init_images": [base_image_b64],
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 35,
        "cfg_scale": 7,
        "width": 512,
        "height": 768,
        "sampler_name": "DPM++ 2M Karras",
        "denoising_strength": denoising_strength,  # Lower = keeps more of original
        "adetailer_args": {
            "ad_model": "face_yolov8n.pt",
            "ad_denoising_strength": 0.4,
            "ad_confidence": 0.3
        }
    }
    
    if checkpoint:
        payload["override_settings"] = {"sd_model_checkpoint": checkpoint}
    
    try:
        response = requests.post(f"{API_URL}/sdapi/v1/img2img", json=payload, timeout=300)
        if response.status_code == 200:
            result = response.json()
            if result.get("images"):
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

# Detalus tatuiruotės aprašymas
TATTOO_DESCRIPTION = "tattoo on left arm: geometric mandala pattern in black ink, tattoo on right arm: detailed rose with thorns in black and red ink, tattoo on neck: small anchor in black ink, tattoo on left shoulder: music note in black ink, tattoo on right shoulder: small star in black ink, all tattoos clearly visible and in same positions"

negative_prompt = "(Negative Realistic 3:1.0), hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, nude, topless, exposed breasts"

# Base image prompt - su labai detaliu tatuiruotės aprašymu
base_prompt = f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing casual punk outfit, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art"

scenarios = [
    {
        "name": "winter_concert",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing punk winter outfit with leather jacket, at underground concert during deep Lithuanian winter, dark atmosphere, stage lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 1,
        "denoising_strength": 0.55
    },
    {
        "name": "spring_art",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing artistic spring outfit, in art studio during Lithuanian spring, art supplies visible, warm spring light, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy multi-colored hair, slightly disheveled clothes, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 2,
        "denoising_strength": 0.55
    },
    {
        "name": "summer_festival",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing festival outfit, at music festival during Lithuanian summer, sunny day, crowd in background, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 3,
        "denoising_strength": 0.55
    },
    {
        "name": "autumn_studio",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing casual autumn outfit, in artist studio during Lithuanian autumn, rainy day outside, warm indoor lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy multi-colored hair, slightly wrinkled clothes, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 4,
        "denoising_strength": 0.55
    },
    {
        "name": "winter_indoor",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing cozy winter punk outfit, indoors during deep Lithuanian winter, alternative interior, winter evening lighting, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 5,
        "denoising_strength": 0.55
    },
    {
        "name": "spring_outdoor",
        "prompt": f"29 year old punk rock woman with colorful multi-colored hair and brown eyes, {TATTOO_DESCRIPTION}, larger body type, wearing spring punk fashion, outdoor during Lithuanian spring, urban setting, afternoon sunlight, realistic photograph, natural portrait, chest up framing, no hands visible, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy multi-colored hair, slightly disheveled clothes, same tattoos in same positions on body, real photo, authentic, documentary style, not AI art",
        "seed": BASE_SEED + 6,
        "denoising_strength": 0.55
    }
]

if __name__ == "__main__":
    if not check_api_available():
        print("Error: Stable Diffusion API is not available")
        sys.exit(1)
    
    print("Generating images for Basta using img2img method...")
    
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
    
    # Step 1: Generate base image with tattoos
    print("\nStep 1: Generating base reference image with tattoos...")
    base_image_path = generate_base_image(
        base_prompt,
        negative_prompt,
        BASE_SEED,
        checkpoint_name
    )
    
    if not base_image_path:
        print("Error: Could not generate base image")
        sys.exit(1)
    
    # Step 2: Generate all scenarios using img2img with base image
    print("\nStep 2: Generating scenarios using base image as reference...")
    for i, scenario in enumerate(scenarios):
        print(f"Generating {i+1}/6: {scenario['name']}")
        generate_image_img2img(
            base_image_path,
            scenario["prompt"],
            negative_prompt,
            scenario["seed"],
            scenario["name"],
            scenario["denoising_strength"],
            checkpoint_name
        )
    
    print("\nDone! All images generated with consistent tattoos.")


