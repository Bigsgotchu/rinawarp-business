import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import { FaUsers, FaCalendar, FaUserPlus, FaCrown } from 'react-icons/fa';

const TeamOverview = ({ teamData }) => {
  const [seatsData, setSeatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authToken = getToken();

  useEffect(() => {
    if (!teamData?.id) return;

    const fetchSeatsData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team/seats?teamId=${teamData.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch seats data');
        }

        const data = await response.json();
        setSeatsData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching seats data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatsData();
  }, [teamData?.id, authToken]);

  if (loading) {
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
        Error loading team data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-mermid-600 text-lg" />
              <div>
                <p className="text-sm text-gray-500">Team Name</p>
                <p className="font-medium text-gray-900">{teamData.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaCrown className="text-mermid-600 text-lg" />
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium text-gray-900">{teamData.owner_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaCalendar className="text-mermid-600 text-lg" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(teamData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaUserPlus className="text-mermid-600 text-lg" />
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="font-medium text-gray-900">
                  {seatsData?.usedSeats || 0} active / {seatsData?.maxSeats || 0} total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seats Usage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seat Usage</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Seats</span>
            <span className="font-medium text-gray-900">{seatsData?.maxSeats || 0}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Used Seats</span>
            <span className="font-medium text-gray-900">{seatsData?.usedSeats || 0}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Available Seats</span>
            <span className="font-medium text-gray-900">{seatsData?.availableSeats || 0}</span>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium text-gray-900">
                {seatsData?.maxSeats > 0
                  ? `${Math.round((seatsData.usedSeats / seatsData.maxSeats) * 100)}%`
                  : '0%'}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-mermid-600 h-2.5 rounded-full"
                style={{
                  width: seatsData?.maxSeats > 0
                    ? `${(seatsData.usedSeats / seatsData.maxSeats) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;