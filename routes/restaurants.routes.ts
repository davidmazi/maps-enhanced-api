import { RestaurantService } from "../services/restaurants.service";

const restaurantService = new RestaurantService();

export async function restaurantsRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/restaurants" && req.method === "GET") {
    const latitude = Number.parseFloat(url.searchParams.get("latitude")!);

    const longitude = Number.parseFloat(url.searchParams.get("longitude")!);

    const restaurants = await restaurantService.getHighlyRatedRestaurants(
      latitude,
      longitude
    );

    return new Response(JSON.stringify(restaurants), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
}
