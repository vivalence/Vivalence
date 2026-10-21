import { AudioDriver } from "./drivers/audio.js";
import { Microphone } from "./device/microphone/index.js";
import { Speaker } from "./device/speaker/index.js";

export class Box {
  drivers = {};
  device = {};

  constructor(app) {
    this.app = app;
    this.drivers.audio = new AudioDriver(this);
    this.device.microphone = new Microphone(this);
    this.device.speaker = new Speaker(this);
  }
}
