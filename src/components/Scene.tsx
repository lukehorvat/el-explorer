import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../lib/scene-manager';
import './Scene.css';

export function Scene(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const sceneManagerRef = useRef<SceneManager>(null!);

  useEffect(() => {
    sceneManagerRef.current = new SceneManager(canvasRef.current);
  }, []);

  return <canvas className="Scene" ref={canvasRef} />;
}
