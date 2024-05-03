import BinSeeker from "../binseeker.ts";
import { Chunk } from "./base.ts";

export class MidiTrack extends Chunk {
  static name = "MTrk";

  messages: MidiMessage[] = [];

  constructor(data: ArrayBuffer) {
    super(data);

    let time = 0;

    while (this.seeker.cursor < this.data.byteLength) {
      const deltaTime = readVariableLength(this.seeker);
      time += deltaTime;
      const statusByte = this.seeker.readByte();
      const channel = statusByte & 0x0F;
      const messageClass = statusByte === 0xFF
        ? MidiMetaEvent
        : noteMessages.find(
          (c) => (statusByte & 0xF0) === c.upperBits,
        );
      if (!messageClass) {
        throw new Error(`Unknown message type ${statusByte.toString(16)}`);
      }
      this.messages.push(new messageClass(channel, time, this.seeker));
    }
  }
}

export abstract class MidiMessage {
  static upperBits: number;
  channel: number;
  time: number;

  constructor(channel: number, time: number) {
    this.channel = channel;
    this.time = time;
  }
}

export class MidiNoteOff extends MidiMessage {
  static upperBits = 0x80;

  note: number;
  velocity: number;

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.channel = channel;
    this.note = seeker.readByte();
    this.velocity = seeker.readByte();
  }
}

export class MidiNoteOn extends MidiMessage {
  static upperBits = 0x90;

  note: number;
  velocity: number;

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.channel = channel;
    this.note = seeker.readByte();
    this.velocity = seeker.readByte();
  }
}

export class MidiPolyphonicKeyPressure extends MidiMessage {
  static upperBits = 0xA0;

  note: number;
  pressure: number;

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.channel = channel;
    this.note = seeker.readByte();
    this.pressure = seeker.readByte();
  }
}

const controlChangeNames = {
  0x78: "allSoundOff",
  0x79: "resetAllControllers",
  0x7A: "localControl",
  0x7B: "allNotesOff",
  0x7C: "omniModeOff",
  0x7D: "omniModeOn",
  0x7E: "monoModeOn",
  0x7F: "polyModeOn",
} as const;
export class MidiControlChange extends MidiMessage {
  static upperBits = 0xB0;

  controller: number;
  value: number;

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.channel = channel;
    this.controller = seeker.readByte();
    this.value = seeker.readByte();
  }

  get name() {
    return controlChangeNames[
      this.controller as keyof typeof controlChangeNames
    ] || `controller${this.controller}`;
  }
}

export class MidiProgramChange extends MidiMessage {
  static upperBits = 0xC0;

  program: number;
  value: number;

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.channel = channel;
    this.program = seeker.readByte();
    this.value = seeker.readByte();
  }
}

export class MidiChannelPressure extends MidiMessage {
  static upperBits = 0xD0;

  pressure: number;
  value: number;

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.channel = channel;
    this.pressure = seeker.readByte();
    this.value = seeker.readByte();
  }
}

export class MidiPitchBend extends MidiMessage {
  static upperBits = 0xE0;

  value: number;

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.channel = channel;
    this.value = seeker.readUInt16BE();
  }
}

export class MidiSystemExclusive extends MidiMessage {
  static upperBits = 0xF0;
  data: number[];

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.data = [...seeker.readBytes(2)];
  }
}

export class MidiMetaEvent extends MidiMessage {
  static upperBits = 0xFF;

  type: number;
  data: number[];

  constructor(channel: number, time: number, seeker: BinSeeker) {
    super(channel, time);
    this.type = seeker.readByte();
    const length = readVariableLength(seeker);
    this.data = [...seeker.readBytes(length)];
  }
}

const noteMessages:
  ((new (channel: number, time: number, seeker: BinSeeker) => MidiMessage) & {
    upperBits: number;
  })[] = [
    MidiNoteOff,
    MidiNoteOn,
    MidiPolyphonicKeyPressure,
    MidiControlChange,
    MidiProgramChange,
    MidiChannelPressure,
    MidiPitchBend,
    MidiSystemExclusive,
  ];

const readVariableLength = (seeker: BinSeeker) => {
  const buffer = [];
  while (true) {
    const byte = seeker.readByte();
    buffer.push(byte);
    if (byte & 0x80) {
      continue;
    }
    break;
  }
  return buffer.reduce(
    (acc, byte, i) => acc + ((byte & 0x7F) << (7 * i)),
    0,
  );
};
