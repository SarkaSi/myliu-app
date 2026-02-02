import openai
import os
import sys
import base64
import requests
from pathlib import Path
from PIL import Image
import io

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# OpenAI API key - patikrinkite arba nustatykite kaip environment variable
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("ERROR: OPENAI_API_KEY not found in environment variables")
    print("Please set it using: set OPENAI_API_KEY=your_key_here")
    print("Or create a .env file with OPENAI_API_KEY=your_key_here")
    sys.exit(1)

# Initialize OpenAI client
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Reference nuotraukos kelias
REFERENCE_IMAGE_PATH = r"C:\Users\maini\Desktop\britvos\briva2_reference.png"

def load_reference_image(image_path):
    """Load reference image"""
    if not os.path.exists(image_path):
        print(f"ERROR: Reference image not found at {image_path}")
        return None
    
    try:
        with open(image_path, "rb") as f:
            return f.read()
    except Exception as e:
        print(f"ERROR: Could not load reference image: {e}")
        return None

def analyze_face_with_chatgpt(image_data):
    """Use ChatGPT Vision to analyze the face and create detailed description"""
    print("\nAnalyzing reference image with ChatGPT Vision...")
    
    try:
        # Convert image to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyze this portrait photo in extreme detail. Describe the person's face with precise details that would allow recreating the EXACT same face in different photos:

1. Face shape and structure
2. Eye shape, color, and position
3. Nose shape and size
4. Lip shape and size
5. Chin and jawline
6. Eyebrow shape and position
7. Skin texture and tone
8. Hair color, style, and texture
9. Any distinctive features (moles, freckles, etc.)
10. Overall facial proportions

Be extremely specific. This description will be used to generate 6 different photos of the SAME person in different scenarios. The face must be IDENTICAL in all photos."""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        face_description = response.choices[0].message.content
        print("✓ Face analysis complete")
        print(f"\nFace description:\n{face_description}\n")
        return face_description
        
    except Exception as e:
        print(f"ERROR analyzing face: {e}")
        return None

def generate_image_with_dalle(prompt, output_path, size="1024x1024"):
    """Generate image using DALL-E 3"""
    try:
        print(f"Generating image: {output_path.name}...")
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        
        # Download image
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            # Save image
            with open(output_path, 'wb') as f:
                f.write(img_response.content)
            
            # Resize to 512x768 if needed (for consistency with other photos)
            img = Image.open(output_path)
            img_resized = img.resize((512, 768), Image.Resampling.LANCZOS)
            img_resized.save(output_path, 'PNG')
            
            print(f"✓ Saved: {output_path}")
            return True
        else:
            print(f"✗ Failed to download image")
            return False
            
    except Exception as e:
        print(f"✗ Error generating image: {e}")
        return False

# Base face description (will be filled by ChatGPT analysis)
FACE_DESCRIPTION_PLACEHOLDER = "{FACE_DESCRIPTION}"

# 6 scenos pagal reikalavimus
scenarios = [
    {
        "name": "cafe_leisure",
        "prompt": f"""Realistic photograph of a 50-year-old man with {FACE_DESCRIPTION_PLACEHOLDER}, sitting in a cozy cafe by a window, natural daylight streaming in, relaxed expression, wearing casual comfortable clothes, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with visible pores and subtle imperfections, natural lighting, no filters, no beauty filters, documentary style, authentic moment, not posed, real photo, photorealistic, natural everyday scene"""
    },
    {
        "name": "city_street",
        "prompt": f"""Realistic photograph of a 50-year-old man with {FACE_DESCRIPTION_PLACEHOLDER}, walking on a city street during everyday moment, wearing casual everyday clothes, natural street lighting, captured candid moment, not posed, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with visible pores and subtle imperfections, natural daylight, no filters, documentary style, authentic, real photo, photorealistic, natural urban scene"""
    },
    {
        "name": "home_comfort",
        "prompt": f"""Realistic photograph of a 50-year-old man with {FACE_DESCRIPTION_PLACEHOLDER}, at home in comfortable setting, soft warm indoor lighting, cozy atmosphere, showing natural emotion, wearing comfortable home clothes, upper body portrait, chest up framing, 50mm lens, natural depth of field, realistic skin texture with visible pores and subtle imperfections, warm lighting, no filters, documentary style, authentic moment, real photo, photorealistic, natural home scene"""
    },
    {
        "name": "evening_calm",
        "prompt": f"""Realistic photograph of a 50-year-old man with {FACE_DESCRIPTION_PLACEHOLDER}, evening in city or at home, warm evening lighting, calm peaceful mood, natural relaxed expression, wearing casual evening clothes, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with visible pores and subtle imperfections, warm evening light, no filters, documentary style, authentic, real photo, photorealistic, natural evening scene"""
    },
    {
        "name": "close_portrait",
        "prompt": f"""Realistic close-up portrait photograph of a 50-year-old man with {FACE_DESCRIPTION_PLACEHOLDER}, half body or face shot, neutral simple background, very clear same face visible with identical facial features, same eyes, same nose, same lips, same chin, upper body portrait, chest up framing, 50mm lens, natural depth of field, realistic skin texture with visible pores and subtle imperfections, natural lighting, no filters, documentary style, authentic, real photo, photorealistic, professional portrait"""
    },
    {
        "name": "laughing_moment",
        "prompt": f"""Realistic photograph of a 50-year-old man with {FACE_DESCRIPTION_PLACEHOLDER}, laughing or talking, caught in real emotional moment, not posing, genuine natural expression, authentic moment, upper body portrait, chest up framing, 35mm lens, natural depth of field, realistic skin texture with visible pores and subtle imperfections, natural lighting, no filters, documentary style, authentic moment, real photo, photorealistic, candid emotional moment"""
    }
]

def main():
    print("=" * 60)
    print("Generating Britva2 profile images using OpenAI DALL-E 3")
    print("Using ChatGPT Vision to analyze reference face")
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
    reference_image_data = load_reference_image(REFERENCE_IMAGE_PATH)
    if not reference_image_data:
        print("ERROR: Could not load reference image")
        return
    
    print("✓ Reference image loaded successfully")
    
    # Analyze face with ChatGPT Vision
    face_description = analyze_face_with_chatgpt(reference_image_data)
    if not face_description:
        print("ERROR: Could not analyze face")
        return
    
    # Create output directories
    output_dir = Path("generated_photos")
    output_dir.mkdir(exist_ok=True)
    public_dir = Path("public")
    public_dir.mkdir(exist_ok=True)
    
    # Generate images
    print("\n" + "=" * 60)
    print("Starting image generation with DALL-E 3...")
    print("=" * 60)
    print("\nIMPORTANT: All images will show the SAME PERSON with IDENTICAL FACE")
    print("Using detailed face description to maintain consistency\n")
    
    generated_files = []
    
    for i, scenario in enumerate(scenarios):
        print(f"\n[{i+1}/6] Generating: {scenario['name']}")
        
        # Replace placeholder with actual face description
        prompt = scenario['prompt'].replace(FACE_DESCRIPTION_PLACEHOLDER, face_description)
        
        output_path = output_dir / f"britva2_{scenario['name']}.png"
        
        success = generate_image_with_dalle(prompt, output_path)
        
        if success:
            generated_files.append(output_path)
            # Copy to public folder
            public_path = public_dir / output_path.name
            try:
                import shutil
                shutil.copy2(output_path, public_path)
                print(f"  ✓ Copied to public/")
            except Exception as e:
                print(f"  ⚠ Failed to copy: {e}")
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
    else:
        print("\n✗ Failed to generate images")
        print("Please check the error messages above")

if __name__ == "__main__":
    main()
