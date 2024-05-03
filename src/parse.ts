import BinSeeker from "./binseeker.ts";
import { Chunk, ChunkConstructor } from "./chunks/base.ts";

export type ParsedMidi = {
  chunks: Chunk[];
};

export type Parsers = (ChunkConstructor)[];

export type ParseOptions = {
  onUnknownChunk: (type: string, data: ArrayBuffer) => void;
};

export function parse(
  data: ArrayBuffer,
  parsers: Parsers,
  options: Partial<ParseOptions> = {},
): ParsedMidi {
  const filledOptions: ParseOptions = Object.assign(
    {
      onUnknownChunk: (type) => {
        throw new Error(`Unknown chunk type: ${type}`);
      },
    } satisfies ParseOptions,
    options,
  );
  const chunks: Chunk[] = [];
  const parser = new BinSeeker(data);

  while (parser.cursor < data.byteLength) {
    const type = parser.readChars(4);
    const length = parser.readUInt32BE();
    const chunkData = data.slice(parser.cursor, parser.cursor + length);
    const chunkParser = parsers.find((p) => p.name === type);
    if (!chunkParser) {
      filledOptions.onUnknownChunk(type, chunkData);
      continue;
    }
    const chunk = new chunkParser(chunkData);
    chunks.push(chunk);
    parser.seek(parser.cursor + length);
  }

  return { chunks };
}
