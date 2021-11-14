/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
import "./assets/styles/style.css";
import * as PIXI from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { check } from "prettier";

window.PIXI = PIXI; // remove when finished

const { Application } = PIXI;
const { Container } = PIXI;
const loader = PIXI.Loader.shared;
const { resources } = PIXI.Loader.shared;
const { Graphics } = PIXI;
// const { TextureCache } = PIXI.utils;
const { Sprite } = PIXI;
// const { Text } = PIXI;
// const { TextStyle } = PIXI;

const resolutionRatio = 1.7777777777777777;
const width = 1280;
const height = Math.round(width / resolutionRatio);
const tileSize = 16;

let player;
let backgroundTilemap;
let collisionsMap;
let touchingGround = false;
let healthBar;
const checkpoints = [];
const fruits = [];
const rockHeads = [];
const slimes = [];
const boxes = [];
const rabbits = [];
let key;
let platform;
let endPoint;
let onAPlatform = false;
let objectMark;
let playerMark;
let testMark;

const app = new Application({
  backgroundColor: 0x211f30,
  width,
  height,
  roundPixels: true,
  antialias: true,
  transparent: false,
  resolution: 1,
});

const gameContainer = new Container();
gameContainer.width = width;
gameContainer.height = height;
gameContainer.x = 0;
gameContainer.y = 0;
app.stage.addChild(gameContainer);

const UIContainer = new Container();
UIContainer.width = width;
UIContainer.height = height;
UIContainer.x = 0;
UIContainer.y = 0;
app.stage.addChild(UIContainer);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

app.stage.scale.set(2);

// app.renderer.view.style.position = "absolute";
// app.renderer.view.style.display = "block";
// app.renderer.autoDensity = true;
// app.resizeTo = window;

document.querySelector("#main-container").appendChild(app.view);

class Keyboard {
  constructor() {
    this.pressed = {};
  }

  watch(el) {
    el.addEventListener("keydown", (e) => {
      this.pressed[e.key] = true;
    });
    el.addEventListener("keyup", (e) => {
      this.pressed[e.key] = false;
    });
  }
}

const kb = new Keyboard();
kb.watch(document.body);

function testCollision(worldX, worldY) {
  const mapX = Math.floor(worldX / tileSize);
  const mapY = Math.floor(worldY / tileSize);
  return collisionsMap[mapY][mapX];
}

function hitBox(worldX, worldY) {
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
      break;
    }
  }

  console.log(hit);
  return hit;
}

function textToSprite(letter, type = "white") {
  return new PIXI.Sprite(
    resources[`text_${type}`].textures[`${letter}_${type}`]
  );
}

// function that check if there is a collision between two objects
function checkCollision(object1, object2) {
  // get the position of the object
  // get the position of the object
  const object1X = object1.position.x;
  const object1Y = object1.position.y;
  const object2X = object2.position.x;
  const object2Y = object2.position.y;

  // get the size of the objects
  const object1Width = object1.width - 4;
  const object1Height = object1.height - 4;
  const object2Width = object2.width - 4;
  const object2Height = object2.height - 4;

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
}

// function that check laterally collisions between the player and the objects
function checkLateralCollision(object) {
  // get the position of the player
  const playerX = player.position.x;
  const playerY = player.position.y;

  // get the size of the player
  const playerWidth = player.width - 4;
  const playerHeight = player.height - 4;

  // get the size of the object
  const objectWidth = object.width - 4;
  const objectHeight = object.height - 4;

  // get the position of the object
  const objectX = object.position.x;
  const objectY = object.position.y;

  // check if the player is in the right or left of the object
  if (objectX < playerX + playerWidth && objectX + objectWidth > playerX) {
    // check if the player is in the top or bottom of the object
    if (objectY < playerY + playerHeight && objectY + objectHeight > playerY) {
      return true;
    }
  }
  return false;
}

// function that checks upper collisions between the player and the objects
function checkCollisionOnTop(object) {
  // get the position of the player
  const playerX = player.position.x;
  const playerY = player.position.y;

  // get the size of the player
  const playerWidth = player.width - 4;
  const playerHeight = player.height - 4;

  // get the size of the object
  const objectWidth = object.width - 4;
  const objectHeight = object.height - 4;

  // get the position of the object
  const objectX = object.position.x;
  const objectY = object.position.y;

  // check if the player is in the top of the object
  if (
    objectY < playerY + playerHeight &&
    objectY + objectHeight > playerY &&
    objectX < playerX + playerWidth &&
    objectX + objectWidth > playerX
  ) {
    return true;
  }
  return false;
}

function checkOnTop(object) {
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
}

function gameLoop(delta) {
  touchingGround =
    onAPlatform ||
    testCollision(
      player.position.x + 2,
      player.position.y + tileSize * 2 + 1
    ) ||
    testCollision(
      player.position.x + tileSize - 3,
      player.position.y + tileSize * 2 + 1
    );

  player.vy = Math.min(12, player.vy + 1);
  if (player.vx > 0) {
    player.vx -= 1;
  }
  if (player.vx < 0) {
    player.vx += 1;
  }

  if (player.vy > 0) {
    for (let i = 0; i < player.vy; i++) {
      const testX1 = player.position.x + 2;
      const testX2 = player.position.x + tileSize - 3;
      const testY = player.position.y + tileSize * 2;
      if (
        testY > height * tileSize ||
        testCollision(testX1, testY) ||
        testCollision(testX2, testY)
      ) {
        player.vy = 0;
        break;
      }
      player.y += 1;
    }
  }

  if (player.vy < 0) {
    for (let i = player.vy; i < 0; i++) {
      const testX1 = player.position.x + 2;
      const testX2 = player.position.x + tileSize - 3;
      const testY = player.position.y + 5;
      if (
        onAPlatform ||
        hitBox(testX1, testY) ||
        hitBox(testX2, testY) ||
        testCollision(testX1, testY) ||
        testCollision(testX2, testY)
      ) {
        player.vy = 0;
        break;
      }
      player.y -= 1;
    }
  }

  if (player.vx > 0) {
    player.direction = 0;
    for (let i = 0; i < player.vx; i++) {
      const testX = player.position.x + tileSize - 2;
      const testY1 = player.position.y + 5;
      const testY2 = player.position.y + tileSize;
      const testY3 = player.position.y + tileSize * 2 - 1;
      player.scale.x = 1;
      player.anchor.x = 0;
      if (
        testX >= width * tileSize ||
        testCollision(testX, testY1) ||
        testCollision(testX, testY2) ||
        testCollision(testX, testY3)
      ) {
        player.vx = 0;
        break;
      }
      player.position.x += 1;
    }
  }

  if (player.vx < 0) {
    player.direction = 1;
    for (let i = player.vx; i < 0; i++) {
      const testX = player.position.x + 1;
      const testY1 = player.position.y + 5;
      const testY2 = player.position.y + tileSize;
      const testY3 = player.position.y + tileSize * 2 - 1;
      player.scale.x = -1;
      player.anchor.x = 1;
      if (
        testX < 0 ||
        testCollision(testX, testY1) ||
        testCollision(testX, testY2) ||
        testCollision(testX, testY3)
      ) {
        player.vx = 0;
        break;
      }
      player.x -= 1;
    }
  }

  if (kb.pressed.ArrowRight) {
    player.direction = 0;
    player.vx = Math.min(6, player.vx + 2);
  }
  if (kb.pressed.ArrowLeft) {
    player.direction = 1;
    player.vx = Math.max(-6, player.vx - 2);
  }
  if (!kb.pressed.ArrowUp && touchingGround && player.jumped) {
    player.jumped = false;
  }
  if (kb.pressed.ArrowUp && touchingGround && !player.jumped) {
    player.vy = -16;
    player.jumped = true;
    onAPlatform = false;
  }

  rockHeads.forEach((rockHead) => {
    rockHead.routine();

    const playerIsOnTopRockHead = checkOnTop(rockHead);
    if (playerIsOnTopRockHead && player.vy >= 0) {
      console.log("on top");
      onAPlatform = true;
      player.position.y = rockHead.position.y - 27;
      player.vy = 0;
    } else {
      onAPlatform = false;
    }
  });

  fruits.forEach((fruit) => {
    if (checkCollision(player, fruit)) {
      player.increaseFruits += 1;
      fruit.collected();
    }
  });

  checkpoints.forEach((checkpoint) => {
    if (checkpoint.completed) return;
    if (checkCollision(player, checkpoint)) {
      checkpoint.achieved();
    }
  });

  boxes.forEach((box) => {
    box.routine();
  });

  slimes.forEach((slime) => {
    slime.routine();
  });

  rabbits.forEach((rabbit) => {
    rabbit.routine();
  });

  if (key) {
    key.float();
    if (checkCollision(player, key)) {
      key.hasKey = true;
      key.collected();
    }
  }

  const playerIsOnTopPlatform = checkOnTop(platform);
  platform.routine();
  if (playerIsOnTopPlatform && player.vy >= 0) {
    console.log("on top");
    onAPlatform = true;
    player.position.y = platform.position.y - 32;
    if (!kb.pressed.ArrowRight && !kb.pressed.ArrowLeft)
      player.position.x = platform.position.x;
    player.vy = 0;
  }

  if (!player.appearing) {
    if (player.jumped) {
      if (
        player.vy < 0 &&
        player.textures !== [resources.player_jump.texture]
      ) {
        player.textures = [resources.player_jump.texture];
        player.play();
      } else if (
        player.vy > 0 &&
        player.textures !== [resources.player_fall.texture]
      ) {
        player.textures = [resources.player_fall.texture];
        player.play();
      }
    } else if (player.vx !== 0) {
      if (
        player.textures !==
        resources.player_run.spritesheet.animations.player_run
      ) {
        player.textures =
          resources.player_run.spritesheet.animations.player_run;
        player.play();
      }
    } else if (
      player.textures !==
      resources.player_idle.spritesheet.animations.player_idle
    ) {
      player.textures =
        resources.player_idle.spritesheet.animations.player_idle;
      player.play();
    }
  }
}

function shake(duration) {
  const start = performance.now();
  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed = performance.now() - start;
    if (elapsed > duration) {
      clearInterval(interval);
      return;
    }
    gameContainer.position.x = Math.random() * 2 - 1;
    gameContainer.position.y = Math.random() * 2 - 1;
  }, 10);
}

function setCheckpoints() {
  const checkpointsConfiguration = [
    {
      x: 95,
      y: 240,
    },
    {
      x: 150,
      y: 16,
    },
  ];

  checkpointsConfiguration.forEach((checkpointConfiguration) => {
    const checkpoint = new PIXI.AnimatedSprite([
      resources.checkpoint_noflag.texture,
    ]);
    checkpoint.achieved = false;
    checkpoint.position.set(
      checkpointConfiguration.x,
      checkpointConfiguration.y
    );
    checkpoint.animationSpeed = 0.3;
    checkpoint.play();
    checkpoint.achieved = function () {
      this.completed = true;
      this.textures = resources.flag_out.spritesheet.animations.flag_out;
      this.loop = false;
      this.play();
      this.onComplete = function () {
        this.textures = resources.flag_idle.spritesheet.animations.flag_idle;
        this.loop = true;
        this.play();
      };
    };
    // checkpoint.scale.set(0.5);
    checkpoints.push(checkpoint);
    gameContainer.addChild(checkpoint);
  });
}

function setStartPoint() {
  const startPoint = new PIXI.AnimatedSprite(
    resources.start.spritesheet.animations.start
  );
  startPoint.position.set(485, 240);
  startPoint.animationSpeed = 0.3;
  startPoint.play();
  gameContainer.addChild(startPoint);
}

function setEndPoint() {
  endPoint = new PIXI.AnimatedSprite([resources.end_idle.texture]);
  endPoint.position.set(534, 41);
  endPoint.animationSpeed = 0.3;
  endPoint.scale.set(0.7);
  endPoint.play();
  gameContainer.addChild(endPoint);
}

function setFruits() {
  const fruitsConfiguration = [
    {
      nOfFruits: 6,
      initialX: 55,
      initialY: 45,
      alignment: "vertical",
      separation: 45,
      fruit: "apple",
    },
    {
      nOfFruits: 5,
      initialX: 225,
      initialY: 289,
      alignment: "horizontal",
      separation: 50,
      fruit: "melon",
    },
  ];

  fruitsConfiguration.forEach((fruitConfiguration) => {
    for (let i = 0; i < fruitConfiguration.nOfFruits; i++) {
      const fruit = new PIXI.AnimatedSprite(
        resources[fruitConfiguration.fruit].spritesheet.animations[
          fruitConfiguration.fruit
        ]
      );
      fruit.position.set(
        fruitConfiguration.initialX +
          (fruitConfiguration.alignment === "horizontal"
            ? i * fruitConfiguration.separation
            : 0),
        fruitConfiguration.initialY +
          (fruitConfiguration.alignment === "vertical"
            ? i * fruitConfiguration.separation
            : 0)
      );

      fruit.animationSpeed = 0.3;
      fruit.play();

      fruit.collected = function () {
        fruits.splice(fruits.indexOf(fruit), 1);
        this.textures =
          resources.fruit_collected.spritesheet.animations.fruit_collected;
        this.loop = false;
        this.play();
        this.onComplete = function () {
          gameContainer.removeChild(this);
          this.destroy();
        };
      };

      gameContainer.addChild(fruit);
      fruits.push(fruit);
    }
  });
}

function setBackground() {
  backgroundTilemap = new CompositeTilemap();
  // prettier-ignore
  const backgroundMatrix = [
    [ 6, 5, 5, 5, 5, 5, 5, 5, 5, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 8],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  ];

  const distant = 64;
  backgroundMatrix.forEach((tile, indexY) => {
    const y = indexY * distant;
    tile.forEach((col, indexX) => {
      const x = indexX * distant;
      if (col === 1) backgroundTilemap.tile("green", x, y);
      if (col === 2) {
        backgroundTilemap.tile("green", x, y, {
          tileHeight: 32,
        });
      }
      if (col === 3) {
        backgroundTilemap.tile("green", x, y, {
          tileWidth: 32,
        });
      }
      if (col === 4) {
        backgroundTilemap.tile("green", x, y, {
          tileHeight: 32,
          tileWidth: 32,
        });
      }
      if (col === 5) {
        backgroundTilemap.tile("green", x, y + 32, {
          tileHeight: 32,
          rotate: 4,
        });
      }
      if (col === 6) {
        backgroundTilemap.tile("green", x + 32, y + 32, {
          tileHeight: 32,
          tileWidth: 32,
          rotate: 4,
        });
      }
      if (col === 7) {
        backgroundTilemap.tile("green", x + 32, y, {
          tileWidth: 32,
          rotate: 4,
        });
      }
      if (col === 8) {
        backgroundTilemap.tile("green", x, y + 16, {
          tileWidth: 48,
          tileHeight: 32,
          rotate: 4,
        });
      }
    });
  });
  gameContainer.addChild(backgroundTilemap);
}

function setMainScene() {
  const terrainTextures = resources.terrain.textures;
  // prettier-ignore
  const scenarioTextures = [
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [ -1,  3, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35,  4, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1,  5,  6,  6,  6,  6,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 60, 61, 62, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 23, 38, 38, 38, 39, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 93, 94, 95, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 34, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,132,133,100, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 25,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  7, 60, 61, 61, 61, 61, 61, 61, 61, 62,  5,  6,  6,  7,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 79, 80, 80, 80, 80, 80, 80, 80, 81, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, 37, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 93, 94, 94, 94, 94, 94, 94, 94, 95, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,129,130,128, -1, -1, -1, -1, -1, -1, -1, -1,128, -1, -1, -1, -1, -1, -1, -1, -1, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,141,142, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 22, 23, 23, 24,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1,  5,  6,  6,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 22, 23,129,130,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1,  5, 26,124, 38, 39, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  5,  6,  6,  7, 38,141,142,114, -1],
    [ -1,117, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,118, -1],
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    
  ]

  // prettier-ignore
  collisionsMap = [
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  ]

  scenarioTextures.forEach((row, rowIndex) => {
    row.forEach((colValue, colIndex) => {
      if (colValue === -1) return;
      const texturesArray = Object.values(terrainTextures);
      const texture = texturesArray[colValue];
      const sprite = new Sprite(texture);
      sprite.position.set(colIndex * texture.width, rowIndex * texture.height);
      gameContainer.addChild(sprite);
    });
  });
}

function setPlayer() {
  player = new PIXI.AnimatedSprite(
    resources.player_appearing.spritesheet.animations.player_appearing
  );
  player.appearing = true;
  player.loop = false;
  player.vx = 0;
  player.vy = 0;
  player.healthPoints = 4;
  player.fruits = 0;
  player.hasKey = false;
  player.increaseFruits = function () {
    this.fruits++;
  };
  player.position.set(480, 220);
  player.animationSpeed = 0.2;
  player.scale.x = -1;
  player.anchor.x = 1;
  player.hasCollidedWith = function (object) {
    return (
      this.x < object.position.x + object.width &&
      this.x + this.width > object.position.x &&
      this.y < object.y + object.height &&
      this.height + this.y > object.y
    );
  };
  player.play();
  player.onComplete = function () {
    this.appearing = false;
    this.loop = true;
    player.position.set(510, 250);
    player.animationSpeed = 0.3;
  };
  gameContainer.addChild(player);
}

function setRockHeads() {
  const rockHead = new PIXI.AnimatedSprite([resources.rock_head_idle.texture]);
  const rockHeadHit = ({ animation } = {}) => {
    rockHead.textures = animation;
    rockHead.play();
    rockHead.loop = false;
    rockHead.onComplete = () => {
      rockHead.textures = [resources.rock_head_idle.texture];
    };
  };
  rockHead.position.set(50, 27 + 100);
  rockHead.velocity = 4;
  rockHead.direction = 1;
  rockHead.vx = 4;
  rockHead.vy = 4;
  rockHead.start = { x: 50, y: 27 };
  rockHead.end = { x: 50, y: 283 };
  rockHead.animationSpeed = 0.3;
  rockHead.play();
  rockHead.topHit = function () {
    rockHeadHit({
      animation:
        resources.rock_head_top_hit.spritesheet.animations.rock_head_top_hit,
    });
  };
  rockHead.bottomHit = function () {
    rockHeadHit({
      animation:
        resources.rock_head_bottom_hit.spritesheet.animations
          .rock_head_bottom_hit,
    });
    shake(100);
  };

  rockHead.routine = function () {
    let progressX;
    let progressY;
    let goal;

    if (this.direction === 1) {
      progressX = this.end.x - this.position.x;
      progressY = this.end.y - this.position.y;
      goal = { x: this.end.x, y: this.end.y };
      if (progressY === 0) this.bottomHit();
    } else if (this.direction === -1) {
      progressX = this.position.x - this.start.x;
      progressY = this.position.y - this.start.y;
      goal = { x: this.start.x, y: this.start.y };
      if (progressY === 0) this.topHit();
    }

    if (progressX !== 0)
      this.position.x =
        progressX <= this.velocity
          ? goal.x
          : this.position.x + this.velocity * this.direction;

    if (progressY !== 0)
      this.position.y =
        progressY <= this.velocity
          ? goal.y
          : this.position.y + this.velocity * this.direction;

    if (progressX === 0 && progressY === 0) {
      this.direction = -this.direction;
    }
  };
  setInterval(() => {
    rockHead.textures =
      resources.rock_head_blink.spritesheet.animations.rock_head_blink;
    rockHead.play();
  }, 1000);

  rockHeads.push(rockHead);
  gameContainer.addChild(rockHead);
}

function setBoxes() {
  // const boxPiece1 = new PIXI.Sprite(resources.box_break.textures.box_break_0);
  // const boxPiece2 = new PIXI.Sprite(resources.box_break.textures.box_break_1);
  // const boxPiece3 = new PIXI.Sprite(resources.box_break.textures.box_break_2);
  // const boxPiece4 = new PIXI.Sprite(resources.box_break.textures.box_break_3);

  const boxesConfig = [
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 150, y: 149 },
      end: { x: 150, y: 151 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 170, y: 149 },
      end: { x: 170, y: 151 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 300, y: 259 },
      end: { x: 300, y: 261 },
    },
    {
      nHits: 1,
      velocity: 0.05,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 320, y: 259 },
      end: { x: 320, y: 261 },
    },
    {
      nHits: 3,
      velocity: 0.05,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 340, y: 259 },
      end: { x: 340, y: 261 },
    },
  ];

  boxesConfig.forEach((boxConfig) => {
    const box = new PIXI.AnimatedSprite([resources.box_idle.texture]);
    box.velocity = boxConfig.velocity;
    box.direction = boxConfig.direction;
    box.vx = boxConfig.vx;
    box.vy = boxConfig.vy;
    box.start = boxConfig.start;
    box.end = boxConfig.end;
    box.position.set(boxConfig.start.x, boxConfig.start.y);
    box.animationSpeed = 0.3;
    box.play();

    box.hit = function () {
      this.nHitsDone = this.nHitsDone || 0;
      this.textures = resources.box_hit.spritesheet.animations.box_hit;
      this.play();
      this.loop = false;

      this.onComplete = () => {
        this.nHitsDone += 1;
        box.textures = [resources.box_idle.texture];
        if (this.nHitsDone === boxConfig.nHits) {
          boxes.splice(boxes.indexOf(box), 1);
          gameContainer.removeChild(this);
          this.destroy();
        }
      };
    };

    box.routine = function () {
      let progressX;
      let progressY;
      let goal;

      if (this.direction === 1) {
        progressX = this.end.x - this.position.x;
        progressY = this.end.y - this.position.y;
        goal = { x: this.end.x, y: this.end.y };
      } else if (this.direction === -1) {
        progressX = this.position.x - this.start.x;
        progressY = this.position.y - this.start.y;
        goal = { x: this.start.x, y: this.start.y };
      }

      if (progressX !== 0)
        this.position.x =
          progressX <= this.velocity
            ? goal.x
            : this.position.x + this.velocity * this.direction;

      if (progressY !== 0)
        this.position.y =
          progressY <= this.velocity
            ? goal.y
            : this.position.y + this.velocity * this.direction;

      if (progressX === 0 && progressY === 0) {
        this.direction = -this.direction;
      }
    };

    // box.routine = function () {};
    gameContainer.addChild(box);
    boxes.push(box);
  });
}

function setSlimes() {
  const slimesConfig = [
    {
      velocity: 0.5,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 200, y: 178 },
      end: { x: 300, y: 178 },
      animationSpeed: 0.1,
    },
    {
      velocity: 1,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 350, y: 178 },
      end: { x: 500, y: 178 },
      animationSpeed: 0.3,
    },
  ];

  slimesConfig.forEach((slimeConfig) => {
    const slime = new PIXI.AnimatedSprite(
      resources.slime_idle_run.spritesheet.animations.slime_idle_run
    );
    slime.velocity = slimeConfig.velocity;
    slime.direction = slimeConfig.direction;
    slime.vx = slimeConfig.vx;
    slime.vy = slimeConfig.vy;
    slime.start = slimeConfig.start;
    slime.end = slimeConfig.end;
    slime.position.set(slimeConfig.start.x, slimeConfig.start.y);
    slime.animationSpeed = slimeConfig.animationSpeed;
    slime.play();

    slime.routine = function () {
      let progressX;
      let progressY;
      let goal;

      if (this.direction === 1) {
        progressX = this.end.x - this.position.x;
        progressY = this.end.y - this.position.y;
        goal = { x: this.end.x, y: this.end.y };
        this.scale.x = -1;
        this.anchor.x = 1;
      } else if (this.direction === -1) {
        progressX = this.position.x - this.start.x;
        progressY = this.position.y - this.start.y;
        goal = { x: this.start.x, y: this.start.y };
        this.scale.x = 1;
        this.anchor.x = 0;
      }

      if (progressX !== 0)
        this.position.x =
          progressX <= this.velocity
            ? goal.x
            : this.position.x + this.velocity * this.direction;

      if (progressY !== 0)
        this.position.y =
          progressY <= this.velocity
            ? goal.y
            : this.position.y + this.velocity * this.direction;

      if (progressX === 0 && progressY === 0) {
        this.direction = -this.direction;
      }
    };
    gameContainer.addChild(slime);
    slimes.push(slime);
  });
}

function setRabbits() {
  const rabbitsConfig = [
    {
      velocity: 1,
      direction: 1,
      vx: 4,
      vy: 4,
      start: { x: 400, y: 165 },
      end: { x: 500, y: 165 },
    },
  ];

  rabbitsConfig.forEach((rabbitConfig) => {
    const rabbit = new PIXI.AnimatedSprite(
      resources.rabbit_run.spritesheet.animations.rabbit_run
    );
    rabbit.position.set(rabbitConfig.start.x, rabbitConfig.start.y);
    rabbit.animationSpeed = 0.3;
    rabbit.play();
    rabbit.velocity = rabbitConfig.velocity;
    rabbit.direction = rabbitConfig.direction;
    rabbit.vx = rabbitConfig.vx;
    rabbit.vy = rabbitConfig.vy;
    rabbit.start = rabbitConfig.start;
    rabbit.end = rabbitConfig.end;

    rabbit.routine = function () {
      let progressX;
      let progressY;
      let goal;

      if (this.direction === 1) {
        progressX = this.end.x - this.position.x;
        progressY = this.end.y - this.position.y;
        goal = { x: this.end.x, y: this.end.y };
        this.scale.x = -1;
        this.anchor.x = 1;
      } else if (this.direction === -1) {
        progressX = this.position.x - this.start.x;
        progressY = this.position.y - this.start.y;
        goal = { x: this.start.x, y: this.start.y };
        this.scale.x = 1;
        this.anchor.x = 0;
      }

      if (progressX !== 0)
        this.position.x =
          progressX <= this.velocity
            ? goal.x
            : this.position.x + this.velocity * this.direction;

      if (progressY !== 0)
        this.position.y =
          progressY <= this.velocity
            ? goal.y
            : this.position.y + this.velocity * this.direction;

      if (progressX === 0 && progressY === 0) {
        this.direction = -this.direction;
      }
    };
    gameContainer.addChild(rabbit);
    rabbits.push(rabbit);
  });
}

function setPlatform() {
  platform = new PIXI.AnimatedSprite(
    resources.platform_on.spritesheet.animations.platform_on
  );
  platform.animationSpeed = 0.3;
  platform.velocity = 2;
  platform.direction = 1;
  platform.vx = 4;
  platform.vy = 4;
  platform.start = { x: 220, y: 80 };
  platform.end = { x: 490, y: 80 };

  platform.position.set(platform.start.x, platform.start.y);
  platform.play();

  platform.routine = function () {
    let progressX;
    let progressY;
    let goal;

    if (this.direction === 1) {
      progressX = this.end.x - this.position.x;
      progressY = this.end.y - this.position.y;
      goal = { x: this.end.x, y: this.end.y };
    } else if (this.direction === -1) {
      progressX = this.position.x - this.start.x;
      progressY = this.position.y - this.start.y;
      goal = { x: this.start.x, y: this.start.y };
    }

    if (progressX !== 0)
      this.position.x =
        progressX <= this.velocity
          ? goal.x
          : this.position.x + this.velocity * this.direction;

    if (progressY !== 0)
      this.position.y =
        progressY <= this.velocity
          ? goal.y
          : this.position.y + this.velocity * this.direction;

    if (progressX === 0 && progressY === 0) {
      this.direction = -this.direction;
    }
  };
  gameContainer.addChild(platform);
}

function setKey() {
  key = new PIXI.AnimatedSprite([resources.key.texture]);
  key.velocity = 0.2;
  key.direction = 1;
  key.vx = 4;
  key.vy = 4;
  key.start = { x: 555, y: 185 };
  key.end = { x: 555, y: 190 };
  key.position.set(key.start.x, key.start.y);

  key.float = function () {
    let progressX;
    let progressY;
    let goal;

    if (this.direction === 1) {
      progressX = this.end.x - this.position.x;
      progressY = this.end.y - this.position.y;
      goal = { x: this.end.x, y: this.end.y };
    } else if (this.direction === -1) {
      progressX = this.position.x - this.start.x;
      progressY = this.position.y - this.start.y;
      goal = { x: this.start.x, y: this.start.y };
    }

    if (progressX !== 0)
      this.position.x =
        progressX <= this.velocity
          ? goal.x
          : this.position.x + this.velocity * this.direction;

    if (progressY !== 0)
      this.position.y =
        progressY <= this.velocity
          ? goal.y
          : this.position.y + this.velocity * this.direction;

    if (progressX === 0 && progressY === 0) {
      this.direction = -this.direction;
    }
  };

  key.collected = function () {
    key = undefined;
    this.textures =
      resources.fruit_collected.spritesheet.animations.fruit_collected;
    this.loop = false;
    this.play();
    this.onComplete = function () {
      gameContainer.removeChild(this);
      this.destroy();
    };
  };

  gameContainer.addChild(key);
}

function setHealthBar() {
  healthBar = new PIXI.Graphics();
  healthBar.beginFill(0x000000);
  healthBar.drawRect(0, 0, 100, 10);
  healthBar.endFill();
  healthBar.position.set(23, 10);
  healthBar.scale.set(1, 1);
  healthBar.setHealthPoints = function setHealthPoints(healthPoints = 4) {
    this.healthPoints = healthPoints;
  };
  healthBar.incrementHealthPoints = function incrementHealthPoints() {
    this.healthPoints += 1;
  };
  healthBar.decrementHealthPoints = function decrementHealthPoints() {
    this.healthPoints -= 1;
  };
  gameContainer.addChild(healthBar);
  healthBar.setHealthPoints(player.healthPoints);
}

function setUI() {
  const topBar = new PIXI.Container();
  topBar.position.set(23, 10);
  topBar.scale.set(1, 1);
  UIContainer.addChild(topBar);

  const healthText = "health:";
  for (let i = 0; i < healthText.length; i++) {
    const letter = healthText[i];
    const textSprite = textToSprite(letter, "white");
    textSprite.scale.set(0.5);
    textSprite.position.set(0 + 4 * i, 3);
    topBar.addChild(textSprite);
  }
  for (let i = 0; i < player.healthPoints; i++) {
    const heart = new PIXI.AnimatedSprite(
      resources.heart_idle.spritesheet.animations.heart_idle
    );
    heart.animationSpeed = 0.1;
    heart.position.set(30 + i * 10, 0);
    heart.scale.set(0.8);
    heart.play();
    topBar.addChild(heart);
  }
}

function setup() {
  setBackground();
  setMainScene();
  setStartPoint();
  setEndPoint();
  setPlatform();
  setPlayer();
  setRockHeads();
  setSlimes();
  setHealthBar();
  setFruits();
  setCheckpoints();
  setBoxes();
  setKey();
  setUI();

  app.ticker.add(gameLoop);
}

loader
  .add("background", "./assets/images/background.json")
  .add("terrain", "./assets/images/terrain.json")
  .add("shadow", "./assets/images/shadow.png")
  .add("player_idle", "./assets/images/player_idle.json")
  .add("player_run", "./assets/images/player_run.json")
  .add("player_jump", "./assets/images/player_jump.png")
  .add("player_fall", "./assets/images/player_fall.png")
  .add("player_appearing", "./assets/images/player_appearing.json")
  .add("player_disappearing", "./assets/images/player_desappearing.json")
  .add("rock_head_idle", "./assets/images/rock_head_idle.png")
  .add("rock_head_blink", "./assets/images/rock_head_blink.json")
  .add("rock_head_top_hit", "./assets/images/rock_head_top_hit.json")
  .add("rock_head_bottom_hit", "./assets/images/rock_head_bottom_hit.json")
  .add("apple", "./assets/images/apple.json")
  .add("banana", "./assets/images/banana.json")
  .add("orange", "./assets/images/orange.json")
  .add("melon", "./assets/images/melon.json")
  .add("fruit_collected", "./assets/images/fruit_collected.json")
  .add("start", "./assets/images/start.json")
  .add("start_idle", "./assets/images/start_idle.png")
  .add("checkpoint_noflag", "./assets/images/checkpoint_noflag.png")
  .add("flag_out", "./assets/images/flag_out.json")
  .add("flag_idle", "./assets/images/flag_idle.json")
  .add("box_idle", "./assets/images/box_idle.png")
  .add("box_break", "./assets/images/box_break.json")
  .add("box_hit", "./assets/images/box_hit.json")
  .add("slime_idle_run", "./assets/images/slime_run_idle.json")
  .add("rabbit_idle", "./assets/images/rabbit_idle.json")
  .add("rabbit_hit", "./assets/images/rabbit_hit.json")
  .add("rabbit_run", "./assets/images/rabbit_run.json")
  .add("end_pressed", "./assets/images/end_pressed.json")
  .add("end_idle", "./assets/images/end_idle.png")
  .add("platform_on", "./assets/images/platform_on.json")
  .add("platform_off", "./assets/images/platform_off.png")
  .add("key", "./assets/images/key.png")
  .add("text_black", "./assets/images/text_black.json")
  .add("text_white", "./assets/images/text_white.json")
  .add("heart_idle", "./assets/images/heart_idle.json")
  .add("heart_hit", "./assets/images/heart_hit.json")
  .load(setup);
