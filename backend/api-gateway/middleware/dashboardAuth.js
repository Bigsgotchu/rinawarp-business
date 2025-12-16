export function dashboardAuth(req, res, next) {
  const token = req.header('X-Dashboard-Token');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (token !== process.env.DASHBOARD_TOKEN) {
    return res.status(403).json({ error: 'Authentication failed' });
  }

  return next();
}
