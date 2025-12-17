import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser, clearAuthData } from '../utils/auth';
import PortalSidebar from '../components/PortalSidebar';
import PortalTopBar from '../components/PortalTopBar';
import TeamOverview from '../components/portal/TeamOverview';
import Sessions from '../components/portal/Sessions';
import AIMemory from '../components/portal/AIMemory';
import Activity from '../components/portal/Activity';
import Billing from '../components/portal/Billing';

const Portal = () => {
  const [activeView, setActiveView] = useState('overview');
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = getUser();
  const authToken = getToken();

  useEffect(() => {
    if (!authToken || !user) {
      navigate('/login');
      return;
    }

    const fetchTeamData = async () => {
      try {
        setLoading(true);
        // Get team data from URL params or user's default team
        const urlParams = new URLSearchParams(window.location.search);
        const teamId = urlParams.get('teamId') || user.defaultTeamId;

        if (!teamId) {
          throw new Error('No team ID specified');
        }

        const response = await fetch(`/api/team/get?teamId=${teamId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }

        const data = await response.json();
        setTeamData(data.team);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [authToken, user, navigate]);

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <TeamOverview teamData={teamData} />;
      case 'sessions':
        return <Sessions teamId={teamData?.id} />;
      case 'ai-memory':
        return <AIMemory teamId={teamData?.id} />;
      case 'activity':
        return <Activity teamId={teamData?.id} />;
      case 'billing':
        return <Billing teamData={teamData} />;
      default:
        return <TeamOverview teamData={teamData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mermid-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-mermid-600 hover:bg-mermid-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalTopBar
        teamName={teamData?.name}
        user={user}
        onLogout={() => {
          clearAuthData();
          navigate('/');
        }}
      />

      <div className="flex">
        <PortalSidebar
          activeView={activeView}
          onViewChange={setActiveView}
        />

        <main className="flex-1 p-6 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Portal;