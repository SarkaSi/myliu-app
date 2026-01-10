import requests
import base64
import json
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

rokas_data = {
    "age": 45,
    "gender": "man",
    "body_type": "heavier",
    "height": "190cm",
    "hair_color": "dark",
    "eye_color": "brown eyes",
    "interests": ["business/investing", "cars/motorcycles", "travel", "luxury goods", "restaurants and cafes", "sports and active leisure"],
    "bio": "CEO and owner of large construction company. Implemented many prestigious projects in Lithuania and abroad. Looking for reliable and educated partner to share achievements and necessary life comfort."
}

BASE_SEED = 45000

negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic"

scenarios = [
    {
        "name": "rokas_construction_site",
        "prompt": f"realistic photograph, natural portrait of 45 year old Lithuanian construction CEO, {rokas_data['body_type']} body type, {rokas_data['height']}, {rokas_data['hair_color']} hair, {rokas_data['eye_color']}, construction site afternoon, overseeing project, upper body portrait, chest up framing, bright construction site lighting, professional construction attire, premium work outfit, well-groomed executive hair, natural mature skin texture with visible pores, subtle age lines, authoritative confident expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "rokas_luxury_vehicle",
        "prompt": f"realistic photograph, natural portrait of 45 year old Lithuanian construction CEO, {rokas_data['body_type']} body type, {rokas_data['height']}, {rokas_data['hair_color']} hair, {rokas_data['eye_color']}, luxury vehicle afternoon, premium SUV or car, upper body portrait, chest up framing, natural outdoor lighting, sophisticated casual outfit, premium casual wear, executive hairstyle, natural mature skin texture, subtle imperfections, successful confident expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "rokas_business_meeting",
        "prompt": f"realistic photograph, natural portrait of 45 year old Lithuanian construction CEO, {rokas_data['body_type']} body type, {rokas_data['height']}, {rokas_data['hair_color']} hair, {rokas_data['eye_color']}, executive business meeting morning, professional setting, upper body portrait, chest up framing, elegant office lighting, expensive tailored business suit, executive attire, polished executive hair, natural mature skin texture with age lines, subtle imperfections, authoritative professional expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "rokas_restaurant_premium",
        "prompt": f"realistic photograph, natural portrait of 45 year old Lithuanian construction CEO, {rokas_data['body_type']} body type, {rokas_data['height']}, {rokas_data['hair_color']} hair, {rokas_data['eye_color']}, premium restaurant evening, fine dining experience, upper body portrait, chest up framing, warm elegant candlelight, sophisticated evening suit, luxury watch visible, perfectly styled executive hair, natural mature skin texture, subtle age lines, charming authoritative expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "rokas_travel_luxury",
        "prompt": f"realistic photograph, natural portrait of 45 year old Lithuanian construction CEO, {rokas_data['body_type']} body type, {rokas_data['height']}, {rokas_data['hair_color']} hair, {rokas_data['eye_color']}, luxury travel morning, premium hotel or airport lounge, upper body portrait, chest up framing, bright luxury lighting, smart executive travel outfit, premium business casual, well-groomed hair, realistic mature skin texture, minor travel effects, confident successful expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "rokas_casual_executive",
        "prompt": f"realistic photograph, natural portrait of 45 year old Lithuanian construction CEO, {rokas_data['body_type']} body type, {rokas_data['height']}, {rokas_data['hair_color']} hair, {rokas_data['eye_color']}, upscale venue weekend, casual executive setting, upper body portrait, chest up framing, natural afternoon light, sophisticated casual outfit, premium executive casual wear, naturally styled executive hair, realistic mature skin texture with pores, subtle age lines, relaxed authoritative expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
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
            "ad_prompt": "realistic mature executive face, natural skin texture with pores, detailed eyes, natural expression, subtle age lines, authoritative distinguished appearance",
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
    
    print("Starting to generate images for Rokas...")
    
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
