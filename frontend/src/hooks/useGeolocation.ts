import { useState, useCallback } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isLoading: boolean;
  hasAsked: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    isLoading: false,
    hasAsked: false,
  });

  // Get position ONCE — strictly uses getCurrentPosition(), NEVER watchPosition()
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Trình duyệt không hỗ trợ định vị GPS',
        hasAsked: true,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          isLoading: false,
          hasAsked: true,
        });
      },
      (err) => {
        let message = 'Không thể lấy vị trí của bạn';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Bạn đã từ chối quyền truy cập vị trí';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Không thể xác định vị trí';
        } else if (err.code === err.TIMEOUT) {
          message = 'Yêu cầu định vị hết thời gian';
        }
        setState({
          lat: null,
          lng: null,
          error: message,
          isLoading: false,
          hasAsked: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return { ...state, requestLocation };
};
