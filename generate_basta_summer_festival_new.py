import requests
import sys
import os
import base64

sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:7860"

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
                
                output_path = f"generated_photos/basta_{scenario_name}.png"
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
            print(response.text[:500])
            return None
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

# Basta profilio duomenys
basta_data = {
    "age": 29,
    "gender": "woman",
    "body_type": "larger",
    "height": "172cm",
    "hair_color": "colorful multi-colored",
    "eye_color": "brown eyes",
}

BASE_SEED = 15003  # Trečios nuotraukos seed

# Detalus tatuiruotės aprašymas
TATTOO_DESCRIPTION = "tattoo on left arm: geometric mandala pattern in black ink, tattoo on right arm: detailed rose with thorns in black and red ink, tattoo on neck: small anchor in black ink, tattoo on left shoulder: music note in black ink, tattoo on right shoulder: small star in black ink, all tattoos clearly visible and in same positions"

# Stiprus negative prompt be nuogumo
negative_prompt = "(Negative Realistic 3:1.0), nude, naked, topless, bare chest, exposed breasts, nipples, exposed genitals, no clothes, underwear visible, lingerie, bikini, swimsuit revealing, cleavage, nude body, naked body, hands, fingers, deformed hands, extra fingers, missing fingers, bad hands, malformed hands, worst hands, mutated hands, extra limbs, missing limbs, deformed limbs, worst anatomy, AI generated, artificial, fake, digital art, illustration, cartoon, anime, 3d render, painting, drawing"

# Naujas prompt: sėdi ant asfalto kelio viduryje - aiškus ir detalų aprašymas
prompt = f"realistic photograph, natural full body portrait of 29 year old punk rock woman, {basta_data['body_type']} body type, {basta_data['height']}, {basta_data['hair_color']} hair, {basta_data['eye_color']}, {TATTOO_DESCRIPTION}, sitting directly on asphalt road surface in the exact center middle of the street, legs visible, sitting cross-legged or with knees bent, bottom touching the asphalt road, wearing punk festival outfit with t-shirt and shorts or jeans, completely covered, high neckline, no skin exposure, no cleavage, festival setting during Lithuanian summer, sunny day, urban street environment, asphalt road texture clearly visible underneath and around her, road markings visible, street perspective showing she is in the middle of the road, full body visible from front, sitting pose on ground, realistic skin texture, natural imperfections like subtle freckles, wrinkles, messy colorful hair, same tattoos in same positions on body, fully clothed, conservative festival wear, real photo, authentic, documentary style, not AI art, high quality, detailed face, photorealistic"

if __name__ == "__main__":
    if not check_api_available():
        print("Error: Stable Diffusion API is not available")
        sys.exit(1)
    
    print("Generating new Basta summer festival photo - sitting on asphalt road...")
    
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
    
    print(f"\nGenerating: summer_festival (sitting on asphalt road)")
    file_path = generate_image(
        prompt,
        negative_prompt,
        BASE_SEED,
        "summer_festival",
        checkpoint_name
    )
    
    if file_path:
        print(f"\n✅ Successfully generated new Basta summer festival photo!")
        print(f"Photo saved: {file_path}")
    else:
        print("\n❌ Failed to generate image")
