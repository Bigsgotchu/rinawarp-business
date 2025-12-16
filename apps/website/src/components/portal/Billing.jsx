import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import { FaCreditCard, FaPlus, FaUsers, FaCheckCircle } from 'react-icons/fa';

const Billing = ({ teamData }) => {
  const [seatsData, setSeatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSeatsForm, setShowAddSeatsForm] = useState(false);
  const [seatsToAdd, setSeatsToAdd] = useState(1);

  const authToken = getToken();

  useEffect(() => {
    if (!teamData?.id) return;

    const fetchSeatsData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team/seats?teamId=${teamData.id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
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

  const handleAddSeats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          teamId: teamData.id,
          seats: seatsToAdd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create billing session');
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      }

      // Refresh seats data
      const seatsResponse = await fetch(`/api/team/seats?teamId=${teamData.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (seatsResponse.ok) {
        const seatsData = await seatsResponse.json();
        setSeatsData(seatsData);
      }

      setShowAddSeatsForm(false);
      setSeatsToAdd(1);
    } catch (err) {
      setError(err.message);
      console.error('Error adding seats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !seatsData) {
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
        Error loading billing data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Team Name</span>
            <span className="font-medium text-gray-900">{teamData?.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Seats</span>
            <span className="font-medium text-gray-900">
              {seatsData?.usedSeats || 0} of {seatsData?.maxSeats || 0} used
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Available Seats</span>
            <span className="font-medium text-gray-900">{seatsData?.availableSeats || 0}</span>
          </div>
        </div>
      </div>

      {/* Add Seats Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add More Seats</h3>

        {showAddSeatsForm ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSeatsToAdd(Math.max(1, seatsToAdd - 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={seatsToAdd <= 1}
              >
                -
              </button>

              <span className="text-xl font-medium">{seatsToAdd}</span>

              <button
                onClick={() => setSeatsToAdd(seatsToAdd + 1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <p>Price: ${(seatsToAdd * 19.99).toFixed(2)}</p>
              <p className="text-xs text-gray-500">$19.99 per seat</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddSeats}
                disabled={loading}
                className="flex-1 bg-mermid-600 hover:bg-mermid-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Checkout with Stripe'}
              </button>

              <button
                onClick={() => setShowAddSeatsForm(false)}
                disabled={loading}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-mermid-50 border border-mermid-200 rounded-lg p-4">
              <FaCheckCircle className="text-mermid-600 text-xl" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Add seats to your team</p>
                <p className="text-sm text-gray-600">Increase your team capacity instantly</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddSeatsForm(true)}
              className="w-full bg-mermid-600 hover:bg-mermid-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <FaPlus className="inline mr-2" />
              Add Seats
            </button>
          </div>
        )}
      </div>

      {/* Billing History (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
        <p className="text-gray-600">No billing history available yet.</p>
      </div>
    </div>
  );
};

export default Billing;
