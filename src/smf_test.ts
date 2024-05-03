import { StandardMidiFile } from "./smf.ts";

Deno.test("StandardMidiFile", async () => {
  const data = await Deno.readFile("./assets/smf.mid");
  const smf = new StandardMidiFile(data.buffer);

  console.log(smf.header);
  console.log(smf.tracks);
});
