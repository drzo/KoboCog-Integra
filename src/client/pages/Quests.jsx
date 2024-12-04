import React from 'react';
import { useQuery } from 'react-query';

export default function Quests() {
  const { data: quests } = useQuery('quests', () =>
    fetch('/api/quests').then((res) => res.json())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Quests</h2>
        <p className="mt-1 text-sm text-gray-400">
          Track and manage story quests and objectives
        </p>
      </div>

      {/* Quest board */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(quests || []).map((quest) => (
          <div
            key={quest.id}
            className="overflow-hidden rounded-lg bg-gray-800 shadow"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">
                    {quest.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {quest.description}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    quest.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : quest.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {quest.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-400">
                        Progress
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400">
                        {quest.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-gray-700">
                    <div
                      className="h-2 rounded bg-indigo-500"
                      style={{ width: `${quest.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-400">Objectives</h4>
                <ul className="mt-2 space-y-2">
                  {quest.objectives.map((objective) => (
                    <li
                      key={objective.id}
                      className="flex items-center text-sm text-gray-300"
                    >
                      <span
                        className={`mr-2 h-2 w-2 rounded-full ${
                          objective.completed
                            ? 'bg-green-400'
                            : 'bg-gray-600'
                        }`}
                      />
                      {objective.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}