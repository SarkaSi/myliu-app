import requests
import sys
import os
import base64
import time

sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

def wait_for_api(max_wait=60):
    """Laukti kol API pasileis"""
    print("Laukiu kol Stable Diffusion API pasileis...")
    for i in range(max_wait // 5):
        try:
            response = requests.get(f"{API_URL}/", timeout=2)
            if response.status_code == 200:
                try:
                    api_response = requests.get(f"{API_URL}/sdapi/v1/options", timeout=2)
                    if api_response.status_code == 200:
                        print("API veikia!")
                        return True
                except:
                    pass
        except:
            pass
        if i > 0:
            print(f"Laukiu... ({i*5}s)")
        time.sleep(5)
    return False

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

def generate_image(prompt, negative_prompt, seed, scenario_name, checkpoint=None):
    adetailer_args = [
        {
            "ad_model": "face_yolov8n.pt",
            "ad_prompt": "realistic face, natural skin texture with pores, detailed eyes, natural expression, subtle imperfections, fully clothed, conservative elegant outfit",
            "ad_negative_prompt": "bad face, deformed face, blurry face, perfect skin, flawless, airbrushed, worst quality, low quality, nude, naked, topless, exposed breasts, nipples, cleavage",
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
                
                output_path = f"generated_photos/rute_{scenario_name}.png"
                os.makedirs("generated_photos", exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(image_bytes)
                
                print(f"Image saved: {output_path}")
                return output_path
            else:
                print("Error: API did not return image")
                return None
        else:
            print(f"Error: API returned status code {response.status_code}")
            return None
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

# Rūtė profilio duomenys - turtinga IT verslininkė
rute_data = {
    "age": 32,
    "gender": "woman",
    "body_type": "slim",
    "height": "170cm",
    "hair_color": "light blonde",
    "eye_color": "blue eyes",
}

BASE_SEED = 28000

# Stiprus negative prompt be nuogumo
negative_prompt = "(Negative Realistic 3:1.0), nude, naked, topless, bare chest, exposed breasts, nipples, exposed genitals, no clothes, underwear visible, lingerie, bikini, swimsuit revealing, cleavage, nude body, naked body, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing"

# Scenarios su stipriais apribojimais be nuogumo - TURTINGA IT VERSLININKĖ
scenarios = [
    {
        "name": "tech_startup",
        "prompt": f"realistic photograph, modern professional portrait of 32 year old tech businesswoman, {rute_data['body_type']} body type, {rute_data['height']}, {rute_data['hair_color']} hair, {rute_data['eye_color']}, wearing modern tech business outfit with high neckline, completely covered from neck to chest, no skin exposure anywhere, long sleeves, in modern tech startup office during Lithuanian winter, contemporary design, winter afternoon light, upper body portrait, chest up framing, realistic skin texture on face only, natural imperfections like subtle wrinkles, age spots, subtle freckles, professional modern styling, fully clothed, conservative elegant tech outfit covering entire torso, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic",
        "seed": BASE_SEED + 1
    },
    {
        "name": "luxury_car",
        "prompt": f"realistic photograph, sophisticated portrait of 32 year old tech businesswoman, {rute_data['body_type']} body type, {rute_data['height']}, {rute_data['hair_color']} hair, {rute_data['eye_color']}, wearing elegant business outfit with high neckline, completely covered from neck to chest, no skin exposure anywhere, long sleeves, next to luxury car during Lithuanian spring, spring afternoon sunlight, upper body portrait, chest up framing, realistic skin texture on face only, natural imperfections like subtle wrinkles, age spots, subtle freckles, professional elegant styling, fully clothed, conservative elegant outfit covering entire torso, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic",
        "seed": BASE_SEED + 2
    },
    {
        "name": "sports_activity",
        "prompt": f"realistic photograph, active portrait of 32 year old tech businesswoman, {rute_data['body_type']} body type, {rute_data['height']}, {rute_data['hair_color']} hair, {rute_data['eye_color']}, wearing sports outfit with high neckline, completely covered from neck to chest, no skin exposure anywhere, long sleeves, at sports activity during Lithuanian summer, sunny day, upper body portrait, chest up framing, realistic skin texture on face only, natural imperfections like subtle wrinkles, age spots, subtle freckles, professional active styling, fully clothed, conservative sports outfit covering entire torso, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic",
        "seed": BASE_SEED + 3
    },
    {
        "name": "restaurant_modern",
        "prompt": f"realistic photograph, elegant portrait of 32 year old tech businesswoman, {rute_data['body_type']} body type, {rute_data['height']}, {rute_data['hair_color']} hair, {rute_data['eye_color']}, wearing modern elegant evening dress with high neckline, completely covered from neck to chest, no skin exposure anywhere, long sleeves, in modern restaurant during Lithuanian autumn, warm evening lighting, upper body portrait, chest up framing, realistic skin texture on face only, natural imperfections like subtle wrinkles, age spots, subtle freckles, professional modern elegant styling, fully clothed, conservative elegant evening dress covering entire torso, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic",
        "seed": BASE_SEED + 4
    },
    {
        "name": "travel_business",
        "prompt": f"realistic photograph, professional portrait of 32 year old tech businesswoman, {rute_data['body_type']} body type, {rute_data['height']}, {rute_data['hair_color']} hair, {rute_data['eye_color']}, wearing elegant travel business outfit with high neckline, completely covered from neck to chest, no skin exposure anywhere, long sleeves, at luxury airport during Lithuanian winter, natural lighting, upper body portrait, chest up framing, realistic skin texture on face only, natural imperfections like subtle wrinkles, age spots, subtle freckles, professional elegant styling, fully clothed, conservative elegant travel outfit covering entire torso, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic",
        "seed": BASE_SEED + 5
    },
    {
        "name": "casual_smart",
        "prompt": f"realistic photograph, sophisticated casual portrait of 32 year old tech businesswoman, {rute_data['body_type']} body type, {rute_data['height']}, {rute_data['hair_color']} hair, {rute_data['eye_color']}, wearing smart casual outfit with high neckline, completely covered from neck to chest, no skin exposure anywhere, long sleeves, in modern cafe during Lithuanian spring, afternoon sunlight, upper body portrait, chest up framing, realistic skin texture on face only, natural imperfections like subtle wrinkles, age spots, subtle freckles, professional smart casual styling, fully clothed, conservative elegant casual outfit covering entire torso, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic",
        "seed": BASE_SEED + 6
    }
]

if __name__ == "__main__":
    if not wait_for_api():
        if not check_api_available():
            print("KLAIDA: Stable Diffusion API neveikia!")
            print("Prašome paleisti Stable Diffusion su --api flag'u:")
            print("  set COMMANDLINE_ARGS=--api --autolaunch --theme=dark")
            sys.exit(1)
    
    print("\nGenerating Rūtė photos...")
    
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
    
    generated_files = []
    
    for i, scenario in enumerate(scenarios):
        print(f"\nGenerating {i+1}/6: {scenario['name']}")
        file_path = generate_image(
            scenario["prompt"],
            negative_prompt,
            scenario["seed"],
            scenario["name"],
            checkpoint_name
        )
        if file_path:
            generated_files.append(file_path)
    
    if generated_files:
        print(f"\nAll Rūtė photos successfully generated!")
        print("Photos saved:")
        for file in generated_files:
            print(f"  - {file}")
        
        # Perkelti į public folder
        import shutil
        for file in generated_files:
            filename = os.path.basename(file)
            dest = os.path.join("public", filename)
            shutil.copy2(file, dest)
            print(f"Copied to: {dest}")
        print("\nDone! All Rūtė photos updated in public folder.")
    else:
        print("Failed to generate images")
