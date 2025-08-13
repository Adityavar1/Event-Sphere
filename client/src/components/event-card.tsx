import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { EventWithVenue } from "@shared/schema";

interface EventCardProps {
  event: EventWithVenue;
  variant?: "default" | "compact";
}

export default function EventCard({ event, variant = "default" }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'concert':
        return 'bg-secondary/10 text-secondary';
      case 'sports':
        return 'bg-blue-100 text-blue-700';
      case 'theater':
        return 'bg-purple-100 text-purple-700';
      case 'comedy':
        return 'bg-orange-100 text-orange-700';
      case 'festival':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-xl transition-shadow group">
        <CardContent className="p-4">
          {/* Event Image */}
          <div className="h-32 bg-gradient-to-br from-primary to-secondary rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {event.imageUrl ? (
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-white text-center">
                <Calendar className="h-8 w-8 mx-auto mb-1" />
                <p className="text-xs font-medium">{event.category}</p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-bold text-dark mb-1" data-testid={`text-event-title-${event.id}`}>
              {event.title}
            </h4>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span data-testid={`text-event-venue-${event.id}`}>{event.venue.name}</span>
            </div>
            <p className="text-primary font-semibold" data-testid={`text-event-price-${event.id}`}>
              ${event.basePrice}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      {/* Event Image */}
      <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-white text-center">
            <Calendar className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">{event.title}</p>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            className={`px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(event.category)}`}
            data-testid={`badge-category-${event.id}`}
          >
            {event.category}
          </Badge>
          <span className="text-accent font-bold text-lg" data-testid={`text-price-${event.id}`}>
            ${event.basePrice}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-dark mb-2" data-testid={`text-title-${event.id}`}>
          {event.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <span data-testid={`text-venue-${event.id}`}>{event.venue.name}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Clock className="h-4 w-4 mr-2" />
          <span data-testid={`text-datetime-${event.id}`}>
            {formattedDate} • {formattedTime}
          </span>
        </div>
        
        <Link href={`/events/${event.id}`}>
          <Button 
            className="w-full bg-primary text-white font-semibold py-3 hover:bg-primary/90 transition-colors"
            data-testid={`button-view-tickets-${event.id}`}
          >
            View Tickets
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
