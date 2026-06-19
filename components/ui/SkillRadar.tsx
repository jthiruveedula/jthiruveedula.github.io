"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { RadarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSound } from "@/hooks/useSound";
import { skillCategories } from "@/lib/data";

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarChart,
  CanvasRenderer,
]);

export interface RadarAxis {
  name: string;
  max: number;
  category: string;
}

interface SkillRadarProps {
  className?: string;
  axes?: RadarAxis[];
  values?: number[];
  onSkillClick?: (axisName: string) => void;
}

const DEFAULT_AXES: RadarAxis[] = [
  { name: "GCP", max: 100, category: "Cloud" },
  { name: "BigQuery", max: 100, category: "Cloud" },
  { name: "Airflow", max: 100, category: "Data Engineering" },
  { name: "GenAI", max: 100, category: "AI/ML" },
  { name: "Python", max: 100, category: "Development" },
  { name: "SQL", max: 100, category: "Development" },
  { name: "Agentic", max: 100, category: "AI/ML" },
  { name: "Trading", max: 100, category: "Finance" },
];

const SKILL_LOOKUP: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      map[skill.name] = skill.level;
    }
  }
  return map;
})();

const DEFAULT_VALUES = DEFAULT_AXES.map((a) => SKILL_LOOKUP[a.name] ?? 80);

export default function SkillRadar({
  className = "",
  axes = DEFAULT_AXES,
  values = DEFAULT_VALUES,
  onSkillClick,
}: SkillRadarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const { play } = useSound();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = echarts.init(el, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    chart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(5, 5, 20, 0.92)",
        borderColor: "rgba(0, 240, 255, 0.35)",
        borderWidth: 1,
        textStyle: {
          color: "#e8f4ff",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
        },
        extraCssText: "backdrop-filter: blur(12px); box-shadow: 0 0 24px rgba(0, 240, 255, 0.3);",
      },
      radar: {
        indicator: axes.map(({ name, max }) => ({ name, max })),
        center: ["50%", "52%"],
        radius: "68%",
        shape: "polygon",
        splitNumber: 4,
        axisName: {
          color: "#8cb4d4",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          fontWeight: 500,
        },
        splitLine: {
          lineStyle: {
            color: "rgba(0, 240, 255, 0.12)",
            width: 1,
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ["rgba(0, 240, 255, 0.02)", "rgba(0, 240, 255, 0.04)"],
          },
        },
        axisLine: {
          lineStyle: {
            color: "rgba(0, 240, 255, 0.2)",
          },
        },
      },
      series: [
        {
          type: "radar",
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            color: "#00f0ff",
            width: 2,
            shadowColor: "rgba(0, 240, 255, 0.6)",
            shadowBlur: 8,
          },
          itemStyle: {
            color: "#00f0ff",
            borderColor: "#030014",
            borderWidth: 2,
            shadowColor: "rgba(0, 240, 255, 0.8)",
            shadowBlur: 12,
          },
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { offset: 0, color: "rgba(0, 240, 255, 0.25)" },
              { offset: 1, color: "rgba(0, 240, 255, 0.02)" },
            ]),
          },
          emphasis: {
            lineStyle: { width: 3 },
            itemStyle: { borderWidth: 3 },
          },
          data: [
            {
              value: values,
              name: "Capability",
            },
          ],
          animationDuration: 1800,
          animationEasing: "cubicOut",
          animationDelay: 200,
        },
      ],
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const allOpts = chart.getOption() as any;
      if (allOpts.series) {
        allOpts.series[0].animation = false;
        chart.setOption(allOpts);
      }
    }

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleAxisClick = (e: any) => {
      const point = chart.convertFromPixel({ radarIndex: 0 } as any, [e.offsetX, e.offsetY]);
      if (!point) return;
      const [radius, angle] = point;
      if (!radius || radius < 1) return;
      const numAxes = axes.length;
      const step = (2 * Math.PI) / numAxes;
      const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const axisIndex = Math.round(normalized / step) % numAxes;
      const axis = axes[axisIndex];
      if (!axis) return;
      play("tick");
      onSkillClick?.(axis.name);
    };

    let zrHandler: any = null;
    if (onSkillClick) {
      zrHandler = (e: any) => {
        if (e.target) handleAxisClick(e);
      };
      chart.getZr().on("click", zrHandler);
    }

    const ctx = gsap.context(() => {
      if (!reduced) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 75%",
          once: true,
          onEnter: () => play("sweep"),
        });
      }
    });

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
      if (zrHandler) chart.getZr().off("click", zrHandler);
      chart.dispose();
      chartRef.current = null;
    };
  }, [axes, values, onSkillClick, play]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[360px] ${className}`}
      style={{ minHeight: "360px" }}
      aria-label="Skills radar chart"
    />
  );
}
