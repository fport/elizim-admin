"use client";

import type { TooltipRenderProps } from "react-joyride";
import { ChevronRight, Sparkles } from "lucide-react";

export function TourTooltip({
  continuous,
  index,
  step,
  size,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) {
  const progress = ((index + 1) / size) * 100;

  return (
    <div
      {...tooltipProps}
      className="tour-tooltip"
      style={{
        maxWidth: 360,
        minWidth: 260,
        borderRadius: 24,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, var(--glass-bg-thick), var(--glass-bg))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--glass-border)",
        boxShadow: "0 8px 32px oklch(0 0 0 / 18%)",
        willChange: "transform",
        transform: "translateZ(0)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        position: "relative",
        zIndex: 10001,
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "var(--border)",
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, var(--primary), oklch(0.7 0.13 45))",
            borderRadius: 3,
            transition: "width 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "20px 20px 0 20px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "oklch(0.55 0.12 45 / 15%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles
            style={{ width: 14, height: 14, color: "var(--primary)" }}
          />
        </div>
        {step.title && (
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--foreground)",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {step.title}
          </h3>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 20px 16px 20px" }}>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.65,
            color: "var(--muted-foreground)",
          }}
        >
          {step.content}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px 16px 20px",
          gap: 8,
        }}
      >
        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  i === index
                    ? "var(--primary)"
                    : i < index
                      ? "oklch(0.55 0.12 45 / 40%)"
                      : "var(--border)",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            {...skipProps}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted-foreground)",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "7px 10px",
              borderRadius: 12,
              transition: "color 0.2s",
            }}
          >
            Gec
          </button>

          {continuous && (
            <button
              {...primaryProps}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--primary-foreground)",
                background: "var(--primary)",
                border: "none",
                borderRadius: 14,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px oklch(0.55 0.12 45 / 30%)",
                fontFamily: "inherit",
              }}
            >
              {isLastStep ? "Anladim oglum" : "Devam et"}
              {!isLastStep && (
                <ChevronRight style={{ width: 14, height: 14 }} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
