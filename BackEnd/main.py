#[ ] Agregar métodos para terminar un torneo y guardar los resultados

from datetime import datetime
from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel
from models import Players, session, Tournament, Matches, TournamentScores
from matchGeneration import generateMatches

app = FastAPI()

class tabPlayers(BaseModel):
    name:str
    #createDate:str|None = datetime.now().strftime("%Y-%m-%d")
    #personalScore:int|None = 0

class tabTournament(BaseModel):
    name:str
    #createDate:str|None = datetime.now().strftime("%Y-%m-%d")
    type:str

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

# Torneos

@app.get("/tournament")
async def getAllTournament():
    tournaments = session.query(Tournament).all()
    return [{"id":tournament.id, "name":tournament.name,"creation Date": tournament.creationDate, "Players": tournament.players, "Status": tournament.status,"scores": tournament.scores, "matches": tournament.matches} for tournament in tournaments]

@app.get("/tournament/{tournament_id}")
async def getTournament(tournament_id: int):
    tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return {"message":"Tournament not found"}
    return [{"id":tournament.id, "name":tournament.name,"creation Date": tournament.creationDate, "Players": tournament.players, "Status": tournament.status, "matches": tournament.matches}]

@app.post("/tournament")
async def createTournament(tabtournament: tabTournament):
    newTournament = Tournament(
        name=tabtournament.name,
        creationDate=datetime.now(),
        type="roundRobin",
        players=[],
        status=False
        )
    session.add(newTournament)
    session.commit()
    return {"message": "Tournament added"}

@app.post("/tournament/{tournament_id}/{player_id}")
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
    score = TournamentScores(
                        tournament_id = tournament_id,
                        player_id = player_id,
                        score = 0
                    )
    session.add(score)
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

@app.post("/tournament/{tournament_id}/generate_matches")
async def generateMatchesAPI(tournament_id: int):
    return generateMatches(tournament_id)

@app.get("/matches")
async def getMatches():
    matches = session.query(Matches).all()
    return[{"id":matches.id,"status":matches.status,"tournament":matches.tournament,"Player 1": matches.player1, "Player 2": matches.player2, "Winner": matches.win} for matches in matches]

#matches

@app.post("/match/{match_id}/{winner_id}/{draw}")
async def setWinner(match_id: int, winner_id: int, draw: bool):
    match = session.query(Matches).filter(Matches.id == match_id).first()
    if not match:
        return {"message":"Match not found"}

    if match.status:
        return {"message": "Result already set"}

    if winner_id not in [match.player1_id, match.player2_id]:
        return {"message": "Winner not found in this match"}

    if match.status == False:

        if draw:
            # En caso de empate, se le da 1 punto a cada jugador
            for player_id in [match.player1_id, match.player2_id]:
                score = session.query(TournamentScores).filter(TournamentScores.tournament_id == match.tournament_id, TournamentScores.player_id == player_id).first()
                score.score += 1
        else:
            # En caso de victoria, se le da 3 puntos al ganador
            score = session.query(TournamentScores).filter(TournamentScores.tournament_id == match.tournament_id, TournamentScores.player_id == winner_id).first()
            score.score += 3

        match.win = winner_id if not draw else -1
        match.status = True
        match.draw = draw
        session.commit()
    return {"message": "Winner set"}

@app.delete("/matches/{matches_id}")
async def deleteMatch(matches_id: int):
    match = session.query(Matches).filter(Matches.id == matches_id).first()
    if not match:
        return {"message":"Player not found"}
    session.delete(match)
    session.commit()
    return {"message": "Match deleted"}


# acceso a puntajes

@app.get("/scores")
async def getScores():
    scores = session.query(TournamentScores).all()
    return [{"id":score.id, "Tournament": score.tournament, "Player": score.player, "Score":score.score} for score in scores]

@app.get("/scores/{score_id}")
async def getScore(score_id: int):
    score = session.query(TournamentScores).filter(TournamentScores.id == score_id).first()
    return {"id":score.id, "Tournament": score.tournament, "Player": score.player, "Score":score.score}

@app.get("/scores/player/{player_id}")
async def getScoreByPlayer(player_id: int):
    scores = session.query(TournamentScores).filter(TournamentScores.player_id == player_id)
    return [{"id":score.id, "Tournament": score.tournament, "Player": score.player, "Score":score.score} for score in scores]

@app.delete("/scores/{score_id}")
async def deleteScore(score_id: int):
    score = session.query(TournamentScores).filter(TournamentScores.id == score_id).first()
    if not score:
        return {"message":"Score not found"}
    session.delete(score)
    session.commit()
    return {"message": "Score deleted"}

