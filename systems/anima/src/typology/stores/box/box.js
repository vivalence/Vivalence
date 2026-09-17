import { AudioDriver } from "./drivers/index.js";
import { Microphone } from "./device/microphone/index.js";
import { Speaker } from "./device/speaker/index.js";

export class Box {
  drivers = {};
  device = {};

  constructor() {
    this.drivers.audio = new AudioDriver();
    this.device.microphone = new Microphone(this);
    this.device.speaker = new Speaker(this);
  }
}
