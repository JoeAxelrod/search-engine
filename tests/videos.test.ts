import app from '../src/app';
import { esClient } from '../src/config/elasticsearch';
const request = require('supertest');
import { IVideo } from '../src/models/video';

// Define test data
const testData: IVideo[] = [
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
        tags: ["product2", "product3"]
    }
];

describe('search-engine tests', () => {
    describe('Elasticsearch basic functionality', () => {
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
            await esClient.indices.refresh({index: 'videos'});

            // Retrieve the test data
            const response: any = await esClient.get({index: 'videos', id: '1'});

            // Check the retrieved data
            expect(response._source).toEqual(testData[0]);
        });
    });

    describe('GET /api/videos', () => {
        beforeAll(async () => {
            // Seed data before running the tests
            const operations = testData.flatMap(
                doc =>  [{ index: { _index: 'videos' }}, doc]);
            await esClient.bulk({ refresh: true, operations });
        });

        afterAll(async () => {
            // Clear test data after running the tests
            await esClient.deleteByQuery({
                index: 'videos',
                query: {
                    match_all: {}
                }
            });

            // Close ElasticSearch client connection
            await esClient.close().catch((error) => {
                console.error('Error while closing the Elasticsearch client', error);
            });
        });

        describe('GET /api/videos - Basic functionality', () => {
            it('responds with json', async () => { //
                await request(app)
                    .get('/api/videos')
                    .expect('Content-Type', /json/)
                    .expect(200);
            });

            // filename
            it('responds with videos that match the provided filename', async () => {
                const response = await request(app)
                    .get('/api/videos?filename=test')
                    .expect('Content-Type', /json/)
                    .expect(200);

                expect(response.body).toContainEqual(expect.objectContaining({filename: 'test'}));
            });

            // tag
            it('responds with videos that match the provided tag', async () => {
                const response = await request(app)
                    .get('/api/videos?tags=product')
                    .expect('Content-Type', /json/)
                    .expect(200);

                expect(response.body).toContainEqual(expect.objectContaining({tags: expect.arrayContaining(['product'])}));
            });

            // authorId
            it('responds with videos that match the provided authorId', async () => {
                const response = await request(app)
                    .get('/api/videos?authorId=user1')
                    .expect('Content-Type', /json/)
                    .expect(200);

                expect(response.body).toContainEqual(expect.objectContaining({authorId: 'user1'}));
            });

            // duration
            it('responds with videos that match the provided duration', async () => {
                const response = await request(app)
                    .get('/api/videos?max_duration=180&min_duration=180')
                    .expect('Content-Type', /json/)
                    .expect(200);
                response.body;


                // Verify that all videos in the response have the expected duration
                response.body.forEach((video: IVideo) => {
                    expect(video.duration).toBe(180);
                });
            });

            // multiple filters
            it('responds with videos that match multiple provided filters', async () => {
                const response = await request(app)
                    .get('/api/videos?filename=test&authorId=user1&tags=product')
                    .expect('Content-Type', /json/)
                    .expect(200);

                expect(response.body).toContainEqual(
                    expect.objectContaining({
                        filename: 'test',
                        authorId: 'user1',
                        tags: expect.arrayContaining(['product']),
                    })
                );
            });

            // multiple filters not match
            it('responds with no videos that not match all the multiple provided filters', async () => {
                const response = await request(app)
                    .get('/api/videos?filename=test&authorId=user2&tags=product')
                    .expect('Content-Type', /json/)
                    .expect(404);

                expect(response.body).toHaveProperty('error', 'No hits found');
            });


            it('responds with 400 Bad Request for invalid search parameters', async () => {
                const response = await request(app)
                    .get('/api/videos?invalid_param=abc')
                    .expect('Content-Type', /json/)
                    .expect(400);

                // Check the error message
                expect(response.body).toHaveProperty('error', 'Invalid search parameters');
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

        describe('GET /api/videos - Advanced Search', () => {
            it(' strict equality ', async () => {
                const response = await request(app)
                    .get('/api/videos?filename=test')
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Expect that all videos returned have the exact filename
                response.body.forEach((video: IVideo) => {
                    expect(video.filename).toBe('test');
                });
            });

            it(' partial match ', async () => {
                const response = await request(app)
                    .get('/api/videos?filename=test')
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Expect that all videos returned have the filename that contains 'test'
                response.body.forEach((video: IVideo) => {
                    expect(video.filename).toContain('test');
                });
            });

            it(' belongs to range query ', async () => {
                const response = await request(app)
                    .get('/api/videos?min_duration=100&max_duration=200')
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Expect that all videos returned have a duration that falls within the specified range
                response.body.forEach((video: IVideo) => {
                    expect(video.duration).toBeGreaterThanOrEqual(100);
                    expect(video.duration).toBeLessThanOrEqual(200);
                });
            });

            it(' includes any of ', async () => {
                const response = await request(app)
                    .get('/api/videos?tags=product,product3')
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Expect that all videos returned have at least one of the specified tags
                response.body.forEach((video: IVideo) => {
                    const videoHasExpectedTag = ['product', 'product2'].some(tag => video.tags.includes(tag));
                    expect(videoHasExpectedTag).toEqual(true);
                });
            });
        });

    });
});