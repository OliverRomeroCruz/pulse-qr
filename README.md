# ⚡ PulseQR — Generador Dinámico de Códigos QR con Analítica en Tiempo Real

PulseQR es una solución completa para generar códigos QR inteligentes y dinámicos que permiten:
- 🔗 Convertir cualquier enlace en un QR personalizable.
- 📊 **Rastrear visitas en tiempo real**: saber cuántas personas han escaneado el QR, qué dispositivo usan (iPhone, Android, PC) y qué navegador.
- 🎨 **Personalización visual**: paletas de color, márgenes y distintivos.
- 📥 **Descargas multiformato**: PNG en alta definición (1024px), ultra impresión (2048px), SVG vectorial infinito y cartel listo para imprimir.
- ⚡ **QR Dinámico**: permite cambiar la URL de destino en cualquier momento sin tener que volver a imprimir el código QR.

---

## 🚀 Despliegue 100% Gratuito en Render.com

Para tener la aplicación funcionando en internet las 24 horas y que tus códigos QR se puedan escanear desde cualquier móvil con datos (4G/5G):

1. Ve a [Render.com](https://render.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **New +** y selecciona **Web Service**.
3. Elige tu repositorio `OliverRomeroCruz/pulse-qr`.
4. Configura los siguientes campos:
   - **Name**: `pulse-qr` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Plan**: `Free` (0 € / mes)
5. Haz clic en **Create Web Service**. ¡En 2 minutos tendrás tu web en internet con HTTPS!

---

## 💻 Ejecución Local

Si prefieres ejecutarlo en tu propio ordenador:

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar frontend
npm run build

# 3. Iniciar el servidor
node server.js
```

Abre en tu navegador:
- Local: `http://localhost:3001`
- Red Local (Wi-Fi): `http://TU_IP_LOCAL:3001`
