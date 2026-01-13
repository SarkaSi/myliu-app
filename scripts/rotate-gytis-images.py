#!/usr/bin/env python3
"""
Skriptas, kuris pasuka Gytis nuotraukas 90 laipsnių pagal laikrodžio rodyklę.
"""

import os
from PIL import Image

# Aplankai
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')
OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'outputs')

def rotate_images_in_directory(directory, prefix='gytis_'):
    """Pasukti visas nuotraukas su prefix vardu."""
    if not os.path.exists(directory):
        print(f'Aplankas neegzistuoja: {directory}')
        return
    
    # Rasti visas nuotraukas
    image_files = [f for f in os.listdir(directory) 
                   if f.startswith(prefix) and f.endswith('.png')]
    
    if not image_files:
        print(f'Nerastos nuotraukos su prefix "{prefix}" aplanke {directory}')
        return
    
    image_files.sort()
    print(f'Rastos {len(image_files)} nuotraukos')
    
    rotated_count = 0
    for filename in image_files:
        filepath = os.path.join(directory, filename)
        
        try:
            # Atidaryti nuotrauką
            img = Image.open(filepath)
            
            # Patikrinti nuotraukos dydį
            width, height = img.size
            print(f'Apdorojama {filename} (dydis: {width}x{height})...')
            
            # Pasukti 180 laipsnių, kad turinys būtų teisingai orientuotas
            # Tai pasuks nuotrauką taip, kad horizontalus turinys taptų vertikaliu
            print(f'  Sukam 180 laipsniu...')
            rotated_img = img.rotate(180, expand=True)
            
            rotated_img.save(filepath, 'PNG', quality=95)
            new_width, new_height = rotated_img.size
            print(f'  Pasukta! Naujas dydis: {new_width}x{new_height}')
            rotated_count += 1
                
        except Exception as e:
            print(f'Klaida apdorojant {filename}: {e}')
    
    print(f'\nIs viso pasukta {rotated_count} nuotraukos')

if __name__ == '__main__':
    print('Pradedamas Gytis nuotrauku sukimas...\n')
    
    # Pasukti nuotraukas public aplanke
    print('Public aplankas:')
    rotate_images_in_directory(PUBLIC_DIR, 'gytis_')
    
    print('\nOutputs aplankas:')
    rotate_images_in_directory(OUTPUTS_DIR, 'image_')
    
    print('\nBaigta!')
