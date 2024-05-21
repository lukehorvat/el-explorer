import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { atoms } from '../lib/atoms';
import { assetCache } from '../lib/asset-cache';
import './BottomBar.css';

export function BottomBar(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);
  const actorType = useAtomValue(atoms.actorType);
  const actorDef = assetCache.actorDefs.get(actorType);
  const [actorAnimation, setActorAnimation] = useAtom(atoms.actorAnimation);

  return (
    <div className="BottomBar">
      {isLoaded && (
        <div>
          <label>Animation:</label>
          <select
            className="AnimationSelect"
            value={actorAnimation ?? ''}
            onChange={(event) => {
              setActorAnimation(event.target.value || null);
            }}
          >
            <option value="">None</option>
            {actorDef!.animationFrames.map((frame) => (
              <option value={frame.type} key={frame.type}>
                {frame.type.replace(/^CAL_/, '')}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
