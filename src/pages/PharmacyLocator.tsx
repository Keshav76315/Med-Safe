import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Star, Phone, Clock, Navigation as NavIcon, Search, Map } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Pharmacy {
  id: string;
  name: string;
  license_number: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  is_24_7: boolean;
  verified: boolean;
  rating: number;
  review_count: number;
  services: any;
}

export default function PharmacyLocator() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const { toast } = useToast();

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error: any) {
      console.error('Error loading pharmacies:', error);
      toast({
        title: "Error",
        description: "Failed to load pharmacies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === "all" || pharmacy.city === filterCity;
    const matchesVerified = filterVerified === "all" || 
                           (filterVerified === "verified" && pharmacy.verified) ||
                           (filterVerified === "unverified" && !pharmacy.verified);
    
    return matchesSearch && matchesCity && matchesVerified;
  });

  const cities = Array.from(new Set(pharmacies.map(p => p.city))).sort();

  const getDirections = (pharmacy: Pharmacy) => {
    const address = encodeURIComponent(`${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '0.5rem'
  };

  const renderPharmacyList = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredPharmacies.map((pharmacy) => (
        <Card key={pharmacy.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{pharmacy.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {pharmacy.verified ? (
                    <Badge variant="default" className="text-xs">
                      Verified License
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Unverified
                    </Badge>
                  )}
                  {pharmacy.is_24_7 && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      24/7
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(pharmacy.rating)
                        ? 'fill-warning text-warning'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                ({pharmacy.review_count} reviews)
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {pharmacy.address}, {pharmacy.city}, {pharmacy.state}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <a href={`tel:${pharmacy.phone}`} className="text-primary hover:underline">
                  {pharmacy.phone}
                </a>
              </div>
            </div>

            {pharmacy.services && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(pharmacy.services).map(([key, value]) => 
                  value ? (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key.replace('_', ' ')}
                    </Badge>
                  ) : null
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => getDirections(pharmacy)}
              >
                <NavIcon className="h-4 w-4 mr-1" />
                Directions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${pharmacy.phone}`)}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Pharmacy Locator</h1>
          <p className="text-muted-foreground text-lg">
            Find licensed pharmacies near you with verified credentials
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by pharmacy name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterVerified} onValueChange={setFilterVerified}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pharmacies...</p>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No pharmacies found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </Card>
        ) : (
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="list" className="gap-2">
                <MapPin className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {renderPharmacyList()}
            </TabsContent>

            <TabsContent value="map">
              {!GOOGLE_MAPS_API_KEY ? (
                <Card className="p-12 text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Google Maps API Key Required</h3>
                  <p className="text-muted-foreground">
                    Please configure your Google Maps API key in the backend settings to view the map.
                  </p>
                </Card>
              ) : (
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={6}
                  >
                    {filteredPharmacies.map((pharmacy) => (
                      pharmacy.latitude && pharmacy.longitude ? (
                        <Marker
                          key={pharmacy.id}
                          position={{ lat: pharmacy.latitude, lng: pharmacy.longitude }}
                          onClick={() => setSelectedPharmacy(pharmacy)}
                        />
                      ) : null
                    ))}

                    {selectedPharmacy && selectedPharmacy.latitude && selectedPharmacy.longitude && (
                      <InfoWindow
                        position={{ lat: selectedPharmacy.latitude, lng: selectedPharmacy.longitude }}
                        onCloseClick={() => setSelectedPharmacy(null)}
                      >
                        <div className="p-2 max-w-xs">
                          <h3 className="font-semibold mb-1">{selectedPharmacy.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {selectedPharmacy.verified && (
                              <Badge variant="default" className="text-xs">Verified</Badge>
                            )}
                            {selectedPharmacy.is_24_7 && (
                              <Badge variant="outline" className="text-xs">24/7</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedPharmacy.address}, {selectedPharmacy.city}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => getDirections(selectedPharmacy)}
                            >
                              Get Directions
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`tel:${selectedPharmacy.phone}`)}
                            >
                              Call
                            </Button>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
              )}
            </TabsContent>
          </Tabs>
        )}

        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-2">Can't find your pharmacy?</h3>
          <p className="text-muted-foreground mb-4">
            Help us expand our database by suggesting new licensed pharmacies in your area.
          </p>
          <Button variant="default">
            Suggest a Pharmacy
          </Button>
        </Card>
      </main>
    </div>
  );
}
