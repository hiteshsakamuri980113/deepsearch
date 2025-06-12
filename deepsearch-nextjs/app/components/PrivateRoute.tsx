"use client";
import { useRouter } from "next/navigation";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import { useEffect, ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSpotifyAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "PrivateRoute - Loading:",
      loading,
      "Authenticated:",
      isAuthenticated
    );

    if (!loading && !isAuthenticated) {
      console.log("PrivateRoute - Redirecting to home page");
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    // return (
    //   <div className="flex justify-center items-center h-screen bg-black text-[#a8f0e8]">
    //     <div className="text-lg">Loading...</div>
    //   </div>
    // );
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-[#a8f0e8]">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
