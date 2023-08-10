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
    """Simple program that greets NAME for a total of COUNT times."""
    data = Database(db)
    objects = data["objects"]
    objs = {}
    object_array = []

    with open(files, "r") as file:
        for line in file:
            # Process each line here
            # For example, you can print and add each line as a property to the crate
            cratePath = line.strip().replace("ro-crate-metadata.json", "")
            crate = ROCrate(cratePath)
            root = crate.root_dataset
            id = re.sub("\/$", "", root.get("@id"))
            print("ID", id)
            summary = {
                "id": id,
                "type": asList(root.get("@type")),
                "path": line,
                "name": root.get("name"),
                "memberOf": root.get("memberOf"),
                "conformsTo": root.get("conformsTo")
            }
            objs[id] = True
            object_array.append(summary)
            members = asList(root.get("hasMember"))
            if obj:
                for entity in members:
                        repoObj = {
                            "id": entity.get("@id"),
                            "type": entity.get("@type"),
                            "name": entity.get("name"),
                            "conformsTo": entity.get("conformsTo"),
                            "memberOf": summary["id"]
                        }
                        object_array.append(repoObj)
                        #print(repoObj["id"])

    objects.insert_all(object_array, pk="id", foreign_keys=[
                       ("memberOf", "objects", "id")])


ame = Path(file_path).name  # Set the file name in the RO-Crate


def asList(thing):
    if not thing:
        return []
    if not isinstance(thing, list):
        return [thing]
    return thing



if __name__ == '__main__':
    build()
