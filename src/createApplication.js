import * as PIXI from "pixi.js";

const { Application } = PIXI;

export default function createApplication({
  height,
  width,
  backgroundColor,
  roundPixels,
  antialias,
  resolution,
  scale,
} = {}) {
  const app = new Application({
    backgroundColor,
    width,
    height,
    roundPixels,
    antialias,
    resolution,
  });

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

  app.stage.scale.set(scale);

  document.querySelector("#canvas-container").appendChild(app.view);

  return app;
}
