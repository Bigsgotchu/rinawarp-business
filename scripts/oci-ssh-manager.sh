#!/bin/bash

# OCI SSH Manager Script
# Manages SSH keys and connections for Oracle Cloud Infrastructure instances
# Uses the API keys configured in ~/.oci/config

set -e

# Configuration
SSH_KEY_PATH="${HOME}/.oci/keys/oci_instance_ssh_key"
SSH_PUBLIC_KEY_PATH="${HOME}/.oci/keys/oci_instance_ssh_key.pub"
REGION="us-phoenix-1"
COMPARTMENT_ID="ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if SSH key exists
check_ssh_key() {
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        error "SSH private key not found at $SSH_KEY_PATH"
        error "Please run the setup script first to generate SSH keys"
        exit 1
    fi
    
    if [[ ! -f "$SSH_PUBLIC_KEY_PATH" ]]; then
        error "SSH public key not found at $SSH_PUBLIC_KEY_PATH"
        exit 1
    fi
    
    log "✅ SSH keys found"
}

# Check OCI CLI configuration
check_oci_config() {
    if ! oci iam user get --user-id ocid1.user.oc1..aaaaaaaadl44pb7fglhryaxnfmqsbqvgxuqgaf5h4rzwagymkcr7lzva4wta >/dev/null 2>&1; then
        error "OCI CLI not properly configured. Please check your ~/.oci/config file"
        exit 1
    fi
    log "✅ OCI CLI configuration verified"
}

# List instances
list_instances() {
    log "Listing compute instances..."
    oci compute instance list \
        --compartment-id "$COMPARTMENT_ID" \
        --region "$REGION" \
        --output table \
        --query "data[].{ID:id,DisplayName:\"display-name\",State:\"lifecycle-state\",Shape:shape,AD:\"availability-domain\"}"
}

# Get instance details
get_instance_details() {
    local instance_id=$1
    if [[ -z "$instance_id" ]]; then
        error "Instance ID is required"
        exit 1
    fi
    
    log "Getting details for instance: $instance_id"
    oci compute instance get \
        --instance-id "$instance_id" \
        --region "$REGION" \
        --output table
}

# Create new instance with SSH key
create_instance() {
    local instance_name=${1:-"oci-ssh-test-instance"}
    local shape=${2:-"VM.Standard.E2.1.Micro"}  # Always Free tier
    local ad=${3:-"kB7:PHX-AD-1"}
    local image_id=${4:-"ocid1.image.oc1.phx.aaaaaaaao2xm2jzlsttevghnze3u6wzh4u6h6l4h2h3n3h3r3r3r"}  # Oracle Linux
    
    log "Creating new instance: $instance_name"
    log "Shape: $shape"
    log "Availability Domain: $ad"
    log "Using SSH public key from: $SSH_PUBLIC_KEY_PATH"
    
    # Read the public key content
    local ssh_key_content=$(cat "$SSH_PUBLIC_KEY_PATH")
    
    # Create instance
    oci compute instance launch \
        --display-name "$instance_name" \
        --shape "$shape" \
        --availability-domain "$ad" \
        --compartment-id "$COMPARTMENT_ID" \
        --image-id "$image_id" \
        --ssh-authorized-keys "$ssh_key_content" \
        --region "$REGION" \
        --boot-volume-size-in-gbs 50 \
        --subnet-id "ocid1.subnet.oc1.phx.aaaaaaaanv7w2h7xexample" \
        --assign-public-ip true \
        --wait-for-state RUNNING
}

# Connect to instance via SSH
connect_instance() {
    local instance_id=$1
    local username=${2:-"opc"}  # Default username for Oracle Linux
    
    if [[ -z "$instance_id" ]]; then
        error "Instance ID is required"
        info "Usage: $0 connect <instance-id> [username]"
        exit 1
    fi
    
    log "Getting public IP for instance: $instance_id"
    
    # Get instance details to find public IP
    local instance_data=$(oci compute instance get --instance-id "$instance_id" --region "$REGION" --query "data" --output json)
    local public_ip=$(echo "$instance_data" | jq -r '.["public-ip"] // .["vnic-attachments"][0]["public-ip"] // empty')
    
    if [[ -z "$public_ip" || "$public_ip" == "null" ]]; then
        error "No public IP found for instance $instance_id"
        warn "Instance might be in a private subnet or not running"
        exit 1
    fi
    
    log "Connecting to $username@$public_ip"
    info "Press Ctrl+C to exit"
    
    # Connect via SSH
    ssh -i "$SSH_KEY_PATH" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        "$username@$public_ip"
}

# Create SSH config entry for easier connection
create_ssh_config() {
    local instance_id=$1
    local config_name=${2:-"oci-instance"}
    
    if [[ -z "$instance_id" ]]; then
        error "Instance ID is required"
        exit 1
    fi
    
    log "Creating SSH config entry for instance: $instance_id"
    
    # Get instance details
    local instance_data=$(oci compute instance get --instance-id "$instance_id" --region "$REGION" --query "data" --output json)
    local public_ip=$(echo "$instance_data" | jq -r '.["public-ip"] // .["vnic-attachments"][0]["public-ip"] // empty')
    local display_name=$(echo "$instance_data" | jq -r '.["display-name"]')
    
    if [[ -z "$public_ip" || "$public_ip" == "null" ]]; then
        error "No public IP found for instance"
        exit 1
    fi
    
    # Create SSH config entry
    local config_entry="
# OCI Instance: $display_name
Host $config_name
    HostName $public_ip
    User opc
    IdentityFile $SSH_KEY_PATH
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    Port 22
"
    
    # Add to SSH config if not exists
    if ! grep -q "Host $config_name" ~/.ssh/config 2>/dev/null; then
        echo "$config_entry" >> ~/.ssh/config
        chmod 600 ~/.ssh/config
        log "✅ SSH config entry added for $config_name"
        info "You can now connect with: ssh $config_name"
    else
        warn "SSH config entry for $config_name already exists"
    fi
}

# Update instance SSH keys
update_instance_ssh_keys() {
    local instance_id=$1
    local new_public_key=${2:-$SSH_PUBLIC_KEY_PATH}
    
    if [[ -z "$instance_id" ]]; then
        error "Instance ID is required"
        exit 1
    fi
    
    if [[ ! -f "$new_public_key" ]]; then
        error "Public key file not found: $new_public_key"
        exit 1
    fi
    
    log "Updating SSH keys for instance: $instance_id"
    
    # Read the public key content
    local ssh_key_content=$(cat "$new_public_key")
    
    # Update instance VNIC attachment (this is where SSH keys are stored in OCI)
    log "This requires stopping the instance first..."
    warn "Automatic SSH key update is not directly supported via CLI"
    warn "SSH keys are typically managed during instance creation"
    info "For updating SSH keys, you may need to:"
    info "1. Stop the instance"
    info "2. Update VNIC attachment SSH keys via OCI Console"
    info "3. Or recreate the instance with new SSH keys"
}

# Display help
show_help() {
    echo "OCI SSH Manager Script"
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  list                    - List all compute instances"
    echo "  details <instance-id>   - Get detailed info about an instance"
    echo "  create [name] [shape]   - Create new instance with SSH key"
    echo "  connect <instance-id>   - Connect to instance via SSH"
    echo "  config <instance-id>    - Create SSH config entry for easier connection"
    echo "  update <instance-id>    - Update SSH keys (requires manual steps)"
    echo "  check                   - Verify setup and configuration"
    echo "  help                    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 connect ocid1.instance.oc1.phx.example"
    echo "  $0 create my-vm VM.Standard.E2.1.Micro"
    echo "  $0 config ocid1.instance.oc1.phx.example myhost"
}

# Main function
main() {
    local command=${1:-"help"}
    
    case "$command" in
        "list")
            list_instances
            ;;
        "details")
            get_instance_details "$2"
            ;;
        "create")
            check_ssh_key
            check_oci_config
            create_instance "$2" "$3" "$4" "$5"
            ;;
        "connect")
            check_ssh_key
            connect_instance "$2" "$3"
            ;;
        "config")
            check_ssh_key
            create_ssh_config "$2" "$3"
            ;;
        "update")
            update_instance_ssh_keys "$2"
            ;;
        "check")
            check_ssh_key
            check_oci_config
            log "✅ All checks passed! OCI SSH setup is ready"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"