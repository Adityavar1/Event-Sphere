import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import EventCard from "@/components/event-card";
import MovieCard from "@/components/movie-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Music, Film, Trophy } from "lucide-react";
import type { EventWithVenue, Movie, Theater as TheaterType } from "@shared/schema";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [eventFilters, setEventFilters] = useState({ category: "", city: "" });

  const { data: events = [] } = useQuery<EventWithVenue[]>({
    queryKey: ["/api/events", eventFilters.category, eventFilters.city, searchTerm],
  });

  const { data: movies = [] } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  const { data: theaters = [] } = useQuery<TheaterType[]>({
    queryKey: ["/api/theaters"],
  });

  const handleSearch = () => {
    setEventFilters({ 
      category: "", 
      city: selectedLocation || ""
    });
  };

  const featuredEvents = events.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Discover Amazing Events
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              From blockbuster movies to live concerts, sports events to theater shows - find and book tickets for unforgettable experiences.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
                  <Input 
                    type="text" 
                    placeholder="Search events, movies, venues..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    data-testid="input-search"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger data-testid="select-location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New York, NY">New York, NY</SelectItem>
                      <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                      <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                      <SelectItem value="Houston, TX">Houston, TX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <Input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                    data-testid="input-date"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSearch}
                className="w-full md:w-auto mt-4 px-8 py-3 bg-primary text-white font-semibold hover:bg-primary/90"
                data-testid="button-search"
              >
                <Search className="mr-2 h-4 w-4" />
                Search Events
              </Button>
            </div>
          </div>

          {/* Category Quick Access */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Music, label: "Concerts", href: "/events", category: "concert" },
                { icon: Film, label: "Movies", href: "/movies", category: "movie" },
                { icon: Trophy, label: "Sports", href: "/sports", category: "sports" },
              ].map((item) => (
                <Link 
                  key={item.category}
                  href={item.href}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-colors group block"
                  data-testid={`button-category-${item.category}`}
                >
                  <item.icon className="text-3xl text-white mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-white font-semibold">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="events" className="flex items-center gap-2" data-testid="tab-events">
              <Music className="h-4 w-4" />
              Live Events
            </TabsTrigger>
            <TabsTrigger value="movies" className="flex items-center gap-2" data-testid="tab-movies">
              <Film className="h-4 w-4" />
              Movie Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            {/* Featured Events */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-dark">Featured Events</h2>
                <Link href="/events" className="text-primary hover:text-primary/80 font-semibold" data-testid="link-view-all-events">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>


          </TabsContent>

          <TabsContent value="movies">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-dark mb-6">Now Playing in Theaters</h2>
              
              {/* Theater Selection */}
              <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-dark mb-4">Select Your Theater</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {theaters.slice(0, 4).map((theater) => (
                    <button 
                      key={theater.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-colors text-left"
                      data-testid={`button-theater-${theater.id}`}
                    >
                      <h4 className="font-semibold text-dark">{theater.name}</h4>
                      <p className="text-gray-600 text-sm">{theater.address}</p>
                      <p className="text-primary text-sm mt-1">2.3 miles away</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Movie Listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {movies.slice(0, 8).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}
