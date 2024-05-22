import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { atoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import './BottomBar.css';

export function BottomBar(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);
  const actorType = useAtomValue(atoms.actorType);
  const actorDef = assetCache.actorDefs.get(actorType);
  const [animationType, setAnimationType] = useAtom(atoms.animationType);
  const [loopAnimation, setLoopAnimation] = useAtom(atoms.loopAnimation);
  const [showMesh, setShowMesh] = useAtom(atoms.showMesh);
  const [showWireframe, setShowWireframe] = useAtom(atoms.showWireframe);
  const [showSkeleton, setShowSkeleton] = useAtom(atoms.showSkeleton);
  const [showGround, setShowGround] = useAtom(atoms.showGround);
  const [showStats, setShowStats] = useAtom(atoms.showStats);
  const [autoRotate, setAutoRotate] = useAtom(atoms.autoRotate);

  return (
    <div className="BottomBar">
      {isLoaded && (
        <>
          <div>
            <label>Animation type:</label>
            <select
              className="AnimationSelect"
              value={animationType ?? ''}
              onChange={(event) => {
                setAnimationType(event.target.value || null);
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
          <div>
            <label>Loop animation:</label>
            <input
              type="checkbox"
              checked={loopAnimation}
              onChange={(event) => {
                setLoopAnimation(event.target.checked);
              }}
              disabled={!animationType}
            />
          </div>
          <div>
            <label>Mesh:</label>
            <input
              type="checkbox"
              checked={showMesh}
              onChange={(event) => {
                const { checked } = event.target;
                setShowMesh(checked);

                if (!checked) {
                  setShowWireframe(false);
                }
              }}
            />
          </div>
          <div>
            <label>Wireframe:</label>
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(event) => {
                const { checked } = event.target;
                setShowWireframe(checked);

                if (checked) {
                  setShowMesh(true);
                }
              }}
            />
          </div>
          <div>
            <label>Skeleton:</label>
            <input
              type="checkbox"
              checked={showSkeleton}
              onChange={(event) => {
                setShowSkeleton(event.target.checked);
              }}
            />
          </div>
          <div>
            <label>Ground:</label>
            <input
              type="checkbox"
              checked={showGround}
              onChange={(event) => {
                setShowGround(event.target.checked);
              }}
            />
          </div>
          <div>
            <label>Auto rotate:</label>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(event) => {
                setAutoRotate(event.target.checked);
              }}
            />
          </div>
          <div>
            <label>Stats:</label>
            <input
              type="checkbox"
              checked={showStats}
              onChange={(event) => {
                setShowStats(event.target.checked);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
