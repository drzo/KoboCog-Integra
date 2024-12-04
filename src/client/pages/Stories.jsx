import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';

export default function Stories() {
  const [newStory, setNewStory] = useState({ title: '', setting: '' });
  const queryClient = useQueryClient();

  const { data: stories } = useQuery('stories', () =>
    fetch('/api/stories').then((res) => res.json())
  );

  const createStory = useMutation(
    (story) =>
      fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story),
      }).then((res) => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stories');
        setNewStory({ title: '', setting: '' });
      },
    }
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Stories</h2>
        <p className="mt-1 text-sm text-gray-400">
          Create and manage your narratives
        </p>
      </div>

      {/* Create new story */}
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white">Create New Story</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createStory.mutate(newStory);
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newStory.title}
                onChange={(e) =>
                  setNewStory({ ...newStory, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="setting"
                className="block text-sm font-medium text-gray-300"
              >
                Setting
              </label>
              <textarea
                id="setting"
                value={newStory.setting}
                onChange={(e) =>
                  setNewStory({ ...newStory, setting: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Story
            </button>
          </form>
        </div>
      </div>

      {/* Story list */}
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white">Your Stories</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(stories || []).map((story) => (
              <div
                key={story.id}
                className="relative flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-700"
              >
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-white">
                    {story.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-gray-300">
                    {story.setting}
                  </p>
                  <div className="mt-6 flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">
                        {story.characterCount} characters
                      </p>
                      <p className="text-sm text-gray-400">
                        {story.eventCount} events
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        story.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {story.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}