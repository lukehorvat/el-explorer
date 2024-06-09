import React from 'react';
import { OverlayTrigger, Stack, Tooltip } from 'react-bootstrap';
import { ExtractAtomValue, useSetAtom } from 'jotai';
import { appState } from '../app-state';
import './Home.css';

export function Home(): React.JSX.Element {
  const setPage = useSetAtom(appState.page);
  const pages: {
    id: ExtractAtomValue<typeof appState.page>;
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
          <button // See: https://github.com/pmndrs/drei/issues/1193
            className="btn btn-primary btn-lg"
            onClick={() => page.enabled && setPage(page.id)}
            key={page.id}
          >
            {page.name}
          </button>,
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
