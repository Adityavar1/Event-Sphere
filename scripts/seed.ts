import { db } from "../server/db";
import { venues, events, movies, theaters, showtimes, seats } from "../shared/schema";

async function seed() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data (optional - remove if you want to preserve data)
    await db.delete(seats);
    await db.delete(showtimes);
    await db.delete(events);
    await db.delete(movies);
    await db.delete(theaters);
    await db.delete(venues);

    // Seed venues
    const venueData = [
      {
        name: "Madison Square Garden",
        address: "4 Pennsylvania Plaza",
        city: "New York",
        state: "NY",
        capacity: 20000,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      },
      {
        name: "Hollywood Bowl",
        address: "2301 Highland Ave",
        city: "Los Angeles",
        state: "CA",
        capacity: 17500,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      },
      {
        name: "Red Rocks Amphitheatre",
        address: "18300 W Alameda Pkwy",
        city: "Morrison",
        state: "CO",
        capacity: 9525,
        imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
      },
      {
        name: "Chicago Theatre",
        address: "175 N State St",
        city: "Chicago",
        state: "IL",
        capacity: 3600,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      },
    ];

    const createdVenues = await db.insert(venues).values(venueData).returning();
    console.log(`Created ${createdVenues.length} venues`);

    // Seed theaters
    const theaterData = [
      {
        name: "AMC Empire 25",
        address: "234 W 42nd St",
        city: "New York",
        state: "NY",
        totalSeats: 400,
        amenities: "IMAX, Dolby Atmos, Reclining Seats, Concessions",
      },
      {
        name: "TCL Chinese Theatre",
        address: "6925 Hollywood Blvd",
        city: "Los Angeles",
        state: "CA", 
        totalSeats: 932,
        amenities: "Premium Large Format, Reserved Seating, Concessions",
      },
      {
        name: "AMC River East 21",
        address: "322 E Illinois St",
        city: "Chicago",
        state: "IL",
        totalSeats: 350,
        amenities: "IMAX, Dolby Cinema, MacGuffins Bar, Reclining Seats",
      },
      {
        name: "Landmark Mayan Theatre",
        address: "110 Broadway",
        city: "Denver",
        state: "CO",
        totalSeats: 280,
        amenities: "Independent Films, Bar, Unique Architecture",
      },
    ];

    const createdTheaters = await db.insert(theaters).values(theaterData).returning();
    console.log(`Created ${createdTheaters.length} theaters`);

    // Seed events
    const eventData = [
      {
        title: "Taylor Swift | The Eras Tour",
        description: "Experience the complete musical journey of Taylor Swift through all her eras in this spectacular concert.",
        category: "concert",
        venueId: createdVenues[0].id,
        eventDate: new Date("2024-09-15T20:00:00Z"),
        duration: 180,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        basePrice: "89.99",
        isActive: true,
      },
      {
        title: "NBA Finals Game 7",
        description: "The ultimate showdown in professional basketball. Don't miss this historic game!",
        category: "sports",
        venueId: createdVenues[0].id,
        eventDate: new Date("2024-09-20T21:00:00Z"),
        duration: 180,
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
        basePrice: "199.99",
        isActive: true,
      },
      {
        title: "Coldplay: Music of the Spheres",
        description: "Join Coldplay for an otherworldly concert experience with stunning visuals and beloved hits.",
        category: "concert",
        venueId: createdVenues[1].id,
        eventDate: new Date("2024-09-18T19:30:00Z"),
        duration: 150,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        basePrice: "75.00",
        isActive: true,
      },
      {
        title: "Hamilton",
        description: "The revolutionary musical that tells the story of Alexander Hamilton through hip-hop and R&B.",
        category: "theater",
        venueId: createdVenues[3].id,
        eventDate: new Date("2024-09-22T19:00:00Z"),
        duration: 165,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        basePrice: "125.00",
        isActive: true,
      },
      {
        title: "Electric Daisy Carnival",
        description: "The world's largest dance music festival featuring top EDM artists and incredible stage productions.",
        category: "festival",
        venueId: createdVenues[2].id,
        eventDate: new Date("2024-09-25T18:00:00Z"),
        duration: 600,
        imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
        basePrice: "149.99",
        isActive: true,
      },
    ];

    const createdEvents = await db.insert(events).values(eventData).returning();
    console.log(`Created ${createdEvents.length} events`);

    // Seed movies
    const movieData = [
      {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.",
        rating: "PG-13",
        duration: 166,
        genre: "Sci-Fi, Adventure, Drama",
        director: "Denis Villeneuve",
        cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Oscar Isaac",
        imageUrl: "https://images.unsplash.com/photo-1489599316636-b883adf7e90d?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        releaseDate: new Date("2024-03-01"),
        imdbRating: 8.7,
        isActive: true,
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales catapults across the Multiverse, encountering a team of Spider-People charged with protecting existence itself.",
        rating: "PG",
        duration: 140,
        genre: "Animation, Action, Adventure",
        director: "Joaquim Dos Santos",
        cast: "Shameik Moore, Hailee Steinfeld, Brian Tyree Henry, Luna Lauren Vélez",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
        releaseDate: new Date("2023-06-02"),
        imdbRating: 8.9,
        isActive: true,
      },
      {
        title: "Oppenheimer",
        description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        rating: "R",
        duration: 180,
        genre: "Biography, Drama, History",
        director: "Christopher Nolan",
        cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.",
        imageUrl: "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        releaseDate: new Date("2023-07-21"),
        imdbRating: 8.6,
        isActive: true,
      },
      {
        title: "Barbie",
        description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
        rating: "PG-13",
        duration: 114,
        genre: "Comedy, Adventure, Fantasy",
        director: "Greta Gerwig",
        cast: "Margot Robbie, Ryan Gosling, America Ferrera, Kate McKinnon",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM",
        releaseDate: new Date("2023-07-21"),
        imdbRating: 7.1,
        isActive: true,
      },
    ];

    const createdMovies = await db.insert(movies).values(movieData).returning();
    console.log(`Created ${createdMovies.length} movies`);

    // Seed showtimes
    const showtimeData = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + i);
      
      for (const movie of createdMovies) {
        for (const theater of createdTheaters) {
          // Add 3 showtimes per day per movie per theater
          const times = ['14:00', '17:30', '21:00'];
          
          for (const time of times) {
            const [hours, minutes] = time.split(':');
            const showDateTime = new Date(showDate);
            showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            showtimeData.push({
              movieId: movie.id,
              theaterId: theater.id,
              showDate: showDateTime,
              price: "12.99",
              availableSeats: theater.totalSeats,
            });
          }
        }
      }
    }

    const createdShowtimes = await db.insert(showtimes).values(showtimeData).returning();
    console.log(`Created ${createdShowtimes.length} showtimes`);

    // Seed seats for venues
    const seatData = [];
    
    for (const venue of createdVenues) {
      const rows = venue.capacity <= 5000 ? 20 : venue.capacity <= 15000 ? 50 : 100;
      const seatsPerRow = Math.ceil(venue.capacity / rows);
      
      for (let row = 1; row <= rows; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
          const rowLetter = String.fromCharCode(64 + row); // A, B, C, etc.
          
          // Determine seat type, section, and price multiplier based on position
          let seatType = 'general';
          let section = 'Main Floor';
          let priceMultiplier = 1.0;
          
          if (row <= 5) {
            seatType = 'vip';
            section = 'VIP';
            priceMultiplier = 2.0;
          } else if (row <= 15) {
            seatType = 'premium';
            section = 'Premium';
            priceMultiplier = 1.5;
          } else {
            seatType = 'general';
            section = 'General';
            priceMultiplier = 1.0;
          }
          
          seatData.push({
            venueId: venue.id,
            row: rowLetter,
            seatNumber: seat.toString(),
            section,
            seatType,
            priceMultiplier: priceMultiplier.toString(),
          });
        }
      }
    }

    // Insert seats in batches to avoid memory issues
    const batchSize = 1000;
    let createdSeatsCount = 0;
    
    for (let i = 0; i < seatData.length; i += batchSize) {
      const batch = seatData.slice(i, i + batchSize);
      const createdBatch = await db.insert(seats).values(batch).returning();
      createdSeatsCount += createdBatch.length;
    }
    
    console.log(`Created ${createdSeatsCount} seats`);
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed().then(() => {
  console.log("Seeding finished!");
  process.exit(0);
});