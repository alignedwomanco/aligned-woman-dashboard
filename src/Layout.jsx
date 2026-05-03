import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Bell, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import NotificationsDropdown from "../components/navigation/NotificationsDropdown";
import MessagesDrawer from "../components/navigation/MessagesDrawer";
import LaurAIChatWidget from "../components/LaurAIChatWidget";

const publicPages = [
{ name: "Home", label: "Home" },
{ name: "AWBlueprint", label: "Aligned Woman Blueprint" },
{ name: "OurWhy", label: "Our Why" },
{ name: "ALIVEMethod", label: "ALIVE Method" },
{ name: "Experts", label: "Experts" },
{ name: "Apply", label: "Join" },
{ name: "Contact", label: "Contact" },
{ name: "about-us", label: "About Us", href: "/about-us" },
{ name: "blueprint", label: "Blueprint", href: "/blueprint" },
{ name: "CheckoutComplete", label: "Checkout" }];


const appNavigation = [
{ name: "Dashboard", label: "Dashboard" },
{ name: "Community", label: "Community" },
{ name: "Members", label: "Members" },
{ name: "Classroom", label: "Classroom" },
{ name: "ExpertsDirectory", label: "Experts" },
{ name: "ToolsHub", label: "Tools" },
{ name: "MyALIVEJourney", label: "ALIVE Method" },
{ name: "Support", label: "Support" }];


export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isPublicPage = publicPages.some((p) => p.name === currentPageName) || currentPageName === "Login" || currentPageName === "LandingPage" || currentPageName === "Home" || currentPageName === "blueprint" || currentPageName === "about-us" || currentPageName === "CheckoutComplete";

  // Dashboard has its own layout - render children directly
  const isDashboardPage = currentPageName === "Dashboard";

  // Redirect ALIVEMethod to Home as default page
  useEffect(() => {
    if (currentPageName === "ALIVEMethod" && window.location.pathname === "/ALIVEMethod") {
      window.location.href = createPageUrl("Home");
    }
  }, [currentPageName]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await base44.entities.SiteSettings.list();
        const settingsData = settings[0] || null;
        setSiteSettings(settingsData);
        
        // Update favicon dynamically
        if (settingsData?.light_favicon) {
          const favicon = document.querySelector("link[rel='icon']") || document.createElement("link");
          favicon.rel = "icon";
          favicon.href = settingsData.light_favicon;
          if (!document.querySelector("link[rel='icon']")) {
            document.head.appendChild(favicon);
          }
        }
      } catch (error) {
        console.error("Failed to load site settings:", error);
        setSiteSettings(null);
      }
    };
    loadSettings();
  }, []);

  // No redirect needed - Home page is served at root

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);

          // Redirect to onboarding if not completed (skip for admins)
          if (!isPublicPage && currentPageName !== "OnboardingForm" && userData?.role !== "admin") {
            const sessions = await base44.entities.DiagnosticSession.filter(
              { isComplete: true },
              "-created_date",
              1
            );

            if (!sessions || sessions.length === 0) {
              window.location.href = createPageUrl("OnboardingForm");
            }
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [currentPageName, isPublicPage]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileMenu(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close tools dropdown when sidebar collapses
  useEffect(() => {
    if (sidebarCollapsed) setShowToolsDropdown(false);
  }, [sidebarCollapsed]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showMobileMenu]);

  const isLandingPage = currentPageName === "LandingPage" || currentPageName === "Home";

  // Public page layout with hamburger menu
  if (isPublicPage) {
    return (
      <div className={isLandingPage ? "min-h-screen" : "min-h-screen bg-pink-50/30"}>
        <style>{`
          :root {
            --burgundy: #6E1D40;
            --burgundy-deep: #5A1633;
            --tertiary: #943A59;
            --rose-accent: #B85A7A;
            --rose-accent-2: #943A59;
            --rose-dark: #6E1D40;
          }
          .text-burgundy { color: var(--burgundy); }
          .bg-burgundy { background-color: var(--burgundy); }
        `}</style>

        <div className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300 ${isLandingPage ? "bg-transparent" : "bg-white/95 backdrop-blur-sm shadow-sm"}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              {isLandingPage ? (
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c1af736e30d6ce22780c4/99e446771_AWBlogo.png"
                  alt="The Aligned Woman Blueprint"
                  className="object-contain w-auto drop-shadow-xl"
                  style={{ height: '52px' }}
                />
              ) : (
                <img
                  src={siteSettings?.dark_logo || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"}
                  alt="The Aligned Woman"
                  className="object-contain w-auto"
                  style={{ height: '35px' }}
                />
              )}
            </Link>

            <div className="flex items-center gap-3 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center p-1 rounded-full transition-colors hover:opacity-80">
                    <div className={`w-9 h-9 rounded-full border overflow-hidden ${isLandingPage ? "border-white/20" : "border-awrose-light"}`}>
                     {isAuthenticated && user?.profile_picture ? (
                       <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
                     ) : (
                       <div className={`w-full h-full flex items-center justify-center ${isLandingPage ? "bg-white/10" : "bg-awrose-pale"}`}>
                         <User className={`w-4 h-4 ${isLandingPage ? "text-white/70" : "text-awburg-core"}`} />
                       </div>
                     )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[100]">
                  {isAuthenticated && user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Go to Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("ProfileSettings")} className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}>
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Pill circular hamburger - matches reference site */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Open menu"
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${isLandingPage ? "rgba(255,255,255,0.15)" : "rgba(107,27,61,0.2)"}`,
                  borderRadius: "100px",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                <span className={`block transition-all duration-300 rounded-sm ${isLandingPage ? "bg-awrose-core" : "bg-awburg-core"}`} style={{ width: 18, height: 2 }} />
                <span className={`block transition-all duration-300 rounded-sm ${isLandingPage ? "bg-awrose-core" : "bg-awburg-core"}`} style={{ width: 18, height: 2 }} />
                <span className={`block transition-all duration-300 rounded-sm ${isLandingPage ? "bg-awrose-core" : "bg-awburg-core"}`} style={{ width: 18, height: 2 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        {showMobileMenu &&
        <>
            <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowMobileMenu(false)} />

            <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                      <img
                      src={siteSettings?.dark_logo || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"}
                      alt="AW"
                      className="object-contain w-auto"
                      style={{ height: '40px' }} />

                  <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">

                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="flex-1 p-6">
                  {isAuthenticated &&
                <>
                      <Button
                    onClick={() => {
                      setShowMobileMenu(false);
                      window.location.href = createPageUrl("Dashboard");
                    }}
                    className="w-full mb-4 bg-awburg-core hover:bg-awburg-mid text-paper">

                        Go to Dashboard
                      </Button>
                      <div className="h-px bg-gray-200 mb-6" />
                    </>
                }
                  <ul className="space-y-2">
                    {publicPages.filter(item => !["about-us", "blueprint", "CheckoutComplete"].includes(item.name)).map((item) =>
                  <li key={item.name}>
                        <Link
                      to={item.href || createPageUrl(item.name)}
                      onClick={() => setShowMobileMenu(false)}
                      className="block px-4 py-3 text-awburg-core hover:bg-awrose-pale hover:text-awburg-dark rounded-lg transition-colors font-body font-medium">

                          {item.label}
                        </Link>
                      </li>
                  )}
                    <li>
                      <a href="/about-us" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-awburg-core hover:bg-awrose-pale hover:text-awburg-dark rounded-lg transition-colors font-body font-medium">About Us</a>
                    </li>
                  </ul>
                </nav>

                <div className="p-6 border-t">
                  {isAuthenticated ?
                <Button
                  onClick={handleLogout}
                   className="w-full bg-awburg-core hover:bg-awburg-mid text-paper">

                      Sign Out
                    </Button> :

                  <Button
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                  className="w-full bg-awburg-core hover:bg-awburg-mid text-paper">

                      Sign In
                    </Button>
                }
                </div>
              </div>
            </div>
          </>
        }

        <main className={isLandingPage ? "" : "pt-20"}>
          {children}
        </main>

        {isLandingPage ? null : <footer className="bg-awburg-core text-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold tracking-tight mb-4">THE ALIGNED WOMAN BLUEPRINT™</h3>
                <p className="text-white/70 max-w-md">
                  Your personal operating system for embodied success. Powered by the ALIVE Method™.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-rose-accent">Navigate</h4>
                <ul className="space-y-2">
                  <li><a href="/" className="text-white/70 hover:text-white transition-colors text-sm">Home</a></li>
                  <li><a href="/blueprint" className="text-white/70 hover:text-white transition-colors text-sm">Blueprint</a></li>
                  <li><a href="/about-us" className="text-white/70 hover:text-white transition-colors text-sm">About Us</a></li>
                  <li><Link to={createPageUrl("Contact")} className="text-white/70 hover:text-white transition-colors text-sm">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-rose-accent">Connect</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to={createPageUrl("Contact")} className="text-white/70 hover:text-white transition-colors text-sm">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl("Apply")} className="text-white/70 hover:text-white transition-colors text-sm">
                      Apply Now
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
                        © {new Date().getFullYear()} The Aligned Woman Blueprint. All rights reserved.
                      </div>
                    </div>
                  </footer>}
                </div>);

            }

  // Dashboard and Workbook pages have their own chrome - render children directly
  if (isDashboardPage || currentPageName === "Workbook") {
    return <>{children}</>;
  }

  const NAV_ITEMS = [
    { name: "Dashboard", path: "Dashboard" },
    { name: "Classroom", path: "Classroom" },
    { name: "Community", path: "Community" },
    { name: "Experts", path: "ExpertsDirectory" },
  ];

  const isActive = (pageName) => currentPageName === pageName;

  // Authenticated app layout with left sidebar - matches Dashboard chrome
  return (
    <div className="min-h-screen flex">

      {/* Left Sidebar - matches DashboardSidebar exactly */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-paper border-r border-awburg-core/8 flex-col z-40">
        <div className="p-6 pb-8">
          <Link to={createPageUrl("Home")}>
            <img
              src={siteSettings?.dark_logo || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"}
              alt="The Aligned Woman"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-awrose-pale text-awburg-core font-medium"
                        : "text-awburg-core/70 hover:text-awburg-core hover:bg-awrose-wash"
                    }`}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-awrose-core flex-shrink-0" />}
                    <span className="font-body font-bold text-[11px] tracking-eyebrow uppercase">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 pt-4">
          <p className="font-body font-bold text-[9px] tracking-[0.18em] text-awburg-core/55 uppercase leading-relaxed">
            THE ALIGNED WOMAN
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60 overflow-x-hidden">
        {/* Top Header - matches Dashboard TopBar style */}
        <header className="sticky top-0 z-40 border-b border-awburg-core/8 bg-paper">
          <div className="flex items-center justify-between gap-4 px-6 py-3">
            {/* Left: mobile hamburger */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-1.5 hover:bg-awrose-wash rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-awburg-core" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Right Actions - matches TopBar */}
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-awrose-wash rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-awburg-core/70" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 p-1 hover:bg-awrose-wash rounded-lg transition-colors">
                    <div className="w-9 h-9 rounded-full bg-awburg-core flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user?.profile_picture ? (
                        <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-paper text-sm font-medium">
                          {user?.full_name?.[0] || user?.email?.[0] || "U"}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-awburg-core/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profilesettings" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboardsettings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Dashboard Settings
                    </Link>
                  </DropdownMenuItem>
                  {["owner", "admin", "master_admin", "moderator"].includes(user?.role) && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Admin Settings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Drawer - matches Dashboard mobile drawer style */}
        {showMobileMenu && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowMobileMenu(false)} />
            <div className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-paper z-[70] shadow-2xl overflow-y-auto border-r border-awburg-core/8">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-awburg-core/8">
                  <img
                    src={siteSettings?.dark_logo || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png"}
                    alt="AW" className="object-contain w-auto h-9"
                  />
                  <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-awrose-wash rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-awburg-core" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="flex-1 p-4">
                  <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <li key={item.name}>
                          <Link
                            to={createPageUrl(item.path)}
                            onClick={() => setShowMobileMenu(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                              active
                                ? "bg-awrose-pale text-awburg-core font-medium"
                                : "text-awburg-core/70 hover:text-awburg-core hover:bg-awrose-wash"
                            }`}
                          >
                            {active && <div className="w-1.5 h-1.5 rounded-full bg-awrose-core flex-shrink-0" />}
                            <span className="font-body font-bold text-[11px] tracking-eyebrow uppercase">{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="p-4 border-t border-awburg-core/8">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-awburg-core/70 hover:text-awburg-core hover:bg-awrose-wash transition-colors font-body font-bold text-[11px] tracking-eyebrow uppercase"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}

        <main>{children}</main>
        <LaurAIChatWidget />
      </div>
    </div>
  );

}