import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import { Assets } from "pixi.js";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";
import type { Spritesheet } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { VolumeSlider } from "../../ui/VolumeSlider";

import { Bouncer } from "./Bouncer";
import { Logo } from "./Logo";
import type { LogoSpawnOptions } from "./Logo";
import { WinVFXController } from "./WinVFXController";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private addButton: FancyButton;
  private removeButton: FancyButton;
  private previousAssetButton: FancyButton;
  private nextAssetButton: FancyButton;
  private rotateButton: FancyButton;
  private popButton: FancyButton;
  private pulseButton: FancyButton;
  private playSmallWinButton: FancyButton;
  private playBigWinButton: FancyButton;
  private playMegaWinButton: FancyButton;
  private playFreezeButton: FancyButton;
  private playShatterButton: FancyButton;
  private clearVfxButton: FancyButton;
  private assetSelectorTitle: Label;
  private selectedAssetLabel: Label;
  private effectsLabel: Label;
  private spawnPositionLabel: Label;
  private spawnXSlider: VolumeSlider;
  private spawnYSlider: VolumeSlider;
  private bouncer: Bouncer;
  private winVfx: WinVFXController;
  private stageLogos: Logo[] = [];
  private paused = false;
  private stageWidth = 1280;
  private stageHeight = 720;
  private vfxAssetOptions: string[];
  private selectedVfxIndex = 0;
  private rotateEnabled = false;
  private popEnabled = false;
  private pulseEnabled = false;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);
    this.bouncer = new Bouncer();

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };
    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.addChild(this.settingsButton);

    this.addButton = new Button({
      text: "Add",
      width: 175,
      height: 110,
    });
    this.addButton.onPress.connect(() => this.addLogoToStage());
    this.addChild(this.addButton);

    this.removeButton = new Button({
      text: "Remove",
      width: 175,
      height: 110,
    });
    this.removeButton.onPress.connect(() => this.removeLogoFromStage());
    this.addChild(this.removeButton);

    this.vfxAssetOptions = this.getVfxTextureOptions();
    this.winVfx = new WinVFXController(this.vfxAssetOptions);
    this.mainContainer.addChild(this.winVfx.root);

    this.assetSelectorTitle = new Label({
      text: "VFX Asset",
      style: { fill: 0xffffff, fontSize: 30 },
    });
    this.addChild(this.assetSelectorTitle);

    this.selectedAssetLabel = new Label({
      text: this.getSelectedAssetLabelText(),
      style: {
        fill: 0xffffff,
        fontSize: 20,
        wordWrap: true,
        wordWrapWidth: 320,
        align: "center",
      },
    });
    this.addChild(this.selectedAssetLabel);

    this.previousAssetButton = new Button({
      text: "<",
      width: 90,
      height: 90,
      fontSize: 48,
    });
    this.previousAssetButton.onPress.connect(() =>
      this.scrollAssetSelection(-1),
    );
    this.addChild(this.previousAssetButton);

    this.nextAssetButton = new Button({
      text: ">",
      width: 90,
      height: 90,
      fontSize: 48,
    });
    this.nextAssetButton.onPress.connect(() => this.scrollAssetSelection(1));
    this.addChild(this.nextAssetButton);

    this.rotateButton = new Button({
      text: "Rotate",
      width: 160,
      height: 90,
      fontSize: 26,
    });
    this.rotateButton.onPress.connect(() => this.toggleEffect("rotate"));
    this.addChild(this.rotateButton);

    this.popButton = new Button({
      text: "Pop",
      width: 160,
      height: 90,
      fontSize: 26,
    });
    this.popButton.onPress.connect(() => this.toggleEffect("pop"));
    this.addChild(this.popButton);

    this.pulseButton = new Button({
      text: "Pulse",
      width: 160,
      height: 90,
      fontSize: 26,
    });
    this.pulseButton.onPress.connect(() => this.toggleEffect("pulse"));
    this.addChild(this.pulseButton);

    this.effectsLabel = new Label({
      text: "Effects: none",
      style: {
        fill: 0xffffff,
        fontSize: 18,
      },
    });
    this.addChild(this.effectsLabel);

    this.spawnPositionLabel = new Label({
      text: "Spawn Position",
      style: { fill: 0xffffff, fontSize: 24 },
    });
    this.addChild(this.spawnPositionLabel);

    this.spawnXSlider = new VolumeSlider("Center X", -100, 100, 0);
    this.addChild(this.spawnXSlider);

    this.spawnYSlider = new VolumeSlider("Center Y", -100, 100, 0);
    this.addChild(this.spawnYSlider);

    this.playSmallWinButton = new Button({
      text: "Small Win",
      width: 160,
      height: 80,
      fontSize: 24,
    });
    this.playSmallWinButton.onPress.connect(() =>
      this.winVfx.playSmallWin(this.getSpawnCenterX(), this.getSpawnCenterY()),
    );
    this.addChild(this.playSmallWinButton);

    this.playBigWinButton = new Button({
      text: "Big Win",
      width: 160,
      height: 80,
      fontSize: 24,
    });
    this.playBigWinButton.onPress.connect(() =>
      this.winVfx.playBigWin(this.getSpawnCenterX(), this.getSpawnCenterY()),
    );
    this.addChild(this.playBigWinButton);

    this.playMegaWinButton = new Button({
      text: "Mega Win",
      width: 160,
      height: 80,
      fontSize: 24,
    });
    this.playMegaWinButton.onPress.connect(() =>
      this.winVfx.playMegaWin(this.getSpawnCenterX(), this.getSpawnCenterY()),
    );
    this.addChild(this.playMegaWinButton);

    this.playFreezeButton = new Button({
      text: "Freeze",
      width: 160,
      height: 80,
      fontSize: 24,
    });
    this.playFreezeButton.onPress.connect(() =>
      this.winVfx.playFreeze(this.getSpawnCenterX(), this.getSpawnCenterY()),
    );
    this.addChild(this.playFreezeButton);

    this.playShatterButton = new Button({
      text: "Shatter",
      width: 160,
      height: 80,
      fontSize: 24,
    });
    this.playShatterButton.onPress.connect(() =>
      this.winVfx.playShatter(this.getSpawnCenterX(), this.getSpawnCenterY()),
    );
    this.addChild(this.playShatterButton);

    this.clearVfxButton = new Button({
      text: "Clear VFX",
      width: 160,
      height: 80,
      fontSize: 22,
    });
    this.clearVfxButton.onPress.connect(() => this.winVfx.clear());
    this.addChild(this.clearVfxButton);

    this.syncSelectedAssetTheme();

    this.updateEffectStateLabel();
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  public update(time: Ticker) {
    if (this.paused) return;
    this.bouncer.update();
    this.winVfx.update(time.deltaMS);

    const nowMs = performance.now();
    this.stageLogos.forEach((logo) => logo.updateEffects(nowMs));
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;
    this.pauseButton.x = 30;
    this.pauseButton.y = 30;
    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;
    this.removeButton.x = width / 2 - 100;
    this.removeButton.y = height - 75;
    this.addButton.x = width / 2 + 100;
    this.addButton.y = height - 75;

    this.assetSelectorTitle.x = centerX;
    this.assetSelectorTitle.y = height - 360;
    this.selectedAssetLabel.x = centerX;
    this.selectedAssetLabel.y = height - 310;
    this.previousAssetButton.x = centerX - 240;
    this.previousAssetButton.y = height - 310;
    this.nextAssetButton.x = centerX + 240;
    this.nextAssetButton.y = height - 310;

    this.rotateButton.x = centerX - 200;
    this.rotateButton.y = height - 200;
    this.popButton.x = centerX;
    this.popButton.y = height - 200;
    this.pulseButton.x = centerX + 200;
    this.pulseButton.y = height - 200;
    this.effectsLabel.x = centerX;
    this.effectsLabel.y = height - 145;

    this.spawnPositionLabel.x = 180;
    this.spawnPositionLabel.y = height - 350;
    this.spawnXSlider.x = 40;
    this.spawnXSlider.y = height - 315;
    this.spawnYSlider.x = 40;
    this.spawnYSlider.y = height - 250;

    this.playSmallWinButton.x = 130;
    this.playSmallWinButton.y = height - 170;
    this.playBigWinButton.x = 300;
    this.playBigWinButton.y = height - 170;
    this.playMegaWinButton.x = 470;
    this.playMegaWinButton.y = height - 170;
    this.playFreezeButton.x = 640;
    this.playFreezeButton.y = height - 170;
    this.playShatterButton.x = 810;
    this.playShatterButton.y = height - 170;
    this.clearVfxButton.x = 980;
    this.clearVfxButton.y = height - 170;

    this.stageWidth = width;
    this.stageHeight = height;
    this.winVfx.resize(width, height);
    this.bouncer.resize(width, height);
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    const elementsToAnimate = [
      this.pauseButton,
      this.settingsButton,
      this.addButton,
      this.removeButton,
      this.assetSelectorTitle,
      this.selectedAssetLabel,
      this.previousAssetButton,
      this.nextAssetButton,
      this.rotateButton,
      this.popButton,
      this.pulseButton,
      this.effectsLabel,
      this.spawnPositionLabel,
      this.spawnXSlider,
      this.spawnYSlider,
      this.playSmallWinButton,
      this.playBigWinButton,
      this.playMegaWinButton,
      this.playFreezeButton,
      this.playShatterButton,
      this.clearVfxButton,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
    this.bouncer.show(this, this.getSpawnOptions());
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }

  private getVfxTextureOptions(): string[] {
    const sheet =
      (Assets.get("vfx") as Spritesheet | undefined) ??
      (Assets.get("main/vfx") as Spritesheet | undefined);

    if (!sheet) {
      return [];
    }

    return Object.keys(sheet.textures).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }

  private getSelectedAssetName(): string {
    return (
      this.vfxAssetOptions[this.selectedVfxIndex] ?? "No VFX assets loaded"
    );
  }

  private getSelectedAssetLabelText(): string {
    const selectedAsset = this.getSelectedAssetName();
    const tint = this.getCurrentAssetTint(selectedAsset);
    if (typeof tint !== "number") {
      return `${selectedAsset}\nTint: unavailable`;
    }

    const tintHex = tint.toString(16).padStart(6, "0").toUpperCase();
    return `${selectedAsset}\nTint: #${tintHex}`;
  }

  private scrollAssetSelection(step: number): void {
    if (this.vfxAssetOptions.length === 0) return;

    const optionsCount = this.vfxAssetOptions.length;
    this.selectedVfxIndex =
      (this.selectedVfxIndex + step + optionsCount) % optionsCount;
    this.syncSelectedAssetTheme();
  }

  private toggleEffect(effect: "rotate" | "pop" | "pulse"): void {
    switch (effect) {
      case "rotate":
        this.rotateEnabled = !this.rotateEnabled;
        break;
      case "pop":
        this.popEnabled = !this.popEnabled;
        break;
      case "pulse":
        this.pulseEnabled = !this.pulseEnabled;
        break;
    }

    this.updateEffectStateLabel();
  }

  private updateEffectStateLabel(): void {
    this.rotateButton.alpha = this.rotateEnabled ? 1 : 0.65;
    this.popButton.alpha = this.popEnabled ? 1 : 0.65;
    this.pulseButton.alpha = this.pulseEnabled ? 1 : 0.65;

    const activeEffects = [
      this.rotateEnabled ? "rotate" : "",
      this.popEnabled ? "pop" : "",
      this.pulseEnabled ? "pulse" : "",
    ].filter(Boolean);

    this.effectsLabel.text =
      activeEffects.length > 0
        ? `Effects: ${activeEffects.join(", ")}`
        : "Effects: none";
  }

  private getSpawnOptions(): LogoSpawnOptions {
    return {
      textureName: this.vfxAssetOptions[this.selectedVfxIndex],
      rotate: this.rotateEnabled,
      pop: this.popEnabled,
      pulse: this.pulseEnabled,
    };
  }

  private addLogoToStage(): void {
    const sampledTint = this.getCurrentAssetTint();
    const logo = new Logo({
      ...this.getSpawnOptions(),
      textureName: "logo-white.svg",
      tintColor: sampledTint,
    });
    logo.position.set(this.getSpawnCenterX(), this.getSpawnCenterY());

    this.mainContainer.addChild(logo);
    this.stageLogos.push(logo);
  }

  private getCurrentAssetTint(
    assetName = this.getSelectedAssetName(),
  ): number | undefined {
    if (!assetName || assetName === "No VFX assets loaded") {
      return undefined;
    }

    return this.winVfx.setThemeFromTexture(assetName);
  }

  private syncSelectedAssetTheme(): void {
    this.getCurrentAssetTint();
    this.selectedAssetLabel.text = this.getSelectedAssetLabelText();
  }

  private getSpawnCenterX(): number {
    return (this.spawnXSlider.value / 100) * (this.stageWidth * 0.45);
  }

  private getSpawnCenterY(): number {
    return (this.spawnYSlider.value / 100) * (this.stageHeight * 0.45);
  }

  private removeLogoFromStage(): void {
    const logo = this.stageLogos.pop();
    if (logo) {
      this.mainContainer.removeChild(logo);
      logo.destroy();
      return;
    }

    this.bouncer.remove();
  }
}
