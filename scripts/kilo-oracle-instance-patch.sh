#!/bin/bash

# =====================================================
# KILO ORACLE INSTANCE PATCH SCRIPT
# =====================================================
# This script updates all files to point to the new Oracle instance
# Old Instance (TERMINATED): rinawarp-backend-prod
# New Instance (ACTIVE): Rinawarp-Api
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Instance details
OLD_INSTANCE_OCID="ocid1.instance.oc1.phx.anyhqljtx725ovacvackt6mfxdtvtozwsqwkhz3uvoj7imp4ayk6mij7miyq"
NEW_INSTANCE_OCID="ocid1.instance.oc1.phx.anyhqljtx725ovacwblvi3c7vomqll5jgpgqczy6tk2vi45ikbhzqaejlw3a"
OLD_INSTANCE_IP="158.101.1.38"
NEW_INSTANCE_IP="137.131.48.124"
OLD_INSTANCE_NAME="rinawarp-backend-prod"
NEW_INSTANCE_NAME="Rinawarp-Api"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}KILO ORACLE INSTANCE PATCH SCRIPT${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Updating from OLD instance: ${OLD_INSTANCE_NAME}${NC}"
echo -e "${YELLOW}Updating to NEW instance: ${NEW_INSTANCE_NAME}${NC}"
echo ""

# Function to create backup
create_backup() {
    local file="$1"
    local backup_file="${file}.backup.$(date +%Y%m%d_%H%M%S)"
    if [[ ! -f "$backup_file" ]]; then
        cp "$file" "$backup_file"
        echo -e "${GREEN}✅ Created backup: $backup_file${NC}"
    fi
}

# Function to update file if it contains old values
update_file() {
    local file="$1"
    local changes_made=0
    
    if [[ ! -f "$file" ]]; then
        echo -e "${YELLOW}⚠️  File not found: $file${NC}"
        return 1
    fi
    
    # Check if file contains any old values
    if ! grep -q "$OLD_INSTANCE_IP\|$OLD_INSTANCE_OCID\|$OLD_INSTANCE_NAME" "$file" 2>/dev/null; then
        return 0
    fi
    
    create_backup "$file"
    
    # Update IP addresses
    if grep -q "$OLD_INSTANCE_IP" "$file" 2>/dev/null; then
        sed -i "s/$OLD_INSTANCE_IP/$NEW_INSTANCE_IP/g" "$file"
        echo -e "${GREEN}✅ Updated IP: $file${NC}"
        changes_made=1
    fi
    
    # Update OCID
    if grep -q "$OLD_INSTANCE_OCID" "$file" 2>/dev/null; then
        sed -i "s/$OLD_INSTANCE_OCID/$NEW_INSTANCE_OCID/g" "$file"
        echo -e "${GREEN}✅ Updated OCID: $file${NC}"
        changes_made=1
    fi
    
    # Update instance name
    if grep -q "$OLD_INSTANCE_NAME" "$file" 2>/dev/null; then
        sed -i "s/$OLD_INSTANCE_NAME/$NEW_INSTANCE_NAME/g" "$file"
        echo -e "${GREEN}✅ Updated name: $file${NC}"
        changes_made=1
    fi
    
    if [[ $changes_made -eq 1 ]]; then
        echo -e "${GREEN}✅ Successfully updated: $file${NC}"
    fi
}

# Function to find and update files
update_files() {
    local pattern="$1"
    local file_type="$2"
    
    echo -e "\n${BLUE}Searching for $file_type files containing old instance info...${NC}"
    
    # Use find to locate files (excluding certain directories)
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            update_file "$file"
        fi
    done < <(find . -type f $pattern \
        ! -path "./node_modules/*" \
        ! -path "./.git/*" \
        ! -path "./*.backup.*" \
        ! -path "./build-temp/*" \
        2>/dev/null || true)
}

echo -e "${YELLOW}Starting patch process...${NC}"

# Counter for tracking changes
total_files_updated=0

# 1. Update shell scripts
echo -e "\n${BLUE}=== STEP 1: Updating Shell Scripts ===${NC}"
update_files "-name '*.sh'" "shell script"
shell_count=$(find . -name '*.sh' ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "$OLD_INSTANCE_IP\|$OLD_INSTANCE_OCID\|$OLD_INSTANCE_NAME" {} \; 2>/dev/null | wc -l)
total_files_updated=$((total_files_updated + shell_count))

# 2. Update configuration files
echo -e "\n${BLUE}=== STEP 2: Updating Configuration Files ===${NC}"
update_files "-name '*.json'" "JSON"
update_files "-name '*.yml'" "YAML"
update_files "-name '*.yaml'" "YAML"
update_files "-name '*.conf'" "config"
json_count=$(find . -name '*.json' -o -name '*.yml' -o -name '*.yaml' -o -name '*.conf' ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "$OLD_INSTANCE_IP\|$OLD_INSTANCE_OCID\|$OLD_INSTANCE_NAME" {} \; 2>/dev/null | wc -l)
total_files_updated=$((total_files_updated + json_count))

# 3. Update documentation files
echo -e "\n${BLUE}=== STEP 3: Updating Documentation Files ===${NC}"
update_files "-name '*.md'" "Markdown"
md_count=$(find . -name '*.md' ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "$OLD_INSTANCE_IP\|$OLD_INSTANCE_OCID\|$OLD_INSTANCE_NAME" {} \; 2>/dev/null | wc -l)
total_files_updated=$((total_files_updated + md_count))

# 4. Update environment files
echo -e "\n${BLUE}=== STEP 4: Updating Environment Files ===${NC}"
update_files="-name '.env*'"
while IFS= read -r file; do
    if [[ -f "$file" ]]; then
        update_file "$file"
    fi
done < <(find . -name '.env*' ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null || true)
env_count=$(find . -name '.env*' ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "$OLD_INSTANCE_IP\|$OLD_INSTANCE_OCID\|$OLD_INSTANCE_NAME" {} \; 2>/dev/null | wc -l)
total_files_updated=$((total_files_updated + env_count))

# 5. Update JavaScript files that might contain hardcoded values
echo -e "\n${BLUE}=== STEP 5: Updating JavaScript Files ===${NC}"
update_files "-name '*.js'" "JavaScript"
js_count=$(find . -name '*.js' ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "$OLD_INSTANCE_IP\|$OLD_INSTANCE_OCID\|$OLD_INSTANCE_NAME" {} \; 2>/dev/null | wc -l)
total_files_updated=$((total_files_updated + js_count))

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}PATCH COMPLETED!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Files updated: $total_files_updated${NC}"
echo ""
echo -e "${GREEN}✅ Your Kilo instance configuration has been updated!${NC}"
echo -e "${GREEN}✅ All deployment scripts now point to the new instance:${NC}"
echo -e "   Instance Name: $NEW_INSTANCE_NAME"
echo -e "   Public IP: $NEW_INSTANCE_IP"
echo -e "   Instance OCID: $NEW_INSTANCE_OCID"
echo ""
echo -e "${YELLOW}BACKUP INFORMATION:${NC}"
echo -e "- All modified files have backups with .backup.YYYYMMDD_HHMMSS extension"
echo -e "- Backups are located in the same directories as original files"
echo ""
echo -e "${RED}IMPORTANT NEXT STEPS:${NC}"
echo -e "1. Test SSH connection to the new instance"
echo -e "2. Update any active PM2 processes if needed"
echo -e "3. Verify DNS settings point to: $NEW_INSTANCE_IP"
echo -e "4. Test deployment scripts"
echo ""

# Create a validation script
cat > validate-instance-update.sh << 'EOF'
#!/bin/bash

echo "Validating instance updates..."

OLD_IP="158.101.1.38"
NEW_IP="137.131.48.124"

echo "Checking for remaining old IP references..."
old_refs=$(grep -r "$OLD_IP" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" 2>/dev/null | wc -l)

if [[ $old_refs -eq 0 ]]; then
    echo "✅ No remaining old IP references found!"
else
    echo "❌ Found $old_refs remaining references to old IP"
    echo "Manual cleanup needed:"
    grep -r "$OLD_IP" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" 2>/dev/null | head -5
fi

echo "Checking new IP references..."
new_refs=$(grep -r "$NEW_IP" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" 2>/dev/null | wc -l)
echo "✅ Found $new_refs references to new IP"

echo "Validation complete!"
EOF

chmod +x validate-instance-update.sh

echo -e "${BLUE}Validation script created: validate-instance-update.sh${NC}"
echo -e "${YELLOW}Run './validate-instance-update.sh' to verify all updates${NC}"