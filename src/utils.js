import { Sprite, Loader } from "pixi.js";

const { resources } = Loader.shared;

export const shake = (object, duration) => {
  const start = performance.now();
  const originalX = object.position.x;
  const originalY = object.position.y;
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed = performance.now() - start;
    if (elapsed > duration) {
      clearInterval(interval);
      object.position.x = originalX;
      object.position.y = originalY;
      return;
    }
    object.position.x = Math.random() * 2 - 1;
    object.position.y = Math.random() * 2 - 1;
  }, 10);
};

export const checkCollisionBetweenTwoObjects = (object1, object2) => {
  // get the position of the object
  const object1X = object1.position.x;
  const object1Y = object1.position.y;
  const object2X = object2.position.x;
  const object2Y = object2.position.y;

  // get the size of the objects
  const object1Width = object1.width - 10;
  const object1Height = object1.height - 10;
  const object2Width = object2.width - 10;
  const object2Height = object2.height - 10;

  // check if the objects are colliding
  if (
    object1X < object2X + object2Width &&
    object1X + object1Width > object2X &&
    object1Y < object2Y + object2Height &&
    object1Height + object1Y > object2Y
  ) {
    return true;
  }
  return false;
};

export const testCollision = (collisionsMap, worldX, worldY) => {
  const mapX = Math.floor(worldX / 16);
  const mapY = Math.floor(worldY / 16);
  return collisionsMap[mapY][mapX];
};

export const textToSprite = ({
  text,
  type = "white",
  container,
  scale = 1,
  separation,
  x = 0,
  y = 0,
} = {}) => {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const sprite = new Sprite(
      resources[`text_${type}`].textures[`${char}_${type}`]
    );
    sprite.position.set(x + i * separation, y);
    sprite.scale.set(scale);
    container.addChild(sprite);
  }
};

export const hitBox = (player, topBar, boxes, worldX, worldY) => {
  let hit = false;
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const pixelCorrection = 16;
    if (
      worldX + pixelCorrection >= box.position.x &&
      worldX + pixelCorrection <= box.position.x + box.width &&
      worldY >= box.position.y &&
      worldY <= box.position.y + box.height
    ) {
      hit = true;
      box.hit();
      player.incrementFruits();
      topBar.setFruits(player.fruits);
      break;
    }
  }

  return hit;
};

export const checkOnTop = (player, object) => {
  // get the position of the player
  const playerX = player.position.x;
  const playerY = player.position.y;

  // get the size of the player
  const playerWidth = player.width;
  const playerHeight = player.height;

  // get the size of the object
  const objectWidth = object.width;
  const objectHeight = object.height;

  // get the position of the object
  const objectX = object.position.x;
  const objectY = object.position.y;

  const lookAndFeelCorrection = 16;

  if (
    objectY + 16 > playerY + playerHeight &&
    objectY - 16 < playerY + playerHeight &&
    playerX <= objectX + objectWidth - lookAndFeelCorrection &&
    playerX + playerWidth >= objectX + lookAndFeelCorrection
  ) {
    return true;
  }
  return false;
};
