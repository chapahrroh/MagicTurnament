from models import session, Tournament, Matches
from random import shuffle
from typing import List
from sqlalchemy import func

def matchesElimination(matches: List[Matches], players: List, tournamentId: int) -> None:
    """Generate elimination tournament matches"""
    for i in range(0, len(players) - 1, 2):
        matches.append(Matches(
            tournament_id=tournamentId,
            player1_id=players[i].id,
            player2_id=players[i + 1].id,
            win=-1,
            status=False,
            draw=False,
            phase=1
        ))

    # If odd number of players, create a phantom match
    if len(players) % 2 != 0:
        phantom_match = Matches(
            tournament_id=tournamentId,
            player1_id=players[-1].id,
            player2_id=None,  # No opponent
            win=players[-1].id,  # Automatically wins
            status=True,  # Match is completed
            draw=False,
            phase=1
        )
        matches.append(phantom_match)

def matchesRoundRobin(matches: List[Matches], players: List, tournamentId: int) -> None:
    """Generate round robin tournament matches - each player plays against others once"""
    for i in range(len(players)):
        for j in range(i + 1, len(players)):  # Changed to avoid double matches
            matches.append(Matches(
                tournament_id=tournamentId,
                player1_id=players[i].id,
                player2_id=players[j].id,
                win=-1,
                status=False,
                draw=False
            ))

def generateMatches(tournament_id: int) -> List[Matches]:
    """Generate matches for a tournament"""
    try:
        tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            raise ValueError("Tournament not found")

        players = tournament.players[:]
        if len(players) < 2:
            raise ValueError("Not enough players for tournament")

        shuffle(players)
        matches = []

        if tournament.type == "elimination":
            matchesElimination(matches, players, tournament_id)
        elif tournament.type == "roundRobin":
            matchesRoundRobin(matches, players, tournament_id)
        else:
            raise ValueError(f"Invalid tournament type: {tournament.type}")

        # Add all matches at once
        session.add_all(matches)
        session.commit()

        return matches

    except Exception as e:
        session.rollback()
        raise Exception(f"Error generating matches: {str(e)}")

def generateNextPhaseMatches(tournament, current_phase: int):
    """Generate matches for the next phase in an elimination tournament"""
    # Get winners from current phase
    current_matches = [m for m in tournament.matches if m.phase == current_phase]
    winners = []
    for match in current_matches:
        if match.player2_id is None:
            # Phantom match - player automatically advances
            winners.append(match.player1_id)
        elif match.draw:
            # In case of draw, randomly select a winner
            import random
            winner_id = random.choice([match.player1_id, match.player2_id])
            winners.append(winner_id)
        else:
            winners.append(match.win)

    print(f"DEBUG: Winners from phase {current_phase}: {winners}")

    # If only one winner, tournament is finished
    if len(winners) < 2:
        return []

    # Create matches for next phase
    next_phase = current_phase + 1
    new_matches = []

    # Pair winners for next phase
    for i in range(0, len(winners), 2):
        if i + 1 < len(winners):
            new_match = Matches(
                tournament_id=tournament.id,
                player1_id=winners[i],
                player2_id=winners[i + 1],
                win=-1,
                status=False,
                draw=False,
                phase=next_phase
            )
        else:
            # Last player gets a phantom match
            new_match = Matches(
                tournament_id=tournament.id,
                player1_id=winners[i],
                player2_id=None,
                win=winners[i],
                status=True,
                draw=False,
                phase=next_phase
            )
        new_matches.append(new_match)

    print(f"DEBUG: Generated {len(new_matches)} matches for phase {next_phase}")
    return new_matches
