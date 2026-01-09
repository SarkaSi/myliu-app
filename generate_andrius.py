import requests
import base64
import json
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

andrius_data = {
    "age": 31,
    "gender": "man",
    "body_type": "athletic",
    "height": "180cm",
    "hair_color": "dark",
    "eye_color": "brown eyes",
    "interests": ["sports and active leisure", "travel", "music", "concerts"],
    "bio": "Doctor, love sports and travel. Looking for serious relationships."
}

BASE_SEED = 55555

negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic"

scenarios = [
    {
        "name": "andrius_hospital_shift",
        "prompt": f"realistic photograph, natural portrait of 31 year old man, {andrius_data['body_type']} body type, {andrius_data['height']}, {andrius_data['hair_color']} hair, {andrius_data['eye_color']}, hospital morning shift, professional medical setting, upper body portrait, chest up framing, bright hospital lighting, medical scrubs, professional medical attire, well-groomed hair, natural skin texture with visible pores, minor imperfections, compassionate professional expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "andrius_sports_outdoor",
        "prompt": f"realistic photograph, natural portrait of 31 year old man, {andrius_data['body_type']} body type, {andrius_data['height']}, {andrius_data['hair_color']} hair, {andrius_data['eye_color']}, outdoor sports afternoon, running in park, upper body portrait, chest up framing, natural outdoor sunlight, athletic sports outfit, workout clothes, slightly sweaty hair, natural skin texture with pores, minor sweat effects, energetic expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "andrius_concert_night",
        "prompt": f"realistic photograph, natural portrait of 31 year old man, {andrius_data['body_type']} body type, {andrius_data['height']}, {andrius_data['hair_color']} hair, {andrius_data['eye_color']}, live concert evening, enjoying music, upper body portrait, chest up framing, dynamic stage lighting, casual concert outfit, stylish casual clothes, natural hairstyle, realistic skin texture, subtle imperfections, enthusiastic expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "andrius_travel_adventure",
        "prompt": f"realistic photograph, natural portrait of 31 year old man, {andrius_data['body_type']} body type, {andrius_data['height']}, {andrius_data['hair_color']} hair, {andrius_data['eye_color']}, travel adventure morning, exploring destination, upper body portrait, chest up framing, natural travel sunlight, casual adventure outfit, comfortable travel clothes, wind-blown hair, natural skin texture with travel effects, minor sun imperfections, adventurous expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "andrius_restaurant_evening",
        "prompt": f"realistic photograph, natural portrait of 31 year old man, {andrius_data['body_type']} body type, {andrius_data['height']}, {andrius_data['hair_color']} hair, {andrius_data['eye_color']}, elegant restaurant evening, romantic dinner, upper body portrait, chest up framing, warm candlelight, sophisticated evening outfit, elegant shirt, polished hairstyle, natural skin texture, subtle imperfections, charming genuine expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "andrius_casual_weekend",
        "prompt": f"realistic photograph, natural portrait of 31 year old man, {andrius_data['body_type']} body type, {andrius_data['height']}, {andrius_data['hair_color']} hair, {andrius_data['eye_color']}, casual weekend morning, coffee time, upper body portrait, chest up framing, natural morning light, comfortable weekend outfit, relaxed casual clothes, natural hairstyle, realistic skin texture with pores, minor imperfections, relaxed content expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
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


