#[ ] Agregar métodos para terminar un torneo y guardar los resultados

from datetime import datetime
from typing import Union, List
from fastapi import FastAPI, HTTPException

from fastapi import FastAPI
from pydantic import BaseModel
from models import Players, session, Tournament, Matches, TournamentScores
from matchGeneration import generateMatches, generateNextPhaseMatches
from fastapi.middleware.cors import CORSMiddleware
from schemas import TournamentBase, PlayerBase, MatchBase, TournamentScoreBase


app = FastAPI()

# Configuración de CORS
origin = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origin, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Configuración de la base de datos
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
@app.get("/player", response_model=List[PlayerBase])
async def readPlayer():
    players = session.query(Players).all()
    return players

@app.get("/player/{player_id}", response_model=PlayerBase)
async def readPlayer(player_id: int):
    try:
        player = session.query(Players).filter(Players.id == player_id).first()
        if not player:
            raise HTTPException(
                status_code=404,
                detail="Player not found"
            )

        return player

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving player: {str(e)}"
        )

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


@app.get("/tournament", response_model=List[TournamentBase])
async def getAllTournament():
    try:
        tournaments = session.query(Tournament).all()
        # Filter out invalid matches before returning
        for tournament in tournaments:
            tournament.matches = [
                match for match in tournament.matches
                if match.player1_id is not None and match.player2_id is not None
            ]
        return tournaments
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/tournament/{tournament_id}", response_model=TournamentBase)
async def getTournament(tournament_id: int):
    try:
        tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")

        # Get standings if tournament is finished
        final_standings = []
        if tournament.status:
            scores = session.query(TournamentScores).filter(
                TournamentScores.tournament_id == tournament_id
            ).order_by(TournamentScores.score.desc()).all()

            final_standings = [
                {
                    "position": i + 1,
                    "player_id": score.player_id,
                    "player_name": score.player.name,
                    "final_score": score.score
                }
                for i, score in enumerate(scores)
            ]

        # Create a clean dictionary without circular references
        tournament_data = {
            "id": tournament.id,
            "name": tournament.name,
            "type": tournament.type,
            "creationDate": tournament.creationDate,
            "status": tournament.status,
            "currentPhase": tournament.currentPhase,  # Add current phase
            "players": [
                {
                    "id": p.id,
                    "name": p.name,
                    "creationDate": p.creationDate,
                    "personalScore": p.personalScore,
                    "tournament": []  # Avoid circular reference
                } for p in tournament.players
            ],
            "matches": [
                {
                    "id": m.id,
                    "tournament_id": m.tournament_id,
                    "player1_id": m.player1_id,
                    "player2_id": m.player2_id,
                    "win": m.win,
                    "status": m.status,
                    "draw": m.draw,
                    "phase": m.phase  # Add phase information
                } for m in tournament.matches
            ],
            "scores": [
                {
                    "id": s.id,
                    "tournament_id": s.tournament_id,
                    "player_id": s.player_id,
                    "score": s.score
                } for s in tournament.scores
            ],
            "final_standings": final_standings
        }

        return tournament_data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving tournament: {str(e)}"
        )

@app.post("/tournament")
async def createTournament(tabtournament: tabTournament):
    newTournament = Tournament(
        name=tabtournament.name,
        creationDate=datetime.now(),
        type=tabtournament.type,
        players=[],
        status=False
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
    score = TournamentScores(
                        tournament_id = tournament_id,
                        player_id = player_id,
                        score = 0
                    )
    session.add(score)
    session.commit()
    return {"message": "Player added to tournament"}

@app.delete("/tournament/{tournament_id}/player/{player_id}")
async def removePlayerFromTournament(tournament_id: int, player_id: int):
    try:
        tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")

        player = session.query(Players).filter(Players.id == player_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        if player not in tournament.players:
            raise HTTPException(status_code=400, detail="Player not in tournament")

        # Remove player from tournament
        tournament.players.remove(player)

        # Remove player's tournament score
        tournament_score = session.query(TournamentScores).filter(
            TournamentScores.tournament_id == tournament_id,
            TournamentScores.player_id == player_id
        ).first()
        if tournament_score:
            session.delete(tournament_score)

        session.commit()
        return {"message": "Player removed from tournament"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing player: {str(e)}")

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
    print(f"DEBUG: Starting match generation for tournament {tournament_id}")
    tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        print(f"DEBUG: Tournament {tournament_id} not found")
        raise HTTPException(status_code=404, detail="Tournament not found")

    print(f"DEBUG: Tournament type: {tournament.type}")
    print(f"DEBUG: Number of players: {len(tournament.players)}")

    if len(tournament.players) < 2:
        print("DEBUG: Not enough players to generate matches")
        raise HTTPException(status_code=400, detail="Not enough players to generate matches")

    if(tournament.status):
        print("DEBUG: Tournament is already finished")
        raise HTTPException(status_code=400, detail="Tournament already finished")

    try:
        print("DEBUG: Calling generateMatches function")
        # Get matches and ensure they're Match objects
        matches = generateMatches(tournament_id)
        print(f"DEBUG: Generated {len(matches) if matches else 0} matches")

        if not matches:
            print("DEBUG: No matches were generated")
            raise HTTPException(
                status_code=400,
                detail="No matches were generated"
            )

        # Ensure each match has the correct tournament_id
        print("DEBUG: Validating generated matches")
        for i, match in enumerate(matches):
            print(f"DEBUG: Validating match {i+1}/{len(matches)}")
            print(f"DEBUG: Match details - P1: {match.player1_id}, P2: {match.player2_id}")

            if not isinstance(match, Matches):
                print(f"DEBUG: Invalid match object type: {type(match)}")
                raise HTTPException(
                    status_code=500,
                    detail="Invalid match object generated"
                )

            match.tournament_id = tournament_id
            if match.player1_id is None or (match.player2_id is None and not tournament.type == "elimination"):
                print(f"DEBUG: Invalid match - missing player(s)")
                raise HTTPException(
                    status_code=400,
                    detail="Invalid match generated - missing player"
                )
            session.add(match)

        print("DEBUG: Committing matches to database")
        session.commit()
        print("DEBUG: Successfully generated and saved matches")
        return matches

    except Exception as e:
        session.rollback()
        print(f"DEBUG: Error generating matches: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        import traceback
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating matches: {str(e)}"
        )

#matches

@app.get("/matches", response_model=List[MatchBase])
async def getMatches():
    try:
        matches = session.query(Matches).all()
        # Filter out invalid matches before returning
        valid_matches = [
            match for match in matches
            if match.player1_id is not None
        ]
        return valid_matches
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/match/{match_id}", response_model=List[MatchBase])
async def getMatch(match_id: int):
    try:
        match = session.query(Matches).filter(Matches.id == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

        # Return as a list to match the response_model
        return [match]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving match: {str(e)}"
        )

@app.post("/match/{match_id}/{winner_id}/{draw}")
async def setWinner(match_id: int, winner_id: int, draw: bool):
    try:
        match = session.query(Matches).filter(Matches.id == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

        if match.status:
            raise HTTPException(status_code=400, detail="Result already set")

        if winner_id not in [match.player1_id, match.player2_id]:
            raise HTTPException(status_code=400, detail="Winner not found in this match")

        # Begin transaction
        try:
            if draw:
                # En caso de empate, se le da 1 punto a cada jugador
                for player_id in [match.player1_id, match.player2_id]:
                    score = session.query(TournamentScores).filter(
                        TournamentScores.tournament_id == match.tournament_id,
                        TournamentScores.player_id == player_id
                    ).first()
                    if score:
                        score.score += 1
            else:
                # En caso de victoria, se le da 3 puntos al ganador
                score = session.query(TournamentScores).filter(
                    TournamentScores.tournament_id == match.tournament_id,
                    TournamentScores.player_id == winner_id
                ).first()
                if score:
                    score.score += 3

            # Update match status
            match.win = winner_id if not draw else -1
            match.status = True
            match.draw = draw

            # Commit all changes
            session.commit()
            return {"message": "Winner and scores set successfully"}

        except Exception as e:
            session.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error updating scores: {str(e)}"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

@app.delete("/matches/{matches_id}")
async def deleteMatch(matches_id: int):
    match = session.query(Matches).filter(Matches.id == matches_id).first()
    if not match:
        return {"message":"Player not found"}
    session.delete(match)
    session.commit()
    return {"message": "Match deleted"}


# acceso a puntajes

@app.get("/scores", response_model=List[TournamentScoreBase])
async def getScores():
    scores = session.query(TournamentScores).all()
    return scores

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

@app.post("/tournament/{tournament_id}/finish")
async def finishTournament(tournament_id: int):
    try:
        tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")

        # Check if tournament has unfinished matches
        unfinished_matches = session.query(Matches).filter(
            Matches.tournament_id == tournament_id,
            Matches.status == False
        ).count()

        if unfinished_matches > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Tournament has {unfinished_matches} unfinished matches"
            )

        # Get all tournament scores ordered by score
        final_scores = session.query(TournamentScores).filter(
            TournamentScores.tournament_id == tournament_id
        ).order_by(TournamentScores.score.desc()).all()

        # Update personal scores for top 3 players
        if len(final_scores) >= 1:  # First place
            winner = session.query(Players).filter(
                Players.id == final_scores[0].player_id
            ).first()
            winner.personalScore += 5

        if len(final_scores) >= 2:  # Second place
            runner_up = session.query(Players).filter(
                Players.id == final_scores[1].player_id
            ).first()
            runner_up.personalScore += 3

        if len(final_scores) >= 3:  # Third place
            third_place = session.query(Players).filter(
                Players.id == final_scores[2].player_id
            ).first()
            third_place.personalScore += 1

        # Mark tournament as finished
        tournament.status = True

        session.commit()

        # Format response with final standings
        standings = [
            {
                "position": i + 1,
                "player_id": score.player_id,
                "player_name": score.player.name,
                "final_score": score.score
            }
            for i, score in enumerate(final_scores)
        ]

        return {
            "message": "Tournament finished successfully",
            "final_standings": standings
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error finishing tournament: {str(e)}"
        )

@app.post("/tournament/{tournament_id}/next-phase")
async def next_phase(tournament_id: int):
    try:
        print(f"DEBUG: Starting next phase for tournament {tournament_id}")
        # Get the tournament
        tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            print(f"DEBUG: Tournament {tournament_id} not found")
            raise HTTPException(status_code=404, detail="Tournament not found")

        print(f"DEBUG: Tournament status: {tournament.status}, type: {tournament.type}")
        # Verify tournament is not finished
        if tournament.status:
            print("DEBUG: Tournament is already finished")
            raise HTTPException(status_code=400, detail="Tournament is already finished")

        # Verify tournament is elimination type
        if tournament.type != "elimination":
            print(f"DEBUG: Invalid tournament type: {tournament.type}")
            raise HTTPException(status_code=400, detail="Only elimination tournaments can advance phases")

        # Get current phase matches and verify they're all complete
        current_phase = tournament.currentPhase or 1
        print(f"DEBUG: Current phase: {current_phase}")
        current_matches = [m for m in tournament.matches if m.phase == current_phase]
        print(f"DEBUG: Found {len(current_matches)} matches in current phase")
        print(f"DEBUG: Match statuses: {[m.status for m in current_matches]}")

        if not all(match.status for match in current_matches):
            print("DEBUG: Not all matches are completed")
            raise HTTPException(
                status_code=400,
                detail="All matches in current phase must be completed before advancing"
            )

        # Generate next phase matches
        print("DEBUG: Generating next phase matches")
        next_phase_matches = generateNextPhaseMatches(tournament, current_phase)
        print(f"DEBUG: Generated matches: {next_phase_matches}")

        if not next_phase_matches:
            print("DEBUG: No matches generated for next phase")
            # Instead of finishing the tournament, just return a message
            return {"message": "No es posible generar más fases"}

        # Add new matches to session
        print(f"DEBUG: Adding {len(next_phase_matches)} matches to database")
        for match in next_phase_matches:
            session.add(match)

        # Update tournament current phase
        print(f"DEBUG: Updating tournament phase to {current_phase + 1}")
        tournament.currentPhase = current_phase + 1

        # Commit all changes in a single transaction
        session.commit()
        print("DEBUG: Successfully committed changes")

        return {"message": "Advanced to next phase successfully"}

    except HTTPException as he:
        session.rollback()
        print(f"DEBUG: HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        session.rollback()
        print(f"DEBUG: Unexpected error: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        import traceback
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

