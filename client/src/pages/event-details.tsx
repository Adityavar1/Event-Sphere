import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SeatSelectionModal from "@/components/seat-selection-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import type { EventWithVenue, Seat } from "@shared/schema";

export default function EventDetails() {
  const { id } = useParams();
  const [showSeatModal, setShowSeatModal] = useState(false);

  const { data: event, isLoading } = useQuery<EventWithVenue>({
    queryKey: ["/api/events", id],
  });

  const { data: seats = [] } = useQuery<Seat[]>({
    queryKey: ["/api/events", id, "seats"],
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Event not found</div>;
  }

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Event Image */}
              <div className="h-64 lg:h-80 bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center">
                    <h1 className="text-3xl font-bold">{event.title}</h1>
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 bg-secondary/10 text-secondary"
                    data-testid="badge-category"
                  >
                    {event.category}
                  </Badge>
                  <span className="text-3xl font-bold text-dark" data-testid="text-price">
                    ${event.basePrice}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-dark mb-4" data-testid="text-title">
                  {event.title}
                </h1>

                {event.description && (
                  <p className="text-gray-600 mb-6" data-testid="text-description">
                    {event.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-dark" data-testid="text-date">
                        {formattedDate}
                      </p>
                      <p className="text-gray-600" data-testid="text-time">
                        {formattedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-dark" data-testid="text-venue">
                        {event.venue.name}
                      </p>
                      <p className="text-gray-600" data-testid="text-address">
                        {event.venue.address}
                      </p>
                    </div>
                  </div>

                  {event.duration && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-dark">Duration</p>
                        <p className="text-gray-600" data-testid="text-duration">
                          {Math.floor(event.duration / 60)}h {event.duration % 60}m
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-dark">Capacity</p>
                      <p className="text-gray-600" data-testid="text-capacity">
                        {event.venue.capacity} seats
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowSeatModal(true)}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  data-testid="button-select-seats"
                >
                  Select Seats
                </Button>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-dark mb-4">Quick Booking</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event</span>
                    <span className="font-semibold text-dark">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-semibold text-dark">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-semibold text-dark">{formattedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue</span>
                    <span className="font-semibold text-dark">{event.venue.name}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting from</span>
                    <span className="text-2xl font-bold text-primary">${event.basePrice}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowSeatModal(true)}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                  data-testid="button-book-now"
                >
                  Book Now
                </Button>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  Secure booking • Free cancellation up to 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showSeatModal && (
        <SeatSelectionModal
          event={event}
          seats={seats}
          onClose={() => setShowSeatModal(false)}
        />
      )}

      <Footer />
    </div>
  );
}
