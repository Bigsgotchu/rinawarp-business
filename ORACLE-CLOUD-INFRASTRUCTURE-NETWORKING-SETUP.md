# Oracle Cloud Infrastructure (OCI) Networking Setup Guide

## Overview

This guide provides step-by-step instructions for configuring Oracle Cloud Infrastructure networking for RinaWarp applications, including security groups, firewall rules, and connectivity verification.

## Prerequisites

- Oracle Cloud Infrastructure (OCI) account
- OCI CLI installed and configured
- Access to your instance and network resources

## Quick Start Checklist

- [ ] OCI CLI installed and configured
- [ ] Environment variables set with your OCIDs
- [ ] Network Security Group (NSG) attached to VNIC
- [ ] NSG rules configured for required ports
- [ ] Security List rules updated
- [ ] Route table verified
- [ ] Connectivity tested
- [ ] SSL certificate configured

---

## STEP 0 — Verify OCI CLI Installation

### Check Installation

```bash
oci --version
```

### Install OCI CLI (if missing)

```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

### Configure OCI CLI

```bash
oci setup config
```

---

## STEP 1 — Environment Variables Setup

### Set Your OCIDs

Copy and paste the following, then edit with YOUR real values:

```bash
# Compartment OCID
export COMPARTMENT_OCID="ocid1.compartment.oc1.phx.xxxxxxxx"   # rinawarptech (root)

# VNIC OCID
export VNIC_OCID="ocid1.vnic.oc1.phx.xxxxxxxxxxxxxxxxx"        # from your instance

# Network Security Group OCID
export NSG_OCID="ocid1.networksecuritygroup.oc1.phx.xxxxxxxxx" # ig-quick-action-NSG

# Subnet OCID
export SUBNET_OCID="ocid1.subnet.oc1.phx.xxxxxxxxxxxxxxxxx"    # rinawarp-public-subnet

# Security List OCID
export SEC_LIST_OCID="ocid1.securitylist.oc1.phx.xxxxxxxxxxxx" # Default Security List
```

### Save to File (Optional)

```bash
cat > ~/oci-vars.sh << 'EOF'
# Oracle Cloud Infrastructure Configuration
export COMPARTMENT_OCID="your-compartment-ocid-here"
export VNIC_OCID="your-vnic-ocid-here"
export NSG_OCID="your-nsg-ocid-here"
export SUBNET_OCID="your-subnet-ocid-here"
export SEC_LIST_OCID="your-security-list-ocid-here"
export REGION="us-phoenix-1"
EOF

# Load the variables
source ~/oci-vars.sh
```

---

## STEP 2 — Attach NSG to Your VNIC

### Attach Network Security Group

```bash
oci network vnic update \
  --vnic-id $VNIC_OCID \
  --nsg-ids "[\"$NSG_OCID\"]"
```

### Verify Attachment

```bash
oci network vnic get --vnic-id $VNIC_OCID
```

### Expected Output

You should see:

```json
"nsg-ids": [
    "ocid1.networksecuritygroup..."
]
```

---

## STEP 3 — Configure NSG Rules

### Add Required Port Rules (22, 80, 443, 4000)

```bash
oci network nsg rules add \
  --network-security-group-id $NSG_OCID \
  --security-rules '[
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":22,"max":22}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":80,"max":80}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":443,"max":443}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":4000,"max":4000}}},
    {"direction":"EGRESS","protocol":"all","destination":"0.0.0.0/0"}
  ]'
```

### Verify NSG Rules

```bash
oci network nsg rules list --network-security-group-id $NSG_OCID
```

---

## STEP 4 — Update Security List Rules

**Important**: Oracle requires BOTH NSG and Security List layers unless NSG-only mode is enabled.

### Add Rules to Security List

```bash
oci network security-list update \
  --security-list-id $SEC_LIST_OCID \
  --ingress-security-rules '[
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":22,"max":22}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":80,"max":80}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":443,"max":443}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":4000,"max":4000}}}
  ]' \
  --egress-security-rules '[
    {"protocol":"all","destination":"0.0.0.0/0"}
  ]'
```

### Verify Security List

```bash
oci network security-list get --security-list-id $SEC_LIST_OCID
```

---

## STEP 5 — Verify Route Table Configuration

### Check Current Route Table

```bash
oci network route-table get --rt-id $(oci network subnet get --subnet-id $SUBNET_OCID --query 'data."route-table-id"' --raw-output)
```

### Required Route Configuration

You MUST see:

```
0.0.0.0/0  →  Internet Gateway
```

### If Missing: Fix Route Table

```bash
# Get Internet Gateway OCID
IGW_OCID=$(oci network internet-gateway list --compartment-id $COMPARTMENT_OCID --query 'data[0].id' --raw-output)

# Update route table
oci network route-table update \
  --rt-id $(oci network subnet get --subnet-id $SUBNET_OCID --query 'data."route-table-id"' --raw-output) \
  --route-rules "[{\"cidr-block\":\"0.0.0.0/0\", \"network-entity-id\":\"$IGW_OCID\"}]"
```

---

## STEP 6 — Test Connectivity

### Automated Testing Script

Create and run the connectivity test script:

```bash
#!/bin/bash
# test-networking-connectivity.sh

echo "🔍 Testing Oracle Cloud Infrastructure connectivity..."
echo

# Test individual ports
echo "Testing port 80 (HTTP)..."
nc -zv 137.131.48.124 80

echo "Testing port 443 (HTTPS)..."
nc -zv 137.131.48.124 443

echo "Testing port 4000 (Backend API)..."
nc -zv 137.131.48.124 4000

echo "Testing port 22 (SSH)..."
nc -zv 137.131.48.124 22

echo
echo "✅ Connectivity test completed!"
```

### Manual Testing Commands

```bash
# Test HTTP connectivity
nc -zv 137.131.48.124 80

# Test HTTPS connectivity  
nc -zv 137.131.48.124 443

# Test Backend API
nc -zv 137.131.48.124 4000

# Test SSH access
nc -zv 137.131.48.124 22
```

### Expected Output

```
Connection to 137.131.48.124 port 80 [tcp/http] succeeded!
Connection to 137.131.48.124 port 443 [tcp/https] succeeded!
Connection to 137.131.48.124 port 4000 [tcp/*] succeeded!
Connection to 137.131.48.124 port 22 [tcp/ssh] succeeded!
```

---

## STEP 7 — SSL Certificate Configuration

### Generate SSL Certificate

Once connectivity is confirmed, from the VM:

```bash
sudo certbot --nginx -d api.rinawarptech.com
```

### Verify SSL Setup

```bash
curl -I https://api.rinawarptech.com
curl -I http://api.rinawarptech.com
```

---

## Troubleshooting Common Issues

### Port 80/443 Not Accessible

1. Check NSG rules are applied
2. Verify Security List rules
3. Ensure nginx is running: `sudo systemctl status nginx`
4. Check firewall: `sudo ufw status`

### Backend API (Port 4000) Not Accessible

1. Verify backend application is running
2. Check application logs
3. Ensure application is binding to 0.0.0.0, not 127.0.0.1

### SSL Certificate Issues

1. Ensure HTTP (port 80) is accessible first
2. Check DNS resolution: `dig api.rinawarptech.com`
3. Verify nginx configuration: `sudo nginx -t`

### Network Route Issues

1. Check route table configuration
2. Verify Internet Gateway exists
3. Ensure route points to Internet Gateway for 0.0.0.0/0

### OCI CLI Authentication

```bash
# Check current profile
oci iam region list

# Reset configuration if needed
oci setup config
```

---

## Quick Reference Commands

### View Current NSG Rules

```bash
oci network nsg rules list --network-security-group-id $NSG_OCID --query 'data[?direction==`INGRESS`].[direction,protocol,tcp-options.destination-port-range]' --table-output
```

### View Security List Rules

```bash
oci network security-list get --security-list-id $SEC_LIST_OCID --query 'data."ingress-security-rules"' --raw-output | jq .
```

### Check VNIC Attachments

```bash
oci network vnic get --vnic-id $VNIC_OCID --query 'data."nsg-ids"'
```

### Monitor Network Traffic

```bash
# Check active connections
sudo netstat -tuln

# Monitor traffic (requires tcpdump)
sudo tcpdump -i any port 80
```

---

## Additional Resources

- [OCI CLI Documentation](https://docs.oracle.com/en-us/oci/cli/)
- [OCI Networking Guide](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/landing.htm)
- [OCI Security Lists](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm)
- [OCI Network Security Groups](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/networksecuritygroups.htm)

---

## Support

For issues with this configuration:

1. Verify all prerequisites are met
2. Check the troubleshooting section above
3. Review OCI documentation for specific error messages
4. Contact support with specific error output

---

*Last updated: 2025-11-27*
*Version: 1.0*