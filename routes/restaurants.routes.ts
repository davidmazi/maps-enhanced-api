import { RestaurantService } from "../services/restaurants.service";

const restaurantService = new RestaurantService();

export async function restaurantsRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/restaurants" && req.method === "GET") {
    // const restaurants = await restaurantService.getRandomRestaurants(5);
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    const restaurants = await restaurantService.getHighlyRatedRestaurants(
      48.8566,
      2.3522
    );

    return new Response(JSON.stringify(restaurants), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
}
