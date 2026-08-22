import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi, userApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

const NEXT_STATUS = {
  Assigned: 'Picked Up',
  'Picked Up': 'In Transit',
  'In Transit': 'Out for Delivery',
  'Out for Delivery': 'Delivered',
};

export default function AgentDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [failReason, setFailReason] = useState('');

  const loadOrders = async () => {
    const res = await orderApi.list({});
    setOrders(res.data.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await orderApi.updateStatus(order._id, next);
      toast.success(`Marked as ${next}`);
      loadOrders();
      if (selected?._id === order._id) {
        const res = await orderApi.getById(order._id);
        setSelected(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const markFailed = async (order) => {
    try {
      await orderApi.updateStatus(order._id, 'Failed', failReason || 'Customer unavailable');
      toast.success('Marked as failed');
      setFailReason('');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const toggleAvailability = async () => {
    try {
      await userApi.updateAgentProfile(user.id, { isAvailable: !isAvailable });
      setIsAvailable((v) => !v);
      toast.success(`You are now ${!isAvailable ? 'Available' : 'Unavailable'}`);
    } catch (err) {
      toast.error('Could not update availability');
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported in this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await userApi.updateAgentProfile(user.id, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        toast.success('Location updated');
      } catch {
        toast.error('Could not update location');
      }
    });
  };

  const active = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));
  const past = orders.filter((o) => ['Delivered', 'Cancelled'].includes(o.status));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 bg-white border rounded-lg p-4">
        <div>
          <p className="text-sm text-gray-500">Availability status</p>
          <p className="font-semibold">{isAvailable ? '🟢 Available' : '🔴 Unavailable'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={shareLocation} className="text-sm border px-3 py-1.5 rounded-md">
            Update My Location
          </button>
          <button
            onClick={toggleAvailability}
            className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded-md"
          >
            Toggle Availability
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2 text-sm text-gray-600">Active Deliveries ({active.length})</h3>
          <div className="space-y-3">
            {active.map((o) => (
              <div key={o._id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="font-semibold text-sm cursor-pointer hover:text-brand-600"
                    onClick={() => setSelected(o)}
                  >
                    {o.orderNumber}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {o.pickupAddress.city} → {o.dropAddress.city} · {o.paymentType}
                  {o.paymentType === 'COD' ? ` (₹${o.codAmount})` : ''}
                </p>
                <div className="flex gap-2">
                  {NEXT_STATUS[o.status] && (
                    <button
                      onClick={() => advance(o)}
                      className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-md"
                    >
                      Mark {NEXT_STATUS[o.status]}
                    </button>
                  )}
                  {['Picked Up', 'In Transit', 'Out for Delivery'].includes(o.status) && (
                    <button
                      onClick={() => markFailed(o)}
                      className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-md"
                    >
                      Mark Failed
                    </button>
                  )}
                </div>
              </div>
            ))}
            {active.length === 0 && <p className="text-sm text-gray-400">No active deliveries.</p>}
          </div>

          <h3 className="font-semibold mt-6 mb-2 text-sm text-gray-600">History ({past.length})</h3>
          <div className="space-y-2">
            {past.map((o) => (
              <div
                key={o._id}
                onClick={() => setSelected(o)}
                className="bg-white border rounded-lg p-3 text-sm cursor-pointer flex justify-between"
              >
                <span>{o.orderNumber}</span>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          {!selected ? (
            <p className="text-gray-400 text-sm">Select an order to view details & timeline.</p>
          ) : (
            <>
              <h3 className="font-bold mb-1">{selected.orderNumber}</h3>
              <p className="text-xs text-gray-500 mb-4">
                {selected.pickupAddress.line1}, {selected.pickupAddress.city} →{' '}
                {selected.dropAddress.line1}, {selected.dropAddress.city}
              </p>
              <OrderTimeline history={selected.trackingHistory} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
