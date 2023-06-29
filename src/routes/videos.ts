import express from 'express';
import { Client } from '@elastic/elasticsearch';
import { esClient } from '../config/elasticsearch';

const router = express.Router();

// Set up a GET route for '/api/videos' to fetch videos with various filters.
router.get('/', async (req, res) => {
    const { filename, authorId, duration, tags } = req.query;

    // Construct the search query for Elasticsearch.
    const body: {
        query: {
            bool: {
                must: Array<{
                    match?: any,
                    term?: any,
                    range?: any,
                    terms?: any,
                }>
            }
        }
    } = {
        query: {
            bool: {
                must: []
            }
        }
    };
    

    // Add 'filename' filter to the search query if provided.
    if (filename) {
        body.query.bool.must.push({
            match: { filename: filename }
        });
    }

    // Add 'authorId' filter to the search query if provided.
    if (authorId) {
        body.query.bool.must.push({
            term: { authorId: authorId }
        });
    }

    // Add 'duration' filter to the search query if provided.
    // This is a range query that expects an object with 'gte' (greater than or equal) and/or 'lte' (less than or equal) properties.
    if (typeof duration === 'string') {
        body.query.bool.must.push({
            range: { duration: JSON.parse(duration) }
        });
    }

    // Add 'tags' filter to the search query if provided.
    // This is an 'includes any of' query that expects an array of tags.
    if (typeof tags === 'string') {
        body.query.bool.must.push({
            terms: { tags: JSON.parse(tags) }
        });
    }

    // Execute the search query on Elasticsearch.
    const response: any = await esClient.search({
        index: 'videos',
        body: body
    }).catch((error) => {
        console.error('Error executing search', error);
        res.status(500).json({ error: 'Error executing search' });
        return;
    });

    if (!response?.body?.hits?.hits || response.body.hits.hits.length === 0) {
        console.warn('No hits found', response);
        res.status(404).json({ error: 'No hits found' });
        return;
    }

    // Respond with the search results.
    res.json(response.body.hits.hits.map((hit: any) => hit._source));
});

export default router;
