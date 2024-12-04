import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  MapIcon,
  CogIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Stories', href: '/stories', icon: BookOpenIcon },
  { name: 'Characters', href: '/characters', icon: UsersIcon },
  { name: 'Quests', href: '/quests', icon: FlagIcon },
  { name: 'World State', href: '/world-state', icon: MapIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <Dialog
        as="div"
        className="relative z-50 lg:hidden"
        open={sidebarOpen}
        onClose={setSidebarOpen}
      >
        <div className="fixed inset-0 bg-gray-900/80" />
        <Dialog.Panel className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-800">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="KoboldAI-OpenCog"
              />
              <span className="ml-3 text-xl font-bold text-white">StorySpace</span>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  location.pathname === item.href
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
                )}
              >
                <item.icon
                  className={clsx(
                    location.pathname === item.href
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white',
                    'mr-3 h-6 w-6 flex-shrink-0'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </Dialog.Panel>
      </Dialog>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="KoboldAI-OpenCog"
              />
              <span className="ml-3 text-xl font-bold text-white">StorySpace</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  location.pathname === item.href
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
                )}
              >
                <item.icon
                  className={clsx(
                    location.pathname === item.href
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white',
                    'mr-3 h-6 w-6 flex-shrink-0'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-700 bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}