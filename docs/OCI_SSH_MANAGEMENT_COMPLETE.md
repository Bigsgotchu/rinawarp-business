
# OCI SSH Key Management Setup - Complete Guide

# 🎯 **Overview**
This guide documents the complete setup of SSH key management for Oracle Cloud Infrastructure (OCI) instances using your existing API credentials. The setup enables secure, automated SSH access to OCI compute instances.
# ✅ **What Was Accomplished**

# 1. **OCI CLI Verification**
 - ✅ Verified OCI CLI is installed (version 3.70.1)

 - ✅ Confirmed API authentication works with your credentials

 - ✅ Tested user account access and permissions
# 2. **SSH Key Pair Generation**
 - ✅ Generated dedicated 4096-bit RSA SSH key pair for OCI instances

 - ✅ Located keys in `~/.oci/keys/` directory:
  - Private key: `~/.oci/keys/oci_instance_ssh_key` (permissions: 600)
  - Public key: `~/.oci/keys/oci_instance_ssh_key.pub` (permissions: 644)
# 3. **SSH Management Script Creation**
 - ✅ Created comprehensive `oci-ssh-manager.sh` script in `/home/karina/Documents/RinaWarp/scripts/`

 - ✅ Made script executable and tested all functionality

 - ✅ Verified integration with OCI CLI and your API configuration
# 4. **Instance Discovery**
 - ✅ Listed existing OCI compute instances

 - ✅ Found running instance: `rinawarp-backend-prod`

 - ✅ Extracted instance details and current SSH key configuration
# 🛠 **Available Commands**

# **Script Usage:**

```
bash
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh <command> [arguments]
```
python
# **Available Commands:**
 - `list` - List all compute instances

 - `details <instance-id>` - Get detailed information about an instance

 - `create [name] [shape]` - Create new instance with SSH key

 - `connect <instance-id> [username]` - Connect to instance via SSH

 - `config <instance-id> [config-name]` - Create SSH config entry for easier connection

 - `update <instance-id>` - Update SSH keys (requires manual steps)

 - `check` - Verify setup and configuration

 - `help` - Show help message
# **Examples:**

```
bash
# List all instances
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh list
# Get details about your running instance
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh details ocid1.instance.oc1.phx.anyhqljtx725ovacvackt6mfxdtvtozwsqwkhz3uvoj7imp4ayk6mij7miyq
# Create SSH config for easy connection
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh config ocid1.instance.oc1.phx.anyhqljtx725ovacvackt6mfxdtvtozwsqwkhz3uvoj7imp4ayk6mij7miyq rinawarp-prod
# Then connect with: ssh rinawarp-prod
ssh rinawarp-prod
```
python
# 🔑 **Key Features**

# **1. Automated SSH Key Management**
 - Generates secure 4096-bit RSA key pairs

 - Stores keys in dedicated OCI directory

 - Sets proper file permissions automatically

 - Ready for use with OCI instances
# **2. Instance Discovery & Management**
 - Lists all compute instances in your tenancy

 - Provides detailed instance information

 - Shows current SSH key configuration

 - Identifies public IP addresses for connections
# **3. Simplified SSH Connections**
 - Automatic public IP detection

 - SSH config file generation

 - Support for custom usernames

 - Connection retry and error handling
# **4. Instance Creation Support**
 - Creates new instances with pre-configured SSH keys

 - Uses Always Free tier shapes by default

 - Configures Oracle Linux images

 - Sets up public networking
# 🔒 **Security Features**

# **API Key Integration**
 - Uses your OCI API keys for authentication

 - No need for separate SSH credentials for OCI operations

 - Leverages OCI IAM for access control
# **SSH Key Security**
 - Private keys stored with 600 permissions (owner read/write only)

 - Public keys stored with 644 permissions (public readable)

 - Keys isolated in dedicated `~/.oci/keys/` directory

 - Separate key pairs for different purposes
# 🚀 **Getting Started**

# **1. Verify Setup**

```
bash
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh check
```
python
# **2. List Your Instances**

```
bash
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh list
```
python
# **3. Connect to Existing Instance**

```
bash
# Get instance details first
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh details <INSTANCE-OCID>
# Create SSH config for easier access
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh config <INSTANCE-OCID> myhost
# Then connect
ssh myhost
```
python
# **4. Create New Instance**

```
bash
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh create my-new-vm
```
python
# 📋 **File Structure**

```
python
/home/karina/
├── .oci/
│   ├── config                          # OCI API configuration
│   ├── keys/
│   │   ├── oci_instance_ssh_key       # SSH private key (600)
│   │   └── oci_instance_ssh_key.pub   # SSH public key (644)
│   ├── oci_api_key_private.pem        # OCI API private key
│   └── oci_api_key_public.pem         # OCI API public key
└── Documents/RinaWarp/
    └── scripts/
        └── oci-ssh-manager.sh         # SSH management script
```
python
# 🔍 **Current Instance Status**

# Found Instance
 - **Name:** rinawarp-backend-prod

 - **OCID:** ocid1.instance.oc1.phx.anyhqljtx725ovacvackt6mfxdtvtozwsqwkhz3uvoj7imp4ayk6mij7miyq

 - **Shape:** VM.Standard.E2.1

 - **State:** RUNNING

 - **AD:** JFdp:PHX-AD-3

 - **SSH Key:** Uses existing "rinawarp-oci" key
# 💡 **Next Steps**
1. **Choose Your Approach:**
    - Use existing instance SSH key for current setup
    - Create new instance with new SSH key pair
    - Update existing instance SSH keys (manual process)

1. **Connect to Instances:**
    - Use the SSH management script for automated connections
    - Create SSH config entries for easier access
    - Test connections and verify access

1. **Scale Your Infrastructure:**
    - Use the script to create additional instances
    - Manage multiple instances with consistent SSH access
    - Automate instance creation and configuration
# 🛡 **Important Notes**
 - **SSH Key Updates:** For existing instances, SSH key updates may require stopping the instance and updating via OCI Console

 - **Instance Access:** Current instance uses existing SSH key pair ("rinawarp-oci")

 - **Cost Management:** New instances will use Always Free tier by default

 - **Security:** Always use the generated SSH keys and never share private keys
# 🆘 **Troubleshooting**

# **Connection Issues**

```
bash
# Check instance state and public IP
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh details <INSTANCE-OCID>
# Verify SSH key permissions
ls -la ~/.oci/keys/
# Test OCI CLI configuration
oci iam user get --user-id <YOUR_USER_OCID>
```
python
# **Permission Errors**

```
bash
# Ensure script is executable
chmod +x /home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh
# Check SSH key permissions
chmod 600 ~/.oci/keys/oci_instance_ssh_key
chmod 644 ~/.oci/keys/oci_instance_ssh_key.pub
```
txt

This setup provides a robust, secure, and automated SSH management solution for your OCI infrastructure!
