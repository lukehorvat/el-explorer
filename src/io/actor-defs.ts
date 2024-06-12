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
  scale: number;
  actorScale: number;
  meshScale: number;
  skeletonScale: number;
  ghost: boolean;
  animations: {
    name: string;
    path: string;
    kind: number;
    duration: number;
  }[];
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
  let skinPath!: ActorDef['skinPath'];
  let meshPath!: ActorDef['meshPath'];
  let skeletonPath!: ActorDef['skeletonPath'];
  let scale: ActorDef['scale'] = 1;
  let actorScale: ActorDef['actorScale'] = 1;
  let meshScale: ActorDef['meshScale'] = 1;
  let skeletonScale: ActorDef['skeletonScale'] = 1;
  let ghost!: ActorDef['ghost'];
  const animations: ActorDef['animations'] = [];

  for (const child of el.childNodes) {
    if (isElement(child)) {
      switch (child.nodeName.toLowerCase()) {
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
        case 'scale': {
          scale = Number(child.textContent);
          break;
        }
        case 'actor_scale': {
          actorScale = Number(child.textContent);
          break;
        }
        case 'mesh_scale': {
          meshScale = Number(child.textContent);
          break;
        }
        case 'bone_scale': {
          skeletonScale = Number(child.textContent);
          break;
        }
        case 'ghost': {
          ghost = ['true', 'yes', '1'].includes(child.textContent!);
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
          parseFrames(child);
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
    scale,
    actorScale,
    meshScale,
    skeletonScale,
    ghost,
    animations,
  };

  function parseFrames(el: Element): void {
    for (const child of el.childNodes) {
      if (isElement(child)) {
        switch (child.nodeName) {
          case 'CAL_IDLE_GROUP': {
            break;
          }
          case 'CAL_walk':
          case 'CAL_run':
          case 'CAL_turn_left':
          case 'CAL_turn_right':
          case 'CAL_die1':
          case 'CAL_die2':
          case 'CAL_pain1':
          case 'CAL_pain2':
          case 'CAL_pick':
          case 'CAL_drop':
          case 'CAL_idle':
          case 'CAL_idle2':
          case 'CAL_idle_sit':
          case 'CAL_harvest':
          case 'CAL_attack_cast':
          case 'CAL_sit_down':
          case 'CAL_stand_up':
          case 'CAL_in_combat':
          case 'CAL_out_combat':
          case 'CAL_combat_idle':
          case 'CAL_attack_up_1':
          case 'CAL_attack_up_2':
          case 'CAL_attack_up_3':
          case 'CAL_attack_up_4':
          case 'CAL_attack_up_5':
          case 'CAL_attack_up_6':
          case 'CAL_attack_up_7':
          case 'CAL_attack_up_8':
          case 'CAL_attack_up_9':
          case 'CAL_attack_up_10':
          case 'CAL_attack_down_1':
          case 'CAL_attack_down_2':
          case 'CAL_attack_down_3':
          case 'CAL_attack_down_4':
          case 'CAL_attack_down_5':
          case 'CAL_attack_down_6':
          case 'CAL_attack_down_7':
          case 'CAL_attack_down_8':
          case 'CAL_attack_down_9':
          case 'CAL_attack_down_10':
          case 'CAL_in_combat_held':
          case 'CAL_out_combat_held':
          case 'CAL_combat_idle_held':
          case 'CAL_in_combat_held_unarmed':
          case 'CAL_out_combat_held_unarmed':
          case 'CAL_combat_idle_held_unarmed':
          case 'CAL_attack_up_1_held':
          case 'CAL_attack_up_2_held':
          case 'CAL_attack_up_3_held':
          case 'CAL_attack_up_4_held':
          case 'CAL_attack_up_5_held':
          case 'CAL_attack_up_6_held':
          case 'CAL_attack_up_7_held':
          case 'CAL_attack_up_8_held':
          case 'CAL_attack_up_9_held':
          case 'CAL_attack_up_10_held':
          case 'CAL_attack_down_1_held':
          case 'CAL_attack_down_2_held':
          case 'CAL_attack_down_3_held':
          case 'CAL_attack_down_4_held':
          case 'CAL_attack_down_5_held':
          case 'CAL_attack_down_6_held':
          case 'CAL_attack_down_7_held':
          case 'CAL_attack_down_8_held':
          case 'CAL_attack_down_9_held':
          case 'CAL_attack_down_10_held': {
            const match = child.textContent!.match(/^(.+) (\d)$/);
            if (match?.length !== 3) {
              throw new Error('Bad animation formation encountered.');
            }
            const name = child.nodeName;
            const path = match[1].replace(/^\.\//, '');
            const kind = Number(match[2]);
            const duration = Number(child.getAttribute('duration') ?? -1);
            animations.push({ name, path, kind, duration });
            break;
          }
          default: {
            throwElementError(el, child);
          }
        }
      }
    }
  }
}

function throwElementError(el: Element, child: Element): void {
  throw new Error(
    `Unknown <${el.nodeName}> child element <${child.nodeName}> encountered.`
  );
}
