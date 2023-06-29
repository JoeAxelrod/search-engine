import app from './app';
import { setupElasticsearch } from './app';

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Initialize ElasticSearch after the server starts
  await setupElasticsearch();
});
