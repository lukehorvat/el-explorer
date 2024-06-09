import React from 'react';
import { Stack } from 'react-bootstrap';
import { Provider as StateProvider } from 'jotai';
import { ActorsSidebar } from './ActorsSidebar';
import { ActorsScene } from './ActorsScene';
import './Actors.css';

export function Actors(): React.JSX.Element {
  return (
    <StateProvider>
      <Stack
        className="Actors flex-grow-1 align-items-stretch"
        direction="horizontal"
      >
        <ActorsSidebar />
        <ActorsScene />
      </Stack>
    </StateProvider>
  );
}
