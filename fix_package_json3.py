#!/usr/bin/env python3

# Read the file
with open('/home/karina/Documents/rinawarp-Business/package.json', 'r') as f:
    content = f.read()

# Remove the extra quote
content = content.replace(
    '"build": "echo \'Build placeholder - implement based on your build process\'""',
    '"build": "echo \'Build placeholder - implement based on your build process\'"'
)

# Write back
with open('/home/karina/Documents/rinawarp-Business/package.json', 'w') as f:
    f.write(content)

print("Fixed package.json")
