
REPO_DIR=/opt/storage/oni/ocfl



ls:
	node list-ro-crates.js ${REPO_DIR} > list.txt


db:
	rm -f ocfl-summary.db
	python3 make-db.py --files  list.txt --obj True  --db ocfl-summary.db


serve:
	datasette ocfl-summary.db --setting facet_suggest_time_limit_ms 5000 --setting facet_time_limit_ms 5000


all: ls db serve