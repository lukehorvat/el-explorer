import React from 'react';
import { Stack } from 'react-bootstrap';
import { Provider as StateProvider } from 'jotai';
import { ActorsSidebar } from './Sidebar';
import { ActorsScene } from './Scene';
import './Page.css';

export function ActorsPage(): React.JSX.Element {
  return (
    <StateProvider>
      <Stack
        className="ActorsPage flex-grow-1 align-items-stretch"
        direction="horizontal"
      >
        <ActorsSidebar />
        <ActorsScene />
      </Stack>
    </StateProvider>
  );
}
