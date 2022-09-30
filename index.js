const ocfl = require("@ocfl/ocfl-fs");
const fs = require("fs")
const { ROCrate } = require("ro-crate");
const fileName = process.argv[3]
const storage = ocfl.storage({ root: process.argv[2], ocflVersion: "1.0" });
storage.load();

// TODO - make this configurable 

const expandType = [
    "RepositoryCollection",
    "RepositoryObject"
]

const expandConformsTo = [
    "https://purl.archive.org/textcommons/profile#Collection",
    "https://purl.archive.org/textcommons/profile#Object"
]

const props = [
    "@id",
    "name",
    "memberOf"
]

const header = [props.join(","), expandConformsTo.map((v) => "conformsTo_" + v).join(","), expandType.map((v) => "type_" + v).join(",")].join(",")

function formatVal(r, p) {
    // Format a property
    if (!r[p]) return "";
    if (r[p]["@id"]) {
        return `"${r[p]["@id"].replace("\n", "").replace('"', '""')}"`
    }
    return `"${r[p].toString().replace('"', '""')}"`
}
async function main() {
    fs.writeFileSync(fileName, header + "\n")
    for (let obj of await storage.objects()) {
        obj.load();
        const crate = new ROCrate(JSON.parse(await obj.getFile({ logicalPath: "ro-crate-metadata.json" }).asString()))
        const r = crate.rootDataset
        var line = "";

        for (let p of props) {
            line += `${formatVal(r, p)},`
        }
        const conf = crate.utils.asArray(r["conformsTo"]).map((c) => {
            return c["@id"] ? c["@id"] : ""
        });
        line += expandConformsTo.map((c) => conf.includes(c) ? "1" : "0").join(",") + ","
        const types = crate.utils.asArray(r["@type"]);
        line += expandType.map((t) => types.includes(t) ? "1" : "0").join(",")

        fs.appendFileSync(fileName, line + "\n");
    }
}



main();