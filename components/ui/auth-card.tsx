import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
}

export function AuthCard({ title, children, className, ...props }: AuthCardProps) {
  return (
    <Card 
      className={cn(
        "w-full shadow-md border-muted bg-card/50 backdrop-blur-sm", 
        className
      )} 
      {...props}
    >
      <CardHeader className="text-center pb-2">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          {title}
        </h1>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
} 