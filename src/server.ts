import app from './app.js';
import config from './config/index.js';

async function bootstrap() {
  try {
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

bootstrap();
