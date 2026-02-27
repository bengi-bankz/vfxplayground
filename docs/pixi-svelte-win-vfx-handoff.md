# Pixi-Svelte Win VFX Handoff

This explains how to reuse the win VFX preset system from this repo in a Pixi + Svelte project.

## What to copy

Copy these files as a group:

- `src/app/screens/main/VFXEmitter.ts`
- `src/app/screens/main/winAnimationPresets.ts`
- `src/app/screens/main/sampleDominantTextureColor.ts`
- `src/app/screens/main/WinVFXController.ts`
- `src/app/screens/main/vfxPresetIndex.ts`

If you want the same logo tint behavior, also keep your logo spawn logic using `tintColor`.

## What this gives you

- Layered VFX container stack (`bgFlash`, `radialLight`, `burst`, `coinShard`, `foregroundSpark`, `uiOverlay`)
- Reusable animation presets (`small`, `big`, `mega`)
- Pooled particle emitters
- Color theming from selected texture (dominant color sampling + cache)

## Color theming API

Inside `WinVFXController`:

- `setThemeFromTexture(textureName: string): number`
  - Samples dominant color from that texture
  - Caches it
  - Applies it to flash/rays/emitters
  - Returns the color (`0xRRGGBB`)

- `setThemeColor(color: number): void`
  - Direct override if you already know the color

## Minimal Pixi-Svelte usage (copy/paste)

```svelte
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Application, Assets, Ticker } from "pixi.js";
  import {
    WinVFXController,
    MEGA_WIN_PRESET,
  } from "./vfxPresetIndex";

  let host: HTMLDivElement;
  let app: Application;
  let winVfx: WinVFXController;
  let ticker: Ticker;

  const selectedTextureName = "particle (3).png";

  onMount(async () => {
    app = new Application();
    await app.init({ background: "#101014", resizeTo: host });
    host.appendChild(app.canvas);

    // Ensure your texture bundle is loaded before this
    await Assets.load("vfx");

    const textureNames = [
      "particle (1).png",
      "particle (2).png",
      "particle (3).png",
      "particle (4).png",
      "particle (5).png",
      "particle (6).png",
      "particle (7).png",
    ];

    winVfx = new WinVFXController(textureNames);
    app.stage.addChild(winVfx.root);
    winVfx.resize(app.screen.width, app.screen.height);

    const sampled = winVfx.setThemeFromTexture(selectedTextureName);
    console.log("Active VFX theme color:", sampled.toString(16));

    ticker = app.ticker;
    ticker.add((t) => {
      winVfx.update(t.deltaMS);
    });

    const cx = app.screen.width * 0.5;
    const cy = app.screen.height * 0.5;
    winVfx.playPreset(MEGA_WIN_PRESET, cx, cy);
  });

  onDestroy(() => {
    if (ticker && winVfx) {
      ticker.remove((t) => {
        winVfx.update(t.deltaMS);
      });
    }
    if (app) {
      app.destroy(true, { children: true });
    }
  });
</script>

<div bind:this={host} style="width: 100%; height: 100%;"></div>
```

## Typical play flow in your app

1. Load textures
2. Create `WinVFXController(textureNames)`
3. Add `winVfx.root` to stage
4. On texture/asset selection change: `winVfx.setThemeFromTexture(name)`
5. On win event: `winVfx.playSmallWin(...)` or `winVfx.playPreset(MEGA_WIN_PRESET, ...)`
6. On each frame: `winVfx.update(deltaMs)`

## Notes

- The dominant-color sampler uses a small offscreen canvas and weighted bins (alpha + saturation weighted), so it is fast enough for UI selection flow.
- If sampling fails (texture not ready or unsupported source), previous theme color remains active.
- Emitter particles reset tint to white when returned to pool.
