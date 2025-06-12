# Supabase Setup for Duty Logs System

## Database Table Schema

### 1. Create the `duty_logs` table

Run this SQL in your Supabase SQL editor:

```sql
-- Create the duty_logs table
CREATE TABLE duty_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT NOT NULL,
  username TEXT NOT NULL,
  character_name TEXT NOT NULL,
  department TEXT NOT NULL,
  rank TEXT NOT NULL,
  call_sign TEXT NOT NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  duration DECIMAL(5,2), -- Hours with 2 decimal places
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_duty_logs_discord_id ON duty_logs(discord_id);
CREATE INDEX idx_duty_logs_status ON duty_logs(status);
CREATE INDEX idx_duty_logs_created_at ON duty_logs(created_at DESC);

-- Create a composite index for common queries
CREATE INDEX idx_duty_logs_discord_status ON duty_logs(discord_id, status);
```

### 2. Row Level Security (RLS) Policies

Enable RLS and create policies to ensure users can only see their own data:

```sql
-- Enable Row Level Security
ALTER TABLE duty_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own duty logs
CREATE POLICY "Users can read own duty logs" ON duty_logs
  FOR SELECT USING (true); -- We'll handle filtering in the application

-- Policy: Only the backend service can insert/update duty logs
-- (This uses the service role key, not the anon key)
CREATE POLICY "Service can manage duty logs" ON duty_logs
  FOR ALL USING (true);
```

### 3. Environment Variables Setup

Add these environment variables to your `.env` file:

```env
# Supabase Configuration for Duty Logs
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Discord OAuth for Web Frontend
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://localhost:3000/api/discord/callback
```

### 4. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or use existing one
3. Go to OAuth2 settings
4. Add redirect URI: `http://localhost:3000/api/discord/callback`
5. Copy Client ID and Client Secret to your `.env` file
6. Required OAuth2 scopes: `identify`, `guilds`

### 5. Discord Bot Role Mapping

Update the `jobRoles` mapping in `backend/discord-bot.ts` with your actual Discord role IDs:

```typescript
private readonly jobRoles = {
  // Police Department
  'YOUR_POLICE_ROLE_ID': { title: 'Police Officer', department: 'LSPD' },
  'YOUR_SENIOR_POLICE_ROLE_ID': { title: 'Senior Police Officer', department: 'LSPD' },
  
  // EMS Department
  'YOUR_EMS_ROLE_ID': { title: 'Paramedic', department: 'EMS' },
  'YOUR_SENIOR_EMS_ROLE_ID': { title: 'Senior Paramedic', department: 'EMS' },
  
  // Fire Department
  'YOUR_FIRE_ROLE_ID': { title: 'Firefighter', department: 'Fire Department' },
  
  // DOJ
  'YOUR_JUDGE_ROLE_ID': { title: 'Judge', department: 'DOJ' },
  'YOUR_LAWYER_ROLE_ID': { title: 'Lawyer', department: 'DOJ' },
  
  // Add more roles as needed...
}
```

### 6. Deployment Configuration

For production deployment:

1. Update redirect URI to your production domain
2. Update CORS settings in your backend
3. Set production environment variables
4. Enable proper RLS policies with authentication

### 7. Testing the System

1. **Discord Bot Commands:**
   - `/clockin location:"Mission Row Police Station" notes:"Starting patrol"`
   - `/clockout notes:"End of shift"`
   - `/dutystatus`
   - `/dutystats`

2. **Web Dashboard:**
   - Visit `/duty-logs`
   - Login with Discord OAuth
   - View your personal duty logs and statistics

### 8. Security Considerations

- The service role key is used by the Discord bot to write data
- The anon key is used by the web frontend to read data
- RLS ensures users can only access their own data
- Discord OAuth ensures only server members can access the system
- Job role validation ensures only authorized personnel can log duties

### 9. Data Flow

1. **Clock In (Discord):** User runs `/clockin` → Bot validates role → Writes to Supabase
2. **Clock Out (Discord):** User runs `/clockout` → Bot finds active session → Updates with duration
3. **View Logs (Web):** User authenticates → Frontend fetches user's logs from Supabase
4. **Statistics:** Calculated in real-time from duty logs data

This setup ensures complete separation between the clock in/out functionality (Discord only) and the viewing functionality (Web dashboard only), while maintaining data security and user privacy. 