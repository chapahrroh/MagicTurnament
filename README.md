# MagicTurnament

App Online para trakear torneos casuales de Magic

## BackEnd:

- cargar entorno virtual con :
  ```python
  source MagicTurnament/bin/activate
  ```
- correr el servidor BackEnd:
  ```python
    uvicorn BackEnd.main:app --reload --host 0.0.0.0
  ```
- correr el servidor FrontEnd:
  ````bash`
  npm run dev -- --host 0.0.0.0
  ```
  docuentacion en: http://127.0.0.1:8000/docs
  ```
