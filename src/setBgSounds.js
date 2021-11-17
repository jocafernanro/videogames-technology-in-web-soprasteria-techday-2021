import { Loader } from "pixi.js";
import { Howl } from "howler";

const { resources } = Loader.shared;

export default function setBgSounds() {
  const bgSounds = new Howl(resources.bg_sounds.data);
  // bgSounds.volume(0);
  return bgSounds;
}
