import requests
import sys
import os
import base64
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

# Reference nuotraukos kelias
REFERENCE_IMAGE_PATH = r"C:\Users\maini\Desktop\britvos\briva2_reference.png"

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

def load_reference_image(image_path):
    """Load reference image and convert to base64"""
    if not os.path.exists(image_path):
        print(f"ERROR: Reference image not found at {image_path}")
        return None
    
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()
            return base64.b64encode(image_data).decode('utf-8')
    except Exception as e:
        print(f"ERROR: Could not load reference image: {e}")
        return None

def generate_image_img2img(reference_image_b64, prompt, negative_prompt, seed, scenario_name, denoising_strength=0.4, checkpoint=None):
    """Generate image using img2img with reference image to maintain face identity"""
    
    adetailer_args = [
        {
            "ad_model": "face_yolov8n.pt",
            "ad_prompt": "same face, same person, identical facial features, same eyes, same nose, same lips, same chin, natural skin texture with pores, realistic imperfections, natural expression",
            "ad_negative_prompt": "different face, different person, different facial features, bad face, deformed face, blurry face, perfect skin, flawless, airbrushed, worst quality, low quality, AI generated face",
            "ad_confidence": 0.3,
            "ad_mask_k_largest": 1,
            "ad_mask_min_ratio": 0.0,
            "ad_mask_max_ratio": 1.0,
            "ad_dilate_erode": 4,
            "ad_x_offset": 0,
            "ad_y_offset": 0,
            "ad_mask_merge_invert": "None",
            "ad_mask_blur": 4,
            "ad_denoising_strength": 0.35,  # Lower to preserve face better
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
        "init_images": [reference_image_b64],
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 40,
        "cfg_scale": 7.5,
        "width": 512,
        "height": 768,
        "sampler_name": "DPM++ 2M Karras",
        "scheduler": "Karras",
        "denoising_strength": denoising_strength,  # Low value = keeps more of original face
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
        print(f"Generating {scenario_name} with seed {seed}...")
        response = requests.post(f"{API_URL}/sdapi/v1/img2img", json=payload, timeout=400)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                image_data = result['images'][0]
                image_bytes = base64.b64decode(image_data)
                
                output_dir = Path("generated_photos")
                output_dir.mkdir(exist_ok=True)
                
                output_path = output_dir / f"britva2_{scenario_name}.png"
                with open(output_path, 'wb') as f:
                    f.write(image_bytes)
                
                print(f"✓ Image saved: {output_path}")
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

# Base negative prompt - no AI artifacts, natural imperfections
negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic, beauty filter, instagram filter, professional model, studio lighting, dramatic lighting, high contrast, oversaturated, oversharpened"

BASE_SEED = 30000

# 6 scenos pagal reikalavimus
scenarios = [
    {
        "name": "cafe_leisure",
        "prompt": "realistic photograph, natural portrait, same person, identical face, sitting in cafe by window, natural daylight, relaxed expression, casual clothes, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with pores, subtle imperfections, natural lighting, no filters, documentary style, authentic moment, not posed, real photo, not AI art, photorealistic",
        "denoising_strength": 0.4,
        "seed": BASE_SEED + 1
    },
    {
        "name": "city_street",
        "prompt": "realistic photograph, natural portrait, same person, identical face, walking on city street, everyday moment, casual clothes, natural street lighting, captured moment, not posed, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with pores, subtle imperfections, natural daylight, no filters, documentary style, authentic, real photo, not AI art, photorealistic",
        "denoising_strength": 0.4,
        "seed": BASE_SEED + 2
    },
    {
        "name": "home_comfort",
        "prompt": "realistic photograph, natural portrait, same person, identical face, at home, soft indoor lighting, cozy atmosphere, natural emotion, comfortable clothes, upper body portrait, chest up framing, 50mm lens, natural depth of field, realistic skin texture with pores, subtle imperfections, warm lighting, no filters, documentary style, authentic moment, real photo, not AI art, photorealistic",
        "denoising_strength": 0.4,
        "seed": BASE_SEED + 3
    },
    {
        "name": "evening_calm",
        "prompt": "realistic photograph, natural portrait, same person, identical face, evening in city or at home, warm lighting, calm mood, natural expression, casual evening clothes, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with pores, subtle imperfections, warm evening light, no filters, documentary style, authentic, real photo, not AI art, photorealistic",
        "denoising_strength": 0.4,
        "seed": BASE_SEED + 4
    },
    {
        "name": "close_portrait",
        "prompt": "realistic photograph, natural portrait, same person, identical face, close-up portrait, half body or face shot, neutral background, very clear same face visible, same eyes, same nose, same lips, same chin, upper body portrait, chest up framing, 50mm lens, natural depth of field, realistic skin texture with pores, subtle imperfections, natural lighting, no filters, documentary style, authentic, real photo, not AI art, photorealistic",
        "denoising_strength": 0.35,  # Lower to preserve face better
        "seed": BASE_SEED + 5
    },
    {
        "name": "laughing_moment",
        "prompt": "realistic photograph, natural portrait, same person, identical face, laughing or talking, caught real emotional moment, not posing, genuine expression, natural moment, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with pores, subtle imperfections, natural lighting, no filters, documentary style, authentic moment, real photo, not AI art, photorealistic",
        "denoising_strength": 0.4,
        "seed": BASE_SEED + 6
    }
]

def main():
    print("=" * 60)
    print("Generating Britva2 profile images")
    print("Using reference image to maintain face identity")
    print("=" * 60)
    
    # Check if reference image exists
    if not os.path.exists(REFERENCE_IMAGE_PATH):
        print(f"ERROR: Reference image not found at:")
        print(f"  {REFERENCE_IMAGE_PATH}")
        print("\nPlease check the path and try again.")
        return
    
    print(f"\n✓ Reference image found: {REFERENCE_IMAGE_PATH}")
    
    # Load reference image
    print("\nLoading reference image...")
    reference_image_b64 = load_reference_image(REFERENCE_IMAGE_PATH)
    if not reference_image_b64:
        print("ERROR: Could not load reference image")
        return
    
    print("✓ Reference image loaded successfully")
    
    # Check API
    print("\nChecking if Stable Diffusion API is available...")
    if not check_api_available():
        print("ERROR: Stable Diffusion API is not available!")
        print("Please make sure Stable Diffusion WebUI is running on http://127.0.0.1:7860")
        return
    
    print("✓ API is available!")
    
    # Get best checkpoint
    print("\nLooking for best checkpoint...")
    checkpoint = get_best_checkpoint()
    if checkpoint:
        print(f"✓ Using checkpoint: {checkpoint}")
    else:
        print("⚠ Using default checkpoint")
    
    # Generate images
    print("\n" + "=" * 60)
    print("Starting image generation...")
    print("=" * 60)
    print("\nIMPORTANT: All images will show the SAME PERSON with IDENTICAL FACE")
    print("Using img2img with low denoising strength to preserve face identity\n")
    
    generated_files = []
    
    for i, scenario in enumerate(scenarios):
        print(f"\n[{i+1}/6] Generating: {scenario['name']}")
        print(f"  Seed: {scenario['seed']}")
        print(f"  Denoising strength: {scenario['denoising_strength']}")
        
        file_path = generate_image_img2img(
            reference_image_b64,
            scenario["prompt"],
            negative_prompt,
            scenario["seed"],
            scenario["name"],
            scenario["denoising_strength"],
            checkpoint
        )
        
        if file_path:
            generated_files.append(file_path)
            print(f"  ✓ Success!")
        else:
            print(f"  ✗ Failed!")
    
    # Summary
    print("\n" + "=" * 60)
    print("Generation complete!")
    print("=" * 60)
    
    if generated_files:
        print(f"\n✓ Successfully generated {len(generated_files)}/6 images:")
        for file in generated_files:
            print(f"  - {file}")
        
        # Copy to public folder
        print("\nCopying images to public folder...")
        public_dir = Path("public")
        public_dir.mkdir(exist_ok=True)
        
        for file in generated_files:
            filename = file.name
            public_path = public_dir / filename
            try:
                import shutil
                shutil.copy2(file, public_path)
                print(f"  ✓ Copied {filename} to public/")
            except Exception as e:
                print(f"  ✗ Failed to copy {filename}: {e}")
    else:
        print("\n✗ Failed to generate images")
        print("Please check the error messages above")

if __name__ == "__main__":
    main()
