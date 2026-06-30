# Cut out (background -> transparent) with rembg. Run: py -3.14 cutout.py
import os
from rembg import remove
from PIL import Image

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets'))
PHOTOS = os.path.join(BASE, 'photos')
RAW = os.path.join(BASE, 'raw')
os.makedirs(PHOTOS, exist_ok=True)

# (input_path, output_name)
JOBS = [
    (os.path.join(PHOTOS, 'speaker_north.png'), 'speaker_north_cut.png'),
    (os.path.join(PHOTOS, 'speaker_south.png'), 'speaker_south_cut.png'),
    (os.path.join(RAW, 'official_cartoon.png'), 'official_cut.png'),
    (os.path.join(RAW, 'han_emperor.png'),       'han_emperor_cut.png'),
    (os.path.join(RAW, 'dynasty_vessel.png'),   'dynasty_vessel_cut.png'),
    (os.path.join(RAW, 'bronze_tools.png'),      'bronze_tools_cut.png'),
    (os.path.join(RAW, 'ancient_money.png'),     'ancient_money_cut.png'),
    (os.path.join(RAW, 'caravel_only.png'),      'caravel_cut.png'),
    (os.path.join(RAW, 'pict_house.png'),        'pict_house_cut.png'),
    (os.path.join(RAW, 'pict_horse.png'),        'pict_horse_cut.png'),
    (os.path.join(RAW, 'pict_person.png'),       'pict_person_cut.png'),
    (os.path.join(RAW, 'temple.png'),            'temple_cut.png'),
    (os.path.join(RAW, 'school.png'),            'school_cut.png'),
    (os.path.join(RAW, 'radio.png'),             'radio_cut.png'),
    (os.path.join(RAW, 'tv.png'),                'tv_cut.png'),
    (os.path.join(RAW, 'portuguese_building.png'), 'portuguese_building_cut.png'),
]

import sys
only = set(sys.argv[1:])
for inp, outname in JOBS:
    key = outname.replace('_cut.png', '')
    if only and key not in only:
        continue
    if not os.path.exists(inp):
        print('  skip (missing):', inp)
        continue
    img = Image.open(inp).convert('RGBA')
    out = remove(img, alpha_matting=True,
                 alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=15)
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    dst = os.path.join(PHOTOS, outname)
    out.save(dst)
    print('  OK', outname, out.size)
print('done')
