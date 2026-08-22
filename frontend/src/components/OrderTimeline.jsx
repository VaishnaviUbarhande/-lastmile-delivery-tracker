import React from 'react';
import { format } from 'date-fns';

export default function OrderTimeline({ history = [] }) {
  if (!history.length) {
    return <p className="text-sm text-gray-400">No tracking events yet.</p>;
  }

  const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <ol className="relative border-l border-gray-200 ml-2">
      {sorted.map((event, idx) => (
        <li key={idx} className="mb-6 ml-4">
          <div className="absolute w-2.5 h-2.5 bg-brand-500 rounded-full -left-[5px] border border-white" />
          <time className="mb-1 text-xs font-normal text-gray-400">
            {format(new Date(event.timestamp), 'dd MMM yyyy, h:mm a')}
          </time>
          <h4 className="text-sm font-semibold text-gray-800">{event.status}</h4>
          {event.note && <p className="text-xs text-gray-500">{event.note}</p>}
          {event.actor?.name && (
            <p className="text-xs text-gray-400">
              by {event.actor.name} ({event.actor.role})
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
