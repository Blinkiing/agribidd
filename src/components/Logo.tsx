interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-6 w-auto",
  md: "h-8 w-auto",
  lg: "h-12 w-auto",
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 600 200"
      className={`${sizeMap[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* AgriBID Text - Black */}
      <text
        x="50"
        y="120"
        fontFamily="Arial Rounded MT Bold, Trebuchet MS, Arial, sans-serif"
        fontSize="120"
        fontWeight="900"
        fill="currentColor"
        letterSpacing="-2"
      >
        Agri
      </text>

      {/* BID Text - Green */}
      <text
        x="305"
        y="120"
        fontFamily="Arial Rounded MT Bold, Trebuchet MS, Arial, sans-serif"
        fontSize="120"
        fontWeight="900"
        fill="#39FF14"
        letterSpacing="-2"
      >
        BID
      </text>

      {/* Green Smile Arc under the G */}
      <path
        d="M 165 155 Q 200 190 230 155"
        stroke="#39FF14"
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default Logo;
