import { Video, IVideo } from './video.model';

export interface SearchQuery {
    filename?: string;
    authorId?: string;
    max_duration?: number;
    min_duration?: number;
    tags?: string[];
}

export async function searchVideos(query: SearchQuery): Promise<IVideo[]> {
    let searchQuery: any = {};

    // Add 'filename' filter to the search query if provided.
    if (query.filename) {
        searchQuery.filename = /query.filename/i;
    }

    // Add 'authorId' filter to the search query if provided.
    if (query.authorId) {
        searchQuery.authorId = query.authorId;
    }

    // Add 'duration' filter to the search query if provided.
    // This is a range query that expects an object with 'gte' (greater than or equal) and/or 'lte' (less than or equal) properties.
    if (query.max_duration && query.min_duration) {
        searchQuery.duration = {
            $gte: query.min_duration,
            $lte: query.max_duration,
        };
    }

    // Add 'tags' filter to the search query if provided.
    // This is an 'includes any of' query that expects an array of tags.
    if (query.tags) {
        searchQuery.tags = { $in: query.tags };
    }

    // Execute the search query on MongoDB.
    return await Video.find(searchQuery);
}
