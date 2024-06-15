import React, { ReactNode } from 'react';
import { Stack } from 'react-bootstrap';
import { Provider as StateProvider } from 'jotai';
// import { Loading } from './Loading';
import './Page.css';

export function Page({
  sidebar,
  children,
}: {
  sidebar?: React.JSX.Element;
  children?: ReactNode;
}): React.JSX.Element {
  // if (!isLoaded) {
  //   return (
  //     <Loading
  //       load={() => assetCache.loadAssets()}
  //       onLoaded={() => setIsLoaded(true)}
  //     />
  //   );
  // }

  return (
    <StateProvider>
      <Stack
        className="Page flex-grow-1 align-items-stretch"
        direction="horizontal"
      >
        {sidebar}
        <Stack className="PageContent" direction="vertical">
          {children}
        </Stack>
      </Stack>
    </StateProvider>
  );
}
