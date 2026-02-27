import { animate } from "motion";
import { Container, Graphics, Sprite, Texture } from "pixi.js";

import { VFXEmitter } from "./VFXEmitter";
import { sampleDominantTextureColor } from "./sampleDominantTextureColor";
import {
  BIG_WIN_PRESET,
  MEGA_WIN_PRESET,
  SMALL_WIN_PRESET,
} from "./winAnimationPresets";
import type { WinAnimationPreset } from "./winAnimationPresets";

export class WinVFXController {
  public readonly root = new Container();

  public readonly bgFlashLayer = new Container();
  public readonly radialLightLayer = new Container();
  public readonly burstLayer = new Container();
  public readonly coinShardLayer = new Container();
  public readonly foregroundSparkLayer = new Container();
  public readonly uiOverlayLayer = new Container();

  private readonly flash = new Graphics();
  private readonly rays: Sprite[] = [];
  private readonly burstEmitter: VFXEmitter;
  private readonly sparkEmitter: VFXEmitter;
  private readonly confettiEmitter: VFXEmitter;

  private width = 1280;
  private height = 720;
  private activeThemeColor = 0xffffff;
  private activeRaySpinPerSecond = MEGA_WIN_PRESET.rays.spinPerSecond;
  private readonly colorCache = new Map<string, number>();

  constructor(textureNames: string[]) {
    this.root.addChild(
      this.bgFlashLayer,
      this.radialLightLayer,
      this.burstLayer,
      this.coinShardLayer,
      this.foregroundSparkLayer,
      this.uiOverlayLayer,
    );

    this.bgFlashLayer.addChild(this.flash);
    this.redrawFlash();

    this.burstEmitter = new VFXEmitter(this.burstLayer, textureNames);
    this.sparkEmitter = new VFXEmitter(this.foregroundSparkLayer, textureNames);
    this.confettiEmitter = new VFXEmitter(this.coinShardLayer, textureNames);

    const rayTexture = textureNames[0] ?? "logo.svg";
    for (let i = 0; i < 8; i++) {
      const ray = new Sprite(Texture.from(rayTexture));
      ray.anchor.set(0.5);
      ray.tint = 0xffffff;
      ray.alpha = 0.2;
      ray.blendMode = "add";
      ray.scale.set(0.18, 0.8);
      ray.rotation = (Math.PI * 2 * i) / 8;
      this.radialLightLayer.addChild(ray);
      this.rays.push(ray);
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.redrawFlash();
  }

  public update(deltaMs: number): void {
    this.burstEmitter.update(deltaMs);
    this.sparkEmitter.update(deltaMs);
    this.confettiEmitter.update(deltaMs);

    const step = deltaMs / 1000;
    for (const ray of this.rays) {
      ray.rotation += this.activeRaySpinPerSecond * step;
      ray.alpha *= 0.985;
    }
  }

  public playSmallWin(centerX: number, centerY: number): void {
    this.playPreset(SMALL_WIN_PRESET, centerX, centerY);
  }

  public playBigWin(centerX: number, centerY: number): void {
    this.playPreset(BIG_WIN_PRESET, centerX, centerY);
  }

  public playMegaWin(centerX: number, centerY: number): void {
    this.playPreset(MEGA_WIN_PRESET, centerX, centerY);
  }

  public setThemeColor(color: number): void {
    this.activeThemeColor = color;
    this.redrawFlash();
  }

  public setThemeFromTexture(textureName: string): number {
    const cachedColor = this.colorCache.get(textureName);
    if (cachedColor !== undefined) {
      this.setThemeColor(cachedColor);
      return cachedColor;
    }

    const sampledColor = sampleDominantTextureColor(textureName);
    if (sampledColor === undefined) {
      return this.activeThemeColor;
    }

    this.colorCache.set(textureName, sampledColor);
    this.setThemeColor(sampledColor);
    return sampledColor;
  }

  public playPreset(
    preset: WinAnimationPreset,
    centerX: number,
    centerY: number,
  ): void {
    this.activeRaySpinPerSecond = preset.rays.spinPerSecond;

    this.radialLightLayer.position.set(centerX, centerY);
    for (const ray of this.rays) {
      ray.alpha = preset.rays.alpha;
      ray.scale.set(preset.rays.scaleX, preset.rays.scaleY);
      ray.tint = this.activeThemeColor;
    }

    this.flash.alpha = 0;
    animate(
      this.flash,
      { alpha: preset.flashPeakAlpha },
      {
        duration: preset.phase.impactMs / 1000,
        delay: preset.phase.anticipationMs / 1000,
        ease: "easeOut",
      },
    )
      .then(() =>
        animate(
          this.flash,
          { alpha: 0 },
          { duration: preset.phase.settleMs / 1000, ease: "easeIn" },
        ),
      )
      .catch(() => {
        this.flash.alpha = 0;
      });

    this.burstEmitter.spawn({
      centerX,
      centerY,
      tint: this.activeThemeColor,
      ...preset.burst,
    });

    this.sparkEmitter.spawn({
      centerX,
      centerY,
      tint: this.activeThemeColor,
      ...preset.spark,
    });

    this.confettiEmitter.spawn({
      centerX,
      centerY,
      tint: this.activeThemeColor,
      ...preset.confetti,
    });
  }

  public clear(): void {
    this.burstEmitter.clear();
    this.sparkEmitter.clear();
    this.confettiEmitter.clear();
    this.flash.alpha = 0;
    for (const ray of this.rays) {
      ray.alpha = 0;
    }
  }

  private redrawFlash(): void {
    this.flash
      .clear()
      .rect(-this.width * 0.5, -this.height * 0.5, this.width, this.height)
      .fill({ color: this.activeThemeColor });
    this.flash.alpha = 0;
    this.flash.blendMode = "add";
  }
}
