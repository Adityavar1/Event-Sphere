import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { EventWithVenue, Seat } from "@shared/schema";

interface SeatSelectionModalProps {
  event: EventWithVenue;
  seats: Seat[];
  onClose: () => void;
}

interface SelectedSeat {
  id: string;
  seatNumber: string;
  row: string;
  section: string;
  seatType: string;
  price: number;
}

export default function SeatSelectionModal({ event, seats, onClose }: SeatSelectionModalProps) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Group seats by section and type for pricing
  const getBasePriceForSeat = (seat: Seat): number => {
    const basePrice = parseFloat(event.basePrice);
    const multiplier = parseFloat(seat.priceMultiplier || "1.00");
    
    // Add pricing based on seat type
    let typeMultiplier = 1;
    switch (seat.seatType) {
      case 'vip':
        typeMultiplier = 1.5;
        break;
      case 'premium':
        typeMultiplier = 1.2;
        break;
      default:
        typeMultiplier = 1;
    }
    
    return Math.round(basePrice * multiplier * typeMultiplier);
  };

  const handleSeatClick = (seat: Seat) => {
    const price = getBasePriceForSeat(seat);
    const seatId = seat.id;
    
    const isSelected = selectedSeats.some(s => s.id === seatId);
    
    if (isSelected) {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    } else {
      // Select seat (limit to 8 seats)
      if (selectedSeats.length >= 8) {
        toast({
          title: "Seat Limit Reached",
          description: "You can select up to 8 seats at a time.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedSeats(prev => [...prev, {
        id: seatId,
        seatNumber: seat.seatNumber,
        row: seat.row,
        section: seat.section,
        seatType: seat.seatType,
        price,
      }]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat to continue.",
        variant: "destructive",
      });
      return;
    }

    // Store checkout data in localStorage for the checkout page
    const checkoutData = {
      eventId: event.id,
      selectedSeats: selectedSeats.map(seat => ({
        seatId: seat.id,
        price: seat.price.toString(),
      })),
      totalAmount: totalPrice.toString(),
      eventTitle: event.title,
      venueOrTheater: event.venue.name,
      datetime: new Date(event.eventDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    setLocation('/checkout');
  };

  // Group seats by row and section for display
  const groupedSeats = seats.reduce((acc, seat) => {
    const key = `${seat.section}-${seat.row}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort sections and rows
  const sortedSections = Object.keys(groupedSeats).sort((a, b) => {
    const [sectionA, rowA] = a.split('-');
    const [sectionB, rowB] = b.split('-');
    
    if (sectionA !== sectionB) {
      return sectionA.localeCompare(sectionB);
    }
    return rowA.localeCompare(rowB);
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-dark" data-testid="text-modal-title">
                  Select Your Seats
                </h3>
                <p className="text-gray-600" data-testid="text-event-name">
                  {event.title}
                </p>
                <p className="text-gray-500" data-testid="text-event-datetime">
                  {new Date(event.eventDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
                data-testid="button-close-modal"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Seat Map */}
          <div className="p-6">
            {/* Stage/Screen Indicator */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg py-4 mb-4">
                <p className="text-white font-semibold text-lg">🎵 STAGE 🎵</p>
              </div>
            </div>

            {/* Seat Legend */}
            <div className="flex justify-center space-x-6 mb-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-sm mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                <span>Taken</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded-sm mr-2"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-sm mr-2"></div>
                <span>VIP</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-400 rounded-sm mr-2"></div>
                <span>Premium</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="max-w-4xl mx-auto">
              {sortedSections.map((sectionRow) => {
                const [section, row] = sectionRow.split('-');
                const sectionSeats = groupedSeats[sectionRow].sort((a, b) => 
                  a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })
                );
                
                // Determine section pricing
                const sampleSeat = sectionSeats[0];
                const sectionPrice = getBasePriceForSeat(sampleSeat);
                const sectionLabel = sampleSeat.seatType === 'vip' ? 'VIP Section' : 
                                   sampleSeat.seatType === 'premium' ? 'Premium Section' : 
                                   'General Admission';

                return (
                  <div key={sectionRow} className="mb-4">
                    <h4 className="text-center text-sm font-semibold text-gray-600 mb-2">
                      {sectionLabel} - ${sectionPrice}
                    </h4>
                    <div className="flex justify-center items-center space-x-1 mb-2">
                      <span className="text-xs text-gray-500 w-6 text-center">{row}</span>
                      {sectionSeats.map((seat) => {
                        const isSelected = selectedSeats.some(s => s.id === seat.id);
                        const price = getBasePriceForSeat(seat);
                        
                        let buttonClass = "w-6 h-6 rounded-sm transition-colors text-xs";
                        
                        if (isSelected) {
                          buttonClass += " bg-primary hover:bg-primary/90 text-white";
                        } else {
                          switch (seat.seatType) {
                            case 'vip':
                              buttonClass += " bg-yellow-400 hover:bg-yellow-500";
                              break;
                            case 'premium':
                              buttonClass += " bg-purple-400 hover:bg-purple-500";
                              break;
                            default:
                              buttonClass += " bg-gray-200 hover:bg-gray-300";
                          }
                        }

                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            className={buttonClass}
                            title={`Seat ${seat.row}${seat.seatNumber} - $${price}`}
                            data-testid={`button-seat-${seat.row}${seat.seatNumber}`}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Selected Seats: <span data-testid="text-selected-count">{selectedSeats.length}</span>
                </p>
                {selectedSeats.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {selectedSeats.map(seat => `${seat.row}${seat.seatNumber}`).join(', ')}
                  </p>
                )}
                <p className="text-2xl font-bold text-dark">
                  Total: $<span data-testid="text-total-price">{totalPrice}</span>
                </p>
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={selectedSeats.length === 0}
                  className="px-8 py-3 bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-checkout"
                >
                  Continue to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
