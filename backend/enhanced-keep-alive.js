const { betterLogger } = require('./better-logging');
const cron = require('node-cron');

class EnhancedKeepAliveManager {
  constructor(app) {
    this.app = app;
    this.startTime = Date.now();
    this.lastPingTime = null;
    this.totalPings = 0;
    this.failedPings = 0;
    this.discordClient = null;
    this.serviceURL = process.env.RENDER_SERVICE_URL || process.env.VERCEL_URL || `http://localhost:${process.env.BACKEND_PORT || 3001}`;
    this.webhookURL = process.env.ALERT_WEBHOOK_URL || null;
    
    this.services = {
      uptimeRobot: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
      cronJob: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
      pingdom: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
      statusCake: { lastPing: '', status: 'inactive', consecutiveFailures: 0 },
      selfPing: { lastPing: '', status: 'inactive', consecutiveFailures: 0 }
    };

    this.setupHealthEndpoints();
    betterLogger.info('KEEPALIVE', 'Enhanced Keep-Alive Manager initialized', { serviceURL: this.serviceURL });
  }

  startMonitoring() {
    this.setupInternalPingSystem();
    this.setupMonitoring();
    betterLogger.info('KEEPALIVE', 'Monitoring systems started');
  }

  setDiscordClient(client) {
    this.discordClient = client;
    betterLogger.info('KEEPALIVE', 'Discord client connected to monitoring');
  }

  setupHealthEndpoints() {
    betterLogger.info('KEEPALIVE', 'Setting up health endpoints...');
    
    this.app.get('/keep-alive', (req, res) => {
      const userAgent = req.get('User-Agent') || 'unknown';
      const source = this.identifyPingSource(userAgent, req.ip || 'unknown');
      
      this.recordPing(source);
      
      const health = this.getHealthStatus();
      
      // Log successful pings (with rate limiting)
      betterLogger.keepAlivePing(source, true, null, 0);
      
      res.status(health.status === 'critical' ? 500 : 200).json({
        ...health,
        message: 'Keep-alive ping received',
        source: source,
        instructions: 'This endpoint prevents Render free tier from sleeping'
      });
    });

    this.app.get('/keep-alive/status', (req, res) => {
      const health = this.getDetailedStatus();
      betterLogger.info('KEEPALIVE', 'Status endpoint accessed', { requestIP: req.ip });
      res.json(health);
    });

    this.app.get('/keep-alive/health-report', (req, res) => {
      const report = betterLogger.getHealthReport();
      const logSummary = betterLogger.getLogSummary(30); // Last 30 minutes
      
      res.json({
        healthReport: report,
        logSummary,
        systemHealth: this.getHealthStatus(),
        recentLogs: betterLogger.getLogSummary(5)
      });
    });

    this.app.get('/keep-alive/wake', (req, res) => {
      this.handleEmergencyWakeup();
      betterLogger.info('KEEPALIVE', 'Emergency wake-up initiated via endpoint');
      res.json({ 
        message: 'Emergency wake-up initiated', 
        timestamp: new Date().toISOString() 
      });
    });

    this.app.post('/keep-alive/register-ping', (req, res) => {
      const { service, interval } = req.body;
      betterLogger.info('KEEPALIVE', 'External ping service registered', { service, interval });
      res.json({ registered: true, service, interval });
    });
    
    betterLogger.info('KEEPALIVE', 'All health endpoints setup complete');
  }

  setupInternalPingSystem() {
    // Self-ping every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      await this.performSelfPing();
    });

    // Backup ping every 12 minutes
    cron.schedule('*/12 * * * *', async () => {
      await this.performBackupPing();
    });

    // Emergency ping every 7 minutes  
    cron.schedule('*/7 * * * *', async () => {
      await this.performEmergencyPing();
    });

    // Health check every 5 minutes (this will be rate limited if repetitive)
    cron.schedule('*/5 * * * *', () => {
      this.performHealthCheck();
    });

    // Health summary every 15 minutes (less frequent, more comprehensive)
    cron.schedule('*/15 * * * *', () => {
      this.logHealthSummary();
    });
  }

  setupMonitoring() {
    // Check for no external pings every 3 minutes
    cron.schedule('*/3 * * * *', () => {
      const now = Date.now();
      const lastPingTime = this.lastPingTime ? new Date(this.lastPingTime).getTime() : 0;
      const timeSinceLastPing = now - lastPingTime;

      if (timeSinceLastPing > 10 * 60 * 1000) {
        betterLogger.keepAliveAlert('No external pings received in 10+ minutes', true);
      }
    });

    // Check Discord bot status every 2 minutes
    cron.schedule('*/2 * * * *', () => {
      if (this.discordClient) {
        const botStatus = this.getDiscordBotStatus();
        if (botStatus === 'disconnected') {
          betterLogger.error('DISCORD', 'Bot disconnected');
        }
      }
    });
  }

  async performSelfPing() {
    try {
      const pingUrl = `${this.serviceURL}/keep-alive`;
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Internal-Self-Ping/1.0',
          'X-Keep-Alive': 'internal'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.ok) {
        this.services.selfPing.lastPing = new Date().toISOString();
        this.services.selfPing.status = 'active';
        this.services.selfPing.consecutiveFailures = 0;
        betterLogger.keepAlivePing('selfPing', true);
      } else {
        throw new Error(`Self-ping failed with status: ${response.status}`);
      }
    } catch (error) {
      this.services.selfPing.consecutiveFailures++;
      this.failedPings++;
      
      // Enhanced error logging with context
      const errorContext = {
        consecutiveFailures: this.services.selfPing.consecutiveFailures,
        serviceURL: this.serviceURL,
        errorType: error.name,
        statusCode: error.response?.status
      };

      betterLogger.keepAlivePing('selfPing', false, error, this.services.selfPing.consecutiveFailures);

      // Only send critical alert after multiple consecutive failures
      if (this.services.selfPing.consecutiveFailures >= 3) {
        betterLogger.keepAliveAlert('Self-ping system failing after 3+ attempts', true);
        
        // Additional diagnostic info
        if (error.message.includes('404')) {
          betterLogger.critical('KEEPALIVE', 'Self-ping returning 404 - endpoint may not be accessible', {
            url: `${this.serviceURL}/keep-alive`,
            suggestion: 'Check if RENDER_SERVICE_URL is correctly configured'
          });
        }
      }
    }
  }

  async performBackupPing() {
    try {
      const response = await fetch(`${this.serviceURL}/keep-alive/wake`, {
        method: 'GET',
        headers: { 'User-Agent': 'Backup-Self-Ping/1.0' },
        timeout: 10000
      });
      
      if (response.ok) {
        betterLogger.info('KEEPALIVE', 'Backup ping successful');
      }
    } catch (error) {
      betterLogger.warn('KEEPALIVE', 'Backup ping failed', { error: error.message });
    }
  }

  async performEmergencyPing() {
    try {
      const promises = [
        fetch(`${this.serviceURL}/keep-alive`),
        fetch(`${this.serviceURL}/keep-alive/status`),
        fetch(`${this.serviceURL}/keep-alive/wake`)
      ];

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      betterLogger.info('KEEPALIVE', 'Emergency ping sequence completed', { 
        successful: `${successful}/3` 
      });
    } catch (error) {
      betterLogger.error('KEEPALIVE', 'Emergency ping failed', { error: error.message });
    }
  }

  identifyPingSource(userAgent, ip) {
    if (userAgent.includes('UptimeRobot')) return 'uptimeRobot';
    if (userAgent.includes('Pingdom')) return 'pingdom';
    if (userAgent.includes('StatusCake')) return 'statusCake';
    if (userAgent.includes('cron-job.org')) return 'cronJob';
    if (userAgent.includes('Internal-Self-Ping')) return 'selfPing';
    return 'unknown';
  }

  recordPing(source) {
    this.totalPings++;
    this.lastPingTime = new Date().toISOString();

    if (this.services[source]) {
      this.services[source].lastPing = this.lastPingTime;
      this.services[source].status = 'active';
      this.services[source].consecutiveFailures = 0;
    }

    // Only log external pings, not self-pings (to reduce noise)
    if (source !== 'selfPing') {
      betterLogger.keepAlivePing(source, true, null, 0);
    }
  }

  getHealthStatus() {
    const now = Date.now();
    const uptime = now - this.startTime;
    const lastPingTime = this.lastPingTime ? new Date(this.lastPingTime).getTime() : 0;
    const timeSinceLastPing = now - lastPingTime;

    let status = 'healthy';

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

  getDetailedStatus() {
    const health = this.getHealthStatus();
    const activeServices = Object.entries(this.services)
      .filter(([_, service]) => service.status === 'active').length;

    return {
      ...health,
      activeServices,
      totalServices: Object.keys(this.services).length,
      logSummary: betterLogger.getLogSummary(10),
      healthReport: betterLogger.getHealthReport()
    };
  }

  getDiscordBotStatus() {
    if (!this.discordClient) return 'disconnected';
    
    switch (this.discordClient.ws?.status) {
      case 0: return 'connected';
      case 1: return 'reconnecting';
      case 2: return 'reconnecting';
      default: return 'disconnected';
    }
  }

  performHealthCheck() {
    const health = this.getHealthStatus();
    const activeCount = Object.values(this.services)
      .filter(s => s.status === 'active').length;

    // Use the better logger's rate limiting for this
    betterLogger.keepAliveStatus(health.status, activeCount, 5);

    if (health.status === 'critical') {
      this.handleEmergencyWakeup();
    }
  }

  logHealthSummary() {
    const health = this.getHealthStatus();
    const logSummary = betterLogger.getLogSummary(15);
    const healthReport = betterLogger.getHealthReport();
    
    betterLogger.info('KEEPALIVE', 'Health Summary', {
      systemStatus: health.status,
      uptime: `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`,
      totalPings: this.totalPings,
      failedPings: this.failedPings,
      activeServices: Object.values(this.services).filter(s => s.status === 'active').length,
      logActivity: `${logSummary.total} logs in last 15min`,
      healthReport
    });
  }

  handleEmergencyWakeup() {
    betterLogger.critical('KEEPALIVE', 'Emergency wakeup procedure activated');
    
    // Schedule multiple self-pings with delays
    setTimeout(() => this.performSelfPing(), 0);
    setTimeout(() => this.performSelfPing(), 5000);
    setTimeout(() => this.performSelfPing(), 10000);

    this.sendCriticalAlert('Emergency wakeup procedure activated!');
  }

  async sendAlert(message) {
    betterLogger.warn('KEEPALIVE', `Alert: ${message}`);
    
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
        betterLogger.error('WEBHOOK', 'Failed to send alert webhook', { error: error.message });
      }
    }
  }

  async sendCriticalAlert(message) {
    betterLogger.critical('KEEPALIVE', `Critical Alert: ${message}`);
    
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
        betterLogger.error('WEBHOOK', 'Failed to send critical alert webhook', { error: error.message });
      }
    }
  }

  getSetupInstructions() {
    return `
🛡️  ENHANCED KEEP-ALIVE SYSTEM SETUP INSTRUCTIONS

Current Service URL: ${this.serviceURL}

🔗 EXTERNAL PING SERVICES (Recommended):

1. UptimeRobot (Free - 50 monitors):
   - URL: https://uptimerobot.com
   - Monitor URL: ${this.serviceURL}/keep-alive  
   - Interval: 5 minutes

2. Cron-job.org (Free - Unlimited):
   - URL: https://cron-job.org
   - Monitor URL: ${this.serviceURL}/keep-alive
   - Schedule: */10 * * * * (every 10 minutes)

3. Pingdom (Free - 1 monitor):
   - URL: https://pingdom.com
   - Monitor URL: ${this.serviceURL}/keep-alive
   - Interval: 1 minute

📊 MONITORING ENDPOINTS:
   - Health: ${this.serviceURL}/keep-alive/status
   - Detailed Report: ${this.serviceURL}/keep-alive/health-report
   - Wake: ${this.serviceURL}/keep-alive/wake

💡 ENHANCED FEATURES:
   - Rate-limited logging (reduces spam)
   - Health summaries every 15 minutes
   - Better error diagnostics
   - Log analysis and trends
   - Structured categorized logging
`;
  }
}

module.exports = { EnhancedKeepAliveManager }; 