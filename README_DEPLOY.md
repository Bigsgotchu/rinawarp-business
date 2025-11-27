# RinaWarp Oracle Cloud Infrastructure - One-Click Deployment

This repository contains automated scripts for deploying and managing RinaWarp applications on Oracle Cloud Infrastructure (OCI).

## 🚀 Quick Start

### Prerequisites

Before running any scripts, ensure you have:

1. **OCI CLI installed and configured**

   ```bash
   oci --version
   ```

2. **SSH key for your Oracle instance** (usually in `~/Downloads/`)

3. **Backend deployment script** (`./deploy-backend-to-oracle-vm.sh`) in your project root

4. **Required tools**: `ssh`, `nc`, `curl`

## 📦 Available Scripts

### Option 1: Network Fix Only (`oracle-fix-network.sh`)

Use this script if you only need to fix Oracle networking issues.

```bash
chmod +x oracle-fix-network.sh
./oracle-fix-network.sh
```

**What it does:**

- ✅ Auto-detects all Oracle resources (VNIC, Subnet, Security List, NSG)
- ✅ Attaches NSG to VNIC
- ✅ Adds required port rules (22, 80, 443, 4000)
- ✅ Fixes route table configuration
- ✅ Tests connectivity

### Option 2: Full Auto-Deploy (`rina-oracle-full-deploy.sh`)

Use this script for complete deployment from scratch.

```bash
chmod +x rina-oracle-full-deploy.sh
./rina-oracle-full-deploy.sh
```

**What it does:**

- ✅ All networking fixes (from Option 1)
- ✅ Deploys backend application
- ✅ Configures nginx reverse proxy
- ✅ Sets up Let's Encrypt SSL certificate
- ✅ Verifies entire deployment

## ⚙️ Configuration

Before running the full deploy script, edit the configuration section at the top:

```bash
# Oracle Compartment OCID (from OCI console: rinawarptech (root))
COMPARTMENT_ID="ocid1.compartment.oc1.phx.xxxxxxxx"

# SSH key path (update to your actual key location)
SSH_KEY="$HOME/Downloads/karinagilley91@gmail.com-2025-11-26T04_36_19.024Z.pem"

# Email for Let's Encrypt
CERTBOT_EMAIL="you@example.com"

# Backend port (adjust if your backend uses 3001 instead of 4000)
BACKEND_PORT=4000
```

## 🔧 Network Architecture

The scripts configure Oracle Cloud Infrastructure networking with the following architecture:

```text
Internet → NSG (Port Rules) → Security List (Port Rules) → VNIC → Instance
                ↓
         Route Table (0.0.0.0/0 → Internet Gateway)
```

### Required Ports

- **22** - SSH access
- **80** - HTTP traffic
- **443** - HTTPS traffic  
- **4000** - Backend API (configurable)

## 📋 Usage Instructions

### Step 1: Network Fix Only

If networking is the only issue:

```bash
./oracle-fix-network.sh
```

Expected output:

```text
🌍 Public IP: 137.131.48.124
✅ Port 22 OPEN
✅ Port 80 OPEN
✅ Port 443 OPEN
✅ Port 4000 OPEN
```

### Step 2: Full Deployment

For complete deployment:

```bash
# Edit configuration in the script first
nano rina-oracle-full-deploy.sh

# Make executable and run
chmod +x rina-oracle-full-deploy.sh
./rina-oracle-full-deploy.sh
```

Expected final output:

```text
🎉 FULL AUTO-DEPLOY SCRIPT FINISHED
   API should be at: https://api.rinawarptech.com/health
```

## 🔍 Troubleshooting

### Port Accessibility Issues

```bash
# Test individual ports
nc -zv 137.131.48.124 80
nc -zv 137.131.48.124 443
nc -zv 137.131.48.124 4000
```

### SSL Certificate Issues

```bash
# Check certificate status
ssh -i ~/.ssh/your-key ubuntu@137.131.48.124
sudo certbot certificates
```

### Backend Not Responding

```bash
# Test backend health
curl http://137.131.48.124:4000/health

# Check backend logs
ssh -i ~/.ssh/your-key ubuntu@137.131.48.124
sudo pm2 logs
# or
sudo systemctl status your-backend-service
```

### Oracle Resource Detection Issues

The scripts automatically detect resources by name. Ensure your Oracle instance is named `Rinawarp-Api` and your NSG is named `ig-quick-action-NSG`.

## 📖 Detailed Documentation

For comprehensive Oracle Cloud Infrastructure setup and troubleshooting, see:

- [ORACLE-CLOUD-INFRASTRUCTURE-NETWORKING-SETUP.md](./ORACLE-CLOUD-INFRASTRUCTURE-NETWORKING-SETUP.md)

## 🏗️ Architecture Overview

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Internet      │    │  Oracle Cloud    │    │   Instance VM   │
│                 │    │  Infrastructure  │    │                 │
│                 │    │                  │    │ ┌─────────────┐ │
│  [Users]        │───▶│  ┌─────────────┐ │───▶│ │ nginx       │ │
│  [API Calls]    │    │  │ NSG Rules   │ │    │ │ (Port 80/443)│ │
│                 │    │  └─────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │ ┌─────────────┐ │
│                 │    │  ┌─────────────┐ │    │ │ Backend     │ │
│                 │    │  │ Sec List    │ │    │ │ (Port 4000) │ │
│                 │    │  └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌─────────────┐
                       │ Route Table │
                       │ 0.0.0.0/0 → │
                       │ Internet GW │
                       └─────────────┘
```

## 🔒 Security Features

- **Layered Security**: Both NSG and Security List rules configured
- **SSL Termination**: Let's Encrypt certificates for HTTPS
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **SSH Key Authentication**: Secure access without passwords

## 📝 Environment Variables

The scripts automatically handle:

- `COMPARTMENT_ID` - Oracle compartment OCID
- `INSTANCE_ID` - Compute instance OCID  
- `VNIC_ID` - Virtual Network Interface Card OCID
- `SUBNET_ID` - Subnet OCID
- `SEC_LIST_ID` - Security List OCID
- `NSG_ID` - Network Security Group OCID
- `PUBLIC_IP` - Instance public IP address

## 🎯 Expected Results

After successful deployment:

- ✅ All ports (22, 80, 443, 4000) accessible
- ✅ Backend API responding at <https://api.rinawarptech.com/health>
- ✅ SSL certificate automatically provisioned
- ✅ Nginx reverse proxy configured
- ✅ Secure HTTPS connections

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review OCI console for resource status
3. Check instance logs: `sudo journalctl -u your-service`
4. Verify nginx: `sudo nginx -t && sudo systemctl status nginx`

---

**🎉 Happy deploying!** Your RinaWarp application should now be live and accessible at <https://api.rinawarptech.com>.

