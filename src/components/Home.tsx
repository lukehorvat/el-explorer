import React from 'react';
import { Button, OverlayTrigger, Stack, Tooltip } from 'react-bootstrap';
import { ExtractAtomValue, useSetAtom } from 'jotai';
import { stateAtoms } from '../lib/state';
import './Home.css';

export function Home(): React.JSX.Element {
  const setPage = useSetAtom(stateAtoms.page);
  const pages: {
    id: ExtractAtomValue<typeof stateAtoms.page>;
    name: string;
    enabled: boolean;
  }[] = [
    {
      id: 'actors',
      name: 'Actors',
      enabled: true,
    },
    {
      id: 'maps',
      name: 'Maps',
      enabled: false,
    },
    {
      id: 'object3ds',
      name: '3D Objects',
      enabled: false,
    },
    {
      id: 'object2ds',
      name: '2D Objects',
      enabled: false,
    },
  ];

  return (
    <Stack
      className="Home justify-content-center align-items-center p-5"
      direction="vertical"
      gap={5}
    >
      {pages
        .map<[page: (typeof pages)[0], button: React.JSX.Element]>((page) => [
          page,
          <Button
            size="lg"
            onClick={() => page.enabled && setPage(page.id)}
            key={page.id}
          >
            {page.name}
          </Button>,
        ])
        .map(([page, button]) =>
          page.enabled ? (
            button
          ) : (
            <OverlayTrigger
              overlay={<Tooltip>Coming soon!</Tooltip>}
              placement="right"
              key={page.id}
            >
              {button}
            </OverlayTrigger>
          )
        )}
    </Stack>
  );
}
