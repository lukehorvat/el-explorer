import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../lib/scene-manager';
import './Scene.css';

export function Scene(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const sceneManager = new SceneManager(canvasRef.current);

    return () => {
      sceneManager.dispose();
    };
  }, []);

  return <canvas className="Scene flex-grow-1" ref={canvasRef} />;
}
