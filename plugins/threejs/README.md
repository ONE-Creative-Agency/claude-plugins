# three.js (Claude Code plugin)

13 skills that give Claude current three.js knowledge, so the code it writes runs on the release you install: three.js r186 (`three@0.186`), React Three Fiber 9.8 with drei 10.7, and gltf-transform 4.5. Claude loads the matching skill when you ask for 3D work.

## Install
Comes with your ONE account (organisation plugins). If it isn't there, install it yourself:

    /plugin install threejs --marketplace ONE-Creative-Agency/claude-plugins

## Skills
threejs-fundamentals, threejs-geometry, threejs-materials, threejs-lighting, threejs-textures, threejs-animation, threejs-loaders, threejs-shaders, threejs-postprocessing, threejs-interaction, threejs-performance, threejs-react-three-fiber, threejs-asset-pipeline.

## Source
Copied unchanged from [cloudai-x/threejs-skills](https://github.com/cloudai-x/threejs-skills) at commit `0e18186` (MIT licence, see `LICENSE`). To update: copy the new `skills/` folder over this one, read the diff, bump the version in `.claude-plugin/plugin.json`.

Owner: Nicky.
