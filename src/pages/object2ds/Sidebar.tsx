import React from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useAtom } from 'jotai';
import { Object2dsPageState } from './page-state';
import { assetCache } from '../../lib/asset-cache';
import {
  Sidebar,
  SidebarNavButtons,
  SidebarSection,
  navigateTo,
} from '../../components/Sidebar';

export function Object2dsSidebar(): React.JSX.Element {
  return (
    <Sidebar>
      <Object2dSection />
      <MiscSection />
    </Sidebar>
  );
}

function Object2dSection(): React.JSX.Element {
  const [object2dType, setObject2dType] = useAtom(
    Object2dsPageState.object2dType
  );
  const sortedObject2dDefs = [...assetCache.actorDefs.values()].sort(
    (def1, def2) => def1.name.localeCompare(def2.name)
  );
  const moveToObject2d = (direction: 'prev' | 'next'): void => {
    const object2dTypes = sortedObject2dDefs.map((def) => def.type);
    setObject2dType(navigateTo(object2dType, object2dTypes, direction));
  };

  return (
    <SidebarSection title="2D Object" icon="bi-person-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm" className="flex-grow-0">
          Type:
        </Form.Label>
        <Form.Select
          size="sm"
          value={object2dType}
          onChange={(event) => setObject2dType(Number(event.target.value))}
        >
          {sortedObject2dDefs.map((object2dDef) => (
            <option value={object2dDef.type} key={object2dDef.type}>
              {object2dDef.name}
            </option>
          ))}
        </Form.Select>
        <SidebarNavButtons onNavigate={moveToObject2d} />
      </Stack>
    </SidebarSection>
  );
}

function MiscSection(): React.JSX.Element {
  const [showStats, setShowStats] = useAtom(Object2dsPageState.showStats);
  const [autoRotate, setAutoRotate] = useAtom(Object2dsPageState.autoRotate);

  return (
    <SidebarSection title="Miscellaneous" icon="bi-gear-fill">
      <Stack direction="horizontal" gap={2}>
        <Form.Label column="sm">Auto rotate:</Form.Label>
        <Form.Check
          type="checkbox"
          checked={autoRotate}
          onChange={(event) => setAutoRotate(event.target.checked)}
        />
      </Stack>
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
