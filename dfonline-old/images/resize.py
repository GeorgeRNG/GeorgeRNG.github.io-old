import os
from PIL import Image


f = r'C:/Users/georg/Documents/LocalData/clones/GeorgeRNG.github.io/dfonline/images/normal'
for file in os.listdir(f):
    if file.rstrip(".png") != file:
        f_img = f+"/"+file
        img = Image.open(f_img)
        img = img.resize((640,640),resample=Image.BOX)
        img.save(f_img)
