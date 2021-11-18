import { Container } from "pixi.js";

export default function setGameContainer(app, height, width) {
  const gameContainer = new Container();
  gameContainer.width = width;
  gameContainer.height = height;
  gameContainer.position.x = 0;
  gameContainer.position.y = 0;
  app.stage.addChild(gameContainer);
  return gameContainer;
}
