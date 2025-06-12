# Multi-Server Discord Bot Setup Guide

This guide explains how to configure your Discord bot to work across two separate Discord servers:
- **Server 1**: Application/Whitelist System
- **Server 2**: Duty Logs System

## Overview

Your bot can now operate on two different Discord servers simultaneously:
1. **Applications Server** - Handles whitelist applications and role management
2. **Duty Logs Server** - Handles duty log tracking for PD/EMS/Mechanic staff

## Prerequisites

- Your bot must be invited to both Discord servers with appropriate permissions
- Admin permissions on both servers to set up channels and roles
- Access to your `.env` configuration file

## Step 1: Bot Permissions

### For Applications Server:
- Read Messages
- Send Messages
- Embed Links
- Manage Roles
- Use Application Commands
- View Channel

### For Duty Logs Server:
- Read Messages
- Send Messages
- Embed Links
- Use Application Commands
- View Channel

## Step 2: Environment Configuration

Update your `.env` file with the following configuration:

```env
# Discord Bot Token (same for both servers)
BOT_TOKEN=your_bot_token_here

# PRIMARY SERVER - Applications System
APPLICATION_GUILD_ID=your_application_server_id_here
FORM_CHANNEL_ID=your_form_channel_id_here
RESPONSE_CHANNEL_ID=your_response_channel_id_here
ALLOWED_ROLE_ID=your_admin_role_id_here
WHITELISTED_ROLE_ID=your_whitelisted_role_id_here

# SECONDARY SERVER - Duty Logs System
DUTY_LOGS_GUILD_ID=your_duty_logs_server_id_here
DUTY_LOGS_CHANNEL_ID=your_duty_logs_channel_id_here

# Authorized role IDs for duty logs (comma-separated, from duty logs server)
DUTY_LOGS_AUTHORIZED_ROLES=role_id_1,role_id_2,role_id_3

# Legacy support (uses APPLICATION_GUILD_ID)
GUILD_ID=your_application_server_id_here
```

## Step 3: Get Required IDs

### Server IDs:
1. Enable Developer Mode in Discord
2. Right-click on server name → "Copy Server ID"

### Channel IDs:
1. Right-click on channel → "Copy Channel ID"

### Role IDs:
1. Go to Server Settings → Roles
2. Right-click on role → "Copy Role ID"

## Step 4: Configure Applications Server

1. **Create Channels** (if not already done):
   - `#whitelist-applications` - For form submissions
   - `#application-responses` - For approval/denial notifications

2. **Set Channel IDs** in `.env`:
   ```env
   FORM_CHANNEL_ID=your_form_channel_id
   RESPONSE_CHANNEL_ID=your_response_channel_id
   ```

3. **Configure Roles**:
   - Admin role that can process applications
   - Whitelisted role to assign to approved users

## Step 5: Configure Duty Logs Server

1. **Create Channel**:
   - `#duty-logs` - For duty log panel and interactions

2. **Set Channel ID** in `.env`:
   ```env
   DUTY_LOGS_CHANNEL_ID=your_duty_logs_channel_id
   ```

3. **Configure Authorized Roles**:
   - PD roles (various ranks)
   - EMS roles
   - Mechanic roles
   - Any other job roles that should have duty log access

4. **Add Role IDs** to `.env`:
   ```env
   DUTY_LOGS_AUTHORIZED_ROLES=pd_role_id,ems_role_id,mechanic_role_id
   ```

## Step 6: Deploy Duty Log Panel (ONLY to Duty Logs Server)

⚠️ **IMPORTANT**: The duty log panel should ONLY be deployed to the duty logs server (secondary server), NOT the applications server.

### Option 1: Using npm script (recommended)
```bash
npm run post-duty-panel
```

### Option 2: Manual script execution
```bash
node backend/post-duty-panel-separate.js
```

### Option 3: With specific channel ID
```bash
node backend/post-duty-panel-separate.js YOUR_CHANNEL_ID
```

**Note**: Make sure you have `DUTY_LOGS_CHANNEL_ID` set to a channel in your duty logs server before running these commands.

### Remove Duty Panels from Wrong Server
If you accidentally posted duty log panels to your applications server, you can remove them:

```bash
# Remove duty panels from a specific channel
npm run remove-duty-panel CHANNEL_ID_HERE

# Or manually
node backend/remove-duty-panel.js CHANNEL_ID_HERE
```

## Step 7: Start the Bot

1. **Development**:
   ```bash
   npm run bot:dev
   ```

2. **Production**:
   ```bash
   npm run bot:build
   npm run bot:start
   ```

3. **Full Application** (web + bot):
   ```bash
   npm run dev:all    # Development
   npm run start:all  # Production
   ```

## Step 8: Verify Setup

### Check Bot Logs
When the bot starts, you should see:
```
✅ Discord bot logged in as YourBot#1234
🏠 Applications server: 1234567890123456789
📋 Whitelist channel: 1234567890123456789
📢 Response channel: 1234567890123456789
🏢 Duty logs server: 9876543210987654321
📊 Duty logs channel: 9876543210987654321
👮 Authorized duty roles: 3 roles
```

### Test Applications System
1. Submit a test application through the web form
2. Check if it appears in the applications channel
3. Test approve/decline buttons

### Test Duty Logs System
1. Go to the duty logs channel in your duty logs server
2. Verify the duty log panel is displayed
3. Test clock in/out buttons with authorized roles

## Troubleshooting

### Common Issues

1. **Bot not responding in one server**:
   - Check if bot is invited to both servers
   - Verify channel IDs are correct
   - Check bot permissions

2. **"Unauthorized" errors for duty logs**:
   - Verify `DUTY_LOGS_AUTHORIZED_ROLES` contains correct role IDs
   - Check if users have the required roles

3. **Channel not found errors**:
   - Double-check channel IDs in `.env`
   - Ensure bot has access to channels

4. **Cross-server user issues**:
   - Users must be in the appropriate server for each system
   - Applications server for whitelist applications
   - Duty logs server for duty logging

### Debug Environment Variables
```bash
# Check if variables are loaded correctly
node -e "require('dotenv').config(); console.log({
  APPLICATION_GUILD_ID: process.env.APPLICATION_GUILD_ID,
  DUTY_LOGS_GUILD_ID: process.env.DUTY_LOGS_GUILD_ID,
  DUTY_LOGS_CHANNEL_ID: process.env.DUTY_LOGS_CHANNEL_ID
})"
```

## Advanced Configuration

### Same Server for Both Systems
If you want both systems on the same server, simply set the same server ID:
```env
APPLICATION_GUILD_ID=your_server_id
DUTY_LOGS_GUILD_ID=your_server_id
```

### Multiple Duty Log Channels
You can deploy the duty log panel to multiple channels:
```bash
node backend/post-duty-panel-separate.js CHANNEL_ID_1
node backend/post-duty-panel-separate.js CHANNEL_ID_2
```

### Role Hierarchy
Configure your authorized roles in order of hierarchy:
```env
DUTY_LOGS_AUTHORIZED_ROLES=chief_role,captain_role,officer_role,ems_role
```

## Security Considerations

1. **Role Verification**: The bot verifies roles on each interaction
2. **Server Isolation**: Application data is separate from duty log data
3. **Permission Checking**: Users need appropriate roles in each server
4. **Admin Access**: Admin panel access is controlled separately

## Support

If you encounter issues:
1. Check the bot logs for error messages
2. Verify all environment variables are set correctly
3. Test bot permissions in both servers
4. Ensure users have appropriate roles

For additional help, refer to the main README.md or contact your system administrator. 