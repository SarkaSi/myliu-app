import requests
import base64
import json
import os
import sys
from pathlib import Path

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Stable Diffusion API endpoint
API_URL = "http://127.0.0.1:7860"

# Laura profilio duomenys
laura_data = {
    "age": 25,
    "gender": "woman",
    "body_type": "slim",
    "height": "168cm",
    "hair_color": "light blonde",
    "eye_color": "green eyes",
    "interests": ["yoga", "reading", "technology", "cafes"],
    "bio": "IT professional, loves yoga and reading books, looking for serious relationships"
}

# Seed tam, kad būtų tas pats žmogus visose nuotraukose
BASE_SEED = 12345

# Negative prompt - Realistic 3 style (embedding format: (embedding_name:1.0))
negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, nude, topless, exposed breasts"

# Situacijos su skirtingais promptais - be rankų/pirštų, realistiškesnės
scenarios = [
    {
        "name": "laura_work",
        "prompt": f"realistic photograph, natural portrait of 25 year old woman, {laura_data['body_type']} body type, {laura_data['height']}, {laura_data['hair_color']} hair, {laura_data['eye_color']}, working at modern IT office, sitting at desk with laptop visible on desk (no hands), upper body portrait, chest up framing, natural lighting from window, professional business casual outfit, confident natural smile, realistic skin texture, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic, portrait photography"
    },
    {
        "name": "laura_yoga",
        "prompt": f"realistic photograph, natural portrait of 25 year old woman, {laura_data['body_type']} body type, {laura_data['height']}, {laura_data['hair_color']} hair, {laura_data['eye_color']}, practicing yoga in peaceful studio, doing yoga pose (upper body only, no visible hands), wearing sportswear, natural lighting, serene expression, realistic skin texture, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic, portrait photography"
    },
    {
        "name": "laura_cafe",
        "prompt": f"realistic photograph, natural portrait of 25 year old woman, {laura_data['body_type']} body type, {laura_data['height']}, {laura_data['hair_color']} hair, {laura_data['eye_color']}, sitting in cozy modern cafe, reading book (book visible on table, no hands holding it), coffee cup on table, casual stylish outfit, warm natural lighting, peaceful atmosphere, upper body portrait, realistic skin texture, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic, portrait photography"
    },
    {
        "name": "laura_restaurant",
        "prompt": f"realistic photograph, natural portrait of 25 year old woman, {laura_data['body_type']} body type, {laura_data['height']}, {laura_data['hair_color']} hair, {laura_data['eye_color']}, elegant restaurant evening, romantic dinner, upper body portrait, chest up framing, warm candlelight, sophisticated evening dress with tasteful neckline, natural skin texture with visible pores, minor imperfections, charming expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "laura_nature",
        "prompt": f"realistic photograph, natural portrait of 25 year old woman, {laura_data['body_type']} body type, {laura_data['height']}, {laura_data['hair_color']} hair, {laura_data['eye_color']}, peaceful nature walk, outdoor setting, upper body portrait, chest up framing, golden hour natural lighting, casual outdoor outfit, wind-blown hair, natural skin texture with freckles, minor sun imperfections, serene expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "laura_casual",
        "prompt": f"realistic photograph, natural portrait of 25 year old woman, {laura_data['body_type']} body type, {laura_data['height']}, {laura_data['hair_color']} hair, {laura_data['eye_color']}, casual weekend morning, relaxing at home, upper body portrait, chest up framing, natural morning light, comfortable casual outfit, relaxed home clothes, slightly tousled hair, natural skin texture, subtle imperfections, relaxed genuine expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    }
]

def check_api_available():
    """Tikrina ar Stable Diffusion API veikia"""
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models", timeout=5)
        return response.status_code == 200
    except:
        return False

def generate_image(prompt, negative_prompt, seed, output_dir, scenario_index):
    """Generuoja nuotrauka naudojant Stable Diffusion API su A Detailer"""
    # A Detailer settings
    adetailer_args = [
        {
            "ad_model": "face_yolov8n.pt",  # or face_yolov8s.pt
            "ad_prompt": "realistic face, natural skin, detailed eyes, natural expression",
            "ad_negative_prompt": "bad face, deformed face, blurry face, worst quality, low quality",
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
            "ad_steps": 28,
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
        "steps": 35,
        "cfg_scale": 7,
        "width": 512,
        "height": 768,
        "sampler_name": "DPM++ 2M Karras",
        "alwayson_scripts": {
            "ADetailer": {
                "args": adetailer_args
            }
        }
    }
    
    try:
        print(f"Generuoju nuotrauka su seed {seed}...")
        response = requests.post(f"{API_URL}/sdapi/v1/txt2img", json=payload, timeout=300)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                # Isaugoti nuotrauka
                image_data = result['images'][0]
                image_bytes = base64.b64decode(image_data)
                
                output_path = output_dir / f"{scenarios[scenario_index]['name']}.png"
                with open(output_path, 'wb') as f:
                    f.write(image_bytes)
                
                print(f"Nuotrauka issaugota: {output_path}")
                return output_path
            else:
                print("Klaida: API negrazino nuotraukos")
                return None
        else:
            print(f"Klaida: API grazino status koda {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Klaida generuojant nuotrauka: {e}")
        return None

def main():
    # Sukurti output katalogą
    output_dir = Path("generated_photos")
    output_dir.mkdir(exist_ok=True)
    
    print("Tikrinu ar Stable Diffusion API veikia...")
    if not check_api_available():
        print("KLAIDA: Stable Diffusion API neveikia!")
        print("Prašome paleisti Stable Diffusion su --api flag'u:")
        print("  set COMMANDLINE_ARGS=--api --autolaunch --theme=dark")
        print("Arba paleisti: python generate_laura.py --start-sd")
        return
    
    print("API veikia! Pradedu generuoti nuotraukas...")
    
    generated_files = []
    
    # Generuoti 6 nuotraukas
    for i, scenario in enumerate(scenarios):
        # Naudoti ta pati seed pagrinda, bet su mazu skirtumu kiekvienai nuotraukai
        seed = BASE_SEED + i * 100
        prompt = scenario["prompt"]
        
        file_path = generate_image(prompt, negative_prompt, seed, output_dir, i)
        if file_path:
            generated_files.append(file_path)
        
        print(f"Generuota {i+1}/6 nuotrauku\n")
    
    if generated_files:
        print(f"Visos nuotraukos sekmingai sugeneruotos!")
        print("Nuotraukos issaugotos:")
        for file in generated_files:
            print(f"  - {file}")
    else:
        print("Nepavyko sugeneruoti nuotrauku")

if __name__ == "__main__":
    main()

