"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HotelSearchForm from "./hotels/HotelSearchForm";
import { encodeRoomCfg } from "@/lib/room-config";

export default function SearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"hotell" | "pakke">("hotell");

  return (
    <div className="w-full">
      {/* Fane-velger */}
      <div className="grid grid-cols-2 gap-1 p-1 mb-3 bg-black/20 backdrop-blur-sm rounded-2xl sm:flex sm:w-fit sm:bg-transparent sm:p-0">
        <button
          type="button"
          onClick={() => setActiveTab("hotell")}
          className={`min-h-11 flex items-center justify-center gap-2 px-4 py-2 rounded-xl sm:rounded-full text-sm font-semibold transition-all ${
            activeTab === "hotell"
              ? "bg-white text-[var(--deep)] shadow-lg shadow-black/10"
              : "text-white/70 hover:text-white"
          }`}
        >
          🏨 Hotell
        </button>
        <div className="relative group">
          <button
            type="button"
            disabled
            className="min-h-11 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl sm:rounded-full text-sm font-semibold text-white/45 cursor-not-allowed"
          >
            ✈️ Pakkereiser
          </button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--deep)] text-white text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
            Kommer snart
          </span>
        </div>
      </div>

      {/* Søkeskjema — identisk med /hoteller */}
      <HotelSearchForm
        onSearch={(data) => {
          const params = new URLSearchParams({
            destinasjon: data.destination,
            ...(data.destinationId && { destinationId: data.destinationId }),
            ...(data.destinationType && { destinationType: data.destinationType }),
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            roomCfg: encodeRoomCfg(data.roomConfigs),
            residency: data.residency,
          });

          router.push(`/hoteller?${params.toString()}`);
        }}
      />
    </div>
  );
}
