import { CompositeTilemap } from "@pixi/tilemap";

export default function setBackground(gameContainer) {
  const backgroundTilemap = new CompositeTilemap();
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
