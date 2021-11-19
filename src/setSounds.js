import { Loader } from "pixi.js";
import { Howl } from "howler";

const { resources } = Loader.shared;

export default function setSounds() {
  return new Howl(resources.game_sounds.data);
}
