export default function useBox(width, height) {
  function updateDeviceType(width) {
    if (width < 640) return "mobile";
    if (width < 768) return "tablet";
    if (width < 1024) return "laptop";
    return "desktop";
  }

  function updateScreenSize(width) {
    if (width < 640) return "sm";
    if (width < 768) return "md";
    if (width < 1024) return "lg";
    if (width < 1280) return "xl";
    return "2xl";
  }

  return {
    width,
    height,
    device: updateDeviceType(width),
    screen: updateScreenSize(width),
  };
}
