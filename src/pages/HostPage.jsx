import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import useGameState from '../hooks/useGameState';
import { subscribeToQuestions, startQuiz, advanceToResults, advanceToLeaderboard, nextQuestion, endQuiz } from '../firebase/db';
import { pageFade } from '../lib/motion';
import WaitingScreen    from '../components/host/WaitingScreen';
import QuestionPhase    from '../components/host/QuestionPhase';
import ResultsPhase     from '../components/host/ResultsPhase';
import LeaderboardPhase from '../components/host/LeaderboardPhase';
import EndedPhase       from '../components/host/EndedPhase';
import LoadingSpinner   from '../components/shared/LoadingSpinner';
import ErrorScreen      from '../components/shared/ErrorScreen';

// HostPage is read-only — pure projector display.
// Auto-advance lives in AdminPage so meta writes stay admin-authenticated.
export default function HostPage() {
  const { gameState, loading, error } = useGameState();
  const [questions, setQuestions] = useState([]);
  const [isPresenter, setIsPresenter] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [controlError, setControlError] = useState('');

  useEffect(() => onAuthStateChanged(auth, user => {
    setIsPresenter(user?.uid === 'yxfjM5aYwCekqwW8q0IPB7OGCt13');
  }), []);


  useEffect(() => {
    const unsub = subscribeToQuestions(setQuestions);
    return unsub;
  }, []);

  // El temporizador funciona también desde la proyección, siempre que
  // el presentador haya iniciado sesión en el navegador.
  useEffect(() => {
    if (!isPresenter || gameState?.phase !== 'question' || !gameState.questionStartTime) return;
    const question = questions[gameState.currentQuestionIndex];
    if (!question) return;
    const started = gameState.questionStartTime.toMillis?.()
      ?? (gameState.questionStartTime.seconds ?? 0) * 1000;
    const remaining = Math.max(0, (question.timer ?? 15) * 1000 - (Date.now() - started));
    const timer = setTimeout(() => advanceToResults().catch(console.error), remaining);
    return () => clearTimeout(timer);
  }, [isPresenter, gameState?.phase, gameState?.currentQuestionIndex,
      gameState?.questionStartTime?.seconds, questions]);

  if (error) return <ErrorScreen message={error} />;
  if (loading) return <LoadingSpinner />;

  const phase    = gameState?.phase ?? 'waiting';
  const qIndex   = gameState?.currentQuestionIndex ?? 0;
  const currentQ = questions[qIndex];

  const joinUrl = gameState?.joinUrl || window.location.origin;
  const showQR  = gameState?.showQR ?? false;

  const lastQuestion = qIndex >= questions.length - 1;
  const action = phase === 'waiting' && questions.length
    ? { label: '▶ Iniciar concurso', run: startQuiz }
    : phase === 'question'
      ? { label: '⏭ Mostrar resultados', run: advanceToResults }
      : phase === 'results'
        ? { label: '📊 Mostrar clasificación', run: advanceToLeaderboard }
        : phase === 'leaderboard'
          ? lastQuestion
            ? { label: '🏁 Finalizar concurso', run: endQuiz }
            : { label: '▶ Siguiente pregunta (' + (qIndex + 2) + '/' + questions.length + ')', run: () => nextQuestion(qIndex, questions.length) }
          : null;

  const runAction = async () => {
    if (!action || advancing) return;
    setAdvancing(true);
    setControlError('');
    try { await action.run(); }
    catch (err) { setControlError(err?.message ?? 'No se pudo avanzar'); }
    finally { setAdvancing(false); }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Identidad JCI persistente en todas las fases */}
      <div className="fixed top-5 left-6 z-40 pointer-events-none flex items-center gap-3 rounded-xl bg-[#060B1C]/70 backdrop-blur-sm px-3 py-2 border border-white/10">
        <img src="/jci-bahia-blanca.svg" alt="JCI Bahía Blanca" className="w-32 sm:w-40 h-auto" />
        <div className="hidden lg:block h-7 w-px bg-white/20" />
        <span className="hidden lg:block text-white/80 text-xs font-semibold">Normas parlamentarias</span>
      </div>

      {/* Los controles no se muestran en la proyección pública anónima. */}
      {isPresenter && (
        <div className="fixed bottom-14 right-5 z-[60] flex flex-col items-end gap-2">
          {controlError && <p role="alert" className="rounded-xl bg-red-950/95 border border-red-400/50 text-red-100 text-xs px-3 py-2 max-w-xs">{controlError}</p>}
          {action && (
            <button type="button" onClick={runAction} disabled={advancing}
              className="px-6 py-4 rounded-2xl font-extrabold text-base bg-[#0097D7] hover:bg-[#007daf] text-white shadow-2xl shadow-black/50 border border-white/25 disabled:opacity-60 transition-colors">
              {advancing ? 'Procesando…' : action.label}
            </button>
          )}
          <span className="rounded-lg bg-[#060B1C]/80 px-3 py-1 text-[#A8E8FB] text-xs border border-white/10">Control del presentador</span>
        </div>
      )}

      {/* Join URL — fixed bottom bar, always visible on all host screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center
                      gap-2 py-2 bg-black/30 backdrop-blur-sm border-t border-white/5 pointer-events-none">
        <span className="text-white/30 text-sm">Ingresá en</span>
        <span className="text-brand-300 text-sm font-bold">
          {joinUrl.replace(/^https?:\/\//, '')}
        </span>
      </div>

      {/* QR overlay — bottom-left, only when showQR is on AND not during question */}
      <AnimatePresence>
        {showQR && phase !== 'question' && (
          <motion.div
            key="qr-overlay"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-12 left-6 z-50 bg-black/60 backdrop-blur-md
                       rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-2"
          >
            <QRCodeSVG
              value={joinUrl}
              size={200}
              bgColor="transparent"
              fgColor="#ffffff"
              level="M"
            />
            <span className="text-white/50 text-sm">Escaneá el QR para participar</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div key="waiting" {...pageFade} className="min-h-screen">
            <WaitingScreen gameState={gameState} />
          </motion.div>
        )}

        {phase === 'question' && currentQ && (
          <motion.div key={`q-${qIndex}`} {...pageFade} className="min-h-screen">
            <QuestionPhase
              question={currentQ}
              gameState={gameState}
              questionIndex={qIndex}
              totalQuestions={questions.length}
            />
          </motion.div>
        )}

        {phase === 'results' && currentQ && (
          <motion.div key={`r-${qIndex}`} {...pageFade} className="min-h-screen">
            <ResultsPhase
              question={currentQ}
              questionIndex={qIndex}
              totalQuestions={questions.length}
            />
          </motion.div>
        )}

        {phase === 'leaderboard' && (
          <motion.div key={`lb-${qIndex}`} {...pageFade} className="min-h-screen">
            <LeaderboardPhase
              gameState={gameState}
              questions={questions}
            />
          </motion.div>
        )}

        {phase === 'ended' && (
          <motion.div key="ended" {...pageFade} className="min-h-screen">
            <EndedPhase />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
