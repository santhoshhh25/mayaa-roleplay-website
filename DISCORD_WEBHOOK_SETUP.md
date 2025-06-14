# 🔔 Discord Webhook Setup Guide

Discord webhooks are used for sending alerts and notifications to your Discord server. This guide shows you how to set them up.

## 🎯 **What Webhooks Are Used For:**

1. **Server Alerts** - When your Render services go down/up
2. **Application Notifications** - Backup notifications for whitelist applications
3. **System Monitoring** - Keep-alive status updates
4. **Error Alerts** - Critical error notifications

## 📋 **Step-by-Step Webhook Setup:**

### Step 1: Create a Discord Webhook

1. **Go to your Discord server**
2. **Right-click the channel** where you want to receive alerts (e.g., `#admin-alerts`)
3. **Select "Edit Channel"**
4. **Go to "Integrations" tab**
5. **Click "Create Webhook"**
6. **Configure webhook:**
   - **Name:** `MAYAAALOKAM Alerts`
   - **Avatar:** Upload your server logo (optional)
   - **Channel:** Select the alerts channel
7. **Click "Copy Webhook URL"**
8. **Save this URL** - you'll need it for environment variables

### Step 2: Test Your Webhook

Test if your webhook works by sending a test message:

```bash
curl -H "Content-Type: application/json" \
     -d '{"content":"🚀 MAYAAALOKAM webhook test - this is working!"}' \
     YOUR_WEBHOOK_URL_HERE
```

### Step 3: Add to Environment Variables

Add this to your Render environment variables:

```
ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz
```

## 🔧 **Multiple Webhook Setup (Recommended):**

For better organization, create separate webhooks for different types of alerts:

### **Admin Alerts Webhook:**
- **Channel:** `#admin-alerts`
- **Purpose:** Critical system alerts, server down/up notifications
- **Environment Variable:** `ALERT_WEBHOOK_URL`

### **Application Alerts Webhook:**
- **Channel:** `#whitelist-alerts`
- **Purpose:** Backup notifications for whitelist applications
- **Environment Variable:** `WHITELIST_WEBHOOK_URL`

### **System Monitoring Webhook:**
- **Channel:** `#system-monitoring`
- **Purpose:** Keep-alive status, performance metrics
- **Environment Variable:** `MONITORING_WEBHOOK_URL`

## 📝 **Webhook URL Format:**

A Discord webhook URL looks like this:
```
https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
```

**Example:**
```
https://discord.com/api/webhooks/1234567890123456789/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789
```

## 🚨 **Security Notes:**

1. **Keep webhooks secret** - Don't share them publicly
2. **Use specific channels** - Don't use general chat channels
3. **Limit permissions** - Only admins should see alert channels
4. **Regenerate if compromised** - You can regenerate webhook URLs if needed

## ✅ **Verification:**

After setting up webhooks, verify they work:

1. **Deploy your application** to Render
2. **Check alert channels** for system notifications
3. **Submit a test application** to verify webhook notifications
4. **Monitor keep-alive messages** in monitoring channel

## 🔄 **Webhook Usage in Your Application:**

Your application will automatically use webhooks for:

- **Service startup/shutdown alerts**
- **Error notifications**
- **Keep-alive status updates**
- **Application submission backups**
- **Database connection issues**

## 🛠️ **Webhook Management:**

### **To Update a Webhook:**
1. Go to Discord channel settings
2. Go to Integrations tab
3. Find your webhook
4. Click "Edit" or "Delete"

### **To Regenerate Webhook URL:**
1. Delete the old webhook
2. Create a new one
3. Update environment variables with new URL

---

**Next Step:** Add your webhook URL to the Render environment variables! 