import React from 'react';
import { OverlayTrigger, Stack, Tooltip } from 'react-bootstrap';
import { useSetAtom } from 'jotai';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { AppState, pages } from '../../app-state';
import { Page } from '../../components/Page';
import './Page.css';

export function HomePage(): React.JSX.Element {
  const setPage = useSetAtom(AppState.page);

  return (
    <Page className="HomePage" loader={checkWebGLSupport}>
      <Stack
        className="PageList justify-content-center align-self-center p-5"
        direction="vertical"
        gap={5}
      >
        {(Object.keys(pages) as (keyof typeof pages)[])
          .filter((page) => page !== 'home')
          .map<[page: keyof typeof pages, button: React.JSX.Element]>(
            (page) => [
              page,
              <button // See: https://github.com/pmndrs/drei/issues/1193
                className="btn btn-primary btn-lg"
                onClick={() => pages[page].enabled && setPage(page)}
                key={page}
              >
                {pages[page].name}
              </button>,
            ]
          )
          .map(([page, button]) =>
            pages[page].enabled ? (
              button
            ) : (
              <OverlayTrigger
                overlay={<Tooltip>Coming soon!</Tooltip>}
                placement="right"
                key={page}
              >
                {button}
              </OverlayTrigger>
            )
          )}
      </Stack>
    </Page>
  );
}

function* checkWebGLSupport(): Generator<[message: string, error?: unknown]> {
  if (!WebGL.isWebGLAvailable()) {
    yield [
      'Your browser does not support WebGL.',
      new Error('WebGL not supported.'),
    ];
  }
}
