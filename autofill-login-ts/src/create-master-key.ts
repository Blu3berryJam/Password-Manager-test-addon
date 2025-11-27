async function generateMasterKeyFile() {
  const key = crypto.getRandomValues(new Uint8Array(32)); // 256-bit
  const blob = new Blob([key], { type: "application/octet-stream" });
  const handle = await (window as any).showSaveFilePicker({
    suggestedName: "master.key",
    types: [{ accept: { "application/octet-stream": [".key"] } }]
  });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();

  console.log("✔ master.key zapisany");
}
generateMasterKeyFile();
