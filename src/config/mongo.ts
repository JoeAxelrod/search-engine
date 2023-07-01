import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();
export async function connectToMongo() {
    try {
        await mongoose.connect(`mongodb://localhost:27017/${process.env.MONGO_DB_NAME}`);
        console.log('MongoDB connection established successfully');
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
    }
}
