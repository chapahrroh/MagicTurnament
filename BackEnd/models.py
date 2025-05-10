from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship, sessionmaker, DeclarativeBase
from sqlalchemy import create_engine
import os

# Add these constants at the top of the file after imports
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = f"sqlite:///{os.path.join(BASE_DIR, 'DB', 'database.sqlite')}"

class Base(DeclarativeBase):
    pass

# association tables
tournamentsPlayers = Table('tournamentsPlayers', Base.metadata,
    Column('tournament_id', Integer, ForeignKey('tournament.id')),
    Column('player_id', Integer, ForeignKey('players.id'))
)

class Players(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key=True, autoincrement=True, index=True) # Add index for faster lookups
    name = Column(String(100), unique=True)  # Add max length and unique constraint
    email = Column(String(100), unique=True)  # Add max length and unique constraint
    hashed_password = Column(String(100))  # Add max length
    creationDate = Column(DateTime)
    personalScore = Column(Integer, default=0)
    disabled = Column(Boolean, default=False) # to track if the player is disabled

    # Define the relationship with the Tournament model
    tournament = relationship("Tournament",secondary=tournamentsPlayers, back_populates="players")
    tournament_scores = relationship("TournamentScores", back_populates="player")

    def __repr__(self):
        return f"Players(name={self.name}, creationDate={self.creationDate}, personalScore={self.personalScore}, tournament={self.tournament})"


class Tournament(Base):
    __tablename__ = 'tournament'
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(100))  # Add max length
    type = Column(String(50))   # Add max length
    creationDate = Column(DateTime)
    status = Column(Boolean, default=False)
    players = relationship("Players", secondary=tournamentsPlayers, back_populates="tournament")
    scores = relationship("TournamentScores", back_populates="tournament")
    matches = relationship("Matches", back_populates="tournament")
    currentPhase = Column(Integer, default=1)

    def is_active(self):
        return self.status

    def get_player_score(self, player_id):
        for score in self.scores:
            if score.player_id == player_id:
                return score.score
        return 0

    def get_matches_by_phase(self, phase):
        return [match for match in self.matches if match.phase == phase]


class TournamentScores(Base):
    __tablename__ ='tournamentScores'
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    tournament_id= Column(Integer, ForeignKey('tournament.id'), index=True)
    player_id = Column(Integer, ForeignKey('players.id'), index=True)
    tournament = relationship("Tournament", back_populates="scores")
    player = relationship("Players", back_populates="tournament_scores")
    score = Column(Integer, default=0)


class Matches(Base):
    __tablename__ = 'matches'
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    tournament_id = Column(Integer, ForeignKey('tournament.id'), index=True)
    player1_id = Column(Integer, ForeignKey('players.id'), index=True)
    player2_id = Column(Integer, ForeignKey('players.id'), nullable=True, index=True)
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("Players", foreign_keys=[player1_id])
    player2 = relationship("Players", foreign_keys=[player2_id])
    win = Column(Integer, default=-1)
    status = Column(Boolean, default=False)
    draw = Column(Boolean, default=False)
    phase = Column(Integer, default=1)  # Add this line for phase tracking

class Decks(Base):
    __tablename__ = 'decks'
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    player_id = Column(Integer, ForeignKey('players.id'), index=True)
    player = relationship("Players")
    deckName = Column(String(100))  # Add max length
    format = Column(String(50))  # Add max length
    deckDescription = Column(String(255))  # Add max length
    creationDate = Column(DateTime)
    deckList = Column(String)  # Add max length


    def __repr__(self):
        return f"Decks(deckName={self.deckName}, deckDescription={self.deckDescription}, creationDate={self.creationDate})"


# Create engine and session
engine = create_engine(DB_PATH, echo=True)
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

def init_db():
    # Create DB directory if it doesn't exist
    db_dir = os.path.join(BASE_DIR, 'DB')
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    Base.metadata.create_all(engine)

if __name__ == "__main__":
    init_db()