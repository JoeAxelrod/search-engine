import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Client } from '@elastic/elasticsearch';
import mongoose from 'mongoose';
import { Video } from './models/video';
import videosRoutes from './routes/videos';
import { esClient } from './config/elasticsearch';


// Create an Express application
const app = express();

// Apply middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Import routes
app.use('/api/videos', videosRoutes);

mongoose.connect('mongodb://localhost:27017/searchEngine');

// maybe we should move this to src\config\elasticsearch.ts?
export async function setupElasticsearch() {
  
  const indexName = 'videos';
  const indexExists = await esClient.indices.exists({ index: indexName });
  if (!indexExists) {
    try {
      await esClient.indices.create({ index: indexName });
      console.log(`Created index ${indexName}`);
    } catch (err) {
      console.error(`An error occurred while creating the index ${indexName}:`);
      console.error(err);
    }
  }

  // Index the data in Elasticsearch
  Video.find().then(async videos => {
    for (const video of videos) {
      await esClient.index({
        index: 'videos',
        body: video
      });
    }
  }).catch(err => console.error(err));
}

export default app;
