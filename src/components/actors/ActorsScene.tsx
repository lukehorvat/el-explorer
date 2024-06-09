import React, { useEffect, useRef } from 'react';
import { useStore } from 'jotai';
import { ActorsSceneManager } from './actors-scene-manager';
import './ActorsScene.css';

export function ActorsScene(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const store = useStore();

  useEffect(() => {
    const sceneManager = new ActorsSceneManager(canvasRef.current, store);
    return () => {
      sceneManager.dispose();
    };
  }, [store]);

  return <canvas className="ActorsScene flex-grow-1" ref={canvasRef} />;
}
