import React from 'react';
import { Stack } from 'react-bootstrap';
import { LeftBar } from './LeftBar';
import { Scene } from './Scene';
import './Actors.css';

export function Actors(): React.JSX.Element {
  return (
    <Stack
      className="Actors flex-grow-1 align-items-stretch"
      direction="horizontal"
    >
      <LeftBar />
      <Scene />
    </Stack>
  );
}
