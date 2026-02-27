import { animate } from "motion";
import { Sprite, Texture } from "pixi.js";

import {
  randomBool,
  randomFloat,
  randomInt,
} from "../../../engine/utils/random";

export enum DIRECTION {
  NE,
  NW,
  SE,
  SW,
}

export type LogoSpawnOptions = {
  textureName?: string;
  rotate?: boolean;
  pop?: boolean;
  pulse?: boolean;
  tintColor?: number;
};

export class Logo extends Sprite {
  private static readonly BASE_SCALE = 0.25;
  private readonly rotateEnabled: boolean;
  private readonly pulseEnabled: boolean;
  private readonly pulsePhase: number;
  private popAnimating: boolean;

  public direction!: DIRECTION;
  public speed!: number;

  get left() {
    return -this.width * 0.5;
  }

  get right() {
    return this.width * 0.5;
  }

  get top() {
    return -this.height * 0.5;
  }

  get bottom() {
    return this.height * 0.5;
  }

  constructor(options: LogoSpawnOptions = {}) {
    const textureName =
      options.textureName ?? (randomBool() ? "logo.svg" : "logo-white.svg");
    const startScale = Logo.BASE_SCALE;
    super({
      texture: Texture.from(textureName),
      anchor: 0.5,
      scale: startScale,
    });

    if (typeof options.tintColor === "number") {
      this.tint = options.tintColor;
    }

    this.rotateEnabled = Boolean(options.rotate);
    this.pulseEnabled = Boolean(options.pulse);
    this.pulsePhase = randomFloat(0, Math.PI * 2);
    this.popAnimating = Boolean(options.pop);

    if (options.pop) {
      animate(
        this.scale,
        { x: Logo.BASE_SCALE * 1.45, y: Logo.BASE_SCALE * 1.45 },
        { duration: 0.1, ease: "easeOut" },
      )
        .then(() =>
          animate(
            this.scale,
            { x: Logo.BASE_SCALE, y: Logo.BASE_SCALE },
            { duration: 0.22, ease: "backOut" },
          ),
        )
        .then(() => {
          this.popAnimating = false;
        })
        .catch(() => {
          this.popAnimating = false;
        });
    }

    this.direction = randomInt(0, 3);
    this.speed = randomFloat(1, 6);
  }

  public updateEffects(nowMs: number): void {
    if (this.popAnimating) {
      if (this.rotateEnabled) {
        this.rotation += 0.02;
      }
      return;
    }

    if (this.rotateEnabled) {
      this.rotation += 0.02;
    }

    if (this.pulseEnabled) {
      const pulseScale =
        Logo.BASE_SCALE *
        (1 + Math.sin(nowMs * 0.008 + this.pulsePhase) * 0.12);
      this.scale.set(pulseScale);
    } else if (!this.popAnimating) {
      this.scale.set(Logo.BASE_SCALE);
    }
  }
}
