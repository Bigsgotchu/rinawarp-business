# OpenHaystack Personal Use Guide

## 🎯 **Ready to Track Your Items!**

Your OpenHaystack setup is complete and ready for personal use.

### 📱 **Simple 3-Step Process:**

#### Step 1: Get the OpenHaystack App
- Download the macOS app from: https://github.com/seemoo-lab/openhaystack/releases
- Install and open the app

#### Step 2: Create Your First Tracker
1. Open OpenHaystack app
2. Click "+" to add new accessory
3. Give it a name (e.g., "My Keys", "Backpack")
4. Right-click on the accessory → Copy advertisement key (Base64)

#### Step 3: Start Tracking
```bash
# Run the simple tracker script
/home/karina/Documents/RinaWarp/openhaystack-tracker.sh YOUR_COPIED_KEY_HERE
```

### 🔧 **Available Commands:**

**Test your setup:**
```bash
# Check if everything works
cd /home/karina/Documents/RinaWarp/openhaystack/Firmware/Linux_HCI
python3 HCI.py --help

# Check Bluetooth status
hcitool dev
```

**Start tracking (replace with your actual key):**
```bash
/home/karina/Documents/RinaWarp/openhaystack-tracker.sh YOUR_BASE64_KEY
```

### 🎯 **What to Track:**
- ✅ Keys
- ✅ Backpack/Bag
- ✅ Bike
- ✅ Laptop
- ✅ Wallet
- ✅ Any personal item

### 📍 **How It Works:**
1. **Run the script** → Your Linux device broadcasts the tracking signal
2. **Nearby iPhones** → Automatically detect and upload location to Apple
3. **View on map** → Check your OpenHaystack app to see the last known location

### 🔐 **Privacy & Security:**
- ✅ End-to-end encrypted
- ✅ Uses Apple's infrastructure
- ✅ Your private key stays on your device
- ✅ Only you can decrypt location data

### 🚀 **Quick Start Example:**
```bash
# After getting your key from the app:
/home/karina/Documents/RinaWarp/openhaystack-tracker.sh BgAAAAIGc2lnAAACjzANCAAShG6mU4y8i3r3Qe7h8Z3A1b2c9d0e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5
```

### ⚠️ **Important Notes:**
- Keep the script running to broadcast the signal
- Use on items you own and want to track
- Works anywhere iPhones are present
- No cellular data required on your tracker

### 🔍 **Troubleshooting:**
- Make sure Bluetooth is enabled: `hcitool dev`
- Run with sudo for proper Bluetooth access
- Keep script running continuously
- Check OpenHaystack app for location updates (may take 30+ minutes)

**You're all set to start tracking your personal items with OpenHaystack!**