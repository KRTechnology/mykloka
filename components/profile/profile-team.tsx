"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ProfileTeamProps {
  manager: TeamMember | null;
  subordinates: TeamMember[];
  departmentMembers?: TeamMember[];
  department: {
    id: string;
    name: string;
  } | null;
}

export function ProfileTeam({
  manager,
  subordinates,
  departmentMembers = [],
  department,
}: ProfileTeamProps) {
  // Determine which members to show - either subordinates or department members
  const teamMembers =
    subordinates.length > 0 ? subordinates : departmentMembers;
  const teamTitle =
    subordinates.length > 0 ? "Team Members" : "Department Colleagues";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>
            Your team members and reporting structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Manager
              </h3>
              {manager ? (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="text-left">
                      <span className="font-medium hover:text-kr-orange transition-colors">
                        {manager.firstName} {manager.lastName}
                      </span>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">
                        {manager.firstName} {manager.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {manager.email}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <span className="text-muted-foreground">
                  No manager assigned
                </span>
              )}
            </div>

            {teamMembers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {teamTitle} ({teamMembers.length})
                </h3>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <HoverCard key={member.id}>
                      <HoverCardTrigger asChild>
                        <button className="text-left block">
                          <span className="font-medium hover:text-kr-orange transition-colors">
                            {member.firstName} {member.lastName}
                          </span>
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">
                            {member.firstName} {member.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                          {department && (
                            <p className="text-sm text-muted-foreground">
                              {department.name}
                            </p>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </div>
            )}

            {teamMembers.length === 0 && (
              <div className="text-muted-foreground">
                No team members to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
