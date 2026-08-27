import os
import sys
import json
import zipfile

# Ensure utf-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def build_package():
    with open("manifest.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    version = manifest.get("version", "1.0.0")
    pkg_name = f"ai-web-summarizer-v{version}.zip"
    
    os.makedirs("dist", exist_ok=True)
    output_path = os.path.join("dist", pkg_name)

    files_to_include = [
        "manifest.json",
        "background.js",
        "content.js",
        "options.html",
        "options.css",
        "options.js",
        "popup.html",
        "popup.css",
        "popup.js",
        "README.md"
    ]
    
    icon_files = [
        "icons/icon16.png",
        "icons/icon32.png",
        "icons/icon48.png",
        "icons/icon128.png"
    ]

    print(f"[*] 開始打包擴充套件 v{version}...")

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in files_to_include:
            if os.path.exists(file):
                zipf.write(file, file)
                print(f"  + 加入: {file}")
            else:
                print(f"  ! 找不到檔案: {file}")

        for icon in icon_files:
            if os.path.exists(icon):
                zipf.write(icon, icon)
                print(f"  + 加入: {icon}")
            else:
                print(f"  ! 找不到圖示: {icon}")

    file_size_kb = os.path.getsize(output_path) / 1024
    print("\n" + "="*50)
    print("打包完成！獨立安裝包已輸出至：")
    print(f"檔案路徑: {os.path.abspath(output_path)} ({file_size_kb:.1f} KB)")
    print("="*50)

if __name__ == "__main__":
    build_package()
