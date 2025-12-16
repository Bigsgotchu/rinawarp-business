import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import {
  FaClock,
  FaUser,
  FaTerminal,
  FaCreditCard,
  FaBrain,
  FaFilter,
  FaSearch,
} from 'react-icons/fa';

const Activity = ({ teamId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const authToken = getToken();

  useEffect(() => {
    if (!teamId) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team/activity?teamId=${teamId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();
        setActivities(data.activities || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [teamId, authToken]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'command':
        return <FaTerminal className="text-mermid-600" />;
      case 'session':
        return <FaTerminal className="text-blue-600" />;
      case 'billing':
        return <FaCreditCard className="text-green-600" />;
      case 'ai_memory':
        return <FaBrain className="text-purple-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'command':
        return 'border-mermid-200 bg-mermid-50';
      case 'session':
        return 'border-blue-200 bg-blue-50';
      case 'billing':
        return 'border-green-200 bg-green-50';
      case 'ai_memory':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredActivities = activities.filter((activity) => {
    // Filter by time range
    const activityDate = new Date(activity.created_at);
    const now = new Date();

    let timeFilterPassed = true;
    switch (timeRange) {
      case '24h':
        timeFilterPassed = now - activityDate <= 24 * 60 * 60 * 1000;
        break;
      case '7days':
        timeFilterPassed = now - activityDate <= 7 * 24 * 60 * 60 * 1000;
        break;
      case '30days':
        timeFilterPassed = now - activityDate <= 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeFilterPassed = true;
    }

    // Filter by activity type
    const typeFilterPassed = activityTypeFilter === 'all' || activity.type === activityTypeFilter;

    // Filter by search query
    const searchFilterPassed =
      searchQuery === '' ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.user_name && activity.user_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return timeFilterPassed && typeFilterPassed && searchFilterPassed;
  });

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading activities: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Activity Timeline</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mermid-500 focus:border-mermid-500 appearance-none"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <FaClock className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mermid-500 focus:border-mermid-500 appearance-none"
            >
              <option value="all">All Activities</option>
              <option value="command">Commands</option>
              <option value="session">Sessions</option>
              <option value="billing">Billing</option>
              <option value="ai_memory">AI Memory</option>
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mermid-500 focus:border-mermid-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-mermid-50 border border-mermid-200 rounded-lg p-4 text-center">
            <p className="text-sm text-mermid-600 font-medium">Active Members</p>
            <p className="text-2xl font-bold text-mermid-800 mt-1">
              {activities.length > 0 ? new Set(activities.map((a) => a.user_id)).size : 0}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Commands Run</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {activities.filter((a) => a.type === 'command').length}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Sessions</p>
            <p className="text-2xl font-bold text-green-800 mt-1">
              {activities.filter((a) => a.type === 'session').length}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-600 font-medium">AI Memories</p>
            <p className="text-2xl font-bold text-purple-800 mt-1">
              {activities.filter((a) => a.type === 'ai_memory').length}
            </p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`border-l-4 ${getActivityColor(activity.type)} pl-4`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-500">
                        {formatTime(activity.created_at)}
                      </span>
                      {activity.user_name && (
                        <span className="text-sm font-medium text-gray-900">
                          {activity.user_name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800">{activity.description}</p>
                    {activity.details && (
                      <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaClock className="mx-auto text-4xl text-mermid-300 mb-4" />
              <p>No activities found for this time period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
