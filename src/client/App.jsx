import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout';
import Dashboard from './components/pages/Dashboard';
import Stories from './components/pages/Stories';
import Characters from './components/pages/Characters';
import Quests from './components/pages/Quests';
import WorldState from './components/pages/WorldState';
import Settings from './components/pages/Settings';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stories" element={<Stories />} />
            <Route path="characters" element={<Characters />} />
            <Route path="quests" element={<Quests />} />
            <Route path="world-state" element={<WorldState />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}