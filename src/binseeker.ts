export default class BinSeeker {
  private data: DataView;
  public cursor: number;

  constructor(data: ArrayBuffer) {
    this.data = new DataView(data);
    this.cursor = 0;
  }

  seek(offset: number): void {
    this.cursor = offset;
  }

  readByte(): number {
    const value = this.data.getUint8(this.cursor);
    this.cursor += 1;
    return value;
  }

  readUInt32LE(): number {
    const value = this.data.getUint32(this.cursor, true);
    this.cursor += 4;
    return value;
  }

  readUInt16LE(): number {
    const value = this.data.getUint16(this.cursor, true);
    this.cursor += 2;
    return value;
  }

  readInt32LE(): number {
    const value = this.data.getInt32(this.cursor, true);
    this.cursor += 4;
    return value;
  }

  readInt16LE(): number {
    const value = this.data.getInt16(this.cursor, true);
    this.cursor += 2;
    return value;
  }

  readFloatLE(): number {
    const value = this.data.getFloat32(this.cursor, true);
    this.cursor += 4;
    return value;
  }

  readDoubleLE(): number {
    const value = this.data.getFloat64(this.cursor, true);
    this.cursor += 8;
    return value;
  }

  readUInt16BE(): number {
    const value = this.data.getUint16(this.cursor, false);
    this.cursor += 2;
    return value;
  }

  readInt16BE(): number {
    const value = this.data.getInt16(this.cursor, false);
    this.cursor += 2;
    return value;
  }

  readUInt32BE(): number {
    const value = this.data.getUint32(this.cursor, false);
    this.cursor += 4;
    return value;
  }

  readInt32BE(): number {
    const value = this.data.getInt32(this.cursor, false);
    this.cursor += 4;
    return value;
  }

  readFloatBE(): number {
    const value = this.data.getFloat32(this.cursor, false);
    this.cursor += 4;
    return value;
  }

  readDoubleBE(): number {
    const value = this.data.getFloat64(this.cursor, false);
    this.cursor += 8;
    return value;
  }

  readString(): string {
    const buffer = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const charCode = this.data.getUint8(this.cursor);
      this.cursor += 1;
      if (charCode === 0) {
        break;
      }
      buffer.push(charCode);
    }
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(buffer));
  }

  readBytes(length: number): Uint8Array {
    const buffer = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = this.data.getUint8(this.cursor + i);
    }
    this.cursor += length;
    return buffer;
  }

  readChars(length: number): string {
    const buffer = this.readBytes(length);
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }
}
