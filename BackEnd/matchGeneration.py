from models import session, Tournament, Matches
from random import shuffle

def matchesElimination(matches,players, tournamentId):
    for i in range(0, len(players) - 1, 2):
        matches.append(Matches(
            tournament_id=tournamentId,
            player1_id=players[i].id,
            player2_id=players[i + 1].id,
            win=-1,
            status=False
        ))

    if len(players) % 2 != 0:
        matches.append(Matches(
            tournament_id=tournamentId,
            player1_id=players[-1].id,
            player2_id=None,
            win=-1,
            status=False
        ))

def matchesRoundRobin(matches, players, tournamentId):
    for i in range(0, len(players)):
        for j in range( len(players)):
            if i!= j:
                matches.append(Matches(
                    tournament_id=tournamentId,
                    player1_id=players[i].id,
                    player2_id=players[j].id,
                    win=-1,
                    status=False
                ))

def generateMatches(tournament_id):
    tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return {"message": "Tournament not found"}

    players = tournament.players[:]
    shuffle(players)

    matches = []
    # Tournament type selection
    if tournament.type == "elimination":
        matchesElimination(matches, players,tournament_id)
    elif tournament.type == "roundRobin":
        matchesRoundRobin(matches, players, tournament_id)
    else:
        return {"message": "Tournament type not found"}

    session.add_all(matches)
    session.commit()

    return {"message": "Matches generated"}