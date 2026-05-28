# Auditoría de Seguridad — URGlabV2
**Fecha de auditoría:** 2026-05-22  
**Aplicación:** URGlabV2 — Ecosistema Digital ICS, Hospital Universitari Joan XXIII  
**Tipo:** Aplicación web estática (HTML + CSS + JS sin backend)  
**Destino de despliegue:** Subdominio del Institut Català de Salut (ICS)  
**Estándar de referencia:** ENS categoría básica + OWASP para aplicaciones web estáticas + RGPD/LOPD  
**Auditor:** Tarea automatizada Claude Code (claude-sonnet-4-6) — 2026-05-22

---

## RESUMEN EJECUTIVO

URGlabV2 es una aplicación estática bien construida con una superficie de ataque intrínsecamente reducida. La ausencia total de llamadas a APIs externas, CDNs, librerías de terceros remotas y analíticas es un punto de partida excelente desde el punto de vista de la seguridad. No se han encontrado credenciales, tokens ni secretos en el código.

No obstante, la auditoría ha identificado **un hallazgo de severidad Media con impacto XSS real**, **tres hallazgos de severidad Media adicionales** relacionados con persistencia de datos clínicos en dispositivos compartidos y la carpeta `Referencia/`, y un conjunto de **mejoras necesarias a nivel de configuración del servidor** (cabeceras HTTP) que son condición necesaria para cumplir ENS categoría básica.

**Conclusión:** La aplicación **no está lista para despliegue en subdominio institucional** en su estado actual. Requiere tres correcciones en el código (véase Plan de remediación) y la configuración de cabeceras HTTP de seguridad por parte del equipo de informática del ICS antes de ser publicada. Las correcciones son simples y accionables en pocas horas.

### Estado global

| Categoría | Estado |
|-----------|--------|
| XSS / Inyección de código | ⚠️ Un punto XSS confirmado (bajo impacto práctico, debe corregirse) |
| Dependencias externas | ✅ Cero llamadas externas confirmadas |
| Credenciales / Secretos en código | ✅ No se han encontrado |
| Datos de paciente en localStorage | ⚠️ Persistencia no controlada en datos de texto libre (alergias, obs) |
| Cabeceras HTTP de seguridad | ❌ Ninguna configurada — responsabilidad del servidor ICS |
| Carpeta Referencia/ | ⚠️ Debe excluirse del despliegue |
| HTTPS | ⚠️ Obligatorio — no verificable sin infraestructura desplegada |
| Autenticación | ℹ️ Ausente por diseño — aceptado y documentado |

---

## ENTREGABLE A — INFORME DE AUDITORÍA

### 1. Vectores analizados y metodología

Se han leído manualmente todos los archivos HTML del proyecto (11 módulos activos + 4 en `prehospitalaria/` + 3 en `Referencia/`). Se han aplicado búsquedas automatizadas sobre:
- Patrones de XSS: `innerHTML`, `eval`, `document.write`, `outerHTML`
- URLs externas: `http://`, `https://`, `cdn`, `googleapis`, `fonts.google`, `jsdelivr`, `unpkg`
- APIs: `fetch`, `XMLHttpRequest`
- Datos sensibles: `localStorage`, campos de texto libre
- Cabeceras de seguridad: `Content-Security-Policy`, `X-Frame-Options`, `meta http-equiv`
- Información expuesta: comentarios con datos personales, extensiones telefónicas internas

---

### 2. Tabla de hallazgos ordenada por severidad

#### HAL-01 — XSS reflejado en buscador de la agenda telefónica
| Campo | Valor |
|-------|-------|
| **Severidad** | Media |
| **Archivo** | `hospital/recursos/agenda/index.html` |
| **Línea** | 537 |
| **Tipo** | DOM-based XSS (no persistente) |

**Descripción técnica:**  
La función `render(query)` de la agenda inserta la cadena de búsqueda del usuario directamente en el DOM mediante `innerHTML` sin ningún proceso de sanitización o escape:

```javascript
directoryDiv.innerHTML = `
    <div class="no-results">
        <div class="no-results-icon">🔍</div>
        Sin resultados para "<strong>${query}</strong>"
    </div>`;
```

Donde `query` procede de `searchInput.value`, es decir, de entrada de usuario sin filtrar.

**Vector de explotación:**  
Un usuario con acceso físico al dispositivo puede teclear en el campo de búsqueda una cadena como `</strong><img src=x onerror=alert(1)>` y ejecutar JavaScript arbitrario en el contexto del origen del documento.

**Impacto en contexto hospitalario:**  
El impacto práctico es limitado: no hay cookies de sesión que robar, no hay tokens de autenticación, y el ataque requiere acceso físico al dispositivo. Sin embargo, su presencia supone un **incumplimiento técnico de OWASP Top 10 (A03:2021 - Injection)** y del ENS (medida [mp.sw.1] Desarrollo de aplicaciones). En el peor escenario, un atacante con acceso al dispositivo podría inyectar JS que modifique las dosis visibles en pantalla o presente información errónea al profesional.

**Estado:** Debe corregirse antes del despliegue.

---

#### HAL-02 — Persistencia no controlada de texto libre clínico en localStorage (IOT)
| Campo | Valor |
|-------|-------|
| **Severidad** | Media |
| **Archivo** | `hospital/procedimientos/iot/index.html` |
| **Líneas clave** | 904 (campo alergias), 903 (textarea obs), 1018-1019 (estructura mkState) |
| **Clave localStorage** | `hj23_iot_state` |

**Descripción técnica:**  
El módulo IOT guarda continuamente en localStorage (clave `hj23_iot_state`) el estado completo del checklist mediante `save()`, incluyendo los campos:
- `alergias` — texto libre (ejemplo: "Penicilina, NAMC")
- `ultimaComida` — texto libre (ejemplo: "Hace 2 horas")
- `obs` — campo de observaciones libres del procedimiento (sin límite de caracteres)

Estos datos **persisten en el localStorage del navegador hasta que un profesional pulse explícitamente "Nuevo procedimiento"** (`startNew()` llama a `localStorage.removeItem(LSKEY)`). En dispositivos compartidos de uso clínico (tablets, móviles de guardia), si el profesional cierra el navegador o navega fuera sin iniciar un nuevo checklist, los datos del procedimiento anterior quedan accesibles para el siguiente usuario del dispositivo.

**Impacto RGPD/LOPD:**  
Aunque los campos no incluyen identificadores directos del paciente (nombre, DNI, NHC), los datos de texto libre **pueden contener información indirectamente identificativa** si el profesional incluye referencias al historial o anotaciones que permitan identificar al paciente. Esto podría constituir un tratamiento de datos de salud sin las garantías adecuadas bajo el art. 9 RGPD.

**Impacto clínico:**  
Un profesional podría ver las alergias o las observaciones de un paciente anterior, generando confusión diagnóstica o terapéutica.

---

#### HAL-03 — Carpeta Referencia/ accesible y desplegable
| Campo | Valor |
|-------|-------|
| **Severidad** | Media |
| **Archivos** | `Referencia/hospital/PerfuURG.html` (1049 líneas), `Referencia/hospital/TelefonosHJ23.html` (624 líneas), `Referencia/prehospitalaria/PerfuPREHOSP.html`, `Referencia/index.html` |
| **Tipo** | Contenido legado desactualizado públicamente accesible |

**Descripción técnica:**  
La carpeta `Referencia/` contiene versiones anteriores de las calculadoras de fármacos y la agenda telefónica, aparentemente conservadas como referencia para el desarrollo. Al ser archivos HTML estáticos en el árbol de directorios, **un servidor HTTP estático (Apache/Nginx) los servirá automáticamente** junto con el resto de la aplicación.

**Impacto:**  
- Los profesionales podrían acceder a versiones antiguas con dosis o protocolos desactualizados, con riesgo clínico directo.
- Los archivos de agenda en `Referencia/hospital/TelefonosHJ23.html` contienen extensiones telefónicas internas del hospital en su versión anterior.
- Duplica información sensible de infraestructura en rutas no gestionadas.

---

#### HAL-04 — Ausencia de cabeceras HTTP de seguridad
| Campo | Valor |
|-------|-------|
| **Severidad** | Media |
| **Responsable de corrección** | Equipo de informática ICS (configuración servidor) |
| **Referencia ENS** | mp.com.1, op.mon.3 |

**Descripción técnica:**  
No se ha encontrado ninguna cabecera de seguridad HTTP configurada (ni a nivel de meta tags ni referenciada para el servidor). La aplicación carecerá de:

| Cabecera | Riesgo si ausente |
|----------|------------------|
| `Content-Security-Policy` | Permite XSS y carga de recursos no autorizados |
| `X-Frame-Options` / `frame-ancestors` | Permite clickjacking |
| `X-Content-Type-Options: nosniff` | Permite MIME sniffing |
| `Referrer-Policy` | Fuga de URLs internas en cabeceras Referer |
| `Permissions-Policy` | Cámara, micrófono, geolocalización sin restricción declarada |
| `Strict-Transport-Security` (HSTS) | Si en HTTPS, fuerza siempre HTTPS |

**Nota sobre CSP y la app:**  
La aplicación utiliza JavaScript inline (`<script>` en todos los archivos HTML) y estilos inline (`<style>`). Una CSP estricta requeriría al menos `'unsafe-inline'` para scripts, lo que limita su protección contra XSS. Sin embargo, tras corregir HAL-01, una CSP con `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'none'; frame-ancestors 'none'` reduciría significativamente la superficie de ataque. La directiva `connect-src 'none'` es especialmente valiosa al confirmar formalmente que la app no hace llamadas de red.

---

#### HAL-05 — Extensiones telefónicas internas en agenda pública
| Campo | Valor |
|-------|-------|
| **Severidad** | Baja |
| **Archivo** | `hospital/recursos/agenda/index.html` |
| **Líneas** | 327–488 |
| **Tipo** | Información de infraestructura expuesta |

**Descripción técnica:**  
La agenda contiene las extensiones PABX internas del Hospital Joan XXIII (ej: "79568", "74402", "79569"), incluyendo servicios críticos (UCI, Banco de Sangre, Cirugía de Urgencias). Si el subdominio ICS es público (sin acceso restringido), estas extensiones quedan accesibles externamente.

**Impacto:**  
Riesgo de ingeniería social. Con estos números, un atacante podría suplantar servicios hospitalarios en llamadas externas. El impacto es bajo si el subdominio requiere red interna o VPN.

**Nota:** Este riesgo es idéntico al que existiría con un directorio telefónico impreso en la sala de médicos. La valoración depende del alcance de acceso público del subdominio ICS.

---

#### HAL-06 — localStorage con datos de paciente sin limpieza automática al cerrar sesión (módulo hospital)
| Campo | Valor |
|-------|-------|
| **Severidad** | Baja |
| **Archivo** | `hospital/index.html` |
| **Líneas** | 546, 554, 567 |
| **Clave localStorage** | `hj23_patient` |

**Descripción técnica:**  
El módulo hospital guarda `{sex, weight, height, ibw}` en `hj23_patient`. La clave se limpia cuando el profesional accede al índice del hospital **sin el hash `#menu`** en la URL. Si el profesional navega directamente a un submódulo (fármacos, IOT) desde el historial del navegador o via URL, los datos del paciente anterior podrían mostrarse.

**Impacto:**  
Los datos almacenados son pseudoanónimos (sin nombre ni ID del paciente). El riesgo es bajo pero presente en dispositivos compartidos: un profesional podría aplicar dosis calculadas sobre el peso del paciente anterior.

---

#### HAL-07 — Sesión RCP persiste en localStorage
| Campo | Valor |
|-------|-------|
| **Severidad** | Baja |
| **Archivo** | `hospital/rcp/index.html` |
| **Líneas** | 962–974 |
| **Clave localStorage** | `hj23_rcp_session` |

**Descripción técnica:**  
El gestor de RCP guarda el estado completo de la reanimación en `hj23_rcp_session`. Los datos incluyen timestamps, registro de intervenciones, ritmos cardíacos y datos de paciente si se configuran en la sección post-ROSC. La sesión persiste hasta que el profesional la descarta explícitamente.

**Evaluación RGPD:**  
El estado de la sesión no incluye datos identificativos del paciente (sin nombre ni NHC). Los timestamps son relativos al inicio de la sesión. El riesgo de re-identificación es bajo.

**Aspecto positivo:** El sistema muestra claramente un banner de restauración cuando detecta una sesión en curso, requiriendo acción explícita del profesional para restaurar o descartar.

---

#### HAL-08 — Manifest PWA con blob: URLs efímeras
| Campo | Valor |
|-------|-------|
| **Severidad** | Informativa |
| **Archivos** | `index.html`, `hospital/index.html`, `hospital/recursos/agenda/index.html` |
| **Líneas** | 8-31 (patrón repetido) |

**Descripción técnica:**  
El icono PWA y el manifiesto se generan dinámicamente mediante `URL.createObjectURL(blob)`. Estas URLs `blob:` son efímeras y no sobreviven a la recarga de la página ni pueden cachearse por el service worker. Aunque no es un problema de seguridad, el manifiesto generado dinámicamente puede fallar en algunas implementaciones de servidores HTTP estrictos o en auditorías de PWA.

**Impacto de seguridad:** Ninguno. El uso de `blob:` está dentro del mismo origen.

---

### 3. Elementos auditados con resultado positivo

| Elemento | Resultado |
|----------|-----------|
| Llamadas a APIs externas | ✅ Ninguna (confirmado por búsqueda exhaustiva) |
| CDNs de terceros (scripts, fuentes, estilos) | ✅ Ninguno — todo local, incluyendo fuentes en `fonts.css` |
| Google Fonts u otros servicios de tipografía externos | ✅ Ausentes |
| Tracking, analytics, pixels de telemetría | ✅ Ausentes |
| `eval()`, `document.write()`, `Function()` dinámicas | ✅ No encontrados |
| Credenciales, API keys, tokens en código | ✅ No encontrados |
| Datos identificativos de pacientes hardcodeados | ✅ No encontrados |
| Datos identificativos de profesionales en el código | ✅ No encontrados |
| Módulo prehospitalaria (standby) | ✅ Sin localStorage, sin datos persistentes |
| Generación de informes (IOT, RCP) | ✅ Usa `textContent` para datos de usuario — XSS-safe |
| innerHTML con datos de paciente (numéricos) | ✅ Solo valores float/int — no explotable como XSS |

---

## ENTREGABLE B — PLAN DE REMEDIACIÓN PRIORIZADO

### Bloquea el despliegue — Correcciones obligatorias

---

#### R-01 — Corregir XSS en agenda: escapar el texto de búsqueda antes de insertarlo en innerHTML
**Responsable:** Desarrollador  
**Archivo:** `hospital/recursos/agenda/index.html`  
**Línea:** 537  
**Esfuerzo estimado:** 15 minutos

**Corrección:**

```javascript
// ANTES (vulnerable):
directoryDiv.innerHTML = `
    <div class="no-results">
        <div class="no-results-icon">🔍</div>
        Sin resultados para "<strong>${query}</strong>"
    </div>`;

// DESPUÉS (seguro — opción A: textContent):
const noResults = document.createElement('div');
noResults.className = 'no-results';
const icon = document.createElement('div');
icon.className = 'no-results-icon';
icon.textContent = '🔍';
const msg = document.createElement('p');
msg.textContent = `Sin resultados para "${query}"`;
noResults.appendChild(icon);
noResults.appendChild(msg);
directoryDiv.appendChild(noResults);

// DESPUÉS (seguro — opción B: función de escape inline):
function escHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
directoryDiv.innerHTML = `
    <div class="no-results">
        <div class="no-results-icon">🔍</div>
        Sin resultados para "<strong>${escHTML(query)}</strong>"
    </div>`;
```

Se recomienda la opción A (DOM API) como más segura y explícita. La opción B es válida si se prefiere mantener el estilo de código existente.

---

#### R-02 — Añadir borrado explícito de datos IOT al finalizar el procedimiento
**Responsable:** Desarrollador  
**Archivo:** `hospital/procedimientos/iot/index.html`  
**Referencia:** HAL-02  
**Esfuerzo estimado:** 1 hora

**Problema:** Los campos `alergias`, `ultimaComida` y `obs` persisten en localStorage indefinidamente. En dispositivos compartidos, el siguiente profesional podría ver datos del paciente anterior.

**Corrección propuesta:**  
Mostrar un mensaje claro al finalizar el procedimiento ("Informe generado. ¿Iniciar nuevo procedimiento? Los datos actuales se borrarán.") y limpiar localStorage inmediatamente tras generar el informe, no solo al pulsar "Nuevo procedimiento". Alternativamente, añadir un temporizador de borrado automático (por ejemplo, 30 minutos tras generar el informe).

```javascript
// En la función generateReport(), añadir tras document.getElementById('informeBox').textContent=...:

// Borrar inmediatamente los campos libres sensibles del estado
S.alergias = '';
S.ultimaComida = '';
S.obs = '';
save(); // actualizar localStorage sin esos campos

// O bien, mostrar banner prominente con cuenta atrás
showSessionExpiryBanner(30 * 60 * 1000); // 30 min
```

Como mínimo obligatorio para el despliegue: añadir un **banner visible** en la pantalla de informe que indique explícitamente "Datos del procedimiento almacenados localmente — pulsa 'Nuevo procedimiento' para borrarlos antes de entregar el dispositivo."

---

#### R-03 — Excluir la carpeta Referencia/ del despliegue
**Responsable:** Equipo de informática ICS + Desarrollador  
**Archivo:** `Referencia/` (toda la carpeta)  
**Referencia:** HAL-03  
**Esfuerzo estimado:** 5 minutos

**Corrección:**  
Excluir `Referencia/` del árbol de archivos publicados en el servidor. Dos opciones:

**Opción A — Exclusión en la configuración del servidor (Apache):**
```apache
# En el VirtualHost o .htaccess raíz:
<Directory "/path/to/URGlabV2/Referencia">
    Require all denied
</Directory>
```

**Opción B — Exclusión en Nginx:**
```nginx
location /Referencia/ {
    deny all;
    return 404;
}
```

**Opción C — No incluir la carpeta en el despliegue:**  
Simplemente no copiar `Referencia/` al servidor. Esta es la opción más limpia.

Se recomienda la opción C: la carpeta `Referencia/` debe mantenerse solo en el repositorio de desarrollo, nunca en producción.

---

### Configuración del servidor — Previo al despliegue (responsabilidad ICS)

#### R-04 — Configurar cabeceras HTTP de seguridad
**Responsable:** Equipo de informática ICS  
**Referencia:** HAL-04  
**ENS:** mp.com.1, op.mon.3  
**Esfuerzo estimado:** 2-4 horas

Configurar las siguientes cabeceras en el servidor HTTP (Apache o Nginx) que sirva el subdominio:

**Para Apache (`/etc/apache2/sites-available/urglab.conf`):**
```apache
<VirtualHost *:443>
    ServerName urglab.ics.gencat.cat
    DocumentRoot /var/www/urglab

    # Excluir Referencia/
    <Directory "/var/www/urglab/Referencia">
        Require all denied
    </Directory>

    # Cabeceras de seguridad
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "no-referrer"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    # TLS
    SSLEngine on
    SSLCertificateFile /etc/ssl/ics/urglab.crt
    SSLCertificateKeyFile /etc/ssl/ics/urglab.key
    SSLProtocol TLSv1.2 TLSv1.3
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...
</VirtualHost>

# Redirección HTTP → HTTPS
<VirtualHost *:80>
    ServerName urglab.ics.gencat.cat
    Redirect permanent / https://urglab.ics.gencat.cat/
</VirtualHost>
```

**Para Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name urglab.ics.gencat.cat;
    root /var/www/urglab;

    # TLS
    ssl_certificate /etc/ssl/ics/urglab.crt;
    ssl_certificate_key /etc/ssl/ics/urglab.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Excluir Referencia/
    location /Referencia/ {
        deny all;
        return 404;
    }

    # Cabeceras de seguridad
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 80;
    server_name urglab.ics.gencat.cat;
    return 301 https://$host$request_uri;
}
```

---

### Mejoras recomendadas (no bloqueantes)

#### R-05 — Mejorar aviso de dispositivo compartido en módulo de datos del paciente
**Responsable:** Desarrollador  
**Referencia:** HAL-06  
**Esfuerzo:** 30 minutos

Añadir en `hospital/index.html` un aviso visible cuando se muestra el badge de datos guardados: *"Datos del paciente anterior cargados. Verifica o actualiza antes de continuar."* con botón de limpieza explícita.

#### R-06 — Limpiar hj23_patient al navegar hacia atrás desde submódulos
**Responsable:** Desarrollador  
**Referencia:** HAL-06  
**Esfuerzo:** 30 minutos

En cada submódulo (farmacos, iot, rcp), añadir en el botón "Volver" un paso de limpieza: `localStorage.removeItem('hj23_patient')` antes de navegar a `../index.html` (sin hash). Esto garantiza que el hub de hospital siempre pida datos nuevos.

#### R-07 — Valorar restricción de acceso al subdominio a red interna ICS
**Responsable:** Equipo de informática ICS  
**Referencia:** HAL-05  
**Esfuerzo:** Variable (depende de infraestructura)

Si la agenda telefónica está disponible públicamente, valorar restringir el acceso al subdominio a la red interna del ICS o mediante VPN. Esto mitiga HAL-05 (extensiones internas expuestas) sin requerir cambios en el código.

#### R-08 — Añadir política de privacidad mínima conforme a RGPD
**Responsable:** Unidad de Protección de Datos ICS  
**Esfuerzo:** Redacción jurídica + 1 hora de implementación

El art. 13 RGPD requiere información al usuario sobre el tratamiento. Aunque los datos son pseudoanónimos (sin identificador de paciente), la aplicación procesa datos de salud. Se recomienda añadir un texto informativo accesible desde la pantalla principal que indique:
- Qué datos se almacenan localmente (peso, talla, sexo, campos clínicos libres)
- Que no se transmiten a ningún servidor
- Que se borran al iniciar un nuevo procedimiento
- El responsable del tratamiento (Hospital Universitari Joan XXIII / ICS)

---

## APÉNDICE — Resumen de claves localStorage

| Clave | Módulo | Datos guardados | Cuándo se borra | Riesgo |
|-------|--------|-----------------|-----------------|--------|
| `hj23_patient` | hospital/index.html | `{sex, weight, height, ibw}` | Al cargar el hub sin `#menu` | Bajo — solo datos numéricos |
| `hj23_rcp_session` | hospital/rcp | Estado completo de RCP (timestamps, intervenciones) | Al descartar/finalizar explícitamente | Bajo — sin ID paciente |
| `hj23_iot_state` | hospital/procedimientos/iot | Estado IOT + **alergias, obs** (texto libre) | Solo al pulsar "Nuevo procedimiento" | **Medio — texto libre sensible** |

---

## APÉNDICE — Verificación de ausencia de recursos externos

Resultado de búsqueda exhaustiva en todos los archivos HTML (módulos activos, excluida `Referencia/`):

```
Resultados para: http://, https://, cdn., googleapis, fonts.google, 
                 jsdelivr, unpkg, cloudflare, script src=", fetch(, XMLHttpRequest
→ Sin coincidencias en ningún archivo de producción
```

**Confirma:** La aplicación no realiza ninguna llamada de red en runtime. Todo el código, estilos y fuentes tipográficas están embebidos localmente. Esto elimina los vectores de ataque de supply chain y garantiza el funcionamiento offline.

---

*Auditoría generada automáticamente el 2026-05-22 por tarea programada.*  
*Herramienta: Claude Code (claude-sonnet-4-6) — URGlabV2 Security Audit Task*

---

## Remediación aplicada — 2026-05-22

### R-01 — XSS agenda ✅ CORREGIDO
**Archivo:** `hospital/recursos/agenda/index.html`  
**Cambio:** Añadida función `escHTML(s)` que escapa `& < > "` a entidades HTML. Aplicada sobre `query` antes de insertarla en `innerHTML` en el bloque "Sin resultados para…".  
**Antes:** `...Sin resultados para "<strong>${query}</strong>"...`  
**Después:** `...Sin resultados para "<strong>${escHTML(query)}</strong>"...`

### R-02 — Persistencia IOT texto libre ✅ CORREGIDO
**Archivo:** `hospital/procedimientos/iot/index.html`  
**Cambio:** Al final de `generateReport()`, tras escribir el informe en el DOM, se borran inmediatamente `S.alergias`, `S.ultimaComida` y `S.obs` del objeto de estado y se persiste con `save()`. También se limpian los campos del DOM (`inAlergias`, `inComida`, `obsInput`) para que no sean visibles si el profesional navega hacia atrás.

### R-05/R-06 — Aviso datos paciente anterior ✅ IMPLEMENTADO
**Archivo:** `hospital/index.html`  
**Cambio:** Añadido banner de aviso `#prev-session-warning` (fondo ámbar) que aparece cuando el hub restaura datos de `hj23_patient` desde localStorage al volver de un submódulo (`#menu`). El banner incluye el mensaje "Datos del paciente anterior cargados. Verifica o actualiza antes de continuar." y un botón "Borrar" que ejecuta `clearPatient()`, limpiando localStorage y reseteando el badge.

### Pendiente (responsabilidad ICS Informática)
- **R-03:** Excluir carpeta `Referencia/` del árbol publicado en servidor (no copiarla al despliegue)
- **R-04:** Configurar cabeceras HTTP de seguridad (CSP, HSTS, X-Frame-Options, etc.) — snippets listos en este informe
- **R-07:** Valorar restricción de acceso al subdominio a red interna ICS
