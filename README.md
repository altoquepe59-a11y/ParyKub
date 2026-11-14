# PartyKub

Juego de Rummikub para navegador, con mesa 3D, partidas contra bots, salas en
línea para la versión móvil y guardado local y en la nube de las partidas.

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
anónimo, que PartyKub crea al guardar una partida o entrar a una sala en línea.
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

## Salas en línea

La versión `movil.html` usa Supabase Realtime para crear salas con un código de
ocho caracteres y sincronizar las partidas. El proyecto debe tener habilitados
el proveedor de autenticación anónima y Realtime. Las salas admiten de dos a
cuatro personas; al iniciar, el anfitrión elige jugar solo con quienes estén
conectados o completar los asientos restantes con bots. En las salas móviles,
cada participante puede ver su soporte en primera persona y la cámara anima el
paso a la mesa cuando comienza su turno. El anfitrión debe permanecer conectado
y no se admiten jugadores nuevos después de iniciar. Si una persona se
desconecta durante la partida, un bot ocupa su lugar.

Las salas están pensadas para partidas casuales: el estado completo se transmite
a los participantes y no hay un servidor de juego que valide las jugadas contra
clientes modificados. Los canales se cierran cuando los jugadores salen.
La versión horizontal para tablet no incluye este flujo.

La PWA vertical conserva los archivos del juego localmente. El primer acceso
necesita conexión para descargar el juego; las partidas en la nube y otras
funciones de Supabase siguen necesitando Internet. La versión horizontal para
tablet no registra este Service Worker.
Al cambiar recursos, incrementa `CACHE_VERSION` en `sw.js` para renovar la
caché del dispositivo.
