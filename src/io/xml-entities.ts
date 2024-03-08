/**
 * A convenient interface for dealing with XML that has references to external
 * entities. When instantiated, you can use the `entityUris` prop to determine
 * which entity XML files need to be loaded into memory. Once that is done,
 * they should then be passed to the `expand` method, which will replace each
 * entity reference with the entity's XML.
 *
 * @see https://www.w3schools.com/xml/xml_dtd_entities.asp
 */
export class XmlEntitiesExpander {
  private readonly xml: string;
  private readonly entityUriMap: Map<string, string>;

  constructor(xml: string) {
    this.xml = xml;
    this.entityUriMap = getEntityDecls(xml);
  }

  expand(entityXmls: string[]): string {
    const entityXmlMap = entityXmls.reduce((map, entityXml: string, index) => {
      const [entityName] = [...this.entityUriMap][index];
      return map.set(entityName, entityXml);
    }, new Map<string, string>());

    return expandEntityRefs(this.xml, entityXmlMap);
  }

  get entityUris(): string[] {
    return [...this.entityUriMap.values()];
  }
}

/**
 * Extract all external entity declarations from an XML string.
 *
 * This function is needed because I can't find any JS XML parsers that don't
 * completely ignore them... :(
 *
 * @example
 * If the following XML string was provided:
 *
 * ```xml
 * <!DOCTYPE dt [
 *   <!ENTITY eins SYSTEM "one.xml">
 *   <!ENTITY zwei SYSTEM "two.xml">
 *   <!ENTITY drei SYSTEM "three.xml">
 * ]>
 * ```
 *
 * Then the following mapping would be returned:
 *
 * ```
 * { 'eins' => 'one.xml', 'zwei' => 'two.xml', 'drei' => 'three.xml' }
 * ```
 */
function getEntityDecls(xml: string): Map<string, string> {
  const entityUriMap = new Map<string, string>();
  const doctypeRegex = /<!DOCTYPE +\w+ +\[([\S\s]*)\]>/;
  const entityDeclRegex = /<!ENTITY +([\w]+)+ +SYSTEM +"(.*)">/g;

  const doctypeMatch = xml.match(doctypeRegex);
  if (doctypeMatch) {
    let match;
    while ((match = entityDeclRegex.exec(doctypeMatch[1]))) {
      const [entityName, entityUri] = match.slice(1);

      if (entityUriMap.has(entityName)) {
        throw new Error(
          `Duplicate declaration of entity "${entityName}" encountered.`
        );
      }

      entityUriMap.set(entityName, entityUri);
    }
  }

  return entityUriMap;
}

/**
 * Recursively expand all entity references in an XML string.
 *
 * This function tries to do the equivalent of the `LIBXML_NOENT` flag in
 * php's libxml. It's needed because I can't find any JS XML parsers that
 * recognize entity references... :(
 *
 * @example
 * If the following XML string is provided:
 *
 * ```xml
 * <a>&entity1;</a>
 * ```
 *
 * Along with this mapping:
 *
 * ```
 * { 'entity1' => '<b>&entity2;</b>', 'entity2' => '<c />' }
 * ```
 *
 * Then the XML string returned is:
 *
 * ```xml
 * <a><b><c /></b></a>
 * ```
 */
function expandEntityRefs(
  xml: string,
  entityXmlMap: Map<string, string>,
  visitedEntities: Set<string> = new Set<string>()
): string {
  const entityRefs = getEntityRefs(xml);
  const comments = getComments(xml);

  let offset = 0;
  for (const entityRef of entityRefs) {
    const { entityName, startIndex, endIndex } = entityRef;
    const isInsideComment = comments.some((comment) => {
      return (
        entityRef.startIndex > comment.startIndex &&
        entityRef.endIndex < comment.endIndex
      );
    });

    if (isInsideComment) {
      // We don't care about entity references that are commented out.
      continue;
    }

    if (!entityXmlMap.has(entityName)) {
      throw new Error(`Unknown entity "${entityName}" encountered.`);
    }

    if (visitedEntities.has(entityName)) {
      throw new Error(`Recursive entity "${entityName}" encountered.`);
    }

    const expandedEntityXml = expandEntityRefs(
      entityXmlMap.get(entityName)!,
      entityXmlMap,
      new Set(visitedEntities).add(entityName)
    );

    xml =
      xml.slice(0, startIndex + offset) +
      expandedEntityXml +
      xml.slice(endIndex + offset);

    offset += expandedEntityXml.length - (endIndex - startIndex);
  }

  return xml;
}

/**
 * Extract all entity references (e.g. &foo;) from an XML string.
 */
function getEntityRefs(xml: string): {
  entityName: string;
  startIndex: number;
  endIndex: number;
}[] {
  const entityRefs = [];
  const entityRefRegex = /&([\w]+);/g;

  let match;
  while ((match = entityRefRegex.exec(xml))) {
    const entityName = match[1];
    const startIndex = match.index;
    const endIndex = startIndex + entityName.length + 2;
    entityRefs.push({ entityName, startIndex, endIndex });
  }

  return entityRefs;
}

/**
 * Extract all comments (e.g. <!-- foo -->) from an XML string.
 */
function getComments(xml: string): {
  startIndex: number;
  endIndex: number;
}[] {
  const comments = [];
  const commentRegex = /<!--([\s\S]*?)-->/g;

  let match;
  while ((match = commentRegex.exec(xml))) {
    const comment = match[1];
    const startIndex = match.index;
    const endIndex = startIndex + comment.length + 7;
    comments.push({ startIndex, endIndex });
  }

  return comments;
}
