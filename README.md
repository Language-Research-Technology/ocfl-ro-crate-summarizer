# ocfl-ro-crate-summarizer
Script to provide a table of content/summary of an OCFL repository containing RO-Crates in sqlite and run it in datasette


## install 

### Code environment

Install the node component
```
npm install .
```

Make a virtual environment and install the python part
```
rm -rf env
python -m venv env
./env/bin/pip3 requirements.txt

```

Fix a small bug in the RO-Crate python library:

After this line:

```
parts = root_entity.pop('hasPart', [])
```
Add:

```
if not isinstance(parts, list):
    parts = [parts]
    

## Install Datasette

On a mac:
```
brew install datasette
```

Or see [the instructions here](https://docs.datasette.io/en/stable/installation.html)

## usage

Get a list of all the RO-Crates in your OCFL repo:

```
make ls
```

Make a sqlite database

```
make db
```

Run Datasette

```
make serve

```

All in one go

```
make all
```
