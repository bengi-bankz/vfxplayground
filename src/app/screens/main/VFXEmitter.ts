import { Sprite, Texture } from "pixi.js";
import type { Container } from "pixi.js";

export type EmitterBlendMode = "normal" | "add";

export type EmitterSpawnOptions = {
  centerX: number;
  centerY: number;
  count: number;
  speedMin: number;
  speedMax: number;
  scaleMin: number;
  scaleMax: number;
  lifeMinMs: number;
  lifeMaxMs: number;
  drag: number;
  gravity: number;
  spinMin: number;
  spinMax: number;
  fade: boolean;
  blendMode: EmitterBlendMode;
  alphaStart: number;
  tint?: number;
};

type ParticleState = {
  sprite: Sprite;
  velocityX: number;
  velocityY: number;
  lifeMs: number;
  maxLifeMs: number;
  drag: number;
  gravity: number;
  spin: number;
  fade: boolean;
  alphaStart: number;
};

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randomTextureName = (names: string[]) =>
  names[Math.floor(Math.random() * names.length)];

export class VFXEmitter {
  private readonly layer: Container;
  private readonly textureNames: string[];
  private readonly pools = new Map<string, Sprite[]>();
  private readonly activeParticles: ParticleState[] = [];

  constructor(layer: Container, textureNames: string[]) {
    this.layer = layer;
    this.textureNames = textureNames;
  }

  public spawn(options: EmitterSpawnOptions): void {
    if (this.textureNames.length === 0 || options.count <= 0) return;

    for (let i = 0; i < options.count; i++) {
      const textureName = randomTextureName(this.textureNames);
      const sprite = this.acquire(textureName);
      sprite.name = textureName;

      sprite.position.set(options.centerX, options.centerY);
      sprite.anchor.set(0.5);
      sprite.scale.set(randomBetween(options.scaleMin, options.scaleMax));
      sprite.alpha = options.alphaStart;
      sprite.blendMode = options.blendMode;
      sprite.tint = options.tint ?? 0xffffff;
      sprite.rotation = randomBetween(0, Math.PI * 2);

      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(options.speedMin, options.speedMax);
      const lifeMs = randomBetween(options.lifeMinMs, options.lifeMaxMs);
      const particle: ParticleState = {
        sprite,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        lifeMs,
        maxLifeMs: lifeMs,
        drag: options.drag,
        gravity: options.gravity,
        spin: randomBetween(options.spinMin, options.spinMax),
        fade: options.fade,
        alphaStart: options.alphaStart,
      };

      this.layer.addChild(sprite);
      this.activeParticles.push(particle);
    }
  }

  public update(deltaMs: number): void {
    if (this.activeParticles.length === 0) return;

    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];

      particle.lifeMs -= deltaMs;
      particle.velocityX *= particle.drag;
      particle.velocityY =
        particle.velocityY * particle.drag + particle.gravity;
      particle.sprite.x += particle.velocityX * (deltaMs / 16.6667);
      particle.sprite.y += particle.velocityY * (deltaMs / 16.6667);
      particle.sprite.rotation += particle.spin * (deltaMs / 16.6667);

      if (particle.fade) {
        const progress = Math.max(0, particle.lifeMs / particle.maxLifeMs);
        particle.sprite.alpha = particle.alphaStart * progress;
      }

      if (particle.lifeMs <= 0) {
        this.release(particle.sprite);
        this.activeParticles.splice(i, 1);
      }
    }
  }

  public clear(): void {
    for (const particle of this.activeParticles) {
      this.release(particle.sprite);
    }
    this.activeParticles.length = 0;
  }

  private acquire(textureName: string): Sprite {
    const pool = this.pools.get(textureName);
    if (pool && pool.length > 0) {
      return pool.pop() as Sprite;
    }

    return new Sprite(Texture.from(textureName));
  }

  private release(sprite: Sprite): void {
    const key = sprite.name || "__fallback__";
    const pool = this.pools.get(key) ?? [];

    sprite.removeFromParent();
    sprite.alpha = 1;
    sprite.scale.set(1);
    sprite.tint = 0xffffff;

    pool.push(sprite);
    this.pools.set(key, pool);
  }
}
