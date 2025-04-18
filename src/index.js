import express from 'express';
import "dotenv/config"
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { conectDB } from './lib/db.js';
import cors from 'cors';
import job from './lib/cron.js';

const app = express();
const PORT= process.env.PORT || 3000;

job.start(); // Start the cron job
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Middleware to enable CORS

app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);

app.listen( PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    conectDB();
})