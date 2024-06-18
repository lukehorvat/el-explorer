import React, { useEffect, useState } from 'react';
import { Spinner, Stack } from 'react-bootstrap';

/**
 * A loading screen component.
 */
export function Loading({
  loader,
  onLoaded,
}: {
  loader: () => Promise<void>;
  onLoaded: () => void;
}): React.JSX.Element {
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void loader()
      .then(() => {
        if (isMounted) onLoaded();
      })
      .catch((error: unknown) => {
        if (isMounted) setIsError(true);
        throw error;
      });

    return () => {
      // In case the component is unmounted while load is still in progress...
      isMounted = false;
    };
  }, [loader, onLoaded]);

  return (
    <Stack
      className="Loading justify-content-center align-items-center p-5"
      direction="vertical"
      gap={4}
    >
      {!isError && <Spinner animation="border" />}
      <span className={isError ? 'text-danger-emphasis' : 'fst-italic'}>
        {isError ? 'Loading failed!' : 'Loading...'}
      </span>
    </Stack>
  );
}
