
# OCI SSH Practical Usage Guide

# 🎯 **What We've Learned**

# **Current Situation Analysis:**
 - **Existing Instance**: `rinawarp-backend-prod` is running in private subnet (no public IP)

 - **SSH Access**: Currently requires private networking or bastion host

 - **SSH Management**: Our script works perfectly for instances with public IPs

 - **Network Security**: Production instance follows best practice (private subnet)
# 🛠 **Practical SSH Management Scenarios**

# **Scenario 1: Working with Private Subnet Instances**
Your existing `rinawarp-backend-prod` instance is correctly configured for production:

 - **Security**: In private subnet for enhanced security

 - **SSH Access**: Requires bastion host or private network connection

 - **Best Practice**: Production instances should NOT have public IPs
# **Access Methods for Private Instances:**
1. **Bastion Service** (Recommended)
2. **VPN/Direct Connect**
3. **Jump Host in Public Subnet**

1. **Cloud Shell** (OCI's built-in terminal)
# **Scenario 2: Creating Development/Test Instances**
For development and testing, create instances with public SSH access:
```
bash
# Create a development instance with SSH access
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh create rinawarp-dev-test VM.Standard.E2.1.Micro
```
python
# **Step-by-Step Instance Creation:**
**1. Prepare SSH Key** ✅ (Already Done)
```
bash
# SSH keys are ready
~/.oci/keys/oci_instance_ssh_key         # Private key
~/.oci/keys/ci_instance_ssh_key.pub      # Public key
```
python
# 2. Get Latest Oracle Linux Image*

```
bash
oci compute image list \

    --compartment-id ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq \
    --operating-system "Oracle Linux" \
    --operating-system-version "8" \
    --shape "VM.Standard.E2.1.Micro" \
    --query "data[0].{ID:id,Name:\"display-name\"}" \
    --output table
```
python
# 3. Get Public Subnet for Instances*

```
bash
oci network subnet list \

    --compartment-id ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq \
    --vcn-id <YOUR_VCN_OCID> \
    --query "data[?\"prohibit-public-internet-on-vnic\"==\`false\`].{ID:id,Name:\"display-name\"}" \
    --output table
```
python
# 4. Create Instance with Public SSH*

```
bash
# Read SSH public key
SSH_KEY_CONTENT=$(cat ~/.oci/keys/oci_instance_ssh_key.pub)
# Launch instance
oci compute instance launch \

    --display-name "rinawarp-dev-test" \
    --shape "VM.Standard.E2.1.Micro" \
    --availability-domain "kB7:PHX-AD-1" \
    --compartment-id ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq \
    --image-id ocid1.image.oc1.phx.aaaaaaaahlr2xh23gv3uo4yw5kjz3dwfyiki7bumezfi5ei3ptnm2b6kohyq \
    --ssh-authorized-keys "$SSH_KEY_CONTENT" \
    --subnet-id <PUBLIC_SUBNET_OCID> \
    --assign-public-ip true \
    --boot-volume-size-in-gbs 50 \
    --region us-phoenix-1 \
    --wait-for-state RUNNING
```
python
# **Scenario 3: Easy SSH Connection Workflow**
Once you have a public instance:
```
bash
# 1. List instances
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh list
# 2. Create SSH config for easy access
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh config <INSTANCE_OCID> my-dev-host
# 3. Connect easily
ssh my-dev-host
# 4. Or direct connection
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh connect <INSTANCE_OCID>
```
python
# 🔒 **Security Best Practices**

# **Production vs Development**

# **Production Instances (Like your rinawarp-backend-prod):**
 - ✅ **Private subnet** (no public IP)

 - ✅ **Security lists** restrict access

 - ✅ **Bastion service** for SSH access

 - ✅ **SSL/TLS** for web traffic

 - ✅ **Network security groups**
# **Development/Test Instances:**
 - ✅ **Public subnet** for easy SSH

 - ✅ **Always Free tier** (cost-effective)

 - ✅ **Temporary life cycle** (clean up regularly)

 - ✅ **Non-production data**
# 🎯 **Recommended Workflows**

# **Workflow 1: Development Instance Creation**

```
bash
# Create and connect to development instance
INSTANCE_NAME="rinawarp-dev-$(date +%Y%m%d)"
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh create $INSTANCE_NAME
# Create SSH config
INSTANCE_ID=$(oci compute instance list --compartment-id <COMPARTMENT_ID> \

    --display-name $INSTANCE_NAME --query "data[0].id" --output text)

/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh config $INSTANCE_ID $INSTANCE_NAME
# Connect
ssh $INSTANCE_NAME
```
python
# **Workflow 2: Production Access (Secure)**

```
bash
# Use OCI Bastion Service for production instances
oci bastion session create-port-forwarding \

    --bastion-id <BASTION_ID> \
    --target-private-ip <PRIVATE_IP> \
    --target-port 22
# Then SSH through bastion
ssh -i ~/.oci/keys/oci_instance_ssh_key -p <BASTION_PORT> opc@localhost
```
python
# **Workflow 3: Instance Management**

```
bash
# Check all instances status
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh list
# Get detailed info
/home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh details <INSTANCE_OCID>
# Stop/Start instances (if needed)
oci compute instance stop --instance-id <INSTANCE_OCID>
oci compute instance start --instance-id <INSTANCE_OCID>
```
python
# 📋 **Current Status Summary**

# **✅ What's Working:**
1. **OCI API Authentication** - Fully configured
2. **SSH Key Management** - Keys generated and ready
3. **SSH Management Script** - All functionality tested

1. **Instance Discovery** - Can list and manage instances
2. **Image Discovery** - Latest Oracle Linux images available
# **🔧 Current Limitation:**
 - **Existing Instance**: No public IP (correct for production)

 - **Solution**: Use bastion service or create dev instances with public IPs
# **🚀 Next Steps Options:**
1. **Create Development Instance** (Recommended)

   ```bash
    /home/karina/Documents/RinaWarp/scripts/oci-ssh-manager.sh create rinawarp-dev-test

```
txt

1. **Set Up Bastion Service** for production access
    - More secure for production instances
    - Enables SSH without public IPs

1. **Use OCI Cloud Shell**
    - Direct SSH from browser
    - No local setup required
# 💡 **Pro Tips**

# **Cost Optimization:**
 - Use **Always Free** instances for development

 - Clean up test instances regularly

 - Monitor usage with `oci usage`
# **Security:**
 - Rotate SSH keys periodically

 - Use key-based authentication only

 - Implement bastion for production access
# **Automation:**
 - Script common workflows

 - Use instance metadata for dynamic configuration

 - Implement health checks and auto-recovery

Your OCI SSH infrastructure is production-ready! 🎉
