import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../../lib/scene-manager';
import './ActorsScene.css';

export function ActorsScene(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const sceneManager = new SceneManager(canvasRef.current);

    return () => {
      sceneManager.dispose();
    };
  }, []);

  return <canvas className="ActorsScene flex-grow-1" ref={canvasRef} />;
}
