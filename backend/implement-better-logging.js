import { betterLogger } from './better-logging.js';

// Enhanced console override for existing applications
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

// Override console methods to use better logging
console.log = (...args) => {
  const message = args.join(' ');
  
  // Categorize existing console.log calls
  if (message.includes('🛡️') || message.includes('Keep-Alive') || message.includes('keep-alive') || message.includes('ping')) {
    betterLogger.log('KEEPALIVE', 'INFO', message);
  } else if (message.includes('🤖') || message.includes('Discord') || message.includes('bot')) {
    betterLogger.log('DISCORD', 'INFO', message);
  } else if (message.includes('🚀') || message.includes('server') || message.includes('port')) {
    betterLogger.log('SERVER', 'INFO', message);
  } else if (message.includes('📋') || message.includes('📝') || message.includes('API')) {
    betterLogger.log('API', 'INFO', message);
  } else if (message.includes('💾') || message.includes('Database') || message.includes('Supabase')) {
    betterLogger.log('DATABASE', 'INFO', message);
  } else {
    betterLogger.log('SYSTEM', 'INFO', message);
  }
};

console.error = (...args) => {
  const message = args.join(' ');
  
  // Categorize existing console.error calls
  if (message.includes('Keep-Alive') || message.includes('keep-alive') || message.includes('ping') || message.includes('Self-ping')) {
    betterLogger.log('KEEPALIVE', 'ERROR', message);
  } else if (message.includes('Discord') || message.includes('bot')) {
    betterLogger.log('DISCORD', 'ERROR', message);
  } else if (message.includes('Database') || message.includes('Supabase')) {
    betterLogger.log('DATABASE', 'ERROR', message);
  } else if (message.includes('API') || message.includes('endpoint')) {
    betterLogger.log('API', 'ERROR', message);
  } else if (message.includes('CRITICAL') || message.includes('🚨')) {
    betterLogger.log('SYSTEM', 'CRITICAL', message);
  } else {
    betterLogger.log('SYSTEM', 'ERROR', message);
  }
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  // Categorize existing console.warn calls
  if (message.includes('Keep-Alive') || message.includes('keep-alive') || message.includes('ping')) {
    betterLogger.log('KEEPALIVE', 'WARN', message);
  } else if (message.includes('Discord') || message.includes('bot')) {
    betterLogger.log('DISCORD', 'WARN', message);
  } else if (message.includes('Database') || message.includes('Supabase')) {
    betterLogger.log('DATABASE', 'WARN', message);
  } else {
    betterLogger.log('SYSTEM', 'WARN', message);
  }
};

// Function to restore original console (for testing)
function restoreConsole() {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
}

// Enhanced keep-alive functions for existing code
function enhanceKeepAlive(keepAliveManager) {
  if (!keepAliveManager) return;

  // Override the performSelfPing method if it exists
  const originalPerformSelfPing = keepAliveManager.performSelfPing;
  if (originalPerformSelfPing) {
    keepAliveManager.performSelfPing = async function() {
      try {
        await originalPerformSelfPing.call(this);
      } catch (error) {
        // Use enhanced logging for self-ping failures
        betterLogger.keepAlivePing('selfPing', false, error, this.services?.selfPing?.consecutiveFailures || 0);
      }
    };
  }

  // Override the performHealthCheck method if it exists
  const originalPerformHealthCheck = keepAliveManager.performHealthCheck;
  if (originalPerformHealthCheck) {
    keepAliveManager.performHealthCheck = function() {
      const health = this.getHealthStatus ? this.getHealthStatus() : { status: 'unknown' };
      const activeCount = this.services ? Object.values(this.services).filter(s => s.status === 'active').length : 0;
      
      // Use enhanced logging for health checks
      betterLogger.keepAliveStatus(health.status, activeCount, 5);
      
      if (health.status === 'critical') {
        betterLogger.keepAliveAlert('System health is critical!', true);
      }
    };
  }

  // Add health report endpoint
  if (keepAliveManager.app) {
    keepAliveManager.app.get('/keep-alive/enhanced-status', (req, res) => {
      const healthReport = betterLogger.getHealthReport();
      const logSummary = betterLogger.getLogSummary(30);
      
      res.json({
        enhancedLogging: true,
        healthReport,
        logSummary,
        recentErrors: betterLogger.getLogSummary(10).byLevel,
        timestamp: new Date().toISOString()
      });
    });
    
    betterLogger.info('KEEPALIVE', 'Enhanced status endpoint added: /keep-alive/enhanced-status');
  }
}

// Periodic health reporting (every 10 minutes)
setInterval(() => {
  const healthReport = betterLogger.getHealthReport();
  const logSummary = betterLogger.getLogSummary(10);
  
  // Only log if there's significant activity or issues
  if (logSummary.total > 0 || logSummary.byLevel.ERROR > 0 || logSummary.byLevel.CRITICAL > 0) {
    betterLogger.info('SYSTEM', 'Periodic Health Report', {
      report: healthReport,
      recentActivity: logSummary
    });
  }
}, 10 * 60 * 1000);

// Add environment variable for log level control
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
console.log(`[ENHANCED LOGGING] Log level set to: ${LOG_LEVEL}`);
console.log(`[ENHANCED LOGGING] Rate limiting enabled: 3 similar messages per 5 minutes`);
console.log(`[ENHANCED LOGGING] Enhanced logging is now active. Logs will be categorized and rate-limited.`);

export {
  betterLogger,
  enhanceKeepAlive,
  restoreConsole
}; 