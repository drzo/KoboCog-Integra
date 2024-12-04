import React from 'react';
import { useQuery } from 'react-query';

export default function WorldState() {
  const { data: worldState } = useQuery('worldState', () =>
    fetch('/api/world-state').then((res) => res.json())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">World State</h2>
        <p className="mt-1 text-sm text-gray-400">
          Monitor and manage the current state of the story world
        </p>
      </div>

      {/* World state overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Locations */}
        <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-white">Locations</h3>
            <div className="mt-4 space-y-4">
              {(worldState?.locations || []).map((location) => (
                <div
                  key={location.id}
                  className="rounded-md border border-gray-700 p-4"
                >
                  <h4 className="text-sm font-medium text-white">
                    {location.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-400">
                    {location.description}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                      {location.characters.length} characters present
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-white">Items</h3>
            <div className="mt-4">
              <ul className="space-y-3">
                {(worldState?.items || []).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-gray-700 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-400">{item.location}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-white">Recent Events</h3>
            <div className="mt-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {(worldState?.events || []).map((event, eventIdx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== worldState.events.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                              <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            <div>
                              <p className="text-sm text-white">
                                {event.description}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-400">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}