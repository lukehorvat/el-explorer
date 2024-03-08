import { Parse, isElement } from 'xml-core';

/**
 * An EL actor definition.
 *
 * It doesn't represent an actual actor instance that exists in-game at a
 * position on a map; it's merely a definition.
 *
 * Ideally it should only be read from file once, cached somewhere, and then
 * reused as needed by actual actor instances in-game.
 */
export interface ActorDef {
  type: number;
  name: string;
  skinPath: string;
  meshPath: string;
  skeletonPath: string;
}

/**
 * Read EL actor definitions from XML.
 */
export function readActorDefs(xml: string): ActorDef[] {
  const xmlDoc = Parse(xml);

  for (const child of xmlDoc.childNodes) {
    if (isElement(child) && child.nodeName === 'actors') {
      return parseActors(child);
    }
  }

  throw new Error('No <actors> element defined.');
}

function parseActors(el: Element): ActorDef[] {
  const actors = [];

  for (const child of el.childNodes) {
    if (isElement(child)) {
      if (child.nodeName === 'actor') {
        actors.push(parseActor(child));
      } else {
        throwElementError(el, child);
      }
    }
  }

  return actors;
}

function parseActor(el: Element): ActorDef {
  const type = Number(el.getAttribute('id')!);
  const name = el.getAttribute('type')!;
  let skinPath!: string;
  let meshPath!: string;
  let skeletonPath!: string;

  for (const child of el.childNodes) {
    if (isElement(child)) {
      switch (child.nodeName.toLowerCase()) {
        case 'ghost': {
          break;
        }
        case 'skin': {
          skinPath = child.textContent!.replace(/^\.\//, '');
          break;
        }
        case 'mesh': {
          meshPath = child.textContent!.replace(/^\.\//, '');
          break;
        }
        case 'skeleton': {
          skeletonPath = child.textContent!.replace(/^\.\//, '');
          break;
        }
        case 'actor_scale': {
          break;
        }
        case 'scale': {
          break;
        }
        case 'mesh_scale': {
          break;
        }
        case 'bone_scale': {
          break;
        }
        case 'walk_speed': {
          break;
        }
        case 'run_speed': {
          break;
        }
        case 'step_duration': {
          break;
        }
        case 'defaults': {
          break;
        }
        case 'frames': {
          break;
        }
        case 'shirt': {
          break;
        }
        case 'hskin': {
          break;
        }
        case 'hair': {
          break;
        }
        case 'eyes': {
          break;
        }
        case 'boots': {
          break;
        }
        case 'legs': {
          break;
        }
        case 'cape': {
          break;
        }
        case 'head': {
          break;
        }
        case 'shield': {
          break;
        }
        case 'weapon': {
          break;
        }
        case 'helmet': {
          break;
        }
        case 'neck': {
          break;
        }
        case 'sounds': {
          break;
        }
        case 'actor_attachment': {
          break;
        }
      }
    }
  }

  return {
    type,
    name,
    skinPath,
    meshPath,
    skeletonPath,
  };
}

function throwElementError(el: Element, child: Element): void {
  throw new Error(
    `Unknown <${el.nodeName}> child element <${child.nodeName}> encountered.`
  );
}
