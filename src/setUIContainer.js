import { Container } from "pixi.js";

export default function setUIContainer(app, height, width) {
  const UIContainer = new Container();
  UIContainer.width = width;
  UIContainer.height = height;
  UIContainer.position.x = 0;
  UIContainer.position.y = 0;
  app.stage.addChild(UIContainer);
  return UIContainer;
}
