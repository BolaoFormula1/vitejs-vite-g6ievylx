// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, User, CheckCircle, Save, Calculator, Settings, AlertCircle, 
  Flag, Lock, LogIn, UserPlus, Trash2, Calendar, PlusCircle, XCircle, 
  Clock, Mail, Key, UserCog, Send, Printer, Award, Shield, DollarSign,
  Link as LinkIcon, Copy, Banknote, UserCheck, UserX, ChevronRight, History,
  Database, Flame, X, Edit, CalendarDays, Users, AlertTriangle, LogOut, CheckCircle2, RefreshCw, FileText, Eye, EyeOff
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
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

// --- CONFIGURAÇÃO FIREBASE SEGURA (.ENV) ---
const getFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  
  if (!config.apiKey && typeof __firebase_config !== 'undefined') {
      return JSON.parse(__firebase_config);
  }
  return config;
};

const firebaseConfig = getFirebaseConfig();

// --- INICIALIZAÇÃO SEGURA ---
let app;
let auth;
let db;
let initError = null;

try {
    if (firebaseConfig && firebaseConfig.apiKey) {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        initError = "Variáveis de ambiente (.env) não encontradas. Configure o VITE_FIREBASE_API_KEY.";
    }
} catch (e) {
    console.error("Erro na inicialização do Firebase:", e);
    initError = "Falha ao conectar no Firebase. Verifique as chaves no .env";
}

// --- IMAGEM DE FUNDO ---
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2670&auto=format&fit=crop";

// --- DADOS ESTÁTICOS ---
const INITIAL_DRIVERS = [
  "Lando Norris", "Oscar Piastri", "George Russell", "Kimi Antonelli",
  "Max Verstappen", "Isack Hadjar", "Charles Leclerc", "Lewis Hamilton",
  "Alex Albon", "Carlos Sainz", "Arvid Lindblad", "Liam Lawson",
  "Lance Stroll", "Fernando Alonso", "Esteban Ocon", "Oliver Bearman",
  "Nico Hülkenberg", "Gabriel Bortoleto", "Pierre Gasly", "Franco Colapinto",
  "Sergio Pérez", "Valtteri Bottas"
];

// CALENDÁRIO OFICIAL 2026
const INITIAL_RACES = [
  { id: 1, name: "GP da Austrália (Melbourne)", date: "2026-03-08", deadline: "2026-03-07T20:00", isBrazil: false, status: 'open', startingGrid: [] },
  { id: 2, name: "GP da China (Xangai)", date: "2026-03-15", deadline: "2026-03-14T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 3, name: "GP do Japão (Suzuka)", date: "2026-03-29", deadline: "2026-03-28T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 4, name: "GP do Bahrein (Sakhir)", date: "2026-04-12", deadline: "2026-04-11T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 5, name: "GP da Arábia Saudita (Jeddah)", date: "2026-04-19", deadline: "2026-04-18T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 6, name: "GP de Miami (EUA)", date: "2026-05-03", deadline: "2026-05-02T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 7, name: "GP do Canadá (Montreal)", date: "2026-05-17", deadline: "2026-05-16T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 8, name: "GP de Mônaco (Monte Carlo)", date: "2026-05-24", deadline: "2026-05-23T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 9, name: "GP de Barcelona-Catalunha", date: "2026-06-07", deadline: "2026-06-06T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 10, name: "GP da Áustria (Spielberg)", date: "2026-06-21", deadline: "2026-06-20T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 11, name: "GP da Grã-Bretanha (Silverstone)", date: "2026-07-05", deadline: "2026-07-04T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 12, name: "GP da Bélgica (Spa-Francorchamps)", date: "2026-07-26", deadline: "2026-07-25T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 13, name: "GP da Hungria (Hungaroring)", date: "2026-08-02", deadline: "2026-08-01T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 14, name: "GP da Holanda (Zandvoort)", date: "2026-08-30", deadline: "2026-08-29T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 15, name: "GP da Itália (Monza)", date: "2026-09-06", deadline: "2026-09-05T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 16, name: "GP da Espanha (Madrid)", date: "2026-09-20", deadline: "2026-09-19T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 17, name: "GP do Azerbaijão (Baku)", date: "2026-10-04", deadline: "2026-10-03T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 18, name: "GP de Singapura (Marina Bay)", date: "2026-10-18", deadline: "2026-10-17T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 19, name: "GP dos EUA (Austin)", date: "2026-11-01", deadline: "2026-10-31T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 20, name: "GP do México (Cidade do México)", date: "2026-11-08", deadline: "2026-11-07T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 21, name: "GP de São Paulo (Brasil)", date: "2026-11-22", deadline: "2026-11-21T20:00", isBrazil: true, status: 'pending', startingGrid: [] },
  { id: 22, name: "GP de Las Vegas (EUA)", date: "2026-11-28", deadline: "2026-11-27T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 23, name: "GP do Catar (Lusail)", date: "2026-12-06", deadline: "2026-12-05T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
  { id: 24, name: "GP de Abu Dhabi (Yas Marina)", date: "2026-12-13", deadline: "2026-12-12T20:00", isBrazil: false, status: 'pending', startingGrid: [] },
];

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS_SYSTEM_BRAZIL = [50, 36, 30, 24, 20, 16, 12, 8, 4, 2];

// Componentes UI
const PrintStyles = () => (
  <style>{`@media print { body * { visibility: hidden; } .printable-area, .printable-area * { visibility: visible; color: black !important; } .printable-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; } .no-print { display: none !important; } }`}</style>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return alert("Senhas não conferem.");
    if (formData.password.length < 3) return alert("Senha muito curta.");
    onRegister(formData);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative" style={{
        backgroundImage: `url('${BACKGROUND_IMAGE}')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="w-full max-w-md bg-gray-900/90 p-8 rounded-xl shadow-2xl border border-gray-700 relative z-10">
        <div className="flex flex-col items-center mb-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" alt="F1 Logo" className="h-12 mb-2 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(5946%) hue-rotate(356deg) brightness(93%) contrast(114%)" }} />
            <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">F1 BOLÃO '26</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome Completo" className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
          <input type="email" placeholder="E-mail" className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:outline-none" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Senha" 
              className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white placeholder-gray-400 pr-10 focus:ring-2 focus:ring-red-600 focus:outline-none" 
              required 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input 
              type={showConfirm ? "text" : "password"} 
              placeholder="Confirmar Senha" 
              className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white placeholder-gray-400 pr-10 focus:ring-2 focus:ring-red-600 focus:outline-none" 
              required 
              value={formData.confirm} 
              onChange={e => setFormData({...formData, confirm: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition shadow-lg transform active:scale-95">CADASTRAR</button>
        </form>
        <button onClick={onBack} className="w-full text-center mt-6 text-sm text-gray-400 hover:text-white underline transition">Voltar para Login</button>
      </div>
    </div>
  );
};

// --- FUNÇÃO AUXILIAR FINANCEIRA ---
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// --- APP PRINCIPAL ---
export default function App() {
  if (initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Erro de Configuração</h2>
          <p className="text-sm opacity-80">{initError}</p>
        </div>
      </div>
    );
  }

  const [userAuth, setUserAuth] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState({});
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState('login');
  const [adminTab, setAdminTab] = useState('results');
  const [selectedRaceId, setSelectedRaceId] = useState(1);
  const [adminRaceId, setAdminRaceId] = useState(1);
  const [conferenceRaceId, setConferenceRaceId] = useState(1);
  const [showChampionModal, setShowChampionModal] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [config, setConfig] = useState({ drivers: INITIAL_DRIVERS, races: INITIAL_RACES, officialChampion: null, financial: { entryFee: 300, mainPrizeDeduction: 240, perUserPoints: 10 } });
  const [adminResult, setAdminResult] = useState({ top10: Array(10).fill(""), driverOfDay: "" });
  const [newDriverName, setNewDriverName] = useState("");
  const [editingRace, setEditingRace] = useState(null);
  const [authError, setAuthError] = useState("");
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [dbError, setDbError] = useState(false);
  // Estado para indicar se os dados foram carregados
  const [isLoading, setIsLoading] = useState(true);
  const [hasAutoSelectedRace, setHasAutoSelectedRace] = useState(false); // Flag para seleção automática única
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const initAuth = async () => { 
      try { 
        if (!auth.currentUser) await signInAnonymously(auth); 
      } catch (e) { 
        console.error("Erro Auth:", e); 
        if(e.code === 'auth/admin-restricted-operation') {
            setAuthError("ERRO: Ative o Login Anônimo no Firebase Console (Authentication > Sign-in method).");
        }
      } 
    };
    initAuth();
    return onAuthStateChanged(auth, setUserAuth);
  }, []);

  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem('bolao_f1_user_id');
      if (savedUserId && users.length > 0 && !currentUser) {
        const found = users.find(u => u.id === savedUserId);
        if (found) { setCurrentUser(found); setActiveTab(found.isAdmin ? 'admin' : 'dashboard'); }
      }
    } catch(e) { console.log("Localstorage error"); }
  }, [users, currentUser]);

  useEffect(() => {
    if (!userAuth || !db) return;
    try {
      const errorHandler = (error) => {
        if (error.code === 'permission-denied') setDbError(true);
      };

      const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => { 
          setDbError(false); 
          const loadedUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setUsers(loadedUsers);
          setIsLoading(false); // Dados carregados!
      }, errorHandler);
      
      const unsubBets = onSnapshot(collection(db, 'bets'), (snap) => { const b = {}; snap.docs.forEach(d => b[d.id] = d.data()); setBets(b); }, errorHandler);
      const unsubResults = onSnapshot(collection(db, 'results'), (snap) => { const r = {}; snap.docs.forEach(d => r[d.id] = d.data()); setResults(r); }, errorHandler);
      const unsubConfig = onSnapshot(doc(db, 'config', 'main'), (snap) => {
        if (snap.exists()) setConfig(snap.data());
        else setDoc(doc(db, 'config', 'main'), { ...config, races: INITIAL_RACES }).catch(e => console.log("Init config error"));
      }, errorHandler);
      return () => { unsubUsers(); unsubBets(); unsubResults(); unsubConfig(); };
    } catch (e) { console.error("Erro dados:", e); }
  }, [userAuth]);

  // SELEÇÃO AUTOMÁTICA DA PRÓXIMA CORRIDA (APENAS UMA VEZ)
  useEffect(() => {
    if (hasAutoSelectedRace || config.races.length === 0) return;

    const sortedRaces = [...config.races].sort((a, b) => new Date(a.date) - new Date(b.date));
    const now = new Date();

    const nextRace = sortedRaces.find(r => {
        const raceDate = new Date(r.date);
        raceDate.setHours(23, 59, 59); // Considera até o final do dia da corrida
        return raceDate >= now;
    });

    if (nextRace) {
        setSelectedRaceId(nextRace.id);
        setAdminRaceId(nextRace.id); // Sincroniza admin também
    } else {
        const lastRace = sortedRaces[sortedRaces.length - 1];
        if (lastRace) {
            setSelectedRaceId(lastRace.id);
            setAdminRaceId(lastRace.id);
        }
    }
    setHasAutoSelectedRace(true); 
  }, [config.races, hasAutoSelectedRace]);


  useEffect(() => {
    if (currentUser && !currentUser.championGuess && !currentUser.isAdmin) {
      if (new Date() < new Date("2026-03-04T23:59:59")) setShowChampionModal(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'admin' && adminTab === 'results') {
      const existing = results[adminRaceId];
      if (existing) setAdminResult(existing);
      else setAdminResult({ top10: Array(10).fill(""), driverOfDay: "" });
      setShowDeleteConfirm(false);
    }
  }, [adminRaceId, activeTab, adminTab, results]);

  // --- CÁLCULOS FINANCEIROS ---
  const financialData = useMemo(() => {
    const payingUsers = users.filter(u => u.paymentConfirmed && !u.isAdmin);
    const count = payingUsers.length;
    const totalCollected = payingUsers.reduce((acc, u) => acc + (300 - (u.discount || 0)), 0);
    const finalPrizePool = count * 240; 
    const lastRaceReserve = 300; 
    const remainingForStages = totalCollected - finalPrizePool - lastRaceReserve;
    const prizePerStage = count > 0 ? Math.floor(remainingForStages / 23) : 0; 

    return { count, totalCollected, finalPrizePool, lastRaceReserve, prizePerStage };
  }, [users]);

  // ALGORITMO DE DESEMPATE DA ETAPA
  const calculateStageWinner = (currentRaceId, currentResults, allBets, allUsers) => {
    const sortedRaces = [...config.races].sort((a, b) => new Date(a.date) - new Date(b.date));
    const currentIndex = sortedRaces.findIndex(r => r.id === currentRaceId);
    const prevRace = currentIndex > 0 ? sortedRaces[currentIndex - 1] : null;
    const currentRace = config.races.find(r => r.id === currentRaceId);

    const raceBets = allUsers
        .filter(u => !u.isAdmin)
        .map(u => {
            let effectiveBet = null;
            let streak = 0;
            let lastBet = null;

            for (const r of sortedRaces) {
                const realBet = allBets[`${r.id}_${u.id}`];
                let currentRaceBet = realBet;

                if (!realBet) {
                    streak++;
                    if (streak === 1) {
                        if (lastBet) currentRaceBet = lastBet;
                        else if (r.startingGrid && r.startingGrid.length > 0) {
                            currentRaceBet = { top10: r.startingGrid, driverOfDay: r.startingGrid[0] };
                        } else {
                            currentRaceBet = null;
                        }
                    } else {
                        currentRaceBet = null;
                    }
                } else {
                    streak = 0;
                    lastBet = realBet;
                }
                
                if (r.id === currentRaceId) {
                    effectiveBet = currentRaceBet;
                    break;
                }
            }

            if (!effectiveBet) return { userId: u.id, name: u.name, points: 0, matches: [], bet: null };

            let points = 0;
            const matches = []; 
            if (currentResults) {
                const table = sortedRaces.find(r=>r.id===currentRaceId)?.isBrazil ? POINTS_SYSTEM_BRAZIL : POINTS_SYSTEM;
                const consolation = sortedRaces.find(r=>r.id===currentRaceId)?.isBrazil ? 2 : 1;
                
                effectiveBet.top10.forEach((d, i) => {
                    const pos = currentResults.top10.indexOf(d);
                    if (pos === i) { points += table[i]; matches.push(i); } 
                    else if (pos !== -1) points += consolation;
                });
                if (effectiveBet.driverOfDay === currentResults.driverOfDay) points += 5;
            }
            return { userId: u.id, name: u.name, points, matches, bet: effectiveBet };
        });

    if (raceBets.length === 0) return [];

    const maxPoints = Math.max(...raceBets.map(r => r.points));
    if (maxPoints === 0) return []; 
    let candidates = raceBets.filter(r => r.points === maxPoints);

    if (candidates.length === 1) return candidates;

    for (let i = 0; i < 10; i++) {
        const withPos = candidates.filter(c => c.matches.includes(i));
        if (withPos.length > 0 && withPos.length < candidates.length) {
             candidates = withPos; 
        }
        if (candidates.length === 1) return candidates;
    }

    const withDoD = candidates.filter(c => c.bet?.driverOfDay === currentResults.driverOfDay);
    if (withDoD.length > 0 && withDoD.length < candidates.length) {
        return withDoD;
    }

    return candidates;
  };

  const processRecalculation = async (latestResults, specificRaceId) => {
    if (!users.length) return;
    const batch = writeBatch(db);
    const sortedRaces = [...config.races].sort((a, b) => new Date(a.date) - new Date(b.date));
    const finishedRaces = sortedRaces.filter(r => latestResults[r.id]);

    const winnersMap = {}; 
    finishedRaces.forEach(r => {
        if (r.id !== 24) { 
            const winners = calculateStageWinner(r.id, latestResults[r.id], bets, users);
            winnersMap[r.id] = winners.map(w => w.userId);
            const resRef = doc(db, 'results', r.id.toString());
            batch.update(resRef, { financialWinners: winnersMap[r.id] });
        }
    });

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
    // Tratamento de espaços e case sensitive
    const safeEmail = email.toLowerCase().trim();
    const safePass = pass.trim();

    const found = users.find(u => u.email.toLowerCase() === safeEmail);
    if (found && found.password === safePass) {
      if (!found.isAdmin && !found.paymentConfirmed) return setLoginError("Aguarde aprovação do Admin.");
      localStorage.setItem('bolao_f1_user_id', found.id);
      setCurrentUser(found);
      setActiveTab(found.isAdmin ? 'admin' : 'dashboard');
      setLoginError("");
    } else {
       if (users.length === 0) setLoginError("Nenhum usuário encontrado. Verifique a conexão ou crie uma conta.");
       else setLoginError("E-mail ou senha inválidos.");
    }
  };

  const logout = () => { localStorage.removeItem('bolao_f1_user_id'); setCurrentUser(null); setActiveTab('login'); };

  const register = async (data) => {
    const id = data.email.replace(/\./g, '_');
    const userDocRef = doc(db, 'users', id);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) return alert("Já existe uma conta com este e-mail.");

    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(query(usersCollection, limit(1)));
    const isFirstUser = usersSnapshot.empty;
    
    const newUser = { ...data, id, isAdmin: isFirstUser, points: 0, championGuess: "", paymentConfirmed: isFirstUser, discount: 0 };

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

  const autoSaveBet = async (top10, driverOfDay) => {
    if (!currentUser) return;
    const race = config.races.find(r => r.id === selectedRaceId);
    if (new Date() > new Date(race.deadline)) { setSaveStatus('error'); return; }
    setSaveStatus('saving');
    try { await setDoc(doc(db, 'bets', `${selectedRaceId}_${currentUser.id}`), { top10, driverOfDay, timestamp: new Date().toISOString() }); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 2000); } catch (e) { console.error("Erro autosave:", e); setSaveStatus('error'); }
  };

  const togglePayment = async (id, currentStatus) => {
    try { await updateDoc(doc(db, 'users', id), { paymentConfirmed: !currentStatus }); } 
    catch (e) { alert("Erro ao atualizar pagamento: " + e.message); }
  };

  const deleteUserDoc = async (id) => {
    if (window.confirm("Remover este membro permanentemente?")) {
        try { await deleteDoc(doc(db, 'users', id)); } catch (e) { alert("Erro ao deletar: " + e.message); }
    }
  };
  
  const updateDiscount = async (id, val) => {
    try { await updateDoc(doc(db, 'users', id), { discount: Number(val) }); }
    catch (e) { console.error(e); }
  };

  const saveRaceResult = async () => {
    if (adminResult.top10.some(d => d === "")) return alert("Preencha todos!");
    try {
      await setDoc(doc(db, 'results', adminRaceId.toString()), adminResult);
      const newRaces = config.races.map(r => r.id === adminRaceId ? { ...r, status: 'finished' } : r);
      await updateDoc(doc(db, 'config', 'main'), { races: newRaces });
      // Passa ID para forçar calculo de vencedor da etapa
      await processRecalculation({ ...results, [adminRaceId]: adminResult }, adminRaceId);
      alert("Resultado salvo, pontos e prêmios calculados!");
    } catch (e) { alert("Erro: " + e.message); }
  };

  const deleteRaceResult = async () => {
    try {
      await deleteDoc(doc(db, 'results', adminRaceId.toString()));
      const newRaces = config.races.map(r => r.id === adminRaceId ? { ...r, status: 'pending' } : r);
      await updateDoc(doc(db, 'config', 'main'), { races: newRaces });
      const updatedResults = { ...results };
      delete updatedResults[adminRaceId];
      await processRecalculation(updatedResults, adminRaceId);
      setAdminResult({ top10: Array(10).fill(""), driverOfDay: "" });
      setShowDeleteConfirm(false);
      alert("Resultado da etapa cancelado e pontos recalculados com sucesso!");
    } catch (e) { alert("Erro ao cancelar resultado: " + e.message); }
  };

  const updateRaceConfig = async (race) => {
    const updatedRaces = config.races.map(r => r.id === race.id ? race : r);
    await updateDoc(doc(db, 'config', 'main'), { races: updatedRaces });
    setEditingRace(null);
  };

  const resetCalendar = async () => {
    if (window.confirm("Isso vai substituir todas as corridas no banco de dados pelo calendário oficial de 2026. Deseja continuar?")) {
        try {
            await updateDoc(doc(db, 'config', 'main'), { races: INITIAL_RACES });
            alert("Calendário atualizado com sucesso!");
            window.location.reload();
        } catch (e) { alert("Erro ao atualizar: " + e.message); }
    }
  };

  const handlePrintAudit = () => { window.print(); };

  if (authError) return <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-6"><div className="bg-white text-red-900 p-8 rounded-xl shadow-2xl max-w-md text-center"><AlertTriangle size={48} className="mx-auto mb-4" /><h2 className="text-2xl font-bold mb-2">Erro de Configuração</h2><p className="font-medium whitespace-pre-line">{authError}</p></div></div>;

  if (dbError) return <div className="min-h-screen bg-orange-900 text-white flex items-center justify-center p-6"><div className="bg-white text-orange-900 p-8 rounded-xl shadow-2xl max-w-md text-center"><AlertTriangle size={48} className="mx-auto mb-4 text-orange-600" /><h2 className="text-2xl font-bold mb-4">Bloqueio de Segurança</h2><p className="mb-4">O banco de dados está bloqueado. Verifique as regras no Firebase.</p><button onClick={() => window.location.reload()} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Tentar novamente</button></div></div>;

  if (activeTab === 'login') return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative" style={{
        backgroundImage: `url('${BACKGROUND_IMAGE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="w-full max-w-md bg-gray-900/90 p-8 rounded-xl shadow-2xl border border-gray-700 relative z-10">
        <div className="flex flex-col items-center mb-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" alt="F1 Logo" className="h-12 mb-2 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(5946%) hue-rotate(356deg) brightness(93%) contrast(114%)" }} />
            <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">F1 BOLÃO '26</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); login(e.target[0].value, e.target[1].value); }} className="space-y-5">
          <input type="email" placeholder="E-mail" className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:outline-none" />
          <div className="relative">
            <input 
              type={showLoginPassword ? "text" : "password"} 
              placeholder="Senha" 
              className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white placeholder-gray-400 pr-10 focus:ring-2 focus:ring-red-600 focus:outline-none" 
            />
            <button 
              type="button" 
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {loginError && <div className="text-red-400 text-xs text-center font-bold">{loginError}</div>}
          
          <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 rounded transition shadow-lg transform active:scale-95 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
              {isLoading ? 'CARREGANDO SISTEMA...' : 'ENTRAR'}
          </button>
        </form>
        <button onClick={() => setActiveTab('register')} className="mt-6 w-full text-center text-sm text-gray-400 hover:text-white underline transition">Criar Conta</button>
      </div>
    </div>
  );

  if (activeTab === 'register') return <RegisterScreen onRegister={register} onBack={() => setActiveTab('login')}/>;

  const race = config.races.find(r => r.id === selectedRaceId);
  const isLocked = new Date() > new Date(race.deadline);
  
  const getDisplayBet = () => {
    const realBet = bets[`${selectedRaceId}_${currentUser?.id}`];
    if (realBet) return { bet: realBet, isAuto: false, reason: null };
    if (isLocked) {
      const sortedRaces = [...config.races].sort((a, b) => new Date(a.date) - new Date(b.date));
      const currentIndex = sortedRaces.findIndex(r => r.id === selectedRaceId);
      if (currentIndex > 0) {
        const prevRace = sortedRaces[currentIndex - 1];
        const prevBet = bets[`${prevRace.id}_${currentUser?.id}`];
        if (prevBet) return { bet: prevBet, isAuto: true, reason: `Repetida de ${prevRace.name}` };
      }
      if (race.startingGrid && race.startingGrid.length > 0) {
         return { bet: { top10: race.startingGrid, driverOfDay: race.startingGrid[0] }, isAuto: true, reason: "Automática via Grid" };
      }
    }
    return { bet: { top10: Array(10).fill(""), driverOfDay: "" }, isAuto: false, reason: null };
  };

  const { bet: currentBet, isAuto: isAutoBet, reason: autoReason } = getDisplayBet();

  // CALCULO PONTOS ETAPA (VISUAL)
  let totalRacePoints = 0;
  if(results[race.id]) {
      const officialResult = results[race.id];
      const table = race.isBrazil ? POINTS_SYSTEM_BRAZIL : POINTS_SYSTEM;
      const consolation = race.isBrazil ? 2 : 1;
      currentBet.top10.forEach((d, i) => { if(d) { const pos = officialResult.top10.indexOf(d); if(pos === i) totalRacePoints += table[i]; else if(pos !== -1) totalRacePoints += consolation; } });
      if(currentBet.driverOfDay && currentBet.driverOfDay === officialResult.driverOfDay) totalRacePoints += 5;
  }
  
  const isStageWinner = results[race.id]?.financialWinners?.includes(currentUser.id);

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      <PrintStyles />
      {showChampionModal && <ChampionModal drivers={config.drivers} currentGuess={currentUser.championGuess} onClose={() => setShowChampionModal(false)} onSubmit={async (d) => { try { await updateDoc(doc(db, 'users', currentUser.id), { championGuess: d }); setCurrentUser({...currentUser, championGuess: d}); setShowChampionModal(false); } catch(e) { alert("Erro: " + e.message); }}} />}

      <header className="bg-red-600 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className={`mx-auto flex justify-between items-center ${activeTab === 'conference' ? 'max-w-[98%]' : 'max-w-4xl'}`}>
          <h1 className="font-black italic text-xl tracking-tighter uppercase">F1 BOLÃO '26</h1>
          <button onClick={logout} className="bg-red-800 text-xs px-3 py-1 rounded font-bold uppercase hover:bg-red-900 transition flex items-center gap-2"><LogOut size={16}/> Sair</button>
        </div>
      </header>

      <main className={`mx-auto p-4 space-y-6 ${activeTab === 'conference' ? 'max-w-[98%]' : 'max-w-4xl'}`}>
        {activeTab === 'dashboard' && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-full"><Trophy className="text-yellow-600" size={24} /></div>
                <div><h3 className="font-bold text-gray-800 uppercase italic text-sm">Palpite do Campeão</h3><p className="text-xs text-gray-500">{currentUser.championGuess ? <span className="font-black text-gray-900">{currentUser.championGuess}</span> : "Quem vence a temporada?"}</p></div>
              </div>
              <button onClick={() => setShowChampionModal(true)} className="text-xs font-bold uppercase py-2 px-4 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg">{currentUser.championGuess ? "Alterar" : "Definir"}</button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-600">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2 uppercase italic leading-none text-gray-900"><Flag className="text-red-600" size={24}/> {race?.name}</h2>
                  <p className="text-xs text-gray-400 mt-1 font-bold">{new Date(race?.date).toLocaleDateString()} {race?.isBrazil && '🇧🇷 DOBRADO'}</p>
                  {isLocked ? (
                    <div className="mt-2"><p className="text-xs font-bold text-red-600 flex items-center gap-1"><Lock size={12}/> Apostas Encerradas</p>{isAutoBet && (<div className="mt-2 bg-yellow-100 text-yellow-800 p-3 rounded-lg border-l-4 border-yellow-500 flex items-center gap-2 shadow-sm"><RefreshCw size={20} className="shrink-0" /><div><p className="font-bold text-sm uppercase">Preenchimento Automático</p><p className="text-xs">{autoReason}</p></div></div>)}</div>
                  ) : (
                    <div className="flex items-center gap-3 mt-1"><p className="text-xs font-bold text-green-600 flex items-center gap-1"><Clock size={12}/> Aberto até {new Date(race.deadline).toLocaleString()}</p>{saveStatus === 'saving' && <span className="text-xs font-bold text-blue-500 animate-pulse flex items-center gap-1"><Save size={12}/> Salvando...</span>}{saveStatus === 'success' && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> Salvo</span>}{saveStatus === 'error' && <span className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> Erro ao salvar</span>}</div>
                  )}
                </div>
                <select className="p-2 border rounded font-bold text-sm bg-gray-50 text-gray-900" value={selectedRaceId} onChange={e => setSelectedRaceId(Number(e.target.value))}>{config.races.map(r => <option key={r.id} value={r.id}>{r.name} {results[r.id] ? '🏁' : ''}</option>)}</select>
              </div>

              {results[race.id] ? (
                  <div className="space-y-6">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center mb-6"><h3 className="font-bold text-green-800 uppercase">Etapa Finalizada</h3><p className="text-xs text-green-600">Confira sua pontuação abaixo</p><p className="text-2xl font-black text-green-900 mt-2">{totalRacePoints} Pontos</p>
                          {isStageWinner && (<div className="mt-4 bg-yellow-100 text-yellow-900 p-3 rounded-lg border border-yellow-300 font-bold flex flex-col items-center animate-bounce shadow-lg"><span className="flex items-center gap-2 uppercase text-sm"><Trophy size={18}/> Vencedor da Etapa!</span><span className="text-lg">Prêmio: {formatCurrency(financialData.prizePerStage)}</span></div>)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3"><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Seu Top 10</h3>
                            {Array(10).fill(0).map((_, i) => {
                                const driver = currentBet.top10[i]; const officialResult = results[race.id]; let points = 0; let style = "bg-gray-100 text-gray-400";
                                if (driver) { const officialPos = officialResult.top10.indexOf(driver); const table = race.isBrazil ? POINTS_SYSTEM_BRAZIL : POINTS_SYSTEM; const consolation = race.isBrazil ? 2 : 1;
                                    if (officialPos === i) { points = table[i]; style = "bg-green-100 text-green-700 border-green-300 font-bold"; } else if (officialPos !== -1) { points = consolation; style = "bg-yellow-50 text-yellow-700 border-yellow-200"; } }
                                return (<div key={i} className="flex items-center gap-3"><span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${i < 3 ? 'bg-yellow-500' : 'bg-gray-400'}`}>{i+1}º</span><div className="flex-1 flex items-center gap-2"><div className={`flex-1 p-2 border rounded-lg text-sm font-medium ${driver ? 'bg-white' : 'bg-gray-50'}`}>{driver || "-"}</div><div className={`px-3 py-2 rounded-lg border text-xs min-w-[3rem] text-center ${style}`}>+{points}</div></div></div>);
                            })}
                        </div>
                        <div className="space-y-6"><div className="bg-gray-50 p-5 rounded-xl border"><h3 className="text-xs font-black text-gray-400 uppercase mb-3">Piloto do Dia</h3><div className="flex items-center gap-2"><div className={`flex-1 p-3 border rounded-lg font-bold ${currentBet.driverOfDay ? 'bg-white' : 'bg-gray-50'}`}>{currentBet.driverOfDay || "-"}</div><div className={`px-3 py-3 rounded-lg border text-xs min-w-[3rem] text-center font-bold ${currentBet.driverOfDay && currentBet.driverOfDay === results[race.id].driverOfDay ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-400"}`}>+{currentBet.driverOfDay === results[race.id].driverOfDay ? 5 : 0}</div></div></div></div>
                      </div>
                  </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${isLocked ? 'opacity-75 pointer-events-none' : ''}`}>
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Seu Top 10 {isAutoBet && <span className="ml-2 text-yellow-600 font-normal normal-case">(Auto)</span>}</h3>
                    {Array(10).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-3"><span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${i < 3 ? 'bg-yellow-500' : 'bg-gray-400'}`}>{i+1}º</span><select className="flex-1 p-2 border rounded-lg bg-white text-gray-900 text-sm font-medium" value={currentBet.top10[i]} onChange={(e) => { const nt = [...currentBet.top10]; nt[i] = e.target.value; autoSaveBet(nt, currentBet.driverOfDay); }}><option value="">Piloto...</option>{config.drivers.filter(d => !currentBet.top10.includes(d) || currentBet.top10[i] === d).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    ))}
                  </div>
                  <div className="space-y-6"><div className="bg-gray-50 p-5 rounded-xl border"><h3 className="text-xs font-black text-gray-400 uppercase mb-3">Piloto do Dia</h3><select className="w-full p-3 border rounded-lg font-bold text-red-600 bg-white" value={currentBet.driverOfDay} onChange={(e) => autoSaveBet(currentBet.top10, e.target.value)}><option value="">Selecione...</option>{config.drivers.map(d => <option key={d} value={d}>{d}</option>)}</select></div></div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-6 printable-area">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg border border-gray-200"><h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2 border-b border-green-500 pb-2"><Banknote/> Premiação Total (Estimada)</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"><div><p className="text-xs opacity-75 uppercase">1º Lugar (50%)</p><p className="font-black text-xl">{formatCurrency(financialData.finalPrizePool * 0.50)}</p></div><div><p className="text-xs opacity-75 uppercase">2º Lugar (30%)</p><p className="font-black text-xl">{formatCurrency(financialData.finalPrizePool * 0.30)}</p></div><div><p className="text-xs opacity-75 uppercase">3º Lugar (15%)</p><p className="font-black text-xl">{formatCurrency(financialData.finalPrizePool * 0.15)}</p></div><div><p className="text-xs opacity-75 uppercase">4º Lugar (5%)</p><p className="font-black text-xl">{formatCurrency(financialData.finalPrizePool * 0.05)}</p></div></div><div className="mt-4 pt-4 border-t border-green-500 flex justify-between text-xs font-bold"><span>Prêmio por Etapa: {formatCurrency(financialData.prizePerStage)}</span><span>Última Etapa (Vencedor): {formatCurrency(financialData.lastRaceReserve)}</span></div></div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-red-600 p-5 text-white flex justify-between items-center"><h2 className="text-xl font-black italic flex items-center gap-2 uppercase tracking-tighter"><Trophy size={20}/> Classificação</h2><button onClick={() => window.print()} className="p-2 hover:bg-red-700 rounded transition no-print"><Printer size={20}/></button></div>
                <table className="w-full text-left"><thead><tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b"><th className="p-4">Pos</th><th className="p-4">Nome</th><th className="p-4 text-right pr-6">Pts</th></tr></thead><tbody className="divide-y">{[...users].filter(u => !u.isAdmin).sort((a,b) => (Number(b.points) || 0) - (Number(a.points) || 0)).map((u, i) => (<tr key={u.id} className={u.id === currentUser?.id ? 'bg-yellow-50' : ''}><td className="p-4 text-center font-black text-gray-400">{i+1}º</td><td className="p-4 font-black text-gray-800 uppercase italic text-sm">{u.name}</td><td className="p-4 text-right font-black text-2xl pr-6 text-red-600">{(u.points || 0).toString()}</td></tr>))}</tbody></table>
            </div>
          </div>
        )}

        {activeTab === 'conference' && (
            <div className="bg-white p-6 rounded-xl shadow-md printable-area">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 no-print"><h2 className="text-xl font-black uppercase italic text-gray-800 flex items-center gap-2"><FileText/> Conferência</h2><div className="flex gap-2 items-center"><select className="p-2 border rounded font-bold text-xs bg-gray-50" value={conferenceRaceId} onChange={e => setConferenceRaceId(Number(e.target.value))}>{config.races.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select><button onClick={handlePrintAudit} className="bg-blue-600 text-white px-3 py-2 rounded font-bold text-xs hover:bg-blue-700 flex items-center gap-2"><Printer size={16}/> Imprimir</button></div></div>
                <div className="hidden print:block text-center mb-6"><h1 className="text-2xl font-black uppercase">F1 Bolão '26 - Relatório de Palpites</h1><p className="text-gray-600">{config.races.find(r => r.id === conferenceRaceId)?.name}</p></div>
                <div className="overflow-x-auto"><table className="w-full text-xs text-left border-collapse"><thead><tr className="bg-gray-100 border-b-2 border-gray-300"><th className="p-2 border">Partic.</th>{Array(10).fill(0).map((_, i) => <th key={i} className="p-2 border text-center">{i+1}º</th>)}<th className="p-2 border text-center bg-yellow-50">Piloto Dia</th></tr></thead><tbody>{users.filter(u => !u.isAdmin).sort((a,b) => a.name.localeCompare(b.name)).map(u => { const bet = bets[`${conferenceRaceId}_${u.id}`]; let displayBet = bet; if (!displayBet) { const race = config.races.find(r => r.id === conferenceRaceId); if (new Date() > new Date(race.deadline)) { const sortedRaces = [...config.races].sort((a, b) => new Date(a.date) - new Date(b.date)); const currentIndex = sortedRaces.findIndex(r => r.id === conferenceRaceId); if (currentIndex > 0) { const prevRace = sortedRaces[currentIndex - 1]; displayBet = bets[`${prevRace.id}_${u.id}`]; } else if (race.startingGrid?.length > 0) { displayBet = { top10: race.startingGrid, driverOfDay: race.startingGrid[0] }; } } } return (<tr key={u.id} className="border-b hover:bg-gray-50"><td className="p-2 border font-bold truncate max-w-[100px]">{u.name}</td>{Array(10).fill(0).map((_, i) => (<td key={i} className="p-2 border text-center truncate max-w-[60px]">{displayBet?.top10[i] ? config.drivers.find(d => d === displayBet.top10[i])?.split(' ').pop().substring(0,3).toUpperCase() : "-"}</td>))}<td className="p-2 border text-center bg-yellow-50 font-bold truncate max-w-[60px]">{displayBet?.driverOfDay ? displayBet.driverOfDay.split(' ').pop().substring(0,3).toUpperCase() : "-"}</td></tr>) })}</tbody></table></div>
            </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6 no-print">
            <div className="flex bg-white rounded-lg shadow-sm p-1 gap-1">
              {['results', 'members', 'settings', 'finance'].map(t => (
                <button key={t} onClick={() => setAdminTab(t)} className={`flex-1 py-2 text-xs font-black uppercase rounded ${adminTab === t ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>{t === 'results' ? 'Resultados' : t === 'members' ? 'Membros' : t === 'finance' ? 'Financeiro' : 'Configurações'}</button>
              ))}
            </div>

            {/* ... ABAS EXISTENTES (RESULTADOS, MEMBROS, CONFIG, AUDIT) ... */}
            {adminTab === 'results' && (
              <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-600">
                <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black uppercase italic text-gray-800 flex items-center gap-2"><Calculator/> Lançar Resultado</h2><div className="text-right"><p className="text-xs font-bold text-gray-500">Status: {race.status === 'finished' ? 'Finalizada' : 'Aberta'}</p></div></div>
                <div className="mb-4 bg-gray-100 p-2 rounded flex justify-between items-center"><span className="text-xs font-bold text-gray-600">Selecione:</span><select className="p-1 text-xs border rounded bg-white" value={adminRaceId} onChange={e => setAdminRaceId(Number(e.target.value))}>{config.races.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">{adminResult.top10.map((d, i) => (<select key={i} className="w-full p-2 border rounded-lg text-xs font-bold text-gray-900" value={d} onChange={e => { const nt = [...adminResult.top10]; nt[i] = e.target.value; setAdminResult({...adminResult, top10: nt}); }}><option value="">{i+1}º Lugar...</option>{config.drivers.filter(drv => !adminResult.top10.includes(drv) || adminResult.top10[i] === drv).map(drv => <option key={drv} value={drv}>{drv}</option>)}</select>))}</div>
                  <div className="space-y-4">
                    <select className="w-full p-2 border rounded-lg font-bold text-gray-900" value={adminResult.driverOfDay} onChange={e => setAdminResult({...adminResult, driverOfDay: e.target.value})}><option value="">Piloto do Dia...</option>{config.drivers.map(drv => <option key={drv} value={drv}>{drv}</option>)}</select>
                    <div className="flex flex-col gap-2">
                      <button onClick={saveRaceResult} className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-red-700 transition uppercase tracking-widest">{config.races.find(r => r.id === adminRaceId)?.status === 'finished' ? 'ATUALIZAR RESULTADO OFICIAL' : 'FINALIZAR ETAPA'}</button>
                      {config.races.find(r => r.id === adminRaceId)?.status === 'finished' && (
                        !showDeleteConfirm ? (
                          <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-white text-red-600 border-2 border-red-100 font-bold py-3 rounded-xl hover:bg-red-50 transition uppercase text-xs flex items-center justify-center gap-2"><Trash2 size={16}/> Cancelar Resultado Desta Etapa</button>
                        ) : (
                          <div className="p-3 border-2 border-red-500 bg-red-50 rounded-xl space-y-3">
                            <p className="text-[11px] text-red-800 font-bold text-center leading-tight uppercase">ATENÇÃO: Os pontos desta etapa serão removidos. Palpites mantidos.</p>
                            <div className="flex gap-2">
                              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg text-[10px] hover:bg-gray-100 uppercase">Cancelar</button>
                              <button onClick={deleteRaceResult} className="flex-1 bg-red-600 text-white font-black py-2 rounded-lg text-[10px] hover:bg-red-700 uppercase shadow-md">Confirmar Ação</button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'members' && (
               <div className="bg-white p-6 rounded-xl shadow-md">
                 {/* ... TABELA DE MEMBROS EXISTENTE ... */}
                 <h2 className="text-lg font-black uppercase text-gray-500 mb-4 flex items-center gap-2"><Users size={18}/> Gestão de Membros</h2>
                 <div className="space-y-3">
                   {users.filter(u => !u.isAdmin).map(u => (
                     <div key={u.id} className="flex justify-between items-center p-4 border rounded-xl">
                       <div className="flex flex-col">
                          <span className="font-black text-gray-800 uppercase italic text-sm">{u.name}</span>
                          <span className="text-[10px] text-gray-400">Desc. Indicação: {formatCurrency(u.discount || 0)}</span>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => togglePayment(u.id, u.paymentConfirmed)} className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase cursor-pointer hover:opacity-80 active:scale-95 transition-all ${u.paymentConfirmed ? 'bg-green-100 text-green-700' : 'bg-red-500 text-white'}`}>{u.paymentConfirmed ? 'Pago' : 'Pendente'}</button>
                         <button onClick={() => deleteUserDoc(u.id)} className="text-gray-300 hover:text-red-600"><Trash2 size={20}/></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {adminTab === 'finance' && (
                <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
                    <h2 className="text-xl font-black uppercase italic text-green-800 flex items-center gap-2"><DollarSign/> Gestão Financeira</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600 uppercase font-bold">Total Arrecadado</p>
                            <p className="text-2xl font-black text-green-900">{formatCurrency(financialData.totalCollected)}</p>
                            <p className="text-[10px] text-gray-500">{financialData.count} pagantes</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 uppercase font-bold">Pote Final (Campeão)</p>
                            <p className="text-2xl font-black text-blue-900">{formatCurrency(financialData.finalPrizePool)}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 uppercase font-bold">Prêmio por Etapa</p>
                            <p className="text-2xl font-black text-purple-900">{formatCurrency(financialData.prizePerStage)}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <p className="text-xs text-yellow-600 uppercase font-bold">Reserva Última Etapa</p>
                            <p className="text-2xl font-black text-yellow-900">{formatCurrency(financialData.lastRaceReserve)}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Lançar Descontos de Indicação</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {users.filter(u => !u.isAdmin).map(u => (
                                <div key={u.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                                    <span className="text-sm font-bold">{u.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Desconto R$:</span>
                                        <input 
                                            type="number" 
                                            className="border rounded p-1 w-20 text-sm" 
                                            value={u.discount || 0} 
                                            onChange={(e) => updateDiscount(u.id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* MANTER SETTINGS E AUDIT COMO ESTAVAM */}
            {adminTab === 'settings' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500"><h2 className="text-lg font-black uppercase text-red-700 mb-4 flex items-center gap-2"><RefreshCw size={18}/> Reset de Emergência</h2><p className="text-xs text-gray-500 mb-4">Use APENAS para corrigir ordem das corridas.</p><button onClick={resetCalendar} className="bg-red-600 text-white px-4 py-3 rounded font-black uppercase hover:bg-red-700 shadow-md w-full">RESTAURAR CALENDÁRIO OFICIAL (2026)</button></div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500"><h2 className="text-lg font-black uppercase text-yellow-700 mb-4 flex items-center gap-2"><Trophy size={18}/> Finalizar Temporada</h2><div className="flex gap-2"><select className="flex-1 border p-2 rounded text-sm font-bold" value={config.officialChampion || ""} onChange={e => setConfig({...config, officialChampion: e.target.value})}><option value="">Selecione...</option>{config.drivers.map(d => <option key={d} value={d}>{d}</option>)}</select><button onClick={async () => { if(window.confirm("Confirmar?")) { await updateDoc(doc(db, 'config', 'main'), { officialChampion: config.officialChampion }); await processRecalculation(results); alert("Feito!"); } }} className="bg-yellow-500 text-white px-4 py-2 rounded font-black uppercase hover:bg-yellow-600 shadow-md">Confirmar</button></div></div>
                    {/* ... (Gerenciar Corridas e Pilotos mantidos igual) ... */}
                    <div className="bg-white p-6 rounded-xl shadow-md"><h2 className="text-lg font-black uppercase text-gray-800 mb-4 flex items-center gap-2"><CalendarDays size={18}/> Gerenciar Corridas</h2><div className="space-y-4 max-h-[600px] overflow-y-auto">{config.races.sort((a,b) => new Date(a.date) - new Date(b.date)).map(r => (<div key={r.id} className="border p-4 rounded-lg bg-gray-50 space-y-3">{editingRace === r.id ? (<div className="space-y-3"><input className="w-full border p-2 rounded text-sm font-bold" value={r.name} onChange={e => { const nr = {...r, name: e.target.value}; setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)}); }} /><div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] font-bold text-gray-500 uppercase">Data</label><input type="date" className="w-full border p-2 rounded text-sm" value={r.date} onChange={e => { const nr = {...r, date: e.target.value}; setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)}); }} /></div><div><label className="text-[10px] font-bold text-red-500 uppercase">Limite</label><input type="datetime-local" className="w-full border p-2 rounded text-sm border-red-200" value={r.deadline} onChange={e => { const nr = {...r, deadline: e.target.value}; setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)}); }} /></div></div><div><label className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1"><AlertTriangle size={10}/> Grid (1ª Etapa)</label><div className="grid grid-cols-5 gap-1 mt-1">{Array(10).fill(0).map((_, i) => (<select key={i} className="text-[10px] border rounded p-1" value={r.startingGrid?.[i] || ""} onChange={e => { const newGrid = [...(r.startingGrid || Array(10).fill(""))]; newGrid[i] = e.target.value; const nr = {...r, startingGrid: newGrid}; setConfig({...config, races: config.races.map(x => x.id === r.id ? nr : x)}); }}><option value="">{i+1}º...</option>{config.drivers.map(d => <option key={d} value={d}>{d}</option>)}</select>))}</div></div><div className="flex justify-end gap-2"><button onClick={() => setEditingRace(null)} className="text-gray-500 text-xs font-bold uppercase px-3">Cancelar</button><button onClick={() => updateRaceConfig(r)} className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold uppercase shadow">Salvar</button></div></div>) : (<div className="flex justify-between items-center"><div><div className="font-bold text-sm text-gray-800">{r.name}</div><div className="text-xs text-gray-500">Limite: <span className="font-mono text-red-600">{new Date(r.deadline).toLocaleString()}</span></div>{r.startingGrid?.length > 0 && <div className="text-[10px] text-blue-600 mt-1">Grid cadastrado ✅</div>}</div><button onClick={() => setEditingRace(r.id)} className="text-blue-500 hover:text-blue-700 bg-white p-2 rounded border shadow-sm"><Edit size={16}/></button></div>)}</div>))}</div></div>
                    {/* --- NOVA SEÇÃO: GERENCIAR PILOTOS --- */}
                    <div className="bg-white p-6 rounded-xl shadow-md border-t-2 border-gray-100 mt-6"><h2 className="text-lg font-black uppercase text-gray-800 mb-4 flex items-center gap-2"><UserCog size={18}/> Gerenciar Pilotos</h2><div className="flex gap-2 mb-4"><input type="text" placeholder="Nome do Novo Piloto" className="flex-1 border p-2 rounded text-sm" value={newDriverName} onChange={e => setNewDriverName(e.target.value)} /><button onClick={async () => { if(newDriverName){ await updateDoc(doc(db, 'config', 'main'), { drivers: [...config.drivers, newDriverName].sort() }); setNewDriverName(""); } }} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><PlusCircle size={20}/></button></div><div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">{config.drivers.map(d => (<div key={d} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs font-bold border hover:bg-gray-100">{d}<button onClick={async () => { if(window.confirm(`Tem certeza que deseja remover ${d}?`)) await updateDoc(doc(db, 'config', 'main'), { drivers: config.drivers.filter(x => x !== d) }); }} className="text-gray-400 hover:text-red-600"><X size={14}/></button></div>))}</div></div>
                </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex justify-around shadow-inner z-50 no-print">
        <button onClick={() => setActiveTab(currentUser?.isAdmin ? 'admin' : 'dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' || activeTab === 'admin' ? 'text-red-600' : 'text-gray-400'}`}>
          <CheckCircle size={24}/> <span className="text-[9px] font-black uppercase">Tela de Apostas</span>
        </button>
        <button onClick={() => setActiveTab('ranking')} className={`flex flex-col items-center ${activeTab === 'ranking' ? 'text-red-600' : 'text-gray-400'}`}>
          <Trophy size={24}/> <span className="text-[9px] font-black uppercase">Ranking</span>
        </button>
        {currentUser?.isAdmin && (
            <button onClick={() => setActiveTab('conference')} className={`flex flex-col items-center ${activeTab === 'conference' ? 'text-red-600' : 'text-gray-400'}`}>
                <FileText size={24}/> <span className="text-[9px] font-black uppercase">Conferência</span>
            </button>
        )}
      </nav>
    </div>
  );
}