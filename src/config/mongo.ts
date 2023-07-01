import mongoose from 'mongoose';

export async function connectToMongo() {
    try {
        await mongoose.connect('mongodb://localhost:27017/searchEngine');
        console.log('MongoDB connection established successfully');
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
    }
}
