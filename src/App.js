import { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
} from "firebase/auth";
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc,
  onSnapshot, arrayUnion, serverTimestamp, query, where, getDocs
} from "firebase/firestore";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0a0c10;--surface:#111318;--card:#181b22;--border:#252830;
  --accent:#f59e0b;--accent2:#fbbf24;--danger:#ef4444;--success:#22c55e;
  --text:#f0f2f8;--muted:#6b7280;--soft:#9ca3af;
  --radius:14px;--radius-sm:8px;
}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;}
.app{max-width:480px;margin:0 auto;min-height:100vh;position:relative;}
.ss-overlay{position:fixed;inset:0;background:#000;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#fff;text-align:center;padding:32px;}
.ss-overlay h2{font-family:'Syne',sans-serif;font-size:22px;color:#ef4444;}
.ss-overlay p{color:#9ca3af;font-size:14px;line-height:1.6;}
.ss-overlay button{margin-top:8px;padding:12px 28px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;}
.login-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;}
.logo-block{text-align:center;margin-bottom:36px;}
.logo-e3{font-family:'Syne',sans-serif;font-size:52px;font-weight:800;color:var(--accent);letter-spacing:-2px;line-height:1;}
.logo-sub{font-size:12px;letter-spacing:4px;color:var(--muted);text-transform:uppercase;margin-top:4px;}
.login-card{width:100%;max-width:360px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;}
.login-tabs{display:flex;gap:0;background:var(--surface);border-radius:var(--radius-sm);padding:4px;margin-bottom:24px;}
.login-tab{flex:1;padding:9px;text-align:center;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;color:var(--muted);transition:all .2s;}
.login-tab.active{background:var(--accent);color:#000;font-weight:700;}
label{display:block;font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:500;}
input,select{width:100%;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border .2s;}
input:focus,select:focus{border-color:var(--accent);}
.field{margin-bottom:16px;}
.btn{width:100%;padding:13px;background:var(--accent);color:#000;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;letter-spacing:.5px;transition:opacity .2s;}
.btn:hover{opacity:.85;}
.btn:disabled{opacity:.5;cursor:not-allowed;}
.btn.ghost{background:transparent;border:1px solid var(--border);color:var(--text);font-family:'DM Sans',sans-serif;font-weight:500;}
.btn.danger{background:var(--danger);color:#fff;}
.btn.sm{padding:8px 16px;font-size:13px;width:auto;font-family:'DM Sans',sans-serif;font-weight:600;}
.btn.success{background:var(--success);color:#fff;}
.err{color:var(--danger);font-size:12px;margin-top:8px;}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:10;}
.topbar-title{font-family:'Syne',sans-serif;font-weight:700;font-size:17px;}
.topbar-e3{color:var(--accent);}
.avatar{width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:14px;cursor:pointer;}
.page{padding:20px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:12px;cursor:pointer;transition:border .2s;}
.card:hover{border-color:var(--accent);}
.card-row{display:flex;align-items:center;justify-content:space-between;}
.card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:16px;}
.card-sub{font-size:12px;color:var(--muted);margin-top:4px;}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.badge.green{background:#22c55e22;color:#22c55e;}
.badge.amber{background:#f59e0b22;color:#f59e0b;}
.badge.red{background:#ef444422;color:#ef4444;}
.divider{height:1px;background:var(--border);margin:16px 0;}
.section-head{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:12px;}
.row{display:flex;gap:10px;align-items:center;}
.chip{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:12px;color:var(--soft);}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.stat-box{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;}
.stat-num{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:var(--accent);}
.stat-lbl{font-size:11px;color:var(--muted);margin-top:2px;}
.modal-bg{position:fixed;inset:0;background:#000a;z-index:100;display:flex;align-items:flex-end;}
.modal{width:100%;max-width:480px;margin:0 auto;background:var(--card);border-radius:var(--radius) var(--radius) 0 0;border:1px solid var(--border);border-bottom:none;padding:24px;max-height:90vh;overflow-y:auto;}
.modal-head{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:20px;}
.test-header{background:var(--card);border-bottom:1px solid var(--border);padding:14px 20px;position:sticky;top:0;z-index:5;}
.timer-bar{display:flex;align-items:center;justify-content:space-between;}
.timer{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;}
.timer.warning{color:#f59e0b;animation:pulse 1s infinite;}
.timer.danger{color:#ef4444;animation:pulse .5s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
.progress-bar{height:4px;background:var(--border);border-radius:2px;margin-top:10px;}
.progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .3s;}
.question-num{font-size:11px;color:var(--muted);font-weight:600;letter-spacing:1px;margin-bottom:10px;}
.question-text{font-size:16px;font-weight:600;line-height:1.6;margin-bottom:20px;}
.option{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;cursor:pointer;transition:all .15s;}
.option:hover{border-color:var(--accent);}
.option.selected{border-color:var(--accent);background:#f59e0b18;}
.option.correct{border-color:var(--success);background:#22c55e18;}
.option.wrong{border-color:var(--danger);background:#ef444418;}
.option-letter{width:28px;height:28px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;}
.option.selected .option-letter{background:var(--accent);color:#000;}
.option.correct .option-letter{background:var(--success);color:#fff;}
.option.wrong .option-letter{background:var(--danger);color:#fff;}
.q-nav{display:flex;gap:8px;justify-content:space-between;padding:16px 20px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--bg);}
.q-dots{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}
.q-dot{width:28px;height:28px;border-radius:50%;background:var(--surface);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;}
.q-dot.answered{border-color:var(--accent);background:#f59e0b22;color:var(--accent);}
.q-dot.current{border-color:var(--accent);background:var(--accent);color:#000;}
.result-hero{text-align:center;padding:32px 20px 20px;}
.result-score{font-family:'Syne',sans-serif;font-size:64px;font-weight:800;color:var(--accent);line-height:1;}
.result-ring{width:120px;height:120px;border-radius:50%;border:6px solid var(--accent);display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 16px;}
.loading{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Syne',sans-serif;font-size:18px;color:var(--accent);}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.slide-up{animation:slideUp .3s ease;}
@keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
`;

function fmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function useScreenshotGuard(active) {
  const [blocked, setBlocked] = useState(false);
  const warningCount = useRef(0);
  useEffect(() => {
    if (!active) return;
    const handleKey = (e) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p") ||
          (e.metaKey && e.shiftKey && ["3","4","5"].includes(e.key))) {
        e.preventDefault(); warningCount.current += 1; setBlocked(true);
      }
    };
    const handleVisibility = () => { if (document.hidden) { warningCount.current += 1; setBlocked(true); } };
    const handleContext = (e) => e.preventDefault();
    document.addEventListener("keyup", handleKey);
    document.addEventListener("keydown", handleKey);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", handleContext);
    return () => {
      document.removeEventListener("keyup", handleKey);
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", handleContext);
    };
  }, [active]);
  return { blocked, warningCount: warningCount.current, dismiss: () => setBlocked(false) };
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("login");
  const [testSession, setTestSession] = useState(null);

  const inTest = screen === "takeTest";
  const { blocked, warningCount, dismiss } = useScreenshotGuard(inTest);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const profileDoc = await getDoc(doc(db, "users", u.uid));
        if (profileDoc.exists()) {
          const profile = profileDoc.data();
          setUserProfile(profile);
          setScreen(profile.role === "teacher" ? "teacherHome" : "studentHome");
        }
      } else {
        setUser(null); setUserProfile(null); setScreen("login");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const go = (s, payload) => { setScreen(s); if (payload) setTestSession(payload); };

  const handleLogout = async () => { await signOut(auth); setScreen("login"); };

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading">E³ Loading...</div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {blocked && (
          <div className="ss-overlay">
            <div style={{fontSize:48}}>🚫</div>
            <h2>Screenshot Detected!</h2>
            <p>Screenshots are not allowed during the test.<br/>This incident has been recorded.<br/>
            <strong style={{color:"#ef4444"}}>Warning #{warningCount}</strong></p>
            <button onClick={dismiss}>I Understand — Continue Test</button>
          </div>
        )}
        {screen === "login" && <LoginScreen onLogin={(u, p) => { setUser(u); setUserProfile(p); setScreen(p.role === "teacher" ? "teacherHome" : "studentHome"); }} />}
        {screen === "teacherHome" && userProfile?.role === "teacher" &&
          <TeacherHome user={user} userProfile={userProfile} onLogout={handleLogout} go={go} />}
        {screen === "studentHome" && userProfile?.role === "student" &&
          <StudentHome user={user} userProfile={userProfile} onLogout={handleLogout} go={go} />}
        {screen === "takeTest" && testSession &&
          <TakeTest session={testSession} user={user} onFinish={() => go("studentHome")} onBack={() => go("studentHome")} />}
      </div>
    </>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState("teacher");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setErr(""); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profileDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!profileDoc.exists()) { setErr("Profile nahi mila. Admin se contact karo."); setLoading(false); return; }
      const profile = profileDoc.data();
      if (tab === "teacher" && profile.role !== "teacher") { setErr("Teacher account nahi hai!"); setLoading(false); return; }
      if (tab === "student" && profile.role !== "student") { setErr("Student account nahi hai!"); setLoading(false); return; }
      onLogin(cred.user, profile);
    } catch (e) {
      setErr("Email ya password galat hai!");
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="logo-block">
        <div className="logo-e3">E³</div>
        <div className="logo-sub">Classes — Online Tests</div>
      </div>
      <div className="login-card slide-up">
        <div className="login-tabs">
          <div className={`login-tab${tab==="teacher"?" active":""}`} onClick={()=>{setTab("teacher");setErr("");}}>👨‍🏫 Teacher</div>
          <div className={`login-tab${tab==="student"?" active":""}`} onClick={()=>{setTab("student");setErr("");}}>👨‍🎓 Student</div>
        </div>
        <div className="field"><label>Email</label><input placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="field"><label>Password</label><input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/></div>
        {err && <div className="err">⚠ {err}</div>}
        <div style={{height:16}}/>
        <button className="btn" onClick={login} disabled={loading}>{loading ? "Logging in..." : "Login →"}</button>
      </div>
    </div>
  );
}

// ─── TEACHER HOME ─────────────────────────────────────────────────────────────
function TeacherHome({ user, userProfile, onLogout, go }) {
  const [classes, setClasses] = useState([]);
  const [view, setView] = useState("home");
  const [selClass, setSelClass] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "classes"), where("teacherId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user.uid]);

  const totalTests = classes.reduce((a, c) => a + (c.testCount || 0), 0);
  const totalStudents = classes.reduce((a, c) => a + (c.students?.length || 0), 0);

  if (view === "classDetail" && selClass) {
    return <ClassDetail cls={selClass} user={user} onBack={() => { setView("home"); setSelClass(null); }} />;
  }

  return (
    <div>
      <Topbar title="Teacher Dashboard" initial={userProfile?.name?.[0] || "T"} onLogout={onLogout} />
      <div className="page slide-up">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,color:"var(--muted)"}}>Welcome back,</div>
          <div style={{fontFamily:"Syne",fontSize:22,fontWeight:800}}>{userProfile?.name || "Teacher"} 👋</div>
        </div>
        <div className="stats-grid">
          <div className="stat-box"><div className="stat-num">{classes.length}</div><div className="stat-lbl">Classes</div></div>
          <div className="stat-box"><div className="stat-num">{totalTests}</div><div className="stat-lbl">Tests Created</div></div>
          <div className="stat-box"><div className="stat-num">{totalStudents}</div><div className="stat-lbl">Students</div></div>
          <div className="stat-box"><div className="stat-num">{classes.filter(c=>c.activeTests>0).length}</div><div className="stat-lbl">Active Tests</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div className="section-head" style={{margin:0}}>MY CLASSES</div>
          <button className="btn sm" onClick={()=>setShowAddClass(true)}>+ New Class</button>
        </div>
        {classes.length === 0 && <div style={{color:"var(--muted)",textAlign:"center",padding:"32px 0",fontSize:14}}>Koi class nahi — pehli class banao! 😊</div>}
        {classes.map(c => (
          <div className="card" key={c.id} onClick={()=>{ setSelClass(c); setView("classDetail"); }}>
            <div className="card-row">
              <div>
                <div className="card-title">{c.name}</div>
                <div className="card-sub">{c.students?.length || 0} students · Code: <strong>{c.code}</strong></div>
              </div>
              <div style={{color:"var(--accent)",fontSize:20}}>›</div>
            </div>
          </div>
        ))}
      </div>
      {showAddClass && <AddClassModal teacherId={user.uid} onClose={()=>setShowAddClass(false)} onDone={()=>setShowAddClass(false)} />}
    </div>
  );
}

// ─── CLASS DETAIL ─────────────────────────────────────────────────────────────
function ClassDetail({ cls, user, onBack }) {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddTest, setShowAddTest] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes", cls.id, "tests"), snap => {
      setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [cls.id]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!cls.students?.length) return;
      const studs = await Promise.all(cls.students.map(uid => getDoc(doc(db, "users", uid))));
      setStudents(studs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })));
    };
    fetchStudents();
  }, [cls.students]);

  return (
    <div>
      <Topbar title={cls.name} onBack={onBack} initial="T" onLogout={()=>{}} />
      <div className="page slide-up">
        <div className="row" style={{marginBottom:16}}>
          <div className="chip">👥 {cls.students?.length || 0} students</div>
          <div className="chip">🔑 {cls.code}</div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button className="btn sm ghost" onClick={()=>setShowAddStudent(true)}>+ Add Student</button>
          <button className="btn sm" onClick={()=>setShowAddTest(true)}>+ Create Test</button>
        </div>

        <div className="section-head">STUDENTS</div>
        {students.length === 0 && <div style={{color:"var(--muted)",fontSize:13,marginBottom:16}}>No students yet.</div>}
        {students.map(s => (
          <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>{s.name}</div>
              <div style={{fontSize:12,color:"var(--muted)"}}>{s.email}</div>
            </div>
            <span className="badge green">Active</span>
          </div>
        ))}

        <div style={{height:20}}/>
        <div className="section-head">TESTS</div>
        {tests.length === 0 && <div style={{color:"var(--muted)",fontSize:13,marginBottom:16}}>No tests yet.</div>}
        {tests.map(t => (
          <div className="card" key={t.id} style={{cursor:"default"}}>
            <div className="card-row">
              <div>
                <div className="card-title">{t.title}</div>
                <div className="card-sub">{t.questions?.length || 0} Qs · {t.duration} min · Max {t.maxAttempts} attempt{t.maxAttempts>1?"s":""}</div>
              </div>
              <span className={`badge ${t.status==="active"?"green":"red"}`}>{t.status}</span>
            </div>
            <div className="divider"/>
            <button className="btn sm ghost" onClick={async()=>{
              await updateDoc(doc(db,"classes",cls.id,"tests",t.id),{ status: t.status==="active"?"paused":"active" });
            }}>{t.status==="active"?"⏸ Pause":"▶ Activate"}</button>
          </div>
        ))}
      </div>
      {showAddTest && <AddTestModal clsId={cls.id} onClose={()=>setShowAddTest(false)} />}
      {showAddStudent && <AddStudentModal clsId={cls.id} clsData={cls} onClose={()=>setShowAddStudent(false)} />}
    </div>
  );
}

// ─── STUDENT HOME ─────────────────────────────────────────────────────────────
function StudentHome({ user, userProfile, onLogout, go }) {
  const [myClasses, setMyClasses] = useState([]);
  const [testsMap, setTestsMap] = useState({});

  useEffect(() => {
    const q = query(collection(db, "classes"), where("students", "array-contains", user.uid));
    const unsub = onSnapshot(q, async snap => {
      const cls = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyClasses(cls);
      for (const c of cls) {
        const testSnap = await getDocs(collection(db, "classes", c.id, "tests"));
        setTestsMap(prev => ({ ...prev, [c.id]: testSnap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }
    });
    return unsub;
  }, [user.uid]);

  return (
    <div>
      <Topbar title="My Tests" initial={userProfile?.name?.[0] || "S"} onLogout={onLogout} />
      <div className="page slide-up">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,color:"var(--muted)"}}>Welcome,</div>
          <div style={{fontFamily:"Syne",fontSize:22,fontWeight:800}}>{userProfile?.name || "Student"} 👋</div>
        </div>
        {myClasses.length === 0 && <div style={{color:"var(--muted)",textAlign:"center",padding:"40px 0"}}>Koi class nahi — Teacher se join karo!</div>}
        {myClasses.map(cls => (
          <div key={cls.id}>
            <div className="section-head">{cls.name}</div>
            {(testsMap[cls.id] || []).map(t => {
              const myAttempts = t.attempts?.[user.uid] || [];
              const attemptsLeft = t.maxAttempts - myAttempts.length;
              const canAttempt = t.status === "active" && attemptsLeft > 0;
              const bestScore = myAttempts.length > 0 ? Math.max(...myAttempts.map(a => a.score)) : null;
              return (
                <div className="card" key={t.id} style={{cursor:canAttempt?"pointer":"default"}}
                  onClick={()=>canAttempt && go("takeTest",{clsId:cls.id, test:t, studentId:user.uid})}>
                  <div className="card-row">
                    <div>
                      <div className="card-title">{t.title}</div>
                      <div className="card-sub">{t.questions?.length} MCQs · ⏱ {t.duration} min</div>
                    </div>
                    <span className={`badge ${canAttempt?"green":attemptsLeft===0?"red":"amber"}`}>
                      {t.status!=="active"?"Paused":attemptsLeft===0?"Exhausted":`${attemptsLeft} left`}
                    </span>
                  </div>
                  {myAttempts.length > 0 && (
                    <>
                      <div className="divider"/>
                      <div style={{display:"flex",gap:16,fontSize:13}}>
                        <span>Best: <strong style={{color:"var(--accent)"}}>{bestScore}/{t.questions?.length}</strong></span>
                        <span style={{color:"var(--muted)"}}>{myAttempts.length}/{t.maxAttempts} attempts used</span>
                      </div>
                    </>
                  )}
                  {canAttempt && <div style={{marginTop:10,fontSize:12,color:"var(--accent)",fontWeight:600}}>TAP TO START →</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAKE TEST ────────────────────────────────────────────────────────────────
function TakeTest({ session, user, onFinish, onBack }) {
  const { clsId, test, studentId } = session;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(test.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const started = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(interval); submitTest(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const submitTest = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const elapsed = Math.round((Date.now() - started.current) / 1000);
    const score = answers.reduce((acc, ans, i) => acc + (ans === test.questions[i].correct ? 1 : 0), 0);
    const attempt = { score, total: test.questions.length, time: fmt(elapsed), date: new Date().toISOString().slice(0, 10), answers };
    const testRef = doc(db, "classes", clsId, "tests", test.id);
    await updateDoc(testRef, { [`attempts.${studentId}`]: arrayUnion(attempt) });
    onFinish();
  }, [answers, submitting]);

  const q = test.questions[current];
  const answered = answers.filter(a => a !== null).length;
  const pct = ((test.duration * 60 - timeLeft) / (test.duration * 60)) * 100;
  const timerClass = timeLeft < 60 ? "danger" : timeLeft < 300 ? "warning" : "";

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div className="test-header">
        <div className="timer-bar">
          <div style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>{test.title.slice(0,30)}…</div>
          <div className={`timer ${timerClass}`}>⏱ {fmt(timeLeft)}</div>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:pct+"%"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"var(--muted)"}}>
          <span>{answered}/{test.questions.length} answered</span>
          <span>Q{current+1} of {test.questions.length}</span>
        </div>
      </div>
      <div className="page" style={{flex:1}}>
        <div className="q-dots">
          {test.questions.map((_,i) => (
            <div key={i} className={`q-dot${answers[i]!==null?" answered":""}${i===current?" current":""}`} onClick={()=>setCurrent(i)}>{i+1}</div>
          ))}
        </div>
        <div className="question-num">QUESTION {current+1}</div>
        <div className="question-text">{q.text}</div>
        {q.options.map((opt,i) => (
          <div key={i} className={`option${answers[current]===i?" selected":""}`} onClick={()=>setAnswers(a=>{const n=[...a];n[current]=i;return n;})}>
            <div className="option-letter">{String.fromCharCode(65+i)}</div>
            <span style={{fontSize:15}}>{opt}</span>
          </div>
        ))}
      </div>
      <div className="q-nav">
        <button className="btn sm ghost" onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0}>← Prev</button>
        {current < test.questions.length-1
          ? <button className="btn sm" onClick={()=>setCurrent(c=>c+1)}>Next →</button>
          : <button className="btn sm success" onClick={()=>setShowSubmit(true)}>Submit ✓</button>
        }
      </div>
      {showSubmit && (
        <div className="modal-bg" onClick={()=>setShowSubmit(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">Submit Test?</div>
            <div style={{fontSize:14,color:"var(--muted)",marginBottom:20,lineHeight:1.6}}>
              {answered}/{test.questions.length} answered.
              {test.questions.length-answered > 0 && <span style={{color:"var(--danger)"}}> ⚠ {test.questions.length-answered} unanswered!</span>}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn ghost" style={{flex:1}} onClick={()=>setShowSubmit(false)}>Review</button>
              <button className="btn success" style={{flex:1}} onClick={submitTest} disabled={submitting}>{submitting?"Saving...":"Submit ✓"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ title, initial, onLogout, onBack }) {
  return (
    <div className="topbar">
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {onBack && <button onClick={onBack} style={{background:"none",border:"none",color:"var(--accent)",fontSize:20,cursor:"pointer"}}>‹</button>}
        <div className="topbar-title"><span className="topbar-e3">E³</span> {title}</div>
      </div>
      <div className="avatar" onClick={onLogout} title="Logout">{initial}</div>
    </div>
  );
}

// ─── ADD CLASS MODAL ──────────────────────────────────────────────────────────
function AddClassModal({ teacherId, onClose, onDone }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const code = "E3-" + name.replace(/\s+/g,"").slice(0,4).toUpperCase() + Math.floor(Math.random()*100);
    await addDoc(collection(db, "classes"), {
      name, code, teacherId, students: [], testCount: 0,
      createdAt: serverTimestamp()
    });
    setLoading(false);
    onDone();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">Create New Class</div>
        <div className="field"><label>Class Name</label><input placeholder="e.g. Class 11 - Maths" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn" style={{flex:1}} onClick={add} disabled={loading}>{loading?"Creating...":"Create"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD STUDENT MODAL ────────────────────────────────────────────────────────
function AddStudentModal({ clsId, clsData, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const add = async () => {
    if (!name || !email || !pass) { setErr("Saari fields bharo!"); return; }
    setLoading(true); setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, "users", cred.user.uid), { name, email, role: "student", createdAt: serverTimestamp() });
      await updateDoc(doc(db, "classes", clsId), { students: arrayUnion(cred.user.uid) });
      setSuccess(`✅ ${name} add ho gaya!`);
      setName(""); setEmail(""); setPass("");
    } catch (e) {
      setErr(e.message.includes("already") ? "Ye email already registered hai!" : "Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">👨‍🎓 Add Student</div>
        <div className="field"><label>Student Name</label><input placeholder="e.g. Arjun Singh" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="field"><label>Email</label><input placeholder="student@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="field"><label>Password</label><input type="password" placeholder="Min 6 characters" value={pass} onChange={e=>setPass(e.target.value)}/></div>
        {err && <div className="err">⚠ {err}</div>}
        {success && <div style={{color:"var(--success)",fontSize:13,marginBottom:8}}>{success}</div>}
        <div style={{display:"flex",gap:10}}>
          <button className="btn ghost" style={{flex:1}} onClick={onClose}>Done</button>
          <button className="btn" style={{flex:1}} onClick={add} disabled={loading}>{loading?"Adding...":"Add Student"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD TEST MODAL ───────────────────────────────────────────────────────────
function AddTestModal({ clsId, onClose }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [maxAttempts, setMax] = useState(1);
  const [questions, setQs] = useState([{ text:"", options:["","","",""], correct:0 }]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const addQ = () => setQs(q => [...q, { text:"", options:["","","",""], correct:0 }]);
  const updateQ = (i, field, val) => setQs(q => q.map((qq,idx) => idx!==i ? qq : {...qq,[field]:val}));
  const updateOpt = (qi, oi, val) => setQs(q => q.map((qq,idx) => idx!==qi ? qq : {...qq, options:qq.options.map((o,j) => j===oi?val:o)}));

  const create = async () => {
    if (!title || questions.some(q => !q.text || q.options.some(o => !o))) return;
    setLoading(true);
    await addDoc(collection(db, "classes", clsId, "tests"), {
      title, duration: +duration, maxAttempts: +maxAttempts,
      status: "active", questions: questions.map((q,i) => ({id:"q"+i,...q})),
      attempts: {}, createdAt: serverTimestamp()
    });
    await updateDoc(doc(db, "classes", clsId), { testCount: (await getDoc(doc(db,"classes",clsId))).data().testCount + 1 });
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-bg">
      <div className="modal">
        {step===1 ? <>
          <div className="modal-head">📝 New Test</div>
          <div className="field"><label>Test Title</label><input placeholder="e.g. Chapter 5 Quiz" value={title} onChange={e=>setTitle(e.target.value)}/></div>
          <div className="field"><label>Duration (minutes)</label><input type="number" min={5} max={180} value={duration} onChange={e=>setDuration(e.target.value)}/></div>
          <div className="field"><label>Max Attempts</label>
            <select value={maxAttempts} onChange={e=>setMax(e.target.value)}>
              {[1,2,3].map(n=><option key={n} value={n}>{n} attempt{n>1?"s":""}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
            <button className="btn" style={{flex:1}} onClick={()=>title&&setStep(2)}>Next →</button>
          </div>
        </> : <>
          <div className="modal-head">📝 Add Questions</div>
          <div style={{maxHeight:"55vh",overflowY:"auto"}}>
            {questions.map((q,qi)=>(
              <div key={qi} style={{background:"var(--surface)",borderRadius:10,padding:14,marginBottom:12}}>
                <div style={{fontSize:12,color:"var(--accent)",fontWeight:700,marginBottom:8}}>Q{qi+1}</div>
                <input placeholder="Question text…" value={q.text} onChange={e=>updateQ(qi,"text",e.target.value)} style={{marginBottom:8}}/>
                {q.options.map((o,oi)=>(
                  <div key={oi} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:q.correct===oi?"var(--success)":"var(--border)",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:q.correct===oi?"#fff":"var(--muted)"}} onClick={()=>updateQ(qi,"correct",oi)}>{String.fromCharCode(65+oi)}</div>
                    <input placeholder={`Option ${String.fromCharCode(65+oi)}`} value={o} onChange={e=>updateOpt(qi,oi,e.target.value)} style={{flex:1,padding:"8px 10px"}}/>
                  </div>
                ))}
                <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Letter tap karo correct answer mark karne ke liye</div>
              </div>
            ))}
            <button className="btn sm ghost" onClick={addQ} style={{width:"100%",marginBottom:8}}>+ Add Question</button>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className="btn ghost" style={{flex:1}} onClick={()=>setStep(1)}>← Back</button>
            <button className="btn success" style={{flex:1}} onClick={create} disabled={loading}>{loading?"Saving...":"Create Test ✓"}</button>
          </div>
        </>}
      </div>
    </div>
  );
}