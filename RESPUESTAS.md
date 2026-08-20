# RESPUESTAS.md — Taller: Gestión de estados y efectos en React + TS

Aprendiz: Carlos Andres Naranjo Rojas
Ficha: 3410385

# Bloque 1 — El estado por dentro

*1. Si en `registrarCombo` escribo `setVentas(ventas + 3)` una sola vez, ¿funciona?**
Sí funciona en el caso normal, porque `ventas + 3` se calcula una sola vez con el valor
congelado del render actual y se encola una única orden "reemplazar por ese valor".
Deja de funcionar (o se vuelve peligroso) si el mismo manejador también llama a
`setVentas` en otro punto con la forma directa, o si dos eventos disparan el manejador
casi al mismo tiempo antes de que ocurra el re-render: en ese caso ambas llamadas leen
el mismo `ventas` "viejo" y una de las actualizaciones se pierde. Por eso la práctica
segura es siempre usar la función actualizadora cuando el nuevo valor depende del anterior.

**2. Cerrar caja cambia dos estados. ¿Cuántos renderizados provoca?**
Uno solo. React agrupa (batching) todas las actualizaciones de estado que ocurren dentro
del mismo manejador de evento síncrono y produce un único re-render al final, sin
importar cuántos `setEstado` distintos se hayan llamado.

**3. `ventas` vale 2. Ejecuto: `setVentas(ventas + 4); setVentas(v => v + 1); setVentas(ventas + 1)`. ¿Valor final?**
La cola queda: "reemplazar por 6" (2+4), "sumar 1" (aplicado sobre 6 → 7),
"reemplazar por 3" (2+1, porque `ventas` sigue congelado en 2 dentro de ese render).
El valor final es **3**, porque la última orden es un reemplazo directo que descarta
todo lo acumulado antes.

**4. ¿Por qué "Anular última" necesita la función actualizadora aunque se llame una vez por clic?**
Porque su lógica depende del valor anterior (`anterior > 0 ? anterior - 1 : 0`).
Aunque solo se invoque una vez, si el usuario hace clic muy rápido varias veces antes de
que el render se actualice, cada clic debe partir del resultado del clic anterior, no
del valor congelado del primer render. La función actualizadora garantiza que cada
actualización se aplique sobre el resultado real de la anterior.

**5. Quitar StrictMode temporalmente: dos diferencias observables.**
(a) Los console.log dentro del cuerpo del componente y de los efectos dejan de
imprimirse por duplicado en el primer render/montaje.
(b) Ya no se detectan tan fácilmente las impurezas (mutaciones durante el render,
efectos sin limpieza), porque React deja de ejecutar dos veces render/efectos/
inicializadores como mecanismo de diagnóstico en desarrollo.

## Bloque 2 — Mutabilidad, objetos y propiedades anidadas

**1. Tras `romperTodo`, el precio no cambió en pantalla, pero al escribir en Nombre apareció 99999. ¿Por qué?**
`romperTodo` mutó el objeto `producto` en memoria (`producto.precio = 99999`) y luego
llamó a `setProducto(producto)` pasando la **misma referencia**. React compara con
`Object.is` y, al ver la misma referencia, asume que nada cambió y no vuelve a
renderizar: por eso el precio no se actualiza en pantalla de inmediato. Sin embargo,
el objeto en memoria sí quedó mutado con 99999. Cuando después se escribe en el campo
Nombre, `manejarCambio` sí crea un objeto realmente nuevo con `{ ...producto, nombre: valor }`,
y ese spread copia el `precio` que ya estaba mutado en 99999, arrastrándolo a la
interfaz en ese segundo render.

**2. ¿Cuántos objetos nuevos se crean al cambiar la ciudad del proveedor?**
Tres: (1) un objeto `contacto` nuevo con la ciudad cambiada, (2) un objeto `proveedor`
nuevo que apunta al nuevo `contacto`, y (3) un objeto `producto` nuevo que apunta al
nuevo `proveedor`. Las demás ramas del producto (nombre, precio, stock) no se
recrean: se reutiliza su referencia porque no cambiaron.

**3. ¿Qué problemas aparecerían si `hayCambios` fuera un `useState` en vez de un valor derivado?**
Habría que recordar actualizarlo manualmente cada vez que `producto` cambia (en cada
manejador de cambio y en "Descartar"), duplicando lógica y abriendo la puerta a que
quede desincronizado (por ejemplo, mostrar "Guardar" habilitado cuando en realidad no
hay cambios reales, o viceversa). Al ser derivado, siempre es matemáticamente
consistente con `producto` y `productoInicial`.

**4. ¿Por qué el manejador genérico necesita `name`? ¿Qué pasa si dos inputs comparten `name`?**
`name` es la clave que el manejador usa como propiedad calculada (`[name]: valor`)
para saber qué campo del objeto de estado debe reemplazar. Si dos inputs comparten el
mismo `name`, ambos escribirían sobre la misma propiedad del objeto y uno pisaría al
otro cada vez que cambie cualquiera de los dos.

**5. Si `Producto` tuviera veinte campos anidados en cinco niveles, ¿qué haría distinto?**
Aplanaría (normalizaría) el estado según el Principio 5: en vez de un árbol profundo,
usaría colecciones planas relacionadas por identificador (por ejemplo, guardar el
contacto del proveedor como una entidad independiente referenciada por id). También
consideraría adoptar Immer (`useImmer`) para reducir el ruido sintáctico de los
spreads anidados, sin renunciar a la inmutabilidad real por debajo.

## Bloque 3 — Arreglos y estructura del estado

**1. ¿Por qué no usar `existente.cantidad = existente.cantidad + 1` aunque "funcione" al hacer doble clic?**
Porque muta un objeto que vive dentro del arreglo de estado. React compara referencias
del arreglo, no su contenido profundo: si el arreglo conserva la misma referencia al
objeto mutado, puede no detectar el cambio de forma confiable, y además rompe la
premisa de que todo lo que está en el estado es de solo lectura, lo que tarde o
temprano genera bugs intermitentes difíciles de rastrear.

**2. Si `total` fuera un `useState` y se agrega una funcionalidad de descuentos, ¿qué pasa?**
Habría que recordar recalcular y volver a llamar a `setTotal` en cada lugar donde el
carrito o el descuento cambian. Es fácil olvidarlo en un punto nuevo (como la función
de descuentos), dejando un total que "miente" respecto al contenido real del carrito.
Al ser derivado con `reduce`, el total siempre es correcto por construcción.

**3. R9 usa unión literal en vez de dos booleanos. Combinaciones posibles con dos booleanos y cuáles son imposibles.**
Con `enviando` y `enviado` booleanos habría 4 combinaciones: (false, false) = listo,
(true, false) = enviando, (false, true) = enviado, (true, true) = enviando Y enviado
a la vez. Esta última combinación no tiene sentido en el mundo real y es un estado
imposible que el tipo booleano permite por accidente. La unión literal
`'listo' | 'enviando' | 'enviado'` elimina esa combinación inválida a nivel de tipos.

**4. Si el carrito tuviera `items[i].promocion.descuento.porcentaje`, ¿aplicaría el Principio 5?**
Sí. En vez de anidar la promoción dentro de cada item, normalizaría: una colección
`promociones` indexada por id, y cada `ItemCarrito` guardaría solo un `promocionId`
opcional. Actualizar un descuento pasaría de reconstruir cada item anidado a cambiar
una sola entrada en la colección de promociones.

**5. Cambiar la key a `key={i}`, agregar tres productos y eliminar el primero.**
Al usar el índice como key, tras eliminar el primer elemento todos los demás
"heredan" la key del elemento anterior (el que era índice 1 pasa a índice 0, etc.).
React interpreta esto como que el contenido de cada fila cambió en lugar de entender
que una fila desapareció, lo que puede mezclar estado interno de las filas (inputs a
medio escribir, animaciones) entre productos distintos. Usar `productoId` como key
evita este problema porque identifica al dato, no a la posición.

## Bloque 4 — Estado compartido, hooks propios y efectos

**1. Peticiones con y sin `useDebounce` al escribir tres letras rápido.**
Sin debounce: tres peticiones, una por cada tecla presionada. Con debounce (400ms):
una sola petición, disparada solo cuando el usuario deja de escribir por ese tiempo,
porque el valor "diferido" que llega al efecto de `useProducts` no cambia hasta que
pasa el retardo sin nuevas pulsaciones.

**2. Quitar `return () => { ignorar = true }` de `useProducts`, escribir "caf", borrar y escribir "ja".**
Se dispara una petición para "caf" y luego otra para "ja". Como no hay bandera de
limpieza, ambas promesas pueden resolver en cualquier orden. Si la petición de "caf"
tarda más y responde después que la de "ja", su `.then` sobrescribe el estado
`productos` con los resultados viejos de "caf", aunque el input ya muestre "ja". Es la
condición de carrera clásica: el resultado visible no corresponde a lo que el usuario
ve escrito en la caja de búsqueda.

**3. ¿Por qué el efecto del título usa `[unidades]` y no `[items]`?**
`unidades` es un número derivado que resume lo relevante para el título (cuántas
unidades hay en total). Usar `[items]` haría que el efecto se dispare en cada cambio
de referencia del arreglo, incluso cuando el número de unidades no cambia realmente
(por ejemplo, al editar el nombre de un item sin tocar la cantidad), generando
escrituras innecesarias sobre `document.title`. Con `[unidades]`, el efecto solo
corre cuando el dato que realmente le importa al título cambia.

**4. Justificación de R8 con los Principios 3 y 4.**
Se optó por NO duplicar el arreglo `productos` del hook en un segundo `useState` de
App (evitando el Principio 4: duplicación). En cambio, App guarda solo un diccionario
de ediciones (`edicionesLocales`) y calcula `productos` visibles como un **valor
derivado** que combina `productosApi` con esas ediciones (Principio 3: nada
redundante se guarda, todo lo calculable se calcula en el render). Así existe una
única fuente de verdad para "lo que vino del servidor" y una única fuente de verdad
para "lo que el usuario cambió localmente", sin que ninguna pueda desincronizarse de
la otra.

**5. React Developer Tools: hooks en App vs ProductList.**
En `App` aparecen, en orden: los `useState` de `busqueda`, `seleccionadoId`, `items`,
`edicionesLocales`; el hook personalizado `useToggle` (que internamente expone su
propio `useState`); el hook personalizado `useProducts` (que expone, anidados, los
`useState` de `productos`, `cargando`, `error`, `intento`, más el `useDebounce` interno
con su propio `useState` y `useEffect`); y finalmente el `useEffect` del título.
`ProductList` no declara ningún hook propio: es un componente controlado que solo
recibe props y no guarda estado, por lo que en DevTools no muestra hooks.
`useProducts` muestra varios estados porque es un hook compuesto: internamente usa
tres `useState` propios más otro hook (`useDebounce`) que a su vez usa un `useState`
y un `useEffect` adicionales.

**6. Envolver `useProducts` en `if (busqueda.length > 0)`.**
El error típico es: *"React has detected a change in the order of Hooks called by
App. This will lead to bugs and errors if not fixed."* Esto ocurre porque React
identifica cada hook por la posición en que fue llamado durante el render, no por su
nombre. Si el hook se llama solo quando la condición es verdadera, en unos renders
existe y en otros no, cambiando el orden/cantidad de hooks entre renders. Esto viola
la Regla 1 (los hooks se llaman siempre en el nivel superior, nunca dentro de un
`if`), y React ya no puede asociar correctamente cada slot de estado con su hook.