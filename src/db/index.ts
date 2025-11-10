import postgres from "postgres";
import { loadEnvFile } from "process";

let sql: postgres.Sql | null = null;

export function getSql(): postgres.Sql {
  if (sql === null) {
    initializeDB();
  }
  return sql!;
}

// forces load .env file
loadEnvFile();

// Test database connection
export const connectDB = async () => {
  try {
    // Now connect to the specific database
    sql = postgres({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "postgres",
      max: 15,
    });

    return sql;
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

// Initialize database tables
export const initDB = async () => {
  try {
    // Create import jobs table
    await getSql()`
      CREATE TABLE IF NOT EXISTS jobs (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        job_key character varying(255) NOT NULL,
        resource character varying(20) NOT NULL,
        status character varying(20) NOT NULL,
        success integer NULL DEFAULT 0,
        errors integer NULL DEFAULT 0,
        CONSTRAINT pk_jobs PRIMARY KEY (id)
      );
    `;

    // Create users table
    await getSql()`
      CREATE TABLE IF NOT EXISTS users (
        id character varying(50) NOT NULL,
        email character varying(255) NOT NULL,
        name character varying(100) NOT NULL,
        role character varying(20) NOT NULL,
        active boolean NULL DEFAULT true,
        created_at timestamp with time zone NULL DEFAULT now(),
        updated_at timestamp with time zone NULL DEFAULT now(),
        CONSTRAINT pk_users PRIMARY KEY (id),
        CONSTRAINT uq_users_email UNIQUE (email)
      );
    `;

    // Create articles table with foreign key
    await getSql()`
    CREATE TABLE IF NOT EXISTS articles (
        id character varying(50) NOT NULL,
        slug character varying(200) NOT NULL,
        title character varying(200) NOT NULL,
        body text NOT NULL,
        author_id character varying(50) NOT NULL,
        tags text NULL,
        published_at timestamp with time zone NULL,
        status character varying(20) NULL,
        CONSTRAINT pk_articles PRIMARY KEY (id),
        CONSTRAint uq_articles_slug UNIQUE (slug),
        CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Create comments table with foreign keys
    await getSql()`
    CREATE TABLE IF NOT EXISTS comments (
      id character varying(50) NOT NUll,
      article_id character varying(50) NOT NULL,
      user_id character varying(50) NOT NULL,
      body TEXT NOT NULL,
      created_at timestamp DEFAULT NOW(),
      CONSTRAINT pk_comments PRIMARY KEY (id),
      CONSTRAINT fk_articles_id FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      CONSTRAINT fk_users_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    `;

    console.log("Database tables initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export async function initializeDB() {
  try {
    console.log("Initializing database...");
    await connectDB();
    await initDB();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}
