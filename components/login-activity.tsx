"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Monitor,
  Smartphone,
  AlertTriangle,
  Shield,
  X,
  Clock,
} from "lucide-react";
import { listSessions } from "@/lib/auth-client";
import { getIpLocation, type GeoLocation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionWithGeo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
  token: string;
  geo: GeoLocation | null;
  isCurrent: boolean;
}

function parseUserAgent(ua: string | null): {
  device: string;
  browser: string;
  isMobile: boolean;
} {
  if (!ua) return { device: "Bilinmiyor", browser: "Bilinmiyor", isMobile: false };

  const isMobile = /mobile|android|iphone|ipad/i.test(ua);

  let browser = "Bilinmiyor";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  const device = os ? `${os} - ${browser}` : browser;
  return { device, browser, isMobile };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Az once";
  if (minutes < 60) return `${minutes} dk once`;
  if (hours < 24) return `${hours} saat once`;
  if (days < 7) return `${days} gun once`;
  return new Date(date).toLocaleDateString("tr-TR");
}

function detectAnomalousLogins(sessions: SessionWithGeo[]): SessionWithGeo[] {
  if (sessions.length < 2) return [];

  const currentSession = sessions.find((s) => s.isCurrent);
  if (!currentSession?.geo) return [];

  const currentCity = currentSession.geo.city;
  const currentCountry = currentSession.geo.country;

  return sessions.filter((s) => {
    if (s.isCurrent || !s.geo) return false;
    return s.geo.city !== currentCity || s.geo.country !== currentCountry;
  });
}

export function LoginActivity() {
  const [sessions, setSessions] = useState<SessionWithGeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [anomalous, setAnomalous] = useState<SessionWithGeo[]>([]);
  const [warningDismissed, setWarningDismissed] = useState(false);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await listSessions();
        const rawSessions = res.data || [];

        const sessionsWithGeo: SessionWithGeo[] = await Promise.all(
          rawSessions.map(async (session: Record<string, unknown>, index: number) => {
            const ip = session.ipAddress as string | null;
            const geo = ip ? await getIpLocation(ip) : null;
            return {
              id: session.id as string,
              ipAddress: ip,
              userAgent: session.userAgent as string | null,
              createdAt: session.createdAt as Date,
              expiresAt: session.expiresAt as Date,
              token: session.token as string,
              geo,
              isCurrent: index === 0,
            };
          })
        );

        setSessions(sessionsWithGeo);
        setAnomalous(detectAnomalousLogins(sessionsWithGeo));
      } catch {
        // Session fetch failed silently
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Anomaly Warning */}
      {anomalous.length > 0 && !warningDismissed && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
              <AlertTriangle className="size-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">
                Farkli Lokasyondan Giris Tespit Edildi
              </h3>
              <p className="mt-1 text-sm text-amber-600/80 dark:text-amber-400/80">
                Hesabiniza farkli bir konumdan erisim saglandi. Eger bu siz degilseniz, lutfen
                sifrenizi hemen degistirin.
              </p>
              <div className="mt-3 space-y-2">
                {anomalous.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300"
                  >
                    <MapPin className="size-3.5 shrink-0" />
                    <span>
                      {s.geo?.city}{s.geo?.country ? `, ${s.geo.country}` : ""} - {s.ipAddress} -{" "}
                      {formatTimeAgo(s.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setWarningDismissed(true)}
              className="shrink-0 rounded-xl p-1.5 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Session List */}
      <div className="glass-card rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Son Giris Aktiviteleri
            </h2>
          </div>
          <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {sessions.length} oturum
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {sessions.map((session) => {
            const { device, isMobile } = parseUserAgent(session.userAgent);
            const isAnomaly = anomalous.some((a) => a.id === session.id);

            return (
              <div
                key={session.id}
                className={cn(
                  "flex items-center gap-4 py-3 first:pt-0 last:pb-0",
                  isAnomaly && "rounded-2xl bg-amber-500/5 px-3"
                )}
              >
                {/* Device Icon */}
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-2xl",
                    session.isCurrent
                      ? "bg-primary/10"
                      : isAnomaly
                        ? "bg-amber-500/10"
                        : "bg-muted"
                  )}
                >
                  {isMobile ? (
                    <Smartphone
                      className={cn(
                        "size-5",
                        session.isCurrent
                          ? "text-primary"
                          : isAnomaly
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      )}
                    />
                  ) : (
                    <Monitor
                      className={cn(
                        "size-5",
                        session.isCurrent
                          ? "text-primary"
                          : isAnomaly
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      )}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {device}
                    </p>
                    {session.isCurrent && (
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Bu Cihaz
                      </span>
                    )}
                    {isAnomaly && (
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        Farkli Konum
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {session.geo && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {session.geo.city}
                        {session.geo.country ? `, ${session.geo.country}` : ""}
                      </span>
                    )}
                    {session.ipAddress && (
                      <span className="font-mono">{session.ipAddress}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatTimeAgo(session.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
