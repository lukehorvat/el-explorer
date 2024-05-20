import React, { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { atoms } from '../lib/atoms';
import { assetCache } from '../lib/asset-cache';
import './Loading.css';

export function Loading(): React.JSX.Element {
  const loadingMessage = useLoadingMessage();

  return (
    <div className="Loading">
      <div className="Message">{loadingMessage}</div>
    </div>
  );
}

function useLoadingMessage(): string {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const setIsLoaded = useSetAtom(atoms.isLoaded);

  useEffect(() => {
    void load();

    async function load(): Promise<void> {
      for await (const message of assetCache.loadAssets()) {
        setLoadingMessage(message);
      }

      setIsLoaded(true);
    }
  }, []);

  return loadingMessage;
}
