import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Lock } from "lucide-react";

interface CheckoutData {
  eventId?: string;
  showtimeId?: string;
  selectedSeats: Array<{
    seatId?: string;
    seatNumber?: string;
    price: string;
  }>;
  totalAmount: string;
  eventTitle: string;
  venueOrTheater: string;
  datetime: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // In a real app, this would come from state management or props
  const [checkoutData] = useState<CheckoutData>(() => {
    const stored = localStorage.getItem('checkoutData');
    return stored ? JSON.parse(stored) : null;
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking Confirmed!",
        description: "Your tickets have been booked successfully.",
      });
      localStorage.removeItem('checkoutData');
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
      console.error('Booking error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkoutData) {
      toast({
        title: "Error",
        description: "No booking data found. Please start over.",
        variant: "destructive",
      });
      return;
    }

    // Validate payment data
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required payment fields.",
        variant: "destructive",
      });
      return;
    }

    // Process booking
    createBookingMutation.mutate({
      eventId: checkoutData.eventId,
      showtimeId: checkoutData.showtimeId,
      totalAmount: checkoutData.totalAmount,
      seats: checkoutData.selectedSeats,
    });
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-dark mb-4">No Booking Data Found</h2>
              <p className="text-gray-600 mb-6">Please start over and select your tickets.</p>
              <Button onClick={() => setLocation('/')} data-testid="button-go-home">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-dark mb-8" data-testid="text-checkout-title">
          Complete Your Booking
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      required
                      data-testid="input-card-number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        required
                        data-testid="input-expiry-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        required
                        data-testid="input-cvv"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      type="text"
                      placeholder="John Doe"
                      value={paymentData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      required
                      data-testid="input-cardholder-name"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="billingAddress">Address</Label>
                    <Input
                      id="billingAddress"
                      type="text"
                      placeholder="123 Main St"
                      value={paymentData.billingAddress}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                      data-testid="input-billing-address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={paymentData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="NY"
                        value={paymentData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        data-testid="input-state"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      placeholder="10001"
                      value={paymentData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      data-testid="input-zip-code"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-dark" data-testid="text-event-title">
                        {checkoutData.eventTitle}
                      </h4>
                      <p className="text-gray-600" data-testid="text-venue">
                        {checkoutData.venueOrTheater}
                      </p>
                      <p className="text-gray-600" data-testid="text-datetime">
                        {checkoutData.datetime}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h5 className="font-medium text-dark mb-2">Selected Seats</h5>
                      {checkoutData.selectedSeats.map((seat, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span data-testid={`text-seat-${index}`}>
                            {seat.seatId || seat.seatNumber}
                          </span>
                          <span data-testid={`text-seat-price-${index}`}>
                            ${seat.price}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span data-testid="text-total-amount">
                        ${checkoutData.totalAmount}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                      disabled={createBookingMutation.isPending}
                      data-testid="button-complete-booking"
                    >
                      {createBookingMutation.isPending ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Complete Booking
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Your payment information is secured with 256-bit SSL encryption
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
