import ALIVEMethod from './pages/ALIVEMethod';
import AdminSettings from './pages/AdminSettings';
import Apply from './pages/Apply';
import CheckIn from './pages/CheckIn';
import Classroom from './pages/Classroom.jsx';
import Community from './pages/Community';
import Contact from './pages/Contact';
import DailyCheckIn from './pages/DailyCheckIn';
import Dashboard from './pages/Dashboard';
import DefineMyPurpose from './pages/DefineMyPurpose';
import Experts from './pages/Experts';
import ExpertsDirectory from './pages/ExpertsDirectory.jsx';
import Journal from './pages/Journal';
import Members from './pages/Members';
import ModuleFrameworkBuilder from './pages/ModuleFrameworkBuilder';
import ModulePlayer from './pages/ModulePlayer';
import MyALIVEJourney from './pages/MyALIVEJourney';
import MyCycle from './pages/MyCycle';
import MyMetrics from './pages/MyMetrics';
import MyPathway from './pages/MyPathway';
import OnboardingForm from './pages/OnboardingForm';
import OurWhy from './pages/OurWhy';
import ProfileSettings from './pages/ProfileSettings';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Support from './pages/Support';
import ToolsHub from './pages/ToolsHub';
import homePage from './pages/Home_Page';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ALIVEMethod": ALIVEMethod,
    "dashboardsettings": AdminSettings,
    "Apply": Apply,
    "CheckIn": CheckIn,
    "Classroom": Classroom,
    "Community": Community,
    "Contact": Contact,
    "DailyCheckIn": DailyCheckIn,
    "Dashboard": Dashboard,
    "DefineMyPurpose": DefineMyPurpose,
    "Experts": Experts,
    "ExpertsDirectory": ExpertsDirectory,
    "Journal": Journal,
    "Members": Members,
    "ModuleFrameworkBuilder": ModuleFrameworkBuilder,
    "ModulePlayer": ModulePlayer,
    "MyALIVEJourney": MyALIVEJourney,
    "MyCycle": MyCycle,
    "MyMetrics": MyMetrics,
    "MyPathway": MyPathway,
    "OnboardingForm": OnboardingForm,
    "OurWhy": OurWhy,
    "ProfileSettings": ProfileSettings,
    "Progress": Progress,
    "Settings": Settings,
    "Support": Support,
    "ToolsHub": ToolsHub,
    "Home_Page": homePage,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};