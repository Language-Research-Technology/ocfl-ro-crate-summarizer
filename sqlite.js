const ocfl = require("@ocfl/ocfl-fs");
const fs = require("fs");
const { ROCrate } = require("ro-crate");
const { roCratePreviewFileName } = require("ro-crate/lib/defaults");
const fileName = process.argv[3];

const sqlite = require("better-sqlite3");

// this is a top-level await

// TODO - make this configurable

const expandType = ["RepositoryCollection", "RepositoryObject"];

const expandConformsTo = [
  "https://purl.archive.org/textcommons/profile#Collection",
  "https://purl.archive.org/textcommons/profile#Object",
];

const props = ["id", "name", "memberOf"];

const header = ["path", props.join(",")].join(","); //, expandConformsTo.map((v)=>"conformsTo_" + v).join(","), expandType.map((v)=>"type_" + v).join(",")].join(",")

function clean(s) {
  s = s.toString();
  return s.replace('"', '""');
}
function formatVal(vals) {
  console.log(vals);
  // Format a property
  if (!vals) return "";
  vals = vals.map((v) => {
    if (v["@id"]) {
      return clean(v["@id"].replace("\n", ""));
    } else {
      return clean(v);
    }
  });

  return vals.join(", ");
}

async function main() {
  // you would have to import / invoke this in another file
  const db = sqlite(process.argv[3]);
  db.pragma('FOREIGN_KEYS = ON');
  db.pragma('defer_foreign_keys = true');

  console.log(header);
  const createTable = `CREATE TABLE IF NOT EXISTS objects(id TEXT, name TEXT, memberOf TEXT, _memberOf TEXT, path TEXT, PRIMARY KEY (id), FOREIGN KEY (memberOf) REFERENCES objects (id) DEFERRABLE INITIALLY DEFERRED)`;
  db.exec(createTable);

  const insert = db.prepare(
    "INSERT INTO objects(name, id, path, memberOf, _memberOf) VALUES (@name, @id, @path, @memberOf, @_memberOf)"
  );

  const insertMany = db.transaction((entities) => {
    for (const cat of Object.keys(entities)) {
      entity = entities[cat];
      console.log("INSERTING", entity);
      insert.run(entity);
       
    }
  });

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
  console.log(storage);

  for await (let obj of storage) {
    const toAdd = {};

    obj.load();
    const crateFile = await obj
      .getFile({ logicalPath: "ro-crate-metadata.json" })
      .asString();
    const crate = new ROCrate(JSON.parse(crateFile), {
      array: true,
      link: true,
    });
    const r = crate.rootDataset;
    

    const line = {};
    console.log(r);
    
    
    line["id"] = r["@id"];
    line["path"] = `file://${obj.root}`;
    line["_memberOf"] = r["memberOf"]?.[0]?.["@id"] || null;
    line.memberOf = null;
    line["name"] = r?.["name"]?.join(" ") || "null";
    toAdd[r["@id"]] = line;
    

    for (let e of [].concat(r["@reverse"].memberOf || [] )) {
        console.log("Considering", e["@id"], toAdd[e["@id"]])
      if (!toAdd[e["@id"]]) {
        const row = {
          id: e["@id"],
          path: `file://${obj.root}`,
          _memberOf: e["memberOf"]?.[0]?.["@id"] || null,
          name: e?.["name"]?.join(" ") || "null",
          memberOf: null
        };
        toAdd[e["@id"]] = row;
      }
  
      

      const types = crate.utils.asArray(r["@type"]);
    }
    insertMany(toAdd);
    
    //line += expandType.map((t) => types.includes(t) ? "1" : "0").join(",")
  }
  
  const rows = db.prepare("SELECT * FROM objects").all();
  // TODO -- This must be doable with pure SQL??
  const findParent = db.prepare(`SELECT id from objects WHERE id = ?`)
  const updateEntity = db.prepare(`UPDATE objects
  SET 
    memberOf = ?
  WHERE
      id = ? `)

  for (row of rows) {
    console.log(row);
    const exists = findParent.get(row._memberOf);
    if (exists) {
        console.log("EXISTS", exists, row._memberOf) 
        updateEntity.run(row._memberOf, row.id)
    }
   
  }
  

  

  //console.log(row)
}

main();
