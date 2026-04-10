/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Cpu, 
  Globe, 
  Layers, 
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Star,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Camera,
  User,
  Sparkles,
  X,
  Send,
  Instagram,
  Phone,
  Copy,
  Check,
  Trash2,
  Edit,
  Plus,
  Users,
  AlertCircle,
  TrendingUp,
  Megaphone
} from "lucide-react";

import RadialOrbitalTimelineDemo from "./components/RadialOrbitalTimelineDemo";
import { DottedSurface } from "./components/DottedSurface";
import { GreenSparks } from "./components/GreenSparks";
import { ThemeProvider } from "next-themes";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const chartData = [
  { month: "Mês 1", revenue: 12000 },
  { month: "Mês 2", revenue: 28000 },
  { month: "Mês 3", revenue: 45000 },
  { month: "Mês 4", revenue: 82000 },
  { month: "Mês 5", revenue: 115000 },
  { month: "Mês 6", revenue: 158000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{payload[0].payload.month}</p>
        <p className="text-emerald-500 font-bold text-lg">
          R$ {payload[0].value.toLocaleString()}
        </p>
        <p className="text-[9px] text-zinc-600 uppercase tracking-tighter">Faturamento Gerado</p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusQueryWhatsapp, setStatusQueryWhatsapp] = useState('');
  const [leadStatus, setLeadStatus] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'leads' | 'clients' | 'timeline'>('leads');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'client' | null>(null);
  const [loggedClient, setLoggedClient] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analyzingLead, setAnalyzingLead] = useState<any | null>(null);
  const [newClientData, setNewClientData] = useState({ name: "", email: "", password: "", business_name: "" });

  const [formStep, setFormStep] = useState<'form' | 'success' | 'loading'>('form');
  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    whatsapp: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    instagram: '',
    whatsapp: ''
  });

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Seu nome é essencial para o contato.';
      else if (value.trim().length < 3) error = 'Por favor, insira seu nome completo.';
    } else if (name === 'instagram') {
      if (!value.trim()) error = 'Precisamos do Instagram para análise.';
    } else if (name === 'whatsapp') {
      const digits = value.replace(/\D/g, '');
      if (!value.trim()) error = 'O WhatsApp é obrigatório para o diagnóstico.';
      else if (digits.length < 10) error = 'Insira um número válido com DDD.';
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Falha ao buscar leads');
      const data = await response.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      setLeads([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Falha ao buscar clientes');
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setClients([]);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setUserRole(data.role);
        
        if (data.role === 'client') {
          setLoggedClient(data.user);
          setActiveDashboardTab('client_home' as any);
        } else {
          setActiveDashboardTab('leads');
          fetchLeads();
          fetchClients();
        }
        
        setIsLoginModalOpen(false);
        setIsLeadsModalOpen(true);
        setLoginData({ email: '', password: '' });
      } else {
        alert(data.error || "Credenciais inválidas. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao conectar com o servidor. Tente novamente.");
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;
    try {
      const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (response.ok) fetchLeads();
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLead),
      });
      if (response.ok) {
        setEditingLead(null);
        fetchLeads();
      }
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClient),
      });
      if (response.ok) {
        setEditingClient(null);
        fetchClients();
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    }
  };

  const handleAnalyzeLead = async (lead: any) => {
    setAnalyzingLead(lead);
    setIsAnalysisModalOpen(true);
    setAnalysisResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `Analise o perfil deste lead e recomende o tipo de gestão ideal (ex: gestão de vendas, gestão de reconhecimento, gestão de processos, etc.).
      Nome: ${lead.name}
      Instagram: ${lead.instagram}
      WhatsApp: ${lead.whatsapp}
      
      Forneça uma análise curta e direta sobre o perfil e a recomendação de gestão.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setAnalysisResult(response.text || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error("Erro ao analisar lead:", error);
      setAnalysisResult("Erro ao gerar análise. Tente novamente.");
    } finally {
      setAnalyzingLead(null);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsCreateClientOpen(false);
        setNewClientData({ name: "", email: "", password: "", business_name: "" });
        fetchClients();
        alert("Cliente cadastrado com sucesso!");
      } else {
        const debugStr = data.debug ? JSON.stringify(data.debug) : '';
        alert(`Erro ao cadastrar cliente: ${data.error || "Erro desconhecido"}\nDebug: ${debugStr}`);
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert("Erro de conexão ao tentar cadastrar o cliente.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsLeadsModalOpen(false);
    setLoginData({ email: "", password: "" });
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation check
    const isNameValid = validateField('name', formData.name);
    const isInstaValid = validateField('instagram', formData.instagram);
    const isWhatsValid = validateField('whatsapp', formData.whatsapp);

    if (!isNameValid || !isInstaValid || !isWhatsValid) {
      return;
    }

    setFormStep('loading');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('API Response:', response);
      if (response.ok) {
        setFormStep('success');
        alert('Informações enviadas com sucesso!');
      } else {
        const errorData = await response.json();
        const debugStr = errorData.debug ? JSON.stringify(errorData.debug) : '';
        alert(`Erro ao salvar: ${errorData.error || response.statusText}\nDebug: ${debugStr}`);
        setFormStep('form');
      }
    } catch (error) {
      console.error('Erro de conexão ou inesperado:', error);
      alert('Erro de conexão ou inesperado. Tente novamente.');
      setFormStep('form');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setFormStep('form');
    setFormData({ name: '', instagram: '', whatsapp: '' });
    setFormErrors({ name: '', instagram: '', whatsapp: '' });
  };

  const handleClientAreaClick = () => {
    if (isLoggedIn) {
      fetchLeads();
      fetchClients();
      setIsLeadsModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen relative text-[#F5F5F0] font-sans selection:bg-emerald-500/30 overflow-x-hidden">
        <DottedSurface />
        <GreenSparks />
        {/* Lead Modal */}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white transition-colors z-10 bg-black/50 p-2 rounded-full backdrop-blur-md"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="p-6 md:p-12">
                {formStep === 'form' ? (
                  <>
                    <div className="mb-6 md:mb-8">
                      <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[9px] md:text-[10px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-[0.2em] border border-emerald-500/20 mb-4">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Vagas Limitadas: 02 Restantes
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Solicitar Diagnóstico</h2>
                      <p className="text-zinc-500 text-xs md:text-sm mt-2">Preencha os dados abaixo para análise de viabilidade.</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-6">
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Seu Nome</label>
                          <input 
                            required
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            onBlur={(e) => validateField('name', e.target.value)}
                            placeholder="Como prefere ser chamado?"
                            className={`w-full bg-white/5 border ${formErrors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10'} rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-zinc-600`}
                          />
                          <AnimatePresence>
                            {formErrors.name && (
                              <motion.p 
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="text-[10px] text-red-400 mt-2 ml-1 flex items-center gap-1 font-bold"
                              >
                                <AlertCircle className="w-3 h-3" /> {formErrors.name}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Instagram da Empresa</label>
                          <div className="relative">
                            <Instagram className={`absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formErrors.instagram ? 'text-red-400' : 'text-zinc-500'}`} />
                            <input 
                              required
                              type="text" 
                              name="instagram"
                              value={formData.instagram}
                              onChange={handleInputChange}
                              onBlur={(e) => validateField('instagram', e.target.value)}
                              placeholder="@suaempresa"
                              className={`w-full bg-white/5 border ${formErrors.instagram ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10'} rounded-xl md:rounded-2xl pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-zinc-600`}
                            />
                          </div>
                          <AnimatePresence>
                            {formErrors.instagram && (
                              <motion.p 
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="text-[10px] text-red-400 mt-2 ml-1 flex items-center gap-1 font-bold"
                              >
                                <AlertCircle className="w-3 h-3" /> {formErrors.instagram}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">WhatsApp Direto</label>
                          <div className="relative">
                            <Phone className={`absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formErrors.whatsapp ? 'text-red-400' : 'text-zinc-500'}`} />
                            <input 
                              required
                              type="tel" 
                              name="whatsapp"
                              value={formData.whatsapp}
                              onChange={handleInputChange}
                              onBlur={(e) => validateField('whatsapp', e.target.value)}
                              placeholder="(00) 00000-0000"
                              className={`w-full bg-white/5 border ${formErrors.whatsapp ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10'} rounded-xl md:rounded-2xl pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-zinc-600`}
                            />
                          </div>
                          <AnimatePresence>
                            {formErrors.whatsapp && (
                              <motion.p 
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="text-[10px] text-red-400 mt-2 ml-1 flex items-center gap-1 font-bold"
                              >
                                <AlertCircle className="w-3 h-3" /> {formErrors.whatsapp}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                      <button 
                        type="submit"
                        disabled={formStep === 'loading'}
                        className="w-full bg-emerald-500 text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
                      >
                        {formStep === 'loading' ? 'Enviando...' : 'Enviar para Análise'}
                        {formStep !== 'loading' && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                      </button>
                      
                      <p className="text-center text-[9px] text-zinc-600 uppercase tracking-widest">
                        Seus dados estão protegidos e serão usados apenas para este diagnóstico.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter mb-4">Solicitação Enviada</h2>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                      Lucas Constantino analisará seu perfil pessoalmente. Se houver fit estratégico, entraremos em contato via WhatsApp nas próximas horas.
                    </p>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] hover:underline"
                    >
                      Voltar para o site
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl"
            >
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tighter">Acesso Restrito</h2>
                <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">Apenas para Lucas Constantino</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">E-mail</label>
                  <input 
                    required
                    type="email" 
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    placeholder="seu@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 ml-1">Senha</label>
                  <input 
                    required
                    type="password" 
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => { setIsLoginModalOpen(false); /* setIsForgotPasswordModalOpen(true); */ alert("Funcionalidade em desenvolvimento. Entre em contato com o suporte."); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 mt-2 ml-1"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all"
                >
                  Entrar no Painel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leads Dashboard Modal */}
      <AnimatePresence>
        {isLeadsModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeadsModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative w-full max-w-5xl h-[95vh] md:h-[85vh] bg-zinc-900 border border-white/10 rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-zinc-900/50 backdrop-blur-md gap-4 md:gap-6 relative">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 pr-16 md:pr-0">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tighter">Painel de Gestão</h2>
                    <p className="text-zinc-500 text-[9px] md:text-[10px] uppercase tracking-widest mt-1">Acesso Administrativo</p>
                  </div>
                  
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 self-start md:self-auto w-full md:w-auto overflow-x-auto hide-scrollbar">
                    {userRole === 'admin' ? (
                      <>
                        <button 
                          onClick={() => setActiveDashboardTab('leads')}
                          className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeDashboardTab === 'leads' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                          Leads
                        </button>
                        <button 
                          onClick={() => setActiveDashboardTab('clients')}
                          className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeDashboardTab === 'clients' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                          Clientes
                        </button>
                        <button 
                          onClick={() => setActiveDashboardTab('timeline')}
                          className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeDashboardTab === 'timeline' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                          Timeline
                        </button>
                      </>
                    ) : (
                      <button 
                        className="flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-emerald-500 text-black shadow-lg"
                      >
                        Meu Painel
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
                  {activeDashboardTab === 'clients' && (
                    <button 
                      onClick={() => setIsCreateClientOpen(true)}
                      className="flex items-center justify-center gap-2 bg-emerald-500 text-black px-4 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all w-full md:w-auto"
                    >
                      <Plus className="w-3 h-3" /> Novo Cliente
                    </button>
                  )}
                  <div className="flex items-center gap-1 md:gap-2 absolute top-4 right-4 md:relative md:top-auto md:right-auto">
                    <button 
                      onClick={() => {
                        fetchLeads();
                        fetchClients();
                      }}
                      className="p-2 md:p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors bg-black/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none"
                    >
                      <Zap className="w-4 h-4 text-emerald-500" />
                    </button>
                    <button 
                      onClick={() => setIsLeadsModalOpen(false)}
                      className="p-2 md:p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors bg-black/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {userRole === 'client' ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                      <User className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tighter mb-2">Bem-vindo, {loggedClient?.name}</h3>
                    <p className="text-emerald-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-8">{loggedClient?.business_name}</p>
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px] md:text-xs max-w-md mx-auto leading-relaxed">
                      Seu painel exclusivo está sendo preparado. Em breve, você poderá acompanhar todas as métricas e resultados da sua operação de tráfego aqui.
                    </p>
                  </div>
                ) : activeDashboardTab === 'leads' ? (
                  <div className="bg-black/40 border border-white/5 rounded-[24px] overflow-hidden overflow-x-auto hide-scrollbar">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-white/[0.02]">
                        <div className="col-span-4">Lead</div>
                        <div className="col-span-3">Contato</div>
                        <div className="col-span-3">Data de Entrada</div>
                        <div className="col-span-2 text-right">Ações</div>
                      </div>
                      
                      <div className="divide-y divide-white/5">
                        {leads.length === 0 ? (
                          <div className="text-center py-20">
                            <p className="text-zinc-500 uppercase tracking-widest text-xs">Nenhum lead captado ainda.</p>
                          </div>
                        ) : (
                          leads.map((lead) => (
                            <div 
                              key={lead.id} 
                              className="group grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="col-span-4 flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm font-bold border border-emerald-500/20 shrink-0">
                                  {lead.name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-white truncate flex items-center gap-2">
                                    {lead.name || 'Sem Nome'}
                                    <span className={`w-2 h-2 rounded-full ${lead.status === 'analyzed' ? 'bg-emerald-500' : 'bg-amber-500'}`} title={lead.status === 'analyzed' ? 'Analisado' : 'Pendente'} />
                                  </h4>
                                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {lead.id.toString().padStart(4, '0')}</p>
                                </div>
                              </div>

                              <div className="col-span-3 flex items-center gap-2 w-full">
                                <button 
                                  onClick={() => handleAnalyzeLead(lead)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors text-[10px] font-bold uppercase tracking-widest border border-indigo-500/10"
                                >
                                  <Sparkles className="w-3 h-3" /> IA
                                </button>
                                <a 
                                  href={`https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors text-[10px] font-bold uppercase tracking-widest border border-emerald-500/10"
                                >
                                  <Phone className="w-3 h-3" /> Whats
                                </a>
                                {lead.instagram && (
                                  <a 
                                    href={`https://instagram.com/${lead.instagram.replace('@', '')}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-widest border border-white/5"
                                  >
                                    <Instagram className="w-3 h-3" /> Insta
                                  </a>
                                )}
                              </div>

                              <div className="col-span-3 flex items-center w-full text-zinc-400 text-xs font-mono">
                                {lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '---'}
                              </div>

                              <div className="col-span-2 flex items-center justify-end gap-1 w-full">
                                <button 
                                  onClick={() => copyToClipboard(lead.whatsapp || '', lead.id)}
                                  className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                                  title="Copiar WhatsApp"
                                >
                                  {copiedId === lead.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button 
                                  onClick={() => setEditingLead(lead)}
                                  className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-blue-400 transition-colors"
                                  title="Editar Lead"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteLead(lead.id)}
                                  className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-red-400 transition-colors"
                                  title="Excluir Lead"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeDashboardTab === 'timeline' ? (
                  <div className="h-[60vh] md:h-[70vh] rounded-[24px] overflow-hidden border border-white/5 bg-black">
                    <RadialOrbitalTimelineDemo />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {clients.length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500 uppercase tracking-widest text-xs">Nenhum cliente cadastrado.</p>
                      </div>
                    ) : (
                      clients.map((client) => (
                        <div key={client.id} className="bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 hover:border-emerald-500/20 transition-all">
                          <div className="flex items-start justify-between mb-4 md:mb-6">
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center text-black font-black text-base md:text-xl">
                              {client.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono">ID: {client.id.toString().padStart(4, '0')}</span>
                          </div>
                          <h4 className="text-base md:text-xl font-bold tracking-tight mb-1">{client.name || 'Sem Nome'}</h4>
                          <p className="text-emerald-500 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-4">{client.business_name || "Sem Empresa"}</p>
                          <button 
                            onClick={() => setEditingClient(client)}
                            className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 mb-4"
                          >
                            Editar Cliente
                          </button>
                          <div className="pt-4 md:pt-6 border-t border-white/5 space-y-2 md:space-y-3">
                            <div className="flex items-center justify-between text-[9px] md:text-[11px]">
                              <span className="text-zinc-500 uppercase tracking-widest">E-mail</span>
                              <span className="text-zinc-300 truncate ml-4 font-mono">{client.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] md:text-[11px]">
                              <span className="text-zinc-500 uppercase tracking-widest">Desde</span>
                              <span className="text-zinc-300 font-mono">{client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : '---'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 text-center">
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors"
                >
                  Sair do Sistema
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Check Modal */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStatusModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Consultar Status</h3>
              <input 
                type="tel" 
                value={statusQueryWhatsapp} 
                onChange={(e) => setStatusQueryWhatsapp(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm mb-4" 
                placeholder="Seu WhatsApp" 
              />
              <button 
                onClick={async () => {
                  const response = await fetch('/api/leads');
                  const data = await response.json();
                  const found = data.find((l: any) => l.whatsapp === statusQueryWhatsapp);
                  if (found) {
                    setLeadStatus(found);
                  } else {
                    alert('Lead não encontrado.');
                  }
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-widest"
              >
                Consultar
              </button>
              {leadStatus && leadStatus.status === 'analyzed' && leadStatus.verdict === 'not suitable' && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <h4 className="text-red-500 font-bold mb-2">Análise Concluída</h4>
                  <p className="text-xs text-zinc-300">{leadStatus.feedback || 'Infelizmente, seu perfil não se encaixa no momento. Tente novamente em breve.'}</p>
                </div>
              )}
              {leadStatus && leadStatus.status === 'analyzed' && leadStatus.verdict === 'suitable' && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <h4 className="text-emerald-500 font-bold mb-2">Análise Concluída</h4>
                  <p className="text-xs text-zinc-300">Parabéns! Seu perfil foi aprovado.</p>
                </div>
              )}
              {leadStatus && leadStatus.status === 'pending' && (
                <div className="mt-6 p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                  <h4 className="text-zinc-300 font-bold mb-2">Em Análise</h4>
                  <p className="text-xs text-zinc-400">Seu perfil ainda está sendo analisado. Aguarde novidades.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Lead Modal */}
      <AnimatePresence>
        {editingLead && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingLead(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Editar Lead</h3>
              <form onSubmit={handleUpdateLead} className="space-y-4">
                <input value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Nome" />
                <input value={editingLead.instagram} onChange={e => setEditingLead({...editingLead, instagram: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Instagram" />
                <input value={editingLead.whatsapp} onChange={e => setEditingLead({...editingLead, whatsapp: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="WhatsApp" />
                <select value={editingLead.status || 'pending'} onChange={e => setEditingLead({...editingLead, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm">
                  <option value="pending">Pendente</option>
                  <option value="analyzed">Analisado</option>
                </select>
                <select value={editingLead.verdict || ''} onChange={e => setEditingLead({...editingLead, verdict: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm">
                  <option value="">Selecione o Veredito</option>
                  <option value="suitable">Apto</option>
                  <option value="not suitable">Não Apto</option>
                </select>
                <textarea value={editingLead.feedback || ''} onChange={e => setEditingLead({...editingLead, feedback: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Feedback para o usuário" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditingLead(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-widest">Salvar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Client Modal */}
      <AnimatePresence>
        {isCreateClientOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateClientOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Cadastrar Novo Cliente</h3>
              <form onSubmit={handleCreateClient} noValidate className="space-y-4">
                <input required value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Nome Completo" />
                <input required type="email" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="E-mail de Acesso" />
                <input required type="password" value={newClientData.password} onChange={e => setNewClientData({...newClientData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Senha Provisória" />
                <input value={newClientData.business_name} onChange={e => setNewClientData({...newClientData, business_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Nome da Empresa (Opcional)" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsCreateClientOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-widest">Cadastrar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Client Modal */}
      <AnimatePresence>
        {editingClient && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingClient(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Editar Cliente</h3>
              <form onSubmit={handleUpdateClient} className="space-y-4">
                <input value={editingClient.name} onChange={e => setEditingClient({...editingClient, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Nome" />
                <input value={editingClient.email} onChange={e => setEditingClient({...editingClient, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="E-mail" />
                <input value={editingClient.password || ''} onChange={e => setEditingClient({...editingClient, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Nova Senha" />
                <input value={editingClient.business_name || ''} onChange={e => setEditingClient({...editingClient, business_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" placeholder="Nome da Empresa" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditingClient(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-widest">Salvar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {isAnalysisModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAnalysisModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" /> 
                Análise de IA: {analyzingLead?.name}
              </h3>
              {analyzingLead ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-zinc-400">Analisando perfil...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {analysisResult || "Nenhuma análise disponível."}
                  </div>
                  <button onClick={() => setIsAnalysisModalOpen(false)} className="w-full py-3 rounded-xl bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest">Fechar</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Mobile CTA */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 lg:hidden pointer-events-none">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="pointer-events-auto"
        >
          <button 
            onClick={openModal}
            className="w-full bg-emerald-500 text-black py-3.5 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] shadow-[0_8px_30px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 btn-shine relative overflow-hidden"
          >
            <Zap className="w-3 h-3 fill-current" /> Solicitar Diagnóstico
          </button>
        </motion.div>
      </div>

      {/* Navigation - Premium Glass */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative w-7 h-7 md:w-10 md:h-10 border border-emerald-500/40 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </div>
            <span className="text-sm md:text-xl font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase text-gradient-white">Constantino</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <a href="#method" className="hover-line hover:text-white transition-colors duration-300">A Estratégia</a>
            <a href="#engine" className="hover-line hover:text-white transition-colors duration-300">O Motor de Vendas</a>
            <a href="#results" className="hover-line hover:text-white transition-colors duration-300">Resultados</a>
            <a href="#apply" className="hover-line hover:text-white transition-colors duration-300">Aplicação</a>
            <button onClick={() => setIsStatusModalOpen(true)} className="hover-line hover:text-white transition-colors duration-300">Consultar Status</button>
          </div>

          <button 
            onClick={handleClientAreaClick}
            className="group flex items-center gap-2 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] border border-white/10 px-4 py-2.5 md:px-6 md:py-3 rounded-full hover:bg-emerald-500 hover:text-black hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500"
          >
            {isLoggedIn ? "Painel de Leads" : "Área do Cliente"}
            <Lock className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </nav>

      <main>
        {/* Hero - Cinematic Premium */}
        <section className="relative pt-24 md:pt-48 pb-10 md:pb-40 px-5 md:px-8 overflow-hidden">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" style={{ animation: 'orbFloat 15s ease-in-out infinite' }} />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/[0.06] rounded-full blur-[100px] pointer-events-none" style={{ animation: 'orbFloat 12s ease-in-out 3s infinite' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient pointer-events-none opacity-50" />

          <div className="max-w-5xl mx-auto text-center relative">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-5 md:mb-10 inline-flex items-center gap-2 md:gap-2.5 bg-emerald-500/[0.08] text-emerald-400 text-[8px] md:text-[10px] font-black px-3 py-1.5 md:px-6 md:py-2.5 rounded-full uppercase tracking-[0.2em] md:tracking-[0.35em] border border-emerald-500/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer" />
              <span className="relative flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Gestão de Tráfego de Alta Performance
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.8rem] sm:text-6xl md:text-[9rem] font-light tracking-[-0.04em] leading-[0.88] mb-5 md:mb-14 font-serif"
            >
              <span className="text-gradient-white">Lucas</span> <br /> 
              <span className="font-bold italic text-gradient-animated text-glow">Constantino</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="max-w-2xl mx-auto text-zinc-400 text-[15px] md:text-xl mb-8 md:mb-16 leading-relaxed font-light px-2 md:px-0"
            >
              Responsável por <span className="text-white font-semibold">vendas e fechamentos de contratos diários</span> para operações de elite. 
              Não entrego apenas cliques, entrego <span className="text-emerald-400 italic font-medium">lucro líquido e escala previsível</span>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col items-center gap-5 md:gap-8 px-2 md:px-0"
            >
              <button 
                onClick={openModal}
                className="relative w-full sm:w-auto bg-emerald-500 text-black px-6 md:px-20 py-4 md:py-7 rounded-full font-black text-[10px] md:text-sm uppercase tracking-[0.15em] md:tracking-[0.3em] hover:scale-105 active:scale-[0.98] transition-all duration-500 cursor-pointer overflow-hidden group animate-glow-pulse btn-shine"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                  Solicitar Diagnóstico de Escala
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>

              <div className="flex flex-col items-center gap-2">
                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2 text-center font-bold">
                  <Shield className="w-3 h-3 shrink-0 text-emerald-500" /> Vagas limitadas — Apenas 2 restantes para Q1/2024
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#050505] flex items-center justify-center text-[8px] font-bold text-zinc-400">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] text-zinc-600 font-medium">+47 empresas atendidas</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Strengths - Infinite Marquee */}
        <section className="py-4 md:py-10 border-y border-white/[0.04] bg-white/[0.01] overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, groupIdx) => (
              <div key={groupIdx} className="flex items-center gap-8 md:gap-20 px-4 md:px-10 shrink-0">
                {[
                  { icon: <Zap className="w-3.5 h-3.5 text-emerald-500" />, text: "Estratégia Pura" },
                  { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />, text: "Foco Total em Vendas" },
                  { icon: <Star className="w-3.5 h-3.5 text-emerald-500" />, text: "Alta Conversão" },
                  { icon: <Shield className="w-3.5 h-3.5 text-emerald-500" />, text: "Clientes Fixos" },
                  { icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />, text: "ROI Comprovado" },
                  { icon: <Globe className="w-3.5 h-3.5 text-emerald-500" />, text: "Escala Nacional" },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-2 md:gap-2.5 text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.35em] text-zinc-400 shrink-0">
                    {item.icon} {item.text}
                    <span className="text-emerald-500/30 ml-3 md:ml-6">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* The Methodology - Premium */}
        <section id="method" className="py-10 md:py-40 px-5 md:px-8 max-w-7xl mx-auto relative">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px] pointer-events-none -translate-y-1/2" />
          <div className="grid lg:grid-cols-2 gap-8 md:gap-24 items-center relative">
            <motion.div {...fadeInUp}>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 block">O Framework</span>
              <h2 className="text-3xl md:text-6xl font-light tracking-[-0.03em] mb-3 md:mb-8 leading-tight font-serif">
                O Método <span className="italic text-gradient-animated font-bold">Constantino™</span>
              </h2>
              <p className="text-zinc-400 text-sm md:text-lg mb-6 md:mb-14 leading-relaxed font-light">
                Tráfego pago sem estratégia é apenas gasto. Meu método foca no fechamento, transformando a atenção do público em contratos assinados todos os dias.
              </p>
              
              <div className="space-y-6 md:space-y-8">
                {[
                  { title: "Arquitetura de Conversão", desc: "Criamos o caminho mais curto entre o anúncio e o dinheiro no caixa.", pct: "95%" },
                  { title: "Otimização de ROI Real", desc: "Não olhamos para CTR. Olhamos para o custo por contrato fechado.", pct: "88%" },
                  { title: "Retenção e LTV", desc: "Estratégias para manter clientes fixos e aumentar o valor vitalício de cada lead.", pct: "92%" }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="group flex gap-4 md:gap-6 p-4 md:p-5 rounded-2xl hover:bg-white/[0.03] transition-all duration-500 border border-transparent hover:border-white/[0.06]"
                  >
                    <div className="text-emerald-500 font-mono text-sm md:text-base shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500">0{i+1}</div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1.5 uppercase tracking-widest text-[10px] md:text-xs text-white">{item.title}</h4>
                      <p className="text-zinc-500 text-xs md:text-sm mb-3">{item.desc}</p>
                      <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: item.pct }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.2, duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="aspect-square rounded-[32px] md:rounded-[40px] border border-emerald-500/20 bg-gradient-to-br from-zinc-900/80 to-black p-8 md:p-12 flex items-center justify-center overflow-hidden group relative card-3d glow-emerald">
                <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative">
                  <Megaphone className="w-20 h-20 md:w-32 md:h-32 text-emerald-500 animate-float" />
                  <div className="absolute -inset-8 bg-emerald-500/10 rounded-full blur-3xl opacity-50 animate-pulse" />
                </div>
                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 p-4 md:p-6 rounded-xl md:rounded-2xl glass-emerald">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-400">Tráfego de Alta Performance</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] rounded-full"
                    />
                  </div>
                  <p className="mt-3 md:mt-4 text-[10px] md:text-xs font-mono text-emerald-400">ROI Escalável</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sales Engine - Premium */}
        <section id="engine" className="py-10 md:py-40 px-5 md:px-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-5 gap-8 md:gap-16 items-center">
              <div className="lg:col-span-2">
                <motion.div {...fadeInUp}>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-3 md:mb-6 block">The Sales Engine</span>
                  <h2 className="text-3xl md:text-6xl font-light tracking-[-0.03em] mb-3 md:mb-8 leading-tight font-serif">
                    Contratos <br /> 
                    <span className="italic text-gradient-animated font-bold">Fechados</span> Diariamente.
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-lg mb-5 md:mb-10 leading-relaxed font-light">
                    Meu foco não é apenas gerar leads, mas garantir que sua equipe comercial tenha contratos para assinar todos os dias. É a união entre tráfego qualificado e estratégia de fechamento.
                  </p>
                  
                  <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                    {[
                      { icon: <Zap className="w-5 h-5" />, text: "Escala agressiva com foco em ROI positivo." },
                      { icon: <Shield className="w-5 h-5" />, text: "Blindagem de conta e contingência profissional." },
                      { icon: <Star className="w-5 h-5" />, text: "Alta conversão de clientes em contratos fixos." }
                    ].map((item, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 text-sm font-medium text-zinc-300"
                      >
                        <div className="w-10 h-10 rounded-xl glass border border-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                          {item.icon}
                        </div>
                        {item.text}
                      </motion.li>
                    ))}
                  </ul>

                  <button 
                    onClick={openModal}
                    className="group relative inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-white/[0.04] border border-white/10 px-6 py-4 md:px-8 md:py-5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:border-emerald-500/40 transition-all duration-500 overflow-hidden"
                  >
                    <span className="relative z-10 group-hover:text-black transition-colors duration-500">Quero esses resultados no meu caixa</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-all relative z-10 group-hover:text-black duration-500" />
                    <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                </motion.div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-1 gap-4 mt-8 lg:mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="aspect-[3/4] rounded-[24px] md:rounded-[32px] overflow-hidden border border-white/[0.06] relative group glass p-6 md:p-8 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-700"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative">
                      <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-500">Contratos Assinados</div>
                    </div>
                    <div className="relative">
                      <div className="text-4xl md:text-5xl font-light tracking-tighter font-mono text-white text-glow-white">R$ 120k+</div>
                    </div>
                    <div className="relative text-[10px] md:text-xs text-zinc-500 leading-relaxed font-medium">Faturamento médio mensal por cliente fixo</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="aspect-[3/4] rounded-[24px] md:rounded-[32px] overflow-hidden relative group bg-emerald-500 p-6 md:p-8 flex flex-col justify-between text-black glow-emerald-strong"
                  >
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Taxa de Conversão</div>
                    <div className="text-4xl md:text-5xl font-light tracking-tighter font-mono">24.8%</div>
                    <div className="text-[10px] md:text-xs font-bold leading-relaxed">Média de fechamento em funis diretos</div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="w-full h-[300px] md:h-[400px] rounded-[24px] md:rounded-[32px] border border-white/[0.06] glass p-6 md:p-8 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                  <div className="flex items-center justify-between mb-8 relative">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">Escala de Faturamento</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Crescimento projetado em 6 meses</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live Data</span>
                    </div>
                  </div>

                  <div className="w-full h-[200px] md:h-[280px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#71717a', fontSize: 10 }}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorRev)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Results - Premium Impact */}
        <section id="results" className="py-10 md:py-40 border-y border-white/[0.04] relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
            <motion.div {...fadeInUp} className="text-center mb-8 md:mb-24">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 block">Prova de Resultados</span>
              <h2 className="text-3xl md:text-6xl font-light tracking-[-0.03em] mb-2 md:mb-4 font-serif">Impacto <span className="text-gradient-animated italic font-bold">no Caixa</span></h2>
              <p className="text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px] font-bold">Resultados reais de operações geridas por Lucas Constantino</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {[
                { val: "R$ 3.8M", label: "Investimento Gerido", sub: "Com ROI médio de 5.4x", icon: <TrendingUp className="w-5 h-5" /> },
                { val: "24/7", label: "Vendas Ativas", sub: "Fechamentos diários garantidos", icon: <Zap className="w-5 h-5" /> },
                { val: "92%", label: "Retenção de Clientes", sub: "Foco em contratos fixos e LTV", icon: <Shield className="w-5 h-5" /> }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group p-6 md:p-12 rounded-[20px] md:rounded-[32px] border border-white/[0.06] glass text-center relative overflow-hidden hover:border-emerald-500/20 transition-all duration-700"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl glass-emerald flex items-center justify-center text-emerald-500 mx-auto mb-4 md:mb-6">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-5xl font-light mb-2 md:mb-4 tracking-tighter font-mono text-gradient-white">{stat.val}</div>
                    <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1 md:mb-2">{stat.label}</div>
                    <div className="text-[10px] md:text-xs text-zinc-600 italic mb-5 md:mb-10 font-serif">{stat.sub}</div>
                    <button 
                      onClick={openModal}
                      className="w-full py-3.5 md:py-4 rounded-xl border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-500 flex items-center justify-center gap-2 group/btn"
                    >
                      Diagnosticar Escala
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Irresistible */}
        <section id="apply" className="py-10 md:py-48 px-5 md:px-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.04] rounded-full blur-[200px] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl md:text-[7rem] font-light tracking-[-0.04em] mb-5 md:mb-14 leading-[0.88] font-serif">
                <span className="text-gradient-white">Sua Escala</span> <br /> <span className="italic text-gradient-animated font-bold">Começa Aqui.</span>
              </h2>
              <p className="text-zinc-400 text-base md:text-xl mb-8 md:mb-16 max-w-2xl mx-auto leading-relaxed px-2 md:px-4 font-light">
                Não aceito qualquer projeto. Busco empresas com produto validado que desejam dominar o mercado através de tráfego de alta conversão.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="inline-flex flex-col items-center w-full max-w-xl p-6 md:p-16 rounded-[24px] md:rounded-[48px] border border-emerald-500/20 glass-emerald relative overflow-hidden group animate-glow-pulse"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-b-full" />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.05] to-transparent pointer-events-none" />
              
              <div className="flex gap-1.5 mb-6 md:mb-8 relative">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-emerald-500 fill-current shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              
              <div className="mb-6 md:mb-8 relative">
                <span className="inline-flex items-center gap-2.5 bg-emerald-500 text-black text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-breathe">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/50" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
                  </span>
                  Últimas 02 Vagas Disponíveis
                </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 tracking-tighter relative">Pronto para dominar seu mercado?</h3>
              
              <button 
                onClick={openModal}
                className="w-full bg-emerald-500 text-black px-5 md:px-16 py-4 md:py-8 rounded-full font-black text-[10px] md:text-sm uppercase tracking-[0.15em] md:tracking-[0.3em] hover:scale-105 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 md:gap-4 group/cta cursor-pointer shadow-[0_20px_60px_rgba(16,185,129,0.3)] btn-shine relative"
              >
                Garantir Vaga na Consultoria Privada
                <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1 transition-transform shrink-0" />
              </button>
              
              <p className="mt-6 md:mt-8 text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold relative">Conversa direta e exclusiva com Lucas Constantino</p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer - Premium */}
      <footer className="py-12 md:py-28 px-5 md:px-8 border-t border-white/[0.04] relative mb-14 lg:mb-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 border border-emerald-500/30 rounded-full flex items-center justify-center relative">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <span className="text-lg font-bold tracking-[0.25em] uppercase text-gradient-white">Constantino</span>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Estratégia de Tráfego e Vendas de Alta Performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8">Contato</h4>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li><a href="#" className="hover-line hover:text-emerald-400 transition-colors duration-300">WhatsApp Business</a></li>
                <li><a href="#" className="hover-line hover:text-emerald-400 transition-colors duration-300">Instagram Direct</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8">Legal</h4>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li><a href="#" className="hover-line hover:text-emerald-400 transition-colors duration-300">Política de Privacidade</a></li>
                <li><a href="#" className="hover-line hover:text-emerald-400 transition-colors duration-300">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 md:mt-32 pt-8 md:pt-12 border-t border-white/[0.04] flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 text-center text-[9px] text-zinc-700 font-bold uppercase tracking-[0.4em]">
          <p>© 2026 Lucas Constantino. Todos os direitos reservados.</p>
          <p className="text-emerald-500/40">Focado em ROI.</p>
        </div>
      </footer>
    </div>
    </ThemeProvider>
  );
}
// Git refresh trigger
