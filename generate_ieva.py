import requests
import base64
import json
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

# Ieva profilio duomenys
ieva_data = {
    "age": 26,
    "gender": "woman",
    "body_type": "slim",
    "height": "170cm",
    "hair_color": "light blonde",
    "eye_color": "blue eyes",
    "interests": ["reading", "travel", "animals", "dogs/cats"],
    "bio": "Teacher, love children and travel. Looking for a family person."
}

BASE_SEED = 12345

negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic, nude, topless, exposed breasts"

scenarios = [
    {
        "name": "ieva_spring_morning",
        "prompt": f"realistic photograph, natural portrait of 26 year old woman, {ieva_data['body_type']} body type, {ieva_data['height']}, {ieva_data['hair_color']} hair, {ieva_data['eye_color']}, spring morning in cozy cafe, reading a book, upper body portrait, chest up framing, soft morning sunlight through window, casual spring dress, light cardigan, slightly messy hair from morning, natural skin texture with visible pores, subtle freckles, minor skin imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "ieva_summer_beach",
        "prompt": f"realistic photograph, natural portrait of 26 year old woman, {ieva_data['body_type']} body type, {ieva_data['height']}, {ieva_data['hair_color']} hair, {ieva_data['eye_color']}, summer afternoon at beach, walking with dog, upper body portrait, chest up framing, bright natural sunlight, summer casual outfit, loose white shirt and shorts, completely covered, no skin exposure, wind-blown hair, natural skin texture with freckles from sun, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic, fully clothed, conservative casual beach wear"
    },
    {
        "name": "ieva_autumn_park",
        "prompt": f"realistic photograph, natural portrait of 26 year old woman, {ieva_data['body_type']} body type, {ieva_data['height']}, {ieva_data['hair_color']} hair, {ieva_data['eye_color']}, autumn evening in park, feeding ducks, upper body portrait, chest up framing, golden hour lighting, autumn cozy sweater, scarf, natural hair slightly disheveled, realistic skin texture with pores, subtle imperfections, gentle expression lines, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "ieva_winter_indoor",
        "prompt": f"realistic photograph, natural portrait of 26 year old woman, {ieva_data['body_type']} body type, {ieva_data['height']}, {ieva_data['hair_color']} hair, {ieva_data['eye_color']}, winter evening at home, reading with cat, upper body portrait, chest up framing, warm indoor lighting, comfortable winter sweater, messy bun, natural skin texture, minor imperfections, subtle wrinkles around eyes, cozy atmosphere, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "ieva_romantic_evening",
        "prompt": f"realistic photograph, romantic portrait of 26 year old woman, {ieva_data['body_type']} body type, {ieva_data['height']}, {ieva_data['hair_color']} hair, {ieva_data['eye_color']}, romantic restaurant evening, candlelight dinner, upper body portrait, chest up framing, warm candlelight, elegant romantic evening dress with high neckline, classy sophisticated outfit, completely covered, no skin exposure, romantic expression, realistic skin texture, natural imperfections, real photo, authentic, high quality, detailed face, photorealistic, fully clothed, conservative elegant dress"
    },
    {
        "name": "ieva_casual_date",
        "prompt": f"realistic photograph, natural portrait of 26 year old woman, {ieva_data['body_type']} body type, {ieva_data['height']}, {ieva_data['hair_color']} hair, {ieva_data['eye_color']}, casual date afternoon, coffee shop meeting, upper body portrait, chest up framing, natural window lighting, casual chic outfit, blouse with delicate pattern, natural hairstyle, realistic skin texture, subtle imperfections, friendly genuine expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
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
        print("Please start Stable Diffusion with --api flag:")
        print("  set COMMANDLINE_ARGS=--api --autolaunch --theme=dark")
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
        print("Images saved:")
        for file in generated_files:
            print(f"  - {file}")
    else:
        print("Failed to generate images")

if __name__ == "__main__":
    main()


