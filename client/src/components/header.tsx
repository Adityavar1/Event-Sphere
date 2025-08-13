import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Bell, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Calendar className="text-primary text-2xl mr-3" />
              <h1 className="text-2xl font-bold text-dark">EventSphere</h1>
            </Link>
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link 
                href="/events" 
                className="text-dark hover:text-primary font-medium transition-colors"
                data-testid="link-events"
              >
                Events
              </Link>
              <Link 
                href="/movies" 
                className="text-dark hover:text-primary font-medium transition-colors"
                data-testid="link-movies"
              >
                Movies
              </Link>
              <Link 
                href="/sports" 
                className="text-dark hover:text-primary font-medium transition-colors"
                data-testid="link-sports"
              >
                Sports
              </Link>
            </nav>
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="hidden sm:flex items-center px-4 py-2 bg-gray-100 text-dark rounded-lg hover:bg-gray-200 transition-colors"
                data-testid="button-location"
              >
                <MapPin className="mr-2 h-4 w-4" />
                <span>{"New York, NY"}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="p-2 text-dark hover:text-primary transition-colors"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={(user as any)?.profileImageUrl} alt="User profile" />
                  <AvatarFallback>
                    {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col">
                  <span className="font-medium text-dark text-sm" data-testid="text-user-name">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-primary p-0 h-auto justify-start"
                    data-testid="button-logout"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
              
              <Link href="/dashboard">
                <Button 
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-white"
                  data-testid="button-dashboard"
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
