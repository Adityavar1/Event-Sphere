import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Film, Music, Theater, Trophy } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-sm bg-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="text-primary text-2xl mr-3" />
              <h1 className="text-2xl font-bold text-dark">EventSphere</h1>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-dark mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From blockbuster movies to live concerts, sports events to theater shows - find and book tickets for unforgettable experiences.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 text-lg"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-dark mb-12">
            What You Can Find
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Music className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark mb-2">Concerts</h3>
                <p className="text-gray-600">Live music performances from your favorite artists</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Film className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark mb-2">Movies</h3>
                <p className="text-gray-600">Latest blockbusters in premium theaters</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark mb-2">Sports</h3>
                <p className="text-gray-600">Exciting games and tournaments</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Theater className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark mb-2">Theater</h3>
                <p className="text-gray-600">Broadway shows and dramatic performances</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-dark mb-6">
            Ready to Start Exploring?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of event-goers who trust EventSphere for their entertainment needs.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
            data-testid="button-join-now"
          >
            Join Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="text-primary text-2xl mr-3" />
            <h3 className="text-xl font-bold">EventSphere</h3>
          </div>
          <p className="text-gray-400">
            &copy; 2024 EventSphere. All rights reserved. | Made with ❤️ for event lovers
          </p>
        </div>
      </footer>
    </div>
  );
}
