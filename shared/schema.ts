import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location").default("New York, NY"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event categories
export const eventCategoryEnum = pgEnum('event_category', ['concert', 'sports', 'theater', 'comedy', 'festival']);

// Venues
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  capacity: integer("capacity").notNull(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: eventCategoryEnum("category").notNull(),
  venueId: varchar("venue_id").references(() => venues.id).notNull(),
  eventDate: timestamp("event_date").notNull(),
  duration: integer("duration"), // in minutes
  imageUrl: varchar("image_url"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Movie ratings
export const movieRatingEnum = pgEnum('movie_rating', ['G', 'PG', 'PG-13', 'R', 'NC-17']);

// Movies
export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  rating: movieRatingEnum("rating").notNull(),
  duration: integer("duration").notNull(), // in minutes
  genre: varchar("genre").notNull(),
  director: varchar("director"),
  cast: text("cast"),
  imageUrl: varchar("image_url"),
  trailerUrl: varchar("trailer_url"),
  releaseDate: timestamp("release_date").notNull(),
  imdbRating: decimal("imdb_rating", { precision: 3, scale: 1 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Theaters
export const theaters = pgTable("theaters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  totalSeats: integer("total_seats").notNull(),
  amenities: text("amenities"), // JSON string of amenities
  createdAt: timestamp("created_at").defaultNow(),
});

// Movie showtimes
export const showtimes = pgTable("showtimes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  movieId: varchar("movie_id").references(() => movies.id).notNull(),
  theaterId: varchar("theater_id").references(() => theaters.id).notNull(),
  showDate: timestamp("show_date").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableSeats: integer("available_seats").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seat types
export const seatTypeEnum = pgEnum('seat_type', ['general', 'premium', 'vip']);

// Seats (for events)
export const seats = pgTable("seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").references(() => venues.id).notNull(),
  seatNumber: varchar("seat_number").notNull(),
  row: varchar("row").notNull(),
  section: varchar("section").notNull(),
  seatType: seatTypeEnum("seat_type").notNull(),
  priceMultiplier: decimal("price_multiplier", { precision: 3, scale: 2 }).default('1.00'),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: varchar("event_id").references(() => events.id),
  showtimeId: varchar("showtime_id").references(() => showtimes.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("confirmed"),
  bookingDate: timestamp("booking_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking seats (for events)
export const bookingSeats = pgTable("booking_seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  seatId: varchar("seat_id").references(() => seats.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Movie booking seats (simpler for movies)
export const movieBookingSeats = pgTable("movie_booking_seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  seatNumber: varchar("seat_number").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  events: many(events),
  seats: many(seats),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
  bookings: many(bookings),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const theatersRelations = relations(theaters, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id],
  }),
  theater: one(theaters, {
    fields: [showtimes.theaterId],
    references: [theaters.id],
  }),
  bookings: many(bookings),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  venue: one(venues, {
    fields: [seats.venueId],
    references: [venues.id],
  }),
  bookingSeats: many(bookingSeats),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.id],
  }),
  bookingSeats: many(bookingSeats),
  movieBookingSeats: many(movieBookingSeats),
}));

export const bookingSeatsRelations = relations(bookingSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSeats.bookingId],
    references: [bookings.id],
  }),
  seat: one(seats, {
    fields: [bookingSeats.seatId],
    references: [seats.id],
  }),
}));

export const movieBookingSeatsRelations = relations(movieBookingSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [movieBookingSeats.bookingId],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
});

export const insertTheaterSchema = createInsertSchema(theaters).omit({
  id: true,
  createdAt: true,
});

export const insertShowtimeSchema = createInsertSchema(showtimes).omit({
  id: true,
  createdAt: true,
});

export const insertSeatSchema = createInsertSchema(seats).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingDate: true,
  createdAt: true,
});

export const insertBookingSeatSchema = createInsertSchema(bookingSeats).omit({
  id: true,
});

export const insertMovieBookingSeatSchema = createInsertSchema(movieBookingSeats).omit({
  id: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;
export type InsertTheater = z.infer<typeof insertTheaterSchema>;
export type Theater = typeof theaters.$inferSelect;
export type InsertShowtime = z.infer<typeof insertShowtimeSchema>;
export type Showtime = typeof showtimes.$inferSelect;
export type InsertSeat = z.infer<typeof insertSeatSchema>;
export type Seat = typeof seats.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBookingSeat = z.infer<typeof insertBookingSeatSchema>;
export type BookingSeat = typeof bookingSeats.$inferSelect;
export type InsertMovieBookingSeat = z.infer<typeof insertMovieBookingSeatSchema>;
export type MovieBookingSeat = typeof movieBookingSeats.$inferSelect;

// Extended types for API responses
export type EventWithVenue = Event & { venue: Venue };
export type MovieWithShowtimes = Movie & { showtimes: (Showtime & { theater: Theater })[] };
export type BookingWithDetails = Booking & {
  event?: EventWithVenue;
  showtime?: Showtime & { movie: Movie; theater: Theater };
  bookingSeats?: (BookingSeat & { seat: Seat })[];
  movieBookingSeats?: MovieBookingSeat[];
};
