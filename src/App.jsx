import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import CourseDetail from './pages/CourseDetail';
import SectionDetail from './pages/SectionDetail';
import WorkbookViewer from './pages/WorkbookViewer';
import Home from './pages/Home';
import BlueprintPage from './pages/BlueprintPage';
import AboutUs from './pages/AboutUs';
import CheckoutComplete from './pages/CheckoutComplete';
import AdminSettings from './pages/AdminSettings';
import PdfTest from './pages/PdfTest';
import ClaritySprintPage from './pages/ClaritySprintPage';
import ExpertProfile from './pages/ExpertProfile';
import Admin from './pages/Admin';
import { PaymentProvider } from './context/PaymentContext';
import Checkout from './pages/Checkout';
import ExpertDashboard from './pages/ExpertDashboard';
import StartingPointProfile from './pages/StartingPointProfile';
import YourMoneyStory from './pages/YourMoneyStory';
import MoneyStoryLanding from './pages/MoneyStoryLanding';
import FeminineWorkbook from './pages/FeminineWorkbook';
import TermsAndConditions from './pages/TermsAndConditions';
import Competition from './pages/Competition';
import Contact from './pages/Contact';
import ContactForm from './pages/ContactForm';
import Welcome from './pages/Welcome';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Apply from './pages/Apply';
import CommunityGroup from './pages/CommunityGroup';
import TheAWStandard from './pages/TheAWStandard';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // auth_required is now handled by ProtectedRoute per-route
  }

  // Render the main app
  return (
    <Routes>
      {/* ── Auth pages (always public) ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Public pages ── */}
      <Route path="/" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
      <Route path="/home" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
      <Route path="/blueprint" element={<LayoutWrapper currentPageName="blueprint"><BlueprintPage /></LayoutWrapper>} />
      <Route path="/about-us" element={<LayoutWrapper currentPageName="about-us"><AboutUs /></LayoutWrapper>} />
      <Route path="/CheckoutComplete" element={<LayoutWrapper currentPageName="CheckoutComplete"><CheckoutComplete /></LayoutWrapper>} />
      <Route path="/claritysprint" element={<ClaritySprintPage />} />
      {/* Applying to be listed is for practitioners who are not members
          yet, so it cannot sit behind login. ExpertApplication has an
          unrestricted create rule, so an anonymous submission works. */}
      <Route path="/Apply" element={<LayoutWrapper currentPageName="Apply"><Apply /></LayoutWrapper>} />
      <Route path="/apply" element={<LayoutWrapper currentPageName="Apply"><Apply /></LayoutWrapper>} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/Checkout" element={<Checkout />} />
      <Route path="/terms-and-conditions" element={<LayoutWrapper currentPageName="blueprint"><TermsAndConditions /></LayoutWrapper>} />
      <Route path="/competition" element={<Competition />} />
      <Route path="/Contact" element={<LayoutWrapper currentPageName="blueprint"><Contact /></LayoutWrapper>} />
      <Route path="/ContactForm" element={<LayoutWrapper currentPageName="blueprint"><ContactForm /></LayoutWrapper>} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route path="/pdf-test" element={<PdfTest />} />
      <Route path="/StartingPointProfile" element={<StartingPointProfile />} />
      {/* The Aligned Woman Standard: public on purpose, the AW Verified seal
          on practitioners' own sites links here. */}
      <Route path="/theawstandard" element={<LayoutWrapper currentPageName="TheAWStandard"><TheAWStandard /></LayoutWrapper>} />
      <Route path="/YourMoneyStory" element={<YourMoneyStory />} />
      <Route path="/money-story" element={<MoneyStoryLanding />} />

      {/* ── Protected pages (require login) ── */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {/* /Dashboard is declared explicitly, ahead of the generic loop, so it
            renders without the Layout wrapper. The dashboard brings its own
            shell via AppShellV2. The previous dashboard is kept unrouted in
            src/pages/DashboardLegacy.jsx as a rollback. */}
        <Route path="/Dashboard" element={<Dashboard />} />
        {/* Community pages bring their own DashboardSidebar, so they are
            declared here rather than in the generic loop. Going through the
            loop wraps them in Layout, which renders a second sidebar and a
            second lg:ml-72, offsetting the content twice. */}
        <Route path="/Community" element={<Community />} />
        <Route path="/Community/:slug" element={<CommunityGroup />} />
        {/* Practitioner profiles. Nothing in the directory is public, so this
            sits behind ProtectedRoute alongside /ExpertsDirectory. It brings
            its own sidebar, so it is declared here rather than in the generic
            loop, which would wrap it in Layout as well. /theawstandard remains
            the only public directory-adjacent page. */}
        <Route path="/experts/:slug" element={<ExpertProfile />} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="/CourseDetail" element={<LayoutWrapper currentPageName="CourseDetail"><CourseDetail /></LayoutWrapper>} />
        <Route path="/SectionDetail" element={<LayoutWrapper currentPageName="SectionDetail"><SectionDetail /></LayoutWrapper>} />
        <Route path="/Workbook" element={<LayoutWrapper currentPageName="Workbook"><WorkbookViewer /></LayoutWrapper>} />
        <Route path="/WorkbookViewer" element={<LayoutWrapper currentPageName="Workbook"><WorkbookViewer /></LayoutWrapper>} />
        <Route path="/dashboardsettings" element={<LayoutWrapper currentPageName="AdminSettings"><AdminSettings /></LayoutWrapper>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/expert-dashboard" element={<LayoutWrapper currentPageName="ExpertDashboard"><ExpertDashboard /></LayoutWrapper>} />

        <Route path="/FeminineWorkbook" element={<FeminineWorkbook />} />
        <Route path="/analytics" element={<LayoutWrapper currentPageName="AnalyticsDashboard"><AnalyticsDashboard /></LayoutWrapper>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <PaymentProvider>
        <Router>
          <NavigationTracker />
          <AnalyticsTracker />
          <AuthenticatedApp />
        </Router>
        {/* The toast viewport is a fixed, full width, z-100 bar pinned to the
            top of the screen below 640px. Even with no toasts it is 32px tall,
            so it was swallowing every tap in the top 32px of every page, which
            is exactly where the lesson player header controls sit.
            pointer-events is an inherited property, so this lets taps pass
            through the empty viewport. Real toasts carry pointer-events-auto
            from toastVariants and stay fully interactive. */}
        <div style={{ pointerEvents: "none" }}>
          <Toaster />
        </div>
        <VisualEditAgent />
        </PaymentProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App