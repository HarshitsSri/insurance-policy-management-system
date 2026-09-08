import { useEffect, useState } from "react";
import { getOwnCustomerProfileApi } from "../api/userApi";

/**
 * Checks whether the logged-in customer has created their profile.
 *
 * Returns:
 *   profileLoading  – true while the check is in-flight
 *   hasProfile      – true if a profile exists, false if the API returns 404 / null
 */
export function useCustomerProfile() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(null); // null = unknown yet

  useEffect(() => {
    let active = true;

    getOwnCustomerProfileApi()
      .then(() => {
        if (active) setHasProfile(true);
      })
      .catch(() => {
        if (active) setHasProfile(false);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { profileLoading, hasProfile };
}
