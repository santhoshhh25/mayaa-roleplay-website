// Simple log management with rate limiting
class BetterLogger {
  constructor() {
    this.rateLimitMap = new Map();
    this.logBuffer = [];
    this.RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
    this.MAX_SAME_LOGS = 3; // Max same logs in window
    this.BUFFER_SIZE = 500;
  }

  generateKey(category, message) {
    // Create key from category and first 30 chars of message
    return `${category}:${message.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  shouldLog(key) {
    const now = Date.now();
    const existing = this.rateLimitMap.get(key);

    if (!existing) {
      this.rateLimitMap.set(key, {
        count: 1,
        firstSeen: now,
        lastSeen: now,
        suppressed: 0
      });
      return { log: true };
    }

    // Check if we're still in the same window
    if (now - existing.firstSeen < this.RATE_LIMIT_WINDOW) {
      existing.count++;
      existing.lastSeen = now;

      if (existing.count <= this.MAX_SAME_LOGS) {
        return { log: true };
      } else {
        existing.suppressed++;
        return { log: false, suppressed: existing.suppressed };
      }
    } else {
      // New window - show suppressed count if any, then reset
      const previouslySuppressed = existing.suppressed;
      this.rateLimitMap.set(key, {
        count: 1,
        firstSeen: now,
        lastSeen: now,
        suppressed: 0
      });
      return { log: true, suppressed: previouslySuppressed > 0 ? previouslySuppressed : undefined };
    }
  }

  formatMessage(category, level, message, suppressedCount) {
    const timestamp = new Date().toISOString().substring(11, 19); // Just HH:MM:SS
    const emoji = this.getEmoji(level);
    const categoryShort = category.substring(0, 8).padEnd(8);
    
    let formatted = `[${timestamp}] ${emoji} [${categoryShort}] ${message}`;
    if (suppressedCount && suppressedCount > 0) {
      formatted += ` (${suppressedCount} similar messages suppressed in last 5min)`;
    }
    return formatted;
  }

  getEmoji(level) {
    switch (level) {
      case 'INFO': return '📝';
      case 'WARN': return '⚠️';
      case 'ERROR': return '❌';
      case 'CRITICAL': return '🚨';
      default: return '📝';
    }
  }

  log(category, level, message, data) {
    const key = this.generateKey(category, message);
    const rateLimitResult = this.shouldLog(key);

    // Always add to buffer for analysis
    this.logBuffer.push({
      timestamp: new Date().toISOString(),
      category,
      level,
      message,
      data,
      suppressed: !rateLimitResult.log
    });

    // Keep buffer size manageable
    if (this.logBuffer.length > this.BUFFER_SIZE) {
      this.logBuffer.shift();
    }

    if (rateLimitResult.log) {
      const formatted = this.formatMessage(category, level, message, rateLimitResult.suppressed);
      
      // Output to console
      if (level === 'ERROR' || level === 'CRITICAL') {
        console.error(formatted);
      } else if (level === 'WARN') {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }

      // Show data if provided (but not for suppressed message notifications)
      if (data && typeof data === 'object' && !rateLimitResult.suppressed) {
        const dataStr = JSON.stringify(data, null, 2);
        console.log(`    └─ Data: ${dataStr}`);
      }
    }
  }

  // Convenience methods
  info(category, message, data) {
    this.log(category, 'INFO', message, data);
  }

  warn(category, message, data) {
    this.log(category, 'WARN', message, data);
  }

  error(category, message, data) {
    this.log(category, 'ERROR', message, data);
  }

  critical(category, message, data) {
    this.log(category, 'CRITICAL', message, data);
  }

  // Keep-alive specific methods
  keepAliveStatus(status, activeServices, totalServices) {
    const level = status === 'healthy' ? 'INFO' : status === 'warning' ? 'WARN' : 'CRITICAL';
    this.log('KEEPALIVE', level, `System ${status.toUpperCase()}: ${activeServices}/${totalServices} services active`);
  }

  keepAlivePing(source, success, error, consecutiveFailures) {
    if (success) {
      this.log('KEEPALIVE', 'INFO', `Ping OK from ${source}`);
    } else {
      this.log('KEEPALIVE', 'ERROR', `Ping FAILED from ${source}`, { 
        error: error?.message || error, 
        consecutiveFailures 
      });
    }
  }

  keepAliveAlert(message, isEmergency = false) {
    const level = isEmergency ? 'CRITICAL' : 'ERROR';
    this.log('KEEPALIVE', level, message);
  }

  // Get formatted health report
  getHealthReport() {
    const summary = this.getLogSummary(10);
    const errorCount = (summary.byLevel.ERROR || 0) + (summary.byLevel.CRITICAL || 0);
    const errorRate = errorCount / (summary.total || 1);
    
    let status = 'healthy';
    if (errorRate > 0.3 || summary.byLevel.CRITICAL > 0) status = 'critical';
    else if (errorRate > 0.1) status = 'warning';
    
    const emoji = status === 'healthy' ? '✅' : status === 'warning' ? '⚠️' : '🚨';
    
    let report = `${emoji} SYSTEM HEALTH: ${status.toUpperCase()}`;
    report += ` | Logs (10min): ${summary.total}`;
    if (summary.suppressed > 0) report += `, ${summary.suppressed} suppressed`;
    if (errorCount > 0) report += ` | Errors: ${errorCount}`;
    
    return report;
  }

  getLogSummary(minutes = 5) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentLogs = this.logBuffer.filter(log => new Date(log.timestamp).getTime() > cutoff);

    const byLevel = {};
    const byCategory = {};

    recentLogs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    return {
      total: recentLogs.length,
      byLevel,
      byCategory,
      suppressed: recentLogs.filter(log => log.suppressed).length
    };
  }

  clearRateLimits() {
    this.rateLimitMap.clear();
  }
}

// Create singleton instance
const betterLogger = new BetterLogger();

module.exports = { 
  betterLogger, 
  BetterLogger 
}; 