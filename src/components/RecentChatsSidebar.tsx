import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  Clock,
  Trash2,
  Play,
  Pause,
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Bot,
  Volume2,
  Sparkles,
  Layers,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';

export interface RecentChat {
  id: string;
  createdAt: number;
  timestamp: string;
  expertId: 'elena' | 'dmitry';
  expertName: string;
  query: string;
  response: string;
  similarityThreshold: number;
  bestMatchSimilarity: number;
  acceptedChunksCount: number;
  voiceKey: 'elena' | 'dmitry';
}

export const STORAGE_KEY_RECENT_CHATS = 'mindavatar_recent_chats';

export const DEFAULT_SAMPLE_CHATS: RecentChat[] = [
  {
    id: 'sample-chat-1',
    createdAt: Date.now() - 1000 * 60 * 18,
    timestamp: 'Сегодня, 10:42',
    expertId: 'elena',
    expertName: 'Елена Смирнова',
    query: 'Как успокоиться, если началась паническая атака на работе?',
    response: `Сделайте глубокий вдох прямо сейчас... и мягкий, длинный выдох. Вы в безопасности.

Опираясь на практику заземления:
1. Поставьте обе стопы на пол и физически почувствуйте плотность опоры под ногами.
2. Примените метод фиксации чувств: найдите взглядом 3 предмета вокруг себя, почувствуйте ткань одежды на запястьях.
3. Сделайте выдох в два раза длиннее вдоха: вдох носом на 3 секунды — плавный выдох через расслабленные губы на 6 секунд.

Позвольте волне тревоги просто пройти сквозь тело, не сопротивляясь ей. Вы управляете своим вниманием.`,
    similarityThreshold: 0.65,
    bestMatchSimilarity: 0.942,
    acceptedChunksCount: 4,
    voiceKey: 'elena'
  },
  {
    id: 'sample-chat-2',
    createdAt: Date.now() - 1000 * 60 * 65,
    timestamp: 'Сегодня, 09:15',
    expertId: 'dmitry',
    expertName: 'Дмитрий Волков',
    query: 'Как правильно делать квадратное дыхание 4-4-4-4?',
    response: `Здравствуйте. Остановитесь на секунду. Опустите плечи вниз и расслабьте челюсть.

Давайте прямо сейчас сделаем 3 цикла квадратного дыхания:
• Вдох на 4 счета: раз, два, три, четыре...
• Задержка дыхания на 4 счета: сохраняйте мягкость в груди...
• Медленный выдох на 4 счета: отпускаем напряжение...
• Пауза на 4 счета: побудьте в этой тишине.

Повторите еще дважды. Частота пульса уже начинает снижаться. Наше тело помнит, как быть спокойным.`,
    similarityThreshold: 0.60,
    bestMatchSimilarity: 0.961,
    acceptedChunksCount: 4,
    voiceKey: 'dmitry'
  },
  {
    id: 'sample-chat-3',
    createdAt: Date.now() - 1000 * 60 * 60 * 14,
    timestamp: 'Вчера, 22:30',
    expertId: 'elena',
    expertName: 'Елена Смирнова',
    query: 'Посоветуй дыхательную практику перед сном при бессоннице',
    response: `Перенесите 100% фокуса в подошвы ног и область диафрагмы. 

Выполните мягкий сброс зажима: сожмите ладони на 3 секунды, затем полностью разожмите пальцы и сделайте длинный выдох со звуком «ха-а-а». Это активирует парасимпатическую нервную систему и подготавливает тело к глубокому непрерывному сну.`,
    similarityThreshold: 0.70,
    bestMatchSimilarity: 0.884,
    acceptedChunksCount: 3,
    voiceKey: 'elena'
  }
];

export function getStoredRecentChats(): RecentChat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_CHATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 5);
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored recent chats:', err);
  }
  return DEFAULT_SAMPLE_CHATS;
}

export function saveStoredRecentChats(chats: RecentChat[]) {
  try {
    const capped = chats.slice(0, 5);
    localStorage.setItem(STORAGE_KEY_RECENT_CHATS, JSON.stringify(capped));
  } catch (err) {
    console.warn('Failed to save recent chats:', err);
  }
}

export interface RecentChatsSidebarProps {
  chats: RecentChat[];
  activeChatId: string | null;
  onSelectChat: (chat: RecentChat) => void;
  onDeleteChat: (chatId: string) => void;
  onClearChats: () => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onPlayVoice: (text: string, voiceType: 'elena' | 'dmitry') => void;
  isPlayingAudio: boolean;
}

export const RecentChatsSidebar: React.FC<RecentChatsSidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onClearChats,
  onNewChat,
  isOpen,
  onToggle,
  onPlayVoice,
  isPlayingAudio
}) => {
  const [playingChatId, setPlayingChatId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handlePlayChatVoice = (e: React.MouseEvent, chat: RecentChat) => {
    e.stopPropagation();
    if (isPlayingAudio && playingChatId === chat.id) {
      setPlayingChatId(null);
      onPlayVoice(chat.response, chat.voiceKey);
    } else {
      setPlayingChatId(chat.id);
      onPlayVoice(chat.response, chat.voiceKey);
    }
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChat(chatId);
    if (playingChatId === chatId) {
      setPlayingChatId(null);
    }
  };

  return (
    <aside
      className={`rounded-2xl bg-slate-900/95 border border-slate-800 transition-all duration-300 flex flex-col shadow-xl backdrop-blur-md overflow-hidden ${
        isOpen ? 'w-full' : 'w-full lg:w-auto'
      }`}
      aria-label="История недавних диалогов"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/90 flex items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white tracking-tight truncate">
                Недавние диалоги
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 shrink-0">
                {chats.length}/5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Сохраненные сессии с аватарами
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={onNewChat}
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm shadow-emerald-950/40 flex items-center space-x-1"
            title="Начать новый диалог"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-semibold pr-1">Новый</span>
          </button>

          {/* Close/Toggle button */}
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={isOpen ? 'Свернуть панель' : 'Развернуть панель'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main List of Recent Chats */}
      {isOpen && (
        <div className="p-3 space-y-2.5 max-h-[560px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {chats.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 space-y-2.5">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">
                История диалогов пуста
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Задайте вопрос в поле RAG-симулятора выше — последние 5 диалогов будут сохранены здесь автоматически.
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const isSelected = activeChatId === chat.id;
              const isElena = chat.expertId === 'elena';
              const isPlayingThis = isPlayingAudio && playingChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Expert & Timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isElena
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {isElena ? 'ЕС' : 'ДВ'}
                      </div>
                      <span className="text-xs font-semibold text-white truncate">
                        {chat.expertName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{chat.timestamp}</span>
                    </div>
                  </div>

                  {/* Question snippet */}
                  <div className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                    «{chat.query}»
                  </div>

                  {/* Response preview */}
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic leading-relaxed">
                    {chat.response}
                  </p>

                  {/* Metadata Chips & Quick Audio Button */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1 text-[10px] font-mono">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        cos: {chat.bestMatchSimilarity.toFixed(3)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {chat.acceptedChunksCount} чанка
                      </span>
                      <span className="text-slate-400 hidden sm:inline">
                        th: {chat.similarityThreshold.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {/* Audio listen button */}
                      <button
                        type="button"
                        onClick={(e) => handlePlayChatVoice(e, chat)}
                        className={`p-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                          isPlayingThis
                            ? 'bg-purple-600 text-white animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title={isPlayingThis ? 'Остановить аудио' : 'Прослушать ответ аватара'}
                      >
                        {isPlayingThis ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-purple-400" />
                        )}
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Удалить из недавних"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Sidebar Footer */}
      {isOpen && chats.length > 0 && (
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/50 flex items-center justify-between text-xs">
          {showClearConfirm ? (
            <div className="w-full flex items-center justify-between gap-2 animate-fadeIn">
              <span className="text-[11px] text-rose-300">Очистить все 5 диалогов?</span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onClearChats();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-colors"
                >
                  Да, очистить
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:text-white transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-[10px] text-slate-400">
                Хранятся в памяти браузера
              </span>
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Очистить историю</span>
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
