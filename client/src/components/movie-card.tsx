import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock } from "lucide-react";
import type { Movie } from "@shared/schema";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [selectedDate, setSelectedDate] = useState<"today" | "tomorrow">("today");

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'G':
        return 'bg-green-100 text-green-800';
      case 'PG':
        return 'bg-blue-100 text-blue-800';
      case 'PG-13':
        return 'bg-yellow-100 text-yellow-800';
      case 'R':
        return 'bg-orange-100 text-orange-800';
      case 'NC-17':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock showtimes - in a real app this would come from props or API
  const mockShowtimes = {
    today: ["2:30 PM", "7:15 PM", "10:00 PM"],
    tomorrow: ["1:00 PM", "5:45 PM", "9:30 PM"]
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Movie Poster */}
      <div className="h-64 bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
        {movie.imageUrl ? (
          <img 
            src={movie.imageUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center">
            <Clock className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">{movie.title}</p>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-dark mb-2" data-testid={`text-movie-title-${movie.id}`}>
          {movie.title}
        </h3>
        
        <div className="flex items-center mb-3">
          <Badge 
            className={`text-xs font-semibold px-2 py-1 rounded ${getRatingColor(movie.rating)}`}
            data-testid={`badge-rating-${movie.id}`}
          >
            {movie.rating}
          </Badge>
          <span className="ml-2 text-gray-600 text-sm" data-testid={`text-duration-${movie.id}`}>
            {formatDuration(movie.duration)}
          </span>
          {movie.imdbRating && (
            <div className="ml-auto flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-semibold" data-testid={`text-imdb-${movie.id}`}>
                {movie.imdbRating}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <button
              onClick={() => setSelectedDate("today")}
              className={`text-gray-600 ${selectedDate === "today" ? "font-semibold text-primary" : ""}`}
              data-testid={`button-today-${movie.id}`}
            >
              Today
            </button>
            <div className="space-x-2">
              {mockShowtimes.today.map((time, index) => (
                <Link key={index} href={`/movies/${movie.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3 py-1 text-xs hover:bg-primary hover:text-white transition-colors"
                    data-testid={`button-showtime-today-${index}-${movie.id}`}
                  >
                    {time}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <button
              onClick={() => setSelectedDate("tomorrow")}
              className={`text-gray-600 ${selectedDate === "tomorrow" ? "font-semibold text-primary" : ""}`}
              data-testid={`button-tomorrow-${movie.id}`}
            >
              Tomorrow
            </button>
            <div className="space-x-2">
              {mockShowtimes.tomorrow.map((time, index) => (
                <Link key={index} href={`/movies/${movie.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3 py-1 text-xs hover:bg-primary hover:text-white transition-colors"
                    data-testid={`button-showtime-tomorrow-${index}-${movie.id}`}
                  >
                    {time}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
