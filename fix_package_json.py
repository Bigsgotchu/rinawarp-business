#!/usr/bin/env python3
import json

# Read the file
with open('/home/karina/Documents/rinawarp-Business/package.json', 'r') as f:
    content = f.read()

# Fix the single quote to double quote
content = content.replace("process'", 'process"')

# Write back
with open('/home/karina/Documents/rinawarp-Business/package.json', 'w') as f:
    f.write(content)

print("Fixed package.json")
