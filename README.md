# 🪄 Gestor de Torneos de Magic

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react)](https://reactjs.org/)

Una aplicación web moderna para gestionar torneos de Magic: The Gathering con formatos de **eliminación** y **todos contra todos**.

## 📸 Vistas Previas

### 🏠 Página de Inicio

![Página de Inicio](preview/Home.png)
_Vista principal con resumen de torneos y jugadores_

### 👥 Gestión de Jugadores

![Gestión de Jugadores](preview/players.png)
_Interfaz de administración de jugadores_

### 👤 Detalle de Jugador

![Detalle de Jugador](preview/playerdetail.png)
_Vista detallada del historial y estadísticas del jugador_

### 🏆 Detalles del Torneo

![Detalles del Torneo](preview/tournamet.png)
_Vista detallada de un torneo en curso_

### 🎯 Resultados de Torneo

![Resultados de Torneo](preview/turnamentdetail.png)
_Visualización de posiciones finales y estadísticas_

## ✨ Características

### 🏆 Gestión de Torneos

- 📊 Crear y gestionar múltiples torneos
- 🔄 Soporte para formatos de eliminación y todos contra todos
- ⚡ Generación y emparejamiento automático de partidas
- 📈 Progresión de fases para torneos de eliminación

### 👥 Gestión de Jugadores

- 📝 Registrar y gestionar jugadores
- 📊 Seguimiento de estadísticas e historial de partidas
- 🏅 Sistema dinámico de puntuación
- 🎯 Seguimiento de rendimiento

### ⚔️ Gestión de Partidas

- ⚡ Resultados de partidas en tiempo real
- 📜 Historial completo de partidas
- 🤝 Soporte para empates
- 🔄 Generación automática de siguientes fases

## 🛠️ Tecnologías Utilizadas

### Backend

- 🐍 Python 3.8+ con FastAPI
- 🗃️ SQLAlchemy ORM
- 📦 Base de datos SQLite

### Frontend

- ⚛️ React 18+ con TypeScript
- 🎨 Bootstrap 5
- 🔄 Axios para comunicación API
- 📱 Diseño responsivo

## 🚀 Inicio Rápido

### Configuración del Backend

```bash
# Clonar el repositorio
git clone https://github.com/chapahrroh/gestor-torneos-magic.git
cd MagicTurnament/Backend

# Configurar entorno Python
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python models.py

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Configuración del Frontend

```bash
# Navegar al frontend
cd ../Frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📂 Estructura del Proyecto

```
MagicTurnament/
├── Backend/
│   ├── models.py         # Modelos de base de datos
│   ├── main.py          # Aplicación FastAPI
│   ├── schemas.py       # Esquemas Pydantic
│   └── matchGeneration.py # Lógica de generación de partidas
├── Frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/      # Páginas
│   │   └── types/      # Tipos TypeScript
│   └── package.json
└── README.md
```

## 🔌 Referencia API (Endpoints Principales)

| Endpoint                      | Método | Descripción                  |
| ----------------------------- | ------ | ---------------------------- |
| `/tournament`                 | GET    | Listar todos los torneos     |
| `/tournament/{id}`            | GET    | Obtener detalles del torneo  |
| `/tournament/{id}/next-phase` | POST   | Avanzar fase del torneo      |
| `/players/{id}/stats`         | GET    | Obtener estadísticas jugador |
| `/match/{id}/result`          | POST   | Enviar resultado de partida  |

## 🤝 Contribuir

1. Hacer fork del repositorio
2. Crear rama para tu función
   ```bash
   git checkout -b feature/nueva-funcion
   ```
3. Hacer commit de tus cambios
   ```bash
   git commit -m 'Agregar nueva función'
   ```
4. Subir la rama
   ```bash
   git push origin feature/nueva-funcion
   ```
5. Crear Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

Made with ❤️ by Chapahrroh

[⭐ Dale una estrella a este proyecto](https://github.com/chapahrroh/gestor-torneos-magic)
