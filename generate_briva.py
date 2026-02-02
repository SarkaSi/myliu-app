"""
Briva nuotraukų generavimas su img2img - išlaikant tą patį veidą visose nuotraukose
Naudoja reference image kaip pagrindinę identiteto nuorodą
"""

import requests
import base64
import json
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

# Briva duomenys
briva_data = {
    "name": "Briva",
    "age": 50,
    "gender": "man",
    "description": "50 year old man, receding hairline, mostly bald on top, salt-and-pepper hair on sides, short well-maintained salt-and-pepper beard and mustache, light blue-grey eyes, realistic skin texture with visible pores, natural fine lines, authentic appearance"
}

BASE_SEED = 50000

# Reference image path - automatiškai ieško skirtingų variantų
def find_reference_image():
    """Automatically find reference image with different names/formats"""
    # First check user-specified location
    user_specified = r"C:\Users\maini\Desktop\britvos\briva_reference.png"
    if os.path.exists(user_specified):
        return user_specified
    
    possible_names = [
        "briva_reference.png",
        "briva_reference.jpg",
        "briva_reference.jpeg",
        "briva.png",
        "briva.jpg",
        "reference.png",
        "reference.jpg",
        "00000-3065459839.png"  # Original filename from user's folder
    ]
    
    for name in possible_names:
        if os.path.exists(name):
            return name
    
    # Check in generated_photos folder
    for name in possible_names:
        path = Path("generated_photos") / name
        if path.exists():
            return str(path)
    
    return None

REFERENCE_IMAGE_PATH = find_reference_image() or "briva_reference.png"  # Default fallback

negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic, beauty filter, instagram filter, studio lighting, harsh shadows, dramatic lighting"

scenarios = [
    {
        "name": "briva_cafe_window",
        "prompt": f"50 year old man, {briva_data['description']}, sitting in cozy modern cafe, turned slightly toward large window, looking out through window, natural daylight streaming through, relaxed contemplative expression, soft sweater, coffee cup on wooden table, three-quarter view of face, cafe interior with plants visible, warm lighting, chest up framing, documentary photo style",
        "denoising_strength": 0.75,
        "seed": BASE_SEED + 1000
    },
    {
        "name": "briva_city_street",
        "prompt": f"50 year old man, {briva_data['description']}, walking on busy city street with small dog on leash, casual jacket and jeans, looking ahead while walking, side profile view, urban environment with buildings in background, natural movement, street photography, bright daylight, half body shot, documentary style",
        "denoising_strength": 0.75,
        "seed": BASE_SEED + 2500
    },
    {
        "name": "briva_home_indoor",
        "prompt": f"50 year old man, {briva_data['description']}, at home sitting comfortably on sofa, leaning back relaxed, looking slightly to the side, casual home clothes like t-shirt, warm indoor lighting, cozy living room with books and furniture visible, soft natural light, three-quarter body view, documentary style",
        "denoising_strength": 0.75,
        "seed": BASE_SEED + 3500
    },
    {
        "name": "briva_evening_city",
        "prompt": f"50 year old man, {briva_data['description']}, standing by window in evening, looking out at city lights below, back view transitioning to side profile, sophisticated evening clothes, warm golden hour lighting through window, urban evening atmosphere, calm thoughtful expression, full body to half body view, documentary style",
        "denoising_strength": 0.75,
        "seed": BASE_SEED + 4500
    },
    {
        "name": "briva_close_portrait",
        "prompt": f"50 year old man, {briva_data['description']}, close-up portrait looking directly at camera, neutral blurred background, professional portrait style, very detailed facial features, face fills most of frame, natural lighting, head and shoulders framing, documentary style",
        "denoising_strength": 0.65,
        "seed": BASE_SEED + 5500
    },
    {
        "name": "briva_laughing_moment",
        "prompt": f"50 year old man, {briva_data['description']}, laughing with genuine smile, head tilted slightly, looking up and to the side, joyful expression, candid moment, casual clothes, natural expression, chest up framing, three-quarter view, documentary style",
        "denoising_strength": 0.75,
        "seed": BASE_SEED + 6500
    }
]

def check_api_available():
    """Check if Stable Diffusion API is available - same as working scripts"""
    try:
        response = requests.get(f"{API_URL}/sdapi/v1/sd-models", timeout=5)
        return response.status_code == 200
    except:
        return False

def wait_for_api(max_wait_minutes=5):
    """Wait for API to become available"""
    import time
    max_attempts = max_wait_minutes * 12  # Check every 5 seconds
    attempt = 0
    
    print("Waiting for Stable Diffusion API to be ready...")
    while attempt < max_attempts:
        if check_api_available():
            print("✅ API is ready!")
            return True
        attempt += 1
        if attempt % 6 == 0:  # Every 30 seconds
            print(f"Still waiting... ({attempt * 5 // 60} minutes)")
        time.sleep(5)
    
    print("⚠️  API did not become available in time")
    return False

def get_best_checkpoint():
    """Get best checkpoint for Stable Diffusion"""
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
        print(f"❌ ERROR: Reference image not found: {image_path}")
        print(f"   Please place your reference portrait image at: {os.path.abspath(image_path)}")
        return None
    
    try:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        print(f"✅ Reference image loaded: {image_path}")
        return image_base64
    except Exception as e:
        print(f"❌ Error loading reference image: {e}")
        return None

def generate_image_img2img(reference_image_base64, prompt, negative_prompt, denoising_strength, seed, output_path, checkpoint=None):
    """
    Generate image using img2img with reference image
    """
    payload = {
        "init_images": [reference_image_base64],
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "seed": seed,
        "steps": 50,
        "cfg_scale": 7.5,
        "width": 512,
        "height": 768,
        "sampler_name": "DPM++ 2M Karras",
        "denoising_strength": denoising_strength,  # Critical for maintaining identity
        "adetailer_args": {
            "ad_model": "face_yolov8n.pt",
            "ad_prompt": f"{briva_data['description']}, realistic face, natural skin texture with pores, detailed eyes, natural expression, subtle imperfections, authentic appearance",
            "ad_negative_prompt": "bad face, deformed face, blurry face, perfect skin, flawless, airbrushed, worst quality, low quality, different person, different face",
            "ad_denoising_strength": 0.4,
            "ad_confidence": 0.3
        }
    }
    
    if checkpoint:
        payload["override_settings"] = {"sd_model_checkpoint": checkpoint}
    
    try:
        print(f"Generating image with img2img (seed {seed}, denoising {denoising_strength})...")
        response = requests.post(f"{API_URL}/sdapi/v1/img2img", json=payload, timeout=600)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("images"):
                image_data = base64.b64decode(result["images"][0])
                
                with open(output_path, 'wb') as f:
                    f.write(image_data)
                
                print(f"✅ Image saved: {output_path}")
                return output_path
            else:
                print("❌ Error: API did not return image")
                return None
        else:
            print(f"❌ Error: API returned status code {response.status_code}")
            print(response.text[:500])
            return None
    except Exception as e:
        print(f"❌ Error generating image: {e}")
        return None

def main():
    output_dir = Path("generated_photos")
    output_dir.mkdir(exist_ok=True)
    
    print("="*60)
    print("Briva Nuotraukų Generavimas")
    print("Išlaikant tą patį veidą visose nuotraukose")
    print("="*60)
    
    # Check API - same as working scripts
    print("\nChecking if Stable Diffusion API is available...")
    if not check_api_available():
        print("❌ ERROR: Stable Diffusion API is not available!")
        print(f"   Make sure Stable Diffusion is running at: {API_URL}")
        return
    
    print("✅ API is available!")
    
    # Load reference image
    actual_path = find_reference_image()
    if not actual_path:
        print(f"\n❌ ERROR: Reference image not found!")
        print(f"   Please place your reference portrait image in the project root with one of these names:")
        print(f"   - briva_reference.png (recommended)")
        print(f"   - briva_reference.jpg")
        print(f"   - briva.png")
        print(f"   - reference.png")
        print(f"\n   Or place it in generated_photos/ folder")
        return
    
    print(f"\n✅ Found reference image: {actual_path}")
    reference_image_base64 = load_reference_image(actual_path)
    if not reference_image_base64:
        return
    
    # Get checkpoint
    print("\nLooking for best checkpoint...")
    checkpoint = get_best_checkpoint()
    if checkpoint:
        print(f"✅ Using checkpoint: {checkpoint}")
    else:
        print("⚠️  Using default checkpoint")
    
    print(f"\nStarting to generate {len(scenarios)} images for Briva...")
    print("IMPORTANT: All images will maintain the SAME facial identity from reference image")
    print("="*60)
    
    generated_files = []
    
    for i, scenario in enumerate(scenarios):
        print(f"\n{'='*60}")
        print(f"Generating {i+1}/{len(scenarios)}: {scenario['name']}")
        print(f"Scenario: {scenario['prompt'][:100]}...")
        print(f"Denoising strength: {scenario['denoising_strength']} (lower = more similar to reference)")
        print(f"{'='*60}")
        
        output_path = output_dir / f"{scenario['name']}.png"
        
        file_path = generate_image_img2img(
            reference_image_base64,
            scenario['prompt'],
            negative_prompt,
            scenario['denoising_strength'],
            scenario['seed'],
            output_path,
            checkpoint
        )
        
        if file_path:
            generated_files.append(file_path)
        
        print(f"Generated {i+1}/{len(scenarios)} images\n")
    
    print(f"\n{'='*60}")
    if generated_files:
        print(f"✅ All {len(generated_files)} images successfully generated!")
        print("\nGenerated files:")
        for file in generated_files:
            print(f"  - {file}")
        print(f"\n{'='*60}")
        print("✅ IMPORTANT: All images should show the SAME person (Briva)")
        print("   with consistent facial identity across all scenarios.")
        print(f"{'='*60}")
    else:
        print("❌ Failed to generate images")
        print(f"{'='*60}")

if __name__ == "__main__":
    main()
