import React, { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { atoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import './Loading.css';

export function Loading(): React.JSX.Element {
  const [loadingMessage, isError] = useLoadingMessage();

  return (
    <div className="Loading">
      <div className={`Message ${isError ? 'Error' : ''}`}>
        {loadingMessage}
      </div>
    </div>
  );
}

function useLoadingMessage(): [message: string, isError: boolean] {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isError, setIsError] = useState(false);
  const setIsLoaded = useSetAtom(atoms.isLoaded);

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

      setIsLoaded(true);
    }
  }, []);

  return [loadingMessage, isError];
}
