# idemos — App (Expo)

Aplicación móvil construida con [Expo](https://expo.dev) y React Native.

## Requisitos

| Herramienta / Paquete | Versión  |
| --------------------- | -------- |
| Node.js               | >= 20.0  |
| npm                   | >= 10.0  |
| TypeScript            | ~5.9.2   |
| Expo                  | ~54.0.34 |
| React Native          | 0.81.5   |
| React                 | 19.1.0   |
| Expo Router           | ~6.0.23  |

> Para dispositivo físico se necesita la app **Expo Go** instalada, o un [development build](https://docs.expo.dev/develop/development-builds/introduction/).

## Instalación

```bash
npm install
```

## Ejecutar la app

### En emulador Android

Usa el archivo de entorno `.env.emulator`. No requiere configuración adicional porque el emulador accede al host mediante `10.0.2.2`.

```bash
npm run emulator
```

### En dispositivo físico

Usa el archivo de entorno `.env.mobile.local`. Antes de lanzarla **debes ajustar la IP** del backend en ese archivo para que apunte a la IP local de tu máquina en la red (ej. `192.168.1.x`).

```bash
# .env.mobile.local
EXPO_PUBLIC_API_URL=http://192.168.1.x:3000
```

```bash
npm run device
```

### Sin entorno específico (menú interactivo)

Abre el menú de Expo donde puedes elegir manualmente emulador, dispositivo o web.

```bash
npm start
```

## Variables de entorno

| Variable              | Descripción              |
| --------------------- | ------------------------ |
| `EXPO_PUBLIC_API_URL` | URL base del API gateway |

| Archivo             | Usado por          |
| ------------------- | ------------------ |
| `.env.emulator`     | `npm run emulator` |
| `.env.mobile.local` | `npm run device`   |

## Build APK

```bash
# Preview (EAS cloud)
npm run generate:apk

# Preview (local)
npm run generate:apk:local

# Producción
npm run generate:apk:prod
```
