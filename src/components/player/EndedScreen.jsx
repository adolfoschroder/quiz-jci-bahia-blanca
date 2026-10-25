import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToParticipantes, getPlayerRank } from '../../firebase/db';
import Particles from '../shared/Particles';

export default function EndedScreen({ playerId, playerName }) {
  const [players, setParticipantes] = useState([]);

  useEffect(() => {
    const unsub = subscribeToParticipantes(setParticipantes);
    return unsub;
  }, []);

  const myRank   = players.length ? getPlayerRank(players, playerId) : 0;
  const myPuntaje  = players.find((p) => p.id === playerId)?.score ?? 0;
  const isWinner = myRank === 1 && players.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#060B1C] via-[#0A0B27] to-[#130F2D]">
      {isWinner && <Particles count={30} />}

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="glass rounded-2xl p-8 text-center max-w-xs w-full"
      >
        <div className="text-6xl mb-4">
          {isWinner ? '🏆' : myRank <= 3 ? '🎉' : '👏'}
        </div>
        <h2 className="text-2xl font-black gradient-text mb-1">¡Terminó el concurso!</h2>
        <p className="text-white/50 text-sm mb-6">¡Gracias por participar, {playerName}!</p>

        <div className="space-y-3">
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-brand-300 uppercase tracking-wider">Posición final</p>
            <p className="text-3xl font-black text-white">#{myRank || '—'}</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-brand-300 uppercase tracking-wider">Puntaje total</p>
            <p className="text-3xl font-black gradient-text">{myPuntaje}</p>
          </div>
        </div>

        {isWinner && (
          <motion.p
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-4 text-yellow-300 font-black text-lg"
          >
            👑 You won!
          </motion.p>
        )}
      </motion.div>

      <a
        href="https://deadtechguy.fun"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-0 right-0 text-center text-white/20 text-xs hover:text-white/40 transition-colors"
      >
        Built by DeadTechGuy
      </a>
    </div>
  );
}
