import React, { useEffect, useState } from 'react';
import { Spinner, Stack } from 'react-bootstrap';
import { useSetAtom } from 'jotai';
import { stateAtoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';

export function Loading(): React.JSX.Element {
  const [loadingMessage, isError] = useLoadingMessage();

  return (
    <Stack
      className="Loading justify-content-center align-items-center"
      direction="vertical"
      gap={4}
    >
      {!isError && <Spinner animation="border" />}
      <span className={isError ? 'text-danger-emphasis' : 'fst-italic'}>
        {loadingMessage}
      </span>
    </Stack>
  );
}

function useLoadingMessage(): [message: string, isError: boolean] {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isError, setIsError] = useState(false);
  const setPage = useSetAtom(stateAtoms.page);

  useEffect(() => {
    void load();

    async function load(): Promise<void> {
      for await (const [message, error] of assetCache.loadAssets()) {
        setLoadingMessage(message);

        if (error) {
          setIsError(true);
          throw error;
        }
      }

      setPage('actors');
    }
  }, []);

  return [loadingMessage, isError];
}
