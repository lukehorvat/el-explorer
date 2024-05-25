import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { atoms } from '../lib/state';
import { assetCache } from '../lib/asset-cache';
import './LeftBar.css';

export function LeftBar(): React.JSX.Element {
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
    <div className="LeftBar">
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
          onChange={(event) => {
            setShowSkeleton(event.target.checked);
          }}
        />
      </div>
      <div className="Control">
        <label>Animation:</label>
        <select
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
      <div className="Control">
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
      <div className="Control">
        <label>Ground:</label>
        <input
          type="checkbox"
          checked={showGround}
          onChange={(event) => {
            setShowGround(event.target.checked);
          }}
        />
      </div>
      <div className="Control">
        <label>Auto rotate:</label>
        <input
          type="checkbox"
          checked={autoRotate}
          onChange={(event) => {
            setAutoRotate(event.target.checked);
          }}
        />
      </div>
      <div className="Control">
        <label>Stats:</label>
        <input
          type="checkbox"
          checked={showStats}
          onChange={(event) => {
            setShowStats(event.target.checked);
          }}
        />
      </div>
    </div>
  );
}
