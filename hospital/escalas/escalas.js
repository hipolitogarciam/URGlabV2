/* ─────────────────────────────────────────────────────────────────────────
   URGlab · Motor de Escalas — BASE DE DATOS
   Cada escala es un objeto autocontenido. El motor (engine.js) lo renderiza.

   tipo: 'puntos'  → suma de ítems (campos[].opciones[].v)
         'formula' → cálculo numérico (calcular(v))

   interpretar(valor, v) → { nivel, color, titulo, texto }
     color: 'verde' | 'ambar' | 'rojo' | 'gris'

   ⚠ VERIFICACIÓN CLÍNICA: cada umbral citado con su fuente. Revisar antes
     de publicar. Apoyo a la decisión, NO sustituye el juicio clínico.
   ───────────────────────────────────────────────────────────────────────── */

const SUBCATS = [
    { id: 'cardiovascular', nombre: 'Cardiovascular', color: 'red',
      svg: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
      stroke: '#ef4444' },
    { id: 'respiratorio', nombre: 'Respiratorio', color: 'blue',
      svg: '<path d="M12 2v6"/><path d="M8 8H4a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6h1v3h2v-3h1a6 6 0 0 0 6-6v-2a2 2 0 0 0-2-2h-4"/><path d="M8 8a4 4 0 0 1 8 0"/>',
      stroke: '#1a7fc8' },
    { id: 'hemodinamica', nombre: 'Hemodinámica / Crítico', color: 'orange',
      svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      stroke: '#f97316' },
    { id: 'digestivo', nombre: 'Digestivo / Cirugía', color: 'amber',
      svg: '<path d="M3 11l1-4h4l1 4"/><path d="M4 11v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1"/><path d="M13 7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v3c0 2.2-1.8 4-4 4h-1"/><path d="M14 14v4a1 1 0 0 0 1 1h1"/><path d="M8 11h5"/><path d="M9 7v4"/>',
      stroke: '#f59e0b' },
    { id: 'infeccioso', nombre: 'Infeccioso', color: 'teal',
      svg: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
      stroke: '#09c797' },
    { id: 'nefro', nombre: 'Nefro / Metabólico', color: 'blue',
      svg: '<path d="M12 2v6"/><path d="M8 8H4a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6h1v3h2v-3h1a6 6 0 0 0 6-6v-2a2 2 0 0 0-2-2h-4"/>',
      stroke: '#1a7fc8' },
    { id: 'geriatria', nombre: 'Geriatría', color: 'purple',
      svg: '<circle cx="12" cy="6" r="3"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
      stroke: '#7c3aed' },
    { id: 'neuro', nombre: 'Neurológico', color: 'purple',
      svg: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/>',
      stroke: '#8b5cf6' },
    { id: 'trauma', nombre: 'Trauma', color: 'slate',
      svg: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M12 8a4 4 0 0 0-4 4v1h8v-1a4 4 0 0 0-4-4Z"/><path d="M8 13v4"/><path d="M16 13v4"/><path d="M10 22h4"/>',
      stroke: '#64748b' },
    { id: 'psiquiatricas', nombre: 'Psiquiátricas', color: 'rose',
      svg: '<path d="M12 2a6 6 0 0 0-6 6c0 2 1 3 1.5 5H16.5c.5-2 1.5-3 1.5-5a6 6 0 0 0-6-6Z"/><path d="M9 19h6"/><path d="M10 22h4"/>',
      stroke: '#db2777' },
];

const ESCALAS = [

    /* ───────────────────────── HEART Score ─────────────────────────────
       Six AJ et al. Neth Heart J 2008. Validación: Backus BE et al.
       Int J Cardiol 2013 (MACE a 6 semanas).                              */
    {
        id: 'heart',
        nombre: 'HEART Score',
        sub: 'cardiovascular',
        abrev: 'Dolor torácico · riesgo MACE',
        tipo: 'puntos',
        fuente: 'Six AJ 2008 · validación Backus 2013',
        nota: 'Para dolor torácico no traumático en urgencias con sospecha de SCA. Estima MACE (muerte, IAM, revascularización) a 6 semanas.',
        campos: [
            { id: 'h', label: 'Historia clínica (anamnesis)', opciones: [
                { t: 'Poco sospechosa', v: 0 },
                { t: 'Moderadamente sospechosa', v: 1 },
                { t: 'Muy sospechosa', v: 2 },
            ]},
            { id: 'e', label: 'ECG', opciones: [
                { t: 'Normal', v: 0 },
                { t: 'Alt. inespecífica de repolarización', v: 1 },
                { t: 'Desviación significativa del ST', v: 2 },
            ]},
            { id: 'a', label: 'Edad', prefillAge: true, opciones: [
                { t: '< 45 años', v: 0, ageMax: 44 },
                { t: '45 – 64 años', v: 1, ageMin: 45, ageMax: 64 },
                { t: '≥ 65 años', v: 2, ageMin: 65 },
            ]},
            { id: 'r', label: 'Factores de riesgo', sublabel: 'HTA, dislipemia, DM, tabaquismo, obesidad (IMC>30), historia familiar', opciones: [
                { t: 'Ningún factor', v: 0 },
                { t: '1 – 2 factores', v: 1 },
                { t: '≥ 3 factores o enf. aterosclerótica conocida', v: 2 },
            ]},
            { id: 't', label: 'Troponina', opciones: [
                { t: '≤ límite normal', v: 0 },
                { t: '1 – 3× el límite', v: 1 },
                { t: '> 3× el límite', v: 2 },
            ]},
        ],
        resultadoLabel: 'HEART',
        interpretar: (total) => {
            if (total <= 3) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 3 puntos',
                texto: 'MACE a 6 semanas 0,9 – 1,7 %. Valorable alta precoz / vía ambulatoria según protocolo local.' };
            if (total <= 6) return { nivel: 'Riesgo moderado', color: 'ambar',
                titulo: '4 – 6 puntos',
                texto: 'MACE a 6 semanas ~12 – 17 %. Observación / ingreso, seriación de troponina y pruebas adicionales.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '7 – 10 puntos',
                texto: 'MACE a 6 semanas ~50 – 65 %. Considerar manejo invasivo precoz.' };
        },
    },

    /* ───────────────────── CHA₂DS₂-VASc ─────────────────────────────────
       Lip GYH et al. Chest 2010. Guía ESC FA 2020: el sexo femenino es
       modificador de riesgo (suma sólo si hay ≥1 factor adicional).        */
    {
        id: 'cha2ds2-vasc',
        nombre: 'CHA₂DS₂-VASc',
        sub: 'cardiovascular',
        abrev: 'FA · riesgo tromboembólico',
        tipo: 'puntos',
        fuente: 'Lip GYH 2010 · ESC FA 2020',
        nota: 'Estima el riesgo embólico anual en fibrilación auricular no valvular para decidir anticoagulación.',
        campos: [
            { id: 'c', label: 'Insuficiencia cardíaca / disfunción VI', opciones: [
                { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'h', label: 'Hipertensión arterial', opciones: [
                { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'a', label: 'Edad', prefillAge: true, opciones: [
                { t: '< 65 años', v: 0, ageMax: 64 }, { t: '65 – 74 años', v: 1, ageMin: 65, ageMax: 74 }, { t: '≥ 75 años', v: 2, ageMin: 75 } ]},
            { id: 'd', label: 'Diabetes mellitus', opciones: [
                { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 's', label: 'Ictus / AIT / tromboembolismo previo', opciones: [
                { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'v', label: 'Enfermedad vascular', sublabel: 'IAM previo, arteriopatía periférica o placa aórtica', opciones: [
                { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'sx', label: 'Sexo', opciones: [
                { t: 'Varón', v: 0 }, { t: 'Mujer', v: 1 } ]},
        ],
        resultadoLabel: 'CHA₂DS₂-VASc',
        // Riesgo embólico anual aproximado por puntuación (Friberg 2012)
        interpretar: (total, v) => {
            const riesgoAnual = ['0 %','1,3 %','2,2 %','3,2 %','4,0 %','6,7 %','9,8 %','9,6 %','6,7 %','15,2 %'];
            const pct = riesgoAnual[Math.min(total, 9)];
            const esMujer = v.sx === 1;
            // Puntos "clínicos" excluyendo el del sexo
            const clinicos = total - (esMujer ? 1 : 0);
            let bloque;
            if (clinicos === 0) bloque = { nivel: 'Riesgo bajo', color: 'verde',
                titulo: esMujer ? '1 punto (solo sexo)' : '0 puntos',
                texto: `No se recomienda anticoagulación. Riesgo embólico anual ≈ ${pct}.` };
            else if (clinicos === 1) bloque = { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: `${total} punto(s)`,
                texto: `Considerar anticoagulación (decisión individualizada). Riesgo embólico anual ≈ ${pct}.` };
            else bloque = { nivel: 'Riesgo alto', color: 'rojo',
                titulo: `${total} puntos`,
                texto: `Anticoagulación recomendada (salvo contraindicación). Riesgo embólico anual ≈ ${pct}.` };
            return bloque;
        },
    },

    /* ───────────────────────── Shock Index ─────────────────────────────
       Allgöwer & Burri 1967. SI = FC / PAS. Normal 0,5 – 0,7.             */
    {
        id: 'shock-index',
        nombre: 'Shock Index',
        sub: 'hemodinamica',
        abrev: 'FC / PAS · perfusión',
        tipo: 'formula',
        fuente: 'Allgöwer & Burri 1967',
        nota: 'Marcador precoz de compromiso hemodinámico, más sensible que la FC o la PAS aisladas. Útil en triaje de shock, sepsis y hemorragia.',
        inputs: [
            { id: 'fc', label: 'Frecuencia cardíaca', unidad: 'lpm', placeholder: 'Ej. 110' },
            { id: 'pas', label: 'Presión arterial sistólica', unidad: 'mmHg', placeholder: 'Ej. 95' },
        ],
        calcular: (v) => v.fc / v.pas,
        resultadoLabel: 'Shock Index',
        decimales: 2,
        interpretar: (si) => {
            if (si < 0.5) return { nivel: 'Por debajo del rango', color: 'gris',
                titulo: 'SI < 0,5', texto: 'Valor bajo; revisar plausibilidad de las constantes introducidas.' };
            if (si <= 0.7) return { nivel: 'Normal', color: 'verde',
                titulo: '0,5 – 0,7', texto: 'Perfusión presumiblemente conservada.' };
            if (si < 1.0) return { nivel: 'Elevado', color: 'ambar',
                titulo: '0,7 – 1,0', texto: 'Posible compromiso hemodinámico incipiente. Reevaluar y vigilar.' };
            return { nivel: 'Shock / hipoperfusión', color: 'rojo',
                titulo: '≥ 1,0', texto: 'Asociado a mayor mortalidad y necesidad de medidas de resucitación. Actuar.' };
        },
    },

    /* ───────────────────────────── FeNa ────────────────────────────────
       Espinel CH. JAMA 1976. FeNa = (UNa·PCr)/(PNa·UCr) × 100.            */
    {
        id: 'fena',
        nombre: 'FeNa',
        sub: 'nefro',
        abrev: 'Excreción fraccional de sodio',
        tipo: 'formula',
        fuente: 'Espinel CH, JAMA 1976',
        nota: 'Diferencia fracaso renal prerrenal de necrosis tubular aguda (NTA) en el fracaso renal agudo oligúrico.',
        inputs: [
            { id: 'una', label: 'Sodio en orina (UNa)', unidad: 'mEq/L', placeholder: 'Ej. 20' },
            { id: 'pna', label: 'Sodio plasmático (PNa)', unidad: 'mEq/L', placeholder: 'Ej. 140' },
            { id: 'ucr', label: 'Creatinina en orina (UCr)', unidad: 'mg/dL', placeholder: 'Ej. 80' },
            { id: 'pcr', label: 'Creatinina plasmática (PCr)', unidad: 'mg/dL', placeholder: 'Ej. 3.0' },
        ],
        calcular: (v) => (v.una * v.pcr) / (v.pna * v.ucr) * 100,
        resultadoLabel: 'FeNa',
        unidadResultado: '%',
        decimales: 2,
        nota2: 'Poco fiable con diuréticos, enf. renal crónica o glucosuria. En esos casos usar la FeUrea (< 35 % sugiere prerrenal).',
        interpretar: (fena) => {
            if (fena < 1) return { nivel: 'Patrón prerrenal', color: 'verde',
                titulo: 'FeNa < 1 %',
                texto: 'Sugiere causa prerrenal (hipovolemia, bajo gasto). También: glomerulonefritis aguda, contraste, síndrome hepatorrenal.' };
            if (fena <= 2) return { nivel: 'Indeterminado', color: 'ambar',
                titulo: 'FeNa 1 – 2 %',
                texto: 'Zona de solapamiento. Integrar con la clínica, el sedimento y la respuesta a volumen.' };
            return { nivel: 'Patrón renal intrínseco', color: 'rojo',
                titulo: 'FeNa > 2 %',
                texto: 'Sugiere necrosis tubular aguda u otra causa intrínseca.' };
        },
    },

    /* ───────────────────────── HAS-BLED ─────────────────────────────────
       Pisters R et al. Chest 2010. Riesgo hemorrágico en FA anticoagulada. */
    {
        id: 'has-bled',
        nombre: 'HAS-BLED',
        sub: 'cardiovascular',
        abrev: 'FA · riesgo hemorrágico',
        tipo: 'puntos',
        fuente: 'Pisters R 2010',
        nota: 'Estima el riesgo de sangrado mayor en pacientes con FA anticoagulados. Una puntuación alta no contraindica la anticoagulación: identifica factores corregibles y la necesidad de seguimiento estrecho.',
        campos: [
            { id: 'h', label: 'Hipertensión (PAS > 160 mmHg)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'r', label: 'Función renal alterada', sublabel: 'Diálisis, trasplante o creatinina > 2,26 mg/dL (> 200 µmol/L)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'l', label: 'Función hepática alterada', sublabel: 'Cirrosis, o bilirrubina > 2× y transaminasas > 3×', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 's', label: 'Ictus previo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'b', label: 'Sangrado previo o predisposición', sublabel: 'Anemia, diátesis hemorrágica', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'i', label: 'INR lábil', sublabel: 'Tiempo en rango terapéutico < 60 %', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'e', label: 'Edad > 65 años', prefillAge: true, opciones: [ { t: 'No', v: 0, ageMax: 65 }, { t: 'Sí', v: 1, ageMin: 66 } ]},
            { id: 'd', label: 'Fármacos que predisponen al sangrado', sublabel: 'Antiagregantes, AINE', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'a', label: 'Consumo de alcohol (≥ 8 U/semana)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'HAS-BLED',
        interpretar: (total) => {
            if (total <= 2) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 2 puntos', texto: 'Riesgo hemorrágico bajo. Sangrado mayor ≈ 1 – 2 % por año-paciente.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '≥ 3 puntos', texto: 'Riesgo hemorrágico alto (≈ 4 – 12 %/año). Corregir factores modificables y vigilancia estrecha; no contraindica anticoagular.' };
        },
    },

    /* ───────────────────────── CURB-65 ──────────────────────────────────
       Lim WS et al. Thorax 2003. Gravedad de neumonía adquirida comunidad. */
    {
        id: 'curb-65',
        nombre: 'CURB-65',
        sub: 'respiratorio',
        abrev: 'Neumonía · gravedad',
        tipo: 'puntos',
        fuente: 'Lim WS, Thorax 2003',
        nota: 'Estratifica la gravedad de la neumonía adquirida en la comunidad y orienta el destino (alta, ingreso, UCI).',
        campos: [
            { id: 'c', label: 'Confusión', sublabel: 'Desorientación en tiempo, espacio o persona', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'u', label: 'Urea > 7 mmol/L', sublabel: 'BUN > 19 mg/dL (urea > 42 mg/dL)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'r', label: 'Frecuencia respiratoria ≥ 30 rpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'b', label: 'PAS < 90 o PAD ≤ 60 mmHg', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'a', label: 'Edad ≥ 65 años', prefillAge: true, opciones: [ { t: 'No', v: 0, ageMax: 64 }, { t: 'Sí', v: 1, ageMin: 65 } ]},
        ],
        resultadoLabel: 'CURB-65',
        interpretar: (total) => {
            if (total <= 1) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 1 puntos', texto: 'Mortalidad a 30 días < 3 %. Tratamiento ambulatorio habitualmente posible.' };
            if (total === 2) return { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: '2 puntos', texto: 'Mortalidad ≈ 9 %. Valorar ingreso u observación hospitalaria.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '3 – 5 puntos', texto: 'Mortalidad 15 – 40 %. Ingreso; con 4 – 5 puntos valorar UCI.' };
        },
    },

    /* ──────────────────────── PaO₂ / FiO₂ ───────────────────────────────
       Cociente de oxigenación. Criterios de Berlín (SDRA, con PEEP ≥ 5).  */
    {
        id: 'pafi',
        nombre: 'PaO₂ / FiO₂',
        sub: 'respiratorio',
        abrev: 'Cociente de oxigenación',
        tipo: 'formula',
        fuente: 'Definición de Berlín (SDRA) 2012',
        nota: 'Cociente de oxigenación. La clasificación de SDRA de Berlín exige PEEP/CPAP ≥ 5 cmH₂O.',
        inputs: [
            { id: 'pao2', label: 'PaO₂ (gasometría arterial)', unidad: 'mmHg', placeholder: 'Ej. 80' },
            { id: 'fio2', label: 'FiO₂', unidad: '%', placeholder: 'Ej. 40' },
        ],
        calcular: (v) => v.pao2 / (v.fio2 / 100),
        resultadoLabel: 'PaO₂/FiO₂',
        decimales: 0,
        interpretar: (pf) => {
            if (pf > 300) return { nivel: 'Sin criterio de SDRA', color: 'verde',
                titulo: '> 300', texto: 'Oxigenación conservada (normal ≈ 400 – 500). No cumple criterio de SDRA.' };
            if (pf > 200) return { nivel: 'SDRA leve', color: 'ambar',
                titulo: '200 – 300', texto: 'SDRA leve (con PEEP ≥ 5).' };
            if (pf > 100) return { nivel: 'SDRA moderado', color: 'rojo',
                titulo: '100 – 200', texto: 'SDRA moderado (con PEEP ≥ 5).' };
            return { nivel: 'SDRA grave', color: 'rojo',
                titulo: '≤ 100', texto: 'SDRA grave (con PEEP ≥ 5). Considerar medidas avanzadas.' };
        },
    },

    /* ──────────────────────── SpO₂ / FiO₂ (SaFi) ────────────────────────
       Rice TW et al. Chest 2007. Subrogado no invasivo del PaO₂/FiO₂.
       Correspondencias: S/F 235 ≈ P/F 200 · S/F 315 ≈ P/F 300.           */
    {
        id: 'safi',
        nombre: 'SpO₂ / FiO₂ (SaFi)',
        sub: 'respiratorio',
        abrev: 'Cociente de oxigenación no invasivo',
        tipo: 'formula',
        fuente: 'Rice TW, Chest 2007',
        nota: 'Subrogado no invasivo del PaO₂/FiO₂ cuando no se dispone de gasometría arterial. S/F = SpO₂ / FiO₂.',
        inputs: [
            { id: 'spo2', label: 'SpO₂ (pulsioximetría)', unidad: '%', placeholder: 'Ej. 94' },
            { id: 'fio2', label: 'FiO₂', unidad: '%', placeholder: 'Ej. 40' },
        ],
        calcular: (v) => v.spo2 / (v.fio2 / 100),
        resultadoLabel: 'SpO₂/FiO₂',
        decimales: 0,
        nota2: 'Fiable sobre todo con SpO₂ ≤ 97 %: por encima, la curva de saturación se aplana y subestima la hipoxemia.',
        interpretar: (sf) => {
            if (sf > 315) return { nivel: 'Sin criterio de SDRA', color: 'verde',
                titulo: '> 315', texto: 'Equivale a PaO₂/FiO₂ > 300. Oxigenación conservada.' };
            if (sf > 235) return { nivel: 'SDRA leve', color: 'ambar',
                titulo: '235 – 315', texto: 'Equivale a PaO₂/FiO₂ ≈ 200 – 300 (SDRA leve, con PEEP ≥ 5).' };
            return { nivel: 'SDRA moderado-grave', color: 'rojo',
                titulo: '≤ 235', texto: 'Equivale a PaO₂/FiO₂ < 200 (SDRA moderado-grave). Confirmar con gasometría.' };
        },
    },

    /* ───────────────────────── ROX index ────────────────────────────────
       Roca O et al. Am J Respir Crit Care Med 2019. Predice fracaso OAF.  */
    {
        id: 'rox',
        nombre: 'Índice ROX',
        sub: 'respiratorio',
        abrev: 'Fracaso de oxigenoterapia de alto flujo',
        tipo: 'formula',
        fuente: 'Roca O 2019',
        nota: 'Predice el éxito o fracaso de la oxigenoterapia de alto flujo (OAF). Validado a las 2, 6 y 12 h de su inicio. ROX = (SpO₂ / FiO₂) / FR.',
        inputs: [
            { id: 'spo2', label: 'SpO₂', unidad: '%', placeholder: 'Ej. 95' },
            { id: 'fio2', label: 'FiO₂', unidad: '%', placeholder: 'Ej. 50' },
            { id: 'fr', label: 'Frecuencia respiratoria', unidad: 'rpm', placeholder: 'Ej. 25' },
        ],
        calcular: (v) => (v.spo2 / (v.fio2 / 100)) / v.fr,
        resultadoLabel: 'ROX',
        decimales: 2,
        interpretar: (rox) => {
            if (rox >= 4.88) return { nivel: 'Bajo riesgo de fracaso', color: 'verde',
                titulo: 'ROX ≥ 4,88', texto: 'Asociado a éxito de la OAF. Mantener y reevaluar.' };
            if (rox >= 3.85) return { nivel: 'Zona de vigilancia', color: 'ambar',
                titulo: 'ROX 3,85 – 4,88', texto: 'Indeterminado. Reevaluar de forma estrecha y repetir el cálculo.' };
            return { nivel: 'Alto riesgo de fracaso', color: 'rojo',
                titulo: 'ROX < 3,85', texto: 'Alto riesgo de fracaso de la OAF. Considerar intubación / escalar soporte.' };
        },
    },

    /* ───────────────────────── Wells TVP ────────────────────────────────
       Wells PS et al. Lancet 1997 / N Engl J Med 2003 (modelo 2 niveles). */
    {
        id: 'wells-tvp',
        nombre: 'Wells (TVP)',
        sub: 'cardiovascular',
        abrev: 'Probabilidad de trombosis venosa profunda',
        tipo: 'puntos',
        fuente: 'Wells PS 2003 (modelo dicotómico)',
        nota: 'Probabilidad clínica de trombosis venosa profunda de extremidad inferior.',
        campos: [
            { id: 'ca', label: 'Cáncer activo', sublabel: 'Tratamiento en los últimos 6 meses o paliativo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'par', label: 'Parálisis, paresia o inmovilización reciente de MMII', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'enc', label: 'Encamamiento > 3 días o cirugía mayor < 12 semanas', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'dol', label: 'Dolor a la palpación en trayecto venoso profundo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'tum', label: 'Tumefacción de toda la extremidad', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'per', label: 'Perímetro de pantorrilla > 3 cm respecto a la contralateral', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'fov', label: 'Edema con fóvea en la pierna sintomática', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'col', label: 'Venas colaterales superficiales no varicosas', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'pre', label: 'TVP previa documentada', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'alt', label: 'Diagnóstico alternativo tan o más probable que la TVP', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: -2 } ]},
        ],
        resultadoLabel: 'Wells TVP',
        interpretar: (total) => {
            if (total <= 1) return { nivel: 'TVP improbable', color: 'verde',
                titulo: '≤ 1 punto', texto: 'Solicitar dímero D: si negativo, descarta TVP. (≤ 0 ≈ 5 % de prevalencia.)' };
            return { nivel: 'TVP probable', color: 'rojo',
                titulo: '≥ 2 puntos', texto: 'Eco-doppler de compresión. Prevalencia alta (≈ 17 – 53 % según puntuación).' };
        },
    },

    /* ───────────────────────── Wells TEP ────────────────────────────────
       Wells PS et al. Ann Intern Med 2001 / Thromb Haemost 2000.          */
    {
        id: 'wells-tep',
        nombre: 'Wells (TEP)',
        sub: 'cardiovascular',
        abrev: 'Probabilidad de tromboembolismo pulmonar',
        tipo: 'puntos',
        fuente: 'Wells PS 2000 (modelo dicotómico)',
        nota: 'Probabilidad clínica de tromboembolismo pulmonar.',
        campos: [
            { id: 'tvp', label: 'Signos / síntomas clínicos de TVP', sublabel: 'Edema unilateral de pierna y dolor a la palpación del trayecto venoso profundo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 3 } ]},
            { id: 'alt', label: 'TEP es el diagnóstico más probable', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 3 } ]},
            { id: 'fc', label: 'Frecuencia cardíaca > 100 lpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1.5 } ]},
            { id: 'inm', label: 'Inmovilización ≥ 3 días o cirugía < 4 semanas', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1.5 } ]},
            { id: 'pre', label: 'TVP o TEP previos', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1.5 } ]},
            { id: 'hem', label: 'Hemoptisis', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'ca', label: 'Cáncer activo', sublabel: 'Tratamiento < 6 meses o paliativo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'Wells TEP',
        interpretar: (total) => {
            if (total <= 4) return { nivel: 'TEP improbable', color: 'verde',
                titulo: '≤ 4 puntos', texto: 'Solicitar dímero D: si negativo, descarta TEP (valorar PERC en baja sospecha).' };
            return { nivel: 'TEP probable', color: 'rojo',
                titulo: '> 4 puntos', texto: 'Angio-TC de arterias pulmonares (no demorar por el dímero D).' };
        },
    },

    /* ───────────────────────────── PERC ─────────────────────────────────
       Kline JA et al. J Thromb Haemost 2004. Descarta TEP en baja sospecha.*/
    {
        id: 'perc',
        nombre: 'PERC',
        sub: 'cardiovascular',
        abrev: 'Descartar TEP sin dímero D',
        tipo: 'puntos',
        fuente: 'Kline JA 2004',
        nota: 'Sólo aplicable si la probabilidad clínica de TEP ya es BAJA (< 15 %). Si los 8 criterios son negativos, descarta TEP sin necesidad de dímero D.',
        campos: [
            { id: 'edad', label: 'Edad ≥ 50 años', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'fc', label: 'Frecuencia cardíaca ≥ 100 lpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'spo2', label: 'SpO₂ < 95 % (aire ambiente)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'hem', label: 'Hemoptisis', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'est', label: 'Uso de estrógenos', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'cir', label: 'Cirugía o traumatismo con hospitalización < 4 semanas', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'pre', label: 'TVP o TEP previos', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'ede', label: 'Edema unilateral de pierna', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'PERC',
        interpretar: (total) => {
            if (total === 0) return { nivel: 'PERC negativo', color: 'verde',
                titulo: '0 criterios', texto: 'En paciente de baja probabilidad clínica, descarta TEP sin dímero D.' };
            return { nivel: 'PERC positivo', color: 'ambar',
                titulo: `${total} criterio(s) presentes`, texto: 'No descarta TEP. Continuar el estudio (dímero D según probabilidad clínica).' };
        },
    },

    /* ──────────────────── Glasgow Coma Scale (GCS) ──────────────────────
       Teasdale & Jennett, Lancet 1974.                                    */
    {
        id: 'gcs',
        nombre: 'Glasgow (GCS)',
        sub: 'neuro',
        abrev: 'Nivel de consciencia',
        tipo: 'puntos',
        fuente: 'Teasdale & Jennett 1974',
        nota: 'Escala de coma de Glasgow. Rango 3 – 15. Registrar el desglose (O + V + M).',
        campos: [
            { id: 'o', label: 'Apertura ocular (O)', opciones: [
                { t: 'Espontánea', v: 4 }, { t: 'A la voz', v: 3 }, { t: 'Al dolor', v: 2 }, { t: 'Ninguna', v: 1 } ]},
            { id: 'v', label: 'Respuesta verbal (V)', opciones: [
                { t: 'Orientada', v: 5 }, { t: 'Confusa', v: 4 }, { t: 'Palabras inapropiadas', v: 3 },
                { t: 'Sonidos incomprensibles', v: 2 }, { t: 'Ninguna', v: 1 } ]},
            { id: 'm', label: 'Respuesta motora (M)', opciones: [
                { t: 'Obedece órdenes', v: 6 }, { t: 'Localiza el dolor', v: 5 }, { t: 'Retirada al dolor', v: 4 },
                { t: 'Flexión anormal (decorticación)', v: 3 }, { t: 'Extensión (descerebración)', v: 2 }, { t: 'Ninguna', v: 1 } ]},
        ],
        resultadoLabel: 'GCS',
        interpretar: (total) => {
            if (total >= 13) return { nivel: 'TCE leve', color: 'verde',
                titulo: '13 – 15', texto: 'Alteración leve del nivel de consciencia.' };
            if (total >= 9) return { nivel: 'TCE moderado', color: 'ambar',
                titulo: '9 – 12', texto: 'Vigilancia estrecha; reevaluar de forma seriada.' };
            return { nivel: 'TCE grave', color: 'rojo',
                titulo: '≤ 8', texto: 'Bajo nivel de consciencia. Considerar protección de la vía aérea (intubación).' };
        },
    },

    /* ───────────────────────────── RASS ─────────────────────────────────
       Sessler CN et al. Am J Respir Crit Care Med 2002.                   */
    {
        id: 'rass',
        nombre: 'RASS',
        sub: 'hemodinamica',
        abrev: 'Agitación / sedación',
        tipo: 'puntos',
        fuente: 'Sessler CN 2002',
        nota: 'Richmond Agitation-Sedation Scale. Valora el nivel de agitación o sedación. Objetivo habitual en ventilación mecánica: 0 a −2.',
        campos: [
            { id: 'r', label: 'Nivel observado', opciones: [
                { t: '+4 Combativo', v: 4 }, { t: '+3 Muy agitado', v: 3 }, { t: '+2 Agitado', v: 2 },
                { t: '+1 Inquieto', v: 1 }, { t: '0 Alerta y tranquilo', v: 0 }, { t: '−1 Somnoliento', v: -1 },
                { t: '−2 Sedación ligera', v: -2 }, { t: '−3 Sedación moderada', v: -3 },
                { t: '−4 Sedación profunda', v: -4 }, { t: '−5 No despertable', v: -5 } ]},
        ],
        resultadoLabel: 'RASS',
        interpretar: (v) => {
            if (v >= 2) return { nivel: 'Agitación', color: 'rojo',
                titulo: `RASS ${v > 0 ? '+' : ''}${v}`, texto: 'Agitación significativa. Tratar la causa y valorar sedación.' };
            if (v >= 1) return { nivel: 'Inquietud', color: 'ambar',
                titulo: 'RASS +1', texto: 'Ansioso pero sin movimientos agresivos.' };
            if (v === 0) return { nivel: 'Alerta y tranquilo', color: 'verde',
                titulo: 'RASS 0', texto: 'Nivel ideal de vigilia.' };
            if (v >= -2) return { nivel: 'Sedación ligera', color: 'verde',
                titulo: `RASS ${v}`, texto: 'Sedación superficial, dentro del objetivo habitual en VM.' };
            if (v >= -3) return { nivel: 'Sedación moderada', color: 'ambar',
                titulo: 'RASS −3', texto: 'Sedación moderada; reevaluar la necesidad y la profundidad.' };
            return { nivel: 'Sedación profunda', color: 'rojo',
                titulo: `RASS ${v}`, texto: 'Sedación excesiva. Replantear la pauta salvo indicación específica.' };
        },
    },

    /* ──────────────────── Clinical Frailty Scale ────────────────────────
       Rockwood K et al. CMAJ 2005 (CFS de 9 niveles).                     */
    {
        id: 'cfs',
        nombre: 'Clinical Frailty Scale',
        sub: 'geriatria',
        abrev: 'Fragilidad clínica',
        tipo: 'puntos',
        fuente: 'Rockwood K 2005',
        nota: 'Escala de fragilidad clínica basada en el juicio global del estado basal (2 semanas antes de la enfermedad aguda). Útil para decisiones de adecuación del esfuerzo terapéutico.',
        campos: [
            { id: 'c', label: 'Nivel de fragilidad', opciones: [
                { t: '1 · Muy en forma', v: 1 }, { t: '2 · En forma', v: 2 }, { t: '3 · Manejándose bien', v: 3 },
                { t: '4 · Vulnerable', v: 4 }, { t: '5 · Levemente frágil', v: 5 }, { t: '6 · Moderadamente frágil', v: 6 },
                { t: '7 · Gravemente frágil', v: 7 }, { t: '8 · Muy gravemente frágil', v: 8 }, { t: '9 · Enfermo terminal', v: 9 } ]},
        ],
        resultadoLabel: 'CFS',
        interpretar: (v) => {
            if (v <= 3) return { nivel: 'No frágil', color: 'verde',
                titulo: `CFS ${v}`, texto: 'Persona robusta o en buen estado funcional.' };
            if (v === 4) return { nivel: 'Vulnerable', color: 'ambar',
                titulo: 'CFS 4', texto: 'No dependiente pero con síntomas que limitan la actividad.' };
            if (v <= 6) return { nivel: 'Fragilidad leve-moderada', color: 'ambar',
                titulo: `CFS ${v}`, texto: 'Dependencia para actividades instrumentales y/o básicas.' };
            return { nivel: 'Fragilidad grave', color: 'rojo',
                titulo: `CFS ${v}`, texto: 'Dependencia importante o fase terminal. Integrar en la adecuación del esfuerzo terapéutico.' };
        },
    },

    /* ───────────────────────────── NEWS2 ────────────────────────────────
       Royal College of Physicians 2017. Detección de deterioro clínico.
       (SpO₂ Escala 1; existe Escala 2 para insuf. resp. hipercápnica.)    */
    {
        id: 'news2',
        nombre: 'NEWS2',
        sub: 'hemodinamica',
        abrev: 'Deterioro clínico',
        tipo: 'puntos',
        fuente: 'Royal College of Physicians 2017',
        nota: 'National Early Warning Score 2. Detecta el deterioro clínico agudo a partir de constantes. Usa la Escala 1 de SpO₂ (paciente sin objetivo de saturación reducido).',
        campos: [
            { id: 'fr', label: 'Frecuencia respiratoria (rpm)', opciones: [
                { t: '≤ 8', v: 3 }, { t: '9 – 11', v: 1 }, { t: '12 – 20', v: 0 }, { t: '21 – 24', v: 2 }, { t: '≥ 25', v: 3 } ]},
            { id: 'spo2', label: 'SpO₂ (Escala 1)', opciones: [
                { t: '≥ 96 %', v: 0 }, { t: '94 – 95 %', v: 1 }, { t: '92 – 93 %', v: 2 }, { t: '≤ 91 %', v: 3 } ]},
            { id: 'o2', label: '¿Oxígeno suplementario?', opciones: [
                { t: 'Aire ambiente', v: 0 }, { t: 'Oxígeno', v: 2 } ]},
            { id: 'pas', label: 'Presión arterial sistólica (mmHg)', opciones: [
                { t: '≤ 90', v: 3 }, { t: '91 – 100', v: 2 }, { t: '101 – 110', v: 1 }, { t: '111 – 219', v: 0 }, { t: '≥ 220', v: 3 } ]},
            { id: 'fc', label: 'Frecuencia cardíaca (lpm)', opciones: [
                { t: '≤ 40', v: 3 }, { t: '41 – 50', v: 1 }, { t: '51 – 90', v: 0 }, { t: '91 – 110', v: 1 }, { t: '111 – 130', v: 2 }, { t: '≥ 131', v: 3 } ]},
            { id: 'avpu', label: 'Nivel de consciencia', opciones: [
                { t: 'Alerta', v: 0 }, { t: 'Confusión nueva / responde a voz, dolor o no responde', v: 3 } ]},
            { id: 'temp', label: 'Temperatura (°C)', opciones: [
                { t: '≤ 35,0', v: 3 }, { t: '35,1 – 36,0', v: 1 }, { t: '36,1 – 38,0', v: 0 }, { t: '38,1 – 39,0', v: 1 }, { t: '≥ 39,1', v: 2 } ]},
        ],
        resultadoLabel: 'NEWS2',
        nota2: 'Un único parámetro con 3 puntos (rojo) exige revisión clínica urgente aunque el total sea bajo.',
        interpretar: (total) => {
            if (total <= 4) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 4 puntos', texto: 'Monitorización según protocolo. Vigilar parámetros aislados con puntuación 3.' };
            if (total <= 6) return { nivel: 'Riesgo medio', color: 'ambar',
                titulo: '5 – 6 puntos', texto: 'Revisión clínica urgente por personal competente; monitorización más frecuente.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '≥ 7 puntos', texto: 'Respuesta de emergencia; valorar entorno de cuidados críticos y monitorización continua.' };
        },
    },

    /* ───────────────────────────── SOFA ─────────────────────────────────
       Vincent JL et al. Intensive Care Med 1996. Disfunción orgánica.     */
    {
        id: 'sofa',
        nombre: 'SOFA',
        sub: 'hemodinamica',
        abrev: 'Disfunción orgánica',
        tipo: 'puntos',
        fuente: 'Vincent JL 1996',
        nota: 'Sequential Organ Failure Assessment. Cuantifica la disfunción orgánica. Un incremento ≥ 2 puntos sobre el basal define disfunción orgánica aguda (Sepsis-3).',
        campos: [
            { id: 'resp', label: 'Respiración — PaO₂/FiO₂ (mmHg)', opciones: [
                { t: '≥ 400', v: 0 }, { t: '300 – 399', v: 1 }, { t: '200 – 299', v: 2 },
                { t: '100 – 199 (con soporte ventilatorio)', v: 3 }, { t: '< 100 (con soporte ventilatorio)', v: 4 } ]},
            { id: 'coag', label: 'Coagulación — Plaquetas (×10³/µL)', opciones: [
                { t: '≥ 150', v: 0 }, { t: '100 – 149', v: 1 }, { t: '50 – 99', v: 2 }, { t: '20 – 49', v: 3 }, { t: '< 20', v: 4 } ]},
            { id: 'hep', label: 'Hígado — Bilirrubina (mg/dL)', opciones: [
                { t: '< 1,2', v: 0 }, { t: '1,2 – 1,9', v: 1 }, { t: '2,0 – 5,9', v: 2 }, { t: '6,0 – 11,9', v: 3 }, { t: '≥ 12', v: 4 } ]},
            { id: 'cv', label: 'Cardiovascular', sublabel: 'Dosis de vasoactivos en µg/kg/min ≥ 1 h', opciones: [
                { t: 'PAM ≥ 70 mmHg', v: 0 }, { t: 'PAM < 70 mmHg', v: 1 }, { t: 'Dopamina ≤ 5 o dobutamina (cualquier dosis)', v: 2 },
                { t: 'Dopamina > 5, o adrenalina ≤ 0,1, o NA ≤ 0,1', v: 3 }, { t: 'Dopamina > 15, o adrenalina > 0,1, o NA > 0,1', v: 4 } ]},
            { id: 'snc', label: 'SNC — Glasgow (GCS)', opciones: [
                { t: '15', v: 0 }, { t: '13 – 14', v: 1 }, { t: '10 – 12', v: 2 }, { t: '6 – 9', v: 3 }, { t: '< 6', v: 4 } ]},
            { id: 'renal', label: 'Renal — Creatinina (mg/dL) o diuresis', opciones: [
                { t: '< 1,2', v: 0 }, { t: '1,2 – 1,9', v: 1 }, { t: '2,0 – 3,4', v: 2 },
                { t: '3,5 – 4,9 o diuresis < 500 mL/d', v: 3 }, { t: '≥ 5,0 o diuresis < 200 mL/d', v: 4 } ]},
        ],
        resultadoLabel: 'SOFA',
        interpretar: (total) => {
            if (total <= 6) return { nivel: 'Disfunción leve', color: 'verde',
                titulo: '0 – 6 puntos', texto: 'Mortalidad hospitalaria aproximada < 10 %.' };
            if (total <= 9) return { nivel: 'Disfunción moderada', color: 'ambar',
                titulo: '7 – 9 puntos', texto: 'Mortalidad aproximada 15 – 20 %.' };
            if (total <= 12) return { nivel: 'Disfunción grave', color: 'rojo',
                titulo: '10 – 12 puntos', texto: 'Mortalidad aproximada 40 – 50 %.' };
            return { nivel: 'Disfunción muy grave', color: 'rojo',
                titulo: '≥ 13 puntos', texto: 'Mortalidad aproximada > 50 %.' };
        },
    },

    /* ──────────────────── Diastolic Shock Index ─────────────────────────
       Ospina-Tascón GA et al. Crit Care 2020. DSI = FC / PAD.            */
    {
        id: 'dsi',
        nombre: 'Diastolic Shock Index',
        sub: 'hemodinamica',
        abrev: 'FC / PAD · vasoplejia',
        tipo: 'formula',
        fuente: 'Ospina-Tascón GA 2020',
        nota: 'Índice de shock diastólico (FC / PAD). Una PAD baja con taquicardia sugiere vasoplejia; un DSI elevado se asocia a peor pronóstico en el shock séptico.',
        inputs: [
            { id: 'fc', label: 'Frecuencia cardíaca', unidad: 'lpm', placeholder: 'Ej. 120' },
            { id: 'pad', label: 'Presión arterial diastólica', unidad: 'mmHg', placeholder: 'Ej. 50' },
        ],
        calcular: (v) => v.fc / v.pad,
        resultadoLabel: 'DSI',
        decimales: 2,
        nota2: 'Los puntos de corte están menos estandarizados que en el shock index clásico; interpretar siempre en el contexto clínico y la evolución.',
        interpretar: (dsi) => {
            if (dsi < 1.5) return { nivel: 'Probablemente normal', color: 'verde',
                titulo: 'DSI < 1,5', texto: 'Sin datos sugestivos de vasoplejia marcada en la mayoría de contextos.' };
            if (dsi <= 2.5) return { nivel: 'Vigilar', color: 'ambar',
                titulo: 'DSI 1,5 – 2,5', texto: 'Posible componente vasopléjico. Reevaluar perfusión y respuesta al tratamiento.' };
            return { nivel: 'Elevado', color: 'rojo',
                titulo: 'DSI > 2,5', texto: 'Asociado a peor pronóstico en el shock séptico. Valorar soporte vasoactivo precoz.' };
        },
    },

    /* ───────────────────────── Child-Pugh ───────────────────────────────
       Pugh RNH et al. Br J Surg 1973. Gravedad de la cirrosis.            */
    {
        id: 'child-pugh',
        nombre: 'Child-Pugh',
        sub: 'digestivo',
        abrev: 'Cirrosis · gravedad',
        tipo: 'puntos',
        fuente: 'Pugh RNH 1973',
        nota: 'Clasifica la gravedad de la hepatopatía crónica (cirrosis) y estima la supervivencia.',
        campos: [
            { id: 'bili', label: 'Bilirrubina (mg/dL)', opciones: [
                { t: '< 2', v: 1 }, { t: '2 – 3', v: 2 }, { t: '> 3', v: 3 } ]},
            { id: 'alb', label: 'Albúmina (g/dL)', opciones: [
                { t: '> 3,5', v: 1 }, { t: '2,8 – 3,5', v: 2 }, { t: '< 2,8', v: 3 } ]},
            { id: 'inr', label: 'INR', opciones: [
                { t: '< 1,7', v: 1 }, { t: '1,7 – 2,3', v: 2 }, { t: '> 2,3', v: 3 } ]},
            { id: 'asc', label: 'Ascitis', opciones: [
                { t: 'Ausente', v: 1 }, { t: 'Leve (controlada con diuréticos)', v: 2 }, { t: 'Moderada-grave (refractaria)', v: 3 } ]},
            { id: 'enc', label: 'Encefalopatía', opciones: [
                { t: 'Ausente', v: 1 }, { t: 'Grado I – II', v: 2 }, { t: 'Grado III – IV', v: 3 } ]},
        ],
        resultadoLabel: 'Child-Pugh',
        interpretar: (total) => {
            if (total <= 6) return { nivel: 'Clase A', color: 'verde',
                titulo: '5 – 6 puntos', texto: 'Cirrosis bien compensada. Supervivencia a 1 año ≈ 100 %, a 2 años ≈ 85 %.' };
            if (total <= 9) return { nivel: 'Clase B', color: 'ambar',
                titulo: '7 – 9 puntos', texto: 'Compromiso funcional significativo. Supervivencia a 1 año ≈ 80 %, a 2 años ≈ 60 %.' };
            return { nivel: 'Clase C', color: 'rojo',
                titulo: '10 – 15 puntos', texto: 'Cirrosis descompensada. Supervivencia a 1 año ≈ 45 %, a 2 años ≈ 35 %.' };
        },
    },

    /* ───────────────────────────── MELD ─────────────────────────────────
       Kamath PS et al. Hepatology 2001 (MELD original).                   */
    {
        id: 'meld',
        nombre: 'MELD',
        sub: 'digestivo',
        abrev: 'Hepatopatía terminal',
        tipo: 'formula',
        fuente: 'Kamath PS 2001 (MELD original)',
        nota: 'Model for End-stage Liver Disease. Estima la mortalidad a 90 días y prioriza el trasplante hepático. Valores < 1 se redondean a 1; creatinina máxima 4,0 mg/dL (o 4,0 si diálisis ≥ 2/semana).',
        inputs: [
            { id: 'bili', label: 'Bilirrubina', unidad: 'mg/dL', placeholder: 'Ej. 2.5' },
            { id: 'inr', label: 'INR', unidad: '', placeholder: 'Ej. 1.8' },
            { id: 'cr', label: 'Creatinina', unidad: 'mg/dL', placeholder: 'Ej. 1.5' },
        ],
        calcular: (v) => {
            const bili = Math.max(v.bili, 1);
            const inr = Math.max(v.inr, 1);
            const cr = Math.min(Math.max(v.cr, 1), 4);
            const meld = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(cr) + 6.43;
            return Math.min(Math.max(Math.round(meld), 6), 40);
        },
        resultadoLabel: 'MELD',
        decimales: 0,
        nota2: 'Es el MELD original; en la asignación actual de trasplante se emplean variantes (MELD-Na, MELD 3.0).',
        interpretar: (meld) => {
            if (meld < 10) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '< 10', texto: 'Mortalidad a 90 días aproximada 2 %.' };
            if (meld < 20) return { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: '10 – 19', texto: 'Mortalidad a 90 días aproximada 6 %.' };
            if (meld < 30) return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '20 – 29', texto: 'Mortalidad a 90 días aproximada 20 %.' };
            return { nivel: 'Riesgo muy alto', color: 'rojo',
                titulo: '≥ 30', texto: 'Mortalidad a 90 días ≥ 50 %.' };
        },
    },

    /* ─────────────────── Glasgow-Blatchford (GBS) ───────────────────────
       Blatchford O et al. Lancet 2000. Riesgo en HDA; Hb según el sexo.   */
    {
        id: 'gbs',
        nombre: 'Glasgow-Blatchford',
        sub: 'digestivo',
        abrev: 'Hemorragia digestiva alta',
        tipo: 'mixto',
        fuente: 'Blatchford O 2000',
        nota: 'Estratifica el riesgo en la hemorragia digestiva alta e identifica a los pacientes de bajo riesgo candidatos a manejo ambulatorio.',
        campos: [
            { id: 'urea', label: 'Urea (mg/dL)', opciones: [
                { t: '< 39', v: 0 }, { t: '39 – 47', v: 2 }, { t: '48 – 59', v: 3 }, { t: '60 – 149', v: 4 }, { t: '≥ 150', v: 6 } ]},
            { id: 'sexo', label: 'Sexo', sublabel: 'Determina los umbrales de hemoglobina', prefillSex: true, opciones: [
                { t: 'Varón', v: 0, sex: 'M' }, { t: 'Mujer', v: 1, sex: 'F' } ]},
            { id: 'hb', label: 'Hemoglobina', input: 'numero', unidad: 'g/dL', placeholder: 'Ej. 11.5' },
            { id: 'pas', label: 'Presión arterial sistólica (mmHg)', opciones: [
                { t: '≥ 110', v: 0 }, { t: '100 – 109', v: 1 }, { t: '90 – 99', v: 2 }, { t: '< 90', v: 3 } ]},
            { id: 'pulso', label: 'Frecuencia cardíaca ≥ 100 lpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'melena', label: 'Melenas', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'sincope', label: 'Síncope', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'hepato', label: 'Hepatopatía', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'cardio', label: 'Insuficiencia cardíaca', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
        ],
        resultadoLabel: 'Glasgow-Blatchford',
        calcular: (v) => {
            let s = v.urea + v.pas + v.pulso + v.melena + v.sincope + v.hepato + v.cardio;
            const hb = v.hb;
            let hbPts;
            if (v.sexo === 0) { // varón
                if (hb >= 13) hbPts = 0; else if (hb >= 12) hbPts = 1; else if (hb >= 10) hbPts = 3; else hbPts = 6;
            } else {            // mujer
                if (hb >= 12) hbPts = 0; else if (hb >= 10) hbPts = 1; else hbPts = 6;
            }
            return s + hbPts;
        },
        interpretar: (total) => {
            if (total <= 1) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 1 puntos', texto: 'Riesgo muy bajo de intervención. Valorar manejo ambulatorio con endoscopia diferida.' };
            if (total <= 5) return { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: '2 – 5 puntos', texto: 'Considerar ingreso y endoscopia precoz.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '≥ 6 puntos', texto: 'Alto riesgo de necesitar transfusión, endoscopia terapéutica o cirugía. Priorizar.' };
        },
    },

    /* ───────────────────────────── BISAP ────────────────────────────────
       Wu BU et al. Gut 2008. Gravedad precoz de la pancreatitis aguda.    */
    {
        id: 'bisap',
        nombre: 'BISAP',
        sub: 'digestivo',
        abrev: 'Pancreatitis aguda · gravedad',
        tipo: 'puntos',
        fuente: 'Wu BU 2008',
        nota: 'Predice la mortalidad en la pancreatitis aguda con datos de las primeras 24 h (más ágil que Ranson).',
        campos: [
            { id: 'b', label: 'BUN > 25 mg/dL (urea > 53 mg/dL)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'i', label: 'Alteración del estado mental (GCS < 15)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 's', label: 'SIRS (≥ 2 criterios)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'a', label: 'Edad > 60 años', prefillAge: true, opciones: [ { t: 'No', v: 0, ageMax: 60 }, { t: 'Sí', v: 1, ageMin: 61 } ]},
            { id: 'p', label: 'Derrame pleural (imagen)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'BISAP',
        interpretar: (total) => {
            if (total <= 2) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 2 puntos', texto: 'Mortalidad < 2 %.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '3 – 5 puntos', texto: 'Mortalidad 5 – 22 %. Pancreatitis grave probable; valorar vigilancia intensiva.' };
        },
    },

    /* ───────────── Déficit de agua libre (hipernatremia) ────────────────
       Adrogué-Madias. Déficit = ACT × (Na/140 − 1).                       */
    {
        id: 'deficit-agua',
        nombre: 'Déficit de agua libre',
        sub: 'nefro',
        abrev: 'Hipernatremia',
        tipo: 'mixto',
        fuente: 'Adrogué & Madias (NEJM 2000)',
        nota: 'Estima el agua libre a reponer en la hipernatremia. ACT = peso × factor de agua corporal total.',
        campos: [
            { id: 'factor', label: 'Agua corporal total', sublabel: 'Según sexo y edad', opciones: [
                { t: 'Varón < 65 años (0,6)', v: 0.6 }, { t: 'Mujer < 65 o varón ≥ 65 (0,5)', v: 0.5 }, { t: 'Mujer ≥ 65 años (0,45)', v: 0.45 } ]},
            { id: 'peso', label: 'Peso', input: 'numero', unidad: 'kg', placeholder: 'Ej. 70', prefill: 'weight' },
            { id: 'na', label: 'Sodio plasmático actual', input: 'numero', unidad: 'mEq/L', placeholder: 'Ej. 160' },
        ],
        resultadoLabel: 'Déficit',
        unidadResultado: ' L',
        decimales: 1,
        calcular: (v) => Math.max(v.peso * v.factor * (v.na / 140 - 1), 0),
        nota2: 'Sumar las pérdidas insensibles y en curso. Corregir lentamente: descenso de Na ≤ 10 mEq/L en 24 h (≤ 0,5 mEq/L/h si es crónica) para evitar edema cerebral.',
        interpretar: (def, v) => {
            if (v.na <= 140) return { nivel: 'Sin déficit', color: 'gris',
                titulo: 'Na ≤ 140 mEq/L', texto: 'No hay déficit de agua libre por hipernatremia con este sodio.' };
            return { nivel: 'Déficit de agua libre', color: 'ambar',
                titulo: 'Volumen a reponer', texto: 'Reponer este volumen MÁS las pérdidas en curso, de forma lenta y con controles seriados de natremia.' };
        },
    },

    /* ─────────────── Sodio corregido por glucemia ───────────────────────
       Katz MA. NEJM 1973. +1,6 mEq/L por cada 100 mg/dL de glucosa > 100. */
    {
        id: 'na-glucosa',
        nombre: 'Na corregido por glucemia',
        sub: 'nefro',
        abrev: 'Pseudohiponatremia',
        tipo: 'formula',
        fuente: 'Katz MA 1973',
        nota: 'Corrige la natremia medida en presencia de hiperglucemia (sodio real estimado).',
        inputs: [
            { id: 'na', label: 'Sodio medido', unidad: 'mEq/L', placeholder: 'Ej. 130' },
            { id: 'glu', label: 'Glucemia', unidad: 'mg/dL', placeholder: 'Ej. 500' },
        ],
        calcular: (v) => v.na + 1.6 * ((v.glu - 100) / 100),
        resultadoLabel: 'Na corregido',
        unidadResultado: ' mEq/L',
        decimales: 1,
        nota2: 'Factor 1,6 mEq/L por cada 100 mg/dL de glucosa > 100; algunos autores usan 2,4 con glucemias > 400 mg/dL (Hillier).',
        interpretar: (na) => {
            if (na < 135) return { nivel: 'Hiponatremia', color: 'ambar',
                titulo: '< 135 mEq/L', texto: 'Hiponatremia verdadera tras corregir el efecto de la glucosa.' };
            if (na <= 145) return { nivel: 'Natremia normal', color: 'verde',
                titulo: '135 – 145 mEq/L', texto: 'Sodio corregido dentro de la normalidad.' };
            return { nivel: 'Hipernatremia', color: 'ambar',
                titulo: '> 145 mEq/L', texto: 'Hipernatremia tras corregir el efecto de la glucosa.' };
        },
    },

    /* ─────────────── Calcio corregido por albúmina ──────────────────────
       Payne RB et al. BMJ 1973. +0,8 mg/dL por cada 1 g/dL bajo 4,0.      */
    {
        id: 'ca-albumina',
        nombre: 'Ca corregido por albúmina',
        sub: 'nefro',
        abrev: 'Calcemia corregida',
        tipo: 'formula',
        fuente: 'Payne RB 1973',
        nota: 'Corrige el calcio total según la albúmina sérica (el calcio total varía con la proteína transportadora). En alteraciones importantes, preferir el calcio iónico.',
        inputs: [
            { id: 'ca', label: 'Calcio total', unidad: 'mg/dL', placeholder: 'Ej. 8.0' },
            { id: 'alb', label: 'Albúmina', unidad: 'g/dL', placeholder: 'Ej. 2.5' },
        ],
        calcular: (v) => v.ca + 0.8 * (4 - v.alb),
        resultadoLabel: 'Ca corregido',
        unidadResultado: ' mg/dL',
        decimales: 1,
        interpretar: (ca) => {
            if (ca < 8.5) return { nivel: 'Hipocalcemia', color: 'ambar',
                titulo: '< 8,5 mg/dL', texto: 'Hipocalcemia tras corregir por albúmina.' };
            if (ca <= 10.5) return { nivel: 'Calcemia normal', color: 'verde',
                titulo: '8,5 – 10,5 mg/dL', texto: 'Calcio corregido dentro de la normalidad.' };
            return { nivel: 'Hipercalcemia', color: 'rojo',
                titulo: '> 10,5 mg/dL', texto: 'Hipercalcemia tras corregir por albúmina. Investigar la causa.' };
        },
    },

    /* ──────────────────── Osmolaridad plasmática ────────────────────────
       Osm = 2·Na + glucosa/18 + urea/6 (unidades en mg/dL).               */
    {
        id: 'osmolaridad',
        nombre: 'Osmolaridad plasmática',
        sub: 'nefro',
        abrev: 'Osm calculada',
        tipo: 'formula',
        fuente: 'Fórmula estándar',
        nota: 'Osmolaridad plasmática calculada = 2 × Na + glucosa/18 + urea/6.',
        inputs: [
            { id: 'na', label: 'Sodio', unidad: 'mEq/L', placeholder: 'Ej. 140' },
            { id: 'glu', label: 'Glucemia', unidad: 'mg/dL', placeholder: 'Ej. 90' },
            { id: 'urea', label: 'Urea', unidad: 'mg/dL', placeholder: 'Ej. 40' },
        ],
        calcular: (v) => 2 * v.na + v.glu / 18 + v.urea / 6,
        resultadoLabel: 'Osmolaridad',
        unidadResultado: ' mOsm/L',
        decimales: 0,
        nota2: 'Para el osmol gap, restar este valor de la osmolalidad medida: > 10 mOsm/kg sugiere tóxicos osmóticamente activos (metanol, etilenglicol, etc.).',
        interpretar: (osm) => {
            if (osm < 275) return { nivel: 'Hipoosmolar', color: 'ambar',
                titulo: '< 275 mOsm/L', texto: 'Plasma hipoosmolar (normal 275 – 295).' };
            if (osm <= 295) return { nivel: 'Normal', color: 'verde',
                titulo: '275 – 295 mOsm/L', texto: 'Osmolaridad dentro de la normalidad.' };
            return { nivel: 'Hiperosmolar', color: 'rojo',
                titulo: '> 295 mOsm/L', texto: 'Plasma hiperosmolar. Valorar hiperglucemia, hipernatremia o tóxicos.' };
        },
    },

    /* ──────────────────── TIMI Risk (SCASEST) ───────────────────────────
       Antman EM et al. JAMA 2000. Riesgo en angina inestable / IAMSEST.   */
    {
        id: 'timi-scasest',
        nombre: 'TIMI (SCASEST)',
        sub: 'cardiovascular',
        abrev: 'Angina inestable / IAMSEST',
        tipo: 'puntos',
        fuente: 'Antman EM, JAMA 2000',
        nota: 'Riesgo de evento (muerte, IAM o revascularización urgente) a 14 días en el síndrome coronario agudo sin elevación del ST.',
        campos: [
            { id: 'edad', label: 'Edad ≥ 65 años', prefillAge: true, opciones: [ { t: 'No', v: 0, ageMax: 64 }, { t: 'Sí', v: 1, ageMin: 65 } ]},
            { id: 'fr', label: '≥ 3 factores de riesgo coronario', sublabel: 'HTA, diabetes, tabaquismo, dislipemia, historia familiar', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'ec', label: 'Enfermedad coronaria conocida (estenosis ≥ 50 %)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'aas', label: 'Uso de AAS en los últimos 7 días', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'angina', label: 'Angina grave reciente (≥ 2 episodios en 24 h)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'marcadores', label: 'Elevación de marcadores cardíacos (troponina)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'st', label: 'Desviación del ST ≥ 0,5 mm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'TIMI',
        interpretar: (total) => {
            if (total <= 2) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 2 puntos', texto: 'Riesgo de evento a 14 días ≈ 5 – 8 %.' };
            if (total <= 4) return { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: '3 – 4 puntos', texto: 'Riesgo de evento a 14 días ≈ 13 – 20 %. Estrategia invasiva precoz a valorar.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '5 – 7 puntos', texto: 'Riesgo de evento a 14 días ≈ 26 – 41 %. Estrategia invasiva precoz.' };
        },
    },

    /* ──────────────── Canadian Syncope Risk Score ───────────────────────
       Thiruganasambandamoorthy V et al. CMAJ 2016.                        */
    {
        id: 'csrs',
        nombre: 'Canadian Syncope Risk',
        sub: 'cardiovascular',
        abrev: 'Síncope · riesgo a 30 días',
        tipo: 'puntos',
        fuente: 'Thiruganasambandamoorthy V 2016',
        nota: 'Predice el riesgo de evento adverso grave a 30 días tras un síncope evaluado en urgencias.',
        campos: [
            { id: 'vasovagal', label: 'Predisposición a síncope vasovagal', sublabel: 'Bipedestación prolongada, ambiente caluroso, miedo, dolor, emoción', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'cardiopatia', label: 'Antecedente de cardiopatía', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'pas', label: 'Cualquier PAS < 90 o > 180 mmHg', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'trop', label: 'Troponina elevada (> percentil 99)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'eje', label: 'Eje QRS anormal (< −30° o > 100°)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'qrs', label: 'QRS > 130 ms', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'qtc', label: 'QTc > 480 ms', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'dx', label: 'Diagnóstico en urgencias', opciones: [
                { t: 'Síncope vasovagal', v: -2 }, { t: 'Síncope cardíaco', v: 2 }, { t: 'Ninguno de los anteriores', v: 0 } ]},
        ],
        resultadoLabel: 'CSRS',
        interpretar: (total) => {
            if (total <= 0) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '≤ 0 puntos', texto: 'Riesgo de evento adverso grave a 30 días ≈ 0,4 – 1,9 %. Valorar alta.' };
            if (total <= 3) return { nivel: 'Riesgo medio', color: 'ambar',
                titulo: '1 – 3 puntos', texto: 'Riesgo a 30 días ≈ 3 – 8 %. Observación / estudio según contexto.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '≥ 4 puntos', texto: 'Riesgo a 30 días ≈ 13 – 84 %. Monitorización e ingreso/estudio.' };
        },
    },

    /* ──────────────────────────── ADD-RS ────────────────────────────────
       Rogers AM et al. Circulation 2011. Sospecha de disección aórtica.   */
    {
        id: 'add-rs',
        nombre: 'ADD-RS',
        sub: 'cardiovascular',
        abrev: 'Disección aórtica · sospecha',
        tipo: 'mixto',
        fuente: 'Rogers AM 2011 · ADvISED (Nazerian 2018)',
        nota: 'Aortic Dissection Detection Risk Score. Puntúa el número de categorías (0 – 3) con ≥ 1 característica de alto riesgo. El dímero D refina la decisión según el algoritmo ADvISED.',
        campos: [
            { id: 'cond', label: 'Condiciones de alto riesgo', sublabel: 'Síndrome de Marfan/conectivopatía, historia familiar de enf. aórtica, valvulopatía aórtica conocida, aneurisma aórtico torácico, manipulación aórtica reciente', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'dolor', label: 'Dolor de alto riesgo', sublabel: 'Torácico, dorsal o abdominal de inicio brusco, intensidad severa o carácter desgarrador/lacerante', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'expl', label: 'Exploración de alto riesgo', sublabel: 'Déficit de pulso o asimetría de PA, déficit neurológico focal con dolor, soplo de insuficiencia aórtica nuevo con dolor, hipotensión/shock', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'dimero', label: 'Dímero D', noPoints: true, opciones: [
                { t: 'No disponible', v: -1 }, { t: '< 500 ng/mL', v: 0 }, { t: '≥ 500 ng/mL', v: 1 } ]},
        ],
        resultadoLabel: 'ADD-RS',
        calcular: (v) => v.cond + v.dolor + v.expl,
        interpretar: (score, v) => {
            if (score >= 2) return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '≥ 2 categorías', texto: 'Prueba de imagen directa (angio-TC). No demorar por el dímero D.' };
            // ADD-RS 0 – 1: el dímero D decide (ADvISED)
            if (v.dimero === -1) return { nivel: score === 0 ? 'Riesgo bajo' : 'Riesgo intermedio', color: 'ambar',
                titulo: `${score} categoría${score === 1 ? '' : 's'} · sin dímero D`,
                texto: 'Solicitar dímero D para completar la estratificación (algoritmo ADvISED).' };
            if (v.dimero === 0) return { nivel: 'Descartado', color: 'verde',
                titulo: 'ADD-RS ≤ 1 + dímero D < 500',
                texto: 'Síndrome aórtico agudo razonablemente descartado (ADvISED; tasa de fallo ≈ 0,3 %).' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: 'ADD-RS ≤ 1 + dímero D ≥ 500',
                texto: 'Dímero D positivo: prueba de imagen (angio-TC).' };
        },
    },

    /* ───────────────────────────── PESI ─────────────────────────────────
       Aujesky D et al. Am J Respir Crit Care Med 2005. Gravedad del TEP.  */
    {
        id: 'pesi',
        nombre: 'PESI',
        sub: 'cardiovascular',
        abrev: 'TEP · gravedad / mortalidad',
        tipo: 'mixto',
        fuente: 'Aujesky D 2005',
        nota: 'Pulmonary Embolism Severity Index. Estratifica la mortalidad a 30 días en el TEP confirmado y orienta el manejo (ambulatorio vs ingreso).',
        campos: [
            { id: 'edad', label: 'Edad', input: 'numero', unidad: 'años', placeholder: 'Ej. 70', prefill: 'age' },
            { id: 'sexo', label: 'Sexo', prefillSex: true, opciones: [ { t: 'Mujer', v: 0, sex: 'F' }, { t: 'Varón', v: 10, sex: 'M' } ]},
            { id: 'cancer', label: 'Cáncer', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 30 } ]},
            { id: 'icc', label: 'Insuficiencia cardíaca crónica', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'epoc', label: 'Enfermedad pulmonar crónica', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'fc', label: 'Frecuencia cardíaca ≥ 110 lpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'pas', label: 'PAS < 100 mmHg', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 30 } ]},
            { id: 'fr', label: 'Frecuencia respiratoria ≥ 30 rpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'temp', label: 'Temperatura < 36 °C', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'mental', label: 'Estado mental alterado', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 60 } ]},
            { id: 'sato2', label: 'SatO₂ < 90 %', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
        ],
        resultadoLabel: 'PESI',
        decimales: 0,
        calcular: (v) => v.edad + v.sexo + v.cancer + v.icc + v.epoc + v.fc + v.pas + v.fr + v.temp + v.mental + v.sato2,
        interpretar: (t) => {
            let clase, mort;
            if (t <= 65)       { clase = 'I';   mort = '0 – 1,6 %'; }
            else if (t <= 85)  { clase = 'II';  mort = '1,7 – 3,5 %'; }
            else if (t <= 105) { clase = 'III'; mort = '3,2 – 7,1 %'; }
            else if (t <= 125) { clase = 'IV';  mort = '4 – 11,4 %'; }
            else               { clase = 'V';   mort = '10 – 24,5 %'; }
            if (t <= 85)  return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: `Clase ${clase}`, texto: `Mortalidad a 30 días ≈ ${mort}. Candidato potencial a manejo ambulatorio.` };
            if (t <= 105) return { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: `Clase ${clase}`, texto: `Mortalidad a 30 días ≈ ${mort}.` };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: `Clase ${clase}`, texto: `Mortalidad a 30 días ≈ ${mort}.` };
        },
    },

    /* ───────────────────────────── sPESI ────────────────────────────────
       Jiménez D et al. Arch Intern Med 2010. PESI simplificado.           */
    {
        id: 'spesi',
        nombre: 'sPESI',
        sub: 'cardiovascular',
        abrev: 'TEP · versión simplificada',
        tipo: 'puntos',
        fuente: 'Jiménez D 2010',
        nota: 'PESI simplificado. Cualquier punto (≥ 1) identifica riesgo no bajo. Un valor de 0 selecciona a candidatos a manejo ambulatorio.',
        campos: [
            { id: 'edad', label: 'Edad > 80 años', prefillAge: true, opciones: [ { t: 'No', v: 0, ageMax: 80 }, { t: 'Sí', v: 1, ageMin: 81 } ]},
            { id: 'cancer', label: 'Cáncer', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'cardio', label: 'Enfermedad cardiopulmonar crónica', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'fc', label: 'Frecuencia cardíaca ≥ 110 lpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'pas', label: 'PAS < 100 mmHg', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'sato2', label: 'SatO₂ < 90 %', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'sPESI',
        interpretar: (total) => {
            if (total === 0) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 puntos', texto: 'Mortalidad a 30 días ≈ 1 %. Candidato potencial a manejo ambulatorio.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: `${total} punto(s)`, texto: 'Mortalidad a 30 días ≈ 11 %. No es de bajo riesgo.' };
        },
    },

    /* ──────────────────────────── Alvarado ──────────────────────────────
       Alvarado A. Ann Emerg Med 1986. Probabilidad de apendicitis.        */
    {
        id: 'alvarado',
        nombre: 'Alvarado',
        sub: 'digestivo',
        abrev: 'Apendicitis aguda',
        tipo: 'puntos',
        fuente: 'Alvarado A 1986',
        nota: 'Probabilidad clínica de apendicitis aguda (regla mnemotécnica MANTRELS).',
        campos: [
            { id: 'mig', label: 'Migración del dolor a FID', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'anor', label: 'Anorexia', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'nau', label: 'Náuseas o vómitos', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'dolor', label: 'Dolor a la palpación en FID', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'rebote', label: 'Dolor de rebote (Blumberg)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'temp', label: 'Temperatura ≥ 37,3 °C', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'leuco', label: 'Leucocitosis > 10.000/µL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'desv', label: 'Desviación izquierda (neutrófilos > 75 %)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'Alvarado',
        interpretar: (total) => {
            if (total <= 4) return { nivel: 'Improbable', color: 'verde',
                titulo: '1 – 4 puntos', texto: 'Apendicitis poco probable. Valorar alta con reevaluación o diagnóstico alternativo.' };
            if (total <= 6) return { nivel: 'Compatible', color: 'ambar',
                titulo: '5 – 6 puntos', texto: 'Compatible con apendicitis. Observación y/o prueba de imagen.' };
            return { nivel: 'Probable', color: 'rojo',
                titulo: '7 – 10 puntos', texto: 'Apendicitis probable. Valoración quirúrgica.' };
        },
    },

    /* ───────────────────────── AIR Score ────────────────────────────────
       Andersson M & Andersson RE. World J Surg 2008.                      */
    {
        id: 'air',
        nombre: 'AIR Score',
        sub: 'digestivo',
        abrev: 'Apendicitis · respuesta inflamatoria',
        tipo: 'puntos',
        fuente: 'Andersson 2008',
        nota: 'Appendicitis Inflammatory Response. Incorpora reactantes de fase aguda; útil para estratificar la probabilidad de apendicitis.',
        campos: [
            { id: 'vom', label: 'Vómitos', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'dolor', label: 'Dolor en FID', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'defensa', label: 'Defensa / irritación peritoneal', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'Leve', v: 1 }, { t: 'Moderada', v: 2 }, { t: 'Intensa', v: 3 } ]},
            { id: 'temp', label: 'Temperatura ≥ 38,5 °C', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'pmn', label: 'Polimorfonucleares (%)', opciones: [
                { t: '< 70 %', v: 0 }, { t: '70 – 84 %', v: 1 }, { t: '≥ 85 %', v: 2 } ]},
            { id: 'leuco', label: 'Leucocitos (×10⁹/L)', opciones: [
                { t: '< 10', v: 0 }, { t: '10 – 14,9', v: 1 }, { t: '≥ 15', v: 2 } ]},
            { id: 'pcr', label: 'PCR (mg/L)', opciones: [
                { t: '< 10', v: 0 }, { t: '10 – 49', v: 1 }, { t: '≥ 50', v: 2 } ]},
        ],
        resultadoLabel: 'AIR',
        interpretar: (total) => {
            if (total <= 4) return { nivel: 'Probabilidad baja', color: 'verde',
                titulo: '0 – 4 puntos', texto: 'Apendicitis poco probable. Manejo conservador / reevaluación.' };
            if (total <= 8) return { nivel: 'Indeterminado', color: 'ambar',
                titulo: '5 – 8 puntos', texto: 'Zona gris. Observación, reevaluación y/o prueba de imagen.' };
            return { nivel: 'Probabilidad alta', color: 'rojo',
                titulo: '9 – 12 puntos', texto: 'Apendicitis probable. Valoración quirúrgica.' };
        },
    },

    /* ─────────────────────── Centor / McIsaac ───────────────────────────
       Centor RM 1981 · McIsaac WJ 1998 (ajuste por edad).                 */
    {
        id: 'centor',
        nombre: 'Centor / McIsaac',
        sub: 'infeccioso',
        abrev: 'Faringitis estreptocócica',
        tipo: 'puntos',
        fuente: 'Centor 1981 · McIsaac 1998',
        nota: 'Probabilidad de faringitis por estreptococo del grupo A (criterios de Centor con la modificación de McIsaac por edad).',
        campos: [
            { id: 'exudado', label: 'Exudado o inflamación amigdalar', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'adeno', label: 'Adenopatías cervicales anteriores dolorosas', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'fiebre', label: 'Fiebre > 38 °C (referida)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'tos', label: 'Ausencia de tos', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'edad', label: 'Edad', prefillAge: true, opciones: [
                { t: '3 – 14 años', v: 1, ageMin: 3, ageMax: 14 }, { t: '15 – 44 años', v: 0, ageMin: 15, ageMax: 44 }, { t: '≥ 45 años', v: -1, ageMin: 45 } ]},
        ],
        resultadoLabel: 'Centor',
        interpretar: (total) => {
            if (total <= 1) return { nivel: 'Probabilidad baja', color: 'verde',
                titulo: '≤ 1 punto', texto: 'Probabilidad de SGA ≈ 1 – 10 %. No precisa test ni antibiótico.' };
            if (total <= 3) return { nivel: 'Probabilidad intermedia', color: 'ambar',
                titulo: '2 – 3 puntos', texto: 'Probabilidad de SGA ≈ 11 – 35 %. Test rápido de antígeno / cultivo.' };
            return { nivel: 'Probabilidad alta', color: 'rojo',
                titulo: '≥ 4 puntos', texto: 'Probabilidad de SGA ≈ 50 %. Test rápido o antibiótico empírico según la guía local.' };
        },
    },

    /* ───────────────────────────── HACOR ────────────────────────────────
       Duan J et al. Intensive Care Med 2017. Predice fracaso de la VMNI.  */
    {
        id: 'hacor',
        nombre: 'HACOR',
        sub: 'respiratorio',
        abrev: 'Fracaso de ventilación no invasiva',
        tipo: 'puntos',
        fuente: 'Duan J 2017',
        nota: 'Predice el fracaso de la ventilación mecánica no invasiva (VMNI). Se calcula tras 1 h de VMNI. Variables: FC, consciencia, pH, PaO₂/FiO₂ y FR.',
        campos: [
            { id: 'fc', label: 'Frecuencia cardíaca (lpm)', opciones: [
                { t: '≤ 120', v: 0 }, { t: '≥ 121', v: 1 } ]},
            { id: 'gcs', label: 'Glasgow (GCS)', opciones: [
                { t: '15', v: 0 }, { t: '13 – 14', v: 2 }, { t: '11 – 12', v: 5 }, { t: '≤ 10', v: 10 } ]},
            { id: 'ph', label: 'pH arterial', opciones: [
                { t: '≥ 7,35', v: 0 }, { t: '7,30 – 7,34', v: 2 }, { t: '7,25 – 7,29', v: 3 }, { t: '< 7,25', v: 4 } ]},
            { id: 'pafi', label: 'PaO₂/FiO₂ (mmHg)', opciones: [
                { t: '≥ 201', v: 0 }, { t: '176 – 200', v: 2 }, { t: '151 – 175', v: 3 }, { t: '126 – 150', v: 4 }, { t: '101 – 125', v: 5 }, { t: '≤ 100', v: 6 } ]},
            { id: 'fr', label: 'Frecuencia respiratoria (rpm)', opciones: [
                { t: '≤ 30', v: 0 }, { t: '31 – 35', v: 1 }, { t: '36 – 40', v: 2 }, { t: '41 – 45', v: 3 }, { t: '≥ 46', v: 4 } ]},
        ],
        resultadoLabel: 'HACOR',
        interpretar: (total) => {
            if (total <= 5) return { nivel: 'Bajo riesgo de fracaso', color: 'verde',
                titulo: '≤ 5 puntos', texto: 'Riesgo de fracaso de la VMNI < 20 %. Mantener y reevaluar.' };
            return { nivel: 'Alto riesgo de fracaso', color: 'rojo',
                titulo: '> 5 puntos', texto: 'Riesgo de fracaso de la VMNI elevado (> 50 %). Considerar intubación precoz.' };
        },
    },

    /* ───────────────── Sgarbossa modificado (Smith) ─────────────────────
       Smith SW et al. Ann Emerg Med 2012. IAM en BRI / ritmo de marcapasos.*/
    {
        id: 'sgarbossa',
        nombre: 'Sgarbossa modificado',
        sub: 'cardiovascular',
        abrev: 'IAM en BRI / marcapasos',
        tipo: 'puntos',
        fuente: 'Smith SW 2012',
        nota: 'Criterios de Sgarbossa modificados por Smith para detectar IAM en presencia de bloqueo de rama izquierda o ritmo de marcapasos. Es POSITIVO si se cumple cualquiera de los tres criterios.',
        campos: [
            { id: 'c1', label: 'Elevación del ST concordante ≥ 1 mm', sublabel: 'En derivación con QRS predominantemente positivo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'c2', label: 'Descenso del ST concordante ≥ 1 mm en V1–V3', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'c3', label: 'Elevación del ST discordante con cociente ST/S ≤ −0,25', sublabel: 'Criterio de Smith modificado', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'Criterios +',
        interpretar: (total) => {
            if (total === 0) return { nivel: 'Negativo', color: 'verde',
                titulo: '0 criterios', texto: 'No cumple criterios de Sgarbossa modificados. No descarta IAM si la clínica es muy sugestiva.' };
            return { nivel: 'Positivo', color: 'rojo',
                titulo: `${total} criterio(s)`, texto: 'Sgarbossa modificado POSITIVO: sugiere IAM en BRI / marcapasos. Activar el circuito de SCACEST.' };
        },
    },

    /* ──────────────────────────── Ranson ────────────────────────────────
       Ranson JH 1974 (pancreatitis no biliar). Ingreso + 48 h.            */
    {
        id: 'ranson',
        nombre: 'Ranson',
        sub: 'digestivo',
        abrev: 'Pancreatitis aguda · pronóstico',
        tipo: 'puntos',
        fuente: 'Ranson JH 1974 (no biliar)',
        nota: 'Criterios pronósticos de la pancreatitis aguda. Requiere datos del ingreso y de las 48 h. Cifras para pancreatitis no biliar.',
        campos: [
            { id: 'edad', label: 'Edad > 55 años', prefillAge: true, opciones: [ { t: 'No', v: 0, ageMax: 55 }, { t: 'Sí', v: 1, ageMin: 56 } ]},
            { id: 'leuco', label: 'Leucocitos > 16.000/µL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'glu', label: 'Glucemia > 200 mg/dL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'ldh', label: 'LDH > 350 UI/L', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'ast', label: 'AST (GOT) > 250 UI/L', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'hto', label: 'Descenso del hematocrito > 10 % (48 h)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'bun', label: 'Aumento de BUN > 5 mg/dL (48 h)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'ca', label: 'Calcio < 8 mg/dL (48 h)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'pao2', label: 'PaO₂ < 60 mmHg (48 h)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'be', label: 'Déficit de base > 4 mEq/L (48 h)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'fluid', label: 'Secuestro de líquidos > 6 L (48 h)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'Ranson',
        interpretar: (total) => {
            if (total <= 2) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 2 criterios', texto: 'Mortalidad ≈ 0 – 3 %.' };
            if (total <= 4) return { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: '3 – 4 criterios', texto: 'Mortalidad ≈ 15 %.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '≥ 5 criterios', texto: 'Mortalidad ≈ 40 % (≥ 6 criterios, próxima al 100 %). Pancreatitis grave.' };
        },
    },

    /* ──────────────────── Harvey-Bradshaw (Crohn) ───────────────────────
       Harvey RF & Bradshaw JM. Lancet 1980. Actividad de la enf. de Crohn.*/
    {
        id: 'harvey-bradshaw',
        nombre: 'Harvey-Bradshaw',
        sub: 'digestivo',
        abrev: 'Enfermedad de Crohn · actividad',
        tipo: 'mixto',
        fuente: 'Harvey & Bradshaw 1980',
        nota: 'Índice de actividad de la enfermedad de Crohn (versión simplificada del CDAI).',
        campos: [
            { id: 'bienestar', label: 'Estado general', opciones: [
                { t: 'Muy bueno', v: 0 }, { t: 'Algo por debajo', v: 1 }, { t: 'Malo', v: 2 }, { t: 'Muy malo', v: 3 }, { t: 'Pésimo', v: 4 } ]},
            { id: 'dolor', label: 'Dolor abdominal', opciones: [
                { t: 'Ninguno', v: 0 }, { t: 'Leve', v: 1 }, { t: 'Moderado', v: 2 }, { t: 'Intenso', v: 3 } ]},
            { id: 'deposiciones', label: 'Nº de deposiciones líquidas/blandas al día', input: 'numero', unidad: '/día', placeholder: 'Ej. 4' },
            { id: 'masa', label: 'Masa abdominal', opciones: [
                { t: 'No', v: 0 }, { t: 'Dudosa', v: 1 }, { t: 'Definida', v: 2 }, { t: 'Definida y dolorosa', v: 3 } ]},
            { id: 'complicaciones', label: 'Nº de complicaciones', sublabel: 'Artralgia, uveítis, eritema nodoso, aftas, pioderma gangrenoso, fisura anal, fístula nueva, absceso (1 punto cada una)', input: 'numero', unidad: '', placeholder: 'Ej. 0' },
        ],
        resultadoLabel: 'Harvey-Bradshaw',
        calcular: (v) => v.bienestar + v.dolor + v.deposiciones + v.masa + v.complicaciones,
        interpretar: (total) => {
            if (total < 5) return { nivel: 'Remisión', color: 'verde',
                titulo: '< 5 puntos', texto: 'Enfermedad de Crohn en remisión clínica.' };
            if (total <= 7) return { nivel: 'Actividad leve', color: 'ambar',
                titulo: '5 – 7 puntos', texto: 'Brote leve.' };
            if (total <= 16) return { nivel: 'Actividad moderada', color: 'rojo',
                titulo: '8 – 16 puntos', texto: 'Brote moderado.' };
            return { nivel: 'Actividad grave', color: 'rojo',
                titulo: '> 16 puntos', texto: 'Brote grave.' };
        },
    },

    /* ──────────────────── Truelove-Witts (colitis ulcerosa) ─────────────
       Truelove SC & Witts LJ. BMJ 1955. Gravedad del brote de CU.         */
    {
        id: 'truelove-witts',
        nombre: 'Truelove-Witts',
        sub: 'digestivo',
        abrev: 'Colitis ulcerosa · gravedad del brote',
        tipo: 'mixto',
        fuente: 'Truelove & Witts 1955',
        nota: 'Clasifica la gravedad del brote de colitis ulcerosa. Brote grave = ≥ 6 deposiciones con sangre/día MÁS ≥ 1 signo de toxicidad sistémica.',
        campos: [
            { id: 'deposiciones', label: 'Nº de deposiciones con sangre al día', input: 'numero', unidad: '/día', placeholder: 'Ej. 6' },
            { id: 'temp', label: 'Temperatura > 37,8 °C', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'fc', label: 'Frecuencia cardíaca > 90 lpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'hb', label: 'Hemoglobina < 10,5 g/dL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'vsg', label: 'VSG > 30 mm/h', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'Criterios sistémicos',
        calcular: (v) => v.temp + v.fc + v.hb + v.vsg,
        interpretar: (sistemicos, v) => {
            if (v.deposiciones >= 6 && sistemicos >= 1) return { nivel: 'Brote grave', color: 'rojo',
                titulo: 'Truelove-Witts grave', texto: '≥ 6 deposiciones con sangre + toxicidad sistémica. Valorar ingreso y corticoides IV.' };
            if (v.deposiciones <= 3 && sistemicos === 0) return { nivel: 'Brote leve', color: 'verde',
                titulo: 'Truelove-Witts leve', texto: '< 4 deposiciones/día y sin signos de toxicidad sistémica.' };
            return { nivel: 'Brote moderado', color: 'ambar',
                titulo: 'Truelove-Witts moderado', texto: 'Situación intermedia entre leve y grave.' };
        },
    },

    /* ───────────────────────────── MASCC ────────────────────────────────
       Klastersky J et al. J Clin Oncol 2000. Neutropenia febril.          */
    {
        id: 'mascc',
        nombre: 'MASCC',
        sub: 'infeccioso',
        abrev: 'Neutropenia febril · riesgo',
        tipo: 'puntos',
        fuente: 'Klastersky J 2000',
        nota: 'Identifica a los pacientes con neutropenia febril de bajo riesgo, candidatos a tratamiento ambulatorio / oral. Puntuación máxima 26; más puntos = menor riesgo.',
        campos: [
            { id: 'carga', label: 'Carga de la enfermedad (síntomas)', opciones: [
                { t: 'Asintomático o síntomas leves', v: 5 }, { t: 'Síntomas moderados', v: 3 }, { t: 'Síntomas graves', v: 0 } ]},
            { id: 'hipo', label: 'Hipotensión (PAS < 90 mmHg)', opciones: [ { t: 'No', v: 5 }, { t: 'Sí', v: 0 } ]},
            { id: 'epoc', label: 'EPOC', opciones: [ { t: 'No', v: 4 }, { t: 'Sí', v: 0 } ]},
            { id: 'tumor', label: 'Tumor sólido o sin infección fúngica previa', opciones: [ { t: 'Sí', v: 4 }, { t: 'No', v: 0 } ]},
            { id: 'deshidr', label: 'Deshidratación que requiere fluidos IV', opciones: [ { t: 'No', v: 3 }, { t: 'Sí', v: 0 } ]},
            { id: 'ambul', label: 'Ambulatorio al inicio de la fiebre', opciones: [ { t: 'Sí', v: 3 }, { t: 'No', v: 0 } ]},
            { id: 'edad', label: 'Edad < 60 años', prefillAge: true, opciones: [ { t: 'Sí', v: 2, ageMax: 59 }, { t: 'No', v: 0, ageMin: 60 } ]},
        ],
        resultadoLabel: 'MASCC',
        interpretar: (total) => {
            if (total >= 21) return { nivel: 'Bajo riesgo', color: 'verde',
                titulo: '≥ 21 puntos', texto: 'Bajo riesgo de complicaciones. Valorar tratamiento ambulatorio / antibiótico oral según protocolo.' };
            return { nivel: 'Alto riesgo', color: 'rojo',
                titulo: '< 21 puntos', texto: 'Alto riesgo. Ingreso y antibioterapia intravenosa.' };
        },
    },

    /* ───────────────────────────── NIHSS ────────────────────────────────
       NIH Stroke Scale. Brott T et al. Stroke 1989. Gravedad del ictus.   */
    {
        id: 'nihss',
        nombre: 'NIHSS',
        sub: 'neuro',
        abrev: 'Ictus · gravedad',
        tipo: 'puntos',
        fuente: 'NIH Stroke Scale (Brott 1989)',
        nota: 'Cuantifica la gravedad del déficit neurológico en el ictus agudo. Los miembros no valorables (amputación, anquilosis) se puntúan como 0.',
        campos: [
            { id: 'loc', label: '1a. Nivel de consciencia', opciones: [
                { t: 'Alerta', v: 0 }, { t: 'Somnoliento', v: 1 }, { t: 'Estuporoso', v: 2 }, { t: 'Coma', v: 3 } ]},
            { id: 'locp', label: '1b. Preguntas LOC (mes y edad)', opciones: [
                { t: 'Ambas correctas', v: 0 }, { t: 'Una correcta', v: 1 }, { t: 'Ninguna', v: 2 } ]},
            { id: 'loco', label: '1c. Órdenes LOC (ojos y mano)', opciones: [
                { t: 'Ambas', v: 0 }, { t: 'Una', v: 1 }, { t: 'Ninguna', v: 2 } ]},
            { id: 'mirada', label: '2. Mirada conjugada', opciones: [
                { t: 'Normal', v: 0 }, { t: 'Parálisis parcial', v: 1 }, { t: 'Desviación forzada', v: 2 } ]},
            { id: 'campos', label: '3. Campos visuales', opciones: [
                { t: 'Sin pérdida', v: 0 }, { t: 'Hemianopsia parcial', v: 1 }, { t: 'Hemianopsia completa', v: 2 }, { t: 'Hemianopsia bilateral', v: 3 } ]},
            { id: 'facial', label: '4. Paresia facial', opciones: [
                { t: 'Normal', v: 0 }, { t: 'Mínima', v: 1 }, { t: 'Parcial', v: 2 }, { t: 'Completa', v: 3 } ]},
            { id: 'brazoi', label: '5a. Motor brazo izquierdo', opciones: [
                { t: 'Sin claudicación', v: 0 }, { t: 'Claudica < 10 s', v: 1 }, { t: 'Esfuerzo contra gravedad', v: 2 }, { t: 'Sin vencer gravedad', v: 3 }, { t: 'Sin movimiento', v: 4 } ]},
            { id: 'brazod', label: '5b. Motor brazo derecho', opciones: [
                { t: 'Sin claudicación', v: 0 }, { t: 'Claudica < 10 s', v: 1 }, { t: 'Esfuerzo contra gravedad', v: 2 }, { t: 'Sin vencer gravedad', v: 3 }, { t: 'Sin movimiento', v: 4 } ]},
            { id: 'piernai', label: '6a. Motor pierna izquierda', opciones: [
                { t: 'Sin claudicación', v: 0 }, { t: 'Claudica < 5 s', v: 1 }, { t: 'Esfuerzo contra gravedad', v: 2 }, { t: 'Sin vencer gravedad', v: 3 }, { t: 'Sin movimiento', v: 4 } ]},
            { id: 'piernad', label: '6b. Motor pierna derecha', opciones: [
                { t: 'Sin claudicación', v: 0 }, { t: 'Claudica < 5 s', v: 1 }, { t: 'Esfuerzo contra gravedad', v: 2 }, { t: 'Sin vencer gravedad', v: 3 }, { t: 'Sin movimiento', v: 4 } ]},
            { id: 'ataxia', label: '7. Ataxia de miembros', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'En un miembro', v: 1 }, { t: 'En dos miembros', v: 2 } ]},
            { id: 'sensib', label: '8. Sensibilidad', opciones: [
                { t: 'Normal', v: 0 }, { t: 'Pérdida leve-moderada', v: 1 }, { t: 'Pérdida grave o total', v: 2 } ]},
            { id: 'lenguaje', label: '9. Lenguaje (afasia)', opciones: [
                { t: 'Normal', v: 0 }, { t: 'Afasia leve-moderada', v: 1 }, { t: 'Afasia grave', v: 2 }, { t: 'Mutismo / afasia global', v: 3 } ]},
            { id: 'disartria', label: '10. Disartria', opciones: [
                { t: 'Normal', v: 0 }, { t: 'Leve-moderada', v: 1 }, { t: 'Grave / anártrico', v: 2 } ]},
            { id: 'neglig', label: '11. Extinción / inatención', opciones: [
                { t: 'Normal', v: 0 }, { t: 'Inatención en una modalidad', v: 1 }, { t: 'Inatención en varias modalidades', v: 2 } ]},
        ],
        resultadoLabel: 'NIHSS',
        interpretar: (total) => {
            if (total === 0) return { nivel: 'Sin déficit', color: 'verde',
                titulo: '0 puntos', texto: 'Sin síntomas de ictus.' };
            if (total <= 4) return { nivel: 'Ictus leve', color: 'verde',
                titulo: '1 – 4 puntos', texto: 'Déficit neurológico menor.' };
            if (total <= 15) return { nivel: 'Ictus moderado', color: 'ambar',
                titulo: '5 – 15 puntos', texto: 'Déficit moderado.' };
            if (total <= 20) return { nivel: 'Ictus moderado-grave', color: 'rojo',
                titulo: '16 – 20 puntos', texto: 'Déficit moderado-grave.' };
            return { nivel: 'Ictus grave', color: 'rojo',
                titulo: '21 – 42 puntos', texto: 'Déficit grave.' };
        },
    },

    /* ───────────────────────────── CIWA-Ar ──────────────────────────────
       Sullivan JT et al. Br J Addict 1989. Síndrome de abstinencia OH.    */
    {
        id: 'ciwa-ar',
        nombre: 'CIWA-Ar',
        sub: 'neuro',
        abrev: 'Abstinencia alcohólica',
        tipo: 'puntos',
        fuente: 'Sullivan JT 1989',
        nota: 'Valora la gravedad del síndrome de abstinencia alcohólica y guía la dosificación de benzodiacepinas. Muchos protocolos pautan tratamiento a partir de CIWA-Ar ≥ 8.',
        campos: [
            { id: 'nausea', label: 'Náuseas / vómitos', opciones: [
                { t: 'Ausentes', v: 0 }, { t: 'Náusea leve sin vómito', v: 1 }, { t: 'Náusea intermitente con arcadas', v: 4 }, { t: 'Náusea constante, arcadas y vómitos', v: 7 } ]},
            { id: 'temblor', label: 'Temblor', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'No visible, se palpa', v: 1 }, { t: 'Moderado con brazos extendidos', v: 4 }, { t: 'Intenso, incluso sin extender brazos', v: 7 } ]},
            { id: 'sudor', label: 'Sudoración paroxística', opciones: [
                { t: 'No visible', v: 0 }, { t: 'Palmas húmedas', v: 1 }, { t: 'Sudor en la frente', v: 4 }, { t: 'Sudoración profusa', v: 7 } ]},
            { id: 'ansiedad', label: 'Ansiedad', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'Leve', v: 1 }, { t: 'Moderada o en guardia', v: 4 }, { t: 'Equivalente a pánico', v: 7 } ]},
            { id: 'agitacion', label: 'Agitación', opciones: [
                { t: 'Normal', v: 0 }, { t: 'Algo inquieto', v: 1 }, { t: 'Moderadamente inquieto', v: 4 }, { t: 'Se mueve constantemente / combativo', v: 7 } ]},
            { id: 'tactil', label: 'Alteraciones táctiles', sublabel: 'Parestesias, picor, quemazón', opciones: [
                { t: 'Ninguna', v: 0 }, { t: 'Muy leve', v: 1 }, { t: 'Alucinaciones moderadas', v: 4 }, { t: 'Alucinaciones continuas', v: 7 } ]},
            { id: 'auditiva', label: 'Alteraciones auditivas', opciones: [
                { t: 'Ninguna', v: 0 }, { t: 'Muy leves', v: 1 }, { t: 'Alucinaciones moderadas', v: 4 }, { t: 'Alucinaciones continuas', v: 7 } ]},
            { id: 'visual', label: 'Alteraciones visuales', opciones: [
                { t: 'Ninguna', v: 0 }, { t: 'Muy leves', v: 1 }, { t: 'Alucinaciones moderadas', v: 4 }, { t: 'Alucinaciones continuas', v: 7 } ]},
            { id: 'cefalea', label: 'Cefalea / pesadez de cabeza', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'Muy leve', v: 1 }, { t: 'Moderada', v: 4 }, { t: 'Muy grave', v: 7 } ]},
            { id: 'orientacion', label: 'Orientación y obnubilación', opciones: [
                { t: 'Orientado', v: 0 }, { t: 'Dudas en la fecha / no suma', v: 1 }, { t: 'Desorientado en fecha (≤ 2 días)', v: 2 }, { t: 'Desorientado en fecha (> 2 días)', v: 3 }, { t: 'Desorientado en lugar/persona', v: 4 } ]},
        ],
        resultadoLabel: 'CIWA-Ar',
        interpretar: (total) => {
            if (total <= 8) return { nivel: 'Leve / ausente', color: 'verde',
                titulo: '≤ 8 puntos', texto: 'Abstinencia mínima. Manejo sintomático; muchos protocolos no pautan BZD por debajo de 8.' };
            if (total <= 15) return { nivel: 'Moderada', color: 'ambar',
                titulo: '9 – 15 puntos', texto: 'Tratamiento con benzodiacepinas y reevaluación frecuente.' };
            return { nivel: 'Grave', color: 'rojo',
                titulo: '≥ 16 puntos', texto: 'Alto riesgo de complicaciones (convulsiones, delirium tremens). Tratamiento intensivo y monitorización.' };
        },
    },

    /* ─────────────────────── Canadian C-Spine Rule ──────────────────────
       Stiell IG et al. JAMA 2001. Necesidad de imagen cervical en trauma. */
    {
        id: 'canadian-cspine',
        nombre: 'Canadian C-Spine',
        sub: 'trauma',
        abrev: 'Imagen cervical en trauma',
        tipo: 'mixto',
        fuente: 'Stiell IG 2001',
        nota: 'Decide la necesidad de imagen cervical en trauma con GCS 15, estable y sin intoxicación. No aplicar en < 16 años, trauma no agudo o déficit neurológico evidente.',
        noNumero: true,
        campos: [
            { id: 'altoriesgo', label: '1. ¿Algún factor de alto riesgo?', sublabel: 'Edad ≥ 65, mecanismo peligroso (caída ≥ 1 m/5 escalones, carga axial, colisión > 100 km/h / vuelco / eyección, vehículo recreativo, bicicleta) o parestesias en extremidades', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'bajoriesgo', label: '2. ¿Algún factor de bajo riesgo que permita valorar la movilidad?', sublabel: 'Colisión por alcance simple, sedestación en urgencias, deambulación en algún momento, dolor cervical de inicio diferido o ausencia de dolor en la línea media', opciones: [ { t: 'Sí', v: 1 }, { t: 'No', v: 0 } ]},
            { id: 'rotacion', label: '3. ¿Rota el cuello 45° a ambos lados?', opciones: [ { t: 'Sí', v: 1 }, { t: 'No', v: 0 } ]},
        ],
        resultadoLabel: 'Canadian C-Spine',
        calcular: (v) => {
            if (v.altoriesgo === 1) return 1;   // imagen obligada
            if (v.bajoriesgo === 0) return 1;   // sin factor de bajo riesgo → imagen
            if (v.rotacion === 0) return 1;     // no rota → imagen
            return 0;                            // no precisa imagen
        },
        interpretar: (code) => {
            if (code === 1) return { nivel: 'Imagen indicada', color: 'rojo',
                titulo: 'Realizar radiografía / TC cervical', texto: 'No se cumplen los criterios para descartar lesión clínicamente. Solicitar imagen.' };
            return { nivel: 'No precisa imagen', color: 'verde',
                titulo: 'Se puede evaluar la movilidad con seguridad', texto: 'Sin factor de alto riesgo, con factor de bajo riesgo y rotación cervical conservada: imagen no necesaria.' };
        },
    },

    /* ───────────────────────── NEXUS Low-Risk ───────────────────────────
       Hoffman JR et al. NEJM 2000. Criterios de bajo riesgo cervical.     */
    {
        id: 'nexus',
        nombre: 'NEXUS',
        sub: 'trauma',
        abrev: 'Bajo riesgo cervical',
        tipo: 'puntos',
        fuente: 'Hoffman JR 2000',
        nota: 'Si los cinco criterios de bajo riesgo se cumplen (todos "No"), se puede descartar lesión cervical clínicamente significativa sin imagen.',
        noNumero: true,
        campos: [
            { id: 'dolor', label: 'Dolor en la línea media cervical posterior', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'deficit', label: 'Déficit neurológico focal', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'alerta', label: 'Nivel de consciencia alterado', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'intox', label: 'Signos de intoxicación', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'distractora', label: 'Lesión distractora dolorosa', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'NEXUS',
        interpretar: (total) => {
            if (total === 0) return { nivel: 'Bajo riesgo', color: 'verde',
                titulo: 'Los 5 criterios cumplidos', texto: 'Lesión cervical clínicamente significativa descartable sin imagen.' };
            return { nivel: 'No es de bajo riesgo', color: 'rojo',
                titulo: `${total} criterio(s) presentes`, texto: 'No se cumplen los criterios NEXUS. Solicitar imagen cervical.' };
        },
    },

    /* ───────────────────────── PSI / PORT ───────────────────────────────
       Fine MJ et al. NEJM 1997. Gravedad de la neumonía comunitaria.       */
    {
        id: 'psi',
        nombre: 'PSI / PORT',
        sub: 'respiratorio',
        abrev: 'Neumonía · mortalidad / destino',
        tipo: 'mixto',
        fuente: 'Fine MJ 1997',
        nota: 'Pneumonia Severity Index. Estratifica la mortalidad a 30 días en la neumonía adquirida en la comunidad y orienta el destino. La edad puntúa directamente (en mujeres, edad − 10).',
        campos: [
            { id: 'edad', label: 'Edad', input: 'numero', unidad: 'años', placeholder: 'Ej. 70', prefill: 'age' },
            { id: 'sexo', label: 'Sexo', prefillSex: true, opciones: [ { t: 'Varón', v: 0, sex: 'M' }, { t: 'Mujer (− 10)', v: -10, sex: 'F' } ]},
            { id: 'asilo', label: 'Residente en centro sociosanitario', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'neoplasia', label: 'Enfermedad neoplásica', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 30 } ]},
            { id: 'hepato', label: 'Hepatopatía', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'icc', label: 'Insuficiencia cardíaca', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'cerebro', label: 'Enfermedad cerebrovascular', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'renal', label: 'Enfermedad renal', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'mental', label: 'Alteración del estado mental', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'fr', label: 'Frecuencia respiratoria ≥ 30 rpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'pas', label: 'PAS < 90 mmHg', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'temp', label: 'Temperatura < 35 °C o ≥ 40 °C', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 15 } ]},
            { id: 'pulso', label: 'Frecuencia cardíaca ≥ 125 lpm', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'ph', label: 'pH arterial < 7,35', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 30 } ]},
            { id: 'bun', label: 'BUN ≥ 30 mg/dL (urea ≥ 64 mg/dL)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'na', label: 'Sodio < 130 mEq/L', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 20 } ]},
            { id: 'glu', label: 'Glucemia ≥ 250 mg/dL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'hto', label: 'Hematocrito < 30 %', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'pao2', label: 'PaO₂ < 60 mmHg o SatO₂ < 90 %', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
            { id: 'pleural', label: 'Derrame pleural', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 10 } ]},
        ],
        resultadoLabel: 'PSI',
        decimales: 0,
        calcular: (v) => v.edad + v.sexo + v.asilo + v.neoplasia + v.hepato + v.icc + v.cerebro + v.renal +
            v.mental + v.fr + v.pas + v.temp + v.pulso + v.ph + v.bun + v.na + v.glu + v.hto + v.pao2 + v.pleural,
        nota2: 'La Clase I (mortalidad ≈ 0,1 %) exige < 50 años, sin comorbilidades y con constantes y estado mental normales; aquí se agrupa con la Clase II como bajo riesgo.',
        interpretar: (total) => {
            if (total <= 70) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: 'Clase I – II', texto: 'Mortalidad a 30 días ≈ 0,6 %. Candidato a tratamiento ambulatorio.' };
            if (total <= 90) return { nivel: 'Riesgo bajo-intermedio', color: 'ambar',
                titulo: 'Clase III', texto: 'Mortalidad ≈ 0,9 – 2,8 %. Observación u hospitalización breve.' };
            if (total <= 130) return { nivel: 'Riesgo moderado-alto', color: 'rojo',
                titulo: 'Clase IV', texto: 'Mortalidad ≈ 8 – 9 %. Ingreso hospitalario.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: 'Clase V', texto: 'Mortalidad ≈ 27 – 31 %. Ingreso; valorar UCI.' };
        },
    },

    /* ──────────────── Tokyo TG18 · Colangitis aguda ─────────────────────
       Kiriyama S et al. J Hepatobiliary Pancreat Sci 2018.                */
    {
        id: 'tokyo-colangitis',
        nombre: 'Tokyo · Colangitis',
        sub: 'digestivo',
        abrev: 'Colangitis aguda · diagnóstico y gravedad',
        tipo: 'mixto',
        fuente: 'Tokyo Guidelines TG18',
        nota: 'Criterios de Tokyo (TG18) para el diagnóstico y la gravedad de la colangitis aguda. Diagnóstico de sospecha: A + (B o C). Confirmado: A + B + C.',
        noNumero: true,
        campos: [
            { id: 'a', label: 'A. Inflamación sistémica', sublabel: 'Fiebre > 38 °C / escalofríos, o leucocitos < 4 o > 10 ×10³/µL, o PCR ≥ 1 mg/dL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'b', label: 'B. Colestasis', sublabel: 'Ictericia (bilirrubina ≥ 2 mg/dL) o PFH (FA, GGT, AST, ALT) > 1,5× el límite normal', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'c', label: 'C. Imagen', sublabel: 'Dilatación de la vía biliar o evidencia de la causa (cálculo, estenosis, stent)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'gradoiii', label: 'Disfunción orgánica (Grado III)', sublabel: 'Hipotensión con vasoactivos, alteración de consciencia, PaO₂/FiO₂ < 300, creatinina > 2 mg/dL u oliguria, INR > 1,5, o plaquetas < 100 ×10³/µL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'gradoii', label: 'Nº de criterios de gravedad moderada (Grado II)', sublabel: 'Leucocitos > 12 o < 4 ×10³, fiebre ≥ 39 °C, edad ≥ 75, bilirrubina ≥ 5 mg/dL, hipoalbuminemia', input: 'numero', unidad: '', placeholder: 'Ej. 0' },
        ],
        resultadoLabel: 'Tokyo',
        calcular: (v) => v.gradoiii === 1 ? 3 : (v.gradoii >= 2 ? 2 : 1),
        interpretar: (grade, v) => {
            const A = v.a === 1, B = v.b === 1, C = v.c === 1;
            if (!(A && (B || C))) return { nivel: 'No cumple criterios', color: 'gris',
                titulo: 'Diagnóstico no establecido', texto: 'Se requiere A (inflamación sistémica) más B (colestasis) o C (imagen).' };
            const diag = (A && B && C) ? 'Diagnóstico confirmado (A + B + C)' : 'Diagnóstico de sospecha (A + B/C)';
            if (grade === 3) return { nivel: 'Grado III · grave', color: 'rojo',
                titulo: diag, texto: 'Disfunción orgánica. Soporte en área de críticos y drenaje biliar urgente.' };
            if (grade === 2) return { nivel: 'Grado II · moderada', color: 'ambar',
                titulo: diag, texto: 'Antibioterapia y drenaje biliar precoz (≤ 24 – 48 h).' };
            return { nivel: 'Grado I · leve', color: 'verde',
                titulo: diag, texto: 'Antibioterapia y observación; drenaje si no responde al tratamiento inicial.' };
        },
    },

    /* ──────────────── Tokyo TG18 · Colecistitis aguda ───────────────────
       Yokoe M et al. J Hepatobiliary Pancreat Sci 2018.                   */
    {
        id: 'tokyo-colecistitis',
        nombre: 'Tokyo · Colecistitis',
        sub: 'digestivo',
        abrev: 'Colecistitis aguda · diagnóstico y gravedad',
        tipo: 'mixto',
        fuente: 'Tokyo Guidelines TG18',
        nota: 'Criterios de Tokyo (TG18) para el diagnóstico y la gravedad de la colecistitis aguda. Sospecha: A + B. Confirmada: A + B + C (imagen).',
        noNumero: true,
        campos: [
            { id: 'a', label: 'A. Signos locales de inflamación', sublabel: 'Signo de Murphy, o masa/dolor/defensa en hipocondrio derecho', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'b', label: 'B. Signos sistémicos de inflamación', sublabel: 'Fiebre, PCR elevada o leucocitosis', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'c', label: 'C. Imagen característica', sublabel: 'Ecografía/TC compatibles con colecistitis aguda', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'gradoiii', label: 'Disfunción orgánica (Grado III)', sublabel: 'Hipotensión con vasoactivos, alteración de consciencia, PaO₂/FiO₂ < 300, creatinina > 2 mg/dL u oliguria, INR > 1,5, o plaquetas < 100 ×10³/µL', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'gradoii', label: 'Nº de criterios de gravedad moderada (Grado II)', sublabel: 'Leucocitos > 18 ×10³, masa dolorosa palpable en HCD, duración > 72 h, o inflamación local marcada (colecistitis gangrenosa/enfisematosa, absceso, peritonitis biliar)', input: 'numero', unidad: '', placeholder: 'Ej. 0' },
        ],
        resultadoLabel: 'Tokyo',
        calcular: (v) => v.gradoiii === 1 ? 3 : (v.gradoii >= 1 ? 2 : 1),
        interpretar: (grade, v) => {
            const A = v.a === 1, B = v.b === 1, C = v.c === 1;
            if (!(A && B)) return { nivel: 'No cumple criterios', color: 'gris',
                titulo: 'Diagnóstico no establecido', texto: 'Se requiere A (signos locales) más B (signos sistémicos).' };
            const diag = (A && B && C) ? 'Diagnóstico confirmado (A + B + C)' : 'Diagnóstico de sospecha (A + B)';
            if (grade === 3) return { nivel: 'Grado III · grave', color: 'rojo',
                titulo: diag, texto: 'Disfunción orgánica. Soporte de órganos y drenaje urgente (colecistostomía).' };
            if (grade === 2) return { nivel: 'Grado II · moderada', color: 'ambar',
                titulo: diag, texto: 'Antibioterapia y colecistectomía precoz por equipo experto, o drenaje si alto riesgo quirúrgico.' };
            return { nivel: 'Grado I · leve', color: 'verde',
                titulo: diag, texto: 'Colecistectomía laparoscópica precoz; alternativamente antibiótico y manejo conservador.' };
        },
    },

    /* ──────────────────── Analizador de gasometría ──────────────────────
       Interpretación ácido-base: trastorno primario + compensación
       (Winter / reglas respiratorias) + anión gap (corregido) + delta-delta
       + gap osmolar + diferencial GOLD MARK / hiperclorémico.              */
    {
        id: 'abg',
        nombre: 'Analizador de gasometría',
        sub: 'nefro',
        abrev: 'Interpretación ácido-base',
        tipo: 'analizador',
        fuente: 'Winter (1967) · Berend K, NEJM 2014',
        nota: 'Interpreta el equilibrio ácido-base: trastorno primario, compensación, anión gap y, opcionalmente, gap osmolar y diferencial de causas. Unidades en mmHg.',
        campos: [
            { id: 'ph', label: 'pH', input: 'numero', unidad: '', placeholder: 'Ej. 7.20' },
            { id: 'pco2', label: 'pCO₂', input: 'numero', unidad: 'mmHg', placeholder: 'Ej. 24' },
            { id: 'hco3', label: 'HCO₃⁻', input: 'numero', unidad: 'mEq/L', placeholder: 'Ej. 10' },
            { id: 'na', label: 'Na⁺', input: 'numero', unidad: 'mEq/L', placeholder: 'Ej. 140' },
            { id: 'cl', label: 'Cl⁻', input: 'numero', unidad: 'mEq/L', placeholder: 'Ej. 100' },
            { id: 'alb', label: 'Albúmina', sublabel: 'Opcional — corrige el anión gap', input: 'numero', unidad: 'g/dL', placeholder: 'Opcional', opcional: true },
            { id: 'cronologia', label: 'Cronología', sublabel: 'Solo para trastornos respiratorios', opcional: true, opciones: [ { t: 'Agudo', v: 0 }, { t: 'Crónico', v: 1 } ]},
            { id: 'osm_med', label: 'Osmolalidad medida', sublabel: 'Opcional — gap osmolar (requiere también glucemia y urea)', input: 'numero', unidad: 'mOsm/kg', placeholder: 'Opcional', opcional: true },
            { id: 'glu', label: 'Glucemia', input: 'numero', unidad: 'mg/dL', placeholder: 'Opcional', opcional: true },
            { id: 'urea', label: 'Urea', input: 'numero', unidad: 'mg/dL', placeholder: 'Opcional', opcional: true },
        ],
        analizar: (v) => {
            const f = (x, d = 0) => x.toFixed(d).replace('.', ',');
            const bloques = [];
            const { ph, pco2, hco3, na, cl } = v;

            // Anión gap
            const ag = na - (cl + hco3);
            const tieneAlb = !isNaN(v.alb);
            const agCorr = tieneAlb ? ag + 2.5 * (4 - v.alb) : ag;
            const agUsado = tieneAlb ? agCorr : ag;
            const agAlto = agUsado > 12;

            // 1. Trastorno primario
            const acidemia = ph < 7.35, alcalemia = ph > 7.45;
            let primario = '', primColor = 'gris', primTexto = '';
            if (acidemia) {
                primColor = 'rojo';
                if (hco3 < 22 && pco2 > 45) primario = 'Acidosis mixta (metabólica + respiratoria)';
                else if (pco2 > 45)         primario = 'Acidosis respiratoria';
                else                        primario = 'Acidosis metabólica';
                primTexto = `pH ${f(ph,2)} ↓`;
            } else if (alcalemia) {
                primColor = 'ambar';
                if (hco3 > 26 && pco2 < 35) primario = 'Alcalosis mixta (metabólica + respiratoria)';
                else if (pco2 < 35)         primario = 'Alcalosis respiratoria';
                else                        primario = 'Alcalosis metabólica';
                primTexto = `pH ${f(ph,2)} ↑`;
            } else {
                primColor = 'verde'; primario = 'pH normal';
                primTexto = (hco3 < 22 || hco3 > 26 || pco2 < 35 || pco2 > 45 || agAlto)
                    ? `pH ${f(ph,2)} (normal), pero con alteraciones de HCO₃/pCO₂ o AG: valorar trastorno mixto o compensado.`
                    : `pH ${f(ph,2)} y gasometría sin alteraciones relevantes.`;
            }
            bloques.push({ titulo: 'Trastorno primario', valor: primario, color: primColor, texto: primTexto });

            // 2. Compensación (trastornos simples)
            const cronico = v.cronologia === 1;
            if (primario === 'Acidosis metabólica') {
                const esp = 1.5 * hco3 + 8;
                let valor, color;
                if (pco2 > esp + 2) { valor = 'Acidosis respiratoria concurrente'; color = 'rojo'; }
                else if (pco2 < esp - 2) { valor = 'Alcalosis respiratoria concurrente'; color = 'rojo'; }
                else { valor = 'Compensación respiratoria apropiada'; color = 'verde'; }
                bloques.push({ titulo: 'Compensación', valor, color, texto: `Winter: pCO₂ esperado ${f(esp)} ± 2; medido ${f(pco2)}.` });
            } else if (primario === 'Alcalosis metabólica') {
                const esp = 0.7 * hco3 + 21;
                let valor, color;
                if (pco2 < esp - 2) { valor = 'Alcalosis respiratoria concurrente'; color = 'rojo'; }
                else if (pco2 > esp + 2) { valor = 'Acidosis respiratoria concurrente'; color = 'rojo'; }
                else { valor = 'Compensación respiratoria apropiada'; color = 'verde'; }
                bloques.push({ titulo: 'Compensación', valor, color, texto: `pCO₂ esperado ${f(esp)} ± 2; medido ${f(pco2)}.` });
            } else if (primario === 'Acidosis respiratoria' || primario === 'Alcalosis respiratoria') {
                const resp = primario === 'Acidosis respiratoria';
                const esp = resp ? 24 + (cronico ? 3.5 : 1) * (pco2 - 40) / 10
                                 : 24 - (cronico ? 4.5 : 2) * (40 - pco2) / 10;
                let valor, color;
                if (hco3 > esp + 2) { valor = 'Alcalosis metabólica concurrente'; color = 'rojo'; }
                else if (hco3 < esp - 2) { valor = 'Acidosis metabólica concurrente'; color = 'rojo'; }
                else { valor = 'Compensación metabólica apropiada'; color = 'verde'; }
                bloques.push({ titulo: 'Compensación', valor, color, texto: `HCO₃ esperado (${cronico ? 'crónico' : 'agudo'}) ${f(esp,1)}; medido ${f(hco3,1)}.` });
            }

            // 3. Anión gap
            bloques.push({
                titulo: 'Anión gap',
                valor: `AG ${f(ag,0)}${tieneAlb ? ` · corregido ${f(agCorr,1)}` : ''} mEq/L`,
                color: agAlto ? 'ambar' : 'gris',
                texto: agAlto ? 'AG elevado: acidosis metabólica con anión gap alto (AGMA).'
                              : 'AG normal (≤ 12). Una acidosis metabólica con este AG sería hiperclorémica.'
            });

            // 4. Delta-delta (si AGMA)
            if (agAlto && (24 - hco3) > 0) {
                const dd = (agUsado - 12) / (24 - hco3);
                let txt;
                if (dd < 1) txt = 'Sugiere además acidosis metabólica con AG normal (NAGMA) concurrente.';
                else if (dd <= 2) txt = 'Compatible con AGMA puro.';
                else txt = 'Sugiere además alcalosis metabólica o acidosis respiratoria crónica concurrente.';
                bloques.push({ titulo: 'Delta-delta', valor: f(dd,1), color: 'gris', texto: txt });
            } else if (agAlto && hco3 >= 24) {
                bloques.push({ titulo: 'Delta-delta', valor: '—', color: 'gris', texto: 'AGMA con HCO₃ no descendido: valorar alcalosis metabólica concurrente.' });
            }

            // 5. Gap osmolar (opcional)
            const tieneOsm = !isNaN(v.osm_med) && !isNaN(v.glu) && !isNaN(v.urea);
            let osmAlto = false;
            if (tieneOsm) {
                const osmCalc = 2 * na + v.glu / 18 + v.urea / 6;
                const gap = v.osm_med - osmCalc;
                osmAlto = gap > 10;
                bloques.push({
                    titulo: 'Gap osmolar',
                    valor: `${f(gap,0)} mOsm/kg`,
                    color: osmAlto ? 'rojo' : 'gris',
                    texto: osmAlto ? 'Elevado (> 10): osmoles no medidos. Sospechar alcoholes tóxicos (metanol, etilenglicol); también manitol o etanol no contabilizado.'
                                   : 'Normal (≤ 10). Osm calculada = 2·Na + glucosa/18 + urea/6.'
                });
            }

            // 6. Diferencial contextual
            const acidMetab = primario === 'Acidosis metabólica' || primario === 'Acidosis mixta (metabólica + respiratoria)';
            if (agAlto) {
                let txt = 'GOLD MARK — Glicoles (etilenglicol, propilenglicol), Oxoprolina (paracetamol crónico), L-lactato, D-lactato, Metanol, Aspirina (salicilatos), Renal (uremia), Cetoacidosis (diabética, alcohólica, ayuno).';
                if (osmAlto) txt = '⚠ AGMA + gap osmolar elevado → priorizar ALCOHOLES TÓXICOS (metanol, etilenglicol). ' + txt;
                bloques.push({ titulo: 'Diferencial AGMA (GOLD MARK)', valor: null, color: osmAlto ? 'rojo' : 'ambar', texto: txt });
            } else if (acidMetab) {
                bloques.push({ titulo: 'Diferencial acidosis con AG normal (hiperclorémica)', valor: null, color: 'ambar',
                    texto: 'Pérdidas digestivas (diarrea), acidosis tubular renal, inhibidores de la anhidrasa carbónica (acetazolamida), hipoaldosteronismo / ATR tipo 4, sueroterapia salina excesiva, ureterosigmoidostomía.' });
            }

            return { bloques };
        },
    },

    /* ──────────────────────────── Oakland ───────────────────────────────
       Oakland K et al. Lancet Gastroenterol Hepatol 2017. HDB · alta segura.*/
    {
        id: 'oakland',
        nombre: 'Oakland',
        sub: 'digestivo',
        abrev: 'Hemorragia digestiva baja · alta segura',
        tipo: 'puntos',
        fuente: 'Oakland K 2017',
        nota: 'Identifica pacientes con hemorragia digestiva baja de bajo riesgo, candidatos a alta y estudio ambulatorio. Puntuación 0 – 35.',
        campos: [
            { id: 'edad', label: 'Edad', prefillAge: true, opciones: [ { t: '< 40 años', v: 0, ageMax: 39 }, { t: '40 – 69 años', v: 1, ageMin: 40, ageMax: 69 }, { t: '≥ 70 años', v: 2, ageMin: 70 } ]},
            { id: 'sexo', label: 'Sexo', prefillSex: true, opciones: [ { t: 'Mujer', v: 0, sex: 'F' }, { t: 'Varón', v: 1, sex: 'M' } ]},
            { id: 'previo', label: 'Ingreso previo por hemorragia digestiva baja', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'tacto', label: 'Sangre en el tacto rectal', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'fc', label: 'Frecuencia cardíaca (lpm)', opciones: [ { t: '< 70', v: 0 }, { t: '70 – 89', v: 1 }, { t: '90 – 109', v: 2 }, { t: '≥ 110', v: 3 } ]},
            { id: 'pas', label: 'Presión arterial sistólica (mmHg)', opciones: [ { t: '< 90', v: 5 }, { t: '90 – 119', v: 4 }, { t: '120 – 129', v: 3 }, { t: '130 – 159', v: 2 }, { t: '≥ 160', v: 0 } ]},
            { id: 'hb', label: 'Hemoglobina (g/dL)', opciones: [ { t: '< 7', v: 22 }, { t: '7 – 8,9', v: 17 }, { t: '9 – 10,9', v: 13 }, { t: '11 – 12,9', v: 8 }, { t: '13 – 15,9', v: 4 }, { t: '≥ 16', v: 0 } ]},
        ],
        resultadoLabel: 'Oakland',
        interpretar: (total) => {
            if (total <= 8) return { nivel: 'Bajo riesgo', color: 'verde',
                titulo: '0 – 8 puntos', texto: '≈ 95 % de probabilidad de alta segura. Valorar estudio ambulatorio.' };
            return { nivel: 'No es de bajo riesgo', color: 'rojo',
                titulo: '> 8 puntos', texto: 'Ingreso para estudio y resucitación según necesidad.' };
        },
    },

    /* ───────────────────── Maddrey (función discriminante) ───────────────
       Maddrey WC et al. Gastroenterology 1978. Hepatitis alcohólica.       */
    {
        id: 'maddrey',
        nombre: 'Maddrey (DF)',
        sub: 'digestivo',
        abrev: 'Hepatitis alcohólica · gravedad',
        tipo: 'formula',
        fuente: 'Maddrey WC 1978',
        nota: 'Función discriminante de Maddrey para la hepatitis alcohólica. DF = 4,6 × (TP paciente − TP control) + bilirrubina total.',
        inputs: [
            { id: 'tp', label: 'Tiempo de protrombina (paciente)', unidad: 's', placeholder: 'Ej. 20' },
            { id: 'tpc', label: 'Tiempo de protrombina (control)', unidad: 's', placeholder: 'Ej. 12' },
            { id: 'bili', label: 'Bilirrubina total', unidad: 'mg/dL', placeholder: 'Ej. 8' },
        ],
        calcular: (v) => 4.6 * (v.tp - v.tpc) + v.bili,
        resultadoLabel: 'Maddrey DF',
        decimales: 1,
        interpretar: (df) => {
            if (df < 32) return { nivel: 'No grave', color: 'verde',
                titulo: 'DF < 32', texto: 'Hepatitis alcohólica no grave. Mortalidad a 30 días baja.' };
            return { nivel: 'Grave', color: 'rojo',
                titulo: 'DF ≥ 32', texto: 'Hepatitis alcohólica grave (mortalidad a 30 días ≈ 30 – 50 %). Valorar corticoides; reevaluar con el índice de Lille a las 96 h.' };
        },
    },

    /* ──────────────────────── West Haven ────────────────────────────────
       Criterios de West Haven (Conn). Encefalopatía hepática.              */
    {
        id: 'west-haven',
        nombre: 'West Haven',
        sub: 'digestivo',
        abrev: 'Encefalopatía hepática · grado',
        tipo: 'puntos',
        fuente: 'Criterios de West Haven (Conn HO)',
        nota: 'Gradúa la encefalopatía hepática según el estado mental y neurológico.',
        campos: [
            { id: 'g', label: 'Grado', opciones: [
                { t: '0 — Sin alteración (mínima si tests alterados)', v: 0 },
                { t: 'I — Falta de atención, euforia/ansiedad, alteración del sueño', v: 1 },
                { t: 'II — Letargia, desorientación temporal, asterixis, conducta inapropiada', v: 2 },
                { t: 'III — Somnolencia/estupor, desorientación espacial, confusión marcada', v: 3 },
                { t: 'IV — Coma', v: 4 } ]},
        ],
        resultadoLabel: 'West Haven',
        interpretar: (g) => {
            if (g === 0) return { nivel: 'Grado 0', color: 'verde', titulo: 'Sin alteración clínica', texto: 'Encefalopatía mínima si los tests psicométricos están alterados.' };
            if (g === 1) return { nivel: 'Grado I', color: 'ambar', titulo: 'Leve (encubierta)', texto: 'Alteración leve de la atención y el ritmo sueño-vigilia.' };
            if (g === 2) return { nivel: 'Grado II', color: 'ambar', titulo: 'Moderada (manifiesta)', texto: 'Desorientación temporal y asterixis.' };
            if (g === 3) return { nivel: 'Grado III', color: 'rojo', titulo: 'Grave', texto: 'Estupor con respuesta a estímulos; valorar protección de la vía aérea.' };
            return { nivel: 'Grado IV', color: 'rojo', titulo: 'Coma', texto: 'Coma. Soporte avanzado.' };
        },
    },

    /* ─────────────────────── WSES / Hinchey ──────────────────────────────
       Hinchey modificada · WSES 2020. Estadiaje de la diverticulitis aguda. */
    {
        id: 'wses-hinchey',
        nombre: 'WSES / Hinchey',
        sub: 'digestivo',
        abrev: 'Diverticulitis · estadiaje',
        tipo: 'puntos',
        noNumero: true,
        fuente: 'Hinchey modificada · WSES 2020',
        nota: 'Clasificación de la diverticulitis aguda (Hinchey modificada / WSES) por imagen, con la conducta orientativa por estadio.',
        campos: [
            { id: 'e', label: 'Estadio (TC)', opciones: [
                { t: '0 — Diverticulitis leve (TC normal o engrosamiento)', v: 0 },
                { t: 'Ia — Inflamación pericólica / flemón', v: 1 },
                { t: 'Ib — Absceso pericólico', v: 2 },
                { t: 'II — Absceso pélvico o a distancia', v: 3 },
                { t: 'III — Peritonitis purulenta generalizada', v: 4 },
                { t: 'IV — Peritonitis fecaloidea', v: 5 } ]},
        ],
        resultadoLabel: 'Estadio',
        interpretar: (v) => {
            if (v === 0) return { nivel: 'Estadio 0 · no complicada', color: 'verde', titulo: 'Diverticulitis no complicada', texto: 'Manejo conservador; antibióticos selectivos. Valorar tratamiento ambulatorio.' };
            if (v === 1) return { nivel: 'Estadio Ia', color: 'ambar', titulo: 'Flemón / inflamación pericólica', texto: 'Antibioterapia; ingreso según evolución.' };
            if (v === 2) return { nivel: 'Estadio Ib', color: 'ambar', titulo: 'Absceso pericólico', texto: 'Antibióticos; drenaje percutáneo si el absceso es ≥ 4 – 5 cm.' };
            if (v === 3) return { nivel: 'Estadio II', color: 'rojo', titulo: 'Absceso pélvico / a distancia', texto: 'Antibióticos y drenaje percutáneo; cirugía si fracasa.' };
            if (v === 4) return { nivel: 'Estadio III · grave', color: 'rojo', titulo: 'Peritonitis purulenta', texto: 'Resucitación y cirugía urgente.' };
            return { nivel: 'Estadio IV · grave', color: 'rojo', titulo: 'Peritonitis fecaloidea', texto: 'Resucitación y cirugía urgente (resección).' };
        },
    },

    /* ─────────────────────── mSAD PERSONS ────────────────────────────────
       Hockberger RS (modified SAD PERSONS). Riesgo de suicidio.            */
    {
        id: 'msad-persons',
        nombre: 'mSAD PERSONS',
        sub: 'psiquiatricas',
        abrev: 'Riesgo de suicidio',
        tipo: 'puntos',
        fuente: 'Modified SAD PERSONS (Hockberger 1988)',
        nota: '⚠ Apoyo a la decisión con validación limitada: NO sustituye la valoración psiquiátrica ni decide el ingreso por sí sola. Una puntuación baja no excluye riesgo.',
        campos: [
            { id: 'sexo', label: 'Sexo masculino', prefillSex: true, opciones: [ { t: 'No', v: 0, sex: 'F' }, { t: 'Sí', v: 1, sex: 'M' } ]},
            { id: 'edad', label: 'Edad < 19 o > 45 años', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'depresion', label: 'Depresión o desesperanza', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'previo', label: 'Intento previo o atención psiquiátrica previa', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'toxicos', label: 'Consumo excesivo de alcohol o drogas', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'racional', label: 'Pérdida del pensamiento racional (psicosis)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'soltero', label: 'Separado, divorciado o viudo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'organizado', label: 'Intento organizado o grave', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
            { id: 'soporte', label: 'Sin soporte social', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'intencion', label: 'Intención futura declarada', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 2 } ]},
        ],
        resultadoLabel: 'mSAD PERSONS',
        interpretar: (total) => {
            if (total <= 5) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '0 – 5 puntos', texto: 'Alta posible con seguimiento, según el juicio clínico. La puntuación no excluye riesgo.' };
            if (total <= 8) return { nivel: 'Riesgo intermedio', color: 'ambar',
                titulo: '6 – 8 puntos', texto: 'Valorar consulta psiquiátrica y/u observación.' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '> 8 puntos', texto: 'Probable necesidad de ingreso / valoración psiquiátrica urgente.' };
        },
    },

    /* ─────────────────────── Burch-Wartofsky ─────────────────────────────
       Burch HB & Wartofsky L. Endocrinol Metab Clin 1993. Tormenta tiroidea.*/
    {
        id: 'burch-wartofsky',
        nombre: 'Burch-Wartofsky',
        sub: 'nefro',
        abrev: 'Tormenta tiroidea',
        tipo: 'puntos',
        fuente: 'Burch & Wartofsky 1993',
        nota: 'Estima la probabilidad de tormenta tiroidea en un paciente con tirotoxicosis.',
        campos: [
            { id: 'temp', label: 'Temperatura (°C)', opciones: [
                { t: '< 37,2', v: 0 }, { t: '37,2 – 37,7', v: 5 }, { t: '37,8 – 38,2', v: 10 }, { t: '38,3 – 38,8', v: 15 }, { t: '38,9 – 39,3', v: 20 }, { t: '39,4 – 39,9', v: 25 }, { t: '≥ 40,0', v: 30 } ]},
            { id: 'snc', label: 'Disfunción del SNC', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'Leve (agitación)', v: 10 }, { t: 'Moderada (delirio, psicosis, letargia)', v: 20 }, { t: 'Grave (convulsión, coma)', v: 30 } ]},
            { id: 'gi', label: 'Disfunción gastrointestinal-hepática', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'Moderada (diarrea, náuseas/vómitos, dolor abdominal)', v: 10 }, { t: 'Grave (ictericia inexplicada)', v: 20 } ]},
            { id: 'fc', label: 'Taquicardia (lpm)', opciones: [
                { t: '< 90', v: 0 }, { t: '90 – 109', v: 5 }, { t: '110 – 119', v: 10 }, { t: '120 – 129', v: 15 }, { t: '130 – 139', v: 20 }, { t: '≥ 140', v: 25 } ]},
            { id: 'icc', label: 'Insuficiencia cardíaca', opciones: [
                { t: 'Ausente', v: 0 }, { t: 'Leve (edemas)', v: 5 }, { t: 'Moderada (crepitantes bibasales)', v: 10 }, { t: 'Grave (edema agudo de pulmón)', v: 15 } ]},
            { id: 'fa', label: 'Fibrilación auricular', opciones: [ { t: 'Ausente', v: 0 }, { t: 'Presente', v: 10 } ]},
            { id: 'precip', label: 'Factor precipitante', opciones: [ { t: 'Ausente', v: 0 }, { t: 'Presente', v: 10 } ]},
        ],
        resultadoLabel: 'Burch-Wartofsky',
        interpretar: (total) => {
            if (total < 25) return { nivel: 'Poco probable', color: 'verde',
                titulo: '< 25 puntos', texto: 'Tormenta tiroidea improbable.' };
            if (total < 45) return { nivel: 'Tormenta inminente', color: 'ambar',
                titulo: '25 – 44 puntos', texto: 'Tormenta tiroidea inminente; vigilancia estrecha e inicio de tratamiento.' };
            return { nivel: 'Tormenta tiroidea probable', color: 'rojo',
                titulo: '≥ 45 puntos', texto: 'Altamente sugestivo de tormenta tiroidea. Tratamiento agresivo multimodal y UCI.' };
        },
    },

    /* ──────────────────────────── RACE ───────────────────────────────────
       Pérez de la Ossa N et al. Stroke 2014. Cribado de oclusión gran vaso.*/
    {
        id: 'race',
        nombre: 'RACE',
        sub: 'neuro',
        abrev: 'Cribado de oclusión de gran vaso',
        tipo: 'puntos',
        fuente: 'Pérez de la Ossa N 2014',
        nota: 'Rapid Arterial oCclusion Evaluation: cribado del ictus por oclusión de gran vaso. ≥ 5 sugiere oclusión de gran vaso.',
        campos: [
            { id: 'facial', label: 'Parálisis facial', opciones: [ { t: 'Ausente', v: 0 }, { t: 'Leve', v: 1 }, { t: 'Moderada-grave', v: 2 } ]},
            { id: 'brazo', label: 'Paresia de brazo', opciones: [ { t: 'Normal-leve', v: 0 }, { t: 'Moderada', v: 1 }, { t: 'Grave', v: 2 } ]},
            { id: 'pierna', label: 'Paresia de pierna', opciones: [ { t: 'Normal-leve', v: 0 }, { t: 'Moderada', v: 1 }, { t: 'Grave', v: 2 } ]},
            { id: 'mirada', label: 'Desviación oculocefálica', opciones: [ { t: 'Ausente', v: 0 }, { t: 'Presente', v: 1 } ]},
            { id: 'afasia', label: 'Lenguaje / agnosia', sublabel: 'Afasia si hemisferio dominante; agnosia (asomatognosia/anosognosia) si no dominante', opciones: [ { t: 'Normal', v: 0 }, { t: 'Moderada', v: 1 }, { t: 'Grave', v: 2 } ]},
        ],
        resultadoLabel: 'RACE',
        interpretar: (total) => {
            if (total < 5) return { nivel: 'Baja sospecha de OGV', color: 'verde',
                titulo: '0 – 4 puntos', texto: 'Oclusión de gran vaso poco probable.' };
            return { nivel: 'Sospecha de OGV', color: 'rojo',
                titulo: '≥ 5 puntos', texto: 'Alta sospecha de oclusión de gran vaso. Considerar traslado a centro con trombectomía.' };
        },
    },

    /* ──────────────────── Rankin modificada (mRS) ────────────────────────
       van Swieten JC et al. Stroke 1988. Discapacidad funcional.           */
    {
        id: 'mrs',
        nombre: 'Rankin (mRS)',
        sub: 'neuro',
        abrev: 'Discapacidad funcional',
        tipo: 'puntos',
        fuente: 'modified Rankin Scale (van Swieten 1988)',
        nota: 'Escala de Rankin modificada: discapacidad funcional global, habitualmente tras un ictus.',
        campos: [
            { id: 'g', label: 'Grado', opciones: [
                { t: '0 — Sin síntomas', v: 0 },
                { t: '1 — Sin discapacidad significativa pese a síntomas', v: 1 },
                { t: '2 — Discapacidad leve (independiente)', v: 2 },
                { t: '3 — Discapacidad moderada (requiere algo de ayuda, camina solo)', v: 3 },
                { t: '4 — Moderada-grave (no camina ni se atiende sin ayuda)', v: 4 },
                { t: '5 — Grave (encamado, incontinente, cuidados constantes)', v: 5 },
                { t: '6 — Fallecimiento', v: 6 } ]},
        ],
        resultadoLabel: 'mRS',
        interpretar: (g) => {
            if (g <= 2) return { nivel: 'Independiente', color: 'verde', titulo: `mRS ${g}`, texto: 'Resultado funcional favorable (autonomía conservada).' };
            if (g === 3) return { nivel: 'Discapacidad moderada', color: 'ambar', titulo: 'mRS 3', texto: 'Requiere algo de ayuda, pero camina sin asistencia.' };
            if (g <= 5) return { nivel: 'Discapacidad grave', color: 'rojo', titulo: `mRS ${g}`, texto: 'Dependencia importante.' };
            return { nivel: 'Fallecimiento', color: 'gris', titulo: 'mRS 6', texto: '' };
        },
    },

    /* ─────────────────────── Canadian CT Head Rule ──────────────────────
       Stiell IG et al. Lancet 2001. TC craneal en TCE leve.               */
    {
        id: 'canadian-cthead',
        nombre: 'Canadian CT Head',
        sub: 'trauma',
        abrev: 'TC craneal en TCE leve',
        tipo: 'mixto',
        noNumero: true,
        fuente: 'Stiell IG 2001',
        nota: 'Indica la TC craneal en el TCE leve (GCS 13–15 con pérdida de consciencia, amnesia o desorientación presenciadas). No aplicar si edad < 16, anticoagulación/coagulopatía, convulsión postraumática o GCS < 13.',
        campos: [
            { id: 'alto', label: '¿Algún factor de alto riesgo?', sublabel: 'GCS < 15 a las 2 h, sospecha de fractura abierta/hundimiento, signos de fractura de base de cráneo (hemotímpano, ojos de mapache, otorrea/rinorrea de LCR, signo de Battle), ≥ 2 vómitos, o edad ≥ 65 años', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'medio', label: '¿Algún factor de riesgo medio?', sublabel: 'Amnesia retrógrada ≥ 30 min, o mecanismo peligroso (atropello, eyección del vehículo, caída > 1 m o 5 escalones)', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
        ],
        resultadoLabel: 'Canadian CT Head',
        calcular: (v) => (v.alto === 1 || v.medio === 1) ? 1 : 0,
        interpretar: (code) => {
            if (code === 1) return { nivel: 'TC craneal indicada', color: 'rojo',
                titulo: 'Realizar TC craneal', texto: 'Presencia de factor de riesgo: indicada la TC craneal.' };
            return { nivel: 'TC no indicada', color: 'verde',
                titulo: 'TC craneal no necesaria', texto: 'Sin factores de riesgo alto ni medio: la regla no indica TC.' };
        },
    },

    /* ─────────────────────── Sudbury Vertigo Risk Score ─────────────────
       Lelli D et al. Ann Emerg Med 2024 (derivación) · validación 2025.   */
    {
        id: 'sudbury-vertigo',
        nombre: 'Sudbury Vertigo',
        sub: 'neuro',
        abrev: 'Vértigo · causa central grave',
        tipo: 'puntos',
        fuente: 'Lelli D 2024 · validación 2025',
        nota: 'Estratifica el riesgo de una causa central grave (ictus, AIT, disección vertebral, tumor) en el paciente con vértigo agudo en urgencias.',
        campos: [
            { id: 'sexo', label: 'Sexo masculino', prefillSex: true, opciones: [ { t: 'No', v: 0, sex: 'F' }, { t: 'Sí', v: 1, sex: 'M' } ]},
            { id: 'edad', label: 'Edad > 65 años', prefillAge: true, opciones: [ { t: 'No', v: 0, ageMax: 65 }, { t: 'Sí', v: 1, ageMin: 66 } ]},
            { id: 'dm', label: 'Diabetes', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 1 } ]},
            { id: 'hta', label: 'Hipertensión', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 3 } ]},
            { id: 'deficit', label: 'Déficit motor o sensitivo', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 5 } ]},
            { id: 'cerebelo', label: 'Signos cerebelosos', sublabel: 'Diplopía, disartria, disfagia, dismetría o ataxia', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: 6 } ]},
            { id: 'vppb', label: 'Diagnóstico de VPPB', sublabel: 'Vértigo posicional paroxístico benigno — factor protector', opciones: [ { t: 'No', v: 0 }, { t: 'Sí', v: -5 } ]},
        ],
        resultadoLabel: 'Sudbury',
        interpretar: (total) => {
            if (total < 5) return { nivel: 'Riesgo bajo', color: 'verde',
                titulo: '< 5 puntos', texto: 'Causa central grave muy improbable (≈ 0 %). Imagen generalmente innecesaria si no hay datos de alarma.' };
            if (total <= 8) return { nivel: 'Riesgo moderado', color: 'ambar',
                titulo: '5 – 8 puntos', texto: 'Riesgo ≈ 2 %. Si la causa periférica no es clara, valorar RM (± angio).' };
            return { nivel: 'Riesgo alto', color: 'rojo',
                titulo: '> 8 puntos', texto: 'Riesgo ≈ 41 %. Neuroimagen urgente (RM/angio-RM o TC/angio-TC) para descartar causa central.' };
        },
    },

];

/* ── Orden de presentación dentro de cada subcategoría (por grupos clínicos) ── */
const ORDEN = {
    cardiovascular: ['heart','timi-scasest','sgarbossa','cha2ds2-vasc','has-bled','csrs','add-rs','wells-tvp','wells-tep','perc','pesi','spesi'],
    respiratorio:   ['curb-65','psi','pafi','safi','rox','hacor'],
    hemodinamica:   ['shock-index','dsi','news2','sofa','rass'],
    digestivo:      ['child-pugh','meld','maddrey','west-haven','gbs','oakland','ranson','bisap','tokyo-colangitis','tokyo-colecistitis','wses-hinchey','alvarado','air','harvey-bradshaw','truelove-witts'],
    infeccioso:     ['centor','mascc'],
    nefro:          ['fena','deficit-agua','na-glucosa','ca-albumina','osmolaridad','burch-wartofsky','abg'],
    geriatria:      ['cfs'],
    neuro:          ['gcs','nihss','race','mrs','sudbury-vertigo','ciwa-ar'],
    trauma:         ['canadian-cspine','nexus','canadian-cthead'],
    psiquiatricas:  ['msad-persons'],
};
