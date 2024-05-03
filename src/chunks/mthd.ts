import { Chunk } from "./base.ts";

export class MidiHeader extends Chunk {
  static name = "MThd";
  format: number;
  trackCount: number;
  timeDivision: number;

  constructor(data: ArrayBuffer) {
    super(data);
    this.format = this.seeker.readUInt16BE();
    this.trackCount = this.seeker.readUInt16BE();
    this.timeDivision = this.seeker.readUInt16BE();

    if (this.format !== 1) {
      throw new Error(`Unsupported format ${this.format}`);
    }

    if (this.seeker.cursor !== this.data.byteLength) {
      throw new Error("Extra data found in header");
    }
  }
}
