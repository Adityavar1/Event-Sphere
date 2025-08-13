import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import EventCard from "@/components/event-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, Music, Trophy } from "lucide-react";
import type { EventWithVenue } from "@shared/schema";

export default function Events() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Set category based on the current route
  useEffect(() => {
    if (location === "/sports") {
      setSelectedCategory("sports");
    } else if (location === "/festival") {
      setSelectedCategory("festival");
    } else {
      setSelectedCategory("");
    }
  }, [location]);

  const { data: allEvents = [], isLoading } = useQuery<EventWithVenue[]>({
    queryKey: ["/api/events", selectedCategory, selectedCity, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (searchTerm) params.append('search', searchTerm);
      
      const url = `/api/events${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  const cities = Array.from(new Set(allEvents.map(event => `${event.venue.city}, ${event.venue.state}`)));

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !selectedCity || selectedCity === "all" || `${event.venue.city}, ${event.venue.state}` === selectedCity;
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    
    return matchesSearch && matchesCity && matchesCategory;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "all" ? "" : category);
  };

  const eventsByCategory = {
    concert: filteredEvents.filter(e => e.category === 'concert'),
    sports: filteredEvents.filter(e => e.category === 'sports'),
    festival: filteredEvents.filter(e => e.category === 'festival'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Calendar className="mx-auto h-16 w-16 text-white mb-4" />
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Events
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover amazing live events near you. From concerts to sports, theater to festivals.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Search by title, venue, or description..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-event-search"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger data-testid="select-city">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Events by Category */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all" data-testid="tab-all-events">All Events</TabsTrigger>
              <TabsTrigger value="concert" data-testid="tab-concerts">
                <Music className="w-4 h-4 mr-2" />
                Concerts
              </TabsTrigger>
              <TabsTrigger value="sports" data-testid="tab-sports">
                <Trophy className="w-4 h-4 mr-2" />
                Sports
              </TabsTrigger>
              <TabsTrigger value="festival" data-testid="tab-festivals">
                <Calendar className="w-4 h-4 mr-2" />
                Festivals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                      <div className="bg-gray-300 h-4 rounded mb-2"></div>
                      <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedCity || selectedCategory ? "Try adjusting your search criteria." : "No events are available at the moment."}
                  </p>
                </div>
              )}
            </TabsContent>

            {Object.entries(eventsByCategory).map(([category, events]) => (
              <TabsContent key={category} value={category}>
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No {category} events found</h3>
                    <p className="text-gray-500">
                      {searchTerm || selectedCity ? "Try adjusting your search criteria." : `No ${category} events are available at the moment.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}