import React from 'react';
import { Stack } from 'react-bootstrap';
import { useSetAtom } from 'jotai';
import { AppState, pages } from '../../app-state';
import { Page } from '../../components/Page';
import './Page.css';

export function HomePage(): React.JSX.Element {
  const setPage = useSetAtom(AppState.page);

  return (
    <Page className="HomePage">
      <Stack
        className="PageList justify-content-center align-self-center p-5"
        direction="vertical"
        gap={5}
      >
        {(Object.keys(pages) as (keyof typeof pages)[])
          .filter((page) => page !== 'home')
          .map((page) => (
            <button // See: https://github.com/pmndrs/drei/issues/1193
              className="btn btn-primary btn-lg"
              onClick={() => setPage(page)}
              key={page}
            >
              {pages[page].name}
            </button>
          ))}
      </Stack>
    </Page>
  );
}
