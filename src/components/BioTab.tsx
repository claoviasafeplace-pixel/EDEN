'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Instagram, ArrowRight, FileText, Hash, Zap } from 'lucide-react';

type Tone = 'pro' | 'luxe' | 'fun' | 'dynamic';
type Platform = 'instagram' | 'tiktok' | 'both';

const tones: { id: Tone; label: string; emoji: string; desc: string }[] = [
  { id: 'pro', label: 'Professionnel', emoji: '🏢', desc: 'Serieux et factuel' },
  { id: 'luxe', label: 'Luxe', emoji: '✨', desc: 'Elegant et premium' },
  { id: 'fun', label: 'Decontracte', emoji: '😊', desc: 'Chaleureux et accessible' },
  { id: 'dynamic', label: 'Dynamique', emoji: '🔥', desc: 'Percutant et viral' },
];

const sampleBios: Record<Tone, { instagram: string; tiktok: string }> = {
  pro: {
    instagram: `🏠 Nouveau bien exclusif !\n\n📍 {ville} — Quartier {quartier}\n💰 {prix} €\n\n✅ Emplacement premium\n✅ Luminosite exceptionnelle\n✅ Proche commodites\n\n📞 Contactez Eden - ERA Immobilier\n\n#immobilier #{ville} #realestate #investissement #bienimmobilier #vente #eraimmobilier`,
    tiktok: `🏠 {prix}€ a {ville} quartier {quartier} ! Emplacement ideal, lumiere naturelle incroyable 🌟 Contactez Eden ERA pour visiter ! #immobilier #{ville} #realestate #appartement #fyp`,
  },
  luxe: {
    instagram: `✨ Decouverte exceptionnelle\n\nUne adresse d'exception au coeur de {ville}, quartier {quartier}.\n\n🏡 {prix} €\n\nRaffinement, volumes genereux et prestations haut de gamme. Un bien rare sur le marche.\n\n📩 Visite privee sur rendez-vous\nEden - ERA Immobilier\n\n#luxuryrealestate #{ville} #immobilierdeluxe #prestige #exclusif`,
    tiktok: `✨ Visite d'un bien d'exception a {ville} — {prix}€ — Quartier {quartier} — Venez decouvrir ce bijou 💎 #luxuryrealestate #{ville} #immobilier #luxury #prestige #fyp`,
  },
  fun: {
    instagram: `Hey ! 👋 Regardez cette pepite a {ville} !\n\n📍 Quartier {quartier}\n💰 {prix} €\n\nOn craque completement pour cet endroit 😍 Lumiere de dingue, quartier au top, et le prix est canon !\n\nOn en parle ? DM ou appelez Eden 📱\n\n#immobilier #{ville} #homesweethome #coup2coeur #eraimmobilier`,
    tiktok: `REGARDEZ cette maison a {ville} 😍 {prix}€ dans le quartier {quartier} — Le coup de coeur est immediat ! DM pour visiter 🏠 #immobilier #{ville} #coupdecoeur #fyp #homesweethome`,
  },
  dynamic: {
    instagram: `⚡ NOUVEAU BIEN — {ville}\n\n🔥 {prix} € | Quartier {quartier}\n\n➤ Emplacement strategique\n➤ Rentabilite optimale\n➤ Disponible immediatement\n\n⏰ Ce bien ne restera pas longtemps !\n\n📲 Eden - ERA Immobilier\nAppelez MAINTENANT\n\n#immobilier #{ville} #investissement #bonplan #urgent #eraimmobilier`,
    tiktok: `⚡ {prix}€ a {ville} quartier {quartier} — Ce bien ne va pas durer !! Appelez Eden ERA maintenant 🔥 #immobilier #{ville} #bonplan #fyp #urgent #investment`,
  },
};

export default function BioTab() {
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [prix, setPrix] = useState('');
  const [tone, setTone] = useState<Tone>('pro');
  const [platform, setPlatform] = useState<Platform>('both');
  const [generated, setGenerated] = useState(false);
  const [copiedIg, setCopiedIg] = useState(false);
  const [copiedTk, setCopiedTk] = useState(false);

  const isValid = ville.trim() !== '' && quartier.trim() !== '' && prix.trim() !== '';

  const getBio = (p: 'instagram' | 'tiktok') => {
    return sampleBios[tone][p]
      .replace(/\{ville\}/g, ville || 'Ville')
      .replace(/\{quartier\}/g, quartier || 'Quartier')
      .replace(/\{prix\}/g, prix || 'XXX');
  };

  const handleGenerate = () => {
    setGenerated(true);
    setCopiedIg(false);
    setCopiedTk(false);
  };

  const handleCopy = async (text: string, type: 'ig' | 'tk') => {
    await navigator.clipboard.writeText(text);
    if (type === 'ig') { setCopiedIg(true); setTimeout(() => setCopiedIg(false), 2000); }
    else { setCopiedTk(true); setTimeout(() => setCopiedTk(false), 2000); }
  };

  const inputClass = "w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-vm-primary/30 rounded-[1.5rem] outline-none text-slate-700 font-bold placeholder:text-slate-300 transition-all text-sm";

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-vm-text">Bio & Textes</h1>
        <p className="text-slate-500 mt-2 font-medium">Generez des descriptions optimisees pour Instagram et TikTok.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-10">
        {/* Left — Form */}
        <div className="space-y-8">
          {/* Property Info */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-vm-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-vm-primary">Informations du bien</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Ville *</label>
                <input type="text" value={ville} onChange={e => setVille(e.target.value)} placeholder="Tours" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Quartier *</label>
                <input type="text" value={quartier} onChange={e => setQuartier(e.target.value)} placeholder="Beaujardin" className={inputClass} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Prix *</label>
              <input type="text" value={prix} onChange={e => setPrix(e.target.value)} placeholder="250 000 €" className={inputClass} />
            </div>
          </div>

          {/* Tone selector */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-vm-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-vm-primary">Ton du texte</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tones.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTone(t.id); setGenerated(false); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    tone === t.id
                      ? 'border-vm-primary bg-vm-primary-light'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <p className={`text-sm font-black mt-2 ${tone === t.id ? 'text-vm-primary' : 'text-vm-text'}`}>{t.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-vm-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-vm-primary">Plateforme</span>
            </div>
            <div className="flex gap-3">
              {[
                { id: 'instagram' as Platform, label: 'Instagram', icon: Instagram },
                { id: 'tiktok' as Platform, label: 'TikTok', icon: Zap },
                { id: 'both' as Platform, label: 'Les deux', icon: Sparkles },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    platform === p.id
                      ? 'bg-vm-text text-white shadow-lg'
                      : 'bg-slate-50 text-slate-400 hover:text-vm-text hover:bg-slate-100'
                  }`}
                >
                  <p.icon className="w-4 h-4" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={!isValid}
            className="w-full bg-vm-primary text-white px-8 py-5 rounded-[2rem] font-black text-lg
                       shadow-[0_8px_32px_rgba(193,134,107,0.3)] hover:bg-vm-primary-dark transition-all
                       flex items-center justify-center gap-3 active:scale-[0.98]
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles className="w-5 h-5" /> Generer les textes
          </button>
        </div>

        {/* Right — Results */}
        <div className="space-y-6">
          {!generated ? (
            <div className="relative group h-full min-h-[400px]">
              <div className="absolute -inset-1 bg-gradient-to-r from-vm-primary/10 to-orange-200/10 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-700" />
              <div className="relative bg-white border border-slate-100 rounded-[3rem] h-full flex flex-col items-center justify-center text-center p-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-vm-primary blur-3xl opacity-10 animate-glow-bg" />
                  <div className="bg-vm-primary-light w-24 h-24 rounded-[2rem] flex items-center justify-center relative border border-vm-primary/10">
                    <FileText className="w-10 h-10 text-vm-primary" />
                    <div className="absolute -top-2 -right-2 bg-vm-primary p-2 rounded-full text-white shadow-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-vm-text tracking-tight mt-8">Vos textes apparaitront ici</h3>
                <p className="text-slate-400 mt-3 font-medium max-w-sm">
                  Remplissez les informations et cliquez sur generer pour obtenir des descriptions optimisees.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {(platform === 'instagram' || platform === 'both') && (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-black text-vm-text">Instagram</span>
                      <span className="text-[10px] text-slate-400 font-bold">{getBio('instagram').length} / 2200 caracteres</span>
                    </div>
                    <button
                      onClick={() => handleCopy(getBio('instagram'), 'ig')}
                      className="flex items-center gap-1.5 text-xs font-bold text-vm-primary hover:text-vm-primary-dark transition-colors px-3 py-2 rounded-xl hover:bg-vm-primary-light"
                    >
                      {copiedIg ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedIg ? 'Copie !' : 'Copier'}
                    </button>
                  </div>
                  <div className="p-8">
                    <pre className="whitespace-pre-wrap text-sm text-slate-600 font-medium leading-relaxed font-sans">
                      {getBio('instagram')}
                    </pre>
                  </div>
                </div>
              )}

              {(platform === 'tiktok' || platform === 'both') && (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-vm-text rounded-xl flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-black text-vm-text">TikTok</span>
                      <span className="text-[10px] text-slate-400 font-bold">{getBio('tiktok').length} / 2200 caracteres</span>
                    </div>
                    <button
                      onClick={() => handleCopy(getBio('tiktok'), 'tk')}
                      className="flex items-center gap-1.5 text-xs font-bold text-vm-primary hover:text-vm-primary-dark transition-colors px-3 py-2 rounded-xl hover:bg-vm-primary-light"
                    >
                      {copiedTk ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedTk ? 'Copie !' : 'Copier'}
                    </button>
                  </div>
                  <div className="p-8">
                    <pre className="whitespace-pre-wrap text-sm text-slate-600 font-medium leading-relaxed font-sans">
                      {getBio('tiktok')}
                    </pre>
                  </div>
                </div>
              )}

              {/* Publish CTA */}
              <div className="bg-vm-text p-6 rounded-[2rem] flex gap-5 items-center">
                <div className="bg-vm-primary w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(193,134,107,0.3)] shrink-0">
                  <ArrowRight className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-black uppercase tracking-tight">Publication rapide</p>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1 font-medium">
                    Copiez le texte et publiez directement sur vos reseaux.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
