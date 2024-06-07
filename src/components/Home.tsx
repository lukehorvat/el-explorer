import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { ExtractAtomValue, useSetAtom } from 'jotai';
import { stateAtoms } from '../lib/state';
import './Home.css';

export function Home(): React.JSX.Element {
  const setPage = useSetAtom(stateAtoms.page);
  const pages: {
    route: ExtractAtomValue<typeof stateAtoms.page>;
    name: string;
    enabled: boolean;
  }[] = [
    {
      route: 'actors',
      name: 'Actors',
      enabled: true,
    },
    {
      route: 'maps',
      name: 'Maps',
      enabled: false,
    },
    {
      route: 'object3ds',
      name: '3D Objects',
      enabled: false,
    },
    {
      route: 'object2ds',
      name: '2D Objects',
      enabled: false,
    },
  ];

  return (
    <Stack
      className="Home justify-content-center align-items-center"
      direction="vertical"
      gap={5}
    >
      {pages.map((page) => (
        <Button
          onClick={() => setPage(page.route)}
          disabled={!page.enabled}
          key={page.route}
        >
          {page.name}
        </Button>
      ))}
    </Stack>
  );
}
