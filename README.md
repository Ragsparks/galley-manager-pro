# Galley Manager Pro

Una herramienta avanzada para la distribución de comidas en las cocinas (galleys) de aerolíneas, calculando la optimización de la carga a través de los carros (carts) con manejo especial de comidas (SPML).

## Características

- **Distribución por defecto — First Carts Full**: al iniciar, la aplicación selecciona esta estrategia automáticamente. Con un número par de carros superior a 2, llena por parejas consecutivas (1–2, 3–4, etc.), equilibrando las unidades dentro de cada pareja antes de pasar a la siguiente. Con un número impar de carros, o exactamente 2, llena los carros individualmente por orden.
- **Distribución alternativa — Equally Distributed**: reparte las comidas tan uniformemente como permita la capacidad disponible.
- **Gestión de SPML**: Manejo de comidas especiales por carro.
- **Cálculo de Exceso**: Identificación visual de excedentes de inventario.
- **Modos de Entrada**: Por unidades o por porcentaje de carga total.

## Instalación

1.  Clona el repositorio.
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
# galley-manager-pro
