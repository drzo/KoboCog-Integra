import React from 'react';
import { useQuery, useMutation } from 'react-query';

export default function Settings() {
  const { data: settings } = useQuery('settings', () =>
    fetch('/api/settings').then((res) => res.json())
  );

  const updateSettings = useMutation((newSettings) =>
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="mt-1 text-sm text-gray-400">
          Configure system settings and preferences
        </p>
      </div>

      {/* Settings form */}
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white">General Settings</h3>
          <form className="mt-6 space-y-6">
            {/* KoboldAI Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-400">
                KoboldAI Configuration
              </h4>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="apiUrl"
                    className="block text-sm font-medium text-gray-300"
                  >
                    API URL
                  </label>
                  <input
                    type="text"
                    id="apiUrl"
                    defaultValue={settings?.koboldAI?.apiUrl}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Model
                  </label>
                  <select
                    id="model"
                    defaultValue={settings?.koboldAI?.model}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option>GPT-Neo</option>
                    <option>GPT-J</option>
                    <option>BLOOM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* OpenCog Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-400">
                OpenCog Configuration
              </h4>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="atomSpaceUrl"
                    className="block text-sm font-medium text-gray-300"
                  >
                    AtomSpace URL
                  </label>
                  <input
                    type="text"
                    id="atomSpaceUrl"
                    defaultValue={settings?.openCog?.atomSpaceUrl}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-400">
                System Settings
              </h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="autoSave"
                    type="checkbox"
                    defaultChecked={settings?.system?.autoSave}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="autoSave"
                    className="ml-3 text-sm font-medium text-gray-300"
                  >
                    Enable auto-save
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="debug"
                    type="checkbox"
                    defaultChecked={settings?.system?.debug}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="debug"
                    className="ml-3 text-sm font-medium text-gray-300"
                  >
                    Enable debug mode
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounde d-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}