// components/ProjectsSection.tsx
"use client";

import { createClient } from "@/app/utils/supabase/client";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("featured_projects")
        .select(
          "id, title, description, featured_image_url, category, tech_stack, live_url, github_url",
        )
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: Project[] = data.map((project) => ({
          id: project.id as string,
          title: project.title ?? "",
          description: project.description ?? "",
          imageUrl: project.featured_image_url ?? undefined,
          category: project.category ?? "",
          tech: Array.isArray(project.tech_stack) ? project.tech_stack : [],
          liveUrl: project.live_url ?? undefined,
          githubUrl: project.github_url ?? undefined,
        }));
        setProjects(mapped);
      }
    };

    loadProjects();
  }, []);

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-white py-24"
      aria-labelledby="projects-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
        <div className="absolute -right-40 bottom-40 h-96 w-96 rounded-full bg-orange-400 opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-600">
            Our Portfolio
          </span>
          <h2
            id="projects-heading"
            className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Featured <span className="text-yellow-600">Projects</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Explore our best work across various industries. Each project
            showcases our commitment to quality, innovation, and client
            satisfaction.
          </p>
        </motion.div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl hover:border-yellow-300"
              >
                {/* Project Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mb-2 text-4xl">🚀</div>
                        <p className="text-sm font-medium text-gray-600">
                          {project.category}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Action Buttons */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-yellow-600 transition-all hover:bg-yellow-500 hover:text-white"
                        aria-label="View live project"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
                        aria-label="View on GitHub"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-yellow-600">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="mb-4 flex-1 text-gray-600">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="mb-2 text-xs font-semibold text-gray-500">
                      TECH STACK
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="min-h-96 flex flex-col items-center justify-center text-center py-20">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Coming Soon
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl">
              We&apos;re working on exciting projects to showcase. Check back
              soon to see our latest work!
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-lg text-gray-600">
            Have a project in mind? Let&apos;s bring your vision to life.
          </p>
          <Link
            href="/#proposal"
            className="inline-block rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 font-bold text-white transition-all hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg"
          >
            Start Your Project
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
