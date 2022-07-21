# ocfl-ro-crate-summarizer
Script to provide a table of content/summary of an OCFL repository containing RO-Crates (maybe also support NOCFL at some stage?)


## install

This requires the test version of ocfl js

```
##Get the oclf-js code
git clone https://github.com/Arkisto-Platform/ocfl-js
cd oclf-js
git pull origin develop-alpha
npm install .
cd ocfl
npm link
cd ../ocfl-fs
npm link
cd ../oclf-tests
npm link

```

## usage


node index.js repo-path csv-path

eg: 

```
node index.js /Users/pt/working/repo  myfile.csv
less myFile.csv

@id,name,memberOf,conformsTo_https://purl.archive.org/textcommons/profile#Collection,conformsTo_https://purl.archive.org/textcommons/profile#Object,type_RepositoryCollection,type_RepositoryObject
"arcp://name,sydney-speaks/Bcnt/item/87","1987-05-19 - interview with Grace Thomson - alias - (Female, 83)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1
"arcp://name,sydney-speaks/SSDS/item/145","1977-80 - interview with Murray Dominico - alias - (Male, 14)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1
"arcp://name,sydney-speaks/SydS/item/51","2017-08-17 - interview with Flynn Chan - alias - (Male, 24)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1
"arcp://name,sydney-speaks/SSDS/item/24","1977-80 - interview with Julie Wicken - alias - (Female, 44)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1
"arcp://name,sydney-speaks/SydS/item/76","2018-03-20 - interview with Joshua Huang - alias - (Male, 25)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1
"arcp://name,sydney-speaks/SSDS/item/822","1977-80 - interview with Jack Stamatis - alias - (Male, 15)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1
"arcp://name,sydney-speaks/SydS/item/79","2018-04-02 - interview with Emilio Gaspari - alias - (Male, 22)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1
"arcp://name,sydney-speaks/SSDS/item/166","1977-80 - interview with Jeanie Carter - alias - (Female, 17)","arcp://name,sydney-speaks/subcorpus/BCNT",0,1,0,1


```




## config

At the moment this is hardwired to created columns for certain types and conformsTo URIs, this needs to be made configurable

