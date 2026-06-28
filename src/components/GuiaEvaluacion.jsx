import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GuiaEvaluacion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('guia');

  return (
    <>
      {/* Botón flotante para abrir la guía */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:shadow-orange-600/30 transition-all border border-white/10"
        >
          <span className="text-[18px]">🎓</span>
          <span className="text-[13px] tracking-wide font-semibold">Guía del Evaluador</span>
        </motion.button>
      </div>

      {/* Modal con la guía */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-[#072146]/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
              className="bg-white rounded-3xl border border-[#EAECF0] shadow-2xl overflow-hidden w-full max-w-[640px] flex flex-col max-h-[90vh] text-[#072146]"
            >
              {/* Header del Modal */}
              <div className="bg-[#004481] px-6 py-4 flex justify-between items-center text-white relative">
                <div>
                  <span className="bg-white/15 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Entorno de Pruebas</span>
                  <h2 className="text-[16px] font-bold mt-1">Guía del Evaluador & Seguridad</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Pestañas (Tabs) */}
              <div className="flex border-b border-gray-100 bg-[#F8FAFC]">
                <button
                  onClick={() => setActiveTab('guia')}
                  className={`flex-1 py-3 text-[13px] font-bold border-b-2 transition-colors ${
                    activeTab === 'guia'
                      ? 'border-[#004481] text-[#004481] bg-white'
                      : 'border-transparent text-gray-400 hover:text-[#072146]'
                  }`}
                >
                  📋 Flujo de Activación
                </button>
                <button
                  onClick={() => setActiveTab('seguridad')}
                  className={`flex-1 py-3 text-[13px] font-bold border-b-2 transition-colors ${
                    activeTab === 'seguridad'
                      ? 'border-[#004481] text-[#004481] bg-white'
                      : 'border-transparent text-gray-400 hover:text-[#072146]'
                  }`}
                >
                  🛡️ Seguridad Implementada
                </button>
              </div>

              {/* Contenido de las pestañas */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-[13.5px]">
                {activeTab === 'guia' ? (
                  <div className="space-y-4">
                    {/* Propósito */}
                    <div>
                      <h3 className="font-bold text-[#004481] text-[14px] flex items-center gap-1.5">
                        <span>🎯</span> Propósito del Sitio Web
                      </h3>
                      <p className="text-gray-500 mt-1 leading-relaxed">
                        Este sitio web es una <strong>simulación académica</strong> desarrollada para el proyecto de fin de ciclo universitario. Su objetivo es emular las operaciones clave de banca por internet en un entorno controlado (sandbox) y demostrar la integración de reglas de riesgo crediticio.
                      </p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Flujo de simulación paso a paso */}
                    <div>
                      <h3 className="font-bold text-[#004481] text-[14px] flex items-center gap-1.5">
                        <span>🚀</span> Flujo de Activación y Evaluación
                      </h3>
                      <p className="text-gray-500 mt-1 mb-3">
                        Sigue estos pasos para evaluar el flujo de créditos y riesgos:
                      </p>

                      <div className="space-y-3">
                        {/* Paso 1 */}
                        <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3.5">
                          <p className="font-bold text-amber-800 text-[12.5px] uppercase">Paso 1: Solicitar Préstamo (Cliente)</p>
                          <div className="mt-1 text-gray-600 space-y-1">
                            <p>1. Inicia sesión como <strong>Cliente</strong> en el botón principal.</p>
                            <p className="text-[12.5px] bg-white/80 inline-block px-2 py-0.5 rounded border border-amber-200/30">
                              🔑 DNI: <strong>12345678</strong> · Clave: <strong>123456</strong>
                            </p>
                            <p className="mt-1">2. Ve a la sección de <strong>Préstamos</strong> en el panel lateral y envía una nueva solicitud de crédito (ej. S/ 5,000).</p>
                          </div>
                        </div>

                        {/* Paso 2 */}
                        <div className="bg-[#EEF3FB] border border-[#004481]/15 rounded-xl p-3.5">
                          <p className="font-bold text-[#004481] text-[12.5px] uppercase">Paso 2: Evaluar la Solicitud (Asesor)</p>
                          <div className="mt-1 text-gray-600 space-y-1">
                            <p>1. Cierra sesión e ingresa a <strong>Acceso colaboradores</strong> (ubicado en el footer).</p>
                            <p className="text-[12.5px] bg-white/80 inline-block px-2 py-0.5 rounded border border-[#004481]/10">
                              🔑 Código: <strong>EMP00001</strong> · Clave: <strong>654321</strong>
                            </p>
                            <p className="mt-1">2. En el panel de control del asesor financiero verás la solicitud en estado <strong>Pendiente</strong>.</p>
                            <p>3. Evalúa la solicitud aprobándola o rechazándola. Podrás ingresar los ingresos/gastos evaluados y añadir observaciones.</p>
                          </div>
                        </div>

                        {/* Paso 3 */}
                        <div className="bg-[#E6F7F0] border border-[#0F6E56]/15 rounded-xl p-3.5">
                          <p className="font-bold text-[#0F6E56] text-[12.5px] uppercase">Paso 3: Verificación de Resultados (Cliente)</p>
                          <div className="mt-1 text-gray-600 space-y-1">
                            <p>1. Vuelve a iniciar sesión con la cuenta de <strong>Cliente</strong> (DNI: 12345678).</p>
                            <p>2. En su panel verás el préstamo actualizado con su estado final (Aprobado o Rechazado). Si fue aprobado, su saldo disponible se habrá incrementado inmediatamente con el desembolso.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-[#004481] text-[14px] flex items-center gap-1.5">
                        <span>🛡️</span> Robustecimiento de Seguridad
                      </h3>
                      <p className="text-gray-500 mt-1 leading-relaxed">
                        Implementamos defensas a nivel de frontend y backend para mitigar ataques comunes y salvaguardar los datos simulados:
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Rate Limiting */}
                      <div className="bg-slate-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="font-bold text-[#072146] text-[13px] flex items-center gap-1.5">
                          ⏱️ Bloqueo Incremental contra Fuerza Bruta
                        </p>
                        <p className="text-gray-500 text-[12px] mt-1 leading-relaxed">
                          Si un usuario intenta adivinar una clave, el servidor bloquea las credenciales de forma temporal. La penalización aumenta con cada reincidencia para frustrar ataques automatizados:
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[11px] font-semibold">
                          <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">
                            3 Fallos
                            <span className="block text-[10px] font-normal text-red-600 mt-0.5">Bloqueo de 1 min</span>
                          </div>
                          <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">
                            6 Fallos
                            <span className="block text-[10px] font-normal text-red-600 mt-0.5">Bloqueo de 5 min</span>
                          </div>
                          <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">
                            9+ Fallos
                            <span className="block text-[10px] font-normal text-red-600 mt-0.5">Bloqueo de 10 min</span>
                          </div>
                        </div>
                      </div>

                      {/* Alertas en Tiempo Real */}
                      <div className="bg-slate-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="font-bold text-[#072146] text-[13px] flex items-center gap-1.5">
                          🚨 Detección y Alertas de Intrusión (Banner)
                        </p>
                        <p className="text-gray-500 text-[12px] mt-1 leading-relaxed">
                          Cualquier intento fallido se registra. Al iniciar sesión exitosamente, el cliente legítimo recibe un aviso destacado en su panel que detalla los accesos denegados, indicando la **fecha/hora**, la **dirección IP** y el **navegador** utilizado por el atacante.
                        </p>
                      </div>

                      {/* Backend Security */}
                      <div className="bg-slate-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="font-bold text-[#072146] text-[13px] flex items-center gap-1.5">
                          🔒 Seguridad en el Servidor (API en PHP)
                        </p>
                        <ul className="text-gray-500 text-[12px] mt-1.5 space-y-1.5 list-disc list-inside">
                          <li><strong>Protección contra Inyección SQL:</strong> Implementada mediante sentencias preparadas utilizando PDO en todas las interacciones con la base de datos MySQL.</li>
                          <li><strong>Contraseñas Cifradas:</strong> Almacenamiento seguro usando hashing robusto en el servidor con <code className="bg-gray-200/50 px-1 py-0.5 rounded text-[#e01e5a]">bcrypt</code> (PHP <code className="bg-gray-200/50 px-1 py-0.5 rounded text-[#e01e5a]">password_hash</code>).</li>
                          <li><strong>Tokens de Sesión Únicos:</strong> Uso de tokens aleatorios criptográficamente seguros para validar la autorización, previniendo ataques de tipo IDOR (Insecure Direct Object Reference).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer del Modal */}
              <div className="bg-[#F8FAFC] border-t border-gray-100 px-6 py-4 flex justify-between items-center text-[12px] text-gray-400">
                <span>Proyecto de Simulación Bancaria</span>
                <span>Ekubyte © 2026</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuiaEvaluacion;
