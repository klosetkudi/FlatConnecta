import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { 
  Search, 
  Home, 
  MapPin, 
  Filter, 
  IndianRupee, 
  CheckCircle, 
  Menu, 
  X, 
  Bed, 
  Bath, 
  Maximize, 
  Phone,
  ArrowRight,
  Building,
  Users,
  Loader,
  Video,
  ShieldCheck,
  AlertCircle,
  Check,
  Trash2,
  Clock,
  Brain,
  Mail,
  Wallet,
  Zap,
  Smile,
  HelpCircle,
  BookOpen,
  Star,
  Image as ImageIcon,
  LogOut,
  User,
  Smartphone
} from 'lucide-react';

// --- Mock Data (Used for Admin Approval simulation, but Active list starts empty) ---
const MOCK_PENDING_DATA = [
  {
    id: 1,
    title: "Luxury 3BHK in Bandra West",
    location: "Bandra West, Mumbai",
    city: "Mumbai",
    rent: 85000,
    bhk: 3,
    bathrooms: 3,
    sqft: 1450,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    type: "Apartment",
    amenities: ["Gym", "Pool", "Parking", "Security"],
    video: "mock_video_url.mp4"
  }
];

// --- Helper Functions ---
const getBrokerage = (rent) => {
  return rent > 50000 ? 16999 : 12499;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({ city: 'All', bhk: 'All' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  
  // Auth State
  const [user, setUser] = useState(null); // { name, email, phone, type: 'buyer' | 'seller' }
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'
  const [authTargetRole, setAuthTargetRole] = useState('buyer'); // 'buyer' or 'seller'
  const [pendingAction, setPendingAction] = useState(null); 
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [signupData, setSignupData] = useState(null); // Temp store for signup details before OTP

  // Data States - Active Properties start EMPTY as requested
  const [activeProperties, setActiveProperties] = useState([]); 
  const [pendingProperties, setPendingProperties] = useState([]); // Empty initially, user adds via form
  const [isAdmin, setIsAdmin] = useState(false);

  const handleProtectedAction = (action, role) => {
    if (user) {
      if (user.type !== role) {
        alert(`This feature is only available for ${role}s. You are logged in as a ${user.type}.`);
        return;
      }
      action();
    } else {
      setPendingAction(() => action);
      setAuthTargetRole(role);
      setAuthMode('signup');
      setOtpSent(false);
      setShowAuthModal(true);
    }
  };

  // Supabase-integrated login success handler
  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    setOtpSent(false);
    setSignupData(null);

    try {
      const tableName = userData.type === 'buyer' ? 'buyers' : 'sellers';

      const { error } = await supabase
        .from(tableName)
        .insert({
          name: userData.name,
          email: userData.email,
          mobile: userData.phone
        });

      if (error) {
        console.error('Supabase insert error:', error);
      }
    } catch (err) {
      console.error('Unexpected Supabase error:', err);
    }

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => setView('home')}>
            <Building className="h-8 w-8 text-teal-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">FlatConnectio</span>
            {isAdmin && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Admin</span>}
          </div>
          
          <div className="hidden xl:flex items-center space-x-1">
            <button onClick={() => setView('home')} className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 ${view === 'home' ? 'text-teal-600' : ''}`}>Home</button>
            
            {(!user || user.type === 'buyer') && (
              <button onClick={() => handleProtectedAction(() => setView('listing'), 'buyer')} className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 ${view === 'listing' ? 'text-teal-600' : ''}`}>Browse Flats</button>
            )}

            {(!user || user.type === 'seller') && (
              <button onClick={() => handleProtectedAction(() => setView('post'), 'seller')} className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 ${view === 'post' ? 'text-teal-600' : ''}`}>List Property</button>
            )}

            <button onClick={() => setView('howItWorks')} className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 ${view === 'howItWorks' ? 'text-teal-600' : ''}`}>How It Works</button>
            <button onClick={() => setView('benefits')} className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 ${view === 'benefits' ? 'text-teal-600' : ''}`}>Benefits</button>
            <button onClick={() => setView('faq')} className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 ${view === 'faq' ? 'text-teal-600' : ''}`}>FAQs</button>

            {user ? (
              <div className="flex items-center ml-4 space-x-3">
                <span className="text-sm text-gray-600 font-medium flex items-center bg-gray-100 px-3 py-1 rounded-full capitalize">
                  <User className="h-4 w-4 mr-1" /> {user.name} ({user.type})
                </span>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center ml-4 space-x-3">
                <button 
                  onClick={() => { setAuthTargetRole('buyer'); setAuthMode('signup'); setOtpSent(false); setShowAuthModal(true); }}
                  className="bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-100 transition"
                >
                  Sign Up Buyer
                </button>
                <button 
                  onClick={() => { setAuthTargetRole('seller'); setAuthMode('signup'); setOtpSent(false); setShowAuthModal(true); }}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition shadow-md"
                >
                  Sign Up Seller
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center xl:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="xl:hidden bg-white border-t">
          <div className="px-4 pt-4 pb-4 space-y-2">
            <button onClick={() => {setView('home'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-gray-700 font-medium">Home</button>
            
            {(!user || user.type === 'buyer') && (
              <button onClick={() => {handleProtectedAction(() => setView('listing'), 'buyer'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-gray-700 font-medium">Browse Flats</button>
            )}
            
            {(!user || user.type === 'seller') && (
              <button onClick={() => {handleProtectedAction(() => setView('post'), 'seller'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-gray-700 font-medium">List Property</button>
            )}
            
            <button onClick={() => {setView('howItWorks'); setIsMenuOpen(false)}} className="block w-full text-left px-3 py-2 text-gray-700 font-medium">How It Works</button>
            
            {!user ? (
              <div className="pt-4 space-y-2 border-t mt-2">
                <button 
                  onClick={() => { setAuthTargetRole('buyer'); setAuthMode('signup'); setOtpSent(false); setShowAuthModal(true); setIsMenuOpen(false); }}
                  className="block w-full text-center bg-teal-50 text-teal-700 py-2 rounded-md font-bold"
                >
                  Sign Up Buyer
                </button>
                <button 
                  onClick={() => { setAuthTargetRole('seller'); setAuthMode('signup'); setOtpSent(false); setShowAuthModal(true); setIsMenuOpen(false); }}
                  className="block w-full text-center bg-teal-600 text-white py-2 rounded-md font-bold"
                >
                  Sign Up Seller
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 font-medium">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );

  const AuthModal = () => {
    if (!showAuthModal) return null;

    const handleRequestOtp = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        type: authTargetRole
      };
      setSignupData(data);
      setOtpSent(true);
    };

    const handleVerifyOtp = (e) => {
      e.preventDefault();
      handleLoginSuccess(signupData); 
    };

    const handleLogin = (e) => {
      e.preventDefault();
      handleLoginSuccess({
        name: 'Returning User',
        phone: '+91 98765 43210',
        email: 'user@example.com',
        type: authTargetRole 
      });
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
          <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {authMode === 'signup' ? `Sign Up as ${authTargetRole === 'buyer' ? 'Buyer' : 'Seller'}` : 'Login'}
            </h3>
            <button onClick={() => setShowAuthModal(false)} className="text-teal-100 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            {authMode === 'signup' ? (
              !otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input name="phone" type="tel" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input name="email" type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500" placeholder="john@example.com" />
                  </div>
                  <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition shadow-md">
                    Get OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-teal-50 p-3 rounded text-center text-sm text-teal-800 mb-4">
                    OTP sent to {signupData?.phone}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                    <input name="otp" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center tracking-widest text-xl focus:ring-teal-500 focus:border-teal-500" placeholder="1 2 3 4" />
                  </div>
                  <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition shadow-md">
                    Verify & Complete Sign Up
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-gray-500 hover:text-teal-600">
                    Change Details
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input name="login_phone" type="tel" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500" placeholder="+91 98765 43210" />
                 </div>
                 <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition shadow-md">
                   Login with OTP
                 </button>
              </form>
            )}

            <div className="mt-6 text-center border-t pt-4">
              <p className="text-sm text-gray-600">
                {authMode === 'signup' ? "Already have an account?" : "Don't have an account?"}
              </p>
              <button 
                onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setOtpSent(false); }}
                className="mt-2 text-teal-600 font-bold hover:underline"
              >
                {authMode === 'signup' ? 'Login Here' : 'Sign Up Here'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SEOMetadata = () => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "FlatConnectio",
      "description": "Very low, flat brokerage. Rent a house without paying one month's rent as brokerage.",
      "priceRange": "₹12,499 - ₹16,999",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "makesOffer": {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Flat Rental Brokerage"
        },
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "12499",
          "priceCurrency": "INR",
          "description": "Fixed brokerage for rents below 50k"
        }
      }
    };

    return (
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    );
  };

  const Hero = () => (
    <>
      <div className="relative bg-white overflow-hidden">
        <SEOMetadata />
        <div className="max-w-7xl mx-auto">
          {(!user || user.type === 'buyer') && (
            <div className="flex flex-col lg:flex-row border-b border-gray-100">
              <div className="lg:w-1/2 py-12 px-4 sm:px-6 lg:py-24 lg:px-8 bg-white flex flex-col justify-center">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-teal-900 sm:text-5xl md:text-6xl">
                    Want to Rent a House Faster with Low Brokerage?
                  </h1>
                  <p className="mt-4 text-lg text-gray-600">
                    Here at FlatConnectio, you will pay a flat and low brokerage. Instead of paying a standard brokerage equal to one month’s rent or a percentage cut, you pay a fixed low brokerage—suitable for anyone looking to rent a house with low brokerage.
                  </p>
                  <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                    <button 
                      onClick={() => handleProtectedAction(() => setView('listing'), 'buyer')}
                      className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 shadow-lg transition-transform transform hover:-translate-y-1"
                    >
                      View Properties
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 relative h-64 sm:h-72 md:h-96 lg:h-auto">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                  alt="Modern apartment interior"
                />
                <div className="absolute inset-0 bg-teal-900 bg-opacity-20 mix-blend-multiply"></div>
              </div>
            </div>
          )}

          {(!user || user.type === 'seller') && (
            <div className="bg-teal-800 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0 text-center md:text-left max-w-2xl">
                  <h2 className="text-3xl font-bold text-white mb-4">For Owners (Sellers of Rental Space)</h2>
                  <p className="text-white font-bold text-xl leading-relaxed">
                    Owners can rent out their house for free with no hidden charges. List your house and we handle everything else.
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => handleProtectedAction(() => setView('post'), 'seller')}
                    className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-lg text-teal-900 bg-white hover:bg-teal-50 shadow-xl transition-transform transform hover:-translate-y-1"
                  >
                     List Property
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const BrokerageInfo = () => (
    <div className="bg-gray-900 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Transparent Fixed Brokerage</h2>
          <p className="mt-4 text-lg text-gray-400">Pay only when the deal is finalized.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
            <div className="px-4 py-8 sm:p-6 text-center">
              <h3 className="text-lg font-medium text-gray-300">Rent below ₹50,000</h3>
              <div className="mt-4 flex justify-center items-baseline">
                <span className="text-5xl font-extrabold text-white">₹12,499</span>
              </div>
              <p className="mt-4 text-gray-400">One-time brokerage upon finalization.</p>
            </div>
          </div>

          <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
            <div className="px-4 py-8 sm:p-6 text-center">
              <h3 className="text-lg font-medium text-gray-300">Rent above ₹50,000</h3>
              <div className="mt-4 flex justify-center items-baseline">
                <span className="text-5xl font-extrabold text-white">₹16,999</span>
              </div>
              <p className="mt-4 text-gray-400">One-time brokerage upon finalization.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ValueProposition = () => (
    <section className="bg-teal-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Stress-Free, Streamlined Rentals</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We help you find your next home through an easy, stress-free, and streamlined rental process. With upfront photos, detailed descriptions, and full video tours, you can evaluate every house for rent before stepping out—eliminating wasted visits and mismatches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Save hard-earned Money</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Flat and low brokerage cuts from bleeding your budget. Money not wasted on high brokerage stays available for things that actually matter: furnishing the home the way you want, upgrading essentials, or lowering the financial pressure of moving.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mr-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Save Precious Time</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Traditional brokers burn your time with irrelevant houses and repeated explanations. Time recovered is time you can deploy where it creates real value—setting up your new place, staying focused on work, or spending evenings with people who matter instead of chasing pointless site visits.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Eliminate Pointless Effort</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              The old process forces effort on tasks that add nothing: re-explaining requirements, negotiating with multiple agents, and screening mismatched tenants or landlords. Clearing this effort frees your bandwidth for the decisions that shape your living environment, not the logistics that exhaust you.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-4">
                <Smile className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Mental Fatigue Disappears</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              When noise and mismatches disappear, so does mental fatigue. When only aligned options reach you, you make cleaner choices, avoid second-guessing, and move into the right home without draining your headspace.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const HowItWorksSection = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-teal-900">How It Works</h2>
        <p className="mt-4 text-xl text-gray-600">A streamlined process for Renters and Owners.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {(!user || user.type === 'buyer') && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-teal-500">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-teal-100 rounded-full mr-4">
                <Users className="h-8 w-8 text-teal-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">For Renters (Buyers)</h3>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your consultation call locks your actual requirements: locality, budget, layout, non-negotiables. This removes pointless site visits. Photos and video tours are available upfront so you screen houses without wasting weekends. Only houses that match your criteria move forward. You pay a flat, low brokerage—never one month’s rent, never percentage cuts.
            </p>
          </div>
        )}

        {(!user || user.type === 'seller') && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-500">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                 <Building className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">For Owners (Sellers)</h3>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your consultation call fixes what you expect: rent range, tenant profile, restrictions, and non-negotiables. You don’t deal with random tenants who don’t fit. Only aligned, pre-screened renters reach you. <br/><br/>
              <strong>No/ Zero brokerage for renting the house. Just list it for free and we will do the rest.</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const BenefitsSection = () => (
    <div className="bg-teal-50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-teal-900">Why Choose FlatConnectio?</h2>
          <p className="mt-4 text-xl text-gray-600">Real benefits over the traditional model.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {(!user || user.type === 'buyer') && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-teal-100">
              <h3 className="text-2xl font-bold text-teal-800 mb-6 flex items-center">
                <Star className="h-6 w-6 mr-2 fill-current" /> Benefits for Renters
              </h3>
              <ul className="space-y-4">
                {[
                  "You reduce your cost of moving.",
                  "You pay very low brokerage.",
                  "You stop wasting weekends on irrelevant houses and spend time earning more money and have good time with your loved ones.",
                  "You keep more money for setting up the home you want.",
                  "You avoid decision fatigue created by mismatched rentals."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-teal-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(!user || user.type === 'seller') && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100">
              <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                <ShieldCheck className="h-6 w-6 mr-2" /> Benefits for Owners
              </h3>
              <ul className="space-y-4">
                {[
                  "You avoid random tenants who don’t meet your expectations.",
                  "You spend zero time screening.",
                  "You reduce vacancy periods by meeting aligned tenants faster.",
                  "No brokerage for selling the house i.e. completely free."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const FAQSection = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-teal-900">Frequently Asked Questions</h2>
        <p className="mt-4 text-gray-600">Everything you need to know about our low brokerage model.</p>
      </div>
      
      <div className="space-y-6">
        {[
          { q: "How can I rent a house without paying one month’s rent as brokerage?", a: "By choosing a flat-brokerage model that charges a fixed, significantly lower brokerage instead of one month’s rent or percentage-based cuts." },
          { q: "What is flat brokerage for renting a house?", a: "A fixed brokerage amount that does not increase with the property’s rent value. It stays predictable and much lower than traditional brokerage." },
          { q: "How does flat brokerage help me save money?", a: "You avoid paying a full month’s rent or a percentage of the rent. The savings are available for furnishing, upgrades, or shifting expenses." },
          { q: "How does requirement-locking save time when renting a house?", a: "Requirements are captured once and used to filter out irrelevant houses, eliminating wasted site visits." },
          { q: "Can I find a house for rent faster with flat brokerage?", a: "Yes. Pre-filtered matches eliminate noise, repeat briefings, and irrelevant listings, allowing you to reach the right house faster." },
          { q: "Is this suitable for owners looking to rent out their property?", a: "Yes. Owners meet only pre-aligned tenants and avoid unnecessary screening and delays." }
        ].map((faq, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h4 className="text-lg font-bold text-teal-900 flex items-start">
              <HelpCircle className="h-6 w-6 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
              {faq.q}
            </h4>
            <p className="mt-3 text-gray-600 ml-9 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const Listings = () => {
    if (user && user.type === 'seller') return <div className="py-20 text-center text-xl text-gray-600">Sellers do not browse properties. Please use "List Property".</div>;

    const filteredProps = activeProperties.filter(p => {
      const matchesCity = filters.city === 'All' || p.city === filters.city;
      const matchesBHK = filters.bhk === 'All' || p.bhk === parseInt(filters.bhk);
      return matchesCity && matchesBHK;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Available Properties</h2>
          
          <div className="flex space-x-4">
            <select 
              className="border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            >
              <option value="All">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>

            <select 
              className="border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
              value={filters.bhk}
              onChange={(e) => setFilters({...filters, bhk: e.target.value})}
            >
              <option value="All">All BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>
        </div>

        {filteredProps.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No properties listed yet</h3>
            <p className="text-gray-500 mt-1">New listings will appear here once approved by our team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProps.map(property => (
              <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full">
                <div className="relative h-48">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {property.type}
                  </div>
                  {property.video && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Video className="h-3 w-3 mr-1" /> Video Tour
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{property.title}</h3>
                  <p className="text-teal-600 font-bold mt-1">{formatCurrency(property.rent)} <span className="text-xs text-gray-500 font-normal">/month</span></p>
                  <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{property.city}</span>
                      <span className="text-xs font-bold text-green-600">Brokerage: {formatCurrency(getBrokerage(property.rent))}</span>
                  </div>
                  <button 
                      onClick={() => { setSelectedProperty(property); setView('details'); }}
                      className="w-full mt-4 bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition flex justify-center items-center"
                    >
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const PropertyDetails = () => {
    if (!selectedProperty) return null;
    const brokerage = getBrokerage(selectedProperty.rent);
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setView('listing')} className="mb-6 flex items-center text-gray-600 hover:text-teal-600">
          <ArrowRight className="h-4 w-4 mr-2 transform rotate-180" /> Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-96 object-cover rounded-xl shadow-lg" />
            
            <div className="mt-8">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProperty.title}</h1>
              <p className="text-lg text-gray-600 mt-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-teal-500" /> {selectedProperty.location}
              </p>

              <div className="mt-6 p-4 bg-gray-900 rounded-lg text-white text-center">
                <div className="flex items-center justify-center mb-2">
                  <Video className="h-6 w-6 mr-2 text-teal-400" />
                  <span className="font-semibold">Property Video Tour</span>
                </div>
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">Video Player Mock - {selectedProperty.video || 'No video uploaded'}</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Configuration</p>
                  <p className="text-xl font-bold text-gray-900">{selectedProperty.bhk} BHK</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Area</p>
                  <p className="text-xl font-bold text-gray-900">{selectedProperty.sqft} sqft</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Bathrooms</p>
                  <p className="text-xl font-bold text-gray-900">{selectedProperty.bathrooms}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  This stunning {selectedProperty.type} in {selectedProperty.city} offers modern living spaces 
                  and premium amenities. Located centrally in {selectedProperty.location}, 
                  it provides easy access to transport hubs, schools, and shopping centers. 
                  Perfect for families or working professionals looking for a hassle-free stay.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-24">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="text-2xl font-bold text-teal-600">{formatCurrency(selectedProperty.rent)}</span>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Fixed Brokerage</span>
                  <span className="font-bold text-gray-900">{formatCurrency(brokerage)}</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Charged only upon deal finalization.
                </p>
              </div>

              <button 
                onClick={() => handleProtectedAction(() => { setShowInquiryModal(true); setInquirySent(false); }, 'buyer')}
                className="w-full bg-teal-600 text-white py-4 rounded-lg font-bold hover:bg-teal-700 transition flex justify-center items-center shadow-lg"
              >
                <Phone className="h-5 w-5 mr-2" /> Request Call for this Property
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                We facilitate the viewing and meeting process.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PostProperty = () => {
    const [type, setType] = useState('Apartment');
    const [city, setCity] = useState('');
    const [location, setLocation] = useState('');
    const [bhk, setBhk] = useState('1');
    const [rent, setRent] = useState('');
    const [sqft, setSqft] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [photoFiles, setPhotoFiles] = useState(null);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!videoFile) {
        alert("A video walkthrough is mandatory for listing.");
        return;
      }
      if (!photoFiles || photoFiles.length === 0) {
        alert("Please upload property photos.");
        return;
      }

      const newProperty = {
        id: Math.random(),
        title: `${bhk} BHK ${type} in ${location || city}`,
        location: `${location}, ${city}`,
        city: city,
        rent: parseInt(rent),
        bhk: parseInt(bhk),
        bathrooms: Math.ceil(parseInt(bhk)/2),
        sqft: parseInt(sqft) || 800,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        type: type,
        amenities: ["Gym", "Security"],
        video: videoFile.name,
        timestamp: new Date().toLocaleDateString()
      };

      setPendingProperties([...pendingProperties, newProperty]);
      alert("Property submitted successfully! We will contact you for the consultation call shortly.");
      setView('home');
    };

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-teal-600 px-6 py-8 text-center">
            <h2 className="text-3xl font-bold text-white">List Your Property</h2>
            <p className="text-teal-100 mt-2">Consult with us to find the perfect tenant. We handle the screening.</p>
          </div>
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
               <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 mb-6">
                 <p className="text-sm text-teal-800">
                   <strong>Note:</strong> After submitting, we will schedule a <strong>Consultation Call</strong> with you to capture your tenant preferences, rent expectations, and restrictions before listing.
                 </p>
               </div>

              <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
                <h3 className="text-teal-800 font-bold flex items-center mb-2">
                  <ImageIcon className="h-5 w-5 mr-2" /> Upload Property Photos
                </h3>
                <p className="text-sm text-teal-700 mb-4">
                  Upload high-quality photos of the living room, bedrooms, kitchen, and washrooms.
                </p>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={(e) => setPhotoFiles(e.target.files)}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-teal-100 file:text-teal-700
                    hover:file:bg-teal-200
                  "
                  required
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h3 className="text-orange-800 font-bold flex items-center mb-2">
                  <Video className="h-5 w-5 mr-2" /> Mandatory Video Upload
                </h3>
                <p className="text-sm text-orange-700 mb-4">
                  To ensure transparency, you must upload a clear walkthrough video of the flat. 
                  Show all rooms, the kitchen.
                </p>
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-orange-100 file:text-orange-700
                    hover:file:bg-orange-200
                  "
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option>Apartment</option>
                    <option>Independent House</option>
                    <option>Villa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Mumbai" required />
                </div>
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-gray-700">Locality / Area</label>
                 <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Andheri West" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Rent (₹)</label>
                  <input value={rent} onChange={(e) => setRent(e.target.value)} type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="25000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">BHK</label>
                  <select value={bhk} onChange={(e) => setBhk(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Size (sqft)</label>
                   <input value={sqft} onChange={(e) => setSqft(e.target.value)} type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="1200" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                  rows="4" 
                  placeholder="Provide details about your property..."
                ></textarea>
              </div>

              <div className="pt-4 border-t">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input type="tel" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Email ID</label>
                      <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="yourname@example.com" required />
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-teal-600 text-white px-4 py-3 rounded-md font-bold hover:bg-teal-700 shadow-lg transition">
                  Submit Property for Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboard = () => {
    const approveProperty = (prop) => {
      setActiveProperties([...activeProperties, prop]);
      setPendingProperties(pendingProperties.filter(p => p.id !== prop.id));
      alert("Property Approved and Live!");
    };

    const rejectProperty = (id) => {
      setPendingProperties(pendingProperties.filter(p => p.id !== id));
      alert("Property Rejected.");
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg font-semibold">
            Pending Approvals: {pendingProperties.length}
          </div>
        </div>

        {pendingProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
             <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
             <h3 className="text-xl font-medium text-gray-900">All Caught Up!</h3>
             <p className="text-gray-500">No pending properties to review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingProperties.map(prop => (
              <div key={prop.id} className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded uppercase mr-2">Pending</span>
                        <h3 className="text-lg font-bold text-gray-900">{prop.title}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                         <p><strong>City:</strong> {prop.city}</p>
                         <p><strong>Rent:</strong> {formatCurrency(prop.rent)}</p>
                         <p><strong>BHK:</strong> {prop.bhk}</p>
                         <p><strong>Area:</strong> {prop.sqft} sqft</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
                        <p className="text-xs text-gray-500 font-bold mb-1">VIDEO UPLOAD:</p>
                        <div className="flex items-center text-teal-600">
                          <Video className="h-4 w-4 mr-2" />
                          <span className="underline cursor-pointer">{prop.video}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 justify-center md:ml-6 md:border-l md:pl-6 border-gray-100 pt-4 md:pt-0 border-t md:border-t-0">
                      <button 
                        onClick={() => approveProperty(prop)}
                        className="flex-1 flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </button>
                      <button 
                        onClick={() => rejectProperty(prop.id)}
                        className="flex-1 flex items-center justify-center bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const InquiryModal = () => {
    if (!showInquiryModal || !selectedProperty) return null;

    const brokerage = getBrokerage(selectedProperty.rent);

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowInquiryModal(false)}></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Request Call for {selectedProperty.title}
                  </h3>
                  
                  {!inquirySent ? (
                    <>
                      <div className="mt-4 bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between font-bold text-gray-900 text-sm">
                           <span>Brokerage (Payable on Finalization):</span>
                           <span>{formatCurrency(brokerage)}</span>
                        </div>
                      </div>

                      <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); setInquirySent(true); }}>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Your Name</label>
                            <input 
                              type="text" 
                              value={user?.name || ''} 
                              readOnly 
                              className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                            <input 
                              type="tel" 
                              value={user?.phone || ''} 
                              readOnly 
                              className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email ID</label>
                            <input 
                              type="email" 
                              value={user?.email || ''} 
                              readOnly 
                              className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed" 
                            />
                          </div>
                        </div>
                        
                        <textarea placeholder="Any specific requirements or questions?" className="w-full p-2 border rounded" rows="2"></textarea>
                        <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded font-bold hover:bg-teal-700">
                          Send Request
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="py-10 text-center">
                       <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                       <h4 className="text-xl font-bold text-gray-900">Request Received!</h4>
                       <p className="text-gray-500 mt-2">
                         We will call you shortly to discuss your requirements for <strong>{selectedProperty.title}</strong>.
                       </p>
                       <button onClick={() => setShowInquiryModal(false)} className="mt-6 text-teal-600 font-semibold hover:underline">
                         Close
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center"><Building className="mr-2" /> FlatConnectio</h3>
            <p className="text-gray-400 text-sm">Requirement-locked matchmaking with fixed brokerage.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <p className="text-gray-400 text-sm">flatconnectio@gmail.com</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li className="cursor-pointer hover:text-white" onClick={() => setView('home')}>Home</li>
              <li className="cursor-pointer hover:text-white" onClick={() => handleProtectedAction(() => setView('listing'), 'buyer')}>Browse Flats</li>
              <li className="cursor-pointer hover:text-white" onClick={() => handleProtectedAction(() => setView('post'), 'seller')}>List Property</li>
              <li className="cursor-pointer hover:text-white" onClick={() => setView('howItWorks')}>How It Works</li>
              <li className="cursor-pointer text-gray-500 hover:text-white mt-2" onClick={() => { setIsAdmin(!isAdmin); setView('admin'); }}>
                {isAdmin ? "Logout Admin" : "Admin Login"}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
          FlatConnectio. All rights reserved.
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />
      <AuthModal />
      
      <div className="flex-grow">
        {view === 'home' && (
          <>
            <Hero />
            {(!user || user.type !== 'seller') && <BrokerageInfo />}
            <ValueProposition />
            <div className="max-w-7xl mx-auto px-4 py-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Listings</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {activeProperties.slice(0,3).map(property => (
                   <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition" onClick={() => { setSelectedProperty(property); setView('details'); }}>
                     <img src={property.image} alt={property.title} className="h-48 w-full object-cover" />
                     <div className="p-4">
                        <h3 className="font-bold text-gray-900 truncate">{property.title}</h3>
                        <p className="text-teal-600 font-bold mt-1">{formatCurrency(property.rent)} <span className="text-xs text-gray-500 font-normal">/month</span></p>
                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{property.city}</span>
                            <span className="text-xs font-bold text-green-600">Brokerage: {formatCurrency(getBrokerage(property.rent))}</span>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="text-center mt-8">
                  <button onClick={() => handleProtectedAction(() => setView('listing'), 'buyer')} className="text-teal-600 font-semibold hover:text-teal-800 flex items-center justify-center w-full">
                    View All Properties <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
               </div>
            </div>
          </>
        )}

        {view === 'listing' && <Listings />}
        {view === 'details' && <PropertyDetails />}
        {view === 'post' && <PostProperty />}
        {view === 'howItWorks' && <HowItWorksSection />}
        {view === 'benefits' && <BenefitsSection />}
        {view === 'faq' && <FAQSection />}
        {view === 'admin' && <AdminDashboard />}
      </div>

      <InquiryModal />
      <Footer />
    </div>
  );
}
