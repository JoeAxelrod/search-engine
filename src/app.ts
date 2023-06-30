import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import videosRoutes from './routes/videos';
import { setupElasticsearch } from './video/video.service';
import { connectToMongo } from './config/mongo';
import { checkElasticsearchConnection } from './config/elasticsearch';


// Create an Express application
const app = express();

// Apply middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Import routes
app.use('/api/videos', videosRoutes);

(async () => {
    // Connect to MongoDB
    await connectToMongo();

    // Set up Elasticsearch
    await setupElasticsearch();

    // Check Elasticsearch connection
    await checkElasticsearchConnection();
})().catch(console.error);

export default app;
