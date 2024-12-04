import React from 'react';
import { useQuery } from 'react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { data: stats } = useQuery('stats', () =>
    fetch('/api/stats').then((res) => res.json())
  );

  const { data: activeStories } = useQuery('activeStories', () =>
    fetch('/api/stories/active').then((res) => res.json())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-400">
          System overview and statistics
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-gray-800 px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-400">
            Active Stories
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {stats?.activeStories || 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-gray-800 px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-400">
            Total Characters
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {stats?.totalCharacters || 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-gray-800 px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-400">
            Active Quests
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {stats?.activeQuests || 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-gray-800 px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-400">
            Events Today
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {stats?.eventsToday || 0}
          </dd>
        </div>
      </div>

      {/* Activity chart */}
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white">Story Activity</h3>
          <div className="mt-6" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.activityData || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#F9FAFB',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  fill="#4F46E5"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent stories */}
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white">Recent Stories</h3>
          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                        Title
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Characters
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {(activeStories || []).map((story) => (
                      <tr key={story.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                          {story.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          {story.characterCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          {story.status}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          {new Date(story.lastUpdate).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}