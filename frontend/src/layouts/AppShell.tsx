import React from 'react';
import { Outlet } from 'react-router-dom';
import { FlowHeader } from '../components/FlowHeader';

export const AppShell: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <FlowHeader />
      <main
        style={{
          flex: 1,
          display: 'flex',
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};
