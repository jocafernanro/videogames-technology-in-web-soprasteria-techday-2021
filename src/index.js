import "./assets/styles/style.css";
import * as PIXI from "pixi.js";
import { Howl } from "howler";

import setBackground from "./setBackground";
import setMainScene from "./setMainScene";
import setStartPoint from "./setStartPoint";
import setEndPoint from "./setEndPoint";
import setCheckpoints from "./setCheckpoints";
import setFruits from "./setFruits";
import setRockHeads from "./setRockHeads";
import setSlimes from "./setSlimes";
import setPlatform from "./setPlatform";
import setBoxes from "./setBoxes";
import setKey from "./setKey";
import setPlayer from "./setPlayer";
import setUI from "./setUI";
import setSounds from "./setSounds";
import setBgSounds from "./setBgSounds";
import setGameContainer from "./setGameContainer";
import setUIContainer from "./setUIContainer";

import {
  checkCollisionBetweenTwoObjects,
  testCollision,
  hitBox,
  checkOnTop,
  executeRoutine,
} from "./utils";
import Keyboard from "./keyboard";

window.PIXI = PIXI; // remove when finished

const { Application, Container } = PIXI;
const loader = PIXI.Loader.shared;
const { resources } = PIXI.Loader.shared;

const resolutionRatio = 1.7777777777777777;
const width = 1280;
const height = Math.round(width / resolutionRatio);
const tileSize = 16;

let player;
let collisionsMap;
let touchingGround = false;
const checkpoints = [];
const fruits = [];
const rockHeads = [];
const slimes = [];
const boxes = [];
const rabbits = [];
let gameContainer;
let UIContainer;
let topBar;
let key;
let platform;
let endPoint;
let onAPlatform = false;
let lastCheckpoint;
let sounds;
let bgSounds;

const app = new Application({
  backgroundColor: 0x211f30,
  width,
  height,
  roundPixels: true,
  antialias: true,
  backgroundAlpha: 0,
  resolution: 1,
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

app.stage.scale.set(2);

document.querySelector("#main-container").appendChild(app.view);

const kb = new Keyboard();
kb.watch(document.body);

function gameLoop(delta) {
  if (player.dead) return;

  touchingGround =
    onAPlatform ||
    testCollision(
      collisionsMap,
      player.position.x + 2,
      player.position.y + tileSize * 2 + 1
    ) ||
    testCollision(
      collisionsMap,
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
        testCollision(collisionsMap, testX1, testY) ||
        testCollision(collisionsMap, testX2, testY)
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
        hitBox(player, topBar, boxes, testX1, testY) ||
        hitBox(player, topBar, boxes, testX2, testY) ||
        testCollision(collisionsMap, testX1, testY) ||
        testCollision(collisionsMap, testX2, testY)
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
        testCollision(collisionsMap, testX, testY1) ||
        testCollision(collisionsMap, testX, testY2) ||
        testCollision(collisionsMap, testX, testY3)
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
        testCollision(collisionsMap, testX, testY1) ||
        testCollision(collisionsMap, testX, testY2) ||
        testCollision(collisionsMap, testX, testY3)
      ) {
        player.vx = 0;
        break;
      }
      player.x -= 1;
    }
  }

  if (kb.pressed.ArrowRight) {
    player.direction = 0;
    player.vx = Math.min(5, player.vx + 2);
  }
  if (kb.pressed.ArrowLeft) {
    player.direction = 1;
    player.vx = Math.max(-5, player.vx - 2);
  }
  if (!kb.pressed.ArrowUp && (onAPlatform || touchingGround) && player.jumped) {
    sounds.play("landing");
    player.jumped = false;
  }
  if (kb.pressed.ArrowUp && touchingGround && !player.jumped) {
    sounds.play("jump");
    player.vy = -12;
    player.jumped = true;
    onAPlatform = false;
  }

  rockHeads.forEach((rockHead) => {
    executeRoutine(rockHead, rockHead.bottomHit);
    const playerIsOnTopRockHead = checkOnTop(player, rockHead);
    if (playerIsOnTopRockHead && player.vy >= 0) {
      onAPlatform = true;
      player.position.y = rockHead.position.y - 27;
      player.vy = 0;
    }
  });

  fruits.forEach((fruit) => {
    if (checkCollisionBetweenTwoObjects(player, fruit)) {
      player.incrementFruits();
      fruit.collected();
      topBar.setFruits(player.fruits);
    }
  });

  checkpoints.forEach((checkpoint) => {
    if (checkpoint.completed) return;
    if (checkCollisionBetweenTwoObjects(player, checkpoint)) {
      checkpoint.achieved();
      lastCheckpoint = checkpoint;
    }
  });

  boxes.forEach((box) => {
    executeRoutine(box);
    const playerIsOnTopBox = checkOnTop(player, box);
    if (playerIsOnTopBox && player.vy >= 0) {
      onAPlatform = true;
      player.position.y = box.position.y - 30;
      player.vy = 0;
    }
  });

  slimes.forEach((slime) => {
    executeRoutine(slime);
    if (checkCollisionBetweenTwoObjects(player, slime)) {
      player.decreaseHealthPoints(lastCheckpoint);
      topBar.decreaseHealthPoints(player.healthPoints);
    }
  });

  if (checkCollisionBetweenTwoObjects(player, endPoint) && !endPoint.pressed)
    endPoint.finish();

  if (key) {
    key.float();
    if (checkCollisionBetweenTwoObjects(player, key)) {
      player.hasKey = true;
      key.collected();
      topBar.setKeys();
      endPoint.unlock();
      key = undefined;
    }
  }

  const playerIsOnTopPlatform = checkOnTop(player, platform);
  executeRoutine(platform);
  if (playerIsOnTopPlatform && player.vy >= 0) {
    onAPlatform = true;
    player.position.y = platform.position.y - 32;
    if (!kb.pressed.ArrowRight && !kb.pressed.ArrowLeft)
      player.position.x = platform.position.x;
    player.vy = 0;
  }

  if (!player.appearing && !player.invulnerable) {
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

function setup() {
  sounds = setSounds();
  bgSounds = setBgSounds();

  gameContainer = setGameContainer(app, height, width);
  UIContainer = setUIContainer(app, height, width);

  setBackground(app, gameContainer);
  collisionsMap = setMainScene(app, gameContainer);
  setStartPoint(gameContainer);
  endPoint = setEndPoint(gameContainer, collisionsMap, sounds);
  platform = setPlatform(gameContainer);
  setRockHeads(gameContainer, rockHeads);
  setSlimes(gameContainer, slimes);
  setFruits(gameContainer, fruits, sounds);
  lastCheckpoint = setCheckpoints(gameContainer, checkpoints, sounds);
  setBoxes(gameContainer, boxes, sounds);
  key = setKey(gameContainer, sounds);
  player = setPlayer(gameContainer, sounds);
  topBar = setUI(UIContainer, player, sounds, bgSounds);

  bgSounds.play("background");
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
  .add("player_hit", "./assets/images/player_hit.json")
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
  .add("volume_button", "./assets/images/buttons/volume.png")
  .add("restart_button", "./assets/images/buttons/restart.png")
  .add("game_sounds", "./assets/audio/game_sounds.json")
  .add("bg_sounds", "./assets/audio/bg_sounds.json")
  .load(setup);
