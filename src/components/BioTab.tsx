'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Instagram, ArrowRight, FileText, Hash, Zap } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-vm-text tracking-tight">Bio & Textes</h1>
        <p className="text-vm-muted mt-2 text-[15px]">Generez des descriptions optimisees pour Instagram et TikTok.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left — Form */}
        <div className="space-y-6">
          {/* Property Info */}
          <div className="vm-card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-vm-primary" />
              <span className="text-xs font-medium text-vm-primary">Informations du bien</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ville" required value={ville} onChange={e => setVille(e.target.value)} placeholder="Tours" />
              <Input label="Quartier" required value={quartier} onChange={e => setQuartier(e.target.value)} placeholder="Beaujardin" />
            </div>
            <Input label="Prix" required value={prix} onChange={e => setPrix(e.target.value)} placeholder="250 000 €" />
          </div>

          {/* Tone selector */}
          <div className="vm-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-vm-primary" />
              <span className="text-xs font-medium text-vm-primary">Ton du texte</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tones.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTone(t.id); setGenerated(false); }}
                  className={`p-4 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                    tone === t.id
                      ? 'border-vm-primary bg-vm-primary-light'
                      : 'border-vm-border-light hover:border-vm-border hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <p className={`text-sm font-semibold mt-1.5 ${tone === t.id ? 'text-vm-primary' : 'text-vm-text'}`}>{t.label}</p>
                  <p className="text-[11px] text-vm-muted mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="vm-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-vm-primary" />
              <span className="text-xs font-medium text-vm-primary">Plateforme</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'instagram' as Platform, label: 'Instagram', icon: Instagram },
                { id: 'tiktok' as Platform, label: 'TikTok', icon: Zap },
                { id: 'both' as Platform, label: 'Les deux', icon: Sparkles },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    platform === p.id
                      ? 'bg-vm-primary/10 text-vm-primary'
                      : 'bg-vm-bg text-vm-muted hover:text-vm-text hover:bg-vm-border-light'
                  }`}
                >
                  <p.icon className="w-4 h-4" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <Button fullWidth disabled={!isValid} icon={<Sparkles className="w-4 h-4" />} onClick={handleGenerate}>
            Generer les textes
          </Button>
        </div>

        {/* Right — Results */}
        <div className="space-y-6">
          {!generated ? (
            <EmptyState
              icon={<FileText className="w-7 h-7 text-vm-primary" />}
              title="Vos textes apparaitront ici"
              description="Remplissez les informations et cliquez sur generer pour obtenir des descriptions optimisees."
            />
          ) : (
            <div className="space-y-5 animate-tab-enter">
              {(platform === 'instagram' || platform === 'both') && (
                <div className="vm-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-vm-border-light flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-vm-text">Instagram</span>
                      <span className="text-[10px] text-vm-muted">{getBio('instagram').length} / 2200</span>
                    </div>
                    <button
                      onClick={() => handleCopy(getBio('instagram'), 'ig')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-vm-primary hover:text-vm-primary-dark transition-colors px-2.5 py-1.5 rounded-lg hover:bg-vm-primary-light cursor-pointer"
                    >
                      {copiedIg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIg ? 'Copie !' : 'Copier'}
                    </button>
                  </div>
                  <div className="p-5">
                    <pre className="whitespace-pre-wrap text-sm text-vm-text leading-relaxed font-sans">
                      {getBio('instagram')}
                    </pre>
                  </div>
                </div>
              )}

              {(platform === 'tiktok' || platform === 'both') && (
                <div className="vm-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-vm-border-light flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-vm-text rounded-lg flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-vm-text">TikTok</span>
                      <span className="text-[10px] text-vm-muted">{getBio('tiktok').length} / 2200</span>
                    </div>
                    <button
                      onClick={() => handleCopy(getBio('tiktok'), 'tk')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-vm-primary hover:text-vm-primary-dark transition-colors px-2.5 py-1.5 rounded-lg hover:bg-vm-primary-light cursor-pointer"
                    >
                      {copiedTk ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTk ? 'Copie !' : 'Copier'}
                    </button>
                  </div>
                  <div className="p-5">
                    <pre className="whitespace-pre-wrap text-sm text-vm-text leading-relaxed font-sans">
                      {getBio('tiktok')}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tip card */}
              <div className="vm-card p-5 flex gap-4 items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-vm-primary/20 to-vm-primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <ArrowRight className="w-5 h-5 text-vm-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-vm-text">Publication rapide</p>
                  <p className="text-xs text-vm-muted mt-0.5">
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
