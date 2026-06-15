import { cn } from "@/lib/utils";

interface WindowsFolderIconProps {
  className?: string;
  open?: boolean;
}

export function WindowsFolderIcon({ className, open }: WindowsFolderIconProps) {
  return (
    <svg
      viewBox="0 0 40 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      {open ? (
        <>
          <path
            d="M2 10.5C2 8.84315 3.34315 7.5 5 7.5H15.3373C15.8379 7.5 16.3222 7.66421 16.7138 7.96595L19.2862 9.98405C19.6778 10.2858 20.1621 10.45 20.6627 10.45H35C36.6569 10.45 38 11.7931 38 13.45V25.5C38 27.1569 36.6569 28.5 35 28.5H5C3.34315 28.5 2 27.1569 2 25.5V10.5Z"
            fill="#FCD34D"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M2 10.5V9.5C2 7.84315 3.34315 6.5 5 6.5H14.3373C14.8379 6.5 15.3222 6.66421 15.7138 6.96595L18.2862 8.98405C18.6778 9.28579 19.1621 9.45 19.6627 9.45H35C36.6569 9.45 38 10.7931 38 12.45V13.45"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M2 10.5C2 8.84315 3.34315 7.5 5 7.5H15.3373C15.8379 7.5 16.3222 7.66421 16.7138 7.96595L19.2862 9.98405C19.6778 10.2858 20.1621 10.45 20.6627 10.45H35C36.6569 10.45 38 11.7931 38 13.45V26C38 27.6569 36.6569 29 35 29H5C3.34315 29 2 27.6569 2 26V10.5Z"
            fill="#FCD34D"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M2 10V9C2 7.34315 3.34315 6 5 6H14.3373C14.8379 6 15.3222 6.16421 15.7138 6.46595L18.2862 8.48405C18.6778 8.78579 19.1621 8.95 19.6627 8.95H35C36.6569 8.95 38 10.2931 38 11.95V13"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
