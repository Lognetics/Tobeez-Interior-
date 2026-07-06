"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { DashHeader, EmptyState } from "@/components/dashboard/widgets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData, type ProjectStatus } from "@/lib/store/app-data";
import { formatCurrency } from "@/lib/utils";

const STATUSES: ProjectStatus[] = ["planning", "in_progress", "completed", "on_hold"];
const LABEL: Record<ProjectStatus, string> = { planning: "Planning", in_progress: "In Progress", completed: "Completed", on_hold: "On Hold" };

export default function ProjectsPage() {
  const { projects, addProject, updateProject } = useAppData();
  const [name, setName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  function create() {
    if (!name.trim()) return;
    addProject({ name: name.trim(), budget: 0 });
    setName(""); setCreating(false);
  }

  return (
    <>
      <DashHeader title="My Projects" subtitle="Every furnishing project in one place."
        action={<Button onClick={() => setCreating((v) => !v)}><Plus /> New Project</Button>} />

      {creating && (
        <Card className="mb-4">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name, e.g. Lekki Duplex" className="max-w-xs" onKeyDown={(e) => e.key === "Enter" && create()} />
            <Button onClick={create} disabled={!name.trim()}>Create</Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <EmptyState icon="FolderKanban" title="No projects yet"
          description="Projects are created automatically when you unlock an AI estimate, or add one manually."
          action={<Button asChild><Link href="/estimator">Start AI Estimate</Link></Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><FolderKanban className="size-5" /></span>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.budget > 0 ? formatCurrency(p.budget) : "Budget TBD"}</p>
                    </div>
                  </div>
                  <Badge variant={p.status === "completed" ? "success" : "muted"}>{LABEL[p.status]}</Badge>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} /></div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select value={p.status} onChange={(e) => updateProject(p.id, { status: e.target.value as ProjectStatus, progress: e.target.value === "completed" ? 100 : e.target.value === "in_progress" ? 55 : p.progress })}
                    className="h-9 rounded-lg border border-border bg-card px-2 text-sm">
                    {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                  </select>
                  {p.estimateId && <Button asChild size="sm" variant="outline"><Link href="/dashboard/estimates">View estimate</Link></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
