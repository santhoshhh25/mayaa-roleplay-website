import express from 'express';
import * as cron from 'node-cron';

interface ServiceStatus {
  lastPing: string;
  status: 'active' | 'inactive';
  consecutiveFailures: number;
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  uptime: number;
  lastPing: string | null;
  discordBotStatus: 'connected' | 'disconnected' | 'reconnecting';
  totalPings: number;
  failedPings: number;
  services: {
    [key: string]: ServiceStatus;
  };
}

export class KeepAliveManager {
  private app: express.Application;
  private startTime: number;
  private lastPingTime: string | null = null;
  private totalPings: number = 0;
  private failedPings: number = 0;
  private discordClient: any;
  private serviceURL: string;
  private webhookURL: string | null;
  
  private services: { [key: string]: ServiceStatus } = {
    uptimeRobot: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
    cronJob: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
    pingdom: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
    statusCake: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
    selfPing: { lastPing: '', status: 'inactive', consecutiveFailures: 0 }
  };

  constructor(app: express.Application) {
    this.app = app;
    this.startTime = Date.now();
    this.serviceURL = process.env.RENDER_SERVICE_URL || process.env.VERCEL_URL || `http://localhost:${process.env.BACKEND_PORT || 3001}`;
    this.webhookURL = process.env.ALERT_WEBHOOK_URL || null;
    
    this.setupHealthEndpoints();
    // Don't start ping systems immediately - wait for server to be ready
    
    console.log('🛡️ Keep-Alive Manager initialized with bulletproof sleep prevention');
  }

  public startMonitoring() {
    this.setupInternalPingSystem();
    this.setupMonitoring();
    console.log('🔄 Keep-Alive monitoring systems started');
  }

  setDiscordClient(client: any) {
    this.discordClient = client;
  }

  private setupHealthEndpoints() {
    console.log('🔧 Setting up keep-alive endpoints...');
    
    this.app.get('/keep-alive', (req, res) => {
      const userAgent = req.get('User-Agent') || 'unknown';
      const source = this.identifyPingSource(userAgent, req.ip || 'unknown');
      
      this.recordPing(source);
      
      const health = this.getHealthStatus();
      
      res.status(health.status === 'critical' ? 500 : 200).json({
        ...health,
        message: 'Keep-alive ping received',
        source: source,
        instructions: 'This endpoint prevents Render free tier from sleeping'
      });
    });
    
    console.log('✅ /keep-alive endpoint registered');

    this.app.get('/keep-alive/status', (req, res) => {
      res.json(this.getDetailedStatus());
    });
    console.log('✅ /keep-alive/status endpoint registered');

    this.app.get('/keep-alive/wake', (req, res) => {
      this.handleEmergencyWakeup();
      res.json({ 
        message: 'Emergency wake-up initiated', 
        timestamp: new Date().toISOString() 
      });
    });
    console.log('✅ /keep-alive/wake endpoint registered');

    this.app.post('/keep-alive/register-ping', (req, res) => {
      const { service, interval } = req.body;
      console.log(`📝 External ping service registered: ${service} (${interval})`);
      res.json({ registered: true, service, interval });
    });
    console.log('✅ /keep-alive/register-ping endpoint registered');
    
    console.log('🎯 All keep-alive endpoints setup complete');
  }

  private setupInternalPingSystem() {
    cron.schedule('*/10 * * * *', async () => {
      await this.performSelfPing();
    });

    cron.schedule('*/12 * * * *', async () => {
      await this.performBackupPing();
    });

    cron.schedule('*/7 * * * *', async () => {
      await this.performEmergencyPing();
    });

    cron.schedule('*/5 * * * *', () => {
      this.performHealthCheck();
    });
  }

  private setupMonitoring() {
    cron.schedule('*/3 * * * *', () => {
      const now = Date.now();
      const lastPingTime = this.lastPingTime ? new Date(this.lastPingTime).getTime() : 0;
      const timeSinceLastPing = now - lastPingTime;

      if (timeSinceLastPing > 10 * 60 * 1000) {
        this.sendCriticalAlert('No external pings received in 10+ minutes!');
      }
    });

    cron.schedule('*/2 * * * *', () => {
      if (this.discordClient) {
        const botStatus = this.getDiscordBotStatus();
        if (botStatus === 'disconnected') {
          this.sendAlert('Discord bot is disconnected!');
        }
      }
    });
  }

  private async performSelfPing() {
    try {
      const pingUrl = `${this.serviceURL}/keep-alive`;
      console.log(`🔄 Attempting self-ping to: ${pingUrl}`);
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Internal-Self-Ping/1.0',
          'X-Keep-Alive': 'internal'
        }
      });

      if (response.ok) {
        this.services.selfPing.lastPing = new Date().toISOString();
        this.services.selfPing.status = 'active';
        this.services.selfPing.consecutiveFailures = 0;
        console.log('✅ Self-ping successful');
      } else {
        throw new Error(`Self-ping failed with status: ${response.status}`);
      }
    } catch (error) {
      this.services.selfPing.consecutiveFailures++;
      console.error('❌ Self-ping failed:', error);
      
      if (this.services.selfPing.consecutiveFailures >= 3) {
        this.sendCriticalAlert('Self-ping system failing!');
      }
    }
  }

  private async performBackupPing() {
    try {
      const response = await fetch(`${this.serviceURL}/keep-alive/wake`, {
        method: 'GET',
        headers: { 'User-Agent': 'Backup-Self-Ping/1.0' }
      });
      
      if (response.ok) {
        console.log('🔄 Backup ping successful');
      }
    } catch (error) {
      console.error('⚠️ Backup ping failed:', error);
    }
  }

  private async performEmergencyPing() {
    try {
      const promises = [
        fetch(`${this.serviceURL}/keep-alive`),
        fetch(`${this.serviceURL}/keep-alive/status`),
        fetch(`${this.serviceURL}/keep-alive/wake`)
      ];

      await Promise.allSettled(promises);
      console.log('🚨 Emergency ping sequence completed');
    } catch (error) {
      console.error('💥 Emergency ping failed:', error);
    }
  }

  private identifyPingSource(userAgent: string, ip?: string): string {
    if (userAgent.includes('UptimeRobot')) return 'uptimeRobot';
    if (userAgent.includes('Pingdom')) return 'pingdom';
    if (userAgent.includes('StatusCake')) return 'statusCake';
    if (userAgent.includes('cron-job.org')) return 'cronJob';
    if (userAgent.includes('Internal-Self-Ping')) return 'selfPing';
    return 'unknown';
  }

  private recordPing(source: string) {
    this.totalPings++;
    this.lastPingTime = new Date().toISOString();

    if (this.services[source]) {
      this.services[source].lastPing = this.lastPingTime;
      this.services[source].status = 'active';
      this.services[source].consecutiveFailures = 0;
    }

    console.log(`📡 Ping received from: ${source} (Total: ${this.totalPings})`);
  }

  private getHealthStatus(): HealthStatus {
    const now = Date.now();
    const uptime = now - this.startTime;
    const lastPingTime = this.lastPingTime ? new Date(this.lastPingTime).getTime() : 0;
    const timeSinceLastPing = now - lastPingTime;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (timeSinceLastPing > 12 * 60 * 1000) {
      status = 'critical';
    } else if (timeSinceLastPing > 8 * 60 * 1000) {
      status = 'warning';
    }

    const discordStatus = this.getDiscordBotStatus();
    if (discordStatus === 'disconnected') {
      status = 'critical';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000),
      lastPing: this.lastPingTime,
      discordBotStatus: discordStatus,
      totalPings: this.totalPings,
      failedPings: this.failedPings,
      services: this.services
    };
  }

  private getDetailedStatus() {
    const health = this.getHealthStatus();
    const activeServices = Object.entries(this.services)
      .filter(([_, service]) => service.status === 'active').length;

    return {
      ...health,
      activeServices,
      totalServices: Object.keys(this.services).length,
      recommendations: this.getRecommendations(),
      externalServices: this.getExternalServiceSetupInstructions()
    };
  }

  private getDiscordBotStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    if (!this.discordClient) return 'disconnected';
    
    switch (this.discordClient.ws?.status) {
      case 0: return 'connected';
      case 1: return 'reconnecting';
      case 2: return 'reconnecting';
      default: return 'disconnected';
    }
  }

  private performHealthCheck() {
    const health = this.getHealthStatus();
    
    if (health.status === 'critical') {
      console.error('🚨 CRITICAL: System health is critical!');
      this.handleEmergencyWakeup();
    } else if (health.status === 'warning') {
      console.warn('⚠️ WARNING: System health degraded');
    }

    const activeCount = Object.values(this.services)
      .filter(s => s.status === 'active').length;
    console.log(`📊 Health Check: ${health.status.toUpperCase()} | Active Services: ${activeCount}/5`);
  }

  private handleEmergencyWakeup() {
    console.log('🚨 EMERGENCY WAKEUP INITIATED');
    
    setTimeout(() => this.performSelfPing(), 0);
    setTimeout(() => this.performSelfPing(), 5000);
    setTimeout(() => this.performSelfPing(), 10000);

    this.sendCriticalAlert('Emergency wakeup procedure activated!');
  }

  private async sendAlert(message: string) {
    console.log(`📢 ALERT: ${message}`);
    
    if (this.webhookURL) {
      try {
        await fetch(this.webhookURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `⚠️ **Keep-Alive Alert**\n${message}\nTimestamp: ${new Date().toISOString()}`
          })
        });
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }
  }

  private async sendCriticalAlert(message: string) {
    console.error(`🚨 CRITICAL ALERT: ${message}`);
    
    if (this.webhookURL) {
      try {
        await fetch(this.webhookURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **CRITICAL KEEP-ALIVE ALERT** 🚨\n${message}\n\n**Action Required:**\n- Check external ping services\n- Verify Render service status\n- Monitor Discord bot connectivity\n\nTimestamp: ${new Date().toISOString()}`
          })
        });
      } catch (error) {
        console.error('Failed to send critical webhook alert:', error);
      }
    }
  }

  private getRecommendations(): string[] {
    const recommendations: string[] = [];
    const health = this.getHealthStatus();

    if (health.status === 'critical') {
      recommendations.push('🚨 Set up external ping services immediately');
      recommendations.push('🔧 Check Discord bot connection');
    }

    const activeServices = Object.values(this.services)
      .filter(s => s.status === 'active').length;

    if (activeServices < 3) {
      recommendations.push('📈 Set up more external ping services for redundancy');
    }

    if (!this.webhookURL) {
      recommendations.push('🔔 Configure webhook alerts for monitoring');
    }

    return recommendations;
  }

  private getExternalServiceSetupInstructions() {
    return {
      uptimeRobot: {
        url: 'https://uptimerobot.com',
        setup: `1. Create free account\n2. Add HTTP(s) monitor\n3. URL: ${this.serviceURL}/keep-alive\n4. Interval: 5 minutes`,
        notes: 'Free plan allows 50 monitors, 5-minute intervals'
      },
      cronJobOrg: {
        url: 'https://cron-job.org',
        setup: `1. Create free account\n2. Create new cron job\n3. URL: ${this.serviceURL}/keep-alive\n4. Schedule: */10 * * * * (every 10 minutes)`,
        notes: 'Free plan allows unlimited jobs, 1-minute minimum interval'
      },
      pingdom: {
        url: 'https://www.pingdom.com',
        setup: `1. Create free account\n2. Add uptime check\n3. URL: ${this.serviceURL}/keep-alive\n4. Interval: 1 minute`,
        notes: 'Free plan: 1 uptime check, 1-minute intervals'
      },
      statusCake: {
        url: 'https://www.statuscake.com',
        setup: `1. Create free account\n2. Add uptime test\n3. URL: ${this.serviceURL}/keep-alive\n4. Check rate: 5 minutes`,
        notes: 'Free plan: Unlimited tests, 5-minute intervals'
      }
    };
  }

  getSetupInstructions(): string {
    return `
🛡️ BULLETPROOF KEEP-ALIVE SETUP INSTRUCTIONS

CRITICAL: To ensure your Discord bot NEVER sleeps, follow these steps:

1. **UptimeRobot** (PRIMARY - Most Reliable)
   • Go to: https://uptimerobot.com
   • Create free account (50 monitors included)
   • Click "Add New Monitor"
   • Monitor Type: HTTP(s)
   • Friendly Name: "MAYAALOKAM Bot Keep-Alive"
   • URL: ${this.serviceURL}/keep-alive
   • Monitoring Interval: 5 minutes
   • Alert Contacts: Add your email
   • Click "Create Monitor"

2. **Cron-Job.org** (BACKUP - Ultra Reliable)
   • Go to: https://cron-job.org/en/
   • Create free account
   • Click "Create cronjob"
   • Title: "Discord Bot Ping"
   • Address: ${this.serviceURL}/keep-alive
   • Schedule: */8 * * * * (every 8 minutes)
   • Enable "Execution"
   • Save cronjob

3. **StatusCake** (REDUNDANCY)
   • Go to: https://www.statuscake.com
   • Create free account
   • Go to "Uptime" → "Add Test"
   • Test Name: "Bot Keep-Alive"
   • Website URL: ${this.serviceURL}/keep-alive
   • Check Rate: 5 minutes
   • Create Test

4. **Better Uptime** (EXTRA SAFETY)
   • Go to: https://betteruptime.com
   • Create free account (10 monitors)
   • Create Monitor
   • URL: ${this.serviceURL}/keep-alive
   • Check frequency: 3 minutes
   • Create monitor

🔔 **DISCORD WEBHOOK ALERTS (HIGHLY RECOMMENDED)**
   1. In your Discord server: Server Settings → Integrations → Webhooks
   2. Create New Webhook for alerts channel
   3. Copy webhook URL
   4. Add to Render environment variables:
      ALERT_WEBHOOK_URL=your_webhook_url_here

📊 **VERIFY SETUP WORKING**
   • Visit: ${this.serviceURL}/keep-alive/status
   • Should show all services as "active" within 30 minutes
   • Check console logs for ping confirmations

⚡ **SUCCESS CRITERIA - YOUR BOT WILL NEVER SLEEP WHEN:**
   ✅ 3+ external services ping every 3-8 minutes
   ✅ Internal self-ping runs every 7-12 minutes  
   ✅ Discord webhook alerts configured
   ✅ /keep-alive/status shows "healthy" status
   ✅ Multiple redundant ping sources active

🚨 **IMPORTANT NOTES:**
   • Set up AT LEAST 2 services for redundancy
   • Use different intervals (5min, 8min, 3min) to avoid sync issues
   • Monitor the /keep-alive/status endpoint daily for first week
   • Your Discord bot will NEVER sleep with this setup!

📈 **RENDER FREE TIER LIMITS:**
   • 750 hours/month (= 31 days × 24 hours)
   • With keep-alive: You'll use ~744 hours (safe!)
   • Multiple pings don't increase usage significantly
`;
  }
} 