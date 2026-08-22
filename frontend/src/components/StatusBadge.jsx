import React from 'react';

const COLORS = {
  Created: 'bg-gray-100 text-gray-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'Picked Up': 'bg-indigo-100 text-indigo-700',
  'In Transit': 'bg-purple-100 text-purple-700',
  'Out for Delivery': 'bg-amber-100 text-amber-700',
  Delivered: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
  Rescheduled: 'bg-orange-100 text-orange-700',
  Cancelled: 'bg-gray-200 text-gray-600',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
