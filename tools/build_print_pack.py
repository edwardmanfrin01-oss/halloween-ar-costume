"""Create A4 print pages with dimensions based on the actual black code bounds."""
from pathlib import Path
import re, base64, io
import xml.etree.ElementTree as ET
from PIL import Image, ImageChops
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/halloween-a4-print-pack.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(OUT), pagesize=(210*mm,297*mm))
c.setTitle('Halloween - A4 print pack')
NS = {'s':'http://www.w3.org/2000/svg'}

def polygons(path):
    tokens = re.findall(r'[MLHVZmlhvz]|[-+]?(?:\d*\.\d+|\d+)', path)
    i=0; x=y=0; current=[]; result=[]; command=None
    while i<len(tokens):
        if tokens[i].isalpha():
            command=tokens[i]; i+=1
        if command.lower()=='z':
            result.append(current); x,y=current[0]; current=[]; command=None; continue
        relative=command.islower(); kind=command.upper()
        if kind in ('M','L'):
            a,b=float(tokens[i]),float(tokens[i+1]); i+=2
            x,y=(x+a,y+b) if relative else (a,b)
            current.append((x,y))
            if kind=='M': command='l' if relative else 'L'
        elif kind=='H':
            a=float(tokens[i]); i+=1; x=x+a if relative else a; current.append((x,y))
        elif kind=='V':
            a=float(tokens[i]); i+=1; y=y+a if relative else a; current.append((x,y))
        else: raise ValueError(command)
    return result

files=['qrcode-ar.svg','hiro_marker.png','ghost-marker.png','matrix-hamming-5-print.svg','qrcode.svg']
for number,name in enumerate(files,1):
    source=ROOT/'assets'/('qrcodes' if name.startswith('qrcode') else 'markers')/name
    center_y=155*mm
    if name.startswith('qrcode'):
        tree=ET.parse(source)
        shapes=[]
        for element in tree.findall('.//s:path',NS): shapes.extend(polygons(element.attrib['d']))
        xs=[x for poly in shapes for x,y in poly]; ys=[y for poly in shapes for x,y in poly]
        xmin,xmax,ymin,ymax=min(xs),max(xs),min(ys),max(ys)
        module=min(max(x for x,y in poly)-min(x for x,y in poly) for poly in shapes)
        count=round((xmax-xmin)/module)
        side=min(190,210*count/(count+8))
        scale=side*mm/(xmax-xmin); left=(210-side)/2*mm; top=center_y+side*mm/2
        c.setFillColorRGB(0,0,0)
        for poly in shapes:
            path=c.beginPath(); path.moveTo(left+(poly[0][0]-xmin)*scale,top-(poly[0][1]-ymin)*scale)
            for x,y in poly[1:]: path.lineTo(left+(x-xmin)*scale,top-(y-ymin)*scale)
            path.close(); c.drawPath(path,fill=1,stroke=0)
        detail=f'Code: {side:.1f} mm | White margin: {(210-side)/2:.1f} mm per side (at least 4 modules)'
    else:
        if source.suffix=='.svg':
            embedded=ET.parse(source).find('.//s:image',NS).attrib['href'].split(',')[1]
            image=Image.open(io.BytesIO(base64.b64decode(embedded))).convert('RGB')
        else: image=Image.open(source).convert('RGB')
        bbox=ImageChops.difference(image,Image.new('RGB',image.size,'white')).getbbox()
        assert bbox and bbox[2]-bbox[0]==bbox[3]-bbox[1]
        # Remove only existing outer white padding; the PDF supplies a uniform margin.
        image=image.crop(bbox)
        c.drawImage(ImageReader(image),10*mm,center_y-95*mm,width=190*mm,height=190*mm)
        detail='Black square: 190 x 190 mm | White margin: 10 mm per side'
    c.setFillColorRGB(0,0,0); c.setFont('Helvetica-Bold',12)
    c.drawCentredString(105*mm,277*mm,f'{number} / 5 - {name}')
    c.setFont('Helvetica',9); c.drawCentredString(105*mm,267*mm,detail)
    c.drawCentredString(105*mm,32*mm,'A4 - Actual size / 100% - Single-sided - Do not fit or crop')
    c.drawCentredString(105*mm,25*mm,'Keep the white area around the entire code. Use matte paper.')
    c.line(80*mm,15*mm,130*mm,15*mm)
    c.line(80*mm,13*mm,80*mm,17*mm); c.line(130*mm,13*mm,130*mm,17*mm)
    c.setFont('Helvetica',8); c.drawCentredString(105*mm,9*mm,'Scale check: this line must measure 50 mm')
    c.showPage()
    print(name,detail)
c.save()
print(OUT)
