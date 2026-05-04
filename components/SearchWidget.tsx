"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, ChevronDown, Plus, Minus, Building2, Globe } from "lucide-react";

interface RoomConfig {
  adults: number;
  childAges: number[];
}

interface Suggestion {
  id: string;
  name: string;
  type: string;
  country: string;
}

export default function SearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"hotell" | "pakke">("hotell");

  const [destination, setDestination] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [roomConfigs, setRoomConfigs] = useState<RoomConfig[]>([{ adults: 2, childAges: [] }]);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const destRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalGuests = roomConfigs.reduce((sum, r) => sum + r.adults + r.childAges.length, 0);
  const totalRooms = roomConfigs.length;
  const guestLabel = `${totalGuests} gjest${totalGuests !== 1 ? "er" : ""}, ${totalRooms} rom`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowSuggestions(false);
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) setShowGuestPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/hotels/destinations?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.destinations || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setDestinationId("");
    setDestinationType("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleDestinationFocus = () => {
    if (destination.length >= 1) {
      setShowSuggestions(true);
      fetchSuggestions(destination);
    } else {
      fetchSuggestions("");
      setShowSuggestions(true);
    }
  };

  const selectDestination = (dest: Suggestion) => {
    setDestination(dest.name + (dest.country ? `, ${dest.country}` : ""));
    setDestinationId(dest.id);
    setDestinationType(dest.type);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const updateRoom = (roomIndex: number, field: "adults" | "childAges", value: number | number[]) => {
    setRoomConfigs(prev => {
      const updated = [...prev];
      if (field === "adults") {
        updated[roomIndex] = { ...updated[roomIndex], adults: Math.max(1, value as number) };
      } else {
        updated[roomIndex] = { ...updated[roomIndex], childAges: value as number[] };
      }
      return updated;
    });
  };

  const addRoom = () => {
    if (roomConfigs.length < 4) {
      setRoomConfigs(prev => [...prev, { adults: 2, childAges: [] }]);
    }
  };

  const removeRoom = (index: number) => {
    if (roomConfigs.length > 1) {
      setRoomConfigs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addChild = (roomIndex: number) => {
    setRoomConfigs(prev => {
      const updated = [...prev];
      if (updated[roomIndex].childAges.length < 4) {
        updated[roomIndex] = { ...updated[roomIndex], childAges: [...updated[roomIndex].childAges, 5] };
      }
      return updated;
    });
  };

  const removeChild = (roomIndex: number, childIndex: number) => {
    setRoomConfigs(prev => {
      const updated = [...prev];
      updated[roomIndex] = {
        ...updated[roomIndex],
        childAges: updated[roomIndex].childAges.filter((_, i) => i !== childIndex),
      };
      return updated;
    });
  };

  const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
    setRoomConfigs(prev => {
      const updated = [...prev];
      const newAges = [...updated[roomIndex].childAges];
      newAges[childIndex] = age;
      updated[roomIndex] = { ...updated[roomIndex], childAges: newAges };
      return updated;
    });
  };

  const getDestIcon = (type: string) => {
    if (type === "hotel") return <Building2 size={14} className="text-[var(--coral)]" />;
    if (type === "city" || type === "region") return <Globe size={14} className="text-[var(--sea)]" />;
    return <MapPin size={14} className="text-[var(--muted)]" />;
  };

  const canSearch = !!destination && !!checkIn && !!checkOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) return;

    const allChildAges = roomConfigs.flatMap(r => r.childAges);
    const totalAdults = roomConfigs.reduce((s, r) => s + r.adults, 0);

    const params = new URLSearchParams({
      destinasjon: destination,
      ...(destinationId && { destinationId }),
      ...(destinationType && { destinationType }),
      checkIn,
      checkOut,
      adults: String(totalAdults),
      barn: String(allChildAges.length),
      rooms: String(totalRooms),
      ...(allChildAges.length > 0 && { childAges: allChildAges.join(",") }),
    });

    router.push(`/hoteller?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Fane-velger */}
      <div className="flex gap-1 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab("hotell")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
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
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white/40 cursor-not-allowed"
          >
            ✈️ Pakkereiser
          </button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--deep)] text-white text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
            Kommer snart
          </span>
        </div>
      </div>

      {/* Søkeskjema */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-3 flex flex-col lg:flex-row gap-2 w-full"
      >
        {/* Destinasjon */}
        <div className="flex-[2] relative" ref={destRef}>
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--coral)]">
              Destinasjon
            </span>
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <MapPin size={15} className="text-[var(--muted)] shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={e => handleDestinationChange(e.target.value)}
              onFocus={handleDestinationFocus}
              placeholder="Hotell, by eller destinasjon"
              autoComplete="off"
              required
              className="w-full text-[var(--deep)] text-sm font-medium placeholder:text-[var(--muted)]/70 bg-transparent outline-none"
            />
            {loadingSuggestions && (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--coral)]/40 border-t-[var(--coral)] animate-spin shrink-0" />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl shadow-black/15 border border-[var(--border)] overflow-hidden z-[200] max-h-64 overflow-y-auto">
              {suggestions.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectDestination(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--sand-light)] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--sand-light)] flex items-center justify-center shrink-0">
                    {getDestIcon(s.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--deep)] truncate">{s.name}</p>
                    {s.country && (
                      <p className="text-xs text-[var(--muted)] truncate">
                        {s.country} · {s.type === "hotel" ? "Hotell" : s.type === "city" ? "By" : "Region"}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px bg-[var(--border)] hidden lg:block self-stretch my-2" />

        {/* Innsjekk */}
        <div className="flex-1">
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--coral)]">
              Innsjekk
            </span>
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <Calendar size={15} className="text-[var(--muted)] shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full text-[var(--deep)] text-sm font-medium bg-transparent outline-none [color-scheme:light]"
            />
          </div>
        </div>

        <div className="w-px bg-[var(--border)] hidden lg:block self-stretch my-2" />

        {/* Utsjekk */}
        <div className="flex-1">
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--coral)]">
              Utsjekk
            </span>
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <Calendar size={15} className="text-[var(--muted)] shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
              required
              className="w-full text-[var(--deep)] text-sm font-medium bg-transparent outline-none [color-scheme:light]"
            />
          </div>
        </div>

        <div className="w-px bg-[var(--border)] hidden lg:block self-stretch my-2" />

        {/* Gjester */}
        <div className="flex-1 relative" ref={guestRef}>
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--coral)]">Gjester</span>
          </label>
          <button
            type="button"
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="flex items-center gap-2 px-4 pb-3 w-full text-left"
          >
            <Users size={15} className="text-[var(--muted)] shrink-0" />
            <span className="flex-1 text-[var(--deep)] text-sm font-medium truncate">{guestLabel}</span>
            <ChevronDown size={13} className={`text-[var(--muted)] transition-transform ${showGuestPicker ? "rotate-180" : ""}`} />
          </button>

          {showGuestPicker && (
            <div className="absolute top-full right-0 mt-1 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-xl shadow-2xl shadow-black/15 border border-[var(--border)] p-4 z-[200]">
              {roomConfigs.map((room, roomIdx) => (
                <div key={roomIdx} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                      Rom {roomIdx + 1}
                    </p>
                    {roomConfigs.length > 1 && (
                      <button type="button" onClick={() => removeRoom(roomIdx)} className="text-xs text-red-400 hover:text-red-600">
                        Fjern rom
                      </button>
                    )}
                  </div>

                  {/* Voksne */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--deep)]">Voksne</p>
                      <p className="text-xs text-[var(--muted)]">18+ år</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button type="button" onClick={() => updateRoom(roomIdx, "adults", room.adults - 1)}
                        className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors">
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-[var(--deep)]">{room.adults}</span>
                      <button type="button" onClick={() => updateRoom(roomIdx, "adults", room.adults + 1)}
                        className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Barn */}
                  <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
                    <div>
                      <p className="text-sm font-semibold text-[var(--deep)]">Barn</p>
                      <p className="text-xs text-[var(--muted)]">0–17 år</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button type="button" onClick={() => removeChild(roomIdx, room.childAges.length - 1)}
                        disabled={room.childAges.length === 0}
                        className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-[var(--deep)]">{room.childAges.length}</span>
                      <button type="button" onClick={() => addChild(roomIdx)}
                        disabled={room.childAges.length >= 4}
                        className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Barns alder */}
                  {room.childAges.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {room.childAges.map((age, childIdx) => (
                        <div key={childIdx} className="flex items-center gap-1.5">
                          <select
                            value={age}
                            onChange={e => updateChildAge(roomIdx, childIdx, parseInt(e.target.value))}
                            className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 text-[var(--deep)] bg-white outline-none"
                          >
                            {Array.from({ length: 18 }, (_, i) => (
                              <option key={i} value={i}>{i === 0 ? "Under 1" : `${i} år`}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {roomConfigs.length < 4 && (
                <button type="button" onClick={addRoom}
                  className="w-full mt-2 py-2 text-xs font-semibold text-[var(--sea)] hover:text-[var(--deep)] border border-dashed border-[var(--sea)]/40 rounded-lg transition-colors">
                  + Legg til rom
                </button>
              )}

              <button type="button" onClick={() => setShowGuestPicker(false)}
                className="w-full mt-3 py-2 text-sm font-semibold bg-[var(--deep)] hover:bg-[var(--coral)] text-white rounded-xl transition-colors">
                Bekreft
              </button>
            </div>
          )}
        </div>

        {/* Søk-knapp */}
        <button
          type="submit"
          disabled={!canSearch}
          className="flex items-center justify-center gap-2.5 bg-[var(--coral)] hover:bg-[var(--coral-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-7 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 shadow-lg shadow-[var(--coral)]/30"
        >
          <Search size={18} />
          <span>Søk</span>
        </button>
      </form>
    </div>
  );
}
