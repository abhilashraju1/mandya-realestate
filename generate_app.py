import os

WEB_DIR = "/home/5296658037_0/.gemini/antigravity/scratch/mandya-realestate/apps/web"

def write_file(rel_path, content):
    full_path = os.path.join(WEB_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {rel_path}")

print("Generating Mandya Properties App...")
