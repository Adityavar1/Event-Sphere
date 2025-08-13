import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Star, Calendar } from "lucide-react";
import type { MovieWithShowtimes } from "@shared/schema";

export default function MovieDetails() {
  const { id } = useParams();

  const { data: movie, isLoading } = useQuery<MovieWithShowtimes>({
    queryKey: ["/api/movies", id],
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!movie) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Movie not found</div>;
  }

  const groupedShowtimes = movie.showtimes.reduce((acc, showtime) => {
    const date = new Date(showtime.showDate).toDateString();
    if (!acc[date]) acc[date] = {};
    if (!acc[date][showtime.theater.id]) acc[date][showtime.theater.id] = {
      theater: showtime.theater,
      times: []
    };
    acc[date][showtime.theater.id].times.push(showtime);
    return acc;
  }, {} as Record<string, Record<string, { theater: any; times: any[] }>>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Movie Poster */}
              <div className="h-64 lg:h-80 bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                {movie.imageUrl ? (
                  <img 
                    src={movie.imageUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center">
                    <h1 className="text-3xl font-bold">{movie.title}</h1>
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="secondary" 
                      className="px-3 py-1 bg-yellow-100 text-yellow-800"
                      data-testid="badge-rating"
                    >
                      {movie.rating}
                    </Badge>
                    {movie.imdbRating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-semibold" data-testid="text-imdb-rating">
                          {movie.imdbRating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-dark mb-4" data-testid="text-title">
                  {movie.title}
                </h1>

                {movie.description && (
                  <p className="text-gray-600 mb-6" data-testid="text-description">
                    {movie.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-dark">Duration</p>
                      <p className="text-gray-600" data-testid="text-duration">
                        {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-dark">Release Date</p>
                      <p className="text-gray-600" data-testid="text-release-date">
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {movie.genre && (
                    <div>
                      <p className="font-semibold text-dark">Genre</p>
                      <p className="text-gray-600" data-testid="text-genre">
                        {movie.genre}
                      </p>
                    </div>
                  )}

                  {movie.director && (
                    <div>
                      <p className="font-semibold text-dark">Director</p>
                      <p className="text-gray-600" data-testid="text-director">
                        {movie.director}
                      </p>
                    </div>
                  )}
                </div>

                {movie.cast && (
                  <div className="mb-8">
                    <p className="font-semibold text-dark mb-2">Cast</p>
                    <p className="text-gray-600" data-testid="text-cast">
                      {movie.cast}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Showtimes */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-dark mb-4">Showtimes</h3>
                
                {Object.keys(groupedShowtimes).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No showtimes available
                  </p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedShowtimes).map(([date, theaters]) => (
                      <div key={date}>
                        <h4 className="font-semibold text-dark mb-3" data-testid={`text-date-${date}`}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h4>
                        
                        {Object.values(theaters).map(({ theater, times }) => (
                          <div key={theater.id} className="mb-4">
                            <h5 className="font-medium text-dark mb-2" data-testid={`text-theater-${theater.id}`}>
                              {theater.name}
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {times.map((showtime) => (
                                <Button
                                  key={showtime.id}
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-primary hover:text-white"
                                  data-testid={`button-showtime-${showtime.id}`}
                                >
                                  {new Date(showtime.showDate).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
