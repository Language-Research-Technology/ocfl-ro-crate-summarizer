import click
from rocrate.rocrate import ROCrate
from pathlib import Path
from sqlite_utils import Database
import sqlite3
import re

file_path = "your_text_file.txt"
output_folder = "output_ro_crate/"

# Create an RO-Crate instance


@click.command()
@click.option("--db", default="ocfl-summary.db", prompt="Database", help="name of the output database")
@click.option("--obj", default=False, prompt="Index Repo Objects", help="Index repository Objects")
@click.option("--files", default="list.txt", prompt="List of RO-Crates", help="A list of paths to RO-Crates, one per line")
def build(files, db, obj):
    """Load a list of paths to RO-Crates"""
    data = Database(db)
    # Set up some tables
    objects = data["objects"]
    collections = data["collections"]
    speakers = data["speakers"]
    speakers_seen = {}
    object_array = []
    collection_array = []
    speaker_array = []
    stop = 320
    done = 0
    with open(files, "r") as file:
        for line in file:
            # Process each line here
            crate_path = line.strip().replace("ro-crate-metadata.json", "")
            print("Crate", line)
            print("Loading:", crate_path)
            crate = ROCrate(crate_path)
            root = crate.root_dataset
            id = re.sub("\/$", "", root.get("@id"))
            print("ID", id)
            # TODO: Turn this into a recursive function
            summary = {
                "id": id,
                "type": asList(root.get("@type")),
                "path": crate_path,
                "name": root.get("name"),
                "memberOf": root.get("memberOf"),
                "conformsTo": root.get("conformsTo")
            }
            if "RepositoryCollection" in summary["type"]:
                collection_array.append(summary)
            elif "RepositoryObject" in summary["type"]:
                object_array.append(summary)
            members = asList(root.get("hasMember"))
            if obj:
                for entity in members:
                        repo_obj = {
                            "id": entity.get("@id"),
                            "type": asList(entity.get("@type")),
                            "name": entity.get("name"),
                            "conformsTo": entity.get("conformsTo"),
                            "memberOf": summary["id"]
                        }
                        if "RepositoryCollection" in repo_obj["type"]:
                            collection_array.append(repo_obj)
                        elif "RepositoryObject" in repo_obj["type"]:
                            json_ld = entity.as_jsonld()
                            del json_ld["hasPart"]

                            for key, value in json_ld.items():
                                    if key in ["@id", "@type"]:
                                        pass
                                    elif key == 'speaker':
                                        this_speaker = {}
                                        # Having trouble with foreign keys
                                        this_speaker['id'] = entity['speaker']['@id'].strip()
                                        repo_obj['speaker'] = this_speaker['id']

                                        if not speakers_seen.get(this_speaker['id']):
                                            speakers_seen[this_speaker['id']] = True
                                            speaker = crate.dereference(this_speaker['id'])
                                            speaker_json = speaker.as_jsonld()
                                            for skey, svalue in speaker_json.items():
                                                this_speaker[skey] = svalue
                                            speaker_array.append(this_speaker)

                                    elif isinstance(value, str):
                                        repo_obj[key] = value
                                    elif isinstance(value, dict):
                                        if v := value.get('@id'):
                                            repo_obj[key] = v
                                    else:
                                        repo_obj[key] = value
                            object_array.append(repo_obj)

                        #print(repoObj["id"])
            done += 1
            if done > stop:
                break

    speakers.insert_all(speaker_array, pk="id", alter= True)

    collections.insert_all(collection_array, pk="id", alter= True, foreign_keys=[
                       ("memberOf", "collections", "id")])
    objects.insert_all(object_array, pk="id", alter= True, foreign_keys=[
                       ("speaker", "speakers", "id"), ("memberOf", "collections", "id") ])



def asList(thing):
    if not thing:
        return []
    if not isinstance(thing, list):
        return [thing]
    return thing



if __name__ == '__main__':
    build()
