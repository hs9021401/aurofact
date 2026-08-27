import os
from PIL import Image, ImageDraw

def create_icon(size):
    scale = 4
    img_size = size * scale
    corner_radius = int(img_size * 0.22)
    
    # Base background
    final_bg = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(final_bg)

    # Draw gradient background onto mask
    for y in range(img_size):
        r = int(99 + (79 - 99) * (y / img_size))
        g = int(102 + (70 - 102) * (y / img_size))
        b = int(241 + (229 - 241) * (y / img_size))
        draw.line([(0, y), (img_size, y)], fill=(r, g, b, 255))
    
    # Mask to rounded rect
    mask = Image.new('L', (img_size, img_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        [0, 0, img_size - 1, img_size - 1],
        radius=corner_radius,
        fill=255
    )
    
    base_bg = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    final_bg = Image.composite(final_bg, base_bg, mask)

    # Document sheet
    doc_left = int(img_size * 0.22)
    doc_top = int(img_size * 0.18)
    doc_right = int(img_size * 0.78)
    doc_bottom = int(img_size * 0.82)
    doc_radius = int(img_size * 0.08)

    doc_layer = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    d_draw = ImageDraw.Draw(doc_layer)
    d_draw.rounded_rectangle(
        [doc_left, doc_top, doc_right, doc_bottom],
        radius=doc_radius,
        fill=(255, 255, 255, 245)
    )
    final_bg = Image.alpha_composite(final_bg, doc_layer)
    draw = ImageDraw.Draw(final_bg)

    # Draw summary lines (accent colored)
    line_color = (99, 102, 241, 240)
    dot_color = (236, 72, 153, 255) # Pink sparkle dot
    line_h = max(2, int(img_size * 0.055))
    
    # Line 1 (short title)
    y1 = int(img_size * 0.32)
    draw.rounded_rectangle([int(img_size * 0.32), y1, int(img_size * 0.58), y1 + line_h], radius=line_h//2, fill=(79, 70, 229, 255))
    
    # Sparkle / Star at top right of doc
    s_cx = int(img_size * 0.68)
    s_cy = int(img_size * 0.34)
    s_r = int(img_size * 0.06)
    draw.ellipse([s_cx - s_r, s_cy - s_r, s_cx + s_r, s_cy + s_r], fill=dot_color)

    # Line 2 (with bullet point)
    y2 = int(img_size * 0.46)
    draw.ellipse([int(img_size * 0.30), y2, int(img_size * 0.30) + line_h, y2 + line_h], fill=dot_color)
    draw.rounded_rectangle([int(img_size * 0.38), y2, int(img_size * 0.70), y2 + line_h], radius=line_h//2, fill=line_color)

    # Line 3 (with bullet point)
    y3 = int(img_size * 0.58)
    draw.ellipse([int(img_size * 0.30), y3, int(img_size * 0.30) + line_h, y3 + line_h], fill=dot_color)
    draw.rounded_rectangle([int(img_size * 0.38), y3, int(img_size * 0.65), y3 + line_h], radius=line_h//2, fill=line_color)

    # Line 4 (with bullet point)
    y4 = int(img_size * 0.70)
    draw.ellipse([int(img_size * 0.30), y4, int(img_size * 0.30) + line_h, y4 + line_h], fill=dot_color)
    draw.rounded_rectangle([int(img_size * 0.38), y4, int(img_size * 0.54), y4 + line_h], radius=line_h//2, fill=line_color)

    final_img = final_bg.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    os.makedirs("icons", exist_ok=True)
    for size in [16, 32, 48, 128]:
        img = create_icon(size)
        img.save(f"icons/icon{size}.png")
        print(f"Generated icons/icon{size}.png")

if __name__ == "__main__":
    main()
