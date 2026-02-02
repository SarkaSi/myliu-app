"""
Hibridinis nuotraukų generavimo skriptas su ChatGPT prompt generavimu
Naudoja OpenAI API (ChatGPT) prompt generavimui ir Stable Diffusion API nuotraukų generavimui
Arba gali naudoti DALL-E API kaip alternatyvą
"""

import requests
import base64
import json
import os
import sys
from pathlib import Path
from openai import OpenAI

# Load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv is not installed, try to load .env manually
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# API URLs
STABLE_DIFFUSION_URL = "http://127.0.0.1:7860"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Member data template
member_data_template = {
    "age": 26,
    "gender": "man",
    "body_type": "athletic",
    "height": "182cm",
    "hair_color": "light",
    "eye_color": "blue eyes",
    "interests": ["nature walks", "hiking"],
    "bio": "Adventure enthusiast"
}

def check_stable_diffusion_api():
    """Check if Stable Diffusion API is available"""
    try:
        response = requests.get(f"{STABLE_DIFFUSION_URL}/sdapi/v1/sd-models", timeout=5)
        return response.status_code == 200
    except:
        return False

def check_openai_api():
    """Check if OpenAI API key is configured"""
    return OPENAI_API_KEY is not None and OPENAI_API_KEY != ""

def generate_prompt_with_chatgpt(member_data, scenario_description):
    """
    Generate image prompt using ChatGPT
    """
    if not check_openai_api():
        print("Warning: OpenAI API key not found. Using default prompt generation.")
        return None
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    system_prompt = """You are an expert at creating detailed, photorealistic image prompts for Stable Diffusion.
Your prompts should be:
- Very detailed and specific
- Focus on realistic photography style
- Include lighting, composition, and setting details
- Emphasize natural imperfections and authentic appearance
- Avoid AI art keywords, focus on "realistic photograph" style
- Include specific details about the person's appearance
- Describe the scene and atmosphere in detail

Format: Single paragraph, no line breaks, very detailed."""

    user_prompt = f"""Create a detailed Stable Diffusion prompt for a realistic photograph of a person.

Person details:
- Age: {member_data.get('age', 'unknown')}
- Gender: {member_data.get('gender', 'unknown')}
- Body type: {member_data.get('body_type', 'unknown')}
- Height: {member_data.get('height', 'unknown')}
- Hair color: {member_data.get('hair_color', 'unknown')}
- Eye color: {member_data.get('eye_color', 'unknown')}
- Bio: {member_data.get('bio', '')}
- Interests: {', '.join(member_data.get('interests', []))}

Scenario: {scenario_description}

Generate a very detailed, photorealistic prompt for Stable Diffusion that will create a realistic photograph (not AI art, not illustration, not cartoon). Include specific details about lighting, setting, composition, and natural imperfections."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using cheaper model for prompts
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        generated_prompt = response.choices[0].message.content.strip()
        print(f"✅ ChatGPT generated prompt: {generated_prompt[:100]}...")
        return generated_prompt
    except Exception as e:
        print(f"❌ Error generating prompt with ChatGPT: {e}")
        return None

def generate_image_with_dalle(member_data, scenario_description, output_path):
    """
    Generate image using DALL-E API
    """
    if not check_openai_api():
        print("Error: OpenAI API key not found for DALL-E")
        return None
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    prompt = f"""Realistic photograph of {member_data.get('age', '')} year old {member_data.get('gender', 'person')}, 
{member_data.get('body_type', '')} body type, {member_data.get('height', '')}, 
{member_data.get('hair_color', '')} hair, {member_data.get('eye_color', '')} eyes.
{scenario_description}
Realistic photograph, natural portrait, chest up framing, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"""
    
    try:
        print(f"Generating image with DALL-E...")
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        
        image_url = response.data[0].url
        
        # Download image
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(img_response.content)
            print(f"✅ DALL-E image saved: {output_path}")
            return output_path
        else:
            print(f"❌ Error downloading DALL-E image: {img_response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error generating image with DALL-E: {e}")
        return None

def generate_image_with_stable_diffusion(prompt, negative_prompt, seed, output_path, checkpoint=None):
    """
    Generate image using Stable Diffusion API
    """
    if not check_stable_diffusion_api():
        print("Error: Stable Diffusion API is not available")
        return None
    
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
            switch_response = requests.post(f"{STABLE_DIFFUSION_URL}/sdapi/v1/options", json={"sd_model_checkpoint": checkpoint}, timeout=5)
        except:
            pass
    
    try:
        print(f"Generating image with Stable Diffusion (seed {seed})...")
        response = requests.post(f"{STABLE_DIFFUSION_URL}/sdapi/v1/txt2img", json=payload, timeout=400)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                image_data = result['images'][0]
                image_bytes = base64.b64decode(image_data)
                
                with open(output_path, 'wb') as f:
                    f.write(image_bytes)
                
                print(f"✅ Stable Diffusion image saved: {output_path}")
                return output_path
            else:
                print("❌ Error: API did not return image")
                return None
        else:
            print(f"❌ Error: API returned status code {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error generating image: {e}")
        return None

def get_best_checkpoint():
    """Get best checkpoint for Stable Diffusion"""
    try:
        response = requests.get(f"{STABLE_DIFFUSION_URL}/sdapi/v1/sd-models", timeout=5)
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

def main():
    """
    Main function - generates images using ChatGPT prompts + Stable Diffusion
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate images with ChatGPT prompts')
    parser.add_argument('--use-dalle', action='store_true', help='Use DALL-E instead of Stable Diffusion')
    parser.add_argument('--member-name', type=str, required=True, help='Member name')
    parser.add_argument('--scenarios', type=str, nargs='+', required=True, help='Scenario descriptions')
    parser.add_argument('--base-seed', type=int, default=30000, help='Base seed for Stable Diffusion')
    
    args = parser.parse_args()
    
    # Example member data - customize as needed
    member_data = {
        "age": 26,
        "gender": "man",
        "body_type": "athletic",
        "height": "182cm",
        "hair_color": "light",
        "eye_color": "blue eyes",
        "interests": ["nature walks", "hiking", "camping"],
        "bio": "Adventure enthusiast"
    }
    
    output_dir = Path("generated_photos")
    output_dir.mkdir(exist_ok=True)
    
    # Check APIs
    if args.use_dalle:
        if not check_openai_api():
            print("❌ ERROR: OpenAI API key not found! Set OPENAI_API_KEY environment variable.")
            return
        print("✅ Using DALL-E API for image generation")
    else:
        if not check_stable_diffusion_api():
            print("❌ ERROR: Stable Diffusion API is not available!")
            return
        print("✅ Stable Diffusion API is available")
        
        if check_openai_api():
            print("✅ OpenAI API key found - will use ChatGPT for prompt generation")
        else:
            print("⚠️  Warning: OpenAI API key not found - using default prompts")
    
    # Get checkpoint if using Stable Diffusion
    checkpoint = None
    if not args.use_dalle:
        checkpoint = get_best_checkpoint()
        if checkpoint:
            print(f"✅ Using checkpoint: {checkpoint}")
    
    generated_files = []
    
    for i, scenario_description in enumerate(args.scenarios):
        print(f"\n{'='*60}")
        print(f"Generating {i+1}/{len(args.scenarios)}: {scenario_description}")
        print(f"{'='*60}")
        
        # Generate prompt with ChatGPT if available
        if check_openai_api() and not args.use_dalle:
            prompt = generate_prompt_with_chatgpt(member_data, scenario_description)
            if not prompt:
                # Fallback to default prompt
                prompt = f"realistic photograph, natural portrait of {member_data['age']} year old {member_data['gender']}, {member_data['body_type']} body type, {member_data['height']}, {member_data['hair_color']} hair, {member_data['eye_color']}, {scenario_description}, realistic photograph, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
        else:
            # Default prompt
            prompt = f"realistic photograph, natural portrait of {member_data['age']} year old {member_data['gender']}, {member_data['body_type']} body type, {member_data['height']}, {member_data['hair_color']} hair, {member_data['eye_color']}, {scenario_description}, realistic photograph, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"
        
        negative_prompt = "(Negative Realistic 3:1.0), ugly, deformed, bad anatomy, bad proportions, blurry, low quality, worst quality, lowres, jpeg artifacts, watermark, signature, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing, perfect skin, flawless, airbrushed, plastic"
        
        scenario_name = scenario_description.lower().replace(" ", "_").replace(",", "").replace(".", "")[:50]
        output_path = output_dir / f"{args.member_name.lower()}_{scenario_name}.png"
        
        if args.use_dalle:
            # Use DALL-E
            file_path = generate_image_with_dalle(member_data, scenario_description, output_path)
        else:
            # Use Stable Diffusion with ChatGPT prompt
            seed = args.base_seed + i * 150
            file_path = generate_image_with_stable_diffusion(prompt, negative_prompt, seed, output_path, checkpoint)
        
        if file_path:
            generated_files.append(file_path)
    
    print(f"\n{'='*60}")
    if generated_files:
        print(f"✅ All images successfully generated!")
        for file in generated_files:
            print(f"  - {file}")
    else:
        print("❌ Failed to generate images")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
