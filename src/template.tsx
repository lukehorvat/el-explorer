import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import faviconUrl from '../images/favicon.ico';

function Template(): React.JSX.Element {
  return (
    <html lang="en" data-bs-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <title>EL Explorer</title>
        <meta
          name="description"
          content="Browser-based 3D showcase of assets in Eternal Lands."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link type="image/x-icon" href={faviconUrl} rel="shortcut icon" />
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  );
}

export default `<!DOCTYPE html>\n${renderToStaticMarkup(<Template />)}`;
