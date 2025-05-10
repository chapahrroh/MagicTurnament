from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class StandingBase(BaseModel):
    position: int
    player_id: int
    player_name: str
    final_score: int

    class Config:
        orm_mode = True

# We need to create a TournamentBase without player relationships first
class TournamentBaseSimple(BaseModel):
    id: int
    name: str
    type: str
    creationDate: datetime
    status: bool

    class Config:
        orm_mode = True

# Player schema with tournaments
class PlayerBase(BaseModel):
    id: int
    name: str
    email: str
    creationDate: datetime
    personalScore: int
    tournament: List[TournamentBaseSimple] = []
    disabled: bool = False

    class Config:
        orm_mode = True

## Player Create schema
class PlayerCreate(BaseModel):
    name: str
    email: str
    password: str

## Player Login schema
class playerLoguin(BaseModel):
    email: str
    password: str

# TournamentScores
class TournamentScoreBase(BaseModel):
    id: int
    player_id: int
    tournament_id: int
    score: int

    class Config:
        orm_mode = True

# Matches
class MatchBase(BaseModel):
    id: int
    tournament_id: Optional[int] = None
    player1_id: int
    player2_id: Optional[int] = None
    win: Optional[int] = None
    status: bool = False
    draw: bool = False
    phase: int = 1  # Add this line

    class Config:
        orm_mode = True

# Full Tournament schema with all relationships
class TournamentBase(BaseModel):
    id: int
    name: str
    type: str
    creationDate: datetime
    status: bool
    players: List[PlayerBase] = []
    scores: List[TournamentScoreBase] = []
    matches: List[MatchBase] = []
    final_standings: List[StandingBase] = []  # Add this field

    class Config:
        orm_mode = True

# deck schemems
class DecksBase(BaseModel):
    id : int
    player_id : int
    deckName : str
    format : str
    deckDescription :str
    creationDate : datetime
    deckList : str

    class Config:
        orm_mode = True

class DecksCreate(BaseModel):
    player_id : int
    deckName : str
    format : str
    deckDescription :str
    deckList : str

# Configuración de la base de datos
class tabPlayers(BaseModel):
    name:str
    #createDate:str|None = datetime.now().strftime("%Y-%m-%d")
    #personalScore:int|None = 0

class tabTournament(BaseModel):
    name:str
    #createDate:str|None = datetime.now().strftime("%Y-%m-%d")
    type:str