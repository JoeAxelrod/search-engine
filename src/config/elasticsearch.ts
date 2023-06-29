    import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({ 
    node: 'http://localhost:9200',
    auth: {
        username: 'elastic',
        password: 'your_password_here'
    }
});
