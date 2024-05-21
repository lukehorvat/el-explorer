import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { atoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import './TopBar.css';

export function TopBar(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);
  const [actorType, setActorType] = useAtom(atoms.actorType);
  const sortedActorDefs = [...assetCache.actorDefs.values()].sort(
    (def1, def2) => def1.name.localeCompare(def2.name)
  );
  const moveToActor = (direction: 'next' | 'previous'): void => {
    const currentIndex = sortedActorDefs.findIndex(
      (actorDef) => actorDef.type === actorType
    );

    let newIndex = currentIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) {
      newIndex = sortedActorDefs.length - 1;
    } else if (newIndex >= sortedActorDefs.length) {
      newIndex = 0;
    }

    setActorType(sortedActorDefs[newIndex].type);
  };

  return (
    <div className="TopBar">
      <div className="Brand">Creatures of EL</div>
      {isLoaded && (
        <div>
          <button
            className="PreviousButton"
            onClick={() => {
              moveToActor('previous');
            }}
          >
            Prev
          </button>
          <select
            className="ActorSelect"
            value={actorType}
            onChange={(event) => {
              setActorType(Number(event.target.value));
            }}
          >
            {sortedActorDefs.map((actorDef) => (
              <option value={actorDef.type} key={actorDef.type}>
                {actorDef.name}
              </option>
            ))}
          </select>
          <button
            className="NextButton"
            onClick={() => {
              moveToActor('next');
            }}
          >
            Next
          </button>
        </div>
      )}
      <div className="Fork">
        <a href="https://github.com/lukehorvat/el-creatures">GitHub</a>
      </div>
    </div>
  );
}
