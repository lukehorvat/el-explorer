import React from 'react';
import { OverlayTrigger, Stack, Tooltip } from 'react-bootstrap';
import { ExtractAtomValue, useSetAtom } from 'jotai';
import { AppState } from '../../app-state';
import { Page } from '../../components/Page';
import './Page.css';

export function HomePage(): React.JSX.Element {
  const setPage = useSetAtom(AppState.page);
  const pages: {
    id: ExtractAtomValue<typeof AppState.page>;
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
    <Page className="HomePage">
      <Stack
        className="PageList justify-content-center align-self-center p-5"
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
    </Page>
  );
}
