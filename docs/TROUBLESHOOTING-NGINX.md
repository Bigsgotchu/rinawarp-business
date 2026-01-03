
# 🔧 Nginx Troubleshooting Guide

# Run These Commands Manually & Paste Output

# Step 1: Check Nginx Status

```
bash
sudo systemctl status nginx
```
python
# Expected Output

```
css
● nginx.service - The NGINX HTTP and reverse proxy server
    Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
    Active: active (running)
```
python
# If it shows "inactive" or "failed"

```
bash
sudo systemctl start nginx
sudo systemctl enable nginx
```
python
# Step 2: Check Site Configuration

```
bash
ls -al /etc/nginx/sites-enabled/
```
python
# Expected Output

```
css
drwxr-xr-x 2 root root 4096 Nov 26 22:28 .
drwxr-xr-x 2 root root 4096 Nov 26 22:28 ..
lrwxrwxrwx 1 root root 34 Nov 26 22:28 rinawarp-api.conf -> ../sites-available/rinawarp-api.conf
```
python
# If you don't see rinawarp-api.conf

```
bash
sudo ln -s /etc/nginx/sites-available/rinawarp-api.conf /etc/nginx/sites-enabled/
```
python
# Step 3: Test Nginx Configuration

```
bash
sudo nginx -t
```
python
# Expected Output

```
css
nginx: configuration file /etc/nginx/nginx.conf test is successful
```
python
# Step 4: Check Nginx is Listening

```
bash
sudo netstat -tlnp | grep nginx
```
python
# Expected Output

```
css
tcp 0 0 0.0.0.0:80 0.0.0.0:* LISTEN 12345/nginx
tcp 0 0 0.0.0.0:443 0.0.0.0:* LISTEN 12345/nginx
```
python
# Step 5: Check Firewall

```
bash
sudo ufw status
```
python
# Expected Output

```
python
Status: active

To                         Action      From

--                         ------      ----

22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```
python
# If firewall is blocking

```
bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```
python
# Step 6: Test Local Connection

```
bash
curl -I [[[[[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))))]([[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))))]([[[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))))]([[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))))))]([[[[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))))]([[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))))]([[[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))))]([[[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))]([[[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))))]([[[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))]([[[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost)))]([[[http://localhost](http://localhost](http://localhost](http://localhost))]([[http://localhost](http://localhost](http://localhost](http://localhost))))))))))
```
python
# Expected Output

```
txt
HTTP/1.1 200 OK or 301 Moved Permanently
```
python
# Step 7: Check DNS

```
bash
nslookup api.rinawarptech.com
```
python
# Current Status Check
 - ❌ Should show: `137.131.48.124`

 - 🔄 Currently shows: `158.101.1.38` (needs DNS fix)
# 🚨 Common Issues & Solutions

# Issue 1: "nginx: command not found"

# Solution

```
bash
sudo apt update
sudo apt install -y nginx
```
python
# Issue 2: "permission denied" errors

# Solution

```
bash
sudo chown -R $USER:$USER /etc/nginx/sites-available/
sudo chmod 644 /etc/nginx/sites-available/rinawarp-api.conf
```
python
# Issue 3: "bind() to 0.0.0.0:80 failed"

# Solution

```
bash
sudo lsof -i :80
sudo systemctl stop apache2  # if apache is running
```
python
# Issue 4: DNS still shows wrong IP

# Solution
1. Check Cloudflare DNS settings
2. Wait 5-15 minutes for propagation
3. Clear local DNS cache: `sudo systemctl restart systemd-resolved`
# 🔄 Automated Diagnostics
Run the diagnostic script:
```
bash
bash nginx-diagnostic.sh
```
txt

Then paste the complete output for troubleshooting assistance.
