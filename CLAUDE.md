# URGlabV2 — Instrucciones para Claude

## Ancho uniforme (OBLIGATORIO en todos los módulos)

Todo el contenido interior usa siempre `max-width: 480px; margin: 0 auto`. Esto garantiza que la app sea uniforme tanto en móvil como en escritorio.

- **Área de scroll / contenido:** envolver en un div contenedor con `max-width: 480px; margin: 0 auto; padding: 20px;`
- **Headers/hero:** pueden ser full-width visualmente, pero su contenido interior también va dentro de un div `max-width: 480px; width: 100%; margin: 0 auto`
- **Modales y bottom sheets:** overlay full-screen, sheet interior `max-width: 480px; width: 100%; margin: 0 auto`
- **Sin excepción:** aplicar en index.html principal, hospital/, prehospitalaria/ y cualquier módulo nuevo

## Header uniforme (OBLIGATORIO en todos los módulos)

Todo header de herramienta debe seguir exactamente esta especificación — sin excepciones ni overrides inline:

- **Label superior** (nombre del hospital o contexto): `font-family: var(--body); font-size: 0.58rem; font-weight: 600; color: #09c797; letter-spacing: 0.12em; text-transform: uppercase;`
- **Título** (nombre de la herramienta): `font-family: var(--display); font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: 0.04em; text-transform: uppercase; line-height: 1;`
- **NUNCA** usar `style` inline en `.hdr-title` o `.header-title` para cambiar font-size — rompe la homogeneidad. Si el texto es largo, dejar que se ajuste con `line-height` o abreviarlo.
- Fondo header: `linear-gradient(135deg, #1a7fc8 0%, #1a6fad 100%)`, borde inferior: `3px solid #09c797`

## Paleta de colores

- Azul hospital: `#1a7fc8 → #1a6fad` (gradiente), borde teal `#09c797`
- Rojo prehospitalaria/SEM: `#c41520 → #B5121B`, borde `rgba(255,255,255,0.3)`
- Fondo: `#f4f6f9`, superficie: `#ffffff`

## Fuentes

- `var(--display)` = Barlow Condensed (títulos, nombres de herramientas)
- `var(--body)` = IBM Plex Sans
- `var(--mono)` = IBM Plex Mono (badges, pills, labels)
- Fuente embebida en `fonts.css` (raíz del proyecto). NUNCA duplicar.

## Arquitectura

- Cada herramienta vive en su propia carpeta con `index.html`
- Navegación siempre con `index.html` explícito (Chrome file:// no resuelve directorios)
- `hospital/` → Hub HJ23 activo. `prehospitalaria/` → archivos en standby (proyecto SEM separado)
- El `index.html` raíz es el hub de hospitales ICS (solo Joan XXIII activo, resto "Próximamente")

## Sincronización con Gitea (intranet HJ23)

El repositorio tiene dos remotes configurados:
- `origin` → GitHub (hipolitogarciam/URGlabV2) — repositorio público de desarrollo
- `gitea` → `https://git.gtct.intranet.gencat.cat/UrgHJ23/URGLab.git` — intranet del hospital

**Protocolo cuando el usuario reporte nuevos cambios listos para Gitea:**

1. Hacer `git status` para ver qué ha cambiado
2. Preguntar al usuario el mensaje de commit si no lo ha indicado
3. Ejecutar: `git add .` → `git commit -m "..."` → `git push gitea main`
4. Confirmar el push exitoso con el hash del commit

**Frases que activan este flujo:** "tengo nuevos cambios", "sube a Gitea", "actualiza la intranet", "push al hospital", o cualquier variante similar.

> Si el usuario quiere subir también a GitHub en el mismo momento: añadir `git push origin main` al flujo.
