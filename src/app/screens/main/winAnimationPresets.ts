import type { EmitterBlendMode } from "./VFXEmitter";

export type WinEmitterPreset = {
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
};

export type WinAnimationPreset = {
  name: "small" | "big" | "mega" | "freeze" | "shatter";
  intensity: number;
  phase: {
    anticipationMs: number;
    impactMs: number;
    settleMs: number;
  };
  flashPeakAlpha: number;
  rays: {
    alpha: number;
    scaleX: number;
    scaleY: number;
    spinPerSecond: number;
  };
  burst: WinEmitterPreset;
  spark: WinEmitterPreset;
  confetti: WinEmitterPreset;
};

export const SMALL_WIN_PRESET: WinAnimationPreset = {
  name: "small",
  intensity: 0.8,
  phase: {
    anticipationMs: 130,
    impactMs: 90,
    settleMs: 220,
  },
  flashPeakAlpha: 0.4,
  rays: {
    alpha: 0.35,
    scaleX: 0.18,
    scaleY: 1.1,
    spinPerSecond: 0.35,
  },
  burst: {
    count: 14,
    speedMin: 2,
    speedMax: 8,
    scaleMin: 0.06,
    scaleMax: 0.16,
    lifeMinMs: 260,
    lifeMaxMs: 550,
    drag: 0.96,
    gravity: 0.02,
    spinMin: -0.08,
    spinMax: 0.08,
    fade: true,
    blendMode: "add",
    alphaStart: 0.85,
  },
  spark: {
    count: 8,
    speedMin: 1,
    speedMax: 4,
    scaleMin: 0.04,
    scaleMax: 0.1,
    lifeMinMs: 220,
    lifeMaxMs: 430,
    drag: 0.93,
    gravity: -0.01,
    spinMin: -0.06,
    spinMax: 0.06,
    fade: true,
    blendMode: "add",
    alphaStart: 0.75,
  },
  confetti: {
    count: 9,
    speedMin: 1.5,
    speedMax: 5,
    scaleMin: 0.05,
    scaleMax: 0.12,
    lifeMinMs: 520,
    lifeMaxMs: 900,
    drag: 0.985,
    gravity: 0.1,
    spinMin: -0.16,
    spinMax: 0.16,
    fade: true,
    blendMode: "normal",
    alphaStart: 0.85,
  },
};

export const BIG_WIN_PRESET: WinAnimationPreset = {
  name: "big",
  intensity: 1.2,
  phase: {
    anticipationMs: 170,
    impactMs: 110,
    settleMs: 260,
  },
  flashPeakAlpha: 0.54,
  rays: {
    alpha: 0.46,
    scaleX: 0.21,
    scaleY: 1.45,
    spinPerSecond: 0.4,
  },
  burst: {
    count: 24,
    speedMin: 3,
    speedMax: 11,
    scaleMin: 0.08,
    scaleMax: 0.2,
    lifeMinMs: 320,
    lifeMaxMs: 650,
    drag: 0.96,
    gravity: 0.03,
    spinMin: -0.1,
    spinMax: 0.1,
    fade: true,
    blendMode: "add",
    alphaStart: 0.92,
  },
  spark: {
    count: 12,
    speedMin: 1,
    speedMax: 5,
    scaleMin: 0.04,
    scaleMax: 0.12,
    lifeMinMs: 240,
    lifeMaxMs: 500,
    drag: 0.93,
    gravity: -0.01,
    spinMin: -0.08,
    spinMax: 0.08,
    fade: true,
    blendMode: "add",
    alphaStart: 0.8,
  },
  confetti: {
    count: 15,
    speedMin: 2,
    speedMax: 7,
    scaleMin: 0.05,
    scaleMax: 0.14,
    lifeMinMs: 600,
    lifeMaxMs: 1100,
    drag: 0.985,
    gravity: 0.12,
    spinMin: -0.18,
    spinMax: 0.18,
    fade: true,
    blendMode: "normal",
    alphaStart: 0.95,
  },
};

export const MEGA_WIN_PRESET: WinAnimationPreset = {
  name: "mega",
  intensity: 1.6,
  phase: {
    anticipationMs: 210,
    impactMs: 130,
    settleMs: 300,
  },
  flashPeakAlpha: 0.68,
  rays: {
    alpha: 0.6,
    scaleX: 0.24,
    scaleY: 1.9,
    spinPerSecond: 0.45,
  },
  burst: {
    count: 36,
    speedMin: 3,
    speedMax: 13,
    scaleMin: 0.09,
    scaleMax: 0.24,
    lifeMinMs: 350,
    lifeMaxMs: 760,
    drag: 0.96,
    gravity: 0.035,
    spinMin: -0.12,
    spinMax: 0.12,
    fade: true,
    blendMode: "add",
    alphaStart: 0.98,
  },
  spark: {
    count: 18,
    speedMin: 1,
    speedMax: 6,
    scaleMin: 0.05,
    scaleMax: 0.14,
    lifeMinMs: 260,
    lifeMaxMs: 560,
    drag: 0.92,
    gravity: -0.008,
    spinMin: -0.1,
    spinMax: 0.1,
    fade: true,
    blendMode: "add",
    alphaStart: 0.88,
  },
  confetti: {
    count: 24,
    speedMin: 2,
    speedMax: 8,
    scaleMin: 0.06,
    scaleMax: 0.16,
    lifeMinMs: 700,
    lifeMaxMs: 1300,
    drag: 0.985,
    gravity: 0.13,
    spinMin: -0.22,
    spinMax: 0.22,
    fade: true,
    blendMode: "normal",
    alphaStart: 0.98,
  },
};

export const FREEZE_WIN_PRESET: WinAnimationPreset = {
  name: "freeze",
  intensity: 0.7,
  phase: {
    anticipationMs: 80,
    impactMs: 90,
    settleMs: 500,
  },
  flashPeakAlpha: 0.58,
  rays: {
    alpha: 0.48,
    scaleX: 0.2,
    scaleY: 1.25,
    spinPerSecond: 0.08,
  },
  burst: {
    count: 18,
    speedMin: 1,
    speedMax: 4,
    scaleMin: 0.05,
    scaleMax: 0.12,
    lifeMinMs: 500,
    lifeMaxMs: 1100,
    drag: 0.992,
    gravity: -0.005,
    spinMin: -0.03,
    spinMax: 0.03,
    fade: true,
    blendMode: "add",
    alphaStart: 0.75,
  },
  spark: {
    count: 12,
    speedMin: 0.6,
    speedMax: 2.2,
    scaleMin: 0.03,
    scaleMax: 0.08,
    lifeMinMs: 600,
    lifeMaxMs: 1200,
    drag: 0.995,
    gravity: -0.006,
    spinMin: -0.02,
    spinMax: 0.02,
    fade: true,
    blendMode: "add",
    alphaStart: 0.7,
  },
  confetti: {
    count: 6,
    speedMin: 0.5,
    speedMax: 2,
    scaleMin: 0.04,
    scaleMax: 0.09,
    lifeMinMs: 700,
    lifeMaxMs: 1300,
    drag: 0.995,
    gravity: 0.02,
    spinMin: -0.03,
    spinMax: 0.03,
    fade: true,
    blendMode: "normal",
    alphaStart: 0.55,
  },
};

export const SHATTER_WIN_PRESET: WinAnimationPreset = {
  name: "shatter",
  intensity: 1.9,
  phase: {
    anticipationMs: 40,
    impactMs: 140,
    settleMs: 260,
  },
  flashPeakAlpha: 0.82,
  rays: {
    alpha: 0.72,
    scaleX: 0.26,
    scaleY: 2.15,
    spinPerSecond: 0.62,
  },
  burst: {
    count: 52,
    speedMin: 4,
    speedMax: 16,
    scaleMin: 0.09,
    scaleMax: 0.26,
    lifeMinMs: 300,
    lifeMaxMs: 700,
    drag: 0.95,
    gravity: 0.04,
    spinMin: -0.2,
    spinMax: 0.2,
    fade: true,
    blendMode: "add",
    alphaStart: 1,
  },
  spark: {
    count: 26,
    speedMin: 2,
    speedMax: 8,
    scaleMin: 0.05,
    scaleMax: 0.15,
    lifeMinMs: 220,
    lifeMaxMs: 560,
    drag: 0.9,
    gravity: -0.005,
    spinMin: -0.15,
    spinMax: 0.15,
    fade: true,
    blendMode: "add",
    alphaStart: 0.95,
  },
  confetti: {
    count: 30,
    speedMin: 2,
    speedMax: 10,
    scaleMin: 0.06,
    scaleMax: 0.17,
    lifeMinMs: 700,
    lifeMaxMs: 1450,
    drag: 0.98,
    gravity: 0.16,
    spinMin: -0.24,
    spinMax: 0.24,
    fade: true,
    blendMode: "normal",
    alphaStart: 1,
  },
};

export const WIN_ANIMATION_PRESETS = {
  small: SMALL_WIN_PRESET,
  big: BIG_WIN_PRESET,
  mega: MEGA_WIN_PRESET,
  freeze: FREEZE_WIN_PRESET,
  shatter: SHATTER_WIN_PRESET,
} as const;
