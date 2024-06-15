import React, { useEffect, useState } from 'react';
import { Spinner, Stack } from 'react-bootstrap';

/**
 * A loading screen.
 *
 * Iteratively calls the specified `loader` generator function until there's
 * nothing left to load, at which point it calls the `onLoaded` callback.
 */
export function Loading({
  loader,
  onLoaded,
}: {
  loader: () => AsyncGenerator<[message: string, error?: unknown]>;
  onLoaded: () => void;
}): React.JSX.Element {
  const [loadingMessage, isError] = useLoadingMessage(loader, onLoaded);

  return (
    <Stack
      className="Loading justify-content-center align-items-center p-5"
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

function useLoadingMessage(
  loader: () => AsyncGenerator<[message: string, error?: unknown]>,
  onLoaded: () => void
): [message: string, isError: boolean] {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    void (async () => {
      for await (const [message, error] of loader()) {
        setLoadingMessage(message);

        if (error) {
          setIsError(true);
          throw error; // eslint-disable-line @typescript-eslint/no-throw-literal
        }
      }

      onLoaded();
    })();
  }, [loader, onLoaded]);

  return [loadingMessage, isError];
}
