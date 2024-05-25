import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { atoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import './BottomBar.css';

export function BottomBar(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);

  return <div className="BottomBar">TODO</div>;
}
