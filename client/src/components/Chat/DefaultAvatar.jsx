import PropTypes from "prop-types";

const DefaultAvatar = ({ size = 40, color = "#4B5563" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="20" fill={color} />
      <path
        d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z"
        fill="white"
      />
      <path
        d="M32 32C32 25.3726 26.6274 20 20 20C13.3726 20 8 25.3726 8 32"
        stroke="white"
        strokeWidth="4"
      />
    </svg>
  );
};

DefaultAvatar.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

export default DefaultAvatar;
