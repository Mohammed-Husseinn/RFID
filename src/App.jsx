import { useState, useEffect, useMemo, useCallback } from 'react';

const initialData = [
  { id: 1, name: "Abdelmohmen Faried", entryTime: "09:30:25 AM", status: "Online" },
  { id: 2, name: "Ahmed Mostafa", entryTime: "09:30:25 AM", status: "Online" },
  { id: 3, name: "Kareem Tarek", entryTime: "09:30:25 AM", status: "Online" },
  { id: 4, name: "Omar Yasser", entryTime: "09:30:25 AM", status: "Online" },
  { id: 5, name: "Youssef Ibrahim", entryTime: "09:30:25 AM", status: "Online" },
  { id: 6, name: "Zeyad Khaled", entryTime: "09:30:25 AM", status: "Online" },
  { id: 7, name: "Ali Mahmoud", entryTime: "09:30:25 AM", status: "Online" },
  { id: 8, name: "Hassan Adel", entryTime: "09:30:25 AM", status: "Online" },
];

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
  const [attendanceData, setAttendanceData] = useState(initialData);

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

  const formatNow = () => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date());
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const now = formatNow();
    
    setAttendanceData(prev => prev.map(student => ({
      ...student,
      entryTime: now
    })));

    setTimeout(() => {
      setIsRefreshing(false);
    }, 900);
  }, []);

  return (
    <div className="font-['Barlow',sans-serif] text-ink min-h-[100dvh] overflow-hidden flex flex-col transition-colors duration-200">
      <header className="h-[72px] bg-header-bg shadow-[var(--header-shadow)] transition-all duration-200 shrink-0 max-[840px]:h-[64px] z-10 w-full relative">
        <div className="w-[min(1220px,100%-28px)] mx-auto h-full flex items-center justify-between">
          <p className="m-0 font-['Bebas_Neue',sans-serif] tracking-wide text-[clamp(1.4rem,2.4vw,2.35rem)] text-header-text transition-colors duration-200 max-[840px]:text-[clamp(1.25rem,5.5vw,1.8rem)]">
            PROJECT : RFID ATTENDANCE LOGGER
          </p>
          <button
            onClick={toggleTheme}
            className="border border-[color-mix(in_srgb,var(--color-header-text)_32%,transparent)] bg-[color-mix(in_srgb,var(--color-header-text)_12%,transparent)] rounded-full w-[38px] h-[38px] grid place-items-center cursor-pointer backdrop-blur-sm transition-transform duration-200 hover:-translate-y-px"
            type="button"
            aria-label="Toggle theme"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[21px] fill-header-text transition-colors duration-200">
              {theme === "light" ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" />
              )}
            </svg>
          </button>
        </div>
      </header>

      <main className="w-[min(1220px,100%-28px)] mx-auto flex-1 min-h-0 pt-[clamp(0.75rem,1.3vw,1.1rem)] pb-[0.9rem] flex flex-col">
        <section 
          className="flex-1 min-h-0 bg-panel-bg border border-panel-border rounded-[14px] p-[clamp(1rem,1.6vw,1.8rem)] shadow-[var(--panel-shadow)] flex flex-col animate-[panel-rise_540ms_ease-out_both] transition-all duration-200"
          aria-labelledby="attendance-heading"
        >
          <h1 id="attendance-heading" className="m-0 text-ink text-[clamp(1.65rem,2.6vw,2.7rem)] tracking-[0.01em] transition-colors duration-200 shrink-0">
            Live Attendance (Active Students)
          </h1>

          <div className="mt-[clamp(0.9rem,1.5vw,1.35rem)] flex items-center gap-[0.7rem] max-[840px]:gap-[0.5rem] shrink-0">
            <label className="relative flex-1" htmlFor="student-search">
              <svg className="w-[19px] absolute left-[14px] top-1/2 -translate-y-1/2 fill-ink opacity-85 transition-colors duration-200" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 3.5a7 7 0 0 1 5.56 11.25l4.1 4.1a1 1 0 0 1-1.42 1.42l-4.1-4.1A7 7 0 1 1 10.5 3.5Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
              </svg>
              <input
                id="student-search"
                type="search"
                placeholder="Search for Student"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] max-[840px]:h-[40px] border-[1.6px] border-border rounded-[11px] bg-search-bg text-ink pl-[42px] pr-[14px] outline-none text-[1.05rem] font-inherit transition-all duration-200 placeholder:[color:color-mix(in_srgb,var(--color-ink)_78%,white_22%)] focus:shadow-[0_0_0_3px_rgba(36,44,104,0.17)] dark:focus:shadow-[0_0_0_3px_rgba(198,211,255,0.17)]"
              />
            </label>

            <button
              onClick={handleRefresh}
              className="border-0 bg-transparent text-ink inline-flex items-center gap-[0.45rem] text-[1.55rem] font-['Bebas_Neue',sans-serif] tracking-[0.02em] cursor-pointer transition-opacity duration-180 hover:opacity-70 max-[840px]:self-end max-[840px]:text-[1.35rem]"
              type="button"
            >
              <svg 
                viewBox="0 0 24 24" 
                aria-hidden="true" 
                className={`w-[22px] fill-ink transition-colors duration-200 ${isRefreshing ? 'animate-[spin_900ms_linear]' : ''}`}
              >
                <path d="M12 4a8 8 0 0 1 7.44 5.07.95.95 0 0 1-1.76.72A6.1 6.1 0 0 0 12 5.9a6.1 6.1 0 0 0-5.83 4.36.95.95 0 0 1-1.82-.55A8 8 0 0 1 12 4Zm7.63 5.86a.95.95 0 0 1 .95.95v3.57a.95.95 0 0 1-.95.95h-3.57a.95.95 0 1 1 0-1.9h1.36A6.1 6.1 0 0 0 12 18.1a6.1 6.1 0 0 0-5.66-3.93.95.95 0 0 1-.08-1.9 8 8 0 0 1 7.79 5.83 8 8 0 0 1 5.58-8.24Z" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          <div className="mt-[0.8rem] overflow-x-auto overflow-y-auto rounded-[10px] flex-1">
            <table className="w-full border-collapse min-w-0 table-fixed">
              <thead className="sticky top-0 bg-panel-bg z-10 before:content-[''] before:absolute before:inset-0 before:border-b-[1.6px] before:border-[color-mix(in_srgb,var(--color-border)_70%,white_30%)] before:pointer-events-none transition-colors duration-200">
                <tr>
                  <th scope="col" className="text-left py-[0.58rem] px-[0.55rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap w-[15%]">ID</th>
                  <th scope="col" className="text-left py-[0.58rem] px-[0.55rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap w-[40%]">NAME</th>
                  <th scope="col" className="text-left py-[0.58rem] px-[0.55rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap w-[25%]">ENTRY TIME</th>
                  <th scope="col" className="text-left py-[0.58rem] px-[0.55rem] font-['Bebas_Neue',sans-serif] text-[clamp(1.35rem,2.05vw,2.2rem)] tracking-[0.02em] whitespace-nowrap w-[20%]">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-[0.58rem] px-[0.55rem] text-center text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-[color-mix(in_srgb,var(--color-ink)_86%,white_14%)]">
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
                      <td className="py-[0.28rem] px-[0.55rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-[color-mix(in_srgb,var(--color-ink)_86%,white_14%)] whitespace-nowrap transition-colors duration-200">{student.id}</td>
                      <td className="py-[0.28rem] px-[0.55rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-[color-mix(in_srgb,var(--color-ink)_86%,white_14%)] whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200">{student.name}</td>
                      <td className="py-[0.28rem] px-[0.55rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-[color-mix(in_srgb,var(--color-ink)_86%,white_14%)] whitespace-nowrap transition-colors duration-200">{student.entryTime}</td>
                      <td className="py-[0.28rem] px-[0.55rem] text-[clamp(1rem,1.35vw,1.5rem)] font-medium text-[color-mix(in_srgb,var(--color-ink)_86%,white_14%)] whitespace-nowrap transition-colors duration-200">
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
        @keyframes panel-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes row-fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default App;
