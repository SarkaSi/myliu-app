import requests
import base64
import json
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

darius_data = {
    "age": 32,
    "gender": "man",
    "body_type": "average",
    "height": "178cm",
    "hair_color": "dark",
    "eye_color": "green eyes",
    "interests": ["technology", "nature walks", "hiking/mountains", "board games"],
    "bio": "Engineer, love technology and nature. Calm and responsible."
}

BASE_SEED = 33333

negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic, woman, female, girl, feminine, breasts, long hair, makeup, lipstick, dress, skirt, female clothing"

scenarios = [
    {
        "name": "darius_hiking_adventure",
        "prompt": f"realistic photograph, natural portrait of 32 year old man, {darius_data['body_type']} body type, {darius_data['height']}, {darius_data['hair_color']} hair, {darius_data['eye_color']}, mountain hiking morning, nature adventure, upper body portrait, chest up framing, natural mountain sunlight, outdoor hiking gear, comfortable adventure clothes, slightly wind-blown hair, natural skin texture with visible pores, minor sun imperfections, adventurous expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "darius_tech_workspace",
        "prompt": f"realistic photograph, natural portrait of 32 year old man, {darius_data['body_type']} body type, {darius_data['height']}, {darius_data['hair_color']} hair, {darius_data['eye_color']}, tech workspace afternoon, working on project, upper body portrait, chest up framing, natural office lighting, casual tech outfit, comfortable work clothes, natural hairstyle, realistic skin texture with pores, subtle imperfections, focused expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "darius_board_game_evening",
        "prompt": f"realistic photograph, natural portrait of 32 year old man, {darius_data['body_type']} body type, {darius_data['height']}, {darius_data['hair_color']} hair, {darius_data['eye_color']}, board game night, playing with friends, upper body portrait, chest up framing, warm indoor lighting, casual comfortable outfit, relaxed clothes, slightly tousled hair, natural skin texture, minor imperfections, friendly relaxed expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "darius_nature_walk",
        "prompt": f"realistic photograph, natural portrait of 32 year old male, man, {darius_data['body_type']} body type, {darius_data['height']}, {darius_data['hair_color']} hair, {darius_data['eye_color']}, bearded or stubbled face, masculine features, peaceful nature walk afternoon, forest path, upper body portrait, chest up framing, soft natural forest light, casual outdoor outfit, comfortable walking clothes, natural male hairstyle, realistic male skin texture, subtle imperfections, calm peaceful masculine expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "darius_coffee_cafe",
        "prompt": f"realistic photograph, natural portrait of 32 year old male, man, {darius_data['body_type']} body type, {darius_data['height']}, {darius_data['hair_color']} hair, {darius_data['eye_color']}, bearded or stubbled face, masculine features, cozy cafe morning, reading and coffee, upper body portrait, chest up framing, natural window light, casual comfortable male outfit, relaxed weekend clothes, natural male hairstyle, realistic male skin texture with pores, minor imperfections, relaxed thoughtful masculine expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "darius_evening_date",
        "prompt": f"realistic photograph, natural portrait of 32 year old man, {darius_data['body_type']} body type, {darius_data['height']}, {darius_data['hair_color']} hair, {darius_data['eye_color']}, romantic restaurant evening, dinner date, upper body portrait, chest up framing, warm candlelight, smart casual outfit, elegant shirt, well-groomed hair, natural skin texture, subtle imperfections, charming genuine expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
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
            "ad_prompt": "realistic face, natural skin texture with pores, detailed eyes, natural expression, subtle imperfections",
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
    
    print("Starting to generate images...")
    
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

