import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, PanInfo } from "motion/react";
import {
  Shield,
  AlertTriangle,
  Phone,
  MapPin,
  X,
  CheckCircle,
  Navigation,
  Clock,
  Users,
  MessageSquare,
  Share,
  ChevronRight,
  Zap,
  Plus,
  Edit,
  Save,
  UserPlus,
  LogOut
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from '../lib/auth-context';
import { updateSafetyStatus, getActiveAlerts, EmergencyAlert, EmergencyContact, getEmergencyContacts, updateEmergencyContacts } from '../lib/supabase';

interface EmergencyModeProps {
  onExit: () => void;
}

export function EmergencyMode({ onExit }: EmergencyModeProps) {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('main'); // 'main', 'sos-confirm', 'map', 'alert-active'
  const [statusSent, setStatusSent] = useState(false);
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [sosProgress, setSosProgress] = useState(0);
  const [isSOSActivated, setIsSOSActivated] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'Family' });
  const [savingContacts, setSavingContacts] = useState(false);

  useEffect(() => {
    // Check for active alerts when component mounts
    loadActiveAlerts();
    // Load emergency contacts
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    if (!user) return;
    
    try {
      console.log('📥 Loading emergency contacts for user:', user.id);
      const contacts = await getEmergencyContacts(user.id);
      console.log('✅ Loaded contacts from database:', contacts);
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('❌ Failed to load emergency contacts:', error);
    }
  };

  const loadActiveAlerts = async () => {
    const { data } = await getActiveAlerts();
    if (data && data.length > 0) {
      setActiveAlert(data[0]);
      setCurrentView('alert-active');
    }
  };

  const handleSafeStatus = async () => {
    if (!user) return;
    
    try {
      // Get current location (if available)
      const location = await getCurrentLocation();
      
      await updateSafetyStatus({
        user_id: user.id,
        alert_id: activeAlert?.id,
        status: 'safe',
        location: location?.address || 'Campus',
        latitude: location?.latitude,
        longitude: location?.longitude
      });
      
      setStatusSent(true);
      setTimeout(() => {
        setCurrentView('main');
        setStatusSent(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating safety status:', error);
    }
  };

  const getCurrentLocation = (): Promise<{address: string, latitude: number, longitude: number} | null> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              address: 'Current Location',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  };

  const handleSOSConfirm = async () => {
    if (!user) return;
    
    try {
      const location = await getCurrentLocation();
      
      await updateSafetyStatus({
        user_id: user.id,
        alert_id: activeAlert?.id,
        status: 'need_help',
        location: location?.address || 'Campus - HELP NEEDED',
        latitude: location?.latitude,
        longitude: location?.longitude
      });
      
      setIsSOSActivated(true);
      // Vibration feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      
      setTimeout(() => {
        setIsSOSActivated(false);
        setCurrentView('main');
      }, 3000);
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      alert('Error sending SOS alert. Please try again or call emergency services directly.');
    }
  };

  const handleSOSSlide = (event: any, info: PanInfo) => {
    const containerWidth = 300; // Approximate slider width
    const progress = Math.max(0, Math.min(100, (info.offset.x / containerWidth) * 100));
    setSlideProgress(progress);
    
    if (progress > 80) {
      setIsSliding(false);
      setSlideProgress(100);
      handleSOSConfirm();
    }
  };

  const handleSOSSlideStart = () => {
    setIsSliding(true);
  };

  const handleSOSSlideEnd = () => {
    if (slideProgress < 80) {
      setSlideProgress(0);
    }
    setIsSliding(false);
  };

  const callEmergencyServices = (number: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    window.open(`tel:${number}`, '_self');
  };

  const shareLocation = async () => {
    try {
      const location = await getCurrentLocation();
      const locationText = location 
        ? `Emergency! I need help. My location: https://maps.google.com/?q=${location.latitude},${location.longitude}`
        : 'Emergency! I need help. Location services unavailable.';
      
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Location',
          text: locationText
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(locationText);
        alert('Location copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing location:', error);
    }
  };

  const sendEmergencySMS = () => {
    const message = encodeURIComponent('Emergency! I need immediate assistance. Please contact me or authorities.');
    window.open(`sms:?body=${message}`, '_self');
  };

  const handleSaveContact = async () => {
    if (!user || !newContact.name || !newContact.phone) return;
    
    setSavingContacts(true);
    
    try {
      let updatedContacts: EmergencyContact[];
      
      if (editingContact) {
        // Update existing contact
        updatedContacts = emergencyContacts.map(contact => 
          contact.id === editingContact.id 
            ? { ...editingContact, ...newContact }
            : contact
        );
        console.log('✅ Updating existing contact:', { editingContact, newContact, updatedContacts });
      } else {
        // Add new contact
        const newId = Date.now().toString();
        updatedContacts = [...emergencyContacts, { id: newId, ...newContact }];
        console.log('✅ Adding new contact:', { newContact, newId, updatedContacts });
      }
      
      console.log('📤 Saving to database...', { userId: user.id, updatedContacts });
      const { error } = await updateEmergencyContacts(user.id, updatedContacts);
      
      if (!error) {
        console.log('✅ Database save successful, updating UI state...');
        setEmergencyContacts(updatedContacts);
        setShowAddContact(false);
        setEditingContact(null);
        setNewContact({ name: '', phone: '', relationship: 'Family' });
        console.log('✅ Contact saved and dialog closed. New contacts list:', updatedContacts);
        
        // Reload contacts from database to ensure sync
        setTimeout(() => {
          loadEmergencyContacts();
        }, 100);
      } else {
        console.error('❌ Database save failed:', error);
        if (error.code === 'SCHEMA_ERROR') {
          alert('Database setup incomplete! Please check the CRITICAL-DATABASE-FIX.md file and run the required SQL migration in Supabase.');
        } else {
          alert(`Failed to save contact: ${error.message || 'Please try again.'}`);
        }
      }
    } catch (error) {
      console.error('❌ Error saving contact:', error);
      alert('Error saving contact. Please try again.');
    } finally {
      setSavingContacts(false);
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setNewContact({ name: contact.name, phone: contact.phone, relationship: contact.relationship });
    setShowAddContact(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user) return;
    
    setSavingContacts(true);
    
    try {
      const updatedContacts = emergencyContacts.filter(contact => contact.id !== contactId);
      const { error } = await updateEmergencyContacts(user.id, updatedContacts);
      
      if (!error) {
        setEmergencyContacts(updatedContacts);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setSavingContacts(false);
    }
  };

  const callContact = (phone: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    window.open(`tel:${phone}`, '_self');
  };

  if (currentView === 'alert-active') {
    return (
      <div className="min-h-screen bg-red-900 text-white p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Badge variant="destructive" className="bg-red-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            ACTIVE ALERT
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExit}
            className="border-white text-white hover:bg-white hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Alert Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-12 h-12" />
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4">{activeAlert?.title}</h1>
            <p className="text-xl mb-6">{activeAlert?.message}</p>
            
            <div className="flex justify-center gap-4 text-sm text-red-200 mb-8">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(activeAlert?.created_at || '').toLocaleTimeString()}
              </div>
              {activeAlert?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {activeAlert.location}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="space-y-4">
            <Button 
              size="lg"
              className="w-full h-16 bg-green-600 hover:bg-green-700 text-xl"
              onClick={handleSafeStatus}
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              I AM SAFE
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="w-full h-16 border-2 border-white text-white hover:bg-white hover:text-red-900 text-xl"
              onClick={() => setCurrentView('map')}
            >
              <MapPin className="w-6 h-6 mr-3" />
              VIEW EVACUATION MAP
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentView === 'sos-confirm') {
    return (
      <div className="min-h-screen bg-red-900 text-white p-4 flex flex-col justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Send SOS Alert?</h2>
          <p className="text-lg mb-8 text-red-200">
            This will immediately alert campus security and send your location.
          </p>
          
          <div className="space-y-4">
            <Button 
              size="lg"
              className="w-full h-16 bg-red-600 hover:bg-red-700 text-xl"
              onClick={handleSOSConfirm}
            >
              <Phone className="w-6 h-6 mr-3" />
              YES, SEND SOS
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="w-full h-16 border-2 border-white text-white hover:bg-white hover:text-red-900 text-xl"
              onClick={() => setCurrentView('main')}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentView === 'map') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Campus Emergency Map</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentView('main')}
            className="border-white text-white hover:bg-white hover:text-gray-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Map Placeholder */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Interactive Campus Map</p>
                <p className="text-sm text-gray-500">Emergency exits and safe zones highlighted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Legend */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Safe Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Emergency Exits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Danger Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Your Location</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border border-red-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-amber-400 rounded-lg rotate-45"></div>
        <div className="absolute bottom-40 left-20 w-28 h-28 border border-red-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-36 h-36 border border-amber-400 rounded-lg rotate-12"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div>
          <h1 className="text-xl font-bold text-red-100">EMERGENCY MODE</h1>
          <p className="text-red-300 text-sm">Immediate assistance available</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="border-red-400 text-red-300 hover:bg-red-400 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="border-red-400 text-red-300 hover:bg-red-400 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* SOS Activation Feedback */}
      {isSOSActivated && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 bg-red-600 z-50 flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.5 
            }}
            className="text-center"
          >
            <AlertTriangle className="w-24 h-24 mx-auto mb-4" />
            <h2 className="text-4xl font-bold">SOS SENT!</h2>
            <p className="text-xl">Help is on the way</p>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 pb-48">
        {/* Primary SOS Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute -inset-8 bg-red-500 rounded-full blur-xl"
            />
            
            {/* Main SOS Button */}
            <div className="relative w-64 h-64 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-2xl">
              {/* Slide to confirm overlay */}
              <div className="absolute inset-4 bg-red-800/30 rounded-full border-4 border-red-400/50 backdrop-blur-sm">
                <div className="h-full w-full rounded-full overflow-hidden relative">
                  {/* Progress background */}
                  <div 
                    className="absolute inset-0 bg-red-400/30 transition-all duration-300"
                    style={{ 
                      clipPath: `inset(0 ${100 - slideProgress}% 0 0)` 
                    }}
                  />
                  
                  {/* Draggable slider */}
                  <motion.div
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 220 }}
                    dragElastic={0.1}
                    onDragStart={handleSOSSlideStart}
                    onDrag={handleSOSSlide}
                    onDragEnd={handleSOSSlideEnd}
                    whileDrag={{ scale: 1.05 }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <motion.div
                        animate={{ 
                          scale: isSliding ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ 
                          repeat: isSliding ? Infinity : 0,
                          duration: 0.6 
                        }}
                        className="text-center"
                      >
                        <AlertTriangle className="w-16 h-16 mx-auto mb-3" />
                        <div className="text-2xl font-black">SEND</div>
                        <div className="text-2xl font-black">SOS</div>
                        <div className="text-xs mt-2 opacity-75">
                          {slideProgress < 10 ? 'Slide to activate →' : slideProgress < 80 ? 'Keep sliding →' : 'Release to send!'}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm"
        >
          {/* Call Emergency Services */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => callEmergencyServices('112')}
            className="bg-red-600/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-4 text-center hover:bg-red-600/30 transition-all duration-200"
          >
            <Phone className="w-8 h-8 mx-auto mb-2 text-red-300" />
            <div className="text-sm font-semibold text-red-100">Call 112</div>
            <div className="text-xs text-red-300">Emergency</div>
          </motion.button>

          {/* Share Location */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareLocation}
            className="bg-amber-600/20 backdrop-blur-md border border-amber-400/30 rounded-2xl p-4 text-center hover:bg-amber-600/30 transition-all duration-200"
          >
            <Share className="w-8 h-8 mx-auto mb-2 text-amber-300" />
            <div className="text-sm font-semibold text-amber-100">Share</div>
            <div className="text-xs text-amber-300">Location</div>
          </motion.button>

          {/* Send Emergency SMS */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendEmergencySMS}
            className="bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-2xl p-4 text-center hover:bg-blue-600/30 transition-all duration-200"
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-300" />
            <div className="text-sm font-semibold text-blue-100">Send</div>
            <div className="text-xs text-blue-300">SMS</div>
          </motion.button>
        </motion.div>

        {/* Status Feedback */}
        {statusSent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6"
          >
            <div className="bg-green-600/20 backdrop-blur-md border border-green-400/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-green-100">Safety status sent to campus security</span>
            </div>
          </motion.div>
        )}

        {/* Additional Emergency Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSafeStatus}
            className="bg-green-600/20 backdrop-blur-md border border-green-400/30 rounded-xl p-4 text-left hover:bg-green-600/30 transition-all duration-200"
          >
            <CheckCircle className="w-6 h-6 mb-2 text-green-300" />
            <div className="text-sm font-semibold text-green-100">I'm Safe</div>
            <div className="text-xs text-green-300">Report status</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('map')}
            className="bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-xl p-4 text-left hover:bg-blue-600/30 transition-all duration-200"
          >
            <MapPin className="w-6 h-6 mb-2 text-blue-300" />
            <div className="text-sm font-semibold text-blue-100">Campus Map</div>
            <div className="text-xs text-blue-300">Safe routes</div>
          </motion.button>
        </motion.div>
      </div>

      {/* Emergency Contacts Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900/50 backdrop-blur-xl border-t border-gray-700/50 p-4 z-40"
      >
        <div className="max-w-sm mx-auto">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Emergency Contacts
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <button 
              onClick={() => callEmergencyServices('100')}
              className="bg-red-600/20 rounded-lg p-2 text-center border border-red-400/20 hover:bg-red-600/30 transition-colors"
            >
              <div className="font-mono text-red-200">100</div>
              <div className="text-red-300">Police</div>
            </button>
            <button 
              onClick={() => callEmergencyServices('108')}
              className="bg-red-600/20 rounded-lg p-2 text-center border border-red-400/20 hover:bg-red-600/30 transition-colors"
            >
              <div className="font-mono text-red-200">108</div>
              <div className="text-red-300">Medical</div>
            </button>
            <button 
              onClick={() => callEmergencyServices('101')}
              className="bg-red-600/20 rounded-lg p-2 text-center border border-red-400/20 hover:bg-red-600/30 transition-colors"
            >
              <div className="font-mono text-red-200">101</div>
              <div className="text-red-300">Fire</div>
            </button>
          </div>
          
          {/* Personal Emergency Contacts */}
          <div className="pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-400">Personal Contacts</div>
              <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
                <DialogTrigger asChild>
                  <button 
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 relative z-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingContact(null);
                      setNewContact({ name: '', phone: '', relationship: 'Family' });
                      setShowAddContact(true);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white z-[9999]">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add someone who can be contacted in an emergency
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 p-1">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-gray-300 block mb-2">Name</Label>
                      <Input
                        id="contact-name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Enter contact name"
                        className="bg-gray-800 border-gray-600 text-white h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone" className="text-gray-300 block mb-2">Phone Number</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="bg-gray-800 border-gray-600 text-white h-11"
                      />
                    </div>
                    
                    <div className="space-y-2 relative">
                      <Label htmlFor="contact-relationship" className="text-gray-300 block mb-2">Relationship</Label>
                      <Select 
                        value={newContact.relationship} 
                        onValueChange={(value) => setNewContact({ ...newContact, relationship: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-11 relative z-10">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-gray-800 border-gray-600 text-white z-[10000]" 
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="Family" className="text-white hover:bg-gray-700 focus:bg-gray-700">Family</SelectItem>
                          <SelectItem value="Friend" className="text-white hover:bg-gray-700 focus:bg-gray-700">Friend</SelectItem>
                          <SelectItem value="Colleague" className="text-white hover:bg-gray-700 focus:bg-gray-700">Colleague</SelectItem>
                          <SelectItem value="Guardian" className="text-white hover:bg-gray-700 focus:bg-gray-700">Guardian</SelectItem>
                          <SelectItem value="Other" className="text-white hover:bg-gray-700 focus:bg-gray-700">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          try {
                            if (!newContact.name || !newContact.phone) {
                              return;
                            }
                            
                            await handleSaveContact();
                            
                          } catch (error) {
                            console.error('❌ Save button error:', error);
                          }
                        }}
                        disabled={!newContact.name || !newContact.phone || savingContacts}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-11 px-6 relative shadow-lg"
                        type="button"
                      >
                        {savingContacts ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {editingContact ? 'Update' : 'Save'}
                          </>
                        )}
                      </Button>
                      {editingContact && (
                        <Button 
                          onClick={() => handleDeleteContact(editingContact.id)}
                          disabled={savingContacts}
                          variant="destructive"
                          className="px-4 h-11"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {emergencyContacts.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-2">
                  No contacts added yet
                </div>
              ) : (
                emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditContact(contact);
                      }}
                      className="text-xs text-gray-300 hover:text-gray-100 text-left flex-1"
                    >
                      <span className="font-medium">{contact.name}</span>
                      {contact.relationship && (
                        <span className="text-gray-500 ml-1">({contact.relationship})</span>
                      )}
                    </button>
                    <button 
                      onClick={() => callContact(contact.phone)}
                      disabled={!contact.phone}
                      className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-600"
                    >
                      Call
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Demo Alert Button */}
      <div className="fixed top-20 right-4">
        <Button 
          size="sm"
          variant="outline"
          className="border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-gray-900 text-xs"
          onClick={() => setCurrentView('alert-active')}
        >
          Demo Alert
        </Button>
      </div>
    </div>
  );
}