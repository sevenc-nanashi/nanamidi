import BinSeeker from "../binseeker.ts";

export type ChunkConstructor = new (data: ArrayBuffer) => Chunk;

export abstract class Chunk {
  static name: string;
  data: ArrayBuffer;
  protected seeker: BinSeeker;

  constructor(data: ArrayBuffer) {
    this.data = data;
    this.seeker = new BinSeeker(data);
  }
}
