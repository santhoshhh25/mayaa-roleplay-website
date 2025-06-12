# MAYAAALOKAM ROLEPLAY - Premium Website & Duty Logs System

Welcome to the official repository for the MAYAAALOKAM Roleplay Community's web portal and integrated duty logs system. This project provides a premium, modern website for the community and a robust, Discord-integrated system for staff to log their duty hours.

## 🌟 Features

### ✨ Website & Design
- **Premium Modern UI**: Clean, professional design with smooth animations powered by Framer Motion.
- **Fully Responsive**: Perfect adaptation across all devices (mobile, tablet, desktop).
- **Glass Morphism Effects**: Modern frosted glass UI elements for a stunning look.
- **Live Server Widget**: Embedded CFX server status iframe to show real-time server status.
- **Whitelist Application Form**: A modern, user-friendly form for new players to apply.
- **Elite Players Showcase**: A page to display the wealthiest players on the FiveM server, updated automatically.

### 🔐 Duty Logs & Authentication
- **Persistent Discord Authentication**: Stay logged in across browser sessions with secure token storage.
- **Smart Clock-In/Out System**: A multi-step process for staff to log their duty hours with department and rank selection.
- **Real-time Tracking**: Live session monitoring and statistics for on-duty staff.
- **Role-Based Access**: Only authorized members can access the duty logs dashboard.

### 🤖 Discord Bot Integration
- **Automated Whitelist Applications**: The bot automatically posts whitelist submissions from the website to a designated Discord channel.
- **Interactive Application Processing**: Staff can accept or decline applications with buttons, triggering automatic role assignment and user notifications.
- **Duty Log Commands**: Slash commands for staff to interact with the duty logs system directly from Discord.

## 💻 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js (for the Discord bot)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Discord OAuth2
- **Deployment**: Vercel (recommended for frontend), any Node.js hosting for the bot.

---

## 🚀 Getting Started: Local Development

Follow these steps to set up and run the project on your local machine.

### Prerequisites
- Node.js 18+
- npm or yarn
- A Discord account with a server where you have admin permissions.
- A free Supabase account.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd mayaa2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
You will need to configure your environment variables to connect to Supabase and Discord.

1.  **Create a `.env` file** in the root of the project. You can copy `.env.example` if it exists.
2.  **Follow the setup guides in the "Deployment and Hosting" section below** to get your API keys and IDs from Supabase and Discord. You will need to complete:
    *   `Step 1: Supabase Database Setup`
    *   `Step 2: Discord Application & Bot Setup`

3.  **Fill in your `.env` file** with the keys and IDs you obtained. For local development, your `NEXTAUTH_URL` should be `http://localhost:3000`.

### 4. Run the Application
The project has two main parts: the Next.js frontend and the Discord bot backend.

- **To run everything at once:**
  ```bash
  npm run dev
  ```
- **To run the frontend only:**
  ```bash
  npm run dev:next
  ```
- **To run the bot only:**
  ```bash
  npm run dev:bot
  ```

Once running, the website will be available at `http://localhost:3000`.

---

## 🌐 Deployment and Hosting (Realtime)

This is a detailed guide to deploying the application in a live, production environment.

### Step 1: Supabase Database Setup

1.  **Create a Supabase Project**:
    *   Go to [supabase.com](https://supabase.com) and sign in.
    *   Click "New Project" and give it a name (e.g., `mayaalokam-duty-logs`).
    *   Generate a secure database password and save it.
    *   Choose the region closest to your users.

2.  **Configure the Database Schema**:
    *   In your Supabase project, go to the **SQL Editor**.
    *   Open the `SUPABASE_SETUP.md` file located in the root of this project.
    *   Copy the entire SQL script from that file.
    *   Paste the script into the Supabase SQL Editor and click **"Run"**.
    *   Verify that the `duty_logs` and other tables have been created in the **Table Editor**.

3.  **Get API Keys**:
    *   Go to **Settings > API** in your Supabase project.
    *   You will need the following for your `.env` file:
        *   **Project URL** (copy the `URL`)
        *   **`anon` `public` Key** (copy the `anon public` key)
        *   **`service_role` Key** (copy the `service_role` key)

### Step 2: Discord Application & Bot Setup

1.  **Create a Discord Application**:
    *   Go to the [Discord Developer Portal](https://discord.com/developers/applications).
    *   Click "New Application" and give it a name.

2.  **Configure OAuth2 for Login**:
    *   Go to the **OAuth2 > General** tab.
    *   Add a **Redirect URI** for your production site: `https://your-domain.com/api/auth/callback/discord`.
    *   Save your **Client ID** and **Client Secret** for the `.env` file.

3.  **Set Up the Bot User**:
    *   Go to the **Bot** tab and click "Add Bot".
    *   Enable **"Message Content Intent"** and **"Server Members Intent"**.
    *   Copy the **Bot Token** and save it for the `.env` file.

4.  **Get Discord IDs**:
    *   Enable **Developer Mode** in your Discord settings (Settings > Advanced).
    *   Right-click on your server name and "Copy Server ID" to get the `GUILD_ID`.
    *   Right-click on the relevant channels and roles to get their IDs for the `.env` file (`WHITELIST_CHANNEL_ID`, `RESPONSE_CHANNEL_ID`, etc.).

### Step 3: FiveM Server Script Setup

To show the "Elite Players" on the website, your FiveM server administrator needs to install a script.

1.  **Provide `FIVEM_SERVER_SETUP.md` to the admin.** This file contains all the instructions and the Lua script needed.
2.  **The admin will need to:**
    *   Create a new resource on the FiveM server.
    *   Add the `elite_players_sync.lua` script (from the `fivem-scripts` folder) to the resource.
    *   Configure the script with your website's URL and a secure API key.
3.  **You must set the same secure API key** in your `.env` file as `FIVEM_SYNC_API_KEY`.

### Step 4: Environment Variable Configuration (`.env`)

This is the most critical step. Create a `.env.local` file for production and fill it with your live keys. **DO NOT** commit this file to Git.

```env
# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token_here
GUILD_ID=your_discord_server_id_here
WHITELIST_CHANNEL_ID=your_channel_id_for_applications
RESPONSE_CHANNEL_ID=your_channel_id_for_responses
ALLOWED_ROLE_ID=your_staff_role_id_that_can_process_apps
WHITELISTED_ROLE_ID=the_role_to_give_approved_users

# Discord OAuth Configuration (for website login)
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_app_client_id
DISCORD_CLIENT_SECRET=your_discord_app_client_secret
# IMPORTANT: This MUST match the redirect URI in your Discord App settings for production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate_a_random_string_for_this

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# FiveM Sync Configuration
FIVEM_SYNC_API_KEY=the_secure_api_key_you_shared_with_the_fivem_admin

# Optional: Custom branding
MAYAALOKAM_LOGO_URL=https://your-server-logo-url.com/logo.png
```
**To generate `NEXTAUTH_SECRET`**, you can run `openssl rand -hex 32` in your terminal or use an online generator.

### Step 5: Application Code Configuration

Some configuration is hard-coded and needs to be updated directly in the source code.

#### Authorized Roles for Duty Logs
You must specify which Discord roles are authorized to use the duty logs system.

1.  Open the file `backend/discord-bot.ts`.
2.  Find the `authorizedRoles` array (around line 22).
3.  Replace the placeholder IDs with the actual Discord Role IDs for your staff departments (PD, EMS, etc.).

**Example:**
```typescript
private readonly authorizedRoles = [
  '1234567890123456789', // Your Police Department Role ID
  '9876543210987654321', // Your EMS Role ID
  '1122334455667788999', // Your Mechanic Role ID
];
```

### Step 6: Building and Deploying

-   **Frontend (Next.js)**:
    -   The recommended hosting platform is **Vercel**.
    -   Connect your Git repository to Vercel.
    -   In the Vercel project settings, add all the environment variables from your `.env.local` file.
    -   Vercel will automatically build and deploy your site when you push changes to your main branch.

-   **Backend (Discord Bot)**:
    -   The bot needs to run continuously in a Node.js environment.
    -   You can use services like **Render**, **Heroku**, or a **VPS (e.g., DigitalOcean, Linode)**.
    -   You will need to set up the environment variables on your chosen hosting service.
    -   Use a process manager like `pm2` to keep the bot running. The `package.json` includes a `start:bot` script.

## 📁 Project Structure
```
mayaa2/
├── app/                  # Next.js App Router: Frontend pages and components
├── backend/              # Node.js backend for the Discord Bot
├── fivem-scripts/        # Lua script for the FiveM server
├── public/               # Static assets (images, fonts)
├── .env.example          # Example environment file
├── DISCORD_BOT_SETUP.md  # Detailed guide for the whitelist bot
├── SUPABASE_SETUP.md     # SQL script for database setup
├── FIVEM_SERVER_SETUP.md # Guide for the FiveM server admin
└── package.json          # Project dependencies and scripts
```

## 🔧 Customization

-   **Server Information**: Edit the server widget in `app/components/ServerStatus.tsx`.
-   **Social Links**: Update URLs in `app/components/Navbar.tsx` and `app/components/Footer.tsx`.
-   **Membership Tiers**: Modify the plans in `app/memberships/page.tsx`.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📞 Support

For technical support or questions, please open an issue on GitHub or reach out on our Discord server.

## 📄 License

This project is proprietary to MAYAAALOKAM ROLEPLAY and Mayaavi Games.

---

**Built with ❤️ by Mayaavi Games for the Telugu Gaming Community** 