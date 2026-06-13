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

## Buscador global — OBLIGATORIO mantener actualizado

El buscador de `hospital/index.html` usa un array estático `SEARCH_INDEX` (línea ~724). **Cada vez que se cree o modifique una herramienta, hay que añadir o actualizar su entrada en ese array.** Hacerlo siempre como parte de la misma tarea, sin esperar a que el usuario lo pida.

Formato de entrada:
```js
{ label: 'Nombre visible', keywords: ['sinonimo1','sinonimo2'], category: 'Categoría|Procedimiento|Patología|Algoritmo|Recurso|Fármaco', href: 'ruta/relativa/index.html' }
```
- `href` siempre relativo a `hospital/`, con `index.html` explícito.
- Añadir sinónimos clínicos relevantes en `keywords` (nombres alternativos, abreviaturas).
- Categorías usadas: `Categoría`, `Procedimiento`, `Patología`, `Algoritmo`, `Recurso`, `Fármaco`.

## Sincronización con Gitea (intranet HJ23)

El repositorio tiene dos remotes configurados:
- `origin` → GitHub (hipolitogarciam/URGlabV2) — repositorio público de desarrollo
- `gitea` → `https://git.gtct.intranet.gencat.cat/UrgHJ23/URGLab.git` — intranet del hospital

**Protocolo cuando el usuario reporte nuevos cambios listos para Gitea:**

1. Hacer `git status` para ver qué ha cambiado
2. Preguntar al usuario el mensaje de commit si no lo ha indicado
3. Ejecutar: `git add .` → `git commit -m "..."` → `git push gitea main`
4. Confirmar el push exitoso con el hash del commit

**Frases que activan este flujo:** "tengo nuevos cambios", "sube a Gitea", "actualiza la intranet", "push al hospital", "sube las actualizaciones", o cualquier variante similar.

**Mensajes de commit — NO preguntar al usuario.** Usar formato `Módulo — actualización N`, con un contador independiente por módulo/herramienta. Para saber el N: buscar en el historial el último número de ese módulo (`git log --oneline | grep -i "<módulo>"`) y sumar 1. Si varios módulos cambian a la vez, listarlos (ej. `RCP — actualización 5 · Anafilaxia — actualización 3`). Esto deja un registro del trabajo hecho en cada herramienta. Conteo de partida: RCP va por la nº5.

> `origin` está configurado con push a GitHub **y** Gitea simultáneamente. Un solo `git push origin main` sube a los dos. Verificar con `git remote -v`.

### ⛔ REGLAS CRÍTICAS — NUNCA romper

1. **PROHIBIDO `git push --force` (o `-f`) sobre `gitea`**, sin ninguna excepción. El informático de sistemas edita archivos directamente en la web de Gitea (sobre todo el workflow de despliegue), generando commits que NO existen en local. Un force push los destruye.

2. **Si Gitea rechaza un push por "non-fast-forward" / "behind"**, NO forzar. Integrar los cambios remotos primero:
   ```
   git fetch gitea
   git merge gitea/main --no-edit   # o rebase si el historial lo permite
   git push gitea main
   ```

3. **El workflow de despliegue vive en `.gitea/workflows/ci.yaml`** y está versionado en el repo. Despliega automáticamente al portal de aplicaciones de la intranet (`/home/portalaplicacions/cube/web/urgencies`) vía rsync+SSH en cada push a `main`. **NUNCA tocar, renombrar ni borrar este archivo.** Si hay que modificarlo, hacerlo solo con instrucción explícita del informático.

4. **Antes de cualquier operación que reescriba historial en Gitea**, detenerse y avisar al usuario. Ante la duda, preguntar — nunca asumir.
