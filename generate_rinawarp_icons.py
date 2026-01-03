#!/usr/bin/env python3
"""
RinaWarp Icon Pack Generator
Generates comprehensive icon sets for the RinaWarp project from a base 128x128 icon.

This script creates icons for:
- Web App icons (72, 96, 128, 192, 256, 384, 512px)
- VSCode Extension icons (32, 64, 128, 256, 512px)
- General app icons (16, 24, 32, 48, 64, 72, 96, 128, 256, 384, 512, 1024px)
- Favicon and Apple touch icons
"""

from PIL import Image, ImageOps
import os
from zipfile import ZipFile
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RinaWarpIconGenerator:
    def __init__(self, base_icon_path="assets/app-icon.png"):
        """
        Initialize the icon generator.
        
        Args:
            base_icon_path (str): Path to the base 128x128 icon
        """
        self.base_path = Path(base_icon_path)
        self.project_root = Path.cwd()
        
        # Define icon sets for different purposes
        self.icon_sets = {
            'web_app': [72, 96, 128, 192, 256, 384, 512],
            'vscode_extension': [32, 64, 128, 256, 512],
            'general': [16, 24, 32, 48, 64, 72, 96, 128, 256, 384, 512, 1024],
            'favicon': [16, 32],
            'apple_touch': [180]
        }
        
        # Output directories
        self.output_dirs = {
            'web_app': self.project_root / "assets" / "web-icons" / "RinaWarp_WebApp_Icons" / "icons",
            'vscode': self.project_root / "rinawarp-vscode" / "media",
            'general': self.project_root / "assets" / "icons",
            'favicon': self.project_root / "assets",
            'apple_touch': self.project_root / "assets"
        }
        
        logger.info(f"RinaWarp Icon Generator initialized")
        logger.info(f"Base icon path: {self.base_path}")
        logger.info(f"Project root: {self.project_root}")
    
    def validate_base_icon(self):
        """Validate that the base icon exists and can be loaded."""
        if not self.base_path.exists():
            raise FileNotFoundError(f"Base icon not found: {self.base_path}")
        
        try:
            img = Image.open(self.base_path)
            img.verify()  # Verify it's a valid image
        except Exception as e:
            raise ValueError(f"Invalid image file {self.base_path}: {e}")
        
        logger.info(f"✓ Base icon validated: {self.base_path}")
    
    def create_directories(self):
        """Create output directories if they don't exist."""
        for name, dir_path in self.output_dirs.items():
            dir_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"✓ Directory ready: {dir_path}")
    
    def load_base_image(self):
        """Load and prepare the base image."""
        img = Image.open(self.base_path).convert("RGBA")
        
        # Ensure the image is square by padding if necessary
        width, height = img.size
        if width != height:
            size = max(width, height)
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            logger.info(f"✓ Base image resized to square: {size}x{size}")
        
        logger.info(f"✓ Base image loaded: {img.size} (RGBA)")
        return img
    
    def resize_icon(self, img, size):
        """
        Resize icon using high-quality resampling.
        
        Args:
            img (PIL.Image): Source image
            size (int): Target size
            
        Returns:
            PIL.Image: Resized image
        """
        # Use LANCZOS (now called Resampling.LANCZOS in newer Pillow versions)
        try:
            return img.resize((size, size), Image.Resampling.LANCZOS)
        except AttributeError:
            # Fallback for older Pillow versions
            return img.resize((size, size), Image.LANCZOS)
    
    def generate_icon_set(self, img, sizes, output_dir, prefix=""):
        """
        Generate a set of icons.
        
        Args:
            img (PIL.Image): Base image
            sizes (list): List of sizes to generate
            output_dir (Path): Output directory
            prefix (str): Filename prefix
            
        Returns:
            list: Generated file paths
        """
        generated_files = []
        output_dir = Path(output_dir)
        
        for size in sizes:
            resized = self.resize_icon(img, size)
            
            if prefix:
                filename = f"{prefix}-{size}.png"
            else:
                filename = f"icon-{size}.png"
            
            out_path = output_dir / filename
            resized.save(out_path, "PNG")
            generated_files.append(str(out_path))
            
            logger.info(f"✓ Generated: {filename} ({size}x{size})")
        
        return generated_files
    
    def generate_special_icons(self, img):
        """Generate special icons like favicon and apple-touch-icon."""
        generated_files = []
        
        # Generate favicon files
        favicon_dir = self.output_dirs['favicon']
        for size in [16, 32]:
            resized = self.resize_icon(img, size)
            favicon_path = favicon_dir / f"favicon-{size}x{size}.png"
            resized.save(favicon_path, "PNG")
            generated_files.append(str(favicon_path))
            logger.info(f"✓ Generated: favicon-{size}x{size}.png")
        
        # Generate apple-touch-icon (180x180)
        apple_dir = self.output_dirs['apple_touch']
        apple_path = apple_dir / "apple-touch-icon.png"
        resized = self.resize_icon(img, 180)
        resized.save(apple_path, "PNG")
        generated_files.append(str(apple_path))
        logger.info(f"✓ Generated: apple-touch-icon.png (180x180)")
        
        return generated_files
    
    def create_web_app_manifest(self, icon_dir):
        """Create/update the web app manifest.json."""
        manifest_path = icon_dir.parent / "manifest.json"
        manifest_content = {
            "name": "RinaWarp",
            "short_name": "RinaWarp",
            "icons": [
                {
                    "src": f"icons/icon-{size}.png",
                    "sizes": f"{size}x{size}",
                    "type": "image/png",
                    "purpose": "any maskable"
                }
                for size in [72, 96, 128, 192, 256, 384, 512]
            ],
            "theme_color": "#000000",
            "background_color": "#ffffff",
            "display": "standalone",
            "orientation": "portrait-primary"
        }
        
        import json
        with open(manifest_path, 'w') as f:
            json.dump(manifest_content, f, indent=2)
        
        logger.info(f"✓ Updated web app manifest: {manifest_path}")
    
    def generate_all_icons(self):
        """Generate all icon sets for the RinaWarp project."""
        logger.info("🚀 Starting RinaWarp icon generation...")
        
        # Validate and prepare
        self.validate_base_icon()
        self.create_directories()
        
        # Load base image
        base_img = self.load_base_image()
        
        # Generate all icon sets
        all_generated_files = []
        
        # Web App icons
        logger.info("\n📱 Generating Web App icons...")
        web_files = self.generate_icon_set(
            base_img, 
            self.icon_sets['web_app'], 
            self.output_dirs['web_app']
        )
        all_generated_files.extend(web_files)
        self.create_web_app_manifest(self.output_dirs['web_app'])
        
        # VSCode Extension icons
        logger.info("\n🔧 Generating VSCode Extension icons...")
        vscode_files = self.generate_icon_set(
            base_img,
            self.icon_sets['vscode_extension'],
            self.output_dirs['vscode']
        )
        all_generated_files.extend(vscode_files)
        
        # General app icons
        logger.info("\n📦 Generating General app icons...")
        general_files = self.generate_icon_set(
            base_img,
            self.icon_sets['general'],
            self.output_dirs['general']
        )
        all_generated_files.extend(general_files)
        
        # Special icons (favicon, apple-touch)
        logger.info("\n⭐ Generating Special icons...")
        special_files = self.generate_special_icons(base_img)
        all_generated_files.extend(special_files)
        
        # Create ZIP package
        logger.info("\n📦 Creating ZIP package...")
        zip_path = self.project_root / "rinawarp_complete_icon_pack.zip"
        with ZipFile(zip_path, "w") as zipf:
            for file_path in all_generated_files:
                arcname = os.path.relpath(file_path, self.project_root)
                zipf.write(file_path, arcname=arcname)
        
        logger.info(f"✅ Icon generation complete!")
        logger.info(f"📁 Generated {len(all_generated_files)} icon files")
        logger.info(f"📦 ZIP package created: {zip_path}")
        
        # Summary
        self.print_summary(all_generated_files, zip_path)
        
        return all_generated_files, zip_path
    
    def print_summary(self, generated_files, zip_path):
        """Print a summary of generated files."""
        print("\n" + "="*60)
        print("🎨 RINAWARP ICON PACK GENERATION COMPLETE")
        print("="*60)
        
        print(f"\n📊 Generated Files: {len(generated_files)}")
        print(f"📦 ZIP Package: {zip_path}")
        
        print("\n📱 Web App Icons (assets/web-icons/RinaWarp_WebApp_Icons/icons/):")
        for size in self.icon_sets['web_app']:
            print(f"   • icon-{size}.png")
        
        print("\n🔧 VSCode Extension Icons (rinawarp-vscode/media/):")
        for size in self.icon_sets['vscode_extension']:
            print(f"   • icon-{size}.png")
        
        print("\n📦 General App Icons (assets/icons/):")
        for size in self.icon_sets['general']:
            print(f"   • icon-{size}.png")
        
        print("\n⭐ Special Icons (assets/):")
        print("   • favicon-16x16.png")
        print("   • favicon-32x32.png") 
        print("   • apple-touch-icon.png")
        
        print("\n🔧 Features:")
        print("   ✓ High-quality LANCZOS resampling")
        print("   ✓ PNG with RGBA transparency")
        print("   ✓ Squircle-friendly dimensions")
        print("   ✓ Cross-platform compatibility")
        print("   ✓ Web App manifest updated")
        print("   ✓ ZIP package for distribution")
        
        print("\n🚀 Perfect for:")
        print("   • Web applications")
        print("   • VSCode extensions")
        print("   • Desktop applications")
        print("   • PWA manifests")
        print("   • Mobile app icons")


def main():
    """Main function to run the icon generator."""
    try:
        # Look for the base icon in common locations
        possible_base_paths = [
            "assets/app-icon.png",
            "assets/rinawarp-logo.png",
            "assets/icons/icon-128.png",
            "assets/web-icons/RinaWarp_WebApp_Icons/icons/icon-128.png"
        ]
        
        base_icon_path = None
        for path in possible_base_paths:
            if Path(path).exists():
                base_icon_path = path
                break
        
        if not base_icon_path:
            print("❌ No base icon found. Please ensure one of these exists:")
            for path in possible_base_paths:
                print(f"   • {path}")
            return
        
        # Create generator and generate icons
        generator = RinaWarpIconGenerator(base_icon_path)
        generated_files, zip_path = generator.generate_all_icons()
        
        print(f"\n🎉 Success! Check {zip_path} for your complete icon pack.")
        
    except Exception as e:
        logger.error(f"❌ Error generating icons: {e}")
        raise


if __name__ == "__main__":
    main()