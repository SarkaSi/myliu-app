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

# Simona profilio duomenys
simona_data = {
    "age": 27,
    "gender": "woman",
    "body_type": "medium",
    "height": "172cm",
    "hair_color": "light blonde",
    "eye_color": "blue eyes",
    "interests": ["art", "photography", "nature", "music"],
    "bio": "Artist and photographer. Nature lover. Looking for artistic soul."
}

# Seed tam, kad būtų tas pats žmogus visose nuotraukose
BASE_SEED = 54321

# Negative prompt - Realistic 3 style (embedding format: (embedding_name:1.0))
negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, nude, topless, exposed breasts"

# Situacijos su skirtingais promptais - be rankų/pirštų, realistiškesnės
scenarios = [
    {
        "name": "simona_art",
        "prompt": f"realistic photograph, natural portrait of 27 year old woman, {simona_data['body_type']} body type, {simona_data['height']}, {simona_data['hair_color']} hair, {simona_data['eye_color']}, artist in studio, painting on canvas visible in background, upper body portrait, chest up framing, natural lighting from window, artistic casual outfit, creative expression, realistic skin texture, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic, portrait photography"
    },
    {
        "name": "simona_photography",
        "prompt": f"realistic photograph, natural portrait of 27 year old woman, {simona_data['body_type']} body type, {simona_data['height']}, {simona_data['hair_color']} hair, {simona_data['eye_color']}, photographer in nature, holding camera (camera visible but hands not shown), natural outdoor setting, upper body portrait, chest up framing, golden hour lighting, casual stylish outfit, focused expression, realistic skin texture, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic, portrait photography"
    },
    {
        "name": "simona_casual",
        "prompt": f"realistic photograph, natural portrait of 27 year old woman, {simona_data['body_type']} body type, {simona_data['height']}, {simona_data['hair_color']} hair, {simona_data['eye_color']}, casual everyday moment, sitting relaxed, upper body portrait, chest up framing, soft natural lighting, casual outfit, natural relaxed expression, realistic skin texture, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic, portrait photography"
    },
    {
        "name": "simona_sensual",
        "prompt": f"realistic photograph, sensual portrait of 27 year old woman, {simona_data['body_type']} body type, {simona_data['height']}, {simona_data['hair_color']} hair, {simona_data['eye_color']}, intimate elegant setting, upper body portrait, chest up framing, soft dim lighting, elegant tasteful evening dress with sophisticated neckline, sensual expression, confident gaze, realistic skin texture, natural imperfections, tastefully sensual, sophisticated, real photo, authentic, high quality, detailed face, photorealistic, portrait photography"
    },
    {
        "name": "simona_restaurant",
        "prompt": f"realistic photograph, natural portrait of 27 year old woman, {simona_data['body_type']} body type, {simona_data['height']}, {simona_data['hair_color']} hair, {simona_data['eye_color']}, elegant restaurant evening, romantic dinner, upper body portrait, chest up framing, warm candlelight, sophisticated evening dress, elegant style, natural skin texture with visible pores, minor imperfections, charming expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "simona_nature",
        "prompt": f"realistic photograph, natural portrait of 27 year old woman, {simona_data['body_type']} body type, {simona_data['height']}, {simona_data['hair_color']} hair, {simona_data['eye_color']}, peaceful nature setting, outdoor photography, upper body portrait, chest up framing, golden hour natural lighting, bohemian casual outfit, wind-blown artistic hair, natural skin texture with freckles, minor sun imperfections, serene expression, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
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
            "ad_model": "face_yolov8n.pt",
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
        print("Prasome paleisti Stable Diffusion su --api flag'u:")
        print("  set COMMANDLINE_ARGS=--api --autolaunch --theme=dark")
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

