import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { atoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import './BottomBar.css';

export function BottomBar(): React.JSX.Element {
  const isLoaded = useAtomValue(atoms.isLoaded);
  const actorType = useAtomValue(atoms.actorType);
  const [skinType, setSkinType] = useAtom(atoms.skinType);
  const [showSkeleton, setShowSkeleton] = useAtom(atoms.showSkeleton);
  const [showGround, setShowGround] = useAtom(atoms.showGround);
  const [showStats, setShowStats] = useAtom(atoms.showStats);
  const [autoRotate, setAutoRotate] = useAtom(atoms.autoRotate);
  const [animationType, setAnimationType] = useAtom(atoms.animationType);
  const [loopAnimation, setLoopAnimation] = useAtom(atoms.loopAnimation);
  const actorDef = assetCache.actorDefs.get(actorType)!;

  return (
    <div className="BottomBar">
      {isLoaded && (
        <>
          <div>
            <label>Skin:</label>
            <select
              className="SkinSelect"
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
            <label>Animation type:</label>
            <select
              className="AnimationSelect"
              value={animationType ?? ''}
              onChange={(event) => {
                setAnimationType(event.target.value || null);
              }}
            >
              <option value="">None</option>
              {actorDef.animationFrames.map((frame) => (
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
