/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
import "./assets/styles/style.css";
import * as PIXI from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";

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

const app = new Application({
  backgroundColor: 0x211f30,
  width,
  height,
  roundPixels: true,
  antialias: true,
  transparent: false,
  resolution: window.devicePixelRatio || 1,
});

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

function testCollision(worldX, worldY) {
  const mapX = Math.floor(worldX / tileSize);
  const mapY = Math.floor(worldY / tileSize);
  return collisionsMap[mapY][mapX];
}

const kb = new Keyboard();
kb.watch(document.body);

function gameLoop(delta) {
  touchingGround =
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
      if (testCollision(testX1, testY) || testCollision(testX2, testY)) {
        player.vy = 0;
        break;
      }
      player.y -= 1;
    }
  }

  if (player.jumped) {
    console.log(player.vy, player.jumped);
    if (player.vy < 0 && player.textures !== [resources.player_jump.texture]) {
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
      player.textures !== resources.player_run.spritesheet.animations.player_run
    ) {
      player.textures = resources.player_run.spritesheet.animations.player_run;
      player.play();
    }
  } else if (
    player.textures !== resources.player_idle.spritesheet.animations.player_idle
  ) {
    player.textures = resources.player_idle.spritesheet.animations.player_idle;
    player.play();
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
    player.vx = Math.min(8, player.vx + 2);
  }
  if (kb.pressed.ArrowLeft) {
    player.direction = 1;
    player.vx = Math.max(-8, player.vx - 2);
  }
  if (!kb.pressed.ArrowUp && touchingGround && player.jumped) {
    player.jumped = false;
  }
  if (kb.pressed.ArrowUp && touchingGround && !player.jumped) {
    player.vy = -20;
    player.jumped = true;
  }
}

function printBackground(container) {
  backgroundTilemap = new CompositeTilemap();
  // prettier-ignore
  const backgroundMatrix = [
    [ 6, 5, 5, 5, 5, 5, 5, 5, 5, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, ],
    [ 7, 1, 1, 1, 1, 1, 1, 1, 1, 3],
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
          // tileWidth: 32,
        });
      }
      if (col === 3) {
        backgroundTilemap.tile("green", x, y, {
          // tileHeight: 32,
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
    });
  });
  container.addChild(backgroundTilemap);
}

function setup() {
  const gameContainerWidth = 1000;
  const gameContainerHeight = gameContainerWidth / resolutionRatio;

  const gameContainer = new Container();
  gameContainer.width = width;
  gameContainer.height = height;
  gameContainer.x = 0;
  gameContainer.y = 0;
  app.stage.addChild(gameContainer);

  printBackground(gameContainer);

  const terrainTextures = resources.terrain.textures;
  // prettier-ignore
  const scenarioTextures = [
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [ -1,  3, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35,  4, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 34, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1, -1, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,132,133,100, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,114, -1],
    [ -1,117, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97,118, -1],
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    
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

  // prettier-ignore
  collisionsMap = [
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    
  ]

  player = new PIXI.AnimatedSprite(
    resources.player_idle.spritesheet.animations.player_idle
  );
  player.vx = 0;
  player.vy = 0;
  // player.scale.x = -1;
  // player.anchor.x = 1;
  // player.scale.x = 1;
  player.position.set(32, 0);
  player.animationSpeed = 0.3;
  player.play();
  gameContainer.addChild(player);

  const rockHead = new Sprite(resources.rock_head_idle.texture);
  rockHead.position.set(620, 380);
  gameContainer.addChild(rockHead);

  app.ticker.add(gameLoop);
}

loader
  .add("background", "./assets/images/background.json")
  .add("terrain", "./assets/images/terrain.json")
  .add("player_idle", "./assets/images/player_idle.json")
  .add("player_run", "./assets/images/player_run.json")
  .add("player_jump", "./assets/images/player_jump.png")
  .add("player_fall", "./assets/images/player_fall.png")
  .add("rock_head_idle", "./assets/images/rock_head_idle.png")
  .load(setup);
