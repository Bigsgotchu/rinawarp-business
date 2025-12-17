import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import { FaTerminal, FaUser, FaClock, FaPlay, FaUsers, FaSearch } from 'react-icons/fa';

const Sessions = ({ teamId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const authToken = getToken();

  useEffect(() => {
    if (!teamId) return;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team/list-sessions?teamId=${teamId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data = await response.json();
        setSessions(data.sessions || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [teamId, authToken]);

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.host.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && sessions.length === 0) {
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
        Error loading sessions: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shared Terminal Sessions</h2>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mermid-500 focus:border-mermid-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaTerminal className="text-mermid-600 mr-2" />
                        <span className="font-medium text-gray-900">{session.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <span className="text-gray-700">{session.host_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaClock className="text-gray-400 mr-2" />
                        <span className="text-gray-700">{formatTime(session.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUsers className="text-gray-400 mr-2" />
                        <span className="text-gray-700">{session.participants_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={async () => {
                          setSelectedSession(session);
                          // Fetch detailed session data
                          try {
                            const response = await fetch(`/api/team/session-details?sessionId=${session.id}`, {
                              headers: {
                                'Authorization': `Bearer ${authToken}`
                              }
                            });
  
                            if (response.ok) {
                              const data = await response.json();
                              setSelectedSession({ ...session, ...data.session, participants: data.participants, events: data.events });
                            }
                          } catch (err) {
                            console.error('Error fetching session details:', err);
                          }
                        }}
                        className="text-mermid-600 hover:text-mermid-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No sessions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Panel */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaTerminal className="text-mermid-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Session Name</p>
                  <p className="font-medium text-gray-900">{selectedSession.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaUser className="text-mermid-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Host</p>
                  <p className="font-medium text-gray-900">{selectedSession.host_name || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaClock className="text-mermid-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Started</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(selectedSession.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaUsers className="text-mermid-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium text-gray-900">{selectedSession.participants_count || 0}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Session Timeline</h4>
                <div className="space-y-3">
                  {selectedSession.events && selectedSession.events.length > 0 ? (
                    selectedSession.events.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-mermid-600 rounded-full mt-1"></div>
                        <div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(event.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-mermid-600 rounded-full mt-1"></div>
                      <div>
                        <p className="text-sm text-gray-600">Session started by {selectedSession.host_name}</p>
                        <p className="text-xs text-gray-500">
                          {formatTime(selectedSession.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>

                <button className="flex-1 bg-mermid-600 hover:bg-mermid-700 text-white py-2 px-4 rounded-lg transition-colors">
                  <FaPlay className="inline mr-2" />
                  Open in Terminal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;