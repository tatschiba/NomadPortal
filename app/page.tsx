'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Users, Coffee, Home, Calendar, Search, Star, PlaneLanding, Menu, Globe, Languages, Settings, MessageSquare, Sun, Cloud, Wind, Droplets, ChevronRight, ArrowUp, Bell } from 'lucide-react'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from 'framer-motion'
import Script from 'next/script'

interface User {
  id: string;
  firstName: string;
  location: string;
  nationality: string;
  profilePicture: string;
}

interface Workspace {
  id: string;
  name: string;
  wifiSpeed: string;
  rating: number;
  price: string;
  placeId: string;
  image: string;
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  wifiSpeed: string;
  rating: number;
  price: string;
  placeId: string;
  image: string;
}

interface Experience {
  id: string;
  name: string;
  price: string;
  rating: number;
  klookId: string;
  image: string;
}

interface Meetup {
  id: string;
  name: string;
  date: string;
  attendees: number;
  meetupId: string;
}

interface VisaCountry {
  id: string;
  name: string;
  flag: string;
  duration: string;
}

interface TravelEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
}

interface Weather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX' // Replace with your actual Google Analytics Measurement ID

const GoogleAnalytics = () => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `}
    </Script>
  </>
)

const useAnalytics = () => {
  const pageView = (url: string) => {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }

  const event = ({ action, category, label, value }: {
    action: string
    category: string
    label: string
    value?: number
  }) => {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }

  return { pageView, event }
}

const Rating = ({ value, onValueChange, max = 5 }: { value: number; onValueChange: (value: number) => void; max?: number }) => {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(max)].map((_, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onValueChange(index + 1)}
          className={`text-2xl ${index < value ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </motion.button>
      ))}
    </div>
  )
}

const GoogleAd = ({ width, height }: { width: string, height: string }) => (
  <div 
    className={`bg-gray-200 flex items-center justify-center`} 
    style={{ width, height }}
  >
    <p className="text-gray-500 text-sm">Google Ad</p>
  </div>
)

export default function NomadPortal() {
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [visaCountries, setVisaCountries] = useState<VisaCountry[]>([])
  const [travelEvents, setTravelEvents] = useState<TravelEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [language, setLanguage] = useState('ENG')
  const [currentLocation, setCurrentLocation] = useState('')
  const [reviews, setReviews] = useState<{ [key: string]: Review[] }>({})
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showStickyNav, setShowStickyNav] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [showOnboarding, setShowOnboarding] = useState(true)

  const { toast } = useToast()
  const { pageView, event } = useAnalytics()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchTravelEvents(),
        fetchNearbyUsers(),
        fetchWorkspaces(),
        fetchAccommodations(),
        fetchExperiences(),
        fetchMeetups(),
        fetchVisaCountries(),
        fetchWeather()
      ])
      setIsLoading(false)
    }
    fetchData()
    pageView('/nomad-portal') // Track initial page view

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }

      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom
        setShowStickyNav(headerBottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchTravelEvents = async () => {
    // Simulating API call to Google Calendar
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockEvents: TravelEvent[] = [
      { id: '1', title: 'Trip to Tokyo', start: new Date('2024-11-12'), end: new Date('2024-11-28'), location: 'Tokyo, Japan' },
      { id: '2', title: 'Bali Workation', start: new Date('2024-12-15'), end: new Date('2025-01-15'), location: 'Bali, Indonesia' },
    ]
    setTravelEvents(mockEvents)
    setCurrentLocation(mockEvents[0].location)
  }

  const fetchNearbyUsers = async () => {
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockUsers: User[] = [
      { id: '1', firstName: 'Alice', location: 'Tokyo, Japan', nationality: 'us', profilePicture: '/placeholder.svg?height=60&width=60' },
      { id: '2', firstName: 'Bob', location: 'Tokyo, Japan', nationality: 'ca', profilePicture: '/placeholder.svg?height=60&width=60' },
      { id: '3', firstName: 'Charlie', location: 'Yokohama, Japan', nationality: 'gb', profilePicture: '/placeholder.svg?height=60&width=60' },
      { id: '4', firstName: 'Diana', location: 'Osaka, Japan', nationality: 'au', profilePicture: '/placeholder.svg?height=60&width=60' },
      { id: '5', firstName: 'Eva', location: 'Kyoto, Japan', nationality: 'de', profilePicture: '/placeholder.svg?height=60&width=60' },
    ]
    setNearbyUsers(mockUsers)
  }

  const fetchWorkspaces = async () => {
    // Simulating API call to Google Places
    await new Promise(resolve => setTimeout(resolve, 1000))
    setWorkspaces([
      { id: '1', name: 'Digital Nomad Cafe', wifiSpeed: '100 Mbps', rating: 4.5, price: '$$', placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', image: '/placeholder.svg?height=200&width=300' },
      { id: '2', name: 'Workspace Central', wifiSpeed: '50 Mbps', rating: 4.2, price: '$', placeId: 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM', image: '/placeholder.svg?height=200&width=300' },
      { id: '3', name: 'Coworking Space', wifiSpeed: '75 Mbps', rating: 4.0, price: '$', placeId: 'ChIJIQBpAG2ahYAR_6128GcTUEo', image: '/placeholder.svg?height=200&width=300' },
    ])
  }

  const fetchAccommodations = async () => {
    // Simulating API call to Google Places
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAccommodations([
      { id: '1', name: 'Nomad Hostel', type: 'Hostel', wifiSpeed: '100 Mbps', rating: 4.3, price: '$$', placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', image: '/placeholder.svg?height=200&width=300' },
      { id: '2', name: 'Remote Work Hotel', type: 'Hotel', wifiSpeed: '100 Mbps', rating: 4.7, price: '$$$', placeId: 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM', image: '/placeholder.svg?height=200&width=300' },
      { id: '3', name: 'Coliving Space', type: 'Apartment', wifiSpeed: '75 Mbps', rating: 4.5, price: '$$', placeId: 'ChIJIQBpAG2ahYAR_6128GcTUEo', image: '/placeholder.svg?height=200&width=300' },
    ])
  }

  const fetchExperiences = async () => {
    // Simulating API call to Klook
    await new Promise(resolve => setTimeout(resolve, 1000))
    setExperiences([
      { id: '1', name: 'Local Food Tour', price: '$50', rating: 4.8, klookId: 'KLOOK1', image: '/placeholder.svg?height=200&width=300' },
      { id: '2', name: 'Traditional Tea Ceremony', price: '$30', rating: 4.6, klookId: 'KLOOK2', image: '/placeholder.svg?height=200&width=300' },
      { id: '3', name: 'City Walking Tour', price: '$25', rating: 4.5, klookId: 'KLOOK3', image: '/placeholder.svg?height=200&width=300' },
    ])
  }

  const fetchMeetups = async () => {
    // Simulating API call to Meetup
    await new Promise(resolve => setTimeout(resolve, 1000))
    setMeetups([
      { id: '1', name: 'Digital Nomad Networking', date: '2023-06-15', attendees: 25, meetupId: 'MEETUP1' },
      { id: '2', name: 'Remote Work Skillshare', date: '2023-06-20', attendees: 30, meetupId: 'MEETUP2' },
      { id: '3', name: 'Expat Language Exchange', date: '2023-06-25', attendees: 20, meetupId: 'MEETUP3' },
    ])
  }

  const fetchVisaCountries = async () => {
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setVisaCountries([
      { id: '1', name: 'Estonia', flag: 'https://flagcdn.com/w40/ee.png', duration: '1 year' },
      { id: '2', name: 'Portugal', flag: 'https://flagcdn.com/w40/pt.png', duration: '2 years' },
      { id: '3', name: 'Croatia', flag: 'https://flagcdn.com/w40/hr.png', duration: '1 year' },
    ])
  }

  const fetchWeather = async () => {
    // Simulating API call to a weather service
    await new Promise(resolve => setTimeout(resolve, 1000))
    setWeather({
      temperature: 25,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 10,
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Implement search logic here
    event({
      action: 'search',
      category: 'User Interaction',
      label: 'Search Query',
      value: e.target.value.length,
    })
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    // Implement language change logic here
    event({
      action: 'language_change',
      category: 'User Preference',
      label: newLanguage,
    })
  }

  const handleReviewSubmit = (itemId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: Date.now().toString(),
      rating,
      comment,
      userId: 'current-user-id', // Replace with actual user ID
    }
    setReviews(prevReviews => ({
      ...prevReviews,
      [itemId]: [...(prevReviews[itemId] || []), newReview],
    }))
    event({
      action: 'submit_review',
      category: 'User Engagement',
      label: itemId,
      value: rating,
    })
  }

  const handleFeedbackSubmit = () => {
    // Here you would typically send the feedback to your server
    console.log('Feedback submitted:', feedbackMessage)
    toast({
      title: "Feedback Sent",
      description: "Thank you for your feedback!",
    })
    setFeedbackMessage('')
    setFeedbackOpen(false)
    event({
      action: 'submit_feedback',
      category: 'User Engagement',
      label: 'Feedback',
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [...prev, message])
  }, [])

  const removeNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }, [])

  const ReviewDialog = ({ itemId, itemName }: { itemId: string, itemName: string }) => {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Add Review</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review {itemName}</DialogTitle>
            <DialogDescription>Share your experience with others.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Rating value={rating} onValueChange={setRating} />
            <Textarea
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={() => handleReviewSubmit(itemId, rating, comment)}>Submit Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const OnboardingTour = () => {
    const [step, setStep] = useState(0)
    const steps = [
      { title: 'Welcome to NomadPortal', content: 'Let\'s take a quick tour of the main features.' },
      { title: 'Your Journey', content: 'Here you can see your current location and upcoming travel plans.' },
      { title: 'Nearby Nomads', content: 'Connect with other digital nomads in your area.' },
      { title: 'Workspaces & Accommodations', content: 'Find the perfect place to work and stay.' },
      { title: 'Experiences & Events', content: 'Discover local experiences and connect with the community.' },
    ]

    return (
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{steps[step].title}</DialogTitle>
          </DialogHeader>
          <p>{steps[step].content}</p>
          <div className="flex justify-between mt-4">
            <Button onClick={() => setStep(prev => Math.max(0, prev - 1))} disabled={step === 0}>Previous</Button>
            <Button onClick={() => {
              if (step < steps.length - 1) {
                setStep(prev => prev + 1)
              } else {
                setShowOnboarding(false)
              }
            }}>
              {step === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <GoogleAnalytics />
      <OnboardingTour />
      
      <header ref={headerRef} className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Globe className="w-8 h-8 mr-2 text-primary" />
              <h1 className="text-2xl font-bold text-gray-800">NomadPortal</h1>
            </div>
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search destinations, workspaces, events..."
                  className="pl-10 pr-4 py-2 w-full md:w-64"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="flex flex-col items-center">
                <Globe className="h-5 w-5" />
                <span className="text-xs">Areas</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center">
                <Users className="h-5 w-5" />
                <span className="text-xs">Connect</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center">
                <Home className="h-5 w-5" />
                <span className="text-xs">Stay</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center">
                <Coffee className="h-5 w-5" />
                <span className="text-xs">Work</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Events</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center">
                    <Languages className="h-5 w-5" />
                    <span className="text-xs">{language}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLanguageChange('JPN')}>日本語</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ENG')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('KOR')}>한국어</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{notifications.length}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {notifications.length === 0 ? (
                    <DropdownMenuItem>No new notifications</DropdownMenuItem>
                  ) : (
                    notifications.map((notification, index) => (
                      <DropdownMenuItem key={index} onSelect={() => removeNotification(index)}>
                        {notification}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="flex flex-col items-center">
                <Menu className="h-5 w-5" />
                <span className="text-xs">Menu</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="relative">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[60vh] object-cover"
          poster="/placeholder.svg?height=600&width=1200"
        >
          <source src="https://example.com/san-diego-beach.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Welcome to NomadPortal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8"
          >
            Your gateway to digital nomad adventures
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90">Get Started</Button>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Your Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Current Location</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-4 w-3/4" />
                ) : (
                  <p className="text-lg font-semibold">{currentLocation}</p>
                )}
                {weather && !isLoading ? (
                  <div className="mt-4">
                    <div className="flex items-center">
                      <Sun className="w-6 h-6 mr-2 text-yellow-500" />
                      <span>{weather.temperature}°C, {weather.condition}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Droplets className="w-6 h-6 mr-2 text-blue-500" />
                      <span>Humidity: {weather.humidity}%</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Wind className="w-6 h-6 mr-2 text-gray-500" />
                      <span>Wind: {weather.windSpeed} km/h</span>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-20 w-full mt-4" />
                )}
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Upcoming Travel</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  travelEvents.map((event) => (
                    <div key={event.id} className="mb-4">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p>{event.start.toLocaleDateString()} - {event.end.toLocaleDateString()}</p>
                      <p>{event.location}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent>
                <GoogleAd width="100%" height="200px" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Nearby Nomads</h2>
            <Button variant="outline" className="flex items-center">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <Skeleton key={index} className="w-60 h-24" />
              ))
            ) : (
              nearbyUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="w-full sm:w-auto hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Image
                        src={user.profilePicture}
                        alt={user.firstName}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{user.firstName}</h3>
                        <p className="text-sm text-gray-600">{user.location}</p>
                        <Image
                          src={`https://flagcdn.com/w20/${user.nationality}.png`}
                          alt={`${user.nationality} flag`}
                          width={20}
                          height={15}
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Workspaces</h2>
            <Button variant="outline" className="flex items-center">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))
            ) : (
              workspaces.map((workspace) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <Image
                        src={workspace.image}
                        alt={workspace.name}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{workspace.name}</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">WiFi: {workspace.wifiSpeed}</span>
                          <span className="text-sm font-semibold">{workspace.price}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 mr-1" />
                          <span>{workspace.rating.toFixed(1)}</span>
                        </div>
                        <ReviewDialog itemId={workspace.id} itemName={workspace.name} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Accommodations</h2>
            <Button variant="outline" className="flex items-center">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))
            ) : (
              accommodations.map((accommodation) => (
                <motion.div
                  key={accommodation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <Image
                        src={accommodation.image}
                        alt={accommodation.name}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{accommodation.name}</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">{accommodation.type}</span>
                          <span className="text-sm font-semibold">{accommodation.price}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <Star className="w-5 h-5 text-yellow-400 mr-1" />
                          <span>{accommodation.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">WiFi: {accommodation.wifiSpeed}</p>
                        <ReviewDialog itemId={accommodation.id} itemName={accommodation.name} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Local Experiences</h2>
            <Button variant="outline" className="flex items-center">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))
            ) : (
              experiences.map((experience) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <Image
                        src={experience.image}
                        alt={experience.name}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{experience.name}</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">{experience.price}</span>
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 mr-1" />
                            <span>{experience.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <ReviewDialog itemId={experience.id} itemName={experience.name} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Upcoming Meetups</h2>
            <Button variant="outline" className="flex items-center">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-32 w-full" />
              ))
            ) : (
              meetups.map((meetup) => (
                <motion.div
                  key={meetup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{meetup.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">Date: {meetup.date}</p>
                      <p className="text-sm text-gray-600 mb-2">Attendees: {meetup.attendees}</p>
                      <Button variant="outline" size="sm">Join Meetup</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Digital Nomad Visa Countries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))
            ) : (
              visaCountries.map((country) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Image
                        src={country.flag}
                        alt={`${country.name} flag`}
                        width={40}
                        height={30}
                        className="rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{country.name}</h3>
                        <p className="text-sm text-gray-600">Duration: {country.duration}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Community Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Popular Work Spots</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add a map or list of popular work spots here */}
                <p>Map or list of popular work spots goes here.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Cost of Living</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add cost of living information here */}
                <p>Cost of living information goes here.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About NomadPortal</h3>
              <p className="text-sm">Your gateway to digital nomad adventures around the world.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:underline">Home</a></li>
                <li><a href="#" className="text-sm hover:underline">Destinations</a></li>
                <li><a href="#" className="text-sm hover:underline">Workspaces</a></li>
                <li><a href="#" className="text-sm hover:underline">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:underline">FAQ</a></li>
                <li><a href="#" className="text-sm hover:underline">Contact Us</a></li>
                <li><a href="#" className="text-sm hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="text-sm hover:underline">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                {/* Add social media icons here */}
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm">&copy; 2024 NomadPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-300"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}

      {showStickyNav && (
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 bg-white shadow-md z-50"
        >
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">NomadPortal</h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">Areas</Button>
              <Button variant="ghost" size="sm">Connect</Button>
              <Button variant="ghost" size="sm">Stay</Button>
              <Button variant="ghost" size="sm">Work</Button>
              <Button variant="ghost" size="sm">Events</Button>
            </div>
          </div>
        </motion.nav>
      )}

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve NomadPortal. Please share your thoughts below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your feedback here..."
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
          />
          <Button onClick={handleFeedbackSubmit}>Submit Feedback</Button>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setFeedbackOpen(true)}
              className="fixed bottom-8 left-8 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-300"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Provide Feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}