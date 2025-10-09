import cors, { type CorsOptions } from "cors";

const rawAllowed =
  process.env.CORS_ALLOWED_ORIGINS ??
  "http://127.0.0.1:5173,http://localhost:5173";
const allowedOrigins = rawAllowed
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === "production") {
  if (allowedOrigins.length === 0) {
    throw new Error("CORS is not configured properly");
  }

  if (allowedOrigins.includes("*")) {
    console.warn("CORS is configured to allow all origins in production");
  }
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // If no origin (e.g., curl, mobile apps, server-to-server), allow it.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes("*") && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed"));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept"
  ],
  credentials: true,
  optionsSuccessStatus: 204
};

class CorsMiddlewareBuilder {
  private options: CorsOptions;
  constructor() {
    this.options = {};
  }

  setAllowedOrigins(origins: string[]): CorsMiddlewareBuilder {
    this.options.origin = (origin, callback) => {
      // If no origin (e.g., curl, mobile apps, server-to-server), allow it.
      if (!origin) return callback(null, true);

      if (origins.includes("*") && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      if (origins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    };
    return this;
  }

  setMethods(methods: string[]): CorsMiddlewareBuilder {
    this.options.methods = methods;
    return this;
  }

  setAllowedHeaders(headers: string[]): CorsMiddlewareBuilder {
    this.options.allowedHeaders = headers;
    return this;
  }

  setCredentials(credentials: boolean): CorsMiddlewareBuilder {
    this.options.credentials = credentials;
    return this;
  }

  setOptionsSuccessStatus(status: number): CorsMiddlewareBuilder {
    this.options.optionsSuccessStatus = status;
    return this;
  }

  build(): (req: any, res: any, next: any) => void {
    return cors(this.options);
  }
}

const corsMiddleware = new CorsMiddlewareBuilder()
  .setAllowedOrigins(allowedOrigins)
  .setMethods(["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"])
  .setAllowedHeaders([
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept"
  ])
  .setCredentials(true)
  .setOptionsSuccessStatus(204)
  .build();

export { corsMiddleware };
