const supertest = require('supertest');
import app from '../src/app';
import { esClient } from '../src/config/elasticsearch';
import mongoose from 'mongoose';


const request = supertest;

// Define test data
const testData = [
  {
    filename: "test",
    authorId: "user1",
    duration: 180,
    tags: ["product"]
  },
  {
    filename: "test2",
    authorId: "user2",
    duration: 200,
    tags: ["product2"]
  }
];

describe('search-engine tests', () => {
  describe('Elasticsearch', () => {
    it('is running', async () => {
      let errorOccurred = false;

      try {
        await esClient.ping({});
      } catch (error) {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(false);
    });

    it('can index and retrieve data', async () => {
      // Index some test data
      await esClient.index({
        index: 'videos',
        id: '1',
        document: testData[0]
      });

      // Refresh the index
      await esClient.indices.refresh({ index: 'videos' });

      // Retrieve the test data
      const response: any = await esClient.get({ index: 'videos', id: '1' });

      // Check the retrieved data
      expect(response._source).toEqual(testData[0]);
    });
  });

  describe('GET /api/videos', () => {
    // Seed data before running the tests
    beforeAll(async () => {
      const body = testData.flatMap(doc => [{ index: { _index: 'videos' } }, doc]);
      await esClient.bulk({ refresh: true, body });

      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    afterAll(async () => {
      // Clear test data after running the tests
      await esClient.deleteByQuery({
        index: 'videos',
        body: {
          query: {
            match_all: {}
          }
        }
      });

      // Close ElasticSearch client connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      await esClient.close().catch((error) => {
        console.error('Error while closing the Elasticsearch client', error);
      });

      await mongoose.disconnect();
    });

    it('responds with json', async () => {
      const response = await request(app)
          .get('/api/videos')
          .expect('Content-Type', /json/)
          .expect(200);

      // DOTO: Add more assertions here
    });

      it('responds with videos that match the provided filename', async () => {
        const response = await request(app)
            .get('/api/videos?filename=test')
            .expect('Content-Type', /json/)
            .expect(200);

        // Verify that the videos in the response have the expected filename
        expect(response.body).toContainEqual(expect.objectContaining({ filename: 'test' }));
    });

    it('responds with videos that match the provided tag', async () => {
      const response = await request(app)
          .get('/api/videos?tags=product')
          .expect('Content-Type', /json/)
          .expect(200);

      // Verify that the videos in the response have the expected tag
      expect(response.body).toContainEqual(expect.objectContaining({ tags: expect.arrayContaining(['product']) }));
  });


    it('responds with 400 Bad Request for invalid search parameters', async () => {
      const response = await request(app)
          .get('/api/videos?invalid_param=abc')
          .expect('Content-Type', /json/)
          .expect(400);

      // Check the error message
      expect(response.body).toHaveProperty('error', 'Invalid search parameters');
    });


    it('responds with videos that match the provided authorId', async () => {
      const response = await request(app)
          .get('/api/videos?authorId=user1')
          .expect('Content-Type', /json/)
          .expect(200);

      // Verify that the videos in the response have the expected authorId
      expect(response.body).toContainEqual(expect.objectContaining({ authorId: 'user1' }));
    });

    it('responds with videos that match multiple provided filters', async () => {
      const response = await request(app)
        .get('/api/videos?filename=test&authorId=user1&tags=product')
        .expect('Content-Type', /json/)
        .expect(200);

      // Verify that the videos in the response match all the provided filters
      expect(response.body).toContainEqual(
        expect.objectContaining({
          filename: 'test',
          authorId: 'user1',
          tags: expect.arrayContaining(['product']),
        })
      );
    });

    it('responds with 404 Not Found when no videos match the provided filters', async () => {
      const response = await request(app)
        .get('/api/videos?filename=nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      // Check the error message
      expect(response.body).toHaveProperty('error', 'No hits found');
    });
  });
});