from datetime import datetime
from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel
from models import Players, session, Tournament

app = FastAPI()


class tabPlayers(BaseModel):
    name:str
    createDate:str|None = datetime.now().strftime("%Y-%m-%d")
    personalScore:int|None = 0

class tabTournament(BaseModel):
    name:str
    createDate:str|None = datetime.now().strftime("%Y-%m-%d")

@app.get("/")
def read_root():
    return {"Description": "Magic Tournament API"}

# métodos relacionados con jugadores

@app.get("/player")
async def readPlayer():
    players = session.query(Players).all()
    return [{"id":player.id, "name":player.name, "creationDate":player.creationDate, "personalScore":player.personalScore, "Tournament": player.tournament} for player in players]

@app.get("/player/{player_id}")
async def readPlayer(player_id: int):
    player = session.query(Players).filter(Players.id == player_id).first()
    if not player:
        return {"message":"Player not found"}
    else:
        return [{"id":player.id, "nombre":player.name, "fechaCreacion":player.creationDate, "puntuacionGeneral":player.personalScore}]

@app.post("/player")
async def createUser(tabuser: tabPlayers):
    newPlayer = Players(
        name=tabuser.name,
        creationDate=datetime.now(),
        personalScore=0
    )
    session.add(newPlayer)
    session.commit()
    return {"message": "Player added"}

@app.patch("/player/{player_id}/score")
async def updatePlayerScore(player_id: int, score: int):
    player = session.query(Players).filter(Players.id == player_id).first()
    if not player:
        return {"message":"Player not found"}
    player.personalScore = score
    session.commit()
    return {"message": "Player not found"}

@app.delete("/player/{player_id}")
async def deletePlayer(player_id: int):
    player = session.query(Players).filter(Players.id == player_id).first()
    if not player:
        return {"message":"Player not found"}
    session.delete(player)
    session.commit()
    return {"message": "Player deleted"}

# métodos relacionados con Torneos

@app.get("/tournament")
async def readTournament():
    tournaments = session.query(Tournament).all()
    return [{"id":tournament.id, "name":tournament.name,"creation Date": tournament.creationDate, "Players": tournament.players} for tournament in tournaments]

@app.get("/tournament/{tournament_id}")
async def readTournament(tournament_id: int):
    tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return {"message":"Tournament not found"}
    return [{"id":tournament.id, "name":tournament.name,"creation Date": tournament.creationDate, "Players": tournament.players}]

@app.post("/tournament")
async def createTournament(tabtournament: tabTournament):
    newTournament = Tournament(
        name=tabtournament.name,
        creationDate=datetime.now(),
        players=[]
        )
    session.add(newTournament)
    session.commit()
    return {"message": "Tournament added"}

@app.post("/tournament/{tournament_id}/player/{player_id}")
async def addPlayerToTournament(tournament_id: int, player_id: int):
    tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return {"message": "Tournament not found"}

    player = session.query(Players).filter(Players.id == player_id).first()
    if not player:
        return {"message": "Player not found"}

    if player in tournament.players:
        return {"message": "This player is in the tournament"}

    tournament.players.append(player)
    session.commit()
    return {"message": "Player added to tournament"}

@app.delete("/tournament/{tournament_id}")
async def deleteTournament(tournament_id: int):
    tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return {"message":"Tournament not found"}
    session.delete(tournament)
    session.commit()
    return {"message": "Tournament deleted"}
