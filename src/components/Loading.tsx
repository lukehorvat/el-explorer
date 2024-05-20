import React, { useEffect, useState } from 'react';
import { assetCache } from '../lib/asset-cache';
import './Loading.css';

export function Loading(props: { onLoaded: () => void }): React.JSX.Element {
  const loadingMessage = useLoadingMessage(props.onLoaded);

  return (
    <div className="Loading">
      <div className="Message">{loadingMessage}</div>
    </div>
  );
}

function useLoadingMessage(onLoaded: () => void): string {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  useEffect(() => {
    void load().then(onLoaded);

    async function load(): Promise<void> {
      for await (const message of assetCache.loadAssets()) {
        setLoadingMessage(message);
      }
    }
  }, []);

  return loadingMessage;
}
