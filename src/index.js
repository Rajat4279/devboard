import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const PORT = process.env.PORT || 8000;
const app = express();

dotenv.config({
    path: '.env',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
