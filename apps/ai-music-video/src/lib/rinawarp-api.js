export async function streamRinaResponse(prompt, onChunk, onDone, onError) {
  // Dummy implementation for build
  onChunk('Hello from RinaWarp!');
  setTimeout(onDone, 1000);
}
