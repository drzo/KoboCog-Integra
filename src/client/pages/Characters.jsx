import React from 'react';
import { useQuery } from 'react-query';

export default function Characters() {
  const { data: characters } = useQuery('characters', () =>
    fetch('/api/characters').then((res) => res.json())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Characters</h2>
        <p className="mt-1 text-sm text-gray-400">
          Manage characters and their relationships
        </p>
      </div>

      {/* Character list */}
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white">Character Network</h3>
          <div className="mt-6">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                          Name
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Role
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Status
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Relationships
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {(characters || []).map((character) => (
                        <tr key={character.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            {character.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {character.role}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                character.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {character.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {character.relationshipCount}
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
    </div>
  );
}