import { Parse, isElement } from 'xml-core';

export interface ActorDef {
  foo: boolean;
}

export function readActorDefs(xml: string): ActorDef[] {
  const xmlDoc = Parse(xml);

  for (const child of xmlDoc.childNodes) {
    if (isElement(child) && child.nodeName === 'actors') {
      parseActors(child);
    }
  }

  return [];
}

function parseActors(el: Element): void {
  for (const child of el.childNodes) {
    if (isElement(child)) {
      if (child.nodeName === 'actor') {
        parseActor(child);
      } else {
        throwElementError(el, child);
      }
    }
  }
}

function parseActor(el: Element): void {
  const type = el.getAttribute('id');
  const name = el.getAttribute('type');
  //   for (const child of el.childNodes) {
  //     if (isElement(child)) {
  //     }
  //   }
  console.log('!', type, name);
}

function throwElementError(el: Element, child: Element): void {
  throw new Error(
    `Unknown <${el.nodeName}> child element <${child.nodeName}> encountered.`
  );
}
