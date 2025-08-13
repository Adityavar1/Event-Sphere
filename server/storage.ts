import {
  users,
  venues,
  events,
  movies,
  theaters,
  showtimes,
  seats,
  bookings,
  bookingSeats,
  movieBookingSeats,
  type User,
  type UpsertUser,
  type InsertVenue,
  type Venue,
  type InsertEvent,
  type Event,
  type EventWithVenue,
  type InsertMovie,
  type Movie,
  type MovieWithShowtimes,
  type InsertTheater,
  type Theater,
  type InsertShowtime,
  type Showtime,
  type InsertSeat,
  type Seat,
  type InsertBooking,
  type Booking,
  type BookingWithDetails,
  type InsertBookingSeat,
  type InsertMovieBookingSeat,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql, ilike, or, notInArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Venue operations
  getVenues(): Promise<Venue[]>;
  getVenueById(id: string): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  
  // Event operations
  getEvents(filters?: { category?: string; city?: string; searchTerm?: string }): Promise<EventWithVenue[]>;
  getEventById(id: string): Promise<EventWithVenue | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Movie operations
  getMovies(): Promise<Movie[]>;
  getMovieById(id: string): Promise<MovieWithShowtimes | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Theater operations
  getTheaters(city?: string): Promise<Theater[]>;
  getTheaterById(id: string): Promise<Theater | undefined>;
  createTheater(theater: InsertTheater): Promise<Theater>;
  
  // Showtime operations
  getShowtimes(movieId?: string, theaterId?: string, date?: Date): Promise<(Showtime & { movie: Movie; theater: Theater })[]>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;
  
  // Seat operations
  getSeatsByVenue(venueId: string): Promise<Seat[]>;
  getAvailableSeats(eventId: string): Promise<Seat[]>;
  createSeat(seat: InsertSeat): Promise<Seat>;
  
  // Booking operations
  getUserBookings(userId: string): Promise<BookingWithDetails[]>;
  getBookingById(id: string): Promise<BookingWithDetails | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  createBookingSeat(bookingSeat: InsertBookingSeat): Promise<void>;
  createMovieBookingSeat(movieBookingSeat: InsertMovieBookingSeat): Promise<void>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{ eventsAttended: number; totalSpent: string; rewardPoints: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Venue operations
  async getVenues(): Promise<Venue[]> {
    return await db.select().from(venues).orderBy(asc(venues.name));
  }

  async getVenueById(id: string): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.id, id));
    return venue;
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db.insert(venues).values(venue).returning();
    return newVenue;
  }

  // Event operations
  async getEvents(filters?: { category?: string; city?: string; searchTerm?: string }): Promise<EventWithVenue[]> {
    const conditions = [eq(events.isActive, true)];

    if (filters?.category) {
      conditions.push(eq(events.category, filters.category as any));
    }

    if (filters?.city) {
      // Parse city format "City, State" and match against city
      const cityPart = filters.city.split(',')[0].trim();
      conditions.push(eq(venues.city, cityPart));
    }

    if (filters?.searchTerm) {
      conditions.push(
        or(
          ilike(events.title, `%${filters.searchTerm}%`),
          ilike(events.description, `%${filters.searchTerm}%`)
        )!
      );
    }

    const results = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        venueId: events.venueId,
        eventDate: events.eventDate,
        duration: events.duration,
        imageUrl: events.imageUrl,
        basePrice: events.basePrice,
        isActive: events.isActive,
        createdAt: events.createdAt,
        venue: {
          id: venues.id,
          name: venues.name,
          address: venues.address,
          city: venues.city,
          state: venues.state,
          capacity: venues.capacity,
          imageUrl: venues.imageUrl,
          createdAt: venues.createdAt,
        },
      })
      .from(events)
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(and(...conditions))
      .orderBy(asc(events.eventDate));
    
    return results;
  }

  async getEventById(id: string): Promise<EventWithVenue | undefined> {
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        venueId: events.venueId,
        eventDate: events.eventDate,
        duration: events.duration,
        imageUrl: events.imageUrl,
        basePrice: events.basePrice,
        isActive: events.isActive,
        createdAt: events.createdAt,
        venue: {
          id: venues.id,
          name: venues.name,
          address: venues.address,
          city: venues.city,
          state: venues.state,
          capacity: venues.capacity,
          imageUrl: venues.imageUrl,
          createdAt: venues.createdAt,
        },
      })
      .from(events)
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  // Movie operations
  async getMovies(): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .where(eq(movies.isActive, true))
      .orderBy(desc(movies.releaseDate));
  }

  async getMovieById(id: string): Promise<MovieWithShowtimes | undefined> {
    const movie = await db.select().from(movies).where(eq(movies.id, id));
    if (!movie[0]) return undefined;

    const movieShowtimes = await db
      .select({
        id: showtimes.id,
        movieId: showtimes.movieId,
        theaterId: showtimes.theaterId,
        showDate: showtimes.showDate,
        price: showtimes.price,
        availableSeats: showtimes.availableSeats,
        createdAt: showtimes.createdAt,
        theater: {
          id: theaters.id,
          name: theaters.name,
          address: theaters.address,
          city: theaters.city,
          state: theaters.state,
          totalSeats: theaters.totalSeats,
          amenities: theaters.amenities,
          createdAt: theaters.createdAt,
        },
      })
      .from(showtimes)
      .innerJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .where(and(
        eq(showtimes.movieId, id),
        gte(showtimes.showDate, new Date())
      ))
      .orderBy(asc(showtimes.showDate));

    return {
      ...movie[0],
      showtimes: movieShowtimes,
    };
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }

  // Theater operations
  async getTheaters(city?: string): Promise<Theater[]> {
    const conditions = [];
    
    if (city) {
      conditions.push(eq(theaters.city, city));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(theaters)
        .where(and(...conditions))
        .orderBy(asc(theaters.name));
    } else {
      return await db
        .select()
        .from(theaters)
        .orderBy(asc(theaters.name));
    }
  }

  async getTheaterById(id: string): Promise<Theater | undefined> {
    const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
    return theater;
  }

  async createTheater(theater: InsertTheater): Promise<Theater> {
    const [newTheater] = await db.insert(theaters).values(theater).returning();
    return newTheater;
  }

  // Showtime operations
  async getShowtimes(movieId?: string, theaterId?: string, date?: Date): Promise<(Showtime & { movie: Movie; theater: Theater })[]> {
    const conditions = [gte(showtimes.showDate, new Date())];

    if (movieId) {
      conditions.push(eq(showtimes.movieId, movieId));
    }

    if (theaterId) {
      conditions.push(eq(showtimes.theaterId, theaterId));
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(
        and(
          gte(showtimes.showDate, startOfDay),
          lte(showtimes.showDate, endOfDay)
        )!
      );
    }

    return await db
      .select({
        id: showtimes.id,
        movieId: showtimes.movieId,
        theaterId: showtimes.theaterId,
        showDate: showtimes.showDate,
        price: showtimes.price,
        availableSeats: showtimes.availableSeats,
        createdAt: showtimes.createdAt,
        movie: {
          id: movies.id,
          title: movies.title,
          description: movies.description,
          rating: movies.rating,
          duration: movies.duration,
          genre: movies.genre,
          director: movies.director,
          cast: movies.cast,
          imageUrl: movies.imageUrl,
          trailerUrl: movies.trailerUrl,
          releaseDate: movies.releaseDate,
          imdbRating: movies.imdbRating,
          isActive: movies.isActive,
          createdAt: movies.createdAt,
        },
        theater: {
          id: theaters.id,
          name: theaters.name,
          address: theaters.address,
          city: theaters.city,
          state: theaters.state,
          totalSeats: theaters.totalSeats,
          amenities: theaters.amenities,
          createdAt: theaters.createdAt,
        },
      })
      .from(showtimes)
      .innerJoin(movies, eq(showtimes.movieId, movies.id))
      .innerJoin(theaters, eq(showtimes.theaterId, theaters.id))
      .where(and(...conditions))
      .orderBy(asc(showtimes.showDate));
  }

  async createShowtime(showtime: InsertShowtime): Promise<Showtime> {
    const [newShowtime] = await db.insert(showtimes).values(showtime).returning();
    return newShowtime;
  }

  // Seat operations
  async getSeatsByVenue(venueId: string): Promise<Seat[]> {
    return await db
      .select()
      .from(seats)
      .where(eq(seats.venueId, venueId))
      .orderBy(asc(seats.row), asc(seats.seatNumber));
  }

  async getAvailableSeats(eventId: string): Promise<Seat[]> {
    // Get all seats for the venue
    const eventResult = await db
      .select({ venueId: events.venueId })
      .from(events)
      .where(eq(events.id, eventId));
    
    if (!eventResult[0]) return [];

    // Get booked seat IDs for this event
    const bookedSeats = await db
      .select({ seatId: bookingSeats.seatId })
      .from(bookingSeats)
      .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.id))
      .where(eq(bookings.eventId, eventId));

    const bookedSeatIds = bookedSeats.map(bs => bs.seatId);

    // Get available seats
    const conditions = [eq(seats.venueId, eventResult[0].venueId)];
    
    if (bookedSeatIds.length > 0) {
      conditions.push(notInArray(seats.id, bookedSeatIds));
    }

    return await db
      .select()
      .from(seats)
      .where(and(...conditions))
      .orderBy(asc(seats.row), asc(seats.seatNumber));
  }

  async createSeat(seat: InsertSeat): Promise<Seat> {
    const [newSeat] = await db.insert(seats).values(seat).returning();
    return newSeat;
  }

  // Booking operations
  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    const bookingsWithDetails: BookingWithDetails[] = [];

    for (const booking of userBookings) {
      let eventWithVenue = undefined;
      let showtimeWithDetails = undefined;
      let bookingSeatsData = undefined;
      let movieBookingSeatsData = undefined;

      if (booking.eventId) {
        // Get event details
        const [event] = await db
          .select({
            id: events.id,
            title: events.title,
            description: events.description,
            category: events.category,
            venueId: events.venueId,
            eventDate: events.eventDate,
            duration: events.duration,
            imageUrl: events.imageUrl,
            basePrice: events.basePrice,
            isActive: events.isActive,
            createdAt: events.createdAt,
            venue: {
              id: venues.id,
              name: venues.name,
              address: venues.address,
              city: venues.city,
              state: venues.state,
              capacity: venues.capacity,
              imageUrl: venues.imageUrl,
              createdAt: venues.createdAt,
            },
          })
          .from(events)
          .innerJoin(venues, eq(events.venueId, venues.id))
          .where(eq(events.id, booking.eventId));

        eventWithVenue = event;

        // Get booking seats
        bookingSeatsData = await db
          .select({
            id: bookingSeats.id,
            bookingId: bookingSeats.bookingId,
            seatId: bookingSeats.seatId,
            price: bookingSeats.price,
            seat: {
              id: seats.id,
              venueId: seats.venueId,
              seatNumber: seats.seatNumber,
              row: seats.row,
              section: seats.section,
              seatType: seats.seatType,
              priceMultiplier: seats.priceMultiplier,
            },
          })
          .from(bookingSeats)
          .innerJoin(seats, eq(bookingSeats.seatId, seats.id))
          .where(eq(bookingSeats.bookingId, booking.id));
      }

      if (booking.showtimeId) {
        // Get showtime details
        const [showtime] = await db
          .select({
            id: showtimes.id,
            movieId: showtimes.movieId,
            theaterId: showtimes.theaterId,
            showDate: showtimes.showDate,
            price: showtimes.price,
            availableSeats: showtimes.availableSeats,
            createdAt: showtimes.createdAt,
            movie: {
              id: movies.id,
              title: movies.title,
              description: movies.description,
              rating: movies.rating,
              duration: movies.duration,
              genre: movies.genre,
              director: movies.director,
              cast: movies.cast,
              imageUrl: movies.imageUrl,
              trailerUrl: movies.trailerUrl,
              releaseDate: movies.releaseDate,
              imdbRating: movies.imdbRating,
              isActive: movies.isActive,
              createdAt: movies.createdAt,
            },
            theater: {
              id: theaters.id,
              name: theaters.name,
              address: theaters.address,
              city: theaters.city,
              state: theaters.state,
              totalSeats: theaters.totalSeats,
              amenities: theaters.amenities,
              createdAt: theaters.createdAt,
            },
          })
          .from(showtimes)
          .innerJoin(movies, eq(showtimes.movieId, movies.id))
          .innerJoin(theaters, eq(showtimes.theaterId, theaters.id))
          .where(eq(showtimes.id, booking.showtimeId));

        showtimeWithDetails = showtime;

        // Get movie booking seats
        movieBookingSeatsData = await db
          .select()
          .from(movieBookingSeats)
          .where(eq(movieBookingSeats.bookingId, booking.id));
      }

      bookingsWithDetails.push({
        ...booking,
        event: eventWithVenue,
        showtime: showtimeWithDetails,
        bookingSeats: bookingSeatsData,
        movieBookingSeats: movieBookingSeatsData,
      });
    }

    return bookingsWithDetails;
  }

  async getBookingById(id: string): Promise<BookingWithDetails | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) return undefined;

    // Similar logic to getUserBookings but for a single booking
    let eventWithVenue = undefined;
    let showtimeWithDetails = undefined;
    let bookingSeatsData = undefined;
    let movieBookingSeatsData = undefined;

    if (booking.eventId) {
      const [event] = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          category: events.category,
          venueId: events.venueId,
          eventDate: events.eventDate,
          duration: events.duration,
          imageUrl: events.imageUrl,
          basePrice: events.basePrice,
          isActive: events.isActive,
          createdAt: events.createdAt,
          venue: {
            id: venues.id,
            name: venues.name,
            address: venues.address,
            city: venues.city,
            state: venues.state,
            capacity: venues.capacity,
            imageUrl: venues.imageUrl,
            createdAt: venues.createdAt,
          },
        })
        .from(events)
        .innerJoin(venues, eq(events.venueId, venues.id))
        .where(eq(events.id, booking.eventId));

      eventWithVenue = event;

      bookingSeatsData = await db
        .select({
          id: bookingSeats.id,
          bookingId: bookingSeats.bookingId,
          seatId: bookingSeats.seatId,
          price: bookingSeats.price,
          seat: {
            id: seats.id,
            venueId: seats.venueId,
            seatNumber: seats.seatNumber,
            row: seats.row,
            section: seats.section,
            seatType: seats.seatType,
            priceMultiplier: seats.priceMultiplier,
          },
        })
        .from(bookingSeats)
        .innerJoin(seats, eq(bookingSeats.seatId, seats.id))
        .where(eq(bookingSeats.bookingId, booking.id));
    }

    if (booking.showtimeId) {
      const [showtime] = await db
        .select({
          id: showtimes.id,
          movieId: showtimes.movieId,
          theaterId: showtimes.theaterId,
          showDate: showtimes.showDate,
          price: showtimes.price,
          availableSeats: showtimes.availableSeats,
          createdAt: showtimes.createdAt,
          movie: {
            id: movies.id,
            title: movies.title,
            description: movies.description,
            rating: movies.rating,
            duration: movies.duration,
            genre: movies.genre,
            director: movies.director,
            cast: movies.cast,
            imageUrl: movies.imageUrl,
            trailerUrl: movies.trailerUrl,
            releaseDate: movies.releaseDate,
            imdbRating: movies.imdbRating,
            isActive: movies.isActive,
            createdAt: movies.createdAt,
          },
          theater: {
            id: theaters.id,
            name: theaters.name,
            address: theaters.address,
            city: theaters.city,
            state: theaters.state,
            totalSeats: theaters.totalSeats,
            amenities: theaters.amenities,
            createdAt: theaters.createdAt,
          },
        })
        .from(showtimes)
        .innerJoin(movies, eq(showtimes.movieId, movies.id))
        .innerJoin(theaters, eq(showtimes.theaterId, theaters.id))
        .where(eq(showtimes.id, booking.showtimeId));

      showtimeWithDetails = showtime;

      movieBookingSeatsData = await db
        .select()
        .from(movieBookingSeats)
        .where(eq(movieBookingSeats.bookingId, booking.id));
    }

    return {
      ...booking,
      event: eventWithVenue,
      showtime: showtimeWithDetails,
      bookingSeats: bookingSeatsData,
      movieBookingSeats: movieBookingSeatsData,
    };
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async createBookingSeat(bookingSeat: InsertBookingSeat): Promise<void> {
    await db.insert(bookingSeats).values(bookingSeat);
  }

  async createMovieBookingSeat(movieBookingSeat: InsertMovieBookingSeat): Promise<void> {
    await db.insert(movieBookingSeats).values(movieBookingSeat);
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{ eventsAttended: number; totalSpent: string; rewardPoints: number }> {
    // Count past events attended
    const eventsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .innerJoin(events, eq(bookings.eventId, events.id))
      .where(and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed"),
        sql`${events.eventDate} < NOW()`
      ));

    // Calculate total spent
    const totalSpentResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${bookings.totalAmount}), 0)` })
      .from(bookings)
      .where(and(
        eq(bookings.userId, userId),
        eq(bookings.status, "confirmed")
      ));

    const eventsAttended = eventsCount[0]?.count || 0;
    const totalSpent = totalSpentResult[0]?.total || "0";
    const rewardPoints = Math.floor(parseFloat(totalSpent) / 10); // 1 point per $10 spent

    return {
      eventsAttended,
      totalSpent,
      rewardPoints,
    };
  }
}

export const storage = new DatabaseStorage();
