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

# Greta profilio duomenys
greta_data = {
    "age": 29,
    "gender": "woman",
    "body_type": "athletic",
    "height": "165cm",
    "hair_color": "red",
    "eye_color": "brown eyes",
    "interests": ["fitness", "healthy lifestyle", "yoga", "travel"],
    "bio": "Fitness trainer, healthy lifestyle promoter. Active lifestyle - my priority."
}

# Seed tam, kad būtų tas pats žmogus visose nuotraukose
BASE_SEED = 98765

# Negative prompt - Realistic 3 style su daugiau natūralių defektų neleidimu
negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic, nude, topless, exposed breasts"

# Situacijos su skirtingais promptais - NATŪRALESNĖS su odos defektais
scenarios = [
    {
        "name": "greta_fitness",
        "prompt": f"realistic photograph, natural portrait of 29 year old woman, {greta_data['body_type']} body type, {greta_data['height']}, {greta_data['hair_color']} hair, {greta_data['eye_color']}, fitness trainer in gym, upper body portrait, chest up framing, natural lighting, sportswear, slightly messy hair, natural skin texture with visible pores, minor skin imperfections like freckles or small blemishes, subtle wrinkles around eyes, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "greta_yoga",
        "prompt": f"realistic photograph, natural portrait of 29 year old woman, {greta_data['body_type']} body type, {greta_data['height']}, {greta_data['hair_color']} hair, {greta_data['eye_color']}, practicing yoga in studio, upper body portrait, chest up framing, soft natural lighting, yoga outfit, hair slightly out of place, natural skin texture, visible skin pores, small imperfections, subtle expression lines, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "greta_casual",
        "prompt": f"realistic photograph, natural portrait of 29 year old woman, {greta_data['body_type']} body type, {greta_data['height']}, {greta_data['hair_color']} hair, {greta_data['eye_color']}, casual everyday moment, upper body portrait, chest up framing, natural lighting, casual slightly wrinkled clothes, natural hair not perfectly styled, realistic skin texture with pores, minor skin imperfections, natural makeup or no makeup, subtle wrinkles, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "greta_outdoor",
        "prompt": f"realistic photograph, natural portrait of 29 year old woman, {greta_data['body_type']} body type, {greta_data['height']}, {greta_data['hair_color']} hair, {greta_data['eye_color']}, hiking in nature, upper body portrait, chest up framing, outdoor natural lighting, casual outdoor clothes with slight wrinkles, wind-blown hair, natural skin texture with visible pores and freckles, minor sun exposure effects, natural imperfections, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "greta_erotic",
        "prompt": f"realistic photograph, natural sensual portrait of 29 year old woman, {greta_data['body_type']} body type, {greta_data['height']}, {greta_data['hair_color']} hair, {greta_data['eye_color']}, elegant intimate setting, upper body portrait, chest up framing, soft dim lighting, elegant tasteful evening dress with neckline, sensual but tasteful expression, natural skin texture with visible pores, minor skin imperfections, subtle imperfections, artistic erotic, sophisticated, real photo, authentic, not AI art, high quality, detailed face, photorealistic"
    },
    {
        "name": "greta_sexy",
        "prompt": f"realistic photograph, natural sensual portrait of 29 year old woman, {greta_data['body_type']} body type, {greta_data['height']}, {greta_data['hair_color']} hair, {greta_data['eye_color']}, intimate elegant setting, upper body portrait, chest up framing, seductive soft lighting, elegant tasteful evening dress with sophisticated neckline, confident sensual expression, natural skin texture with visible pores and imperfections, minor skin flaws, natural body imperfections, tastefully sexy, sophisticated, real photo, authentic, not AI art, high quality, detailed face, photorealistic"
    }
]

def check_api_available():
    """Tikrina ar Stable Diffusion API veikia"""
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_best_checkpoint():
    """Gauti geriausia checkpoint'a"""
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models", timeout=5)
        if response.status_code == 200:
            models = response.json()
            # Ieskoti realistic checkpoint'u
            for model in models:
                title = model.get('title', '').lower()
                model_name = model.get('model_name', '').lower()
                if any(keyword in title or keyword in model_name for keyword in ['realistic', 'real', 'photorealistic', 'photo', '1.5']):
                    return model.get('title', '')
            # Jei nerasta, grąžinti pirmą
            if models:
                return models[0].get('title', '')
        return None
    except:
        return None

def generate_image(prompt, negative_prompt, seed, output_dir, scenario_index, checkpoint=None):
    """Generuoja nuotrauka naudojant Stable Diffusion API su A Detailer"""
    # A Detailer settings - geresni nustatymai
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
    
    # Patobulinti parametrai
    payload = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 40,  # Daugiau steps = geresnė kokybė
        "cfg_scale": 7.5,  # Optimalus balansas
        "width": 512,
        "height": 768,
        "sampler_name": "DPM++ 2M Karras",  # Geras sampling metodas
        "scheduler": "Karras",  # Geresnis scheduler
        "alwayson_scripts": {
            "ADetailer": {
                "args": adetailer_args
            }
        }
    }
    
    # Jei nurodytas checkpoint, keisti jį
    if checkpoint:
        try:
            switch_response = requests.post(f"{API_URL}/sdapi/v1/options", json={"sd_model_checkpoint": checkpoint}, timeout=5)
        except:
            pass
    
    try:
        print(f"Generuoju nuotrauka su seed {seed}...")
        response = requests.post(f"{API_URL}/sdapi/v1/txt2img", json=payload, timeout=400)
        
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
            print(response.text[:500])
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
    
    print("API veikia! Ieskau geriausio checkpoint...")
    checkpoint = get_best_checkpoint()
    if checkpoint:
        print(f"Naudoju checkpoint: {checkpoint}")
    else:
        print("Naudoju default checkpoint")
    
    print("Pradedu generuoti nuotraukas...")
    
    generated_files = []
    
    # Generuoti 6 nuotraukas
    for i, scenario in enumerate(scenarios):
        # Naudoti ta pati seed pagrinda, bet su mazu skirtumu kiekvienai nuotraukai
        seed = BASE_SEED + i * 150
        prompt = scenario["prompt"]
        
        file_path = generate_image(prompt, negative_prompt, seed, output_dir, i, checkpoint)
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

