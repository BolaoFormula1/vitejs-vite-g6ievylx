// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, User, CheckCircle, Save, Calculator, Settings, AlertCircle, 
  Flag, Lock, LogIn, UserPlus, Trash2, Calendar, PlusCircle, XCircle, 
  Clock, Mail, Key, UserCog, Send, Printer, Award, Shield, DollarSign,
  Link as LinkIcon, Copy, Banknote, UserCheck, UserX, ChevronRight, History,
  Database, Flame, X, Edit, CalendarDays, Users, AlertTriangle, LogOut
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query,   
  limit,   
  collection, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE ---

const manualKeys = {
  apiKey: "AIzaSyCzPK2ACo79F5WxSNib3kUQsXZ0lBvStfY",
  authDomain: "bolaof12026-d6f9e.firebaseapp.com",
  projectId: "bolaof12026-d6f9e",
  storageBucket: "bolaof12026-d6f9e.firebasestorage.app",
  messagingSenderId: "784210783074",
  appId: "1:784210783074:web:4f00531d543daa733f1a3b"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : manualKeys;

// --- INICIALIZAÇÃO SEGURA DO FIREBASE ---
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = "bolao-f1-2026-prod"; 

// --- DADOS ESTÁTICOS INICIAIS ---

const INITIAL_DRIVERS = [
  "Lando Norris", "Oscar Piastri", "George Russell", "Kimi Antonelli",
  "Max Verstappen", "Isack Hadjar", "Charles Leclerc", "Lewis Hamilton",
  "Alex Albon", "Carlos Sainz", "Arvid Lindblad", "Liam Lawson",
  "Lance Stroll", "Fernando Alonso", "Esteban Ocon", "Oliver Bearman",
  "Nico Hülkenberg", "Gabriel Bortoleto", "Pierre Gasly", "Franco Colapinto",
  "Sergio Pérez", "Valtteri Bottas"
];

// CALENDÁRIO OFICIAL F1 2026 (Atualizado conforme FIA/Wikipedia)
const INITIAL_RACES = [
  { id: 1, name: "GP da Austrália (Melbourne)", date: "2026-03-08", deadline: "2026-03-07T20:00", isBrazil: false, status: 'open', startingGrid: [] },
  { id: 2, name: "GP da China (Xangai)", date: "2026-03-15", deadline: "2026-03-14T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 3, name: "GP do Japão (Suzuka)", date: "2026-03-29", deadline: "2026-03-28T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 4, name: "GP do Bahrein (Sakhir)", date: "2026-04-12", deadline: "2026-04-11T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 5, name: "GP da Arábia Saudita (Jeddah)", date: "2026-04-19", deadline: "2026-04-18T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 6, name: "GP de Miami (EUA)", date: "2026-05-03", deadline: "2026-05-02T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 7, name: "GP do Canadá (Montreal)", date: "2026-05-24", deadline: "2026-05-23T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 8, name: "GP de Mônaco (Monte Carlo)", date: "2026-06-07", deadline: "2026-06-06T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 9, name: "GP de Barcelona-Catalunha", date: "2026-06-14", deadline: "2026-06-13T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 10, name: "GP da Áustria (Spielberg)", date: "2026-06-28", deadline: "2026-06-27T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 11, name: "GP da Grã-Bretanha (Silverstone)", date: "2026-07-05", deadline: "2026-07-04T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 12, name: "GP da Bélgica (Spa-Francorchamps)", date: "2026-07-19", deadline: "2026-07-18T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 13, name: "GP da Hungria (Hungaroring)", date: "2026-07-26", deadline: "2026-07-25T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 14, name: "GP da Holanda (Zandvoort)", date: "2026-08-23", deadline: "2026-08-22T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 15, name: "GP da Itália (Monza)", date: "2026-09-06", deadline: "2026-09-05T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 16, name: "GP da Espanha (Madrid)", date: "2026-09-13", deadline: "2026-09-12T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 17, name: "GP do Azerbaijão (Baku)", date: "2026-09-27", deadline: "2026-09-26T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 18, name: "GP de Singapura (Marina Bay)", date: "2026-10-11", deadline: "2026-10-10T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 19, name: "GP dos EUA (Austin)", date: "2026-10-25", deadline: "2026-10-24T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 20, name: "GP do México (Cidade do México)", date: "2026-11-01", deadline: "2026-10-31T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 21, name: "GP de São Paulo (Brasil)", date: "2026-11-08", deadline: "2026-11-07T20:00", isBrazil: true, status: 'pending', startingGrid: [] },
  { id: 22, name: "GP de Las Vegas (EUA)", date: "2026-11-21", deadline: "2026-11-20T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 23, name: "GP do Catar (Lusail)", date: "2026-11-29", deadline: "2026-11-28T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 24, name: "GP de Abu Dhabi (Yas Marina)", date: "2026-12-06", deadline: "2026-12-05T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
];

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SYSTEM_BRAZIL = [50, 36, 30, 24, 20, 16, 12, 8, 4, 2];

// --- COMPONENTES AUXILIARES ---

const PrintStyles = () => (
  <style>{`
    @media print {
      body * { visibility: hidden; }
      .printable-area, .printable-area * { visibility: visible; }
      .printable-area { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; }
      .no-print { display: none !important; }
    }
  `}</style>
);

const ChampionModal = ({ drivers, onSubmit, onClose, currentGuess }) => {
  const [selected, setSelected] = useState(currentGuess || "");
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 no-print backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-gray-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={24}/></button>
        <h2 className="text-2xl font-black text-center mt-6 text-gray-900 uppercase italic">{currentGuess ? "Alterar Palpite" : "Palpite do Campeão"}</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-4"><p className="text-center text-yellow-800 text-xs font-bold">Prazo: 04/03/2026</p></div>
        <select className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg font-bold mb-6" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Selecione...</option>
          {drivers.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={() => selected && onSubmit(selected)} disabled={!selected} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition">CONFIRMAR</button>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onRegister, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return alert("Senhas não conferem.");
    if (formData.password.length < 3) return alert("Senha muito curta.");
    onRegister(formData);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <h1 className="text-3xl font-black italic text-red-600 mb-6 text-center">CRIAR CONTA</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome Completo" className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
          <input type="email" placeholder="E-mail" className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
          <input type="password" placeholder="Senha" className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/>
          <input type="password" placeholder="Confirmar Senha" className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})}/>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold py-3 rounded transition">CADASTRAR</button>
        </form>
        <button onClick={onBack} className="w-full text-center mt-4 text-sm text-gray-500 hover:text-white underline">Voltar para Login</button>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [userAuth, setUserAuth] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState({});
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState('login');
  const [adminTab, setAdminTab] = useState('results');
  const [selectedRaceId, setSelectedRaceId] = useState(1);
  const [adminRaceId, setAdminRaceId] = useState(1); // ID da corrida sendo editada no Admin
  const [showChampionModal, setShowChampionModal] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authError, setAuthError] = useState(""); 
  const [dbError, setDbError] = useState(false); // Novo estado para erro de permissão

  const [config, setConfig] = useState({
    drivers: INITIAL_DRIVERS,
    races: INITIAL_RACES,
    officialChampion: null,
    financial: { entryFee: 300, mainPrizeDeduction: 240, perUserPoints: 10 }
  });

  const [adminResult, setAdminResult] = useState({ top10: Array(10).fill(""), driverOfDay: "" });
  const [newDriverName, setNewDriverName] = useState("");
  const [editingRace, setEditingRace] = useState(null);

  // Autenticação Firebase
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
           await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Erro Auth:", e);
        if (e.code === 'auth/admin-restricted-operation') {
          const msg = "ERRO DE CONFIGURAÇÃO: O Login Anônimo não está ativado no Firebase Console.\n\nVá em Authentication -> Sign-in method e habilite o provedor 'Anonymous'.";
          setAuthError(msg);
          alert(msg);
        }
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUserAuth);
  }, []);

  // Login Persistente
  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem('bolao_f1_user_id');
      if (savedUserId && users.length > 0 && !currentUser) {
        const found = users.find(u => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          setActiveTab(found.isAdmin ? 'admin' : 'dashboard');
        }
      }
    } catch(e) { console.log("Localstorage error"); }
  }, [users, currentUser]);

  // Carregamento de Dados - CORREÇÃO DO ERRO DE SNAPSHOT
  useEffect(() => {
    if (!userAuth) return;

    try {
      const unsubUsers = onSnapshot(
        collection(db, 'users'), 
        (snap) => {
          setDbError(false);
          setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (error) => {
          console.error("Erro Firestore Users:", error);
          if (error.code === 'permission-denied') setDbError(true);
        }
      );

      const unsubBets = onSnapshot(
        collection(db, 'bets'), 
        (snap) => { const b = {}; snap.docs.forEach(d => b[d.id] = d.data()); setBets(b); },
        (error) => console.log("Aguardando bets...")
      );

      const unsubResults = onSnapshot(
        collection(db, 'results'), 
        (snap) => { const r = {}; snap.docs.forEach(d => r[d.id] = d.data()); setResults(r); },
        (error) => console.log("Aguardando results...")
      );

      const unsubConfig = onSnapshot(
        doc(db, 'config', 'main'), 
        (snap) => {
          if (snap.exists()) setConfig(snap.data());
          else setDoc(doc(db, 'config', 'main'), { ...config, races: INITIAL_RACES }).catch(e => console.log("Init config error"));
        },
        (error) => console.log("Aguardando config...")
      );

      return () => { unsubUsers(); unsubBets(); unsubResults(); unsubConfig(); };
    } catch (e) { console.error(e); }
  }, [userAuth]);

  // Modal Campeão
  useEffect(() => {
    if (currentUser && !currentUser.championGuess && !currentUser.isAdmin) {
      if (new Date() < new Date("2026-03-04T23:59:59")) setShowChampionModal(true);
    }
  }, [currentUser]);

  // Controle de Resultados no Admin
  useEffect(() => {
    if (activeTab === 'admin' && adminTab === 'results') {
      const existing = results[adminRaceId];
      if (existing) setAdminResult(existing);
      else setAdminResult({ top10: Array(10).fill(""), driverOfDay: "" });
    }
  }, [adminRaceId, activeTab, adminTab, results]);

  const processRecalculation = async (latestResults) => {
    if (!users.length) return;
    const batch = writeBatch(db);
    const sortedRaces = [...config.races].sort((a, b) => new Date(a.date) - new Date(b.date));
    const finishedRaces = sortedRaces.filter(r => latestResults[r.id]);

    users.forEach(u => {
      if (u.isAdmin) return;
      let total = 0;
      let lastBet = null;
      let streak = 0;

      finishedRaces.forEach(race => {
        const result = latestResults[race.id];
        const key = `${race.id}_${u.id}`;
        let bet = bets[key];

        if (!bet) {
          streak++;
          if (streak === 1) {
            if (lastBet) bet = lastBet;
            else if (race.startingGrid && race.startingGrid.length > 0) bet = { top10: race.startingGrid, driverOfDay: race.startingGrid[0] };
            else bet = null;
          } else bet = null;
        } else {
          streak = 0;
          lastBet = bet;
        }

        if (bet) {
          const table = race.isBrazil ? POINTS_SYSTEM_BRAZIL : POINTS_SYSTEM;
          const consolation = race.isBrazil ? 2 : 1;
          bet.top10.forEach((driver, idx) => {
            if (!driver) return;
            const officialPos = result.top10.indexOf(driver);
            if (officialPos === idx) total += table[idx];
            else if (officialPos !== -1) total += consolation;
          });
          if (bet.driverOfDay === result.driverOfDay) total += 5;
        }
      });

      if (config.officialChampion && u.championGuess === config.officialChampion) {
        const participants = users.filter(usr => !usr.isAdmin).length;
        const winners = users.filter(usr => usr.championGuess === config.officialChampion).length;
        total += winners > 0 ? Math.floor((participants * config.financial.perUserPoints) / winners) : 0;
      }
      
      const uRef = doc(db, 'users', u.id);
      batch.update(uRef, { points: total });
    });
    await batch.commit();
  };

  const login = (email, pass) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && found.password === pass) {
      if (!found.isAdmin && !found.paymentConfirmed) return setLoginError("Aguarde aprovação do Admin.");
      localStorage.setItem('bolao_f1_user_id', found.id);
      setCurrentUser(found);
      setActiveTab(found.isAdmin ? 'admin' : 'dashboard');
      setLoginError("");
    } else setLoginError("E-mail ou senha inválidos.");
  };

  const logout = () => {
    localStorage.removeItem('bolao_f1_user_id');
    setCurrentUser(null);
    setActiveTab('login');
  };

  const register = async (data) => {
    const id = data.email.replace(/\./g, '_');
    
    const userDocRef = doc(db, 'users', id);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) return alert("Já existe uma conta com este e-mail.");

    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(query(usersCollection, limit(1)));
    const isFirstUser = usersSnapshot.empty;
    
    const newUser = { 
      ...data, 
      id, 
      isAdmin: isFirstUser, 
      points: 0, 
      championGuess: "", 
      paymentConfirmed: isFirstUser 
    };

    try { 
      await setDoc(doc(db, 'users', id), newUser); 
      if (isFirstUser) {
        alert("Conta criada! Você é o ADMINISTRADOR.");
        localStorage.setItem('bolao_f1_user_id', id);
        setCurrentUser(newUser);
        setActiveTab('admin');
      } else {
        alert("Conta criada! Aguarde aprovação do Admin.");
        setActiveTab('login');
      }
    } catch (e) { 
      alert("Erro ao criar conta: " + e.message + "\n\nVerifique se alterou as Regras no Firebase Console!"); 
    }
  };

  const saveBet = async (top10, driverOfDay) => {
    if (!currentUser) return;
    const race = config.races.find(r => r.id === selectedRaceId);
    if (new Date() > new Date(race.deadline)) return alert(`Apostas encerradas!`);
    try { await setDoc(doc(db, 'bets', `${selectedRaceId}_${currentUser.id}`), { top10, driverOfDay, timestamp: new Date().toISOString() }); alert("Salvo!"); } catch (e) { alert("Erro: " + e.message); }
  };

  const saveRaceResult = async () => {
    if (adminResult.top10.some(d => d === "")) return alert("Preencha todos!");
    try {
      await setDoc(doc(db, 'results', adminRaceId.toString()), adminResult);
      const newRaces = config.races.map(r => r.id === adminRaceId ? { ...r, status: 'finished' } : r);
      await updateDoc(doc(db, 'config', 'main'), { races: newRaces });
      await processRecalculation({ ...results, [adminRaceId]: adminResult });
      alert("Resultado salvo e pontos recalculados!");
    } catch (e) { alert("Erro: " + e.message); }
  };

  const updateRaceConfig = async (race) => {
    const updatedRaces = config.races.map(r => r.id === race.id ? race : r);
    await updateDoc(doc(db, 'config', 'main'), { races: updatedRaces });
    setEditingRace(null);
  };

  // TELA DE ERRO DE PERMISSÃO (FIREBASE RULES)
  if (dbError) {
    return (
      <div className="min-h-screen bg-orange-900 text-white flex items-center justify-center p-6">
        <div className="bg-white text-orange-900 p-8 rounded-xl shadow-2xl max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-orange-600" />
          <h2 className="text-2xl font-bold mb-4">Bloqueio de Segurança do Firebase</h2>
          <p className="mb-4">O banco de dados está rejeitando a conexão. Isso acontece porque as regras de segurança estão em modo restrito (padrão).</p>
          <div className="bg-gray-100 p-4 rounded text-left text-xs font-mono text-gray-800 mb-4 overflow-x-auto">
            {`// Vá no Console > Firestore > Regras e cole isto:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
          </div>
          <button onClick={() => window.location.reload()} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Já corrigi, tentar novamente</button>
        </div>
      </div>
    );
  }

  // TELA DE ERRO DE AUTH (LOGIN ANÔNIMO)
  if (authError) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-6">
        <div className="bg-white text-red-900 p-8 rounded-xl shadow-2xl max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro de Configuração</h2>
          <p className="font-medium whitespace-pre-line">{authError}</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'login') return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <h1 className="text-4xl font-black italic text-red-600 mb-2 text-center">F1 BOLÃO '26</h1>
        <form onSubmit={(e) => { e.preventDefault(); login(e.target[0].value, e.target[1].value); }} className="space-y-5">
          <input type="email" placeholder="E-mail" className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" />
          <input type="password" placeholder="Senha" className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" />
          {loginError && <div className="text-red-400 text-xs text-center font-bold">{loginError}</div>}
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold py-3 rounded transition">ENTRAR</button>
        </form>
        <button onClick={() => setActiveTab('register')} className="mt-6 w-full text-center text-sm hover:underline">Criar Conta</button>
      </div>
    </div>
  );

  if (activeTab === 'register') return <RegisterScreen onRegister={register} onBack={() => setActiveTab('login')}/>;

  const race = config.races.find(r => r.id === selectedRaceId);
  const isLocked = new Date() > new Date(race.deadline);
  const currentBet = bets[`${selectedRaceId}_${currentUser?.id}`] || { top10: Array(10).fill(""), driverOfDay: "" };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      <PrintStyles />
      {showChampionModal && <ChampionModal drivers={config.drivers} currentGuess={currentUser.championGuess} onClose={() => setShowChampionModal(false)} onSubmit={async (d) => { try { await updateDoc(doc(db, 'users', currentUser.id), { championGuess: d }); setCurrentUser({...currentUser, championGuess: d}); setShowChampionModal(false); } catch(e) { alert("Erro: " + e.message); }}} />}

      <header className="bg-red-600 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="font-black italic text-xl tracking-tighter uppercase">F1 BOLÃO '26</h1>
          <button onClick={logout} className="bg-red-800 text-xs px-3 py-1 rounded font-bold uppercase hover:bg-red-900 transition flex items-center gap-2"><LogOut size={16}/> Sair</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-full"><Trophy className="text-yellow-600" size={24} /></div>
                <div>
                  <h3 className="font-bold text-gray-800 uppercase italic text-sm">Palpite do Campeão</h3>
                  <p className="text-xs text-gray-500">{currentUser.championGuess ? <span className="font-black text-gray-900">{currentUser.championGuess}</span> : "Quem vence a temporada?"}</p>
                </div>
              </div>
              <button onClick={() => setShowChampionModal(true)} className="text-xs font-bold uppercase py-2 px-4 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg">{currentUser.championGuess ? "Alterar" : "Definir"}</button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-600">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2 uppercase italic leading-none text-gray-900"><Flag className="text-red-600" size={24}/> {race?.name}</h2>
                  <p className="text-xs text-gray-400 mt-1 font-bold">{new Date(race?.date).toLocaleDateString()} {race?.isBrazil && '🇧🇷 DOBRADO'}</p>
                  {isLocked && <p className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1"><Lock size={12}/> Apostas Encerradas</p>}
                  {!isLocked && <p className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1"><Clock size={12}/> Aberto até {new Date(race.deadline).toLocaleString()}</p>}
                </div>
                <select className="p-2 border rounded font-bold text-sm bg-gray-50 text-gray-900" value={selectedRaceId} onChange={e => setSelectedRaceId(Number(e.target.value))}>
                  {config.races.map(r => <option key={r.id} value={r.id}>{r.name} {results[r.id] ? '🏁' : ''}</option>)}
                </select>
              </div>

              {results[race.id] ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed">
                  <Shield size={48} className="mx-auto text-gray-300 mb-4"/>
                  <p className="font-black text-gray-400 uppercase mb-2">Etapa Finalizada</p>
                  <p className="text-xs text-gray-500">Vencedor: {results[race.id].top10[0]}</p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Seu Top 10</h3>
                    {Array(10).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${i < 3 ? 'bg-yellow-500' : 'bg-gray-400'}`}>{i+1}º</span>
                        <select className="flex-1 p-2 border rounded-lg bg-white text-gray-900 text-sm font-medium" value={currentBet.top10[i]} onChange={(e) => {
                          const nt = [...currentBet.top10]; nt[i] = e.target.value; saveBet(nt, currentBet.driverOfDay);
                        }}>
                          <option value="">Piloto...</option>
                          {config.drivers.filter(d => !currentBet.top10.includes(d) || currentBet.top10[i] === d).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-xl border">
                      <h3 className="text-xs font-black text-gray-400 uppercase mb-3">Piloto do Dia</h3>
                      <select className="w-full p-3 border rounded-lg font-bold text-red-600 bg-white" value={currentBet.driverOfDay} onChange={(e) => saveBet(currentBet.top10, e.target.value)}>
                        <option value="">Selecione...</option>
                        {config.drivers.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'ranking' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden printable-area">
            <div className="bg-red-600 p-5 text-white flex justify-between items-center">
              <h2 className="text-xl font-black italic flex items-center gap-2 uppercase tracking-tighter"><Trophy size={20}/> Classificação</h2>
              <button onClick={() => window.print()} className="p-2 hover:bg-red-700 rounded transition no-print"><Printer size={20}/></button>
            </div>
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b"><th className="p-4">Pos</th><th className="p-4">Nome</th><th className="p-4 text-right pr-6">Pts</th></tr></thead>
              <tbody className="divide-y">
                {/* Filtrando administradores para que não apareçam no ranking */}
                {[...users].filter(u => !u.isAdmin).sort((a,b) => (Number(b.points) || 0) - (Number(a.points) || 0)).map((u, i) => (
                  <tr key={u.id} className={u.id === currentUser?.id ? 'bg-yellow-50' : ''}>
                    <td className="p-4 text-center font-black text-gray-400">{i+1}º</td>
                    <td className="p-4 font-black text-gray-800 uppercase italic text-sm">{u.name}</td>
                    <td className="p-4 text-right font-black text-2xl pr-6 text-red-600">{(u.points || 0).toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6 no-print">
            <div className="flex bg-white rounded-lg shadow-sm p-1 gap-1">
              {['results', 'members', 'settings'].map(t => (
                <button key={t} onClick={() => setAdminTab(t)} className={`flex-1 py-2 text-xs font-black uppercase rounded ${adminTab === t ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                  {t === 'results' ? 'Resultados' : t === 'members' ? 'Membros' : 'Configurações'}
                </button>
              ))}
            </div>

            {adminTab === 'results' && (
              <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-600">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black uppercase italic text-gray-800 flex items-center gap-2"><Calculator/> Lançar Resultado</h2>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500">Status: {race.status === 'finished' ? 'Finalizada' : 'Aberta'}</p>
                    {race.status === 'finished' && <p className="text-[10px] text-red-500">Você pode re-salvar para corrigir</p>}
                  </div>
                </div>

                <div className="mb-4 bg-gray-100 p-2 rounded flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600">Selecione a Etapa para Lançar:</span>
                    <select 
                      className="p-1 text-xs border rounded bg-white" 
                      value={adminRaceId} 
                      onChange={e => setAdminRaceId(Number(e.target.value))}
                    >
                       {config.races.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    {adminResult.top10.map((d, i) => (
                      <select key={i} className="w-full p-2 border rounded-lg text-xs font-bold text-gray-900" value={d} onChange={e => { const nt = [...adminResult.top10]; nt[i] = e.target.value; setAdminResult({...adminResult, top10: nt}); }}>
                        <option value="">{i+1}º Lugar...</option>
                        {config.drivers.filter(drv => !adminResult.top10.includes(drv) || adminResult.top10[i] === drv).map(drv => <option key={drv} value={drv}>{drv}</option>)}
                      </select>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <select className="w-full p-2 border rounded-lg font-bold text-gray-900" value={adminResult.driverOfDay} onChange={e => setAdminResult({...adminResult, driverOfDay: e.target.value})}>
                      <option value="">Piloto do Dia...</option>
                      {config.drivers.map(drv => <option key={drv} value={drv}>{drv}</option>)}
                    </select>
                    <button onClick={saveRaceResult} className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-red-700 transition uppercase tracking-widest">
                      {config.races.find(r => r.id === adminRaceId)?.status === 'finished' ? 'ATUALIZAR RESULTADO OFICIAL' : 'FINALIZAR ETAPA'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'members' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-black uppercase text-gray-500 mb-4 flex items-center gap-2"><Users size={18}/> Gestão de Membros</h2>
                <div className="space-y-3">
                  {users.filter(u => !u.isAdmin).map(u => (
                    <div key={u.id} className="flex justify-between items-center p-4 border rounded-xl">
                      <span className="font-black text-gray-800 uppercase italic text-sm">{u.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => togglePayment(u.id)} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase ${u.paymentConfirmed ? 'bg-green-100 text-green-700' : 'bg-red-500 text-white'}`}>{u.paymentConfirmed ? 'Pago' : 'Pendente'}</button>
                        <button onClick={() => deleteDoc(doc(db, 'users', u.id))} className="text-gray-300 hover:text-red-600"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'settings' && (
              <div className="space-y-6">
                
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                  <h2 className="text-lg font-black uppercase text-yellow-700 mb-4 flex items-center gap-2"><Trophy size={18}/> Finalizar Temporada</h2>
                  <p className="text-xs text-gray-500 mb-4">Selecione o campeão apenas ao final do campeonato. Isso distribuirá os pontos do bolão proporcionalmente.</p>
                  <div className="flex gap-2">
                    <select className="flex-1 border p-2 rounded text-sm font-bold" value={config.officialChampion || ""} onChange={e => setConfig({...config, officialChampion: e.target.value})}>
                        <option value="">Selecione o Campeão...</option>
                        {config.drivers.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={async () => {
                        if(!config.officialChampion) return alert("Selecione um piloto");
                        if(window.confirm("Confirmar campeão? Isso afetará a pontuação final de todos os participantes.")) {
                            await updateDoc(doc(db, 'config', 'main'), { officialChampion: config.officialChampion });
                            await processRecalculation(results);
                            alert("Campeão definido e pontos calculados!");
                        }
                      }} className="bg-yellow-500 text-white px-4 py-2 rounded font-black uppercase hover:bg-yellow-600 shadow-md">Confirmar</button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-lg font-black uppercase text-gray-800 mb-4 flex items-center gap-2"><CalendarDays size={18}/> Gerenciar Corridas e Prazos</h2>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-xs text-blue-800">
                    <strong>Nota:</strong> Defina o "Grid de Largada" apenas se quiser ativar a regra automática para quem faltar na 1ª aposta.
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {config.races.sort((a,b) => new Date(a.date) - new Date(b.date)).map(r => (
                      <div key={r.id} className="border p-4 rounded-lg bg-gray-50 space-y-3">
                        {editingRace === r.id ? (
                          <div className="space-y-3">
                            <input className="w-full border p-2 rounded text-sm font-bold" value={r.name} onChange={e => { const nr = {...r, name: e.target.value}; setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)}); }} />
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className="text-[10px] font-bold text-gray-500 uppercase">Data da Corrida</label><input type="date" className="w-full border p-2 rounded text-sm" value={r.date} onChange={e => { const nr = {...r, date: e.target.value}; setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)}); }} /></div>
                              <div><label className="text-[10px] font-bold text-red-500 uppercase">Limite Apostas (Deadline)</label><input type="datetime-local" className="w-full border p-2 rounded text-sm border-red-200" value={r.deadline} onChange={e => { const nr = {...r, deadline: e.target.value}; setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)}); }} /></div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1"><AlertTriangle size={10}/> Grid de Largada (Para regra de falta na 1ª Etapa)</label>
                              <div className="grid grid-cols-5 gap-1 mt-1">
                                {Array(10).fill(0).map((_, i) => (
                                  <select key={i} className="text-[10px] border rounded p-1" value={r.startingGrid?.[i] || ""} onChange={e => {
                                    const newGrid = [...(r.startingGrid || Array(10).fill(""))]; newGrid[i] = e.target.value;
                                    const nr = {...r, startingGrid: newGrid};
                                    setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)});
                                  }}>
                                    <option value="">{i+1}º...</option>
                                    {config.drivers.map(d => <option key={d} value={d}>{d}</option>)}
                                  </select>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end gap-2"><button onClick={() => setEditingRace(null)} className="text-gray-500 text-xs font-bold uppercase px-3">Cancelar</button><button onClick={() => updateRaceConfig(r)} className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold uppercase shadow">Salvar Alterações</button></div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-sm text-gray-800">{r.name}</div>
                              <div className="text-xs text-gray-500">Limite: <span className="font-mono text-red-600">{new Date(r.deadline).toLocaleString()}</span></div>
                              {r.startingGrid?.length > 0 && <div className="text-[10px] text-blue-600 mt-1">Grid cadastrado ✅</div>}
                            </div>
                            <button onClick={() => setEditingRace(r.id)} className="text-blue-500 hover:text-blue-700 bg-white p-2 rounded border shadow-sm"><Edit size={16}/></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-lg font-black uppercase text-gray-800 mb-4 flex items-center gap-2"><UserCog size={18}/> Pilotos</h2>
                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Novo Piloto" className="flex-1 border p-2 rounded" value={newDriverName} onChange={e => setNewDriverName(e.target.value)} />
                    <button onClick={async () => { if(newDriverName){ await updateDoc(doc(db, 'config', 'main'), { drivers: [...config.drivers, newDriverName].sort() }); setNewDriverName(""); } }} className="bg-green-600 text-white p-2 rounded"><PlusCircle size={20}/></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {config.drivers.map(d => (
                      <div key={d} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs font-bold border">
                        {d}
                        <button onClick={async () => { if(window.confirm("Remover?")) await updateDoc(doc(db, 'config', 'main'), { drivers: config.drivers.filter(x => x !== d) }); }} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex justify-around shadow-inner z-50 no-print">
        <button onClick={() => setActiveTab(currentUser?.isAdmin ? 'admin' : 'dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' || activeTab === 'admin' ? 'text-red-600' : 'text-gray-400'}`}>
          <CheckCircle size={24}/> <span className="text-[9px] font-black uppercase">Apostar</span>
        </button>
        <button onClick={() => setActiveTab('ranking')} className={`flex flex-col items-center ${activeTab === 'ranking' ? 'text-red-600' : 'text-gray-400'}`}>
          <Trophy size={24}/> <span className="text-[9px] font-black uppercase">Ranking</span>
        </button>
      </nav>
    </div>
  );
}