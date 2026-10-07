import { SunIcon, CloudIcon, MistIcon, CloudRainIcon, SnowflakeIcon, CloudLightningIcon } from './ui-icons.js';

// Rendering belongs to the UI layer; weather data/cache helpers in core/app-weather stay
// framework-free and can be tested or reused without loading React/icon modules.
export function getWeatherIcon(code, size = 16) {
  const React = window.React;
  const normalizedCode = Number(code);
  if (normalizedCode === 0) return /*#__PURE__*/React.createElement(SunIcon, { size });
  if ([1, 2, 3].includes(normalizedCode)) return /*#__PURE__*/React.createElement(CloudIcon, { size });
  if ([45, 48].includes(normalizedCode)) return /*#__PURE__*/React.createElement(MistIcon, { size });
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(normalizedCode)) return /*#__PURE__*/React.createElement(CloudRainIcon, { size });
  if ([71, 73, 75, 77, 85, 86].includes(normalizedCode)) return /*#__PURE__*/React.createElement(SnowflakeIcon, { size });
  if ([95, 96, 99].includes(normalizedCode)) return /*#__PURE__*/React.createElement(CloudLightningIcon, { size });
  return /*#__PURE__*/React.createElement(SunIcon, { size });
}
