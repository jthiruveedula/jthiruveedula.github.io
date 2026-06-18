"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSound } from "@/hooks/useSound";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
]);

interface DataMonitorProps {
  className?: string;
}

function generateMockTimeSeries(seed: number, points: number, base: number, variance: number) {
  const data: [string, number][] = [];
  let value = base;
  const now = Date.now();
  const stepMs = 60 * 1000;
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const hours = String(t.getHours()).padStart(2, "0");
    const mins = String(t.getMinutes()).padStart(2, "0");
    const noise = Math.sin(i * 0.7 + seed) * variance * 0.5 + (Math.random() - 0.5) * variance;
    value = Math.max(0, base + noise);
    data.push([`${hours}:${mins}`, Math.round(value * 10) / 10]);
  }
  return data;
}

export default function DataMonitor({ className = "" }: DataMonitorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const { play } = useSound();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = echarts.init(el, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    const tokensSeries = generateMockTimeSeries(1, 30, 78, 12);
    const latencySeries = generateMockTimeSeries(2, 30, 240, 50);
    const requestsSeries = generateMockTimeSeries(3, 30, 1450, 200);

    chart.setOption({
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(5, 5, 20, 0.92)",
        borderColor: "rgba(0, 240, 255, 0.35)",
        borderWidth: 1,
        textStyle: {
          color: "#e8f4ff",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
        },
        axisPointer: {
          lineStyle: { color: "rgba(0, 240, 255, 0.3)" },
        },
      },
      grid: {
        top: 40,
        right: 24,
        bottom: 36,
        left: 56,
        containLabel: false,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: tokensSeries.map((d) => d[0]),
        axisLine: { lineStyle: { color: "rgba(0, 240, 255, 0.15)" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#64748b",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
        },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "tokens %",
          nameTextStyle: {
            color: "#64748b",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9,
            padding: [0, 0, 0, 60],
          },
          position: "left",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#64748b",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
          },
          splitLine: { lineStyle: { color: "rgba(0, 240, 255, 0.06)" } },
          min: 0,
          max: 100,
        },
        {
          type: "value",
          name: "ms / req",
          nameTextStyle: {
            color: "#64748b",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9,
            padding: [0, 0, 0, 60],
          },
          position: "right",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#64748b",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Token Efficiency",
          type: "line",
          yAxisIndex: 0,
          data: tokensSeries.map((d) => d[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: "#00f0ff",
            width: 2,
            shadowColor: "rgba(0, 240, 255, 0.5)",
            shadowBlur: 8,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(0, 240, 255, 0.25)" },
              { offset: 1, color: "rgba(0, 240, 255, 0)" },
            ]),
          },
          animationDuration: 1500,
          animationEasing: "cubicOut",
        },
        {
          name: "P95 Latency",
          type: "line",
          yAxisIndex: 1,
          data: latencySeries.map((d) => d[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: "#ff00e5",
            width: 2,
            shadowColor: "rgba(255, 0, 229, 0.4)",
            shadowBlur: 6,
          },
          animationDuration: 1800,
          animationEasing: "cubicOut",
          animationDelay: 300,
        },
        {
          name: "Requests",
          type: "line",
          yAxisIndex: 1,
          data: requestsSeries.map((d) => d[1]),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: "#b026ff",
            width: 1.5,
            type: "dashed",
          },
          animationDuration: 2000,
          animationEasing: "cubicOut",
          animationDelay: 600,
        },
      ],
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const allOpts = chart.getOption() as any;
      if (allOpts.series) {
        allOpts.series.forEach((s: any) => (s.animation = false));
        chart.setOption(allOpts);
      }
    }

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => {
        window.removeEventListener("resize", handleResize);
        chart.dispose();
        chartRef.current = null;
      };
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => play("sweep"),
      });
    });

    let liveTick = 0;
    const liveInterval = setInterval(() => {
      liveTick++;
      const newTokens = generateMockTimeSeries(1, 30, 78 + Math.sin(liveTick * 0.2) * 5, 8);
      const newLatency = generateMockTimeSeries(2, 30, 240 + Math.cos(liveTick * 0.15) * 30, 30);
      chart.setOption({
        series: [
          { data: newTokens.map((d) => d[1]) },
          { data: newLatency.map((d) => d[1]) },
        ],
      });
    }, 2500);

    return () => {
      clearInterval(liveInterval);
      ctx.revert();
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, [play]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height: "320px" }}
      aria-label="Live production data monitor"
    />
  );
}
