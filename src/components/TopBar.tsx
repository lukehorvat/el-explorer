import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { atoms } from '../lib/atoms';
import { assetCache } from '../lib/asset-cache';
import './TopBar.css';

export function TopBar(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);
  const [actorType, setActorType] = useAtom(atoms.actorType);

  return (
    <div className="TopBar">
      <div className="Brand">Creatures of EL</div>
      {isLoaded && (
        <select
          className="ActorSelect"
          value={actorType ?? undefined}
          onChange={(event) => {
            setActorType(Number(event.target.value));
          }}
        >
          {[...assetCache.actorDefs.values()]
            .sort((def1, def2) => def1.name.localeCompare(def2.name))
            .map((actorDef) => (
              <option value={actorDef.type} key={actorDef.type}>
                {actorDef.name}
              </option>
            ))}
        </select>
      )}
      <div className="Fork">
        <a href="https://github.com/lukehorvat/el-creatures">GitHub</a>
      </div>
    </div>
  );
}
