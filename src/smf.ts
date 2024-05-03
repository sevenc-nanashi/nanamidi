import { MidiHeader } from "./chunks/mthd.ts";
import { MidiTrack } from "./chunks/mtrk.ts";
import { parse, ParseOptions } from "./parse.ts";

export class StandardMidiFile {
  header: MidiHeader;
  tracks: MidiTrack[];

  constructor(data: ArrayBuffer, options: Partial<ParseOptions> = {}) {
    const parsed = parse(data, [MidiHeader, MidiTrack], options);
    const maybeHeader = parsed.chunks.find((c) => c instanceof MidiHeader);
    if (!maybeHeader) {
      throw new Error("No header found");
    }
    this.header = maybeHeader as MidiHeader;
    this.tracks = parsed.chunks.filter((c) =>
      c instanceof MidiTrack
    ) as MidiTrack[];
  }
}
