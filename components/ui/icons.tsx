import {
  Loader2,
  MailCheck,
  MapPin,
  Moon,
  SunMedium,
  X,
  type Icon as LucideIcon,
  AlertTriangle,
} from "lucide-react";

export type Icon = typeof LucideIcon;

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  spinner: Loader2,
  mapPin: MapPin,
  mailCheck: MailCheck,
  alertTriangle: AlertTriangle,
  x: X,
} satisfies Record<string, Icon>;
