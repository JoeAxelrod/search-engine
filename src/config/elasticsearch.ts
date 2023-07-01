import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';


dotenv.config();

if (!process.env.ES_USER || !process.env.ES_PASSWORD) {
    throw new Error('ES_USER and ES_PASSWORD must be defined');
}
export const esClient = new Client({ 
    node: 'http://localhost:9200',
    auth: {
        username: process.env.ES_USER,
        password: process.env.ES_PASSWORD
    }
});

export async function checkElasticsearchConnection() {
    try {
        await esClient.ping();
        console.log('Elasticsearch connection established successfully');
    } catch (error) {
        console.error(`Error connecting to Elasticsearch: ${error}`);
    }
}
