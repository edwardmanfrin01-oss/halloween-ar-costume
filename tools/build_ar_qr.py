"""Generate a separate QR for the AR home and verify its payload."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tmp-qr-tools'))
import qrcode
import qrcode.image.svg
import zxingcpp
from PIL import Image

URL = 'https://edwardmanfrin01-oss.github.io/halloween-ar-costume/halloween-ar.html'
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=16, border=4)
qr.add_data(URL)
qr.make(fit=True)
png = ROOT / 'assets/qrcode-ar.png'
qr.make_image(fill_color='black', back_color='white').save(png)
qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage).save(ROOT / 'assets/qrcode-ar.svg')
decoded = zxingcpp.read_barcode(Image.open(png))
assert decoded and decoded.text == URL, 'QR decoding did not match the destination'
print(f'QR verified: {decoded.text}')
