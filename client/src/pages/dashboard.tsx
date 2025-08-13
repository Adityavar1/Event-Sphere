import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Settings, MapPin, Clock } from "lucide-react";
import type { BookingWithDetails } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: bookings = [], isError, error } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
    retry: false,
  });

  const { data: userStats } = useQuery<{ eventsAttended: number; totalSpent: string; rewardPoints: number }>({
    queryKey: ["/api/user/stats"],
    retry: false,
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (isError && isUnauthorizedError(error as Error)) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Redirecting to login...</div>;
  }

  const upcomingBookings = bookings.filter(booking => {
    if (booking.event) {
      return new Date(booking.event.eventDate) > new Date();
    }
    if (booking.showtime) {
      return new Date(booking.showtime.showDate) > new Date();
    }
    return false;
  });

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-dark" data-testid="text-dashboard-title">
              My Dashboard
            </h2>
            <div className="flex space-x-4">
              <Button variant="outline" data-testid="button-download-tickets">
                <Download className="mr-2 h-4 w-4" />
                Download Tickets
              </Button>
              <Button data-testid="button-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Events */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-dark mb-6" data-testid="text-upcoming-events">
                Upcoming Events
              </h3>
              
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4" data-testid="text-no-upcoming">
                      No upcoming events
                    </p>
                    <Button variant="outline" data-testid="button-browse-events">
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const isEvent = !!booking.event;
                    const title = isEvent ? booking.event!.title : booking.showtime!.movie.title;
                    const venue = isEvent ? booking.event!.venue.name : booking.showtime!.theater.name;
                    const datetime = isEvent ? booking.event!.eventDate : booking.showtime!.showDate;
                    const category = isEvent ? booking.event!.category : 'movie';
                    
                    const seatInfo = isEvent 
                      ? booking.bookingSeats?.map(bs => `${bs.seat.row}${bs.seat.seatNumber}`).join(', ')
                      : booking.movieBookingSeats?.map(mbs => mbs.seatNumber).join(', ');

                    return (
                      <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                {isEvent ? (
                                  <Calendar className="text-white text-2xl" />
                                ) : (
                                  <Calendar className="text-white text-2xl" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-dark" data-testid={`text-booking-title-${booking.id}`}>
                                  {title}
                                </h4>
                                <div className="flex items-center text-gray-600 mb-1">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span data-testid={`text-booking-venue-${booking.id}`}>{venue}</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span data-testid={`text-booking-datetime-${booking.id}`}>
                                    {new Date(datetime).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {seatInfo && (
                                  <p className="text-primary font-semibold text-sm mt-1" data-testid={`text-booking-seats-${booking.id}`}>
                                    Seats: {seatInfo}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-dark" data-testid={`text-booking-amount-${booking.id}`}>
                                ${booking.totalAmount}
                              </p>
                              <Badge 
                                className="bg-accent/10 text-accent"
                                data-testid={`badge-booking-status-${booking.id}`}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <Button 
                              className="flex-1 bg-primary text-white hover:bg-primary/90"
                              data-testid={`button-view-ticket-${booking.id}`}
                            >
                              View Ticket
                            </Button>
                            <Button 
                              variant="outline"
                              data-testid={`button-add-calendar-${booking.id}`}
                            >
                              Add to Calendar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Events Attended</span>
                    <span className="font-bold" data-testid="text-events-attended">
                      {userStats?.eventsAttended || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent</span>
                    <span className="font-bold" data-testid="text-total-spent">
                      ${userStats?.totalSpent || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rewards Points</span>
                    <span className="font-bold" data-testid="text-reward-points">
                      {userStats?.rewardPoints || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">Recent Bookings</h3>
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4" data-testid="text-no-recent">
                    No recent bookings
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => {
                      const isEvent = !!booking.event;
                      const title = isEvent ? booking.event!.title : booking.showtime!.movie.title;
                      const datetime = isEvent ? booking.event!.eventDate : booking.showtime!.showDate;

                      return (
                        <div key={booking.id} className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium text-dark text-sm" data-testid={`text-recent-title-${booking.id}`}>
                              {title}
                            </p>
                            <p className="text-gray-500 text-xs" data-testid={`text-recent-date-${booking.id}`}>
                              {new Date(datetime).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-accent font-semibold text-sm" data-testid={`text-recent-amount-${booking.id}`}>
                            ${booking.totalAmount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-primary hover:text-primary/80 font-semibold text-sm"
                  data-testid="button-view-all-history"
                >
                  View All History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
