import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../lib/scene-manager';
import './Scene.css';

export function Scene(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sceneManager = new SceneManager(canvasRef.current!);
    sceneManager.render();
  }, []);

  return <canvas className="Scene" ref={canvasRef} />;
}
