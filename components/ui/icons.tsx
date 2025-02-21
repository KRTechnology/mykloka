import {
  Loader2,
  MailCheck,
  MapPin,
  Moon,
  SunMedium,
  type Icon as LucideIcon,
} from "lucide-react";

export type Icon = typeof LucideIcon;

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  spinner: Loader2,
  mapPin: MapPin,
  mailCheck: MailCheck,
} satisfies Record<string, Icon>;
