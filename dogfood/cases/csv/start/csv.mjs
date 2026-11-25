export function readTable(chunks) {
  return chunks.flatMap(chunk =>
    chunk.split(/\r?\n/).filter(Boolean).map(line => line.split(",")));
}
