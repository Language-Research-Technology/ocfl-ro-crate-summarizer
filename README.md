# ocfl-ro-crate-summarizer
Script to provide a table of content/summary of an OCFL repository containing RO-Crates in sqlite and run it in datasette


## install 

### Code environment

Install the node component
```
npm install .
```

Make a virtual environent and install the python part
```
rm -rf env
python -m venv env
. ./env/bin/activate
pip install -r requirements.txt

```

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
