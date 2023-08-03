const ocfl = require('ocfl-fs');
const fs = require('fs')
const {ROCrate} = require('ro-crate');
const { roCratePreviewFileName } = require('ro-crate/lib/defaults');
const fileName = process.argv[3]


const storage = ocfl.storage({root: process.argv[2], ocflVersion: '1.0'});
storage.load();

// TODO - make this configurable 



const expandType = [
    'RepositoryCollection',
    "RepositoryObject"
]

const expandConformsTo = [
    "https://purl.archive.org/textcommons/profile#Collection",
    "https://purl.archive.org/textcommons/profile#Object"
]

const props = [
    "@id",
    "name",
    "memberOf",
]

const header = ["path", props.join(","), expandConformsTo.map((v)=>"conformsTo_" + v).join(","), expandType.map((v)=>"type_" + v).join(",")].join(",")
const asArray = new ROCrate().utils.asArray;

function clean(s){
    s = s.toString();
    return  s.replace('"', '""');
}
function formatVal(vals) {
    console.log(vals)
    // Format a property
    if (!vals) return "";
    vals = vals.map((v) => {
        if (v["@id"]) {
            return clean(v["@id"].replace("\n", ""));
        } else {
           return  clean(v);
        }   
    })

    return vals.join(", ");
}

async function  main (){
    fs.writeFileSync(fileName, header + "\n")
    for (let obj of await storage.objects()) {
        obj.load();
        const crate = new ROCrate(JSON.parse(await obj.getAsString({logicalPath: "ro-crate-metadata.json"})))
        const r = crate.rootDataset
        var line = `file://${obj.root},`;

        for (let p of props) {
            line += `"${formatVal(crate.utils.asArray(r[p]))}",`
        }
        const conf = crate.utils.asArray(r["conformsTo"]).map((c) => {
            return c["@id"] ?  c["@id"] : c
        });
        line += expandConformsTo.map((c) => conf.includes(c) ? "1" : "0").join(",") + ","
        const types = crate.utils.asArray(r["@type"]);
        line += expandType.map((t) => types.includes(t) ? "1" : "0").join(",")
     
        fs.appendFileSync(fileName, line + "\n");
    }
}



main();