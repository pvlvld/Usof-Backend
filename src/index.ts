import "reflect-metadata";
import { createApp } from "./app.js";

async function start() {
  const app = await createApp();
  const PORT = process.env.API_PORT ? +process.env.API_PORT : 3000;

  app.listen(PORT, () => {
    console.log(
      `Server is running on http://localhost:${PORT} in ${
        process.env.NODE_ENV ?? "development"
      } mode`
    );
  });
}

start();
