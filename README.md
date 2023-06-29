```
search-engine/
│
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.ts
│   └── server.ts
│
├── tests/
│
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

npm start

docker-compose up -d
docker exec -it [CONTAINER_ID] mongoimport --db searchEngine --collection videos --type json --file /import_data/videos.json --jsonArray

docker cp ./data/import_data/videos.ndjson [CONTAINER_ID]:/videos.ndjson
docker exec -it [CONTAINER_ID] bash -c "curl -u elastic:your_password_here -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @/videos.ndjson"