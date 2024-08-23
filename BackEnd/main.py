from datetime import datetime
from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel
from models import Jugadores, session

app = FastAPI()


class tabJugadores(BaseModel):
    nombre:str
    fechaCreacion:str|None = datetime.now().strftime("%Y-%m-%d")
    puntuacionGeneral:int|None = 0

@app.get("/")
def read_root():
    return {"Description": "Magic Tournament API"}

@app.get("/player")
async def readPlayer():
    users = session.query(Jugadores).all()
    return [{"id":user.id, "nombre":user.nombre, "fechaCreacion":user.fechaCreacion, "puntuacionGeneral":user.puntuacionGeneral} for user in users]

@app.get("/player/{player_id}")
async def readPlayer(player_id: int):
    tabPlayer = session.query(Jugadores).filter(Jugadores.id == player_id).first()
    if not tabPlayer:
        return {"message":"No existe el usuario"}
    else:
        return [{"id":tabPlayer.id, "nombre":tabPlayer.nombre, "fechaCreacion":tabPlayer.fechaCreacion, "puntuacionGeneral":tabPlayer.puntuacionGeneral}]

@app.post("/player")
async def createUser(tabuser: tabJugadores):
    newPlayer = Jugadores(
        nombre=tabuser.nombre,
        fechaCreacion=datetime.now(),
        puntuacionGeneral=0
    )
    session.add(newPlayer)
    session.commit()
    return {"message": "Player added"}

@app.delete("/player/{player_id}")
async def deleteUser(player_id: int):
    tabPlayer = session.query(Jugadores).filter(Jugadores.id == player_id).first()
    if not tabPlayer:
        return {"message":"No existe el usuario"}
    session.delete(tabPlayer)
    session.commit()
    return {"message": "Player deleted"}