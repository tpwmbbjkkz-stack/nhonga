import { useState, useEffect, useRef } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F7F5",
  surface: "#FFFFFF",
  border: "#E8E8E4",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  green: "#009A44",
  yellow: "#FCE300",
  red: "#D21034",
  black: "#0D0D0D",
  orange: "#E8650A",
  greenLight: "#E8F5EE",
  yellowLight: "#FFFBE6",
  redLight: "#FEF0F3",
};

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_REPORTS = [
  {
    id: "NHG-2024-001", protocol: "NHG-001-XK92", date: "2024-11-03",
    type: "Pedido de propina para liberar serviço", agent: "Carlos M.", organ: "Ministério das Obras Públicas",
    sector: "Licenciamento", municipality: "Maputo", province: "Maputo",
    channel: "Pessoalmente", amount: 350000, demanded: "Dinheiro",
    description: "Funcionário exigiu pagamento para aprovar licença de construção dentro do prazo legal.",
    hasEvidence: true, intermediary: true, recurring: true, otherVictims: true,
    victimType: "Empresa", situation: "Pedindo alvará",
    status: "ratoeira", priority: 100,
  },
  {
    id: "NHG-2024-002", protocol: "NHG-002-LM45", date: "2024-11-05",
    type: "Favorecimento em licitação", agent: "Inspector J.F.", organ: "Município de Maputo",
    sector: "Obras e Urbanismo", municipality: "Maputo", province: "Maputo",
    channel: "WhatsApp", amount: 180000, demanded: "Dinheiro",
    description: "Inspector pediu comissão para garantir aprovação de proposta em concurso público.",
    hasEvidence: true, intermediary: false, recurring: false, otherVictims: true,
    victimType: "Empresa", situation: "Licitação pública",
    status: "investigar", priority: 72,
  },
  {
    id: "NHG-2024-003", protocol: "NHG-003-PT78", date: "2024-11-07",
    type: "Pedido de propina para liberar serviço", agent: "Carlos M.", organ: "Ministério das Obras Públicas",
    sector: "Licenciamento", municipality: "Maputo", province: "Maputo",
    channel: "Pessoalmente", amount: 320000, demanded: "Dinheiro",
    description: "Mesma situação relatada. Funcionário negou prazo de aprovação sem pagamento informal.",
    hasEvidence: false, intermediary: true, recurring: true, otherVictims: true,
    victimType: "Empresa", situation: "Pedindo alvará",
    status: "ratoeira", priority: 100,
  },
  {
    id: "NHG-2024-004", protocol: "NHG-004-AB33", date: "2024-11-08",
    type: "Ameaça / Coerção", agent: "Desconhecido", organ: "Polícia da República",
    sector: "Trânsito", municipality: "Beira", province: "Sofala",
    channel: "Pessoalmente", amount: 2500, demanded: "Dinheiro",
    description: "Agente de trânsito ameaçou apreender veículo sem motivo para extorquir pagamento.",
    hasEvidence: false, intermediary: false, recurring: true, otherVictims: true,
    victimType: "Pessoa física", situation: "Fiscalização",
    status: "monitorar", priority: 35,
  },
  {
    id: "NHG-2024-005", protocol: "NHG-005-CR19", date: "2024-11-09",
    type: "Desvio de verba pública", agent: "Dir. P. Nhambi", organ: "Ministério da Saúde",
    sector: "Aprovisionamento", municipality: "Nampula", province: "Nampula",
    channel: "Intermediário", amount: 850000, demanded: "Percentagem de contrato",
    description: "Director exige 15% do valor de contratos de fornecimento de medicamentos como condição de adjudicação.",
    hasEvidence: true, intermediary: true, recurring: true, otherVictims: true,
    victimType: "Empresa", situation: "Licitação pública",
    status: "ratoeira", priority: 100,
  },
  {
    id: "NHG-2024-006", protocol: "NHG-006-ZN88", date: "2024-11-10",
    type: "Pedido de propina para liberar serviço", agent: "Func. Balcão 4", organ: "Conservatória do Registo Civil",
    sector: "Documentos", municipality: "Quelimane", province: "Zambézia",
    channel: "Pessoalmente", amount: 5000, demanded: "Dinheiro",
    description: "Funcionário cobrou propina para emitir certidão de nascimento em tempo normal.",
    hasEvidence: false, intermediary: false, recurring: false, otherVictims: false,
    victimType: "Pessoa física", situation: "Serviço público",
    status: "monitorar", priority: 28,
  },
];

// ── Utility ───────────────────────────────────────────────────────────────────
function genProtocol() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "NHG-";
  const n = String(MOCK_REPORTS.length + 1).padStart(3, "0");
  code += n + "-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function statusLabel(s) {
  if (s === "ratoeira") return "🔴 Ratoeira";
  if (s === "investigar") return "🟠 Investigar";
  if (s === "monitorar") return "🟡 Monitorar";
  return "⚪ Recebida";
}
function statusColor(s) {
  if (s === "ratoeira") return C.red;
  if (s === "investigar") return C.orange;
  if (s === "monitorar") return "#B8860B";
  return C.muted;
}
function statusBg(s) {
  if (s === "ratoeira") return C.redLight;
  if (s === "investigar") return "#FFF3E8";
  if (s === "monitorar") return C.yellowLight;
  return "#F5F5F5";
}
function fmt(n) { return new Intl.NumberFormat("pt-MZ").format(n) + " MT"; }

// ── FORM STEPS ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "tipo", label: "Tipo" },
  { id: "agente", label: "Agente" },
  { id: "incidente", label: "Incidente" },
  { id: "contexto", label: "Contexto" },
  { id: "evidencias", label: "Evidências" },
  { id: "vitima", label: "Vítima" },
  { id: "confirmacao", label: "Confirmar" },
];

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home"); // home | report | admin | login
  const [adminAuth, setAdminAuth] = useState(false);
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterProvince, setFilterProvince] = useState("todas");

  function handleLogin() {
    if (loginPass === "gabinete2024") {
      setAdminAuth(true);
      setView("admin");
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  }

  function addReport(r) {
    setReports(prev => [r, ...prev]);
  }

  const filteredReports = reports.filter(r => {
    if (filterStatus !== "todos" && r.status !== filterStatus) return false;
    if (filterProvince !== "todas" && r.province !== filterProvince) return false;
    return true;
  });

  const provinces = [...new Set(reports.map(r => r.province))];

  // Pattern groups
  const patternGroups = {};
  reports.forEach(r => {
    const key = r.agent !== "Desconhecido" ? r.agent : r.organ + "|" + r.sector;
    if (!patternGroups[key]) patternGroups[key] = [];
    patternGroups[key].push(r);
  });
  const patterns = Object.entries(patternGroups)
    .filter(([, v]) => v.length >= 2)
    .map(([k, v]) => ({ key: k, reports: v, count: v.length, maxAmount: Math.max(...v.map(r => r.amount)) }))
    .sort((a, b) => b.maxAmount - a.maxAmount);

  const alertImmediate = reports.filter(r => r.amount >= 200000);
  const alertPattern = patterns;
  const totalAlerts = alertImmediate.filter(r => r.status === "ratoeira").length + patterns.length;

  // ── HOME ────────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `3px solid ${C.black}`, padding: "0 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>N</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 2, color: C.black }}>NHONGA</div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>SISTEMA DE DENÚNCIAS — GABINETE DA PRESIDÊNCIA</div>
            </div>
          </div>
          <button onClick={() => setView("login")} style={{ background: "none", border: `1.5px solid ${C.black}`, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, letterSpacing: 1 }}>
            ACESSO RESTRITO
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: C.black, color: "#fff", padding: "5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.green} 33%, ${C.yellow} 33%, ${C.yellow} 66%, ${C.red} 66%)` }} />
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.yellow, marginBottom: 16, textTransform: "uppercase" }}>Confidencial · Anónimo · Seguro</div>
          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 700, lineHeight: 1.15, margin: "0 0 1.5rem" }}>
            A sua voz<br />contra a corrupção.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#AAA", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Denuncie extorsão e corrupção de forma completamente anónima. 
            O Gabinete da Presidência recebe e investiga cada denúncia.
          </p>
          <button onClick={() => setView("report")} style={{ background: C.green, color: "#fff", border: "none", padding: "16px 48px", fontSize: 16, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1, fontWeight: 600 }}>
            FAZER DENÚNCIA
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.green} 33%, ${C.yellow} 33%, ${C.yellow} 66%, ${C.red} 66%)` }} />
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.green, marginBottom: 8, textTransform: "uppercase" }}>Como funciona</div>
        <h2 style={{ fontSize: "2rem", marginBottom: "3rem", fontWeight: 700 }}>Simples, anónimo e eficaz.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {[
            { num: "01", title: "Preencha o formulário", desc: "Responda às perguntas sobre o incidente. Sem nome, sem cadastro." },
            { num: "02", title: "Receba o seu protocolo", desc: "Guardará um código único para acompanhar a sua denúncia anonimamente." },
            { num: "03", title: "O Gabinete analisa", desc: "A sua denúncia é analisada, cruzada com outras e pode gerar uma investigação." },
            { num: "04", title: "Ratoeira activada", desc: "Padrões identificados levam a operações encobertaspara flagrar os corruptos." },
          ].map(s => (
            <div key={s.num} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "1.5rem", borderTop: `3px solid ${C.green}` }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: C.green, opacity: 0.25, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontWeight: 700, fontSize: 15, margin: "8px 0 6px" }}>{s.title}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantees */}
      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {[
            { icon: "🔒", title: "Sem rastreio de IP", desc: "O sistema não regista a sua localização ou identidade." },
            { icon: "🗑️", title: "Sem metadados", desc: "Ficheiros enviados têm metadados removidos automaticamente." },
            { icon: "🔑", title: "Só protocolo", desc: "Apenas um código anónimo para acompanhar a sua denúncia." },
            { icon: "🇲🇿", title: "Gabinete da Presidência", desc: "Denúncias recebidas directamente pelo mais alto nível." },
          ].map(g => (
            <div key={g.title}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{g.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{g.title}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ textAlign: "center", padding: "2rem", fontSize: 12, color: C.muted }}>
        © 2024 NHONGA — Gabinete da Presidência da República de Moçambique
      </footer>
    </div>
  );

  // ── LOGIN ───────────────────────────────────────────────────────────────────
  if (view === "login") return (
    <div style={{ minHeight: "100vh", background: C.black, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
      <div style={{ background: C.surface, padding: "3rem", width: "100%", maxWidth: 400, borderTop: `4px solid ${C.green}` }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>N</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>NHONGA</div>
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginTop: 4 }}>ACESSO RESTRITO — GABINETE</div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: 12, letterSpacing: 1, color: C.muted, display: "block", marginBottom: 6 }}>PALAVRA-PASSE</label>
          <input
            type="password"
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "12px", border: `1.5px solid ${loginError ? C.red : C.border}`, fontFamily: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            placeholder="••••••••••"
          />
          {loginError && <div style={{ color: C.red, fontSize: 12, marginTop: 4 }}>Palavra-passe incorrecta.</div>}
        </div>
        <button onClick={handleLogin} style={{ width: "100%", background: C.black, color: "#fff", border: "none", padding: "14px", fontFamily: "inherit", fontSize: 14, cursor: "pointer", letterSpacing: 1 }}>
          ENTRAR
        </button>
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            ← Voltar ao início
          </button>
        </div>
        <div style={{ marginTop: "1.5rem", fontSize: 11, color: C.muted, textAlign: "center" }}>Demo: password = <strong>gabinete2024</strong></div>
      </div>
    </div>
  );

  // ── REPORT FORM ─────────────────────────────────────────────────────────────
  if (view === "report") return <ReportForm onBack={() => setView("home")} onSubmit={r => { addReport(r); }} />;

  // ── ADMIN PANEL ─────────────────────────────────────────────────────────────
  if (view === "admin") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', serif" }}>
      {/* Admin Header */}
      <header style={{ background: C.black, color: "#fff", padding: "0 2rem", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>N</span>
            </div>
            <span style={{ fontWeight: 700, letterSpacing: 2, fontSize: 16 }}>NHONGA</span>
            <span style={{ fontSize: 11, color: "#888", letterSpacing: 1, marginLeft: 8 }}>PAINEL DO GABINETE</span>
          </div>
          <button onClick={() => { setAdminAuth(false); setView("home"); }} style={{ background: "none", border: `1px solid #555`, color: "#aaa", padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
            SAIR
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "2rem" }}>
        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total de Denúncias", value: reports.length, color: C.green },
            { label: "Alertas Activos", value: totalAlerts, color: C.red },
            { label: "Ratoeiras Prontas", value: reports.filter(r => r.status === "ratoeira").length, color: C.red },
            { label: "Em Investigação", value: reports.filter(r => r.status === "investigar").length, color: C.orange },
            { label: "A Monitorar", value: reports.filter(r => r.status === "monitorar").length, color: "#B8860B" },
            { label: "Padrões Detectados", value: patterns.length, color: C.green },
          ].map(k => (
            <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${k.color}`, padding: "1.25rem" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: C.muted, letterSpacing: 0.5, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Immediate alerts */}
        {alertImmediate.length > 0 && (
          <div style={{ background: C.redLight, border: `2px solid ${C.red}`, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", borderRadius: 2 }}>
            <div style={{ fontWeight: 700, color: C.red, fontSize: 13, letterSpacing: 1, marginBottom: "0.75rem" }}>🚨 ALERTAS IMEDIATOS — VALOR ≥ 200.000 MT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {alertImmediate.map(r => (
                <button key={r.id} onClick={() => setSelectedReport(r)} style={{ background: C.red, color: "#fff", border: "none", padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5 }}>
                  {r.id} · {fmt(r.amount)} · {r.organ}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pattern alerts */}
        {patterns.length > 0 && (
          <div style={{ background: "#FFF3E8", border: `2px solid ${C.orange}`, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", borderRadius: 2 }}>
            <div style={{ fontWeight: 700, color: C.orange, fontSize: 13, letterSpacing: 1, marginBottom: "0.75rem" }}>🔁 PADRÕES DETECTADOS — MESMO AGENTE / SECTOR</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {patterns.map(p => (
                <div key={p.key} style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>{p.count}x denúncias</span>
                  <span style={{ color: C.muted }}>→</span>
                  <span><strong>{p.key}</strong> · Valor máximo: {fmt(p.maxAmount)}</span>
                  <span style={{ background: p.reports[0].status === "ratoeira" ? C.red : C.orange, color: "#fff", padding: "2px 10px", fontSize: 11 }}>
                    {statusLabel(p.reports[0].status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: selectedReport ? "1fr 420px" : "1fr", gap: "1.5rem" }}>
          {/* Reports list */}
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: C.muted, letterSpacing: 1 }}>FILTRAR:</span>
              {["todos", "ratoeira", "investigar", "monitorar"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ background: filterStatus === s ? C.black : C.surface, color: filterStatus === s ? "#fff" : C.muted, border: `1px solid ${C.border}`, padding: "5px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: 0.5 }}>
                  {s === "todos" ? "Todos" : statusLabel(s)}
                </button>
              ))}
              <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} style={{ border: `1px solid ${C.border}`, padding: "5px 10px", fontFamily: "inherit", fontSize: 12, background: C.surface, cursor: "pointer" }}>
                <option value="todas">Todas as províncias</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.black}` }}>
                    {["Protocolo", "Data", "Tipo", "Agente / Órgão", "Valor Exigido", "Localização", "Estado"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, letterSpacing: 1, color: C.muted, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r, i) => (
                    <tr key={r.id} onClick={() => setSelectedReport(selectedReport?.id === r.id ? null : r)}
                      style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: selectedReport?.id === r.id ? "#F0F7F3" : i % 2 === 0 ? C.surface : C.bg, transition: "background 0.15s" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: C.green, fontSize: 12 }}>{r.protocol}</td>
                      <td style={{ padding: "10px 14px", color: C.muted }}>{r.date}</td>
                      <td style={{ padding: "10px 14px", maxWidth: 180 }}>{r.type}</td>
                      <td style={{ padding: "10px 14px" }}><div style={{ fontWeight: 600 }}>{r.agent}</div><div style={{ fontSize: 11, color: C.muted }}>{r.organ}</div></td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: r.amount >= 200000 ? C.red : C.text }}>{fmt(r.amount)}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{r.municipality}, {r.province}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: statusBg(r.status), color: statusColor(r.status), padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                          {statusLabel(r.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dossier panel */}
          {selectedReport && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `4px solid ${statusColor(selectedReport.status)}`, padding: "1.5rem", height: "fit-content", position: "sticky", top: 80 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted }}>DOSSIÊ</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: statusColor(selectedReport.status) }}>{selectedReport.protocol}</div>
                </div>
                <button onClick={() => setSelectedReport(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.muted }}>×</button>
              </div>

              <div style={{ background: statusBg(selectedReport.status), padding: "10px 14px", marginBottom: "1.25rem", borderLeft: `3px solid ${statusColor(selectedReport.status)}` }}>
                <div style={{ fontWeight: 700, color: statusColor(selectedReport.status), fontSize: 13 }}>{statusLabel(selectedReport.status)}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {selectedReport.status === "ratoeira" && "Padrão confirmado. Operação encoberta recomendada."}
                  {selectedReport.status === "investigar" && "Evidências suficientes. Investigação formal recomendada."}
                  {selectedReport.status === "monitorar" && "Aguardar mais denúncias antes de actuar."}
                </div>
              </div>

              {[
                { label: "Tipo de Corrupção", value: selectedReport.type },
                { label: "Agente Identificado", value: selectedReport.agent },
                { label: "Órgão / Sector", value: `${selectedReport.organ} — ${selectedReport.sector}` },
                { label: "Localização", value: `${selectedReport.municipality}, ${selectedReport.province}` },
                { label: "Data do Incidente", value: selectedReport.date },
                { label: "Canal de Contacto", value: selectedReport.channel },
                { label: "O que foi exigido", value: selectedReport.demanded },
                { label: "Valor Exigido", value: fmt(selectedReport.amount), highlight: selectedReport.amount >= 200000 },
                { label: "Tipo de Vítima", value: selectedReport.victimType },
                { label: "Situação", value: selectedReport.situation },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{f.label}</span>
                  <span style={{ fontWeight: 600, color: f.highlight ? C.red : C.text, textAlign: "right", maxWidth: "55%" }}>{f.value}</span>
                </div>
              ))}

              <div style={{ marginTop: "1rem", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted, marginBottom: 6 }}>DESCRIÇÃO</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{selectedReport.description}</div>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {selectedReport.hasEvidence && <span style={{ background: C.greenLight, color: C.green, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>✓ Tem evidências</span>}
                {selectedReport.intermediary && <span style={{ background: "#FFF3E8", color: C.orange, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>⚠ Intermediário</span>}
                {selectedReport.recurring && <span style={{ background: C.redLight, color: C.red, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>🔁 Recorrente</span>}
                {selectedReport.otherVictims && <span style={{ background: C.yellowLight, color: "#B8860B", padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>👥 Outras vítimas</span>}
              </div>

              {selectedReport.status === "ratoeira" && (
                <div style={{ marginTop: "1.25rem", background: C.redLight, border: `1px solid ${C.red}`, padding: "1rem" }}>
                  <div style={{ fontWeight: 700, color: C.red, fontSize: 12, letterSpacing: 1, marginBottom: "0.5rem" }}>🪤 SUGESTÃO DE OPERAÇÃO</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                    <div>• Canal: <strong>{selectedReport.channel}</strong></div>
                    <div>• Script: simular {selectedReport.situation.toLowerCase()}</div>
                    <div>• Exigência esperada: {selectedReport.demanded} (~{fmt(selectedReport.amount)})</div>
                    {selectedReport.intermediary && <div>• Atenção: envolve intermediário — expandir rede</div>}
                    <div>• Cruzar com dados patrimoniais do agente</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REPORT FORM COMPONENT ─────────────────────────────────────────────────────
function ReportForm({ onBack, onSubmit }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [form, setForm] = useState({
    type: "", agentName: "", agentRole: "", organ: "", municipality: "", province: "",
    date: "", location: "", channel: "", demanded: "", amount: "", description: "",
    recurring: "", otherVictims: "", intermediary: "", deadline: "", paymentMethod: "",
    hasEvidence: false, victimType: "", situation: "",
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function computeStatus(f) {
    const amt = parseFloat(f.amount) || 0;
    if (amt >= 200000) return "ratoeira";
    if (f.hasEvidence || f.intermediary === "Sim") return "investigar";
    return "monitorar";
  }

  function handleSubmit() {
    const p = genProtocol();
    const status = computeStatus(form);
    const newReport = {
      id: `NHG-2024-00${MOCK_REPORTS.length + 1}`,
      protocol: p,
      date: new Date().toISOString().split("T")[0],
      type: form.type,
      agent: form.agentName || "Desconhecido",
      organ: form.organ || "Não identificado",
      sector: form.agentRole || "Não identificado",
      municipality: form.municipality || "Não indicado",
      province: form.province || "Não indicada",
      channel: form.channel,
      amount: parseFloat(form.amount) || 0,
      demanded: form.demanded,
      description: form.description,
      hasEvidence: form.hasEvidence,
      intermediary: form.intermediary === "Sim",
      recurring: form.recurring === "Sim",
      otherVictims: form.otherVictims === "Sim",
      victimType: form.victimType,
      situation: form.situation,
      status,
      priority: status === "ratoeira" ? 100 : status === "investigar" ? 70 : 30,
    };
    onSubmit(newReport);
    setProtocol(p);
    setDone(true);
  }

  const inputStyle = { width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box", background: C.surface };
  const labelStyle = { fontSize: 12, letterSpacing: 1, color: C.muted, display: "block", marginBottom: 6 };
  const optBtn = (val, cur, setter) => (
    <button key={val} onClick={() => setter(val)} style={{ padding: "10px 18px", border: `1.5px solid ${cur === val ? C.green : C.border}`, background: cur === val ? C.greenLight : C.surface, color: cur === val ? C.green : C.text, fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: cur === val ? 700 : 400, transition: "all 0.15s" }}>
      {val}
    </button>
  );

  const stepContent = [
    // Step 0 — Tipo
    <div key="tipo">
      <h3 style={{ fontSize: 18, marginBottom: "0.25rem" }}>O que aconteceu?</h3>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.5rem" }}>Seleccione o tipo de situação que viveu.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {["Pedido de propina para liberar serviço", "Ameaça / Coerção", "Favorecimento em licitação", "Desvio de verba pública", "Outro"].map(t =>
          <button key={t} onClick={() => set("type", t)} style={{ padding: "13px 16px", border: `1.5px solid ${form.type === t ? C.green : C.border}`, background: form.type === t ? C.greenLight : C.surface, color: form.type === t ? C.green : C.text, fontFamily: "inherit", fontSize: 14, cursor: "pointer", textAlign: "left", fontWeight: form.type === t ? 700 : 400, transition: "all 0.15s" }}>
            {t}
          </button>
        )}
      </div>
    </div>,

    // Step 1 — Agente
    <div key="agente">
      <h3 style={{ fontSize: 18, marginBottom: "0.25rem" }}>Quem foi o agente?</h3>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.5rem" }}>Preencha o que souber. Nada é obrigatório.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div><label style={labelStyle}>NOME OU APELIDO (OPCIONAL)</label><input value={form.agentName} onChange={e => set("agentName", e.target.value)} style={inputStyle} placeholder="Ex: Carlos M., Inspector João..." /></div>
        <div><label style={labelStyle}>CARGO / FUNÇÃO</label><input value={form.agentRole} onChange={e => set("agentRole", e.target.value)} style={inputStyle} placeholder="Ex: Inspector, Director, Funcionário do balcão..." /></div>
        <div><label style={labelStyle}>ÓRGÃO / REPARTIÇÃO</label><input value={form.organ} onChange={e => set("organ", e.target.value)} style={inputStyle} placeholder="Ex: Ministério das Obras Públicas, Município..." /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div><label style={labelStyle}>MUNICÍPIO</label><input value={form.municipality} onChange={e => set("municipality", e.target.value)} style={inputStyle} placeholder="Ex: Maputo, Beira..." /></div>
          <div><label style={labelStyle}>PROVÍNCIA</label><input value={form.province} onChange={e => set("province", e.target.value)} style={inputStyle} placeholder="Ex: Maputo, Sofala..." /></div>
        </div>
      </div>
    </div>,

    // Step 2 — Incidente
    <div key="incidente">
      <h3 style={{ fontSize: 18, marginBottom: "0.25rem" }}>O incidente</h3>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.5rem" }}>Descreva o que aconteceu com o máximo de detalhe possível.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div><label style={labelStyle}>DATA APROXIMADA</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} /></div>
        <div>
          <label style={labelStyle}>COMO FOI FEITO O CONTACTO?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["Pessoalmente", "Telefone", "WhatsApp", "E-mail", "Intermediário", "Outro"].map(c => optBtn(c, form.channel, v => set("channel", v)))}
          </div>
        </div>
        <div><label style={labelStyle}>O QUE FOI EXIGIDO?</label><input value={form.demanded} onChange={e => set("demanded", e.target.value)} style={inputStyle} placeholder="Ex: Dinheiro, favor, silêncio, percentagem..." /></div>
        <div><label style={labelStyle}>VALOR OU MONTANTE EXIGIDO (MT)</label><input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} style={inputStyle} placeholder="Ex: 50000" />
          {parseFloat(form.amount) >= 200000 && <div style={{ color: C.red, fontSize: 12, marginTop: 4, fontWeight: 600 }}>⚠ Valor acima de 200.000 MT — este caso gerará alerta imediato.</div>}
        </div>
        <div><label style={labelStyle}>DESCRIÇÃO DO QUE ACONTECEU</label><textarea value={form.description} onChange={e => set("description", e.target.value)} style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Descreva a situação com o máximo de detalhe..." /></div>
      </div>
    </div>,

    // Step 3 — Contexto
    <div key="contexto">
      <h3 style={{ fontSize: 18, marginBottom: "0.25rem" }}>Contexto do caso</h3>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.5rem" }}>Esta informação ajuda a montar a operação de captura.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div><label style={labelStyle}>ISTO JÁ ACONTECEU ANTES CONSIGO?</label><div style={{ display: "flex", gap: "0.5rem" }}>{["Sim", "Não", "Não sei"].map(v => optBtn(v, form.recurring, x => set("recurring", x)))}</div></div>
        <div><label style={labelStyle}>CONHECE OUTRAS PESSOAS QUE PASSARAM PELO MESMO?</label><div style={{ display: "flex", gap: "0.5rem" }}>{["Sim", "Não", "Não sei"].map(v => optBtn(v, form.otherVictims, x => set("otherVictims", x)))}</div></div>
        <div><label style={labelStyle}>EXISTE INTERMEDIÁRIO ENVOLVIDO?</label><div style={{ display: "flex", gap: "0.5rem" }}>{["Sim", "Não", "Não sei"].map(v => optBtn(v, form.intermediary, x => set("intermediary", x)))}</div></div>
        <div><label style={labelStyle}>COMO DEVERIA SER FEITO O PAGAMENTO?</label><input value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)} style={inputStyle} placeholder="Ex: em mão, transferência, m-pesa, por intermediário..." /></div>
        <div><label style={labelStyle}>HÁ PRAZO OU AMEAÇA DE CONSEQUÊNCIA?</label><input value={form.deadline} onChange={e => set("deadline", e.target.value)} style={inputStyle} placeholder="Ex: 'tens 3 dias', 'se não pagares o processo pára'..." /></div>
      </div>
    </div>,

    // Step 4 — Evidências
    <div key="evidencias">
      <h3 style={{ fontSize: 18, marginBottom: "0.25rem" }}>Tem evidências?</h3>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.5rem" }}>Qualquer ficheiro enviado terá metadados removidos automaticamente.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div><label style={labelStyle}>POSSUI PROVAS?</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["Sim", "Não"].map(v => (
              <button key={v} onClick={() => set("hasEvidence", v === "Sim")} style={{ padding: "10px 24px", border: `1.5px solid ${(v === "Sim") === form.hasEvidence ? C.green : C.border}`, background: (v === "Sim") === form.hasEvidence ? C.greenLight : C.surface, color: (v === "Sim") === form.hasEvidence ? C.green : C.text, fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: (v === "Sim") === form.hasEvidence ? 700 : 400 }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        {form.hasEvidence && (
          <div style={{ border: `2px dashed ${C.border}`, padding: "2rem", textAlign: "center", background: C.bg }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
            <div style={{ fontSize: 14, color: C.muted }}>Carregamento de ficheiros disponível na versão de produção.</div>
            <div style={{ fontSize: 12, color: C.green, marginTop: 4 }}>Metadados serão removidos automaticamente.</div>
          </div>
        )}
        <div style={{ background: C.yellowLight, border: `1px solid ${C.yellow}`, padding: "12px 16px", borderLeft: `3px solid #B8860B` }}>
          <div style={{ fontSize: 12, color: "#7A5C00", lineHeight: 1.6 }}>
            <strong>Tipos de evidências úteis:</strong> capturas de ecrã de conversas (WhatsApp, SMS), áudios, documentos exigidos, notas manuscritas, dados de transferências.
          </div>
        </div>
      </div>
    </div>,

    // Step 5 — Vítima
    <div key="vitima">
      <h3 style={{ fontSize: 18, marginBottom: "0.25rem" }}>Sobre a vítima</h3>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.5rem" }}>Sem revelar identidade — apenas contexto para análise.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div><label style={labelStyle}>TIPO DE VÍTIMA</label><div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{["Pessoa física", "Empresa / Organização", "Funcionário público"].map(v => optBtn(v, form.victimType, x => set("victimType", x)))}</div></div>
        <div><label style={labelStyle}>EM QUE SITUAÇÃO ESTAVA QUANDO FOI ABORDADO?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["Pedindo alvará / licença", "Licitação pública", "Fiscalização / Auditoria", "Serviço público comum", "Passagem em controlo", "Outra"].map(v => optBtn(v, form.situation, x => set("situation", x)))}
          </div>
        </div>
      </div>
    </div>,

    // Step 6 — Confirm
    <div key="confirmacao">
      <h3 style={{ fontSize: 18, marginBottom: "0.25rem" }}>Confirmar denúncia</h3>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.5rem" }}>Reveja o resumo antes de submeter.</p>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "1rem", marginBottom: "1rem" }}>
        {[
          ["Tipo", form.type], ["Agente", form.agentName || "Não informado"], ["Órgão", form.organ || "Não informado"],
          ["Localização", `${form.municipality || "—"}, ${form.province || "—"}`], ["Canal", form.channel],
          ["Valor exigido", form.amount ? fmt(parseFloat(form.amount)) : "Não informado"], ["Evidências", form.hasEvidence ? "Sim" : "Não"],
          ["Intermediário", form.intermediary || "Não respondido"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
            <span style={{ color: C.muted }}>{k}</span>
            <span style={{ fontWeight: 600, color: parseFloat(form.amount) >= 200000 && k === "Valor exigido" ? C.red : C.text }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, padding: "12px 16px", borderLeft: `3px solid ${C.green}`, fontSize: 13, color: "#005A2B", lineHeight: 1.6, marginBottom: "1rem" }}>
        A sua identidade permanecerá completamente anónima. Após a submissão receberá um código de protocolo único.
      </div>
    </div>,
  ];

  if (done) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: "2rem" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `4px solid ${C.green}`, padding: "3rem", maxWidth: 500, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: "1rem" }}>✅</div>
        <h2 style={{ fontSize: 22, marginBottom: "0.5rem" }}>Denúncia submetida</h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: "2rem", lineHeight: 1.6 }}>A sua denúncia foi recebida com segurança pelo Gabinete da Presidência. Guarde o seu código de protocolo.</p>
        <div style={{ background: C.black, color: C.yellow, padding: "1.25rem", letterSpacing: 4, fontSize: 22, fontWeight: 700, marginBottom: "1.5rem" }}>{protocol}</div>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: "2rem", lineHeight: 1.6 }}>Use este código para acompanhar o estado da sua denúncia de forma anónima. Não partilhe este código com ninguém.</p>
        <button onClick={onBack} style={{ background: C.green, color: "#fff", border: "none", padding: "13px 36px", fontFamily: "inherit", fontSize: 14, cursor: "pointer", letterSpacing: 1 }}>
          VOLTAR AO INÍCIO
        </button>
      </div>
    </div>
  );

  const canNext = [
    form.type !== "",
    true,
    form.channel !== "" && form.amount !== "",
    true,
    true,
    form.victimType !== "",
    true,
  ][step];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', serif" }}>
      <header style={{ background: C.surface, borderBottom: `3px solid ${C.black}`, padding: "0 2rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>N</span>
            </div>
            <span style={{ fontWeight: 700, letterSpacing: 2, fontSize: 15 }}>NHONGA</span>
          </div>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>✕ Cancelar</button>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 2rem" }}>
        {/* Progress */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.75rem" }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ flex: 1, height: 4, background: i <= step ? C.green : C.border, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, letterSpacing: 1, color: C.muted }}>PASSO {step + 1} DE {STEPS.length}</span>
            <span style={{ fontSize: 11, letterSpacing: 1, color: C.green, fontWeight: 700 }}>{STEPS[step].label.toUpperCase()}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "2rem 2rem 1.5rem", marginBottom: "1.5rem" }}>
          {stepContent[step]}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => step === 0 ? onBack() : setStep(s => s - 1)} style={{ background: "none", border: `1.5px solid ${C.border}`, padding: "12px 28px", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>
            ← Anterior
          </button>
          {step < STEPS.length - 1
            ? <button onClick={() => setStep(s => s + 1)} disabled={!canNext} style={{ background: canNext ? C.black : C.border, color: canNext ? "#fff" : C.muted, border: "none", padding: "12px 36px", fontFamily: "inherit", fontSize: 14, cursor: canNext ? "pointer" : "not-allowed", letterSpacing: 1 }}>
                Próximo →
              </button>
            : <button onClick={handleSubmit} style={{ background: C.green, color: "#fff", border: "none", padding: "12px 36px", fontFamily: "inherit", fontSize: 14, cursor: "pointer", fontWeight: 700, letterSpacing: 1 }}>
                SUBMETER DENÚNCIA
              </button>
          }
        </div>
      </div>
    </div>
  );
}
