import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';

const PENDING_CHECKOUT_KEY = "aw_pending_checkout_session";

// Guards against double-invoking the claim when several navigations fire while
// the verify call is still in flight. Module scope so it survives re-renders.
let checkoutClaimInFlight = false;

// Runs the faculty access claim once per load. A linked expert who just logged
// in is granted course access with no coupon and no sale. Module scope so it is
// not re-attempted on every navigation for ordinary members.
let expertClaimDone = false;

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Post navigation changes to parent window
    useEffect(() => {
        window.parent?.postMessage({
            type: "app_changed_url",
            url: window.location.href
        }, '*');
    }, [location]);

    // Log user activity when navigating to a page
    useEffect(() => {
        // Extract page name from pathname
        const pathname = location.pathname;
        let pageName;
        
        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];
            
            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );
            
            pageName = matchedKey || null;
        }

        if (isAuthenticated && pageName) {
            base44.appLogs.logUserInApp(pageName).catch(() => {
                // Silently fail - logging shouldn't break the app
            });
        }
    }, [location, isAuthenticated, Pages, mainPageKey]);

    // Checkout claim. A buyer who paid then created their account can be dropped
    // on any page by the auth screen, not the dashboard. Wherever a signed-in
    // person lands with a paid session waiting, unlock the course and send them
    // to the dashboard. This runs its own sign-in check so it works on public
    // pages too, and it only acts when a pending session is present.
    useEffect(() => {
        if (checkoutClaimInFlight) return;

        // The dedicated success page owns the claim. Acting here as well would
        // fire a second, simultaneous verify for the same session and duplicate
        // the Sale and the welcome email. Stand down on that page and only back
        // up other pages, where nothing else is verifying.
        if (window.location.pathname.toLowerCase().startsWith("/checkout-success")) return;

        let pending = "";
        try {
            pending = window.localStorage.getItem(PENDING_CHECKOUT_KEY) || "";
        } catch (_err) {
            pending = "";
        }
        if (!pending) return;

        checkoutClaimInFlight = true;
        (async () => {
            try {
                const authed = await base44.auth.isAuthenticated();
                if (!authed) return; // not signed in yet, the finally resets the guard

                await base44.functions.invoke("verifyCheckoutSession", { session_id: pending });

                try {
                    window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
                } catch (_err) {
                    // nothing to do
                }

                // Land them in their unlocked course rather than wherever the
                // auth screen left them.
                if (window.location.pathname.toLowerCase() !== "/dashboard") {
                    window.location.href = "/Dashboard";
                }
            } catch (_err) {
                // Transient failure or nothing to claim. Leave the key so a
                // later page load can retry.
            } finally {
                checkoutClaimInFlight = false;
            }
        })();
    }, [location, isAuthenticated]);

    // Faculty access claim. A linked expert logging in for the first time has
    // no course tag yet. This asks the server to grant it, matching on their
    // email against the linked expert records. It is a no-op for ordinary
    // members and grants only once. On the granting visit it reloads so the
    // current session sees the unlocked course; the reload cannot loop because
    // the second call finds the tag already present and grants nothing.
    useEffect(() => {
        if (expertClaimDone) return;
        expertClaimDone = true;
        (async () => {
            try {
                const authed = await base44.auth.isAuthenticated();
                if (!authed) {
                    expertClaimDone = false; // not signed in yet, retry after login
                    return;
                }
                const resp = await base44.functions.invoke("claimExpertAccess");
                if (resp?.data?.granted === true) {
                    window.location.reload();
                }
            } catch (_err) {
                expertClaimDone = false; // transient failure, allow a later retry
            }
        })();
    }, [location, isAuthenticated]);

    return null;
}