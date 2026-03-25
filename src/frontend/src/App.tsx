import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { UserProvider } from "./context/UserContext";
import AdminPanel from "./pages/AdminPanel";
import BrowseSkillsPage from "./pages/BrowseSkillsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PostSkillPage from "./pages/PostSkillPage";
import RegisterPage from "./pages/RegisterPage";
import SkillDetailsPage from "./pages/SkillDetailsPage";
import UserProfilePage from "./pages/UserProfilePage";

function RootLayout() {
  return (
    <UserProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster richColors position="top-right" />
    </UserProvider>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills",
  component: BrowseSkillsPage,
});
const skillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills/$id",
  component: SkillDetailsPage,
});
const postSkillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-skill",
  component: PostSkillPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$id",
  component: UserProfilePage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  skillsRoute,
  skillDetailRoute,
  postSkillRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
