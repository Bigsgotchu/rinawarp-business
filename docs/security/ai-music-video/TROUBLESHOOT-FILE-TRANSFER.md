# 🔍 TROUBLESHOOT FILE TRANSFER

## ❌ **ISSUE: "No such file" Error**

The SSH key file didn't transfer successfully. Let's fix this step by step.

## 🔧 **TROUBLESHOOTING STEPS:**

### **Step 1: Check if File Exists on Mac**

```bash
# On your Mac, verify the key file exists
ls -la ~/.ssh/
# Look for your key file (usually .pem extension)
```

### **Step 2: Check Windows IP Address**

```powershell
# On Windows, get your IP address
ipconfig
# Look for IPv4 Address (usually 192.168.x.x)
```

### **Step 3: Try Alternative Transfer Methods**

#### **Method A: Cloud Storage (Easiest)**

1. **On Mac**: Upload key file to Google Drive/Dropbox
2. **On Windows**: Download the file
3. **Place in**: `C:\Users\YourName\.ssh\`

#### **Method B: Network Share**

1. **On Mac**: Right-click folder → Share → File Sharing
2. **On Windows**: Access shared folder via Network
3. **Copy** the key file

#### **Method C: Email Transfer**

1. **On Mac**: Email the key file to yourself
2. **On Windows**: Download from email
3. **Place in**: `C:\Users\YourName\.ssh\`

### **Step 4: Verify File Transfer**

```powershell
# On Windows, check if file exists
dir C:\Users\YourName\.ssh\
# Should show your key file
```

## 🚀 **ALTERNATIVE: Direct Mac SSH**

If transfer is too complicated, SSH directly from Mac:

```bash
# On your Mac terminal
ssh -i ~/.ssh/your-key.pem ubuntu@18.212.105.169

# Then run diagnostic commands
pm2 status
sudo systemctl status nginx
```

## 📝 **QUICK FIX COMMANDS:**

### **On Mac:**

```bash
# Find your key file
ls -la ~/.ssh/

# Try SCP again with full path
scp ~/.ssh/your-key.pem user@192.168.1.100:C:\Users\YourName\.ssh\
```

### **On Windows:**

```powershell
# Create .ssh directory if it doesn't exist
mkdir C:\Users\YourName\.ssh

# Check if file was transferred
dir C:\Users\YourName\.ssh\
```

## 🎯 **RECOMMENDED NEXT STEPS:**

1. **Try Method A (Cloud Storage)** - easiest and most reliable
2. **Or use direct Mac SSH** - bypasses transfer issues
3. **Verify file exists** before setting permissions

**Which method would you like to try first?**
