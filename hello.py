from flask import Flask, render_template, request, send_file, jsonify
import qrcode
from io import BytesIO
import base64
from PIL import Image, ImageDraw

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

def add_rounded_logo(img, logo_file, size):
    """Add a rounded (circular) logo at the center of the QR code."""
    logo = Image.open(logo_file).convert("RGBA")
    logo_size = size // 5  # ~20% of QR
    logo = logo.resize((logo_size, logo_size))

    # Create circular mask
    mask = Image.new("L", (logo_size, logo_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, logo_size, logo_size), fill=255)

    pos = ((size - logo_size) // 2, (size - logo_size) // 2)
    img.paste(logo, pos, mask=mask)
    return img

@app.route("/generate-server", methods=["POST"])
def generate_server():
    data = request.form.get("data", "").strip()
    size = int(request.form.get("size", 300))
    fg = request.form.get("fg", "#000000")
    bg = request.form.get("bg", "#FFFFFF")
    logo_file = request.files.get("logo")

    if not data:
        return jsonify({"error": "No data provided"}), 400

    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fg, back_color=bg).convert("RGB")
    img = img.resize((size, size))

    if logo_file:
        img = add_rounded_logo(img, logo_file, size)

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    base64_img = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return jsonify({"img": base64_img})

@app.route("/download-server", methods=["POST"])
def download_server():
    data = request.form.get("data", "https://example.com")
    size = int(request.form.get("size", 300))
    fg = request.form.get("fg", "#000000")
    bg = request.form.get("bg", "#FFFFFF")
    filename = request.form.get("filename", "qr.png")
    logo_file = request.files.get("logo")

    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fg, back_color=bg).convert("RGB")
    img = img.resize((size, size))

    if logo_file:
        img = add_rounded_logo(img, logo_file, size)

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return send_file(buffer, mimetype="image/png", as_attachment=True, download_name=filename)

if __name__ == "__main__":
    app.run(debug=True)
