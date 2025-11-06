import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "mongodb+srv://seven007:seven007@poaap.f0mxo.mongodb.net/music_collection?retryWrites=true&w=majority",
  },
});
