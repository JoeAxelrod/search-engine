import app from './app';
import dotenv from 'dotenv';


dotenv.config();
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
