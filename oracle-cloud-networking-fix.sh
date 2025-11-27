#!/bin/bash

echo "🔧 ORACLE CLOUD NETWORKING FIX - CLI METHOD"
echo "============================================"

# Load Oracle Cloud configuration
source ./.oracle-cloud-config

# Configuration validation
if [ -z "$INSTANCE_ID" ] || [ -z "$SEC_LIST_ID" ] || [ -z "$NSG_ID" ]; then
    echo "❌ Missing Oracle Cloud configuration"
    echo "Please ensure .oracle-cloud-config contains all required IDs"
    exit 1
fi

echo "📋 Using configured Oracle Cloud IDs..."
echo "Instance ID: $INSTANCE_ID"
echo "Instance IP: $INSTANCE_IP"
echo "Security List ID: $SEC_LIST_ID"
echo "NSG ID: $NSG_ID"
echo ""

echo "📋 Getting instance details to verify..."
INSTANCE_INFO=$(oci compute instance get --instance-id "$INSTANCE_ID" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Instance found and verified!"
    echo "$INSTANCE_INFO" | jq '.data | {display_name, availability_domain, state}' 2>/dev/null || echo "$INSTANCE_INFO"
else
    echo "❌ Failed to get instance details"
    echo "Please check if you have the correct OCID and permissions"
    exit 1
fi

echo ""
echo "🔍 Using configured Security List ID: $SEC_LIST_ID"
            
            echo ""
            echo "🔍 Getting current security list rules..."
            CURRENT_RULES=$(oci network security-list get --security-list-id "$SEC_LIST_ID" 2>/dev/null)
            
            echo "Current ingress rules:"
            echo "$CURRENT_RULES" | jq '.data.ingress_security_rules[] | {protocol: .protocol, source: .source, destination_port_range: .destination_port_range}' 2>/dev/null || echo "$CURRENT_RULES"
            
            
            echo ""
            echo "🚀 Adding required ingress rules to Security List: $SEC_LIST_ID"
            
            # Add SSH rule (port 22)
            echo "Adding SSH rule (port 22)..."
            oci network security-list ingress-security-rule add \
                --security-list-id "$SEC_LIST_ID" \
                --protocol "6" \
                --source-type "CIDR" \
                --source "0.0.0.0/0" \
                --destination-type "PORT_RANGE" \
                --destination-port-range-min 22 \
                --destination-port-range-max 22 \
                --description "SSH access" || echo "❌ Failed to add SSH rule"
            
            # Add HTTP rule (port 80)
            echo "Adding HTTP rule (port 80)..."
            oci network security-list ingress-security-rule add \
                --security-list-id "$SEC_LIST_ID" \
                --protocol "6" \
                --source-type "CIDR" \
                --source "0.0.0.0/0" \
                --destination-type "PORT_RANGE" \
                --destination-port-range-min 80 \
                --destination-port-range-max 80 \
                --description "HTTP access" || echo "❌ Failed to add HTTP rule"
            
            # Add HTTPS rule (port 443)
            echo "Adding HTTPS rule (port 443)..."
            oci network security-list ingress-security-rule add \
                --security-list-id "$SEC_LIST_ID" \
                --protocol "6" \
                --source-type "CIDR" \
                --source "0.0.0.0/0" \
                --destination-type "PORT_RANGE" \
                --destination-port-range-min 443 \
                --destination-port-range-max 443 \
                --description "HTTPS access" || echo "❌ Failed to add HTTPS rule"
            
            # Add API rule (port 4000)
            echo "Adding API rule (port 4000)..."
            oci network security-list ingress-security-rule add \
                --security-list-id "$SEC_LIST_ID" \
                --protocol "6" \
                --source-type "CIDR" \
                --source "0.0.0.0/0" \
                --destination-type "PORT_RANGE" \
                --destination-port-range-min 4000 \
                --destination-port-range-max 4000 \
                --description "API access (port 4000)" || echo "❌ Failed to add API rule"
            
            echo ""
            echo "✅ Security rules added successfully!"
            echo "⏰ Waiting 30 seconds for changes to propagate..."
            sleep 30
            
            echo ""
            echo "🧪 Testing connectivity..."
            echo "Testing SSH port (22):"
            timeout 5 nc -zv $INSTANCE_IP 22 2>&1 || echo "❌ Port 22 still not accessible"
            
            echo "Testing HTTP port (80):"
            timeout 5 nc -zv $INSTANCE_IP 80 2>&1 || echo "❌ Port 80 still not accessible"
            
            echo ""
            echo "🎯 Run this command in 2-3 minutes to verify:"
            echo "bash test-networking-connectivity.sh"

echo ""
echo "📖 If this script failed, you may need to:"
echo "1. Run: oci setup config"
echo "2. Ensure your API key has sufficient permissions"
echo "3. Check that the instance OCID is correct"