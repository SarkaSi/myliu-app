import requests
import base64
import json
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

vakarelis_data = {
    "age": 27,
    "gender": "man",
    "body_type": "average",
    "height": "180cm",
    "hair_color": "dark",
    "eye_color": "brown eyes",
    "interests": ["nature walks", "fishing/hunting", "animals", "camping", "hiking/mountains", "photography"],
    "bio": "Wildlife lover, fisherman and nature scientist. Love exploring nature and being outdoors. Looking for partner who values nature like I do."
}

BASE_SEED = 27000

negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic"

scenarios = [
    {
        "name": "vakarelis_fishing_river",
        "prompt": f"realistic photograph, natural portrait of 27 year old Lithuanian wild young man, {vakarelis_data['body_type']} body type, {vakarelis_data['height']}, {vakarelis_data['hair_color']} hair, {vakarelis_data['eye_color']}, fishing at river morning, wilderness river setting, upper body portrait, chest up framing, natural morning sunlight, outdoor fishing outfit, casual wilderness clothes, naturally styled hair, natural average skin texture with water effects, minor outdoor imperfections, focused peaceful expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "vakarelis_forest_wildlife",
        "prompt": f"realistic photograph, natural portrait of 27 year old Lithuanian wild young man, {vakarelis_data['body_type']} body type, {vakarelis_data['height']}, {vakarelis_data['hair_color']} hair, {vakarelis_data['eye_color']}, forest wildlife observation afternoon, deep wilderness, upper body portrait, chest up framing, natural forest lighting, outdoor observation outfit, casual nature clothes, naturally styled hair, natural average skin texture with forest effects, minor outdoor imperfections, curious observant expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "vakarelis_camping_lake",
        "prompt": f"realistic photograph, natural portrait of 27 year old Lithuanian wild young man, {vakarelis_data['body_type']} body type, {vakarelis_data['height']}, {vakarelis_data['hair_color']} hair, {vakarelis_data['eye_color']}, camping at lake evening, wilderness lake camp, upper body portrait, chest up framing, warm evening lighting, camping outfit, casual outdoor clothes, slightly tousled hair, natural average skin texture with camping effects, minor outdoor imperfections, relaxed nature expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "vakarelis_hiking_mountains",
        "prompt": f"realistic photograph, natural portrait of 27 year old Lithuanian wild young man, {vakarelis_data['body_type']} body type, {vakarelis_data['height']}, {vakarelis_data['hair_color']} hair, {vakarelis_data['eye_color']}, hiking mountains morning, mountain wilderness, upper body portrait, chest up framing, bright mountain sunlight, hiking gear outfit, outdoor adventure clothes, wind-blown hair, natural average skin texture with hiking effects, minor outdoor imperfections, determined nature expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "vakarelis_nature_exploration",
        "prompt": f"realistic photograph, natural portrait of 27 year old Lithuanian wild young man, {vakarelis_data['body_type']} body type, {vakarelis_data['height']}, {vakarelis_data['hair_color']} hair, {vakarelis_data['eye_color']}, nature exploration afternoon, wild nature, upper body portrait, chest up framing, natural afternoon light, outdoor exploration outfit, casual wilderness clothes, naturally styled hair, natural average skin texture with nature effects, minor outdoor imperfections, curious scientific expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "vakarelis_wilderness_adventure",
        "prompt": f"realistic photograph, natural portrait of 27 year old Lithuanian wild young man, {vakarelis_data['body_type']} body type, {vakarelis_data['height']}, {vakarelis_data['hair_color']} hair, {vakarelis_data['eye_color']}, wilderness adventure afternoon, open wild nature, upper body portrait, chest up framing, natural outdoor sunlight, casual wilderness outfit, outdoor adventure clothes, naturally messy hair, realistic average skin texture with wilderness effects, minor imperfections, free nature-loving expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    }
]

def check_api_available():
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_best_checkpoint():
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models", timeout=5)
        if response.status_code == 200:
            models = response.json()
            for model in models:
                title = model.get('title', '').lower()
                model_name = model.get('model_name', '').lower()
                if any(keyword in title or keyword in model_name for keyword in ['realistic', 'real', 'photorealistic', 'photo', '1.5']):
                    return model.get('title', '')
            if models:
                return models[0].get('title', '')
        return None
    except:
        return None

def generate_image(prompt, negative_prompt, seed, output_dir, scenario_index, checkpoint=None):
    adetailer_args = [
        {
            "ad_model": "face_yolov8n.pt",
            "ad_prompt": "realistic young wild face, natural average skin texture with pores, detailed eyes, natural expression, subtle imperfections, nature-loving appearance",
            "ad_negative_prompt": "bad face, deformed face, blurry face, perfect skin, flawless, airbrushed, worst quality, low quality",
            "ad_confidence": 0.3,
            "ad_mask_k_largest": 1,
            "ad_mask_min_ratio": 0.0,
            "ad_mask_max_ratio": 1.0,
            "ad_dilate_erode": 4,
            "ad_x_offset": 0,
            "ad_y_offset": 0,
            "ad_mask_merge_invert": "None",
            "ad_mask_blur": 4,
            "ad_denoising_strength": 0.4,
            "ad_inpaint_only_masked": True,
            "ad_inpaint_only_masked_padding": 32,
            "ad_use_inpaint_width_height": False,
            "ad_inpaint_width": 512,
            "ad_inpaint_height": 512,
            "ad_use_steps": True,
            "ad_steps": 30,
            "ad_use_cfg_scale": False,
            "ad_cfg_scale": 7.0,
            "ad_use_sampler": False,
            "ad_sampler": "DPM++ 2M Karras",
            "ad_use_noise_multiplier": False,
            "ad_noise_multiplier": 1.0,
            "ad_use_clip_skip": False,
            "ad_clip_skip": 1,
            "ad_restore_face": False,
            "ad_controlnet_model": "None",
            "ad_controlnet_module": "None",
            "ad_controlnet_weight": 1.0,
            "ad_controlnet_guidance_start": 0.0,
            "ad_controlnet_guidance_end": 1.0
        }
    ]
    
    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 40,
        "cfg_scale": 7.5,
        "width": 512,
        "height": 768,
        "sampler_name": "DPM++ 2M Karras",
        "scheduler": "Karras",
        "alwayson_scripts": {
            "ADetailer": {
                "args": adetailer_args
            }
        }
    }
    
    if checkpoint:
        try:
            switch_response = requests.post(f"{API_URL}/sdapi/v1/options", json={"sd_model_checkpoint": checkpoint}, timeout=5)
        except:
            pass
    
    try:
        print(f"Generating image with seed {seed}...")
        response = requests.post(f"{API_URL}/sdapi/v1/txt2img", json=payload, timeout=400)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                image_data = result['images'][0]
                image_bytes = base64.b64decode(image_data)
                
                output_path = output_dir / f"{scenarios[scenario_index]['name']}.png"
                with open(output_path, 'wb') as f:
                    f.write(image_bytes)
                
                print(f"Image saved: {output_path}")
                return output_path
            else:
                print("Error: API did not return image")
                return None
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(response.text[:500])
            return None
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

def main():
    output_dir = Path("generated_photos")
    output_dir.mkdir(exist_ok=True)
    
    print("Checking if Stable Diffusion API is available...")
    if not check_api_available():
        print("ERROR: Stable Diffusion API is not available!")
        return
    
    print("API is available! Looking for best checkpoint...")
    checkpoint = get_best_checkpoint()
    if checkpoint:
        print(f"Using checkpoint: {checkpoint}")
    else:
        print("Using default checkpoint")
    
    print("Starting to generate images for Vakarėlis...")
    
    generated_files = []
    
    for i, scenario in enumerate(scenarios):
        seed = BASE_SEED + i * 150
        prompt = scenario["prompt"]
        
        file_path = generate_image(prompt, negative_prompt, seed, output_dir, i, checkpoint)
        if file_path:
            generated_files.append(file_path)
        
        print(f"Generated {i+1}/6 images\n")
    
    if generated_files:
        print(f"All images successfully generated!")
        for file in generated_files:
            print(f"  - {file}")
    else:
        print("Failed to generate images")

if __name__ == "__main__":
    main()
