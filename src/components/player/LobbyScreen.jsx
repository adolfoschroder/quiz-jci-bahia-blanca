import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToPlayerCount } from '../../firebase/db';

export default function LobbyScreen({ playerName, gameTitle = 'Quiz JCI Bahía Blanca' }) {
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToPlayerCount(setPlayerCount);
    return unsub;
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5 py-8 overflow-hidden bg-gradient-to-br from-[#060B1C] via-[#0A0B27] to-[#130F2D]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full border-[25px] border-[#0097D7]/15" />
        <div className="absolute -top-14 -right-14 w-60 h-60 rounded-full border-[20px] border-[#57BCBC]/15" />
        <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-[#0097D7]/10 blur-3xl" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <img
          src="/jci-bahia-blanca.svg"
          alt="JCI Bahía Blanca"
          className="w-52 max-w-full h-auto mx-auto mb-8"
        />
        <p className="text-[#57BCBC] text-xs font-bold uppercase tracking-[0.18em] mb-3">¡Ya estás participando!</p>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{gameTitle}</h1>
        <p className="text-white/65 text-sm mt-3">Prepará tus respuestas. ¡En breve empezamos!</p>

        <section className="glass-strong rounded-2xl p-6 mt-7 space-y-5 shadow-xl shadow-black/20" aria-label="Estado de la trivia">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Tu nombre en el juego</p>
            <p className="text-2xl font-black text-white mt-1 break-words">{playerName}</p>
          </div>

          <div className="h-px bg-white/15" />

          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Participantes en la sala</p>
            <motion.p
              key={playerCount}
              initial={{ scale: 1.15, color: '#57BCBC' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
              className="text-5xl font-black mt-2 tabular-nums"
            >
              {playerCount}
            </motion.p>
          </div>

          <div className="h-px bg-white/15" />

          <div className="flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#57BCBC] opacity-40 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#57BCBC]" />
            </span>
            <p className="text-[#A8E8FB] font-medium text-sm">Esperando que el presentador inicie…</p>
          </div>
        </section>

        <p className="text-white/45 text-xs mt-6">No cierres esta pantalla: la trivia comenzará automáticamente.</p>
      </motion.main>
    </div>
  );
}
