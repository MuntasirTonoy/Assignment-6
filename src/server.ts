import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;

async function bootstrap() {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

bootstrap();
