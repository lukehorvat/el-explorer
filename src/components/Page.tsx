import React, { ReactNode, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { Provider as StateProvider } from 'jotai';
import { Loading } from './Loading';
import './Page.css';

export function Page({
  className,
  sidebar,
  loader,
  children,
}: {
  className?: string;
  sidebar?: React.JSX.Element;
  loader?: () => AsyncGenerator<[message: string, error?: unknown]>;
  children?: ReactNode;
}): React.JSX.Element {
  const [isLoaded, setIsLoaded] = useState(!loader);

  return (
    <StateProvider>
      <Stack
        className={`Page ${className ?? ''} flex-grow-1 align-items-stretch`}
        direction="horizontal"
      >
        {isLoaded && sidebar}
        <Stack className="PageContent" direction="vertical">
          {isLoaded ? (
            children
          ) : (
            <Loading loader={loader!} onLoaded={() => setIsLoaded(true)} />
          )}
        </Stack>
      </Stack>
    </StateProvider>
  );
}
