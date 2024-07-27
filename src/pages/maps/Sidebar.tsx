import React, { useEffect, useRef } from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { AssetCache } from '../../lib/asset-cache';
import { MapsPageState } from './page-state';
import {
  Sidebar,
  SidebarNavButtons,
  SidebarSection,
  navigateTo,
} from '../../components/Sidebar';

export function MapsSidebar(): React.JSX.Element {
  return (
    <Sidebar>
      <MapSection />
      <AppearanceSection />
      <MiscSection />
    </Sidebar>
  );
}

function MapSection(): React.JSX.Element {
  const [mapDefPath, setMapDefPath] = useAtom(MapsPageState.mapDefPath);
  const sortedMapDefPaths = [...AssetCache.mapDefs.keys()].sort(
    (defPath1, defPath2) => defPath1.localeCompare(defPath2)
  );
  const moveToMap = (direction: 'prev' | 'next'): void => {
    setMapDefPath(navigateTo(mapDefPath, sortedMapDefPaths, direction));
  };
  const mapSelectRef = useRef<HTMLSelectElement>(null!);

  useEffect(() => {
    // After the user selects a map via the dropdown, they might try pressing keys
    // to fly around. But the dropdown will intercept any key presses because it
    // still has focus, causing buggy behavior. Therefore, lose the focus.
    mapSelectRef.current.blur();
  }, [mapDefPath]);

  return (
    <SidebarSection title="Map" icon="bi-globe-americas">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={mapDefPath}
          onChange={(event) => setMapDefPath(event.target.value)}
          ref={mapSelectRef}
        >
          {sortedMapDefPaths.map((defPath) => (
            <option value={defPath} key={defPath}>
              {defPath.replace(/^maps\//, '').replace(/\.elm\.gz$/, '')}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToMap} />
      </Stack>
    </SidebarSection>
  );
}

function AppearanceSection(): React.JSX.Element {
  const [showObject3ds, setShowObject3ds] = useAtom(
    MapsPageState.showObject3ds
  );
  const [showObject2ds, setShowObject2ds] = useAtom(
    MapsPageState.showObject2ds
  );
  const [showTiles, setShowTiles] = useAtom(MapsPageState.showTiles);
  const [showTileExtensions, setShowTileExtensions] = useAtom(
    MapsPageState.showTileExtensions
  );
  const [showSkybox, setShowSkybox] = useAtom(MapsPageState.showSkybox);

  return (
    <SidebarSection title="Appearance" icon="bi-palette-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">3D objects:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showObject3ds}
          onChange={(event) => setShowObject3ds(event.target.checked)}
        />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">2D objects:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showObject2ds}
          onChange={(event) => setShowObject2ds(event.target.checked)}
        />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Tiles:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showTiles}
          onChange={(event) => setShowTiles(event.target.checked)}
        />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Tile extensions:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showTileExtensions}
          onChange={(event) => setShowTileExtensions(event.target.checked)}
        />
      </Stack>
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Skybox:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showSkybox}
          onChange={(event) => setShowSkybox(event.target.checked)}
        />
      </Stack>
    </SidebarSection>
  );
}

function MiscSection(): React.JSX.Element {
  const [showStats, setShowStats] = useAtom(MapsPageState.showStats);

  return (
    <SidebarSection title="Miscellaneous" icon="bi-gear-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Stats:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={showStats}
          onChange={(event) => setShowStats(event.target.checked)}
        />
      </Stack>
    </SidebarSection>
  );
}
