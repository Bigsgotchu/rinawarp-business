function handleStatus(res) {
  const status = {
    build: process.env.RINAWARP_DEV_BUILD ? 'dev' : 'stable',
    license: 'active',
    profile: process.env.RINAWARP_PROFILE || 'daily',
    uptime: formatUptime(process.uptime()),
    ready: true
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(status));
}

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m${secs}s`;
  } else {
    return `${secs}s`;
  }
}

module.exports = {
  handleStatus
};