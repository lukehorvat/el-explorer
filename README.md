# Eternal Lands Explorer

https://lukehorvat.github.io/el-explorer

Browser-based 3D showcase of assets in Eternal Lands.

It's basically an investigation into what it would take to render the game in web browsers, inspired by some of the previous work that was done years ago for [webel](https://github.com/gvissers/webel).

## Setup

To run it locally make sure you have a recent version of Node.js installed and then do the following:

```sh
git clone git@github.com:lukehorvat/el-explorer.git
cd el-explorer
npm install
npm start
```

This installs all dependencies and serves the web app at http://localhost:9000.

## Contributing

Feel free to submit a PR if you want to contribute some changes.

When running `npm start` the app and browser tab will automatically reload whenever you update code.

I recommend using [vscode](https://code.visualstudio.com) as your editor since it provides lots of TypeScript niceties and works well with the ESLint code linting and Prettier code formatting that I've set up.

## Technical notes

- The app is written in TypeScript and uses Three.js for 3D rendering and React for UI.
  - Similar to the native EL client's usage of OpenGL, initially I tried building this with direct calls to WebGL, but quickly gave up on that idea since I lack the 3D programming knowledge and opted for Three.js instead. Three.js is a popular lightweight wrapper around WebGL (and soon, WebGPU) that exposes many useful 3D abstractions to you, resulting in a pretty comfortable developer experience. It's not a game engine, but can certainly be used as the foundation for building a game.
  - I'm also in the process of considering using [react-three-fiber](https://docs.pmnd.rs/react-three-fiber), which would effectively integrate the Three.js code into React land. But that's a story for another day...
- It's 100% client-side and doesn't require any server component (other than a web server to host the bundle). Webpack is used to build the client bundle.
  - You can run `npm run build` locally and then inspect the `dist` directory to see what files are included in the bundle.
- A [service worker](./src/service-worker.ts) is used to cache the files in the user's browser, making app load times for subsequent visits much faster. After visiting the site for the first time, refresh the page and you'll see what I mean. (Of course, a service worker is not absolutely necessary, regular HTTP caching would also work just fine.)
  - You can have a look at the network requests in your browser's devtools to see how they are intercepted by the service worker.
  - You can also inspect the cache via browser devtools. In Chrome the cache is visible in `Application > Storage > Cache storage > el-data`.
- One of the primary goals of this project is to load the EL data files in the browser without requiring any preprocessing or transformation of those files (which is one of the reasons why there's no server required). In other words, the app reads [the exact same data files](./data/) that the native EL client does, just in the browser. All of the parsing of XML, Cal3D, DDS, etc. takes places client-side on app load. So if the native EL client was updated with new data files (for example), you could replace the `data` directory here and everything would just work.
  - You can inspect the file parsing code in the [io](./src/io) directory and the file loading orchestration [here](./src/lib/asset-cache.ts).
- The rendered Three.js scene is managed [here](./src/lib/scene-manager.ts) and you can follow the imports there to see how the 3D stuff is constructed.
- The React-based UI code can be found in the [components](./src/components/) directory.
