import express, { Application } from 'express';
import apiRoutes from './routes/index.js';

export class Server {
  private app: Application;
  private port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    // Permite al servidor entender peticiones en formato JSON
    this.app.use(express.json());
  }

  private routes(): void {
    // Prefijo requerido: /api/v1
    this.app.use('/api/v1', apiRoutes);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor ejecutándose en http://localhost:${this.port}`);
    });
  }
}