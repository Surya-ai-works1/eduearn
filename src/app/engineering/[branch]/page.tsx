import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cpu, Zap, ArrowLeft, ArrowRight, Layers, ShieldCheck, Award } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BranchConfig {
  title: string;
  fullName: string;
  code: "ECE" | "EEE";
  desc: string;
  icon: typeof Cpu;
  tracks: string[];
  skills: string[];
}

const BRANCHES: Record<string, BranchConfig> = {
  ece: {
    title: "Electronics & Communication Engineering",
    fullName: "Electronics & Communication (ECE)",
    code: "ECE",
    desc: "Hands-on microcontrollers, ESP32, STM32 firmware, VLSI, IoT edge sensors, and ROS2 robotics.",
    icon: Cpu,
    tracks: [
      "Embedded Systems & Firmware",
      "IoT & Wireless Edge",
      "Robotics & ROS2 Architecture",
      "VLSI & Digital Circuit Design",
    ],
    skills: ["C / C++ Bare-metal", "ESP-IDF / FreeRTOS", "UART / SPI / I2C", "PCB Design (KiCad)", "ROS2 Basics"],
  },
  eee: {
    title: "Electrical & Electronics Engineering",
    fullName: "Electrical & Electronics (EEE)",
    code: "EEE",
    desc: "Electric vehicle powertrain, battery management systems (BMS), power electronics, motor control, and PLC automation.",
    icon: Zap,
    tracks: [
      "Electric Vehicle Powertrain & BMS",
      "Power Electronics & Inverters",
      "Industrial Automation & PLC / SCADA",
      "Renewable Energy & Microgrids",
    ],
    skills: [
      "Battery Management Systems",
      "Inverter & Motor Drives",
      "MATLAB / Simulink",
      "PLC Programming",
      "High Voltage Safety",
    ],
  },
};

export default async function EngineeringBranchPage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const resolvedParams = await params;
  const branchKey = resolvedParams.branch.toLowerCase();
  const branch = BRANCHES[branchKey];

  if (!branch) {
    notFound();
  }

  const Icon = branch.icon;

  return (
    <PageWrapper>
      <Container className="py-12 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/categories/engineering"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Engineering & Electronics
          </Link>
        </div>

        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Icon className="w-3.5 h-3.5" />
              {branch.code} Specialization Track
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Industry Verified Curriculum
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {branch.fullName}
          </h1>
          <p className="text-slate-300 max-w-2xl text-base md:text-lg mb-8 leading-relaxed">
            {branch.desc}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href={`/categories/engineering?branch=${branchKey}`}>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 shadow-lg shadow-blue-600/20">
                Explore {branch.code} Courses & Tutors
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                Browse Full Catalog
              </Button>
            </Link>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-900/60 border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-blue-400 font-semibold text-lg">
              <Layers className="w-5 h-5" />
              <h2>Specialization Tracks</h2>
            </div>
            <ul className="space-y-3">
              {branch.tracks.map((track, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{track}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 bg-slate-900/60 border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold text-lg">
              <Award className="w-5 h-5" />
              <h2>Key Competencies</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {branch.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </PageWrapper>
  );
}
