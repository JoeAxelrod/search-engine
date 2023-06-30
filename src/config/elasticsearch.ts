import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({ 
    node: 'http://localhost:9200',
    auth: {
        username: 'elastic',
        password: 'your_password_here'
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
