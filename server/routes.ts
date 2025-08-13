import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertEventSchema,
  insertMovieSchema,
  insertTheaterSchema,
  insertShowtimeSchema,
  insertBookingSchema,
  insertBookingSeatSchema,
  insertMovieBookingSeatSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const { category, city, search } = req.query;
      const events = await storage.getEvents({
        category: category as string,
        city: city as string,
        searchTerm: search as string,
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.get("/api/events/:id/seats", async (req, res) => {
    try {
      const seats = await storage.getAvailableSeats(req.params.id);
      res.json(seats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      res.status(500).json({ message: "Failed to fetch seats" });
    }
  });

  // Movie routes
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovieById(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  // Theater routes
  app.get("/api/theaters", async (req, res) => {
    try {
      const { city } = req.query;
      const theaters = await storage.getTheaters(city as string);
      res.json(theaters);
    } catch (error) {
      console.error("Error fetching theaters:", error);
      res.status(500).json({ message: "Failed to fetch theaters" });
    }
  });

  // Showtime routes
  app.get("/api/showtimes", async (req, res) => {
    try {
      const { movieId, theaterId, date } = req.query;
      const showtimes = await storage.getShowtimes(
        movieId as string,
        theaterId as string,
        date ? new Date(date as string) : undefined
      );
      res.json(showtimes);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if booking belongs to user
      const userId = req.user.claims.sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  const createBookingSchema = z.object({
    eventId: z.string().optional(),
    showtimeId: z.string().optional(),
    totalAmount: z.string(),
    seats: z.array(z.object({
      seatId: z.string().optional(),
      seatNumber: z.string().optional(),
      price: z.string(),
    })),
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = createBookingSchema.parse(req.body);
      
      // Create booking
      const booking = await storage.createBooking({
        userId,
        eventId: validatedData.eventId,
        showtimeId: validatedData.showtimeId,
        totalAmount: validatedData.totalAmount,
        status: "confirmed",
      });

      // Create seat bookings
      for (const seat of validatedData.seats) {
        if (validatedData.eventId && seat.seatId) {
          // Event booking with actual seats
          await storage.createBookingSeat({
            bookingId: booking.id,
            seatId: seat.seatId,
            price: seat.price,
          });
        } else if (validatedData.showtimeId && seat.seatNumber) {
          // Movie booking with seat numbers
          await storage.createMovieBookingSeat({
            bookingId: booking.id,
            seatNumber: seat.seatNumber,
            price: seat.price,
          });
        }
      }

      const bookingWithDetails = await storage.getBookingById(booking.id);
      res.json(bookingWithDetails);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // User stats route
  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Venues route (for seeding data)
  app.get("/api/venues", async (req, res) => {
    try {
      const venues = await storage.getVenues();
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
