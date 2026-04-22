import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, RefreshCw, Sun, Moon } from 'lucide-react';
import { supabase } from './supabase';

const THEME_STORAGE_KEY = "rfid-attendance-theme";

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  const fetchAttendance = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('attendnce')
        .select(`
          id,
          created_at,
          nfc ( * )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching attendance:", error);
        return;
      }

      const formattedData = data.map(record => {
        const entryDate = new Date(record.created_at);
        const formatTime = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(entryDate);

        // Try to find a name property in the joined nfc data
        const studentName = record.nfc?.student_name || record.nfc?.full_name || record.nfc?.name || `User (${record.nfc?.user_id?.substring(0, 8) || 'Unknown'})`;

        return {
          id: record.id,
          name: studentName,
          entryTime: formatTime,
          status: "Present"
        };
      });

      setAttendanceData(formattedData);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    const subscription = supabase
      .channel('public:attendnce')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendnce' }, () => {
        fetchAttendance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchAttendance]);

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (theme === "dark") {
      htmlEl.classList.add("dark");
    } else {
      htmlEl.classList.remove("dark");
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return attendanceData.filter(student => 
      String(student.id).toLowerCase().includes(q) ||
      student.name.toLowerCase().includes(q) ||
      student.status.toLowerCase().includes(q)
    );
  }, [attendanceData, searchQuery]);

  const handleRefresh = useCallback(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className="font-['Barlow',sans-serif] text-ink min-h-[100dvh] overflow-hidden flex flex-col transition-colors duration-200">
      <header className="h-[72px] bg-header-bg transition-all duration-200 shrink-0 max-[840px]:h-[64px] z-10 w-full relative">
        <div className="w-[min(1220px,100%-28px)] mx-auto h-full flex items-center justify-between">
          <p className="m-0 font-['Bebas_Neue',sans-serif] tracking-wide text-[clamp(1.4rem,2.4vw,2.35rem)] text-header-text transition-colors duration-200 max-[840px]:text-[clamp(1.25rem,5.5vw,1.8rem)]">
            PROJECT : RFID ATTENDANCE LOGGER
          </p>
          <button
            onClick={toggleTheme}
            className="border-none bg-transparent rounded-full w-[38px] h-[38px] text-header-text grid place-items-center cursor-pointer transition-transform duration-200 hover:-translate-y-px"
            type="button"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun className="w-[21px] h-[21px] block transition-colors duration-200" strokeWidth={2.3} />
            ) : (
              <Moon className="w-[21px] h-[21px] block transition-colors duration-200 fill-current" strokeWidth={2.3} />
            )}
          </button>
        </div>
      </header>

      <main className="w-[min(1220px,100%-28px)] mx-auto flex-1 min-h-0 pt-[clamp(0.75rem,1.3vw,1.1rem)] pb-[0.9rem] flex flex-col">
        <section 
          className="flex-1 min-h-0 bg-transparent border-none rounded-none p-[clamp(1rem,1.6vw,1.8rem)] shadow-none flex flex-col transition-all duration-200"
          aria-labelledby="attendance-heading"
        >
          <h1 id="attendance-heading" className="m-0 text-ink text-[clamp(1.65rem,2.6vw,2.7rem)] tracking-[0.01em] transition-colors duration-200 shrink-0">
            Live Attendance (Active Students)
          </h1>

          <div className="mt-[clamp(0.9rem,1.5vw,1.35rem)] flex items-center gap-[0.7rem] max-[840px]:gap-[0.5rem] shrink-0">
            <label className="relative flex-1" htmlFor="student-search">
              <Search className="w-[19px] h-[19px] absolute left-[14px] top-1/2 -translate-y-1/2 text-ink opacity-85 transition-colors duration-200" strokeWidth={2.3} />
              <input
                id="student-search"
                type="search"
                placeholder="Search for Student"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] max-[840px]:h-[40px] border-[1.6px] border-border rounded-[11px] bg-search-bg text-ink pl-[42px] pr-[14px] outline-none text-[1.05rem] font-inherit transition-all duration-200 placeholder:text-ink focus:shadow-none"
              />
            </label>

            <button
              onClick={handleRefresh}
              className="border-0 bg-transparent text-ink inline-flex items-center gap-[0.45rem] text-[1.55rem] font-['Bebas_Neue',sans-serif] tracking-[0.02em] cursor-pointer transition-opacity duration-180 hover:opacity-70 max-[840px]:self-end max-[840px]:text-[1.35rem]"
              type="button"
            >
              <RefreshCw 
                className={`w-[22px] h-[22px] block transition-colors duration-200 ${isRefreshing ? 'animate-[spin_900ms_linear]' : ''}`} 
                strokeWidth={2.4} 
              />
              <span>Refresh</span>
            </button>
          </div>

          <div className="mt-[1rem] overflow-x-auto rounded-none px-[0.15rem] flex-1">
            <table className="w-full border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-transparent z-10 before:content-[''] before:absolute before:inset-0 before:border-b-[1.6px] before:border-border before:pointer-events-none transition-colors duration-200">
                <tr>
                  <th scope="col" className="w-[13%] pl-[2rem] text-left py-[0.48rem] px-[0.75rem] pb-[0.5rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap">ID</th>
                  <th scope="col" className="w-[31%] text-left py-[0.48rem] px-[0.75rem] pb-[0.5rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap">NAME</th>
                  <th scope="col" className="w-[34%] text-left py-[0.48rem] px-[0.75rem] pb-[0.5rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap">ENTRY TIME</th>
                  <th scope="col" className="w-[22%] text-left py-[0.48rem] px-[0.75rem] pb-[0.5rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-[0.34rem] px-[0.75rem] text-center text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-ink leading-[1.12]">
                      No active students found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((student, index) => (
                    <tr 
                      key={student.id + index}
                      className="animate-[row-fade_320ms_ease_forwards] translate-y-[10px] opacity-0"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <td className="w-[13%] pl-[2rem] py-[0.34rem] px-[0.75rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-ink whitespace-nowrap leading-[1.12] transition-colors duration-200">{student.id}</td>
                      <td className="w-[31%] py-[0.34rem] px-[0.75rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-ink whitespace-nowrap overflow-hidden text-ellipsis leading-[1.12] transition-colors duration-200">{student.name}</td>
                      <td className="w-[34%] py-[0.34rem] px-[0.75rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-ink whitespace-nowrap leading-[1.12] transition-colors duration-200">{student.entryTime}</td>
                      <td className="w-[22%] py-[0.34rem] px-[0.75rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-ink whitespace-nowrap leading-[1.12] transition-colors duration-200">
                        {student.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes row-fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default App;
