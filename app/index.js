import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Layout is mounted
  }, []);

  useEffect(() => {
    if (isMounted) {
      router.push("/onboarding"); // Redirect to onboarding after layout is ready
    }
  }, [isMounted]);

  return null; // Optional: Add a loading spinner or screen
}