# Galley Manager Pro — auditoría inicial y correcciones

## Correcciones aplicadas

1. **No se inventan tipos de comida.** La distribución por carro utiliza cuotas proporcionales enteras con método de mayores restos. Cada tipo queda limitado a la cantidad introducida.
2. **Distribución Equally con capacidad variable.** Se aplica reparto equilibrado con saturación: los carros limitados por SPML dejan de recibir unidades y la capacidad disponible de los demás carros se aprovecha.
3. **First Carts Full.** Si hay un número par de carros superior a 2, se equilibran por parejas consecutivas (1–2, 3–4, etc.) y se pasa a la siguiente pareja cuando la anterior queda llena. Si el número de carros es impar, o es exactamente 2, no se aplica la regla de parejas: se llena cada carro individualmente por orden.
4. **Validación estricta de cantidades.** Se rechazan decimales, texto mezclado con números, cantidades negativas, valores no seguros y configuraciones inválidas.
5. **Validación de SPML.** Un carro no puede recibir más de 40 SPML ni superar su capacidad física.
6. **Errores visibles.** La pantalla de inventario muestra el motivo del rechazo y no avanza a resultados cuando los datos no son válidos.
7. **Comprobaciones internas.** Antes de devolver resultados se verifica que el total de cada carro coincide con su contenido, que ningún carro supera 40 unidades y que cada tipo solicitado se reconcilia entre carros y exceso.

## Archivos modificados

- `src/utils/distribution.ts`
- `src/components/StepInput.tsx`
- `src/features/galley/GalleyApp.tsx`

## Pruebas realizadas

- Compilación TypeScript estricta y aislada del motor de cálculo: correcta.
- Pruebas de regresión para el caso que antes podía asignar Veggie cuando se habían solicitado cero: correcta.
- Prueba de distribución Equally con capacidades distintas por SPML: correcta.
- Pruebas de exceso, SPML fuera de rango, decimales y entradas con texto: correctas.
- 100.000 pruebas aleatorias ejecutadas contra la función TypeScript compilada: todas las invariantes se mantuvieron.

## Invariantes comprobadas

- Ningún tipo de comida asignado supera la cantidad solicitada.
- Asignado + exceso = solicitado, para cada tipo de comida.
- La suma del contenido normal de cada carro = `normalAssigned`.
- `normalAssigned + specialCount` nunca supera 40.
- No se ocultan datos inválidos convirtiéndolos silenciosamente en cero.

## Pendiente de verificación

No se pudo completar `npm run build` de toda la aplicación porque las dependencias del proyecto no estaban disponibles y la instalación de paquetes no terminó correctamente en este entorno. El motor de cálculo sí se compiló y probó de forma aislada. Antes de desplegar, ejecutar `npm ci` y `npm run build` en un entorno con acceso al registro de paquetes.

## Nota sobre el alcance

Esta es una primera auditoría centrada en el motor matemático y el flujo de entrada/resultados. La interpretación operativa de las estrategias (especialmente qué significa exactamente “First Carts Full” en los procedimientos de la aerolínea) debe confirmarse con el criterio de carga real antes de considerar el comportamiento como definitivo.

## Regla operativa confirmada por el usuario

- 4, 6, 8 o 10 carros: trabajar por parejas consecutivas; llenar la pareja actual de forma equilibrada antes de pasar a la siguiente.
- 2 carros: sin regla especial de parejas; llenar en orden.
- 3, 5, 7 o 9 carros: sin regla de parejas; llenar en orden individual.

## Estrategia predeterminada

`First Carts Full` queda configurada como estrategia predeterminada explícita mediante `DEFAULT_DIST_STRATEGY` en `src/constants.ts`. La pantalla de selección la identifica visualmente como `DEFAULT`. El usuario puede seguir seleccionando `Equally` manualmente.
