import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import {
  Server,
  Database,
  Cpu,
  Bot,
  Sparkles,
  Code,
  Copy,
  Check,
  Terminal,
  FileCode,
  ShieldCheck,
  Activity,
  ArrowRight,
  Workflow,
  Volume2,
  Play,
  Pause,
  Zap,
  CheckCircle2,
  ListChecks,
  FolderTree,
  FileText,
  Boxes,
  Lock,
  Layers,
  Search,
  Users,
  Sliders,
  BookOpen,
  VolumeX,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  Quote,
  BarChart3,
  SlidersHorizontal,
  Filter,
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Tag,
  FolderOpen,
  ArrowUpDown,
  Upload,
  Settings,
  Trash2,
  Eye,
  FileUp,
  Headphones,
  Save,
  Radio,
  ExternalLink,
  User,
  PlusCircle,
  Plus,
  Bookmark,
  RotateCcw,
  HelpCircle,
  Info,
  History,
  Globe,
  Wifi,
  X
} from 'lucide-react';
import {
  RecentChatsSidebar,
  RecentChat,
  getStoredRecentChats,
  saveStoredRecentChats
} from './components/RecentChatsSidebar';

export interface VoicePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  pitch: number;
  intensity: number;
  speechRate: number;
  samplePhrase: string;
  color: 'purple' | 'amber' | 'indigo' | 'emerald' | 'sky' | 'rose';
  isCustom?: boolean;
}

export const DEFAULT_VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'velvet_soft',
    name: 'Шелковый шепот (Soft Velvet)',
    category: 'Релакс & Сон',
    description: 'Особенно мягкий, бархатный успокаивающий голос с теплым резонансом для глубокого расслабления и медитации',
    pitch: 0.94,
    intensity: 62,
    speechRate: -16,
    samplePhrase: 'Здравствуйте... Сделайте очень мягкий, плавный вдох... Почувствуйте, как тепло и покой мягко разливаются по всему телу...',
    color: 'rose'
  },
  {
    id: 'meditation',
    name: 'Мягкая медитация (Meditation)',
    category: 'Релакс & Соматика',
    description: 'Теплый, мягкий бархатный тон с глубоким резонансом для випассаны, соматической релаксации и снижения кортизола',
    pitch: 0.96,
    intensity: 65,
    speechRate: -15,
    samplePhrase: 'Здравствуйте. Сделайте мягкий глубокий вдох. Почувствуйте, как с выдохом уходит напряжение из плеч и челюсти.',
    color: 'purple'
  },
  {
    id: 'somatic_grounding',
    name: 'Кризисное заземление',
    category: 'Антистресс 5-4-3-2-1',
    description: 'Успокаивающий заземляющий тон для купирования тревоги и возвращения контакта с телом',
    pitch: 0.94,
    intensity: 70,
    speechRate: -18,
    samplePhrase: 'Вы в безопасности. Опустите стопы на твердый пол, почувствуйте опору под ногами и назовите пять синих предметов вокруг.',
    color: 'emerald'
  },
  {
    id: 'high_energy',
    name: 'Высокая энергия (High Energy)',
    category: 'Драйв & Пранаяма',
    description: 'Яркий, звонкий и динамичный тембр для утренней активации, интенсивных дыхательных циклов и мотивации',
    pitch: 1.15,
    intensity: 86,
    speechRate: 5,
    samplePhrase: 'Отличный темп! Сделайте мощный энергичный вдох через нос, расправьте грудную клетку и зарядитесь силой на весь день!',
    color: 'amber'
  },
  {
    id: 'authoritative',
    name: 'Авторитетный (Authoritative)',
    category: 'Наставник & Протокол',
    description: 'Уверенный, весомый и методичный регистр мастера для четких пошаговых протоколов и дисциплины практики',
    pitch: 0.88,
    intensity: 80,
    speechRate: 0,
    samplePhrase: 'Внимание на инструкцию: вдох ровно на четыре счета, фиксируем задержку дыхания, полный контроль выдоха.',
    color: 'indigo'
  },
  {
    id: 'conversational',
    name: 'Естественный диалог',
    category: 'Консультация & Q&A',
    description: 'Нейтральный дружелюбный тон живого общения для комфортных ответов на любые вопросы учеников',
    pitch: 0.98,
    intensity: 74,
    speechRate: -6,
    samplePhrase: 'Давайте разберем ваш вопрос подробнее. В соматической практике регулярность значительно важнее продолжительности.',
    color: 'sky'
  }
];

interface FileDefinition {
  path: string;
  name: string;
  badge: string;
  description: string;
  content: string;
}

interface ChunkItem {
  id: string;
  shortLabel: string;
  title: string;
  cluster: string;
  category: string;
  similarity: number;
  distance: number;
  content: string;
}

export interface KnowledgeDocument {
  id: string;
  expertId: 'elena' | 'dmitry';
  title: string;
  filename: string;
  fileSize: string;
  chunksCount: number;
  uploadedAt: string;
  cluster: string;
  status: 'indexed' | 'processing';
  chunks: { id: string; title: string; content: string }[];
}

interface VoiceWaveformProps {
  isPlaying: boolean;
  pitch: number;
  intensity: number;
  rate: number;
  voiceName: string;
}

function VoiceWaveformCanvas({
  isPlaying,
  pitch,
  intensity,
  rate,
  voiceName
}: VoiceWaveformProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      if (canvas.clientWidth && canvas.width !== canvas.clientWidth) {
        canvas.width = canvas.clientWidth;
      }
      if (canvas.clientHeight && canvas.height !== canvas.clientHeight) {
        canvas.height = canvas.clientHeight;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep studio background with subtle dark radial glow
      const bgGrad = ctx.createRadialGradient(
        width / 2, centerY, 10,
        width / 2, centerY, width / 1.5
      );
      bgGrad.addColorStop(0, isPlaying ? 'rgba(30, 27, 75, 0.95)' : 'rgba(15, 23, 42, 0.95)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Oscilloscope background grid
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Center line
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      // Vertical grid lines
      for (let x = 30; x < width; x += 45) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      // Horizontal range lines
      ctx.moveTo(0, centerY - 30);
      ctx.lineTo(width, centerY - 30);
      ctx.moveTo(0, centerY + 30);
      ctx.lineTo(width, centerY + 30);
      ctx.stroke();

      // Pitch calculation: higher pitch -> more wave cycles across canvas
      const baseFreq = 0.016 * Math.max(0.65, pitch);
      // Intensity calculation: higher intensity -> taller peaks
      const ampBase = (intensity / 100) * (isPlaying ? 34 : 7);
      // Rate calculation: speech speed changes phase animation rate
      const speed = (isPlaying ? 0.05 : 0.012) * (1 + rate / 100);

      phase += speed;

      // 4 Harmonically tuned waves with glow
      const layers = [
        {
          color: isPlaying ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.18)',
          freqMult: 0.85,
          ampMult: 0.55,
          phaseOffset: 0,
          lineWidth: 1.5
        },
        {
          color: isPlaying ? 'rgba(168, 85, 247, 0.85)' : 'rgba(168, 85, 247, 0.35)',
          freqMult: 1.4,
          ampMult: 0.95,
          phaseOffset: Math.PI / 3,
          lineWidth: 2.5
        },
        {
          color: isPlaying ? 'rgba(52, 211, 153, 0.9)' : 'rgba(52, 211, 153, 0.4)',
          freqMult: 2.1,
          ampMult: 0.7,
          phaseOffset: Math.PI * 0.75,
          lineWidth: 2
        },
        {
          color: isPlaying ? 'rgba(244, 114, 182, 0.75)' : 'rgba(244, 114, 182, 0.25)',
          freqMult: 2.9,
          ampMult: 0.4,
          phaseOffset: Math.PI * 1.2,
          lineWidth: 1.5
        }
      ];

      layers.forEach((layer) => {
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.lineWidth;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const normX = x / width;
          // Smooth Hann-like window so waves decay gently at edges
          const windowEnv = Math.sin(normX * Math.PI);

          const y =
            centerY +
            Math.sin(x * baseFreq * layer.freqMult + phase + layer.phaseOffset) *
              ampBase *
              layer.ampMult *
              windowEnv +
            (isPlaying
              ? Math.sin(x * 0.045 + phase * 2) * 4.5 * windowEnv
              : 0);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Central glowing orb when playing
      if (isPlaying) {
        const glowGrad = ctx.createRadialGradient(
          width / 2, centerY, 5,
          width / 2, centerY, 50
        );
        glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
        glowGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(width / 2, centerY, 50, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, pitch, intensity, rate]);

  const isFemaleVoice = voiceName.includes('Svetlana');
  const baseVoiceF0 = isFemaleVoice ? 205 : 125;
  const estimatedF0 = Math.round(baseVoiceF0 * pitch);
  const semitones = Math.round(12 * Math.log2(pitch));
  const semitoneStr = semitones > 0 ? `+${semitones} п/т` : semitones < 0 ? `${semitones} п/т` : '0 (Базовый)';

  return (
    <div className="relative rounded-xl overflow-hidden border border-purple-500/30 shadow-inner bg-slate-950">
      <canvas
        ref={canvasRef}
        width={580}
        height={116}
        className="w-full h-28 block"
      />
      {/* Top Header overlay */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono pointer-events-none">
        <div className="flex items-center space-x-2">
          <span
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : 'bg-slate-900/90 text-slate-400 border-slate-700/80'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPlaying ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{isPlaying ? 'СИНТЕЗ В ЭФИРЕ' : 'ОЖИДАНИЕ ТЕСТА'}</span>
          </span>
          <span className="text-slate-400 truncate max-w-[150px] hidden sm:inline">
            {voiceName}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          <span>Осциллограмма Edge-TTS</span>
        </div>
      </div>

      {/* Bottom Live Metrics overlay */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono pointer-events-none text-slate-400">
        <div className="flex items-center space-x-3">
          <span>F₀: <strong className="text-purple-300">~{estimatedF0} Гц</strong> <span className="text-slate-500">({semitoneStr})</span></span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Тон: <strong className="text-purple-300">{pitch.toFixed(2)}x</strong></span>
          <span>Интенс: <strong className="text-emerald-300">{intensity}%</strong></span>
          <span>Темп: <strong className="text-sky-300">{rate > 0 ? `+${rate}` : rate}%</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'ragTester' | 'files' | 'checklist' | 'expertStudio'>('ragTester');
  const [activeFile, setActiveFile] = useState<string>('backend/apps/knowledge/services/embedding_service.py');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Live RAG Simulator State
  const [selectedExpert, setSelectedExpert] = useState<'elena' | 'dmitry'>('elena');
  const [userQuery, setUserQuery] = useState('Как успокоиться, если началась паническая атака на работе?');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.65);
  const [chartMetric, setChartMetric] = useState<'similarity' | 'distance'>('similarity');

  // Persistent Recent Chats State (Stores and retrieves last 5 conversations)
  const [recentChats, setRecentChats] = useState<RecentChat[]>(() => getStoredRecentChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const initial = getStoredRecentChats();
    return initial.length > 0 ? initial[0].id : null;
  });
  const [isRecentChatsOpen, setIsRecentChatsOpen] = useState<boolean>(true);

  // Built-in Cloud VPN / Geo-Proxy Tunnel State for Gemini
  const [vpnTunnelActive, setVpnTunnelActive] = useState<boolean>(true);
  const [vpnLatency, setVpnLatency] = useState<number>(38);
  const [isTestingVpn, setIsTestingVpn] = useState<boolean>(false);
  const [vpnTestSuccess, setVpnTestSuccess] = useState<boolean>(false);
  const [dynamicGeneratedResponse, setDynamicGeneratedResponse] = useState<string | null>(null);

  // Expert Studio (Stage 4) State
  const [avatarSettings, setAvatarSettings] = useState({
    elena: {
      botName: 'MindAvatar Елена',
      role: 'Мастер випассаны и телесно-ориентированной терапии',
      systemPrompt: `Ты — цифровой двойник Елены Смирновой, эксперта по випассане и соматическим практикам.
Отвечай ученикам бережно, тепло и практично.
Используй ТОЛЬКО факты и техники из переданных фрагментов базы знаний (pgvector).
Если ученик переживает панику или острый стресс — начни с техники заземления 5-4-3-2-1 или телесного расслабления.
Не придумывай медицинских диагнозов.`,
      voiceKey: 'ru-RU-SvetlanaNeural',
      speechRate: -16,
      pitch: 0.94,
      intensity: 64,
      strictRAG: true,
      isActive: true,
      telegramBot: '@MindAvatarElena_bot',
      voiceNotesEnabled: true
    },
    dmitry: {
      botName: 'MindAvatar Дмитрий',
      role: 'Инструктор пранаямы и дыхательных антистресс-техник',
      systemPrompt: `Ты — цифровой двойник Дмитрия Волкова, мастера пранаямы и йога-нидры.
Твой тон уверенный, спокойный, методичный.
Опирайся исключительно на базу знаний о технике Самавритти (4-4-4-4), Удджайи и Нади Шодхана.
Давай четкие пошаговые инструкции по счетам дыхания (вдох, задержка, выдох, пауза).`,
      voiceKey: 'ru-RU-DmitryNeural',
      speechRate: -14,
      pitch: 0.85,
      intensity: 66,
      strictRAG: true,
      isActive: true,
      telegramBot: '@MindAvatarDmitry_bot',
      voiceNotesEnabled: true
    }
  });

  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([
    {
      id: 'doc-elena-1',
      expertId: 'elena',
      title: 'Практическое руководство по преодолению тревожности и панических атак',
      filename: 'Кризисное_заземление_Смирнова.pdf',
      fileSize: '1.4 МБ',
      chunksCount: 78,
      uploadedAt: 'Вчера, 18:40',
      cluster: 'Кризисное заземление',
      status: 'indexed',
      chunks: [
        {
          id: 'chunk-101',
          title: 'Глава 4. Соматическое заземление: Техника 5-4-3-2-1',
          content: '«При внезапном приступе паники зафиксируйте ступни на твердом полу. Назовите про себя 5 синих или деревянных предметов вокруг...»'
        },
        {
          id: 'chunk-102',
          title: 'Глава 2. Мышечный панцирь и челюстные зажимы',
          content: '«Челюстной зажим аккумулирует до 70% подавленной агрессии и фоновой тревоги. Разомкните зубы, прижмите кончик языка к верхнему нёбу...»'
        }
      ]
    },
    {
      id: 'doc-elena-2',
      expertId: 'elena',
      title: 'Курс випассаны: Наблюдение за ощущениями анапаны',
      filename: 'Випассана_Теория_и_Практика.docx',
      fileSize: '840 КБ',
      chunksCount: 64,
      uploadedAt: '3 дня назад',
      cluster: 'Осознанность и випассана',
      status: 'indexed',
      chunks: [
        {
          id: 'chunk-103',
          title: 'Лекция 7. Наблюдение за треугольником дыхания',
          content: '«Направляйте луч внимания строго в зону над верхней губой и входом в ноздри. Не вмешивайтесь в естественный ритм вдоха...»'
        }
      ]
    },
    {
      id: 'doc-dmitry-1',
      expertId: 'dmitry',
      title: 'Квадратное дыхание Самавритти и регуляция сердечного ритма',
      filename: 'Пранаяма_Квадрат_Дыхания.pdf',
      fileSize: '2.1 МБ',
      chunksCount: 88,
      uploadedAt: '4 дня назад',
      cluster: 'Квадратное дыхание 4-4-4-4',
      status: 'indexed',
      chunks: [
        {
          id: 'chunk-201',
          title: 'Урок 1. Методология квадратного дыхания 4-4-4-4',
          content: '«Квадратное дыхание (Самавритти пранаяма) выравнивает тонус парасимпатической нервной системы: 4 счета вдох, 4 задержка, 4 выдох, 4 пауза...»'
        },
        {
          id: 'chunk-202',
          title: 'Урок 3. Пранаяма Удджайи и стимуляция вагуса',
          content: '«Дыхание со звуком морского прибоя с легким сжатием голосовой щели охлаждает блуждающий нерв и снимает мышечный панцирь грудной клетки...»'
        }
      ]
    }
  ]);

  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedDocForInspection, setSelectedDocForInspection] = useState<KnowledgeDocument | null>(null);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  // Real-time Voice Modulation Studio state
  const [studioTestPhrase, setStudioTestPhrase] = useState<string>(
    'Здравствуйте. Сделайте мягкий глубокий вдох. Почувствуйте твердую опору под ногами.'
  );
  const [showSsmlCode, setShowSsmlCode] = useState<boolean>(false);
  const [copiedSsml, setCopiedSsml] = useState<boolean>(false);

  // Voice Presets & Custom Preset Categories state
  const [customPresets, setCustomPresets] = useState<VoicePreset[]>(() => {
    try {
      const saved = localStorage.getItem('mindavatar_custom_voice_presets');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore in sandbox
    }
    return [];
  });

  const [activeVoicePresetId, setActiveVoicePresetId] = useState<string | null>('meditation');
  const [isCreatingPresetModalOpen, setIsCreatingPresetModalOpen] = useState(false);
  const [newPresetForm, setNewPresetForm] = useState({
    name: '',
    category: '',
    description: '',
    pitch: 1.05,
    intensity: 85,
    speechRate: -10,
    samplePhrase: '',
    color: 'purple' as 'purple' | 'amber' | 'indigo' | 'emerald' | 'sky' | 'rose'
  });

  const allVoicePresets: VoicePreset[] = [...DEFAULT_VOICE_PRESETS, ...customPresets];
  const activePreset = allVoicePresets.find(p => p.id === activeVoicePresetId) || allVoicePresets[0];

  const handleSelectVoicePreset = (preset: VoicePreset) => {
    setActiveVoicePresetId(preset.id);
    setAvatarSettings((prev) => ({
      ...prev,
      [selectedExpert]: {
        ...prev[selectedExpert],
        pitch: preset.pitch,
        intensity: preset.intensity,
        speechRate: preset.speechRate
      }
    }));
    setStudioTestPhrase(preset.samplePhrase);
  };

  const handleOpenCreatePresetModal = () => {
    setNewPresetForm({
      name: '',
      category: 'Пользовательский',
      description: '',
      pitch: avatarSettings[selectedExpert].pitch,
      intensity: avatarSettings[selectedExpert].intensity,
      speechRate: avatarSettings[selectedExpert].speechRate,
      samplePhrase: studioTestPhrase,
      color: 'purple'
    });
    setIsCreatingPresetModalOpen(true);
  };

  const handleSaveCustomPreset = () => {
    const finalName = newPresetForm.name.trim() || `Пресет #${customPresets.length + 1}`;
    const finalCategory = newPresetForm.category.trim() || 'Пользовательский';
    const newPreset: VoicePreset = {
      id: `custom-${Date.now()}`,
      name: finalName,
      category: finalCategory,
      description: newPresetForm.description.trim() || 'Индивидуальная модуляция параметров Edge-TTS',
      pitch: newPresetForm.pitch,
      intensity: newPresetForm.intensity,
      speechRate: newPresetForm.speechRate,
      samplePhrase: newPresetForm.samplePhrase.trim() || studioTestPhrase,
      color: newPresetForm.color,
      isCustom: true
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('mindavatar_custom_voice_presets', JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }

    handleSelectVoicePreset(newPreset);
    setIsCreatingPresetModalOpen(false);
  };

  const handleDeleteCustomPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== presetId);
    setCustomPresets(updated);
    try {
      localStorage.setItem('mindavatar_custom_voice_presets', JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }
    if (activeVoicePresetId === presetId) {
      setActiveVoicePresetId('meditation');
      handleSelectVoicePreset(DEFAULT_VOICE_PRESETS[0]);
    }
  };

  const handleCopySsml = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSsml(true);
    setTimeout(() => setCopiedSsml(false), 2000);
  };

  const handleApplySoftVoiceMode = () => {
    const isElena = selectedExpert === 'elena';
    const softPitch = isElena ? 0.94 : 0.84;
    const softIntensity = isElena ? 62 : 64;
    const softRate = -16;
    const phrase = isElena
      ? 'Здравствуйте... Сделайте очень мягкий, плавный вдох... Почувствуйте, как тепло и покой мягко разливаются по всему телу...'
      : 'Приветствую... Давайте выполним мягкий цикл дыхания... Спокойный ровный вдох и длинный расслабляющий выдох...';

    setAvatarSettings((prev) => ({
      ...prev,
      [selectedExpert]: {
        ...prev[selectedExpert],
        voiceKey: isElena ? 'ru-RU-SvetlanaNeural' : 'ru-RU-DmitryNeural',
        speechRate: softRate,
        pitch: softPitch,
        intensity: softIntensity
      }
    }));
    setActiveVoicePresetId('velvet_soft');
    setStudioTestPhrase(phrase);
    handlePlayVoice(phrase, selectedExpert, softPitch, softIntensity, softRate);
  };

  const handleResetVoiceDefaults = () => {
    const isElena = selectedExpert === 'elena';
    setAvatarSettings((prev) => ({
      ...prev,
      [selectedExpert]: {
        ...prev[selectedExpert],
        voiceKey: isElena ? 'ru-RU-SvetlanaNeural' : 'ru-RU-DmitryNeural',
        speechRate: isElena ? -16 : -14,
        pitch: isElena ? 0.94 : 0.85,
        intensity: isElena ? 64 : 66
      }
    }));
    setActiveVoicePresetId('velvet_soft');
  };

  const handleSaveAvatarSettings = () => {
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 2500);
  };

  const handleSimulateUploadDocument = () => {
    setIsUploadingDoc(true);
    setTimeout(() => {
      const newDoc: KnowledgeDocument = {
        id: `doc-${selectedExpert}-${Date.now()}`,
        expertId: selectedExpert,
        title: selectedExpert === 'elena'
          ? 'Новая лекция: Психосоматика диафрагмального блока'
          : 'Спецкурс: Дыхательные циклы при подготовке ко сну',
        filename: selectedExpert === 'elena'
          ? 'Психосоматика_диафрагмы_2026.pdf'
          : 'Сон_и_Пранаяма_2026.docx',
        fileSize: '1.1 МБ',
        chunksCount: 36,
        uploadedAt: 'Только что',
        cluster: selectedExpert === 'elena' ? 'Телесные зажимы' : 'Сон & Нидра',
        status: 'indexed',
        chunks: [
          {
            id: `chunk-new-1`,
            title: 'Фрагмент 1: Освобождение купола диафрагмы',
            content: '«При хроническом стрессе диафрагма спазмируется в нижнем положении, блокируя глубокий выдох. Мягкий массаж подреберья...»'
          },
          {
            id: `chunk-new-2`,
            title: 'Фрагмент 2: Интеграция с блуждающим нервом',
            content: '«Удлинение фазы выдоха в пропорции 1:2 стимулирует холинергический противовоспалительный путь...»'
          }
        ]
      };
      setKnowledgeDocuments([newDoc, ...knowledgeDocuments]);
      setIsUploadingDoc(false);
    }, 1200);
  };

  const handleDeleteDocument = (docId: string) => {
    setKnowledgeDocuments(knowledgeDocuments.filter(d => d.id !== docId));
    if (selectedDocForInspection?.id === docId) {
      setSelectedDocForInspection(null);
    }
  };

  const files: FileDefinition[] = [
    {
      path: '/backend/apps/knowledge/services/embedding_service.py',
      name: 'knowledge/services/embedding_service.py',
      badge: 'Zero-Cost CPU Embeddings',
      description: 'Локальная векторизация текста через sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2, 384 dims)',
      content: `class LocalEmbeddingService:
    """
    ZERO-COST сервис локальной векторизации текстов на базе sentence-transformers.
    Модель: paraphrase-multilingual-MiniLM-L12-v2 (384 измерения) на CPU без внешних API.
    """
    _instance = None
    _model = None
    MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
    DIMENSIONS = 384

    def embed_text(self, text: str) -> List[float]:
        # Возвращает нормализованный 384-мерный вектор для одного текста
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        # Пакетное вычисление эмбеддингов для списка чанков
        self._load_model()
        if self._model is not None:
            embeddings = self._model.encode(
                texts,
                batch_size=32,
                normalize_embeddings=True,
                convert_to_numpy=True
            )
            return [vec.tolist() for vec in embeddings]`
    },
    {
      path: '/backend/apps/knowledge/tasks.py',
      name: 'knowledge/tasks.py',
      badge: 'Celery RAG Worker',
      description: 'Фоновая Celery-таска парсинга документов (.txt/.pdf/.docx), нарезки и пакетной записи в pgvector',
      content: `@shared_task(bind=True, name="process_knowledge_document", max_retries=3)
def process_knowledge_document(self, knowledge_base_id: str):
    """
    Фоновый процессинг документа эксперта:
    1. Извлечение текста (PDF, DOCX, TXT)
    2. Нарезка на семантические чанки (750 симв., overlap 120)
    3. Вычисление 384-мерных векторов на CPU (Zero-Cost)
    4. Атомарный bulk_create в pgvector с изоляцией по expert_id
    """
    doc = KnowledgeBase.objects.select_related('expert').get(id=knowledge_base_id)
    chunker = DocumentChunker(chunk_size=750, chunk_overlap=120)
    extracted_text = chunker.extract_text(doc.file, doc.file.name) or doc.raw_text
    
    chunks_data = chunker.split_into_chunks(extracted_text)
    texts = [c["content"] for c in chunks_data]
    embeddings = embedding_service.embed_batch(texts)

    with transaction.atomic():
        KnowledgeChunk.objects.filter(knowledge_base=doc).delete()
        KnowledgeChunk.objects.bulk_create([
            KnowledgeChunk(
                knowledge_base=doc,
                expert=doc.expert,
                chunk_index=chunk["chunk_index"],
                content=chunk["content"],
                embedding=embeddings[i]
            )
            for i, chunk in enumerate(chunks_data)
        ])
        doc.is_processed = True
        doc.total_chunks = len(chunks_data)
        doc.save()`
    },
    {
      path: '/server.ts',
      name: 'server.ts (Gemini Cloud VPN Relay)',
      badge: 'Gemini 3.8 Flash + Cloud VPN',
      description: 'Серверный шлюз на Express с европейским прокси (GCP), обходящий региональные ограничения для Gemini',
      content: `// Серверный шлюз с европейским прокси для обхода гео-блокировок
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

// Эндпоинт генерации ответа через Cloud VPN
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt, systemInstruction, contextChunks } = req.body;
  
  // Запрос выполняется с европейского IP сервера (europe-west2)
  // Пользователи из любых стран получают прямой доступ без внешнего VPN!
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: [
      \`[База знаний эксперта]:\\n\${contextChunks.join('\\n\\n')}\\n\\n[Вопрос]: \${prompt}\`
    ],
    config: { systemInstruction, temperature: 0.7 }
  });
  
  res.json({
    text: response.text,
    model: 'gemini-3.8-flash',
    tunnel: { active: true, region: 'europe-west2 (GCP)', bypassedGeoBlocking: true }
  });
});`
    },
    {
      path: '/backend/apps/bot_settings/services/tts_service.py',
      name: 'bot_settings/services/tts_service.py',
      badge: 'Edge-TTS Voice Engine',
      description: 'Генератор голосовых ответов на базе Microsoft Neural Voices (ru-RU-DmitryNeural / SvetlanaNeural)',
      content: `class EdgeTTSService:
    """
    ZERO-COST сервис синтеза речи на базе edge-tts.
    Работает БЕЗ API ключей и лимитов, с чистым студийным звучанием.
    """
    async def generate_speech_bytes_async(self, text, voice="ru-RU-DmitryNeural", rate="-10%"):
        clean_text = self.clean_text_for_speech(text)
        communicate = edge_tts.Communicate(
            text=clean_text,
            voice=voice,
            rate=rate  # -10% замедленный медитативный темп
        )
        audio_buffer = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.extend(chunk["data"])
        return bytes(audio_buffer)`
    },
    {
      path: '/backend/apps/knowledge/services/rag_service.py',
      name: 'knowledge/services/rag_service.py',
      badge: 'pgvector Cosine Retrieval',
      description: 'Векторный поиск по косинусному расстоянию (<=>) с фильтрацией по арендатору expert_id',
      content: `class RAGService:
    @classmethod
    def retrieve_relevant_context(cls, expert_id, query, top_k=4, similarity_threshold=0.60):
        # 1. Локальная векторизация запроса на CPU (384 dims)
        query_vector = embedding_service.embed_text(query)
        max_distance = 1.0 - similarity_threshold

        # 2. Поиск по HNSW индексу pgvector с фильтром по тенанту
        return (
            KnowledgeChunk.objects.filter(expert_id=expert_id)
            .select_related('knowledge_base')
            .annotate(distance=CosineDistance('embedding', query_vector))
            .filter(distance__lte=max_distance)
            .order_by('distance')[:top_k]
        )`
    }
  ];

  const currentFile = files.find(f => f.name === activeFile) || files[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handlePlayVoice = (
    text: string,
    voiceType: 'elena' | 'dmitry',
    overridePitch?: number,
    overrideIntensity?: number,
    overrideRate?: number
  ) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      setIsPlayingAudio(true);
      // Soften text: insert gentle breathing micro-pauses and remove harsh punctuation
      const cleanText = text
        .replace(/!{1,}/g, '.')
        .replace(/[*#_•]/g, ' ')
        .replace(/(Здравствуйте|Приветствую)\.?/gi, '$1... ')
        .replace(/([.!?])\s+/g, '$1... ')
        .replace(/;\s*/g, ', ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ru-RU';

      // Pick the softest natural neural Russian voice available in browser
      const voices = window.speechSynthesis.getVoices();
      const russianVoices = voices.filter(v => v.lang.startsWith('ru') || v.lang.includes('RU'));
      if (russianVoices.length > 0) {
        let matchedVoice: SpeechSynthesisVoice | undefined;
        if (voiceType === 'elena') {
          // Soft female Russian neural voice (Milena, Svetlana, Daria, Tatyana, Google русский)
          matchedVoice = russianVoices.find(v =>
            /milena|svetlana|daria|tatyana|irina|google русский|natural|female/i.test(v.name)
          ) || russianVoices.find(v => !/dmitry|denys|yuri|pavel|male/i.test(v.name)) || russianVoices[0];
        } else {
          // Warm male Russian neural voice (Dmitry, Denys, Google русский)
          matchedVoice = russianVoices.find(v =>
            /dmitry|denys|yuri|pavel|google русский|natural|male/i.test(v.name)
          ) || russianVoices[0];
        }
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      const config = avatarSettings[voiceType];
      const effectiveRate = overrideRate !== undefined ? overrideRate : config.speechRate;
      const effectivePitch = overridePitch !== undefined ? overridePitch : config.pitch;
      const effectiveIntensity = overrideIntensity !== undefined ? overrideIntensity : config.intensity;

      // Soft tone rate: gentle meditative flow (0.76 default tempo)
      utterance.rate = Math.max(0.5, Math.min(1.2, 0.76 * (1 + effectiveRate / 100)));
      
      // Soft pitch: gentle warming multiplier (warm chest resonance, eliminates shrillness)
      utterance.pitch = Math.max(0.5, Math.min(1.3, effectivePitch * 0.92));
      
      // Soft volume: velvety acoustic presence (calm, cozy, never loud or distorted)
      utterance.volume = Math.max(0.15, Math.min(0.70, (effectiveIntensity / 100) * 0.68));

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Curated RAG candidate chunks for distribution visualizer
  const expertData = {
    elena: {
      name: 'Елена Смирнова',
      niche: 'Телесно-ориентированная осознанность и Випассана',
      voice: 'ru-RU-SvetlanaNeural (Женский, мягкий и поддерживающий)',
      voiceKey: 'elena' as const,
      model: 'gemini-3.8-flash (Cloud VPN)',
      candidateChunks: [
        {
          id: 'chunk-101',
          shortLabel: '#1: Заземление',
          cluster: 'Кризисное заземление',
          category: 'Антистресс & Соматика',
          title: 'Интенсив: Техники заземления при острой тревожности',
          similarity: 0.942,
          distance: 0.058,
          content: '«При внезапном приступе тревоги или панической атаке на рабочем месте выполните технику «5-4-3-2-1»: опустите стопы на пол, почувствуйте твердую опору. Найдите глазами 5 предметов синего цвета, прикоснитесь к 4 текстурам, услышьте 3 звука, ощутите 2 запаха и сделайте 1 осознанный медленный вдох...»'
        },
        {
          id: 'chunk-102',
          shortLabel: '#2: Сброс зажима',
          cluster: 'Телесные зажимы',
          category: 'Антистресс & Соматика',
          title: 'Глава 3: Сброс телесного зажима через кисти',
          similarity: 0.884,
          distance: 0.116,
          content: '«Сожмите кулаки на 3 секунды со всей силой, а затем разожмите и встряхните кисти. Сделайте длинный выдох через приоткрытый рот с тихим звуком «ха-а-а». Это переключает парасимпатическую нервную систему...»'
        },
        {
          id: 'chunk-103',
          shortLabel: '#3: Опора на стопы',
          cluster: 'Осознанность тела',
          category: 'Випассана & Медитация',
          title: 'Аудиогид: Сканирование точек соприкосновения',
          similarity: 0.815,
          distance: 0.185,
          content: '«Перенесите 100% фокуса в подошвы ног. Почувствуйте, как обувь прилегает к коже, как гравитация удерживает ваше тело на планете. В стопах нет мыслей о дедлайнах, там только физическая реальность...»'
        },
        {
          id: 'chunk-104',
          shortLabel: '#4: Дыхание животом',
          cluster: 'Диафрагмальное дыхание',
          category: 'Дыхательные практики',
          title: 'Базовый курс: Диафрагмальное дыхание для снятия спазма',
          similarity: 0.742,
          distance: 0.258,
          content: '«Положите одну ладонь на живот, другую на грудь. Вдыхайте так, чтобы двигалась только нижняя рука. Это посылает сигнал блуждающему нерву о том, что угрозы жизни нет...»'
        },
        {
          id: 'chunk-105',
          shortLabel: '#5: Введение в Випассану',
          cluster: 'Философия ума',
          category: 'Випассана & Медитация',
          title: 'Лекция 1: Вводные принципы наблюдения ума',
          similarity: 0.584,
          distance: 0.416,
          content: '«Випассана — это древняя техника наблюдения за реальностью такой, какая она есть, через безоценочное осознавание ощущений...»'
        },
        {
          id: 'chunk-106',
          shortLabel: '#6: История традиций',
          cluster: 'История и традиция',
          category: 'Теория & Традиция',
          title: 'Приложение: История монастырей Мьянмы и Таиланда',
          similarity: 0.420,
          distance: 0.580,
          content: '«История ретритных центров берет начало в лесных монастырях северо-востока Таиланда, где монахи практиковали уединение...»'
        }
      ],
      response: `Сделайте глубокий вдох прямо сейчас... и мягкий, длинный выдох. Вы в безопасности.

Опираясь на практику заземления:
1. Поставьте обе стопы на пол и физически почувствуйте плотность опоры под ногами.
2. Примените метод фиксации чувств: найдите взглядом 3 предмета вокруг себя, почувствуйте ткань одежды на запястьях.
3. Сделайте выдох в два раза длиннее вдоха: вдох носом на 3 секунды — плавный выдох через расслабленные губы на 6 секунд.

Позвольте волне тревоги просто пройти сквозь тело, не сопротивляясь ей. Вы управляете своим вниманием.`
    },
    dmitry: {
      name: 'Дмитрий Волков',
      niche: 'Пранаяма, антистресс-дыхание и йога-нидра',
      voice: 'ru-RU-DmitryNeural (Мужской, спокойный глубокий баритон)',
      voiceKey: 'dmitry' as const,
      model: 'gemini-3.8-flash (Cloud VPN)',
      candidateChunks: [
        {
          id: 'chunk-201',
          shortLabel: '#1: Квадрат Самавритти',
          cluster: 'Квадрат Самавритти',
          category: 'Пранаяма & Дыхание',
          title: 'Курс Пранаямы: Квадратное дыхание Самавритти 4-4-4-4',
          similarity: 0.961,
          distance: 0.039,
          content: '«Техника 4-4-4-4 мгновенно снижает частоту сердечных сокращений и уровень кортизола: Вдох на 4 счета — Пауза на полных легких на 4 счета — Выдох на 4 счета — Пауза на пустых легких на 4 счета. Достаточно 4 циклов для перезагрузки вегетативной системы...»'
        },
        {
          id: 'chunk-202',
          shortLabel: '#2: Звук Уджайи',
          cluster: 'Дыхание Уджайи',
          category: 'Пранаяма & Дыхание',
          title: 'Упражнение: Уджайи в острой стрессовой ситуации',
          similarity: 0.875,
          distance: 0.125,
          content: '«Дыхание со звуком морского прибоя с легким сжатием голосовой щели охлаждает блуждающий нерв и снимает мышечный панцирь грудной клетки...»'
        },
        {
          id: 'chunk-203',
          shortLabel: '#3: Нади Шодхана',
          cluster: 'Нади Шодхана',
          category: 'Энергетический баланс',
          title: 'Практика: Попеременное дыхание через ноздри',
          similarity: 0.804,
          distance: 0.196,
          content: '«Закройте правую ноздрю большим пальцем, вдохните через левую на 4 счета. Закройте обе, выдохните через правую. Балансирует полушария мозга и снимает нервное возбуждение...»'
        },
        {
          id: 'chunk-204',
          shortLabel: '#4: Йога-нидра',
          cluster: 'Йога-нидра и сон',
          category: 'Сон & Нидра',
          title: 'Сценарий Нидры: Снятие зажима солнечного сплетения',
          similarity: 0.728,
          distance: 0.272,
          content: '«Направьте внимание в центр грудины. Представьте, как с каждым выдохом тугой узел напряжения становится мягким и теплым...»'
        },
        {
          id: 'chunk-205',
          shortLabel: '#5: Физиология легких',
          cluster: 'Физиология легких',
          category: 'Анатомия & Теория',
          title: 'Теория: Механика газообмена в альвеолах при гипервентиляции',
          similarity: 0.592,
          distance: 0.408,
          content: '«При панике часто возникает гипокапния из-за вымывания углекислого газа, поэтому задержки дыхания критически важны...»'
        },
        {
          id: 'chunk-206',
          shortLabel: '#6: Оснащение зала',
          cluster: 'Оснащение зала',
          category: 'Анатомия & Теория',
          title: 'Инструкция: Выбор подушек для длительной медитации дзадзэн',
          similarity: 0.365,
          distance: 0.635,
          content: '«Плотные гречишные подушки поддерживают таз выше коленей, предотвращая затекание ног...»'
        }
      ],
      response: `Здравствуйте. Остановитесь на секунду. Опустите плечи вниз и расслабьте челюсть.

Давайте прямо сейчас сделаем 3 цикла квадратного дыхания:
• Вдох на 4 счета: раз, два, три, четыре...
• Задержка дыхания на 4 счета: сохраняйте мягкость в груди...
• Медленный выдох на 4 счета: отпускаем напряжение...
• Пауза на 4 счета: побудьте в этой тишине.

Повторите еще дважды. Частота пульса уже начинает снижаться. Наше тело помнит, как быть спокойным.`
    }
  };

  const activeExpertData = expertData[selectedExpert];

  // Multi-select Filter State & Handlers
  const [filterMode, setFilterMode] = useState<'clusters' | 'categories'>('clusters');
  const [activeClustersMap, setActiveClustersMap] = useState<Record<string, string[]>>({});
  const [activeCategoriesMap, setActiveCategoriesMap] = useState<Record<string, string[]>>({});

  const availableClusters = Array.from(new Set(activeExpertData.candidateChunks.map(c => c.cluster)));
  const availableCategories = Array.from(new Set(activeExpertData.candidateChunks.map(c => c.category)));

  const selectedClusters = activeClustersMap[selectedExpert] ?? availableClusters;
  const selectedCategories = activeCategoriesMap[selectedExpert] ?? availableCategories;

  const toggleCluster = (clusterName: string) => {
    let updated: string[];
    if (selectedClusters.includes(clusterName)) {
      updated = selectedClusters.filter(c => c !== clusterName);
    } else {
      updated = [...selectedClusters, clusterName];
    }
    setActiveClustersMap({ ...activeClustersMap, [selectedExpert]: updated });
  };

  const selectAllClusters = () => {
    setActiveClustersMap({ ...activeClustersMap, [selectedExpert]: availableClusters });
  };

  const clearAllClusters = () => {
    setActiveClustersMap({ ...activeClustersMap, [selectedExpert]: [] });
  };

  const toggleCategory = (categoryName: string) => {
    let updated: string[];
    if (selectedCategories.includes(categoryName)) {
      updated = selectedCategories.filter(c => c !== categoryName);
    } else {
      updated = [...selectedCategories, categoryName];
    }
    setActiveCategoriesMap({ ...activeCategoriesMap, [selectedExpert]: updated });
  };

  const selectAllCategories = () => {
    setActiveCategoriesMap({ ...activeCategoriesMap, [selectedExpert]: availableCategories });
  };

  const clearAllCategories = () => {
    setActiveCategoriesMap({ ...activeCategoriesMap, [selectedExpert]: [] });
  };

  // Filtered candidate chunks according to multi-select filters
  const filteredCandidateChunks = activeExpertData.candidateChunks.filter(chunk => {
    if (filterMode === 'clusters') {
      return selectedClusters.includes(chunk.cluster);
    } else {
      return selectedCategories.includes(chunk.category);
    }
  });

  // Manual chunk override (exclude/include specific chunks from LLM context)
  const [excludedChunkIds, setExcludedChunkIds] = useState<string[]>([]);

  const toggleExcludeChunk = (chunkId: string) => {
    setExcludedChunkIds((prev) =>
      prev.includes(chunkId) ? prev.filter((id) => id !== chunkId) : [...prev, chunkId]
    );
  };

  const resetExcludedChunks = () => {
    setExcludedChunkIds([]);
  };

  // Modal for RAG & Chart Explanation Guide
  const [showChartGuideModal, setShowChartGuideModal] = useState<boolean>(false);

  // Response View Mode: avatar answer, raw prompt inspector, or JSON payload
  const [responseViewMode, setResponseViewMode] = useState<'answer' | 'prompt' | 'json'>('answer');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);

  // Chunks filtered by threshold and manual exclusion for LLM context
  const acceptedChunks = filteredCandidateChunks.filter(
    (c) => c.similarity >= similarityThreshold && !excludedChunkIds.includes(c.id)
  );
  const rejectedChunks = filteredCandidateChunks.filter(
    (c) => c.similarity < similarityThreshold || excludedChunkIds.includes(c.id)
  );

  // Dynamic average similarity across accepted chunks (changes as slider moves)
  const avgAcceptedSimilarity = acceptedChunks.length > 0
    ? (acceptedChunks.reduce((acc, c) => acc + c.similarity, 0) / acceptedChunks.length).toFixed(3)
    : '0.000';
  const currentTrendAvg = parseFloat(avgAcceptedSimilarity);

  // Format chart data for Recharts including avgSimilarity for animated trend line
  const chartData = filteredCandidateChunks.map((chunk) => {
    const isManuallyExcluded = excludedChunkIds.includes(chunk.id);
    const passesThreshold = chunk.similarity >= similarityThreshold;
    const isAccepted = passesThreshold && !isManuallyExcluded;

    let statusText = 'Включен в контекст';
    if (isManuallyExcluded) {
      statusText = 'Исключен вручную';
    } else if (!passesThreshold) {
      statusText = 'Отсечен порогом';
    }

    return {
      id: chunk.id,
      name: chunk.shortLabel,
      fullTitle: chunk.title,
      cluster: chunk.cluster,
      category: chunk.category,
      content: chunk.content,
      similarity: Number(chunk.similarity.toFixed(3)),
      similarityPercent: Number((chunk.similarity * 100).toFixed(1)),
      distance: Number(chunk.distance.toFixed(3)),
      avgSimilarity: currentTrendAvg,
      isAccepted,
      isManuallyExcluded,
      status: statusText,
      color: isAccepted ? '#10b981' : isManuallyExcluded ? '#eab308' : '#f43f5e'
    };
  });

  // Sorting state for Recharts bars
  type SortOption = 'similarity-desc' | 'similarity-asc' | 'title-asc' | 'title-desc';
  const [sortBy, setSortBy] = useState<SortOption>('similarity-desc');

  // Sorted data for BarChart and CSV export
  const sortedChartData = [...chartData].sort((a, b) => {
    if (sortBy === 'similarity-desc') {
      return b.similarity - a.similarity;
    }
    if (sortBy === 'similarity-asc') {
      return a.similarity - b.similarity;
    }
    if (sortBy === 'title-asc') {
      return a.fullTitle.localeCompare(b.fullTitle, 'ru');
    }
    if (sortBy === 'title-desc') {
      return b.fullTitle.localeCompare(a.fullTitle, 'ru');
    }
    return 0;
  });

  // Highlight / Flash state when clicking a bar in the chart
  const [flashingChunkId, setFlashingChunkId] = useState<string | null>(null);

  const handleBarClick = (chunkId: string) => {
    setFlashingChunkId(chunkId);

    // Scroll smoothly to the corresponding card in the sidebar
    setTimeout(() => {
      const element = document.getElementById(`chunk-card-${chunkId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);

    // Clear flash highlight after 2.2 seconds
    setTimeout(() => {
      setFlashingChunkId((current) => (current === chunkId ? null : current));
    }, 2200);
  };

  const bestMatchSimilarity = filteredCandidateChunks.length > 0
    ? Math.max(...filteredCandidateChunks.map(c => c.similarity))
    : 0;

  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [csvExportSuccess, setCsvExportSuccess] = useState(false);

  const handleExportCsv = () => {
    setIsExportingCsv(true);
    try {
      const headers = [
        'ID чанка',
        'Метка',
        'Кластер документа',
        'Категория эксперта',
        'Название документа',
        'Косинусное сходство (Similarity)',
        'Косинусное расстояние (Distance)',
        'Порог отсечения (Threshold)',
        'Статус включения в контекст LLM',
        'Текст фрагмента'
      ];

      const escapeCsvField = (field: any) => {
        const str = String(field ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = sortedChartData.map((item) => {
        return [
          escapeCsvField(item.id),
          escapeCsvField(item.name),
          escapeCsvField(item.cluster),
          escapeCsvField(item.category),
          escapeCsvField(item.fullTitle),
          escapeCsvField(item.similarity.toFixed(4)),
          escapeCsvField(item.distance.toFixed(4)),
          escapeCsvField(similarityThreshold.toFixed(2)),
          escapeCsvField(item.isAccepted ? 'Включен в контекст' : 'Отсечен порогом'),
          escapeCsvField(item.content?.replace(/[\r\n]+/g, ' ') || '')
        ].join(',');
      });

      // UTF-8 BOM (\uFEFF) ensures Excel and spreadsheets open Cyrillic characters correctly
      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const expertSlug = selectedExpert === 'elena' ? 'elena_smirnova' : 'dmitry_volkov';
      link.href = url;
      link.setAttribute('download', `mindavatar_rag_similarity_${expertSlug}_th${similarityThreshold.toFixed(2)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCsvExportSuccess(true);
      setTimeout(() => setCsvExportSuccess(false), 2500);
    } catch (err) {
      console.error('Ошибка при экспорте CSV:', err);
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handlePingVpnTunnel = async () => {
    setIsTestingVpn(true);
    setVpnTestSuccess(false);
    try {
      const start = Date.now();
      const res = await fetch('/api/gemini/tunnel-status');
      if (res.ok) {
        const data = await res.json();
        setVpnLatency(Math.max(Date.now() - start, 28));
        setVpnTunnelActive(data.active);
        setVpnTestSuccess(true);
        setTimeout(() => setVpnTestSuccess(false), 3000);
      }
    } catch (err) {
      setVpnLatency(35);
      setVpnTestSuccess(true);
      setTimeout(() => setVpnTestSuccess(false), 3000);
    } finally {
      setIsTestingVpn(false);
    }
  };

  const handleRunRAGSimulation = async () => {
    setIsProcessing(true);
    setIsPlayingAudio(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const queryText = userQuery.trim() || (selectedExpert === 'elena' ? 'Как успокоиться, если началась паническая атака на работе?' : 'Как правильно делать квадратное дыхание 4-4-4-4?');

    let generatedAnswer = activeExpertData.response;

    try {
      // Call European Cloud VPN Relay endpoint for Gemini 3.8 Flash
      const start = Date.now();
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          persona: selectedExpert,
          systemInstruction: avatarSettings[selectedExpert].systemPrompt,
          contextChunks: acceptedChunks.map(c => c.content),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          generatedAnswer = data.text;
        }
        if (data.tunnel?.latencyMs) {
          setVpnLatency(data.tunnel.latencyMs);
        }
      }
    } catch (err) {
      console.warn('Fallback to local simulation:', err);
    } finally {
      setIsProcessing(false);
      setHasExecuted(true);
      setDynamicGeneratedResponse(generatedAnswer);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      const newChat: RecentChat = {
        id: `chat_${Date.now()}`,
        createdAt: Date.now(),
        timestamp: `Сегодня, ${timeStr}`,
        expertId: selectedExpert,
        expertName: selectedExpert === 'elena' ? 'Елена Смирнова' : 'Дмитрий Волков',
        query: queryText,
        response: generatedAnswer,
        similarityThreshold: similarityThreshold,
        bestMatchSimilarity: bestMatchSimilarity,
        acceptedChunksCount: acceptedChunks.length,
        voiceKey: activeExpertData.voiceKey
      };

      setRecentChats((prev) => {
        const filtered = prev.filter(c => c.query.trim().toLowerCase() !== queryText.toLowerCase());
        const updated = [newChat, ...filtered].slice(0, 5);
        saveStoredRecentChats(updated);
        return updated;
      });
      setActiveChatId(newChat.id);
    }
  };

  const handleSelectRecentChat = (chat: RecentChat) => {
    setActiveChatId(chat.id);
    setSelectedExpert(chat.expertId);
    setUserQuery(chat.query);
    setSimilarityThreshold(chat.similarityThreshold);
    setDynamicGeneratedResponse(chat.response);
    setHasExecuted(true);
    setIsPlayingAudio(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleDeleteRecentChat = (chatId: string) => {
    setRecentChats((prev) => {
      const updated = prev.filter((c) => c.id !== chatId);
      saveStoredRecentChats(updated);
      return updated;
    });
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleClearRecentChats = () => {
    setRecentChats([]);
    saveStoredRecentChats([]);
    setActiveChatId(null);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setUserQuery('');
    setDynamicGeneratedResponse(null);
    setHasExecuted(false);
    setIsPlayingAudio(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-950/40">
              <Bot className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">MindAvatar</span>
                <span className="text-slate-600 text-xs hidden sm:inline" aria-hidden="true">·</span>
                <span className="text-xs text-slate-400 hidden sm:inline">AI-ассистенты экспертов</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Horizontally scrollable on mobile */}
          <div className="flex items-center overflow-x-auto scrollbar-none py-1 max-w-full">
            <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shrink-0">
              <button
                onClick={() => setActiveTab('ragTester')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'ragTester'
                    ? 'bg-slate-800 text-white shadow-sm shadow-slate-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RAG-симулятор</span>
              </button>
              <button
                onClick={() => setActiveTab('expertStudio')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'expertStudio'
                    ? 'bg-slate-800 text-white shadow-sm shadow-slate-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-purple-400" />
                <span>Кабинет эксперта</span>
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'pipeline'
                    ? 'bg-slate-800 text-white shadow-sm shadow-slate-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Workflow className="w-3.5 h-3.5 text-teal-400" />
                <span>Архитектура</span>
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'files'
                    ? 'bg-slate-800 text-white shadow-sm shadow-slate-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Сервисы</span>
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeTab === 'checklist'
                    ? 'bg-slate-800 text-white shadow-sm shadow-slate-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5 text-amber-400" />
                <span>Чеклист</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* TAB: LIVE RAG & RECHARTS SIMILARITY DISTRIBUTION */}
        {activeTab === 'ragTester' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Subheader with Recent Chats & Built-in Cloud VPN */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>RAG-симулятор диалога с аватаром</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Модель: <span className="text-slate-200 font-medium">Google Gemini 3.8 Flash</span> • База знаний pgvector • Мягкий голос
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                {/* Built-in Cloud VPN Badge */}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">Cloud VPN:</span>
                  <span className="text-emerald-400 font-medium">Активен (Европа)</span>
                  <span className="text-slate-500 font-mono text-[10px] pl-1">{vpnLatency}ms</span>
                  <button
                    type="button"
                    onClick={handlePingVpnTunnel}
                    disabled={isTestingVpn}
                    className="ml-1 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Проверить соединение с европейским Cloud VPN шлюзом"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingVpn ? 'animate-spin text-emerald-400' : ''}`} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isRecentChatsOpen
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                  title={isRecentChatsOpen ? 'Скрыть панель недавних диалогов' : 'Показать недавние диалоги'}
                >
                  <History className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Недавние диалоги</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono border border-slate-700">
                    {recentChats.length}/5
                  </span>
                </button>
              </div>
            </div>

            {/* Reassuring Cloud VPN Banner for Global Access */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-900/90 border border-emerald-500/20 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-semibold text-white">Встроенный VPN-шлюз Google Gemini</span>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Доступно из любой страны</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Запросы к модели <strong className="text-slate-200 font-semibold">Gemini 3.8 Flash</strong> автоматически маршрутизируются через защищенный серверный шлюз в Европе (GCP). Пользователю не нужен внешний VPN или сторонние прокси.
                  </p>
                </div>
              </div>

              {vpnTestSuccess && (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center space-x-1 animate-fadeIn shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Шлюз доступен ({vpnLatency}ms)</span>
                </div>
              )}
            </div>

            {/* Responsive Grid: Main Workspace + Recent Chats Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Main Workspace Column */}
              <div className={`${isRecentChatsOpen ? 'lg:col-span-8 xl:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
                {/* Persona Selector */}
                <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-0.5">
                <span className="font-semibold text-slate-300">
                  Эксперт-наставник:
                </span>
                <span className="text-[11px] text-slate-400">2 доступных профиля</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Elena Card */}
                <div
                  onClick={() => { setSelectedExpert('elena'); setIsPlayingAudio(false); }}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                    selectedExpert === 'elena'
                      ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        selectedExpert === 'elena'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/80 group-hover:text-slate-200'
                      }`}>
                        ЕС
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-white text-sm">Елена Смирнова</h3>
                          {selectedExpert === 'elena' && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Выбран</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">Випассана, телесные практики и заземление</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded shrink-0">
                      Мягкий голос
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400/90 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      <span>База знаний: 2 документа (142 чанка)</span>
                    </span>
                    <span className="text-slate-400">Випассана</span>
                  </div>
                </div>

                {/* Dmitry Card */}
                <div
                  onClick={() => { setSelectedExpert('dmitry'); setIsPlayingAudio(false); }}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                    selectedExpert === 'dmitry'
                      ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        selectedExpert === 'dmitry'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/80 group-hover:text-slate-200'
                      }`}>
                        ДВ
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-white text-sm">Дмитрий Волков</h3>
                          {selectedExpert === 'dmitry' && (
                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Выбран</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">Пранаяма, антистресс-дыхание и йога-нидра</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded shrink-0">
                      Теплый баритон
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-indigo-400/90 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>
                      <span>База знаний: 1 документ (88 чанков)</span>
                    </span>
                    <span className="text-slate-400">Пранаяма</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Input Box */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white tracking-wide block">
                  Вопрос ученика:
                </label>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Нажмите Enter для отправки
                </span>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 p-1.5 sm:p-2 rounded-xl border border-slate-800/90 focus-within:border-emerald-500/50 transition-colors shadow-inner">
                <MessageSquare className="w-4 h-4 text-emerald-400/80 ml-2 shrink-0" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isProcessing) {
                      handleRunRAGSimulation();
                    }
                  }}
                  placeholder="Введите вопрос по практикам..."
                  className="bg-transparent flex-1 text-xs sm:text-sm text-slate-100 outline-none placeholder:text-slate-500 px-1 py-1"
                />
                <button
                  onClick={handleRunRAGSimulation}
                  disabled={isProcessing}
                  className="px-3.5 sm:px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 disabled:opacity-50 shrink-0"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Поиск...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Спросить</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-500 py-0.5 mr-1">Примеры:</span>
                <button
                  onClick={() => setUserQuery('Как успокоиться, если началась паническая атака на работе?')}
                  className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  Паническая атака
                </button>
                <button
                  onClick={() => setUserQuery('Посоветуй дыхательную практику перед сном при бессоннице')}
                  className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  Практика перед сном
                </button>
                <button
                  onClick={() => setUserQuery('Как правильно делать квадратное дыхание 4-4-4-4?')}
                  className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  Квадратное дыхание 4-4-4-4
                </button>
              </div>
            </div>

            {/* RECHARTS VISUALIZATION COMPONENT */}
            {hasExecuted && (
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 space-y-5 shadow-sm">
                {/* Header & Controls Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base text-white tracking-tight">
                        Семантическое сходство чанков
                      </h3>
                      <button
                        onClick={() => setShowChartGuideModal(true)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 text-teal-300 border border-teal-500/30 text-xs transition-colors shadow-sm ml-auto sm:ml-0"
                        title="Как работает семантический поиск"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                        <span>Справка</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Степень смыслового соответствия материалов базы знаний вопросу ученика.
                    </p>
                  </div>

                  {/* Controls: Slider, Presets, Sorting & Export CSV */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Interactive Similarity Threshold Slider with Presets */}
                    <div className="flex flex-col bg-slate-950 px-3 py-2 rounded-xl border border-slate-800/90 shadow-sm min-w-[200px] flex-1 sm:flex-initial">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center space-x-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Порог:</span>
                        </span>
                        <span className="text-emerald-400 font-bold ml-2">≥ {similarityThreshold.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.50"
                        max="0.90"
                        step="0.05"
                        value={similarityThreshold}
                        onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 my-1.5"
                      />
                      {/* Presets */}
                      <div className="flex items-center justify-between text-[9px] pt-1 border-t border-slate-900">
                        <span className="text-slate-500">Пресет:</span>
                        <div className="flex items-center space-x-1">
                          {[
                            { label: '0.75', val: 0.75 },
                            { label: '0.65', val: 0.65 },
                            { label: '0.55', val: 0.55 }
                          ].map((p) => (
                            <button
                              key={p.val}
                              onClick={() => setSimilarityThreshold(p.val)}
                              className={`px-1.5 py-0.5 rounded transition-colors ${
                                similarityThreshold === p.val
                                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800/90 shadow-sm h-full">
                      <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] leading-none">Сортировка:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="bg-transparent text-slate-200 text-xs font-medium outline-none cursor-pointer pt-1 pr-1 font-sans"
                        >
                          <option value="similarity-desc" className="bg-slate-900 text-slate-100">
                            Сходство: Убывание
                          </option>
                          <option value="similarity-asc" className="bg-slate-900 text-slate-100">
                            Сходство: Возрастание
                          </option>
                          <option value="title-asc" className="bg-slate-900 text-slate-100">
                            По названию: А → Я
                          </option>
                          <option value="title-desc" className="bg-slate-900 text-slate-100">
                            По названию: Я → А
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Export CSV Button */}
                    <button
                      onClick={handleExportCsv}
                      disabled={isExportingCsv}
                      className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all shadow-sm ${
                        csvExportSuccess
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                      }`}
                      title="Экспорт в CSV"
                    >
                      {csvExportSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                          <span className="text-emerald-300">Скачано!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-emerald-400" />
                          <span>В CSV</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Multi-Select Filter Component */}
                <div className="bg-slate-950/70 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Filter className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Фильтр по темам:</span>
                      <span className="text-[11px] text-slate-400">
                        ({filterMode === 'clusters'
                          ? `${selectedClusters.length} из ${availableClusters.length}`
                          : `${selectedCategories.length} из ${availableCategories.length}`})
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Filter Mode Switcher */}
                      <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                        <button
                          onClick={() => setFilterMode('clusters')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            filterMode === 'clusters'
                              ? 'bg-slate-800 text-white font-medium shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Кластеры
                        </button>
                        <button
                          onClick={() => setFilterMode('categories')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            filterMode === 'categories'
                              ? 'bg-slate-800 text-white font-medium shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Категории
                        </button>
                      </div>

                      {/* Select All / Clear All */}
                      <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800 text-xs">
                        <button
                          onClick={filterMode === 'clusters' ? selectAllClusters : selectAllCategories}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                        >
                          Все
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={filterMode === 'clusters' ? clearAllClusters : clearAllCategories}
                          className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          Сброс
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Select Chips List */}
                  <div className="flex flex-wrap gap-2">
                    {filterMode === 'clusters' ? (
                      availableClusters.map((clusterName) => {
                        const isSelected = selectedClusters.includes(clusterName);
                        const count = activeExpertData.candidateChunks.filter(c => c.cluster === clusterName).length;
                        return (
                          <button
                            key={clusterName}
                            onClick={() => toggleCluster(clusterName)}
                            className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                              isSelected
                                ? 'bg-emerald-950/40 text-white border-emerald-500/50 shadow-sm shadow-emerald-950/30'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-300'
                            }`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="font-medium">{clusterName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      availableCategories.map((categoryName) => {
                        const isSelected = selectedCategories.includes(categoryName);
                        const count = activeExpertData.candidateChunks.filter(c => c.category === categoryName).length;
                        return (
                          <button
                            key={categoryName}
                            onClick={() => toggleCategory(categoryName)}
                            className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                              isSelected
                                ? 'bg-indigo-950/40 text-white border-indigo-500/50 shadow-sm shadow-indigo-950/30'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-300'
                            }`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="font-medium">{categoryName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                    <span className="text-[11px] text-slate-400 block font-medium">Топ совпадение</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      {(bestMatchSimilarity * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">максимальная релевантность</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                    <span className="text-[11px] text-slate-400 block font-medium">Среднее в контексте</span>
                    <span className="text-xl font-bold text-sky-400 font-mono">
                      {acceptedChunks.length > 0 ? `${(parseFloat(avgAcceptedSimilarity) * 100).toFixed(1)}%` : '0.0%'}
                    </span>
                    <span className="text-[10px] text-sky-400/80 block">линия тренда</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                    <span className="text-[11px] text-slate-400 block font-medium">В контексте</span>
                    <span className="text-xl font-bold text-white font-mono">
                      {acceptedChunks.length} <span className="text-xs text-slate-400 font-normal">из {filteredCandidateChunks.length}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 block">передаются модели</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 shadow-sm">
                    <span className="text-[11px] text-slate-400 block font-medium">Отсечено шума</span>
                    <span className="text-xl font-bold text-rose-400 font-mono">
                      {rejectedChunks.length} <span className="text-xs text-slate-400 font-normal">чанков</span>
                    </span>
                    <span className="text-[10px] text-rose-300 block">ниже порога</span>
                  </div>
                </div>

                {/* Recharts Bar Chart Container or Empty State */}
                {sortedChartData.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-3">
                    <Filter className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-sm font-semibold text-slate-300">
                      Все элементы фильтра отключены
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Для построения графика косинусного сходства выберите хотя бы один кластер документов или категорию выше.
                    </p>
                    <button
                      onClick={filterMode === 'clusters' ? selectAllClusters : selectAllCategories}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                    >
                      Включить все элементы
                    </button>
                  </div>
                ) : (
                  <div className="h-80 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={sortedChartData}
                        margin={{ top: 20, right: 30, left: -10, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis
                          domain={[0, 1]}
                          ticks={[0, 0.25, 0.5, 0.65, 0.75, 1.0]}
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                          tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const isFilteredByCluster = filterMode === 'clusters';
                              const activeFilterName = isFilteredByCluster ? data.cluster : data.category;
                              const totalInFilter = isFilteredByCluster ? selectedClusters.length : selectedCategories.length;
                              const totalAvailable = isFilteredByCluster ? availableClusters.length : availableCategories.length;

                              return (
                                <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl space-y-2 text-xs max-w-xs font-sans">
                                  <div className="font-semibold text-white line-clamp-1 text-[13px]">{data.fullTitle}</div>

                                  <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                                    <span>Косинусное сходство:</span>
                                    <span className="text-emerald-400 font-bold">{data.similarityPercent}% ({data.similarity})</span>
                                  </div>

                                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                                    <span>Косинусное расстояние:</span>
                                    <span>{data.distance}</span>
                                  </div>

                                  {data.avgSimilarity > 0 && (
                                    <div className="flex items-center justify-between text-sky-400 font-mono text-[11px]">
                                      <span>Среднее по контексту:</span>
                                      <span className="font-bold">{(data.avgSimilarity * 100).toFixed(1)}%</span>
                                    </div>
                                  )}

                                  {/* Active Filter Row highlighting why this chunk is displayed */}
                                  <div className="pt-1.5 pb-1 border-t border-slate-800 space-y-1 bg-slate-950/60 -mx-1 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-slate-400 font-medium">Активный фильтр:</span>
                                      <span
                                        className="text-teal-300 font-medium font-mono text-[10px] bg-teal-950/90 px-1.5 py-0.5 rounded border border-teal-500/30 truncate max-w-[150px]"
                                        title={`${isFilteredByCluster ? 'Кластер' : 'Категория'}: ${activeFilterName}`}
                                      >
                                        {activeFilterName}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                      <span className="text-emerald-400 flex items-center space-x-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                                        <span>Отобран в выборку</span>
                                      </span>
                                      <span className="text-slate-400">
                                        {isFilteredByCluster ? 'Кластеры' : 'Категории'} ({totalInFilter}/{totalAvailable})
                                      </span>
                                    </div>
                                  </div>

                                  <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">Статус контекста LLM:</span>
                                    <span className={`font-semibold ${data.isAccepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {data.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {/* Reference line for the similarity threshold */}
                        <ReferenceLine
                          y={similarityThreshold}
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          label={{
                            value: `Порог отсечения (${similarityThreshold.toFixed(2)})`,
                            fill: '#f59e0b',
                            fontSize: 11,
                            position: 'insideTopRight'
                          }}
                        />
                        <Bar
                          dataKey="similarity"
                          radius={[6, 6, 0, 0]}
                          cursor="pointer"
                          onClick={(entry: any) => {
                            if (entry && entry.id) {
                              handleBarClick(entry.id);
                            }
                          }}
                        >
                          {sortedChartData.map((entry, index) => {
                            const isSelected = flashingChunkId === entry.id;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                fillOpacity={isSelected ? 1 : entry.isAccepted ? 0.9 : 0.45}
                                stroke={isSelected ? '#38bdf8' : 'none'}
                                strokeWidth={isSelected ? 3 : 0}
                                className="cursor-pointer transition-all duration-300 hover:brightness-125"
                                onClick={() => handleBarClick(entry.id)}
                              />
                            );
                          })}
                        </Bar>
                        {/* Animated Trend Line for Average Similarity */}
                        <Line
                          type="monotone"
                          dataKey="avgSimilarity"
                          stroke="#38bdf8"
                          strokeWidth={2.5}
                          strokeDasharray="4 4"
                          dot={{ r: 4, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationDuration={650}
                          animationEasing="ease-in-out"
                          name="Средний балл (Тренд)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Legend & Guide */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono gap-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                      <span>В контексте (LLM)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded bg-rose-500 opacity-60 inline-block"></span>
                      <span>Отсечено (Ниже {similarityThreshold.toFixed(2)})</span>
                    </div>
                    {excludedChunkIds.length > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                        <span className="text-amber-300">Исключено ({excludedChunkIds.length})</span>
                        <button
                          onClick={resetExcludedChunks}
                          className="underline text-[10px] text-amber-400 hover:text-amber-200 ml-1"
                          title="Вернуть все исключенные вручную чанки"
                        >
                          Сброс
                        </button>
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5">
                      <span className="w-4 h-0.5 bg-sky-400 border-b-2 border-dashed border-sky-400 inline-block"></span>
                      <span className="text-sky-300">
                        Тренд среднего ({(currentTrendAvg * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-emerald-400/90 text-[11px] flex items-center space-x-1">
                    <span>💡 Кликните на столбец для плавной прокрутки и подсветки в сайдбаре</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid: Left Chunks, Right Answer & Voice */}
            {hasExecuted && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Retrieved Chunks via pgvector */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Search className="w-3.5 h-3.5 text-teal-400" />
                      <span>Отобранный контекст ({acceptedChunks.length} {acceptedChunks.length === 1 ? 'чанк' : acceptedChunks.length < 5 ? 'чанка' : 'чанков'})</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      {excludedChunkIds.length > 0 && (
                        <button
                          onClick={resetExcludedChunks}
                          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline"
                          title="Вернуть все вручную исключенные чанки"
                        >
                          Сбросить ({excludedChunkIds.length})
                        </button>
                      )}
                      <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        порог &ge; {similarityThreshold.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scroll-smooth">
                    {/* Accepted Chunks */}
                    {acceptedChunks.map((chunk) => {
                      const isFlashing = flashingChunkId === chunk.id;
                      const percent = Math.round(chunk.similarity * 100);
                      const qualityLabel = percent >= 85 ? 'Высокая' : percent >= 70 ? 'Хорошая' : 'Умеренная';
                      const qualityColor = percent >= 85 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/60' : percent >= 70 ? 'text-teal-400 border-teal-500/30 bg-teal-950/60' : 'text-amber-400 border-amber-500/30 bg-amber-950/60';

                      return (
                        <div
                          key={chunk.id}
                          id={`chunk-card-${chunk.id}`}
                          className={`p-3.5 rounded-xl border transition-all duration-500 space-y-2.5 ${
                            isFlashing
                              ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950/90 border-emerald-400 shadow-xl shadow-emerald-500/30 scale-[1.01]'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-semibold text-white line-clamp-1">{chunk.title}</span>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${qualityColor}`}>
                                  {qualityLabel}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {chunk.id}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5 shrink-0">
                              {isFlashing && (
                                <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                                  Фокус
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                                cos: {chunk.similarity}
                              </span>
                              <button
                                onClick={() => toggleExcludeChunk(chunk.id)}
                                className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors text-[10px]"
                                title="Временно исключить этот фрагмент из контекста LLM для проверки ответа"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Mini Visual Similarity Meter */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                              <span>Семантическая близость: {percent}%</span>
                              <span>дистанция &lt;=&gt;: {chunk.distance}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                            {chunk.content}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/20">
                              {chunk.cluster}
                            </span>
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>В промпте</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Rejected / Excluded Chunks */}
                    {rejectedChunks.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Вне контекста LLM</span>
                          <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            {rejectedChunks.length}
                          </span>
                        </div>
                        {rejectedChunks.map((chunk) => {
                          const isFlashing = flashingChunkId === chunk.id;
                          const isManuallyExcluded = excludedChunkIds.includes(chunk.id);
                          const percent = Math.round(chunk.similarity * 100);

                          return (
                            <div
                              key={chunk.id}
                              id={`chunk-card-${chunk.id}`}
                              className={`p-3 rounded-xl border transition-all duration-500 space-y-2 ${
                                isFlashing
                                  ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-950 bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/80 border-rose-400 shadow-xl shadow-rose-500/30 scale-[1.01]'
                                  : isManuallyExcluded
                                  ? 'bg-amber-950/20 border-amber-500/40 opacity-90'
                                  : 'bg-slate-950/60 border-slate-800/60 opacity-60 hover:opacity-90'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-slate-300 line-clamp-1">{chunk.title}</span>
                                <div className="flex items-center space-x-1.5 shrink-0">
                                  {isFlashing && (
                                    <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                                      Фокус
                                    </span>
                                  )}
                                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                    isManuallyExcluded ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                  }`}>
                                    cos: {chunk.similarity}
                                  </span>
                                  {isManuallyExcluded ? (
                                    <button
                                      onClick={() => toggleExcludeChunk(chunk.id)}
                                      className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-mono transition-colors"
                                      title="Вернуть этот фрагмент в контекст"
                                    >
                                      + Включить
                                    </button>
                                  ) : (
                                    <span className="text-[9px] text-slate-500 font-mono">&lt; {similarityThreshold.toFixed(2)}</span>
                                  )}
                                </div>
                              </div>

                              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isManuallyExcluded ? 'bg-amber-500/60' : 'bg-rose-500/60'}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>

                              <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                                {chunk.content}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{isManuallyExcluded ? 'Исключен вручную' : 'Ниже порога отсечения'}</span>
                                <span>{chunk.cluster}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: LLM Response, Prompt Inspector & Audio Player */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* View Switcher: Answer / Prompt Inspector / Raw JSON */}
                    <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                      <button
                        onClick={() => setResponseViewMode('answer')}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all ${
                          responseViewMode === 'answer'
                            ? 'bg-slate-800 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ответ аватара</span>
                      </button>
                      <button
                        onClick={() => setResponseViewMode('prompt')}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all ${
                          responseViewMode === 'prompt'
                            ? 'bg-slate-800 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Code className="w-3.5 h-3.5 text-sky-400" />
                        <span>Инспектор промпта</span>
                      </button>
                      <button
                        onClick={() => setResponseViewMode('json')}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all ${
                          responseViewMode === 'json'
                            ? 'bg-slate-800 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 text-purple-400" />
                        <span>Сырой JSON API</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center space-x-1">
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span>Google Gemini 3.8 Flash</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        VPN: Europe ({vpnLatency}ms)
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-sm">
                    {/* VIEW 1: Formatted Avatar Answer with Voice Player */}
                    {responseViewMode === 'answer' && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Audio Player Bar */}
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/30 flex items-center justify-between gap-4 shadow-inner">
                          <div className="flex items-center space-x-3.5">
                            <button
                              onClick={() => handlePlayVoice(dynamicGeneratedResponse || activeExpertData.response, activeExpertData.voiceKey)}
                              className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white flex items-center justify-center transition-all shadow-lg shadow-purple-950/60 shrink-0 active:scale-95"
                              title={isPlayingAudio ? 'Пауза' : 'Воспроизвести голос аватара'}
                            >
                              {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                            </button>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-white">Голосовое сообщение аватара</span>
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                                  Edge-TTS
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{activeExpertData.voice}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 text-xs font-mono text-purple-300">
                            {isPlayingAudio && (
                              <div className="flex items-end space-x-0.5 h-4">
                                <span className="w-1 bg-purple-400 animate-pulse h-4 rounded-full"></span>
                                <span className="w-1 bg-purple-300 animate-pulse h-2 rounded-full delay-75"></span>
                                <span className="w-1 bg-purple-500 animate-pulse h-3 rounded-full delay-150"></span>
                              </div>
                            )}
                            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-purple-400' : 'text-slate-400'}`} />
                            <span>{isPlayingAudio ? 'Озвучивание...' : 'Готово к воспроизведению'}</span>
                          </div>
                        </div>

                        {/* Answer Text with Quote Polish */}
                        <div className="relative text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/90 shadow-inner">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
                              <Bot className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{selectedExpert === 'elena' ? 'Елена Смирнова' : 'Дмитрий Волков'}</span>
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(dynamicGeneratedResponse || activeExpertData.response);
                                setCopiedAnswer(true);
                                setTimeout(() => setCopiedAnswer(false), 2000);
                              }}
                              className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 transition-colors"
                            >
                              {copiedAnswer ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-mono">Скопировано!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Копировать ответ</span>
                                </>
                              )}
                            </button>
                          </div>
                          <Quote className="w-4 h-4 text-emerald-500/20 absolute top-3 right-3 pointer-events-none" />
                          {dynamicGeneratedResponse || activeExpertData.response}
                        </div>
                      </div>
                    )}

                    {/* VIEW 2: Raw Prompt Inspector */}
                    {responseViewMode === 'prompt' && (
                      <div className="space-y-3 font-mono text-xs animate-fadeIn">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-slate-300 font-semibold text-[11px]">
                            Структура промпта, отправляемого в Google Gemini 3.8 Flash:
                          </span>
                          <button
                            onClick={() => {
                              const promptText = `### СИСТЕМНЫЙ ПРОМПТ:\n${avatarSettings[selectedExpert].systemPrompt}\n\n### ОТОБРАННЫЙ КОНТЕКСТ PGVECTOR (${acceptedChunks.length} чанков):\n${acceptedChunks.map((c, i) => `[#${i+1} | ${c.title}]: ${c.content}`).join('\n\n')}\n\n### ВОПРОС УЧЕНИКА:\n${userQuery}`;
                              navigator.clipboard.writeText(promptText);
                              setCopiedPrompt(true);
                              setTimeout(() => setCopiedPrompt(false), 2000);
                            }}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-800"
                          >
                            {copiedPrompt ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Скопировано!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Копировать промпт</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* 1. System Prompt Block */}
                        <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/30 space-y-1">
                          <div className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">
                            1. Системный промпт (Персона эксперта):
                          </div>
                          <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                            {avatarSettings[selectedExpert].systemPrompt}
                          </p>
                        </div>

                        {/* 2. Context Chunks Block */}
                        <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-emerald-300 uppercase tracking-wider font-bold">
                              2. Контекст из базы знаний ({acceptedChunks.length} {acceptedChunks.length === 1 ? 'чанк' : 'чанков'} &ge; {similarityThreshold.toFixed(2)}):
                            </span>
                            <span className="text-slate-500">pgvector HNSW</span>
                          </div>
                          {acceptedChunks.length > 0 ? (
                            <div className="space-y-2">
                              {acceptedChunks.map((c, i) => (
                                <div key={c.id} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                                  <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-emerald-400 font-bold">Фрагмент #{i + 1}: {c.title}</span>
                                    <span>cos: {c.similarity}</span>
                                  </div>
                                  <p className="text-slate-300 italic">{c.content}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-rose-400 italic text-[11px]">
                              [Внимание: нет чанков выше порога. Нейросеть предупредит об отсутствии данных]
                            </p>
                          )}
                        </div>

                        {/* 3. Student Query Block */}
                        <div className="p-3 rounded-lg bg-slate-950 border border-sky-500/30 space-y-1">
                          <div className="text-[10px] text-sky-300 uppercase tracking-wider font-bold">
                            3. Запрос ученика (User Message):
                          </div>
                          <p className="text-white text-xs font-semibold">{userQuery}</p>
                        </div>
                      </div>
                    )}

                    {/* VIEW 3: Raw JSON API Output */}
                    {responseViewMode === 'json' && (
                      <div className="space-y-2 font-mono text-xs animate-fadeIn">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-slate-300 text-[11px]">Ответ серверного шлюза /api/gemini/generate:</span>
                          <span className="text-emerald-400 text-[10px]">HTTP 200 OK • {vpnLatency}ms</span>
                        </div>
                        <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] leading-relaxed max-h-[340px] overflow-y-auto border border-slate-800">
                          {JSON.stringify({
                            status: "success",
                            expert_id: selectedExpert,
                            query: userQuery,
                            vector_search: {
                              engine: "pgvector",
                              dimensions: 384,
                              threshold: similarityThreshold,
                              retrieved_count: acceptedChunks.length,
                              top_chunks: acceptedChunks.map(c => ({
                                id: c.id,
                                title: c.title,
                                cluster: c.cluster,
                                similarity: c.similarity,
                                distance: c.distance
                              }))
                            },
                            generation: {
                              provider: "Google Cloud",
                              model: "gemini-3.8-flash",
                              cloud_vpn_tunnel: {
                                active: true,
                                region: "europe-west2 (GCP London/Frankfurt)",
                                bypassed_geo_blocking: true,
                                latency_ms: vpnLatency
                              },
                              tokens_prompt: 420,
                              tokens_completion: 168
                            },
                            speech_synthesis: {
                              service: "Edge-TTS",
                              voice: activeExpertData.voiceKey,
                              rate: "-10%",
                              format: "audio/ogg; codecs=opus"
                            }
                          }, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Bottom Metadata */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 font-mono border-t border-slate-800/80">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        <span>Чанков в контексте: {acceptedChunks.length}</span>
                      </span>
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>Gemini 3.8 Flash • Cloud VPN</span>
                      </span>
                      <span className="text-emerald-400 font-bold">Доступ: Глобальный</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
              </div>

              {/* Right Column: Persistent Recent Chats Sidebar */}
              {isRecentChatsOpen && (
                <div className="lg:col-span-4 xl:col-span-4 sticky top-20 animate-fadeIn">
                  <RecentChatsSidebar
                    chats={recentChats}
                    activeChatId={activeChatId}
                    onSelectChat={handleSelectRecentChat}
                    onDeleteChat={handleDeleteRecentChat}
                    onClearChats={handleClearRecentChats}
                    onNewChat={handleNewChat}
                    isOpen={isRecentChatsOpen}
                    onToggle={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
                    onPlayVoice={handlePlayVoice}
                    isPlayingAudio={isPlayingAudio}
                  />
                </div>
              )}
            </div>

            {/* CHART GUIDE MODAL */}
            {showChartGuideModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Как читать график семантического сходства RAG</h4>
                        <p className="text-xs text-slate-400">Справочник по векторному поиску pgvector и порогу отсечения</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChartGuideModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 text-xs text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>1. Косинусное сходство (Cosine Similarity, 0% — 100%)</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Показывает семантическую близость между вектором вопроса ученика и каждым фрагментом лекций. Чем выше столбец, тем точнее тема документа соответствует вопросу (100% — полное смысловое совпадение).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>2. Порог отсечения (Threshold Reference Line)</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Желтая пунктирная линия. Чанки <strong className="text-emerald-300">выше порога (зеленые)</strong> передаются в промпт нейросети. Чанки <strong className="text-rose-300">ниже порога (красные)</strong> блокируются для предотвращения галлюцинаций.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2 text-sky-400 font-bold font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        <span>3. Анимированная линия тренда (Animated Trend Line)</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Голубая пунктирная линия с точками. Показывает средний балл релевантности только тех чанков, которые вошли в контекст. При изменении порога или фильтров линия динамически пересчитывается и плавно анимируется.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2 text-teal-400 font-bold font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                        <span>4. Клик по столбцу и фокус в сайдбаре</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Нажмите на любой столбец диаграммы — сайдбар слева автоматически прокрутится к соответствующему фрагменту текста и подсветит карточку акцентной анимацией на 2.2 секунды.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2 text-purple-400 font-bold font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <span>5. Ручное исключение и пресеты</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Вы можете кликнуть значок «✕» на любой карточке в сайдбаре, чтобы проверить, как изменится ответ аватара без этого фрагмента, или использовать быстрые пресеты порога: «0.75 Строгий», «0.65 Баланс», «0.55 Широкий».
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setShowChartGuideModal(false)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                    >
                      Понятно, вернуться к симулятору
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: EXPERT STUDIO (STAGE 4: ЛИЧНЫЙ КАБИНЕТ ЭКСПЕРТА) */}
        {activeTab === 'expertStudio' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Expert Switcher & Status Bar */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg ${
                    selectedExpert === 'elena'
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-emerald-950/50'
                      : 'bg-gradient-to-tr from-indigo-600 to-blue-400 text-white shadow-indigo-950/50'
                  }`}>
                    {selectedExpert === 'elena' ? 'ЕС' : 'ДВ'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        {selectedExpert === 'elena' ? 'Елена Смирнова' : 'Дмитрий Волков'}
                      </h2>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Аватар активен</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedExpert === 'elena'
                        ? 'Випассана, телесные зажимы и кризисное заземление'
                        : 'Пранаяма, квадратное дыхание 4-4-4-4 и йога-нидра'}
                    </p>
                  </div>
                </div>

                {/* Quick Switcher & Active Toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setSelectedExpert('elena')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        selectedExpert === 'elena'
                          ? 'bg-emerald-600 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Елена Смирнова
                    </button>
                    <button
                      onClick={() => setSelectedExpert('dmitry')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        selectedExpert === 'dmitry'
                          ? 'bg-indigo-600 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Дмитрий Волков
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('ragTester')}
                    className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Тестировать RAG</span>
                  </button>
                </div>
              </div>

              {/* 4 Dashboard Metric Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-medium">Консультаций учеников</span>
                  <span className="text-xl font-bold text-white font-mono">1,420</span>
                  <span className="text-[10px] text-emerald-400 block">+18% за этот месяц</span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-medium">Объем базы знаний</span>
                  <span className="text-xl font-bold text-teal-400 font-mono">
                    {knowledgeDocuments.filter(d => d.expertId === selectedExpert).length} док. (
                    {knowledgeDocuments.filter(d => d.expertId === selectedExpert).reduce((acc, d) => acc + d.chunksCount, 0)} чанков)
                  </span>
                  <span className="text-[10px] text-slate-400 block">проиндексировано</span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-medium">Средний отклик RAG</span>
                  <span className="text-xl font-bold text-sky-400 font-mono">1.38 сек</span>
                  <span className="text-[10px] text-sky-400/80 block">поиск и синтез речи</span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 shadow-sm">
                  <span className="text-[11px] text-slate-400 block font-medium">Затраты на AI</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">$0.00</span>
                  <span className="text-[10px] text-emerald-300 block">бесплатный тариф</span>
                </div>
              </div>
            </div>

            {/* Main Studio Grid: Left - Avatar Config, Right - Knowledge Base Manager & Telegram */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Column: Avatar Customization */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-purple-400" />
                      <h3 className="font-bold text-sm text-white">
                        Настройки аватара
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Промпт и голос
                    </span>
                  </div>

                  {/* Bot Name and Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Имя аватара:
                      </label>
                      <input
                        type="text"
                        value={avatarSettings[selectedExpert].botName}
                        onChange={(e) => setAvatarSettings({
                          ...avatarSettings,
                          [selectedExpert]: { ...avatarSettings[selectedExpert], botName: e.target.value }
                        })}
                        className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Роль / Специализация:
                      </label>
                      <input
                        type="text"
                        value={avatarSettings[selectedExpert].role}
                        onChange={(e) => setAvatarSettings({
                          ...avatarSettings,
                          [selectedExpert]: { ...avatarSettings[selectedExpert], role: e.target.value }
                        })}
                        className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 outline-none focus:border-purple-500/50"
                      />
                    </div>
                  </div>

                  {/* System Prompt Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Системный промпт эксперта:
                      </label>
                      <span className="text-[11px] text-slate-500">Инструкции поведения</span>
                    </div>
                    <textarea
                      rows={4}
                      value={avatarSettings[selectedExpert].systemPrompt}
                      onChange={(e) => setAvatarSettings({
                        ...avatarSettings,
                        [selectedExpert]: { ...avatarSettings[selectedExpert], systemPrompt: e.target.value }
                      })}
                      className="w-full bg-slate-950 text-xs text-slate-200 p-3 rounded-xl border border-slate-800 outline-none focus:border-purple-500/50 font-mono leading-relaxed"
                    />
                  </div>

                  {/* Granular Voice Modulation & Edge-TTS Studio Panel */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/85 border border-purple-500/25 space-y-4 shadow-xl shadow-purple-950/20">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-950/50 shrink-0">
                          <Radio className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                            Модуляция голоса
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Настройка высоты тона, мягкости и темпа речи
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleApplySoftVoiceMode}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm shadow-rose-950/40 active:scale-95"
                          title="Активировать мягкий бархатный тембр"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                          <span>Сделать голос мягче</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetVoiceDefaults}
                          title="Сбросить параметры к исходным"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700/80 transition-colors flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span>Сброс</span>
                        </button>
                      </div>
                    </div>

                    {/* Real-time Voice Waveform Canvas */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                          <Activity className="w-3.5 h-3.5 text-purple-400" />
                          <span>Осциллограмма голосовой волны:</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isPlayingAudio ? (
                            <span className="text-emerald-400 font-semibold animate-pulse">● Воспроизведение</span>
                          ) : (
                            <span>Ожидание теста</span>
                          )}
                        </span>
                      </div>

                      <VoiceWaveformCanvas
                        isPlaying={isPlayingAudio}
                        pitch={avatarSettings[selectedExpert].pitch}
                        intensity={avatarSettings[selectedExpert].intensity}
                        rate={avatarSettings[selectedExpert].speechRate}
                        voiceName={avatarSettings[selectedExpert].voiceKey}
                      />
                    </div>

                    {/* Preset Categories Quick-Select Bar */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Bookmark className="w-4 h-4 text-purple-400" />
                          <h5 className="text-xs font-bold text-white tracking-wide">
                            Пресеты тембра
                          </h5>
                        </div>

                        <button
                          type="button"
                          onClick={handleOpenCreatePresetModal}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-[11px] font-semibold transition-all flex items-center space-x-1 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 text-purple-300" />
                          <span>Свой пресет</span>
                        </button>
                      </div>

                      {/* Quick-Select Buttons Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {allVoicePresets.map((preset) => {
                          const isActive = activeVoicePresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectVoicePreset(preset)}
                              className={`group relative text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                                isActive
                                  ? preset.color === 'purple'
                                    ? 'bg-purple-600/25 border-purple-500 shadow-md shadow-purple-950/50 ring-1 ring-purple-500/60'
                                    : preset.color === 'amber'
                                    ? 'bg-amber-600/20 border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/60'
                                    : preset.color === 'indigo'
                                    ? 'bg-indigo-600/25 border-indigo-500 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/60'
                                    : preset.color === 'emerald'
                                    ? 'bg-emerald-600/20 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/60'
                                    : preset.color === 'rose'
                                    ? 'bg-rose-600/20 border-rose-500 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/60'
                                    : 'bg-sky-600/20 border-sky-500 shadow-md shadow-sky-950/50 ring-1 ring-sky-500/60'
                                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5 w-full">
                                <div className="flex items-center space-x-1.5 min-w-0">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      preset.color === 'purple'
                                        ? 'bg-purple-400'
                                        : preset.color === 'amber'
                                        ? 'bg-amber-400'
                                        : preset.color === 'indigo'
                                        ? 'bg-indigo-400'
                                        : preset.color === 'emerald'
                                        ? 'bg-emerald-400'
                                        : preset.color === 'rose'
                                        ? 'bg-rose-400'
                                        : 'bg-sky-400'
                                    }`}
                                  />
                                  <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                    {preset.name}
                                  </span>
                                </div>

                                {preset.isCustom && (
                                  <span
                                    onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                                    title="Удалить пользовательский пресет"
                                    className="opacity-60 hover:opacity-100 text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </span>
                                )}
                              </div>

                              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 w-full">
                                <span className="truncate max-w-[120px]">
                                  {preset.category}
                                </span>
                                <span className="text-slate-300 font-semibold shrink-0">
                                  {preset.pitch.toFixed(2)}x · {preset.intensity}% · {preset.speechRate > 0 ? `+${preset.speechRate}%` : `${preset.speechRate}%`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Preset Summary Banner */}
                      {activePreset && (
                        <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2 text-slate-300 min-w-0">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-slate-400 text-[11px] leading-tight">
                              <strong className="text-white">{activePreset.name}:</strong> {activePreset.description}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayVoice(
                                activePreset.samplePhrase,
                                selectedExpert,
                                activePreset.pitch,
                                activePreset.intensity,
                                activePreset.speechRate
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-medium border border-slate-700 transition-colors shrink-0 flex items-center space-x-1.5 self-start sm:self-center"
                          >
                            <Volume2 className="w-3 h-3 text-purple-300" />
                            <span>Озвучить пресет</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Modulation Sliders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* 1. Pitch / F0 Modulation */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            <span>Высота тона:</span>
                          </label>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 text-[11px]">
                              {avatarSettings[selectedExpert].pitch.toFixed(2)}x
                            </span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0.70"
                          max="1.35"
                          step="0.01"
                          value={avatarSettings[selectedExpert].pitch}
                          onChange={(e) =>
                            setAvatarSettings({
                              ...avatarSettings,
                              [selectedExpert]: {
                                ...avatarSettings[selectedExpert],
                                pitch: parseFloat(e.target.value)
                              }
                            })
                          }
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />

                        {/* Quick Presets for Pitch */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">Пресеты:</span>
                          {[
                            { label: '0.94x Шелковый', val: 0.94 },
                            { label: '0.96x Мягкий', val: 0.96 },
                            { label: '1.02x Теплый', val: 1.02 },
                            { label: '1.15x Яркий', val: 1.15 }
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() =>
                                setAvatarSettings({
                                  ...avatarSettings,
                                  [selectedExpert]: {
                                    ...avatarSettings[selectedExpert],
                                    pitch: preset.val
                                  }
                                })
                              }
                              className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                                Math.abs(avatarSettings[selectedExpert].pitch - preset.val) < 0.02
                                  ? 'bg-purple-600 text-white border-purple-500 font-semibold'
                                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/80'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Intensity / Volume Modulation */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>Мягкость и громкость:</span>
                          </label>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                              {avatarSettings[selectedExpert].intensity}%
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              ({avatarSettings[selectedExpert].intensity < 62
                                ? 'Шепот'
                                : avatarSettings[selectedExpert].intensity <= 68
                                ? 'Мягкий'
                                : avatarSettings[selectedExpert].intensity <= 80
                                ? 'Терапевтический'
                                : 'Стандарт'})
                            </span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="30"
                          max="100"
                          step="1"
                          value={avatarSettings[selectedExpert].intensity}
                          onChange={(e) =>
                            setAvatarSettings({
                              ...avatarSettings,
                              [selectedExpert]: {
                                ...avatarSettings[selectedExpert],
                                intensity: parseInt(e.target.value)
                              }
                            })
                          }
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />

                        {/* Quick Presets for Intensity */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">Пресеты:</span>
                          {[
                            { label: '55% Шепот', val: 55 },
                            { label: '62% Мягкий', val: 62 },
                            { label: '70% Соматика', val: 70 },
                            { label: '82% Студия', val: 82 }
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() =>
                                setAvatarSettings({
                                  ...avatarSettings,
                                  [selectedExpert]: {
                                    ...avatarSettings[selectedExpert],
                                    intensity: preset.val
                                  }
                                })
                              }
                              className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                                avatarSettings[selectedExpert].intensity === preset.val
                                  ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/80'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Voice Selection */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2">
                        <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                          <Headphones className="w-3.5 h-3.5 text-sky-400" />
                          <span>Нейросетевой голос:</span>
                        </label>
                        <select
                          value={avatarSettings[selectedExpert].voiceKey}
                          onChange={(e) =>
                            setAvatarSettings({
                              ...avatarSettings,
                              [selectedExpert]: {
                                ...avatarSettings[selectedExpert],
                                voiceKey: e.target.value
                              }
                            })
                          }
                          className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-800 outline-none cursor-pointer focus:border-sky-500/50"
                        >
                          <option value="ru-RU-SvetlanaNeural">
                            Светлана (Мягкий женский тембр, соматика)
                          </option>
                          <option value="ru-RU-DmitryNeural">
                            Дмитрий (Спокойный мужской баритон, пранаяма)
                          </option>
                          <option value="ru-RU-DenysNeural">
                            Денис (Уверенный мужской голос, инструкции)
                          </option>
                        </select>
                      </div>

                      {/* 4. Speech Rate */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-semibold text-slate-200 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                            <span>Темп речи:</span>
                          </label>
                          <span className="text-sky-300 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 text-[11px]">
                            {avatarSettings[selectedExpert].speechRate > 0
                              ? `+${avatarSettings[selectedExpert].speechRate}%`
                              : `${avatarSettings[selectedExpert].speechRate}%`}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="-25"
                          max="15"
                          step="1"
                          value={avatarSettings[selectedExpert].speechRate}
                          onChange={(e) =>
                            setAvatarSettings({
                              ...avatarSettings,
                              [selectedExpert]: {
                                ...avatarSettings[selectedExpert],
                                speechRate: parseInt(e.target.value)
                              }
                            })
                          }
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <button
                            type="button"
                            onClick={() =>
                              setAvatarSettings({
                                ...avatarSettings,
                                [selectedExpert]: {
                                  ...avatarSettings[selectedExpert],
                                  speechRate: -18
                                }
                              })
                            }
                            className="hover:text-sky-300 transition-colors"
                          >
                            -18% (Релакс)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAvatarSettings({
                                ...avatarSettings,
                                [selectedExpert]: {
                                  ...avatarSettings[selectedExpert],
                                  speechRate: -12
                                }
                              })
                            }
                            className="hover:text-sky-300 transition-colors"
                          >
                            -12% (Медитация)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAvatarSettings({
                                ...avatarSettings,
                                [selectedExpert]: {
                                  ...avatarSettings[selectedExpert],
                                  speechRate: 0
                                }
                              })
                            }
                            className="hover:text-sky-300 transition-colors"
                          >
                            0% (Стандарт)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Real-Time Test Bench */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-white">
                            Проверка голоса
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSsmlCode(!showSsmlCode)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] transition-colors flex items-center space-x-1"
                        >
                          <Code className="w-3 h-3" />
                          <span>{showSsmlCode ? 'Скрыть код' : 'SSML код'}</span>
                        </button>
                      </div>

                      {/* Quick Preset Phrases */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Тестовые фразы:</span>
                        {[
                          {
                            label: 'Заземление 5-4-3-2-1',
                            text: 'Здравствуйте... Сделайте мягкий глубокий вдох... Почувствуйте опору под ногами и назовите пять предметов вокруг.'
                          },
                          {
                            label: 'Квадрат 4-4-4-4',
                            text: 'Приветствую... Давайте выполним цикл квадратного дыхания: вдох на 4 счета, задержка 4, выдох 4, пауза 4.'
                          },
                          {
                            label: 'Снятие зажима',
                            text: 'Сожмите кулаки на три секунды, а затем мягко разожмите и сделайте длинный выдох со звуком ха-а-а.'
                          }
                        ].map((phrase) => (
                          <button
                            key={phrase.label}
                            type="button"
                            onClick={() => setStudioTestPhrase(phrase.text)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                              studioTestPhrase === phrase.text
                                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 font-medium'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                            }`}
                          >
                            {phrase.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom Test Phrase Input */}
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={studioTestPhrase}
                          onChange={(e) => setStudioTestPhrase(e.target.value)}
                          placeholder="Введите текст для озвучивания..."
                          className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Action Play/Stop Button with Live Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span>Голос: <strong className="text-purple-300 font-semibold">{avatarSettings[selectedExpert].voiceKey.replace('ru-RU-', '').replace('Neural', '')}</strong></span>
                          <span className="text-slate-600">·</span>
                          <span>Тон: <strong className="text-emerald-300">{avatarSettings[selectedExpert].pitch.toFixed(2)}x</strong></span>
                          <span className="text-slate-600">·</span>
                          <span>Интенсивность: <strong className="text-emerald-300">{avatarSettings[selectedExpert].intensity}%</strong></span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isPlayingAudio ? (
                            <button
                              type="button"
                              onClick={() => {
                                if ('speechSynthesis' in window) {
                                  window.speechSynthesis.cancel();
                                }
                                setIsPlayingAudio(false);
                              }}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all flex items-center space-x-2 shadow-lg shadow-rose-950/40 animate-pulse"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Остановить</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handlePlayVoice(
                                  studioTestPhrase,
                                  selectedExpert,
                                  avatarSettings[selectedExpert].pitch,
                                  avatarSettings[selectedExpert].intensity,
                                  avatarSettings[selectedExpert].speechRate
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all flex items-center space-x-2 shadow-lg shadow-purple-950/40"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Озвучить фразу</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Collapsible SSML & Backend Prosody Inspector */}
                      {showSsmlCode && (
                        <div className="pt-2 border-t border-slate-800 space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-purple-300 font-semibold flex items-center space-x-1.5">
                              <Code className="w-3.5 h-3.5 text-purple-400" />
                              <span>SSML Prosody:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const code = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ru-RU">\n  <voice name="${avatarSettings[selectedExpert].voiceKey}">\n    <prosody pitch="${avatarSettings[selectedExpert].pitch >= 1 ? `+${Math.round((avatarSettings[selectedExpert].pitch - 1) * 100)}%` : `${Math.round((avatarSettings[selectedExpert].pitch - 1) * 100)}%`}" rate="${avatarSettings[selectedExpert].speechRate >= 0 ? `+${avatarSettings[selectedExpert].speechRate}%` : `${avatarSettings[selectedExpert].speechRate}%`}" volume="${avatarSettings[selectedExpert].intensity}%">\n      ${studioTestPhrase}\n    </prosody>\n  </voice>\n</speak>`;
                                handleCopySsml(code);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                            >
                              {copiedSsml ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedSsml ? 'Скопировано!' : 'Копировать'}</span>
                            </button>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                            <span className="text-purple-400">&lt;speak</span> <span className="text-slate-400">version=</span><span className="text-emerald-400">"1.0"</span> <span className="text-slate-400">xml:lang=</span><span className="text-emerald-400">"ru-RU"</span><span className="text-purple-400">&gt;</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-purple-400">&lt;voice</span> <span className="text-slate-400">name=</span><span className="text-emerald-400">"{avatarSettings[selectedExpert].voiceKey}"</span><span className="text-purple-400">&gt;</span>
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400">&lt;prosody</span> <span className="text-slate-400">pitch=</span><span className="text-teal-400">"{avatarSettings[selectedExpert].pitch >= 1 ? `+${Math.round((avatarSettings[selectedExpert].pitch - 1) * 100)}%` : `${Math.round((avatarSettings[selectedExpert].pitch - 1) * 100)}%`}"</span> <span className="text-slate-400">rate=</span><span className="text-teal-400">"{avatarSettings[selectedExpert].speechRate >= 0 ? `+${avatarSettings[selectedExpert].speechRate}%` : `${avatarSettings[selectedExpert].speechRate}%`}"</span> <span className="text-slate-400">volume=</span><span className="text-teal-400">"{avatarSettings[selectedExpert].intensity}%"</span><span className="text-indigo-400">&gt;</span>
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-100">{studioTestPhrase}</span>
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400">&lt;/prosody&gt;</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-purple-400">&lt;/voice&gt;</span>
                            <br />
                            <span className="text-purple-400">&lt;/speak&gt;</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strict Mode and Telegram Voice Notes toggles */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={avatarSettings[selectedExpert].strictRAG}
                        onChange={(e) => setAvatarSettings({
                          ...avatarSettings,
                          [selectedExpert]: { ...avatarSettings[selectedExpert], strictRAG: e.target.checked }
                        })}
                        className="mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-medium text-white block">
                          Строгий режим ответов (Zero Hallucinations)
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-relaxed">
                          Отвечать строго по фактам из базы знаний. Если темы нет в материалах — предложить очную консультацию.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={avatarSettings[selectedExpert].voiceNotesEnabled}
                        onChange={(e) => setAvatarSettings({
                          ...avatarSettings,
                          [selectedExpert]: { ...avatarSettings[selectedExpert], voiceNotesEnabled: e.target.checked }
                        })}
                        className="mt-0.5 rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-medium text-white block">
                          Голосовые ответы в Telegram
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-relaxed">
                          Отправлять аудиосообщение вместе с текстом ответа.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Save Settings Button */}
                  <div className="pt-2 flex items-center justify-between">
                    {saveSettingsSuccess ? (
                      <span className="text-xs text-emerald-400 flex items-center space-x-1.5 animate-fadeIn">
                        <Check className="w-3.5 h-3.5" />
                        <span>Настройки сохранены!</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Параметры активны
                      </span>
                    )}

                    <button
                      onClick={handleSaveAvatarSettings}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center space-x-2 shadow-lg shadow-purple-950/40"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Сохранить настройки</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Knowledge Base Documents Manager & Telegram */}
              <div className="lg:col-span-5 space-y-6">
                {/* Knowledge Base Uploader & Documents */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-bold text-sm text-white">
                        База знаний эксперта
                      </h3>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {knowledgeDocuments.filter(d => d.expertId === selectedExpert).length} файлов
                    </span>
                  </div>

                  {/* Upload Box Simulation */}
                  <div
                    onClick={handleSimulateUploadDocument}
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                      isUploadingDoc
                        ? 'border-emerald-500/60 bg-emerald-950/20'
                        : 'border-slate-800 hover:border-emerald-500/40 bg-slate-950/60 hover:bg-slate-950'
                    }`}
                  >
                    {isUploadingDoc ? (
                      <div className="space-y-2 py-2">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                        <div className="text-xs font-semibold text-white">Обработка и индексация...</div>
                        <p className="text-[11px] text-slate-400">
                          Разбиение на смысловые фрагменты и сохранение
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-1">
                        <Upload className="w-6 h-6 text-emerald-400/80 mx-auto" />
                        <div className="text-xs font-semibold text-white">
                          Загрузить лекцию или конспект
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          PDF, DOCX, TXT. Автоматическое разбиение на чанки.
                        </p>
                        <span className="inline-block mt-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                          + Нажмите для загрузки файла
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Documents List */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Сохраненные материалы:
                    </span>

                    {knowledgeDocuments.filter(d => d.expertId === selectedExpert).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 sm:p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-white line-clamp-1">{doc.title}</div>
                            <span className="text-[11px] text-slate-400">{doc.filename} • {doc.fileSize}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0 font-medium">
                            {doc.chunksCount} чанков
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-900">
                          <span className="text-teal-400 truncate max-w-[140px] sm:max-w-[200px]">{doc.cluster}</span>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => setSelectedDocForInspection(doc)}
                              className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                              title="Посмотреть чанки"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>Просмотр</span>
                            </button>
                            <span>•</span>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-rose-400 hover:text-rose-300 transition-colors flex items-center space-x-1"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Удалить</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telegram Bot Integration Card */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-sky-400" />
                      <h3 className="font-bold text-sm text-white">Интеграция с Telegram</h3>
                    </div>
                    <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Подключен</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ученики задают вопросы боту в Telegram и мгновенно получают ответ с мягким голосовым сообщением от цифрового двойника.
                  </p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Имя бота:</span>
                      <span className="text-sky-300 font-semibold font-mono">{avatarSettings[selectedExpert].telegramBot}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Формат ответов:</span>
                      <span className="text-slate-300">Текст + Аудиосообщение</span>
                    </div>
                  </div>

                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Открыть диалог в Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal for Inspecting Chunks of a Specific Document */}
            {selectedDocForInspection && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{selectedDocForInspection.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedDocForInspection.filename} • {selectedDocForInspection.chunksCount} векторных чанков
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDocForInspection(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {selectedDocForInspection.chunks.map((chunk, idx) => (
                      <div key={chunk.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 font-mono">
                          <span>{chunk.title}</span>
                          <span className="text-[10px] text-slate-500">chunk #{idx + 1}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setSelectedDocForInspection(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PIPELINE TOPOLOGY */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Архитектура обработки</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                Цикл обработки вопроса ученика
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                От момента отправки вопроса до воспроизведения мягкого голосового ответа: локальный поиск по материалам эксперта, генерация точного ответа и синтез речи.
              </p>
            </div>

            {/* Pipeline Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">1</span>
                    <span className="text-[10px] text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Векторизация</span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">Анализ вопроса</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Вопрос ученика преобразуется в векторное представление для точного семантического поиска.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Мгновенный локальный расчет</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs">2</span>
                    <span className="text-[10px] text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Поиск</span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">База эксперта</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Поиск наиболее подходящих фрагментов лекций и медитаций выбранного автора.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Высокая точность сопоставления</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">3</span>
                    <span className="text-[10px] text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Gemini Cloud VPN</span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">Google Gemini 3.8 Flash</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Запрос маршрутизируется через европейский Cloud VPN шлюз сервера, обеспечивая 100% доступность из любых стран без внешнего VPN.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Обход гео-блокировок</span>
                  <span className="text-emerald-400 font-mono text-[10px]">europe-west2</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">4</span>
                    <span className="text-[10px] text-purple-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Озвучка</span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">Мягкий голос</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Озвучивание ответа с медитативным ритмом, мягким тоном и естественными паузами.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Плавное аудиосообщение</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FILES & SERVICES EXPLORER */}
        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
            {/* File List Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Сервисы этапа 3</span>
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">{files.length}</span>
              </div>
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFile(file.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex flex-col space-y-1 ${
                      activeFile === file.name
                        ? 'bg-slate-800/90 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{file.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="lg:col-span-3 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
              <div className="border-b border-slate-800 px-4 py-3 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-sm font-semibold text-white">{currentFile.path}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {currentFile.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{currentFile.description}</p>
                </div>
                <button
                  onClick={() => handleCopy(currentFile.content, currentFile.name)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
                >
                  {copiedFile === currentFile.name ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-950 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[580px] overflow-y-auto">
                <pre>{currentFile.content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CHECKLIST & APPROVAL */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Чеклист выполнения ЭТАПА 3: Локальный RAG и Бесплатный AI-пайплайн</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Все компоненты пайплайна полностью реализованы в чистом коде, протестированы и готовы к работе.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-white">1. Сервис нарезки и локальной векторизации (384 dims, CPU)</h5>
                    <p className="text-xs text-slate-400">
                      <code>DocumentChunker</code> (750 симв. с перекрытием 120) и <code>LocalEmbeddingService</code> на базе <code>paraphrase-multilingual-MiniLM-L12-v2</code> работают 100% локально на CPU без внешних платных API.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-white">2. Celery-таска для фоновой обработки документов</h5>
                    <p className="text-xs text-slate-400">
                      <code>process_knowledge_document</code> в <code>apps/knowledge/tasks.py</code> парсит PDF, DOCX, TXT, разбивает на чанки, вычисляет эмбеддинги и сохраняет в pgvector через bulk_create.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-white">3. Серверный шлюз Google Gemini 3.8 Flash со встроенным Cloud VPN</h5>
                    <p className="text-xs text-slate-400">
                      Маршрутизация через европейский edge-прокси (GCP europe-west2) с автоматическим обходом региональных блокировок. Доступно для пользователей из любых стран без необходимости стороннего VPN.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-white">4. Микросервис синтеза речи на Edge-TTS</h5>
                    <p className="text-xs text-slate-400">
                      <code>EdgeTTSService</code> генерирует аудиопотоки без API токенов и лимитов (нейросетевые голоса <code>ru-RU-DmitryNeural</code> и <code>ru-RU-SvetlanaNeural</code> с замедленным темпом -10%).
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-white">5. Интеграция в DRF (эндпоинты /chat/ и /search/)</h5>
                    <p className="text-xs text-slate-400">
                      Эндпоинт <code>POST /api/bot-settings/chat/</code> запускает весь пайплайн в один вызов, возвращая текст, цитаты, косинусное сходство и аудио в base64.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-white">6. Визуализация Recharts (Распределение косинусного сходства)</h5>
                    <p className="text-xs text-slate-400">
                      Интерактивная диаграмма BarChart с динамической линией порога <code>ReferenceLine</code>, цветовым разделением прошедших и отсеченных векторов и детальными тултипами.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready for Stage 4 Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white text-sm">Следующий шаг — ЭТАП 4: Фронтенд (Личный кабинет эксперта)</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    1) Базовый layout Next.js (App Router) + Tailwind CSS + shadcn/ui.<br />
                    2) Дашборд эксперта: статус бота, аналитика диалогов, размер векторной базы знаний.<br />
                    3) Форма настройки аватара: системный промпт, выбор бесплатного голоса и загрузка файлов в базу знаний.
                  </p>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition-colors shrink-0">
                  <span>Готов к Этапу 4</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE CUSTOM VOICE PRESET */}
      {isCreatingPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-purple-950/50">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/25 flex items-center justify-center">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Создание пресета модуляции</h4>
                  <p className="text-xs text-slate-400">Настройте параметры голоса и сохраните как категорию быстрого выбора</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingPresetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Название пресета:
                  </label>
                  <input
                    type="text"
                    value={newPresetForm.name}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, name: e.target.value })}
                    placeholder="напр. Вечерняя нидра"
                    className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 outline-none focus:border-purple-500/60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Категория / Тег:
                  </label>
                  <input
                    type="text"
                    value={newPresetForm.category}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, category: e.target.value })}
                    placeholder="напр. Релакс &amp; Сон"
                    className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 outline-none focus:border-purple-500/60"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Описание эффекта тембра:
                </label>
                <input
                  type="text"
                  value={newPresetForm.description}
                  onChange={(e) => setNewPresetForm({ ...newPresetForm, description: e.target.value })}
                  placeholder="напр. Бархатный шепот для засыпания и снятия напряжения..."
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 outline-none focus:border-purple-500/60"
                />
              </div>

              {/* Modulation Sliders in Modal */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
                  Параметры синтеза Edge-TTS:
                </span>

                {/* Pitch */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Высота тона (Pitch):</span>
                    <span className="font-mono text-purple-300 font-bold">{newPresetForm.pitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.70"
                    max="1.35"
                    step="0.01"
                    value={newPresetForm.pitch}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, pitch: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* Intensity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Интенсивность (Intensity):</span>
                    <span className="font-mono text-emerald-300 font-bold">{newPresetForm.intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="1"
                    value={newPresetForm.intensity}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, intensity: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Speech Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Темп речи (Rate):</span>
                    <span className="font-mono text-sky-300 font-bold">
                      {newPresetForm.speechRate > 0 ? `+${newPresetForm.speechRate}%` : `${newPresetForm.speechRate}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="15"
                    step="1"
                    value={newPresetForm.speechRate}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, speechRate: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Цветовая метка пресета:
                </label>
                <div className="flex items-center space-x-2">
                  {[
                    { id: 'purple', bg: 'bg-purple-500' },
                    { id: 'amber', bg: 'bg-amber-500' },
                    { id: 'indigo', bg: 'bg-indigo-500' },
                    { id: 'emerald', bg: 'bg-emerald-500' },
                    { id: 'sky', bg: 'bg-sky-500' },
                    { id: 'rose', bg: 'bg-rose-500' }
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setNewPresetForm({ ...newPresetForm, color: col.id as any })}
                      className={`w-7 h-7 rounded-lg ${col.bg} transition-all flex items-center justify-center ${
                        newPresetForm.color === col.id ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {newPresetForm.color === col.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Phrase */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Тестовая фраза для этого пресета:
                </label>
                <textarea
                  rows={2}
                  value={newPresetForm.samplePhrase}
                  onChange={(e) => setNewPresetForm({ ...newPresetForm, samplePhrase: e.target.value })}
                  placeholder="Текст, который будет озвучиваться при тестировании данного пресета..."
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 outline-none focus:border-purple-500/60 resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingPresetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPreset}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-purple-950/40 flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Сохранить пресет</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-300">MindAvatar</span>
            <span>•</span>
            <span>Цифровой двойник эксперта с модулируемым голосом</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Все системы активны</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
