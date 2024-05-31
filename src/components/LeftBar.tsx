import React from 'react';
import { Button } from 'react-bootstrap';
import { useAtom, useAtomValue } from 'jotai';
import { stateAtoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import { useAnimationFrames } from '../hooks/useAnimationFrames';
import './LeftBar.css';

export function LeftBar(): React.JSX.Element {
  return (
    <div className="LeftBar">
      <CreatureControlGroup />
      <AppearanceControlGroup />
      <AnimationControlGroup />
      <MiscControlGroup />
    </div>
  );
}

function CreatureControlGroup(): React.JSX.Element {
  const [actorType, setActorType] = useAtom(stateAtoms.actorType);
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
    <div className="ControlGroup">
      <div className="ControlGroupTitle">Creature</div>
      <div className="Control">
        <label>Type:</label>
        <select
          value={actorType}
          onChange={(event) => setActorType(Number(event.target.value))}
        >
          {sortedActorDefs.map((actorDef) => (
            <option value={actorDef.type} key={actorDef.type}>
              {actorDef.name}
            </option>
          ))}
        </select>
      </div>
      <div className="Control MoveToActor">
        <Button size="sm" onClick={() => moveToActor('previous')}>
          Prev
        </Button>
        <Button size="sm" onClick={() => moveToActor('next')}>
          Next
        </Button>
      </div>
    </div>
  );
}

function AppearanceControlGroup(): React.JSX.Element {
  const [skinType, setSkinType] = useAtom(stateAtoms.skinType);
  const [showSkeleton, setShowSkeleton] = useAtom(stateAtoms.showSkeleton);

  return (
    <div className="ControlGroup">
      <div className="ControlGroupTitle">Appearance</div>
      <div className="Control">
        <label>Skin:</label>
        <select
          value={skinType ?? ''}
          onChange={(event) => {
            setSkinType((event.target.value || null) as typeof skinType);
          }}
        >
          <option value="">None</option>
          <option value="texture">Texture</option>
          <option value="wireframe">Wireframe</option>
          <option value="vectors">Vectors</option>
          <option value="metal">Metal</option>
          <option value="crystal">Crystal</option>
          <option value="silhouette">Silhouette</option>
        </select>
      </div>
      <div className="Control">
        <label>Skeleton:</label>
        <input
          type="checkbox"
          checked={showSkeleton}
          onChange={(event) => setShowSkeleton(event.target.checked)}
        />
      </div>
    </div>
  );
}

function AnimationControlGroup(): React.JSX.Element {
  const actorType = useAtomValue(stateAtoms.actorType);
  const [animationType, setAnimationType] = useAtom(stateAtoms.animationType);
  const [loopAnimation, setLoopAnimation] = useAtom(stateAtoms.loopAnimation);
  // const animationHandlers = useAtomValue(stateAtoms.animationHandlers);
  useAnimationFrames(true);

  const actorDef = assetCache.actorDefs.get(actorType)!;
  const moveToAnimation = (direction: 'next' | 'previous'): void => {
    const currentIndex =
      actorDef.animationFrames.findIndex(
        (animationFrame) => animationFrame.type === animationType
      ) + 1;

    let newIndex = currentIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) {
      newIndex = actorDef.animationFrames.length;
    } else if (newIndex > actorDef.animationFrames.length) {
      newIndex = 0;
    }

    setAnimationType(
      newIndex > 0 ? actorDef.animationFrames[newIndex - 1].type : null
    );
  };

  return (
    <div className="ControlGroup">
      <div className="ControlGroupTitle">Animation</div>
      <div className="Control">
        <label>Type:</label>
        <select
          value={animationType ?? ''}
          onChange={(event) => setAnimationType(event.target.value || null)}
        >
          <option value="">None</option>
          {actorDef.animationFrames.map((animationFrame) => (
            <option value={animationFrame.type} key={animationFrame.type}>
              {animationFrame.type.replace(/^CAL_/, '')}
            </option>
          ))}
        </select>
      </div>
      <div className="Control MoveToAnimation">
        <button onClick={() => moveToAnimation('previous')}>Prev</button>
        <button onClick={() => moveToAnimation('next')}>Next</button>
      </div>
      {animationType && (
        <>
          <div className="Control">
            <label>Playback:</label>
            <input
              type="range"
              // value={Math.round(animationHandlers!.getAnimationTime())}
              onChange={(event) => {
                // animationHandlers!.setAnimationTime(Number(event.target.value));
              }}
            />
            <button
            // onClick={() => animationHandlers!.playAnimation()}
            // disabled={animationHandlers!.isAnimationPlaying()}
            >
              Pause
            </button>
          </div>
          <div className="Control">
            <label>Loop:</label>
            <input
              type="checkbox"
              checked={loopAnimation}
              onChange={(event) => setLoopAnimation(event.target.checked)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function MiscControlGroup(): React.JSX.Element {
  const [showGround, setShowGround] = useAtom(stateAtoms.showGround);
  const [showStats, setShowStats] = useAtom(stateAtoms.showStats);
  const [autoRotate, setAutoRotate] = useAtom(stateAtoms.autoRotate);

  return (
    <div className="ControlGroup">
      <div className="ControlGroupTitle">Miscellaneous</div>
      <div className="Control">
        <label>Ground:</label>
        <input
          type="checkbox"
          checked={showGround}
          onChange={(event) => setShowGround(event.target.checked)}
        />
      </div>
      <div className="Control">
        <label>Auto rotate:</label>
        <input
          type="checkbox"
          checked={autoRotate}
          onChange={(event) => setAutoRotate(event.target.checked)}
        />
      </div>
      <div className="Control">
        <label>Stats:</label>
        <input
          type="checkbox"
          checked={showStats}
          onChange={(event) => setShowStats(event.target.checked)}
        />
      </div>
    </div>
  );
}
