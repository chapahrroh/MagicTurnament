from .models import session, Tournament, Matches
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
            draw=False
        ))

    if len(players) % 2 != 0:
        matches.append(Matches(
            tournament_id=tournamentId,
            player1_id=players[-1].id,
            player2_id=6,
            win=-1,
            status=False,
            draw=False
        ))

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

def generateNextPhaseMatches(tournament_id: int) -> List[Matches]:
    """Generate matches for the next phase of an elimination tournament"""
    try:
        tournament = session.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            raise ValueError("Tournament not found")

        # Get the current highest phase
        current_phase = session.query(func.max(Matches.phase)).filter(
            Matches.tournament_id == tournament_id
        ).scalar() or 1

        # Get winners from the current phase
        current_phase_winners = []
        current_phase_matches = session.query(Matches).filter(
            Matches.tournament_id == tournament_id,
            Matches.phase == current_phase
        ).all()

        for match in current_phase_matches:
            if not match.status:
                raise ValueError("Cannot generate next phase: current phase has unfinished matches")
            if match.draw:
                raise ValueError("Cannot generate next phase: current phase has draws")
            if match.win != -1:
                current_phase_winners.append(match.win)

        if not current_phase_winners:
            raise ValueError("No winners found in current phase")

        # Generate matches for next phase
        next_phase_matches = []
        for i in range(0, len(current_phase_winners) - 1, 2):
            next_phase_matches.append(
                Matches(
                    tournament_id=tournament_id,
                    player1_id=current_phase_winners[i],
                    player2_id=current_phase_winners[i + 1],
                    phase=current_phase + 1,
                    win=-1,
                    status=False,
                    draw=False
                )
            )

        # Handle odd number of winners
        if len(current_phase_winners) % 2 != 0:
            next_phase_matches.append(
                Matches(
                    tournament_id=tournament_id,
                    player1_id=current_phase_winners[-1],
                    player2_id=current_phase_winners[0],  # Match against first winner
                    phase=current_phase + 1,
                    win=-1,
                    status=False,
                    draw=False
                )
            )

        session.add_all(next_phase_matches)
        session.commit()
        return next_phase_matches

    except Exception as e:
        session.rollback()
        raise e