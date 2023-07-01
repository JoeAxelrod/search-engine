import { esClient } from '../config/elasticsearch';
import { Video } from './video.model';


export interface ElasticSearchResponse {
    hits: {
        total: number | { value: number; relation: string } | undefined;
        hits: Array<{
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source: any;
        }>
    }
}


export interface ElasticSearchQuery {
    query: {
        bool: {
            must: Array<{
                match?: { [key: string]: any },
                term?: { [key: string]: any },
                range?: { [key: string]: any },
                terms?: { [key: string]: any },
                wildcard?: { [key: string]: any },
            }>
        }
    }
}

export interface SearchQuery {
    filename?: string;
    authorId?: string;
    max_duration?: number;
    min_duration?: number;
    tags?: string[];
  }

export async function setupElasticsearch(): Promise<void> {
    const indexName = 'videos';
    const indexExists = await esClient.indices.exists({ index: indexName });

    if (!indexExists) {
        try {

            await esClient.indices.create({
                index: indexName
            });
            console.log(`Created index ${indexName}`);
        } catch (err) {
            console.error(`An error occurred while creating the index ${indexName}:`);
            console.error(err);
        }
    }

    try {
        const videos = await Video.find();
        for (const video of videos) {
            const videoObject = video.toObject();
            delete videoObject._id;
            await esClient.index({
                index: 'videos',
                id: String(video._id), // This sets the Elasticsearch document's ID to be the Mongoose document's ID
                document: videoObject
            });

        }
    } catch (err) {
        console.error(err);
    }
}

export async function searchVideos(query: SearchQuery): Promise<ElasticSearchResponse | any> {
    const body: ElasticSearchQuery = {
        query: {
            bool: { // 'bool' is used for combining multiple query clauses
                must: []
            }
        }
    };

    // Add 'filename' filter to the search query if provided.
    if (query.filename) {
        body.query.bool.must.push({
            match: { // Match is a fuzzy query
                filename: query.filename
            }
        });
    }

    // Add 'authorId' filter to the search query if provided.
    if (query.authorId) {
        body.query.bool.must.push({
            term: { // Term is an exact query
                authorId: query.authorId
            }
        });
    }

    // Add 'duration' filter to the search query if provided.
    // This is a range query that expects an object with 'gte' (greater than or equal) and/or 'lte' (less than or equal) properties.
    if (query.max_duration && query.min_duration) {
        body.query.bool.must.push({
            range: {
                duration: {
                    lte: query.max_duration,
                    gte: query.min_duration,
                }
            }
        });
    }

    // Add 'tags' filter to the search query if provided.
    // This is an 'includes any of' query that expects an array of tags.
    if (query.tags) {
        body.query.bool.must.push({
            terms: {
                tags: query.tags
            }
        });
    }

    // Execute the search query on Elasticsearch.
    return await esClient.search({
        index: 'videos',
        ...body
    });
}

