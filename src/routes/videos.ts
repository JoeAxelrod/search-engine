import express from 'express';
import { searchVideos } from '../video/video.service';

const router = express.Router();

// Set up a GET route for '/api/videos' to fetch videos with various filters.
router.get('/', async (req, res) => {

    // Define the valid search parameters
    const validParams = ['filename', 'authorId', 'max_duration', 'min_duration', 'tags'];

    // Check if any of the provided parameters are invalid
    for (const param in req.query) {
        if (!validParams.includes(param)) {
            res.status(400).json({ error: 'Invalid search parameters' });
            return;
        }
    }

    const {
        filename,
        authorId,
        max_duration,
        min_duration,
        tags
    } = req.query;

    const response: any = await searchVideos({
        filename: typeof filename === 'string' ? filename : undefined,
        authorId: typeof authorId === 'string' ? authorId : undefined,
        max_duration: typeof max_duration === 'string' ? +max_duration : undefined,
        min_duration: typeof min_duration === 'string' ? +min_duration : undefined,
        tags:  typeof tags === 'string' ? tags.split(",") : undefined
    }).catch((error) => {
        console.error('Error executing search', error);
        res.status(500).json({ error: 'Error executing search' });
        return Promise.reject(error);  // Add this line
      });

    if (!response?.hits?.hits || response.hits.hits.length === 0) {
        // console.warn('No hits found', response);
        res.status(404).json({ error: 'No hits found' });
        return;
    }

    // Respond with the search results.
    res.json(response.hits.hits.map((hit: any) => hit._source));
});

export default router;
