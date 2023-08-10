const ocfl = require("@ocfl/ocfl-fs");

// this is a top-level await

// TODO - make this configurable

async function main() {
  //const storage = ocfl.storage({root: process.argv[2], ocflVersion: '1.0'});
  const storage = ocfl.storage({
    root: process.argv[2],
    workspace: ".",
    ocflVersion: "1.1",
    layout: {
      extensionName: "000N-path-direct-storage-layout",
    },
  });
  storage.load();

  for await (let obj of storage) {
    const toAdd = {};
    obj.load();
    const crateFile = await obj
      .getFile({ logicalPath: "ro-crate-metadata.json" })
    const j = JSON.parse(JSON.stringify(await crateFile.asStream()))
    console.log(j.path);
  }
}

main();
