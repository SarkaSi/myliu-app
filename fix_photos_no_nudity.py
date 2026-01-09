import requests
import sys
import os

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

def get_best_checkpoint():
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
        return checkpoint_name
    except:
        return None

def generate_image(prompt, negative_prompt, seed, scenario_name, checkpoint=None):
    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 40,
        "cfg_scale": 7.5,
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
                output_path = f"generated_photos/{scenario_name}.png"
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

# Negative prompt su stipriu nuogumo apribojimu
negative_prompt = "(Negative Realistic 3:1.0), nude, naked, topless, bare chest, exposed breasts, nipples, exposed genitals, no clothes, underwear visible, lingerie, bikini, swimsuit revealing, cleavage, nude body, naked body, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing"

# Problematic photos to regenerate
photos_to_fix = [
    # Agnė - romantic_dinner
    {
        "name": "agne_romantic_dinner",
        "person": "29 year old woman",
        "hair": "light blonde hair",
        "eyes": "green eyes",
        "body": "athletic body type, height 169cm",
        "prompt": "realistic photograph, romantic portrait of 29 year old woman, light blonde hair, green eyes, athletic body type, height 169cm, romantic restaurant evening, candlelight dinner, upper body portrait, chest up framing, warm candlelight, elegant romantic evening dress with high neckline, classy sophisticated outfit, completely covered, no skin exposure, romantic expression, realistic skin texture, natural imperfections, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant dress",
        "seed": 11111 + 4
    },
    # Aurelija - summer_resort
    {
        "name": "aurelija_summer_resort",
        "person": "45 year old elegant businesswoman",
        "hair": "light hair",
        "eyes": "blue eyes",
        "body": "average body type, height 175cm",
        "prompt": "realistic photograph, elegant portrait of 45 year old elegant businesswoman, light hair, blue eyes, average body type, height 175cm, at luxury resort during Lithuanian summer, upper body portrait, chest up framing, sunny day, sophisticated atmosphere, elegant summer resort outfit with high neckline, completely covered, no skin exposure, classy sophisticated clothing, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant resort wear",
        "seed": 16000 + 3
    },
    # Aurelija - winter_elegant
    {
        "name": "aurelija_winter_elegant",
        "person": "45 year old elegant businesswoman",
        "hair": "light hair",
        "eyes": "blue eyes",
        "body": "average body type, height 175cm",
        "prompt": "realistic photograph, elegant portrait of 45 year old elegant businesswoman, light hair styled professionally, blue eyes, average body type, height 175cm, wearing elegant winter business outfit with fur coat, during deep Lithuanian winter, sophisticated urban setting, winter afternoon light, upper body portrait, chest up framing, completely covered, no skin exposure, classy sophisticated clothing, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant winter outfit",
        "seed": 16000 + 1
    },
    # Aurelija - autumn_gala
    {
        "name": "aurelija_autumn_gala",
        "person": "45 year old elegant businesswoman",
        "hair": "light hair",
        "eyes": "blue eyes",
        "body": "average body type, height 175cm",
        "prompt": "realistic photograph, elegant portrait of 45 year old elegant businesswoman, light hair, blue eyes, average body type, height 175cm, wearing elegant evening gown with high neckline, at gala event during Lithuanian autumn, sophisticated venue, warm evening lighting, upper body portrait, chest up framing, completely covered, no skin exposure, classy sophisticated evening dress, realistic skin texture, natural imperfections like wrinkles, age spots, subtle freckles, professional elegant styling, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant gala dress",
        "seed": 16000 + 4
    },
    # Simona - sensual
    {
        "name": "simona_sensual",
        "person": "27 year old woman",
        "hair": "light blonde hair",
        "eyes": "blue eyes",
        "body": "medium body type, height 172cm",
        "prompt": "realistic photograph, elegant portrait of 27 year old woman, light blonde hair, blue eyes, medium body type, height 172cm, sophisticated evening setting, upper body portrait, chest up framing, soft dim lighting, elegant tasteful evening dress with high neckline, classy sophisticated outfit, completely covered, no skin exposure, tasteful elegant expression, confident gaze, realistic skin texture, natural imperfections, sophisticated, real photo, authentic, high quality, detailed face, photorealistic, portrait photography, fully clothed, conservative elegant dress",
        "seed": 54321 + 3
    },
    # Greta - erotic
    {
        "name": "greta_erotic",
        "person": "29 year old woman",
        "hair": "red hair",
        "eyes": "brown eyes",
        "body": "athletic body type, height 165cm",
        "prompt": "realistic photograph, elegant sensual portrait of 29 year old woman, red hair, brown eyes, athletic body type, height 165cm, sophisticated evening setting, upper body portrait, chest up framing, soft dim lighting, elegant tasteful evening dress with high neckline, classy sophisticated outfit, completely covered, no skin exposure, tasteful elegant expression, confident sensual gaze, realistic skin texture, natural imperfections, sophisticated, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant dress",
        "seed": 98765 + 4
    },
    # Greta - sexy
    {
        "name": "greta_sexy",
        "person": "29 year old woman",
        "hair": "red hair",
        "eyes": "brown eyes",
        "body": "athletic body type, height 165cm",
        "prompt": "realistic photograph, elegant sensual portrait of 29 year old woman, red hair, brown eyes, athletic body type, height 165cm, sophisticated evening setting, upper body portrait, chest up framing, soft dim lighting, elegant tasteful evening dress with high neckline, classy sophisticated outfit, completely covered, no skin exposure, tasteful elegant expression, confident sensual gaze, realistic skin texture, natural imperfections, sophisticated, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant dress",
        "seed": 98765 + 5
    },
    # Ieva - romantic_evening
    {
        "name": "ieva_romantic_evening",
        "person": "26 year old woman",
        "hair": "light blonde hair",
        "eyes": "blue eyes",
        "body": "slim body type, height 170cm",
        "prompt": "realistic photograph, romantic portrait of 26 year old woman, light blonde hair, blue eyes, slim body type, height 170cm, romantic restaurant evening, candlelight dinner, upper body portrait, chest up framing, warm candlelight, elegant romantic evening dress with high neckline, classy sophisticated outfit, completely covered, no skin exposure, romantic expression, realistic skin texture, natural imperfections, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant dress",
        "seed": 12345 + 4
    },
    # Ieva - summer_beach (beach photo can be problematic)
    {
        "name": "ieva_summer_beach",
        "person": "26 year old woman",
        "hair": "light blonde hair",
        "eyes": "blue eyes",
        "body": "slim body type, height 170cm",
        "prompt": "realistic photograph, natural portrait of 26 year old woman, light blonde hair, blue eyes, slim body type, height 170cm, at beach during Lithuanian summer, walking with dog, upper body portrait, chest up framing, bright natural sunlight, casual summer outfit with loose white shirt and shorts, completely covered, no skin exposure, beach background with sand and sea, realistic skin texture with freckles from sun, natural imperfections, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative casual beach wear",
        "seed": 12345 + 1
    },
]

if __name__ == "__main__":
    if not check_api_available():
        print("Error: Stable Diffusion API is not available")
        sys.exit(1)
    
    print("Fixing photos - removing any nudity...")
    
    checkpoint = get_best_checkpoint()
    if checkpoint:
        print(f"Using checkpoint: {checkpoint}")
    else:
        print("Using default checkpoint")
    
    for i, photo in enumerate(photos_to_fix):
        print(f"\nGenerating {i+1}/{len(photos_to_fix)}: {photo['name']}")
        generate_image(
            photo["prompt"],
            negative_prompt,
            photo["seed"],
            photo["name"],
            checkpoint
        )
    
    print("\nDone! All problematic photos regenerated without nudity.")
