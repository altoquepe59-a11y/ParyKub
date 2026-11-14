# PartyKub

Juego local de Rummikub para navegador, con mesa 3D, partidas contra bots y
guardado local y en la nube de las partidas.

## Ejecutar

El sitio estático se publica desde la raíz de este repositorio. Render sirve
`index.html` como la versión horizontal para tablet y despliega los cambios de
`main`. La PWA y el Service Worker se limitan a `movil.html`, la versión vertical.
`render.yaml` limita las cabeceras de caché a esa experiencia y sus recursos
propios. En la versión vertical, Three.js y el cliente de Supabase se sirven
localmente; la sincronización de partidas con Supabase requiere conexión.

La versión optimizada para celular en vertical está disponible en
[`movil.html`](./movil.html) y en
[parykub.onrender.com/movil.html](https://parykub.onrender.com/movil.html).

## Supabase

Las partidas guardadas se sincronizan con Supabase mediante inicio de sesión
anónimo, que PartyKub crea solo cuando el jugador guarda su primera partida.
La clave `publishable` incluida en el cliente es pública por diseño; nunca
incluyas una clave `secret` o `service_role`.

Antes de usar la sincronización, ejecuta
[`supabase/partykub_saved_games.sql`](./supabase/partykub_saved_games.sql) en el
SQL Editor del proyecto. El proveedor de autenticación anónima debe estar
habilitado.
Supabase recomienda configurar CAPTCHA para proteger los inicios anónimos de
abuso y limitar el consumo del proyecto.

RLS restringe cada operación a la sesión anónima propietaria de las partidas.
Las partidas también se conservan en el almacenamiento local del navegador.
La sesión anónima queda asociada a ese navegador; borrar sus datos de sitio
puede impedir recuperar las partidas desde otro dispositivo.

La PWA vertical conserva los archivos del juego localmente. El primer acceso
necesita conexión para descargar el juego; las partidas en la nube y otras
funciones de Supabase siguen necesitando Internet. La versión horizontal para
tablet no registra este Service Worker.
Al cambiar recursos, incrementa `CACHE_VERSION` en `sw.js` para renovar la
caché del dispositivo.
