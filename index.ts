import { restaurantsRouter } from "./routes/restaurants.routes";

function validateEnvironment() {
  const requiredEnvVars = ["GMAPS_API_KEY"];
  const missingEnvVars = requiredEnvVars.filter((varName) => !Bun.env[varName]);

  if (missingEnvVars.length > 0) {
    console.error(
      "\x1b[31mError: The following required environment variables are not set:\x1b[0m"
    );
    missingEnvVars.forEach((varName) => console.error(`- ${varName}`));
    console.error(
      "Please set these environment variables and restart the server."
    );
    throw new Error(`Missing env vars, ${missingEnvVars.join(", ")}`);
  }
}

validateEnvironment();

const server = Bun.serve({
  port: 3000,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/restaurants")) {
      return restaurantsRouter(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.debug(
  `🚀\x1b[35m ~ Server running at http://${server.hostname}:${server.port}\x1b[0m`
);
