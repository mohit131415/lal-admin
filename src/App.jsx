import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import MarketPage from "./pages/MarketPage"
import Leaderboard from "./pages/Leaderboard"
import Subscription from "./pages/Subscription"
import AdminLogin from "./pages/admin/login"
import AdminDashboard from "./pages/admin/dashboard"
import MarketForm from "./pages/admin/market-form"
import { Layout } from "./components/layout"
import { Toaster } from "./components/ui/toaster"
import AllMarkets from "./pages/AllMarkets"
import PurchaseSuccessful from "./pages/PurchaseSuccessful"

function App() {
  return (
    <>
      <Routes>
        {/* Public routes with layout */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/market/:id"
          element={
            <Layout>
              <MarketPage />
            </Layout>
          }
        />
        <Route
          path="/markets"
          element={
            <Layout>
              <AllMarkets />
            </Layout>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <Layout>
              <Leaderboard />
            </Layout>
          }
        />
        <Route
          path="/subscription"
          element={
            <Layout>
              <Subscription />
            </Layout>
          }
        />
        <Route
          path="/purchase-successful"
          element={
            <Layout>
              <PurchaseSuccessful />
            </Layout>
          }
        />

        {/* Admin routes without layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/markets/new" element={<MarketForm />} />
        <Route path="/admin/markets/edit/:id" element={<MarketForm />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
