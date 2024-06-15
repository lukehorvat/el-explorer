import React, { useEffect, useState } from 'react';
import { Spinner, Stack } from 'react-bootstrap';

/**
 * A loading screen.
 */
export function Loading({
  load,
  onLoaded,
}: {
  load: () => AsyncGenerator<[message: string, error?: unknown]>;
  onLoaded: () => void;
}): React.JSX.Element {
  const [loadingMessage, isError] = useLoadingMessage(load, onLoaded);

  return (
    <Stack
      className="justify-content-center align-items-center p-5"
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
  load: () => AsyncGenerator<[message: string, error?: unknown]>,
  onLoaded: () => void
): [message: string, isError: boolean] {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    void (async () => {
      for await (const [message, error] of load()) {
        setLoadingMessage(message);

        if (error) {
          setIsError(true);
          throw error; // eslint-disable-line @typescript-eslint/no-throw-literal
        }
      }

      onLoaded();
    })();
  }, [load, onLoaded]);

  return [loadingMessage, isError];
}
