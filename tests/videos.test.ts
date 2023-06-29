import request from 'supertest';
import app from '../src/app'; // Import your Express app
import { esClient } from '../src/config/elasticsearch';

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
      body: {
        filename: 'test',
        authorId: 'user1',
        duration: 180,
        tags: ['product']
      }
    });
  
    // Refresh the index
    await esClient.indices.refresh({ index: 'videos' });
  
    // Retrieve the test data
    const response: any = await esClient.get({ index: 'videos', id: '1' });
  
    // Check the retrieved data
    expect(response.body._source).toEqual({
      filename: 'test',
      authorId: 'user1',
      duration: 180,
      tags: ['product']
    });
  });
  
});



// describe('GET /api/videos', () => {
//   // Seed data before running the tests
//   beforeAll(async () => {
//     const body = testData.flatMap(doc => [{ index: { _index: 'videos' } }, doc]);
//     await esClient.bulk({ refresh: true, body });

//     await new Promise(resolve => setTimeout(resolve, 2000));
//   });

//   afterAll(async () => {
//     // Clear test data after running the tests
//     await esClient.deleteByQuery({
//       index: 'videos',
//       body: {
//         query: {
//           match_all: {}
//         }
//       }
//     });

//     // Close ElasticSearch client connection
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     await esClient.close();
//   });
  
//   it('responds with json', async () => {
//     const response = await request(app)
//         .get('/api/videos')
//         .expect('Content-Type', /json/)
//         .expect(200);

//     // Add more assertions here
//   }, 10000);

//   it('responds with videos that match the provided filename', async () => {
//     const response = await request(app)
//         .get('/api/videos?filename=test')
//         .expect('Content-Type', /json/)
//         .expect(200);

//     // Verify that the videos in the response have the expected filename
//     // Note: Adjust this to match your actual data structure
//     for (let video of response.body) {
//       expect(video.filename).toEqual('test');
//     }
//   });


// });
